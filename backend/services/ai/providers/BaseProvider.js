const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class BaseProvider {
  constructor(apiKey) {
    if (this.constructor === BaseProvider) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.apiKey = apiKey;
    this.userId = null;
    this.feature = null;
  }

  async initialize() {
    throw new Error("Method 'initialize()' must be implemented.");
  }

  async generateText(prompt, options = {}) {
    throw new Error("Method 'generateText()' must be implemented.");
  }

  async generateJSON(prompt, options = {}) {
    throw new Error("Method 'generateJSON()' must be implemented.");
  }

  async checkHealth() {
    throw new Error("Method 'checkHealth()' must be implemented.");
  }

  async generateTextWithRetry(prompt, options = {}, maxRetries = 4) {
    return this._withRetry(() => this.generateText(prompt, options), maxRetries);
  }

  async generateJSONWithRetry(prompt, options = {}, maxRetries = 4) {
    return this._withRetry(() => this.generateJSON(prompt, options), maxRetries);
  }

  async _withRetry(fn, maxRetries = 4) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await fn();
        this._trackUsage(result.usage).catch(() => {});
        return result;
      } catch (error) {
        const isRetryable = error.status === 503 || error.status === 429;
        const isLastAttempt = attempt >= maxRetries - 1;

        if (isRetryable && !isLastAttempt) {
          let delayMs = [5000, 15000, 30000, 60000][attempt] || 30000;
          const match = String(error).match(/retry in ([\d.]+)s/);
          if (match && match[1]) {
            delayMs = Math.ceil(parseFloat(match[1]) * 1000) + 2000;
          }
          console.warn(
            `[AI Retry] ${error.status}. Retrying in ${Math.round(delayMs / 1000)}s... ` +
            `(attempt ${attempt + 1}/${maxRetries})`
          );
          await sleep(delayMs);
        } else {
          throw error;
        }
      }
    }
  }

  async _trackUsage(usage) {
    if (!this.userId || !usage) return;
    try {
      const AIUsage = require('../../../models/AIUsage');
      await AIUsage.create({
        user: this.userId,
        provider: this.constructor.name.replace('Provider', '').toLowerCase(),
        feature: this.feature || 'unknown',
        promptTokens: usage.promptTokens || 0,
        completionTokens: usage.completionTokens || 0,
        totalTokens: usage.totalTokens || 0,
        estimatedCostUSD: usage.estimatedCostUSD || 0,
      });
    } catch (err) {
      console.error('[AIUsage] Failed to track usage:', err.message);
    }
  }
}

module.exports = BaseProvider;

