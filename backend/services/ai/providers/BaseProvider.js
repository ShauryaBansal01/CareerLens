const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// A single upstream call must not hang forever — without this an unresponsive
// provider holds the Express connection open indefinitely.
const DEFAULT_REQUEST_TIMEOUT_MS = parseInt(process.env.AI_REQUEST_TIMEOUT_MS, 10) || 60_000;

// Total wall-clock ceiling for one logical operation, retries included. The old
// backoff (5s→15s→30s→60s) could block a request for ~110s with no bound.
const DEFAULT_RETRY_BUDGET_MS = parseInt(process.env.AI_RETRY_BUDGET_MS, 10) || 45_000;

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504, 529]);

class BaseProvider {
  constructor(apiKey) {
    if (this.constructor === BaseProvider) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.apiKey = apiKey;
    this.userId = null;
    // Fallback feature label. Prefer passing `feature` per call via options —
    // one provider instance can serve concurrent calls, so mutating this field
    // between them misattributes usage to whichever value landed last.
    this.feature = null;
    this.requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS;
  }

  async initialize() {
    throw new Error("Method 'initialize()' must be implemented.");
  }

  async generateText(_prompt, _options = {}) {
    throw new Error("Method 'generateText()' must be implemented.");
  }

  async generateJSON(_prompt, _options = {}) {
    throw new Error("Method 'generateJSON()' must be implemented.");
  }

  async checkHealth() {
    throw new Error("Method 'checkHealth()' must be implemented.");
  }

  /**
   * fetch() with a hard timeout. Aborts the socket rather than leaving the
   * caller's HTTP request hanging on an unresponsive provider.
   */
  async _fetchWithTimeout(url, init = {}, timeoutMs = this.requestTimeoutMs) {
    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        const timeoutErr = new Error(
          `${this.constructor.name}: request timed out after ${timeoutMs}ms`
        );
        timeoutErr.status = 504;
        throw timeoutErr;
      }
      // Network-level failure (DNS, connection reset) — treat as retryable.
      err.status = err.status || 503;
      throw err;
    }
  }

  /**
   * Build an error from a non-2xx response that includes the provider's own
   * error body. Returning only statusText discards the actual reason.
   */
  async _errorFromResponse(response, label) {
    let detail = '';
    try {
      const body = await response.text();
      if (body) detail = ` — ${body.slice(0, 500)}`;
    } catch {
      // body unreadable; status alone will have to do
    }
    const err = new Error(
      `${label} API error: ${response.status} ${response.statusText}${detail}`
    );
    err.status = response.status;
    return err;
  }

  async generateTextWithRetry(prompt, options = {}, maxRetries = 4) {
    return this._withRetry(() => this.generateText(prompt, options), maxRetries, options);
  }

  async generateJSONWithRetry(prompt, options = {}, maxRetries = 4) {
    return this._withRetry(() => this.generateJSON(prompt, options), maxRetries, options);
  }

  async _withRetry(fn, maxRetries = 4, options = {}) {
    const startedAt = Date.now();
    const budgetMs = options.retryBudgetMs || DEFAULT_RETRY_BUDGET_MS;
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await fn();
        this._trackUsage(result.usage, options.feature).catch(() => {});
        return result;
      } catch (error) {
        lastError = error;

        const isRetryable = RETRYABLE_STATUSES.has(error.status);
        const isLastAttempt = attempt >= maxRetries - 1;
        if (!isRetryable || isLastAttempt) throw error;

        // Exponential backoff with jitter, so concurrent callers don't retry
        // in lockstep. A provider-supplied "retry in Ns" hint wins.
        let delayMs = Math.min(1000 * 2 ** attempt, 8000);
        delayMs += Math.floor(Math.random() * 500);

        const match = String(error.message || error).match(/retry in ([\d.]+)s/i);
        if (match && match[1]) {
          delayMs = Math.ceil(parseFloat(match[1]) * 1000) + 500;
        }

        const elapsed = Date.now() - startedAt;
        if (elapsed + delayMs > budgetMs) {
          console.warn(
            `[AI Retry] ${error.status}. Retry budget (${budgetMs}ms) exhausted after ${elapsed}ms — giving up.`
          );
          throw error;
        }

        console.warn(
          `[AI Retry] ${error.status}. Retrying in ${delayMs}ms... ` +
          `(attempt ${attempt + 1}/${maxRetries})`
        );
        await sleep(delayMs);
      }
    }

    throw lastError;
  }

  async _trackUsage(usage, feature) {
    if (!this.userId || !usage) return;
    try {
      const AIUsage = require('../../../models/AIUsage');
      await AIUsage.create({
        user: this.userId,
        provider: this.constructor.name.replace('Provider', '').toLowerCase(),
        model: usage.model,
        feature: feature || this.feature || 'unknown',
        promptTokens: usage.promptTokens || 0,
        completionTokens: usage.completionTokens || 0,
        totalTokens: usage.totalTokens || 0,
        // null means "no price on file for this model" — distinct from a
        // genuine zero, which the old hardcoded 0 could not express.
        estimatedCostUSD: usage.estimatedCostUSD ?? null,
      });
    } catch (err) {
      console.error('[AIUsage] Failed to track usage:', err.message);
    }
  }
}

module.exports = BaseProvider;
