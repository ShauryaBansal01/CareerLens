const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class BaseProvider {
  constructor(apiKey) {
    if (this.constructor === BaseProvider) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.apiKey = apiKey;
  }

  /**
   * Initialize or validate the provider.
   */
  async initialize() {
    throw new Error("Method 'initialize()' must be implemented.");
  }

  /**
   * Generate text from a prompt.
   * @param {string} prompt
   * @param {object} options
   * @returns {Promise<{text: string, usage: object}>}
   */
  async generateText(prompt, options = {}) {
    throw new Error("Method 'generateText()' must be implemented.");
  }

  /**
   * Generate structured JSON from a prompt.
   * @param {string} prompt
   * @param {object} options
   * @returns {Promise<{data: object, usage: object}>}
   */
  async generateJSON(prompt, options = {}) {
    throw new Error("Method 'generateJSON()' must be implemented.");
  }

  /**
   * Abstract method for checking rate limits or custom logic.
   */
  async checkHealth() {
    throw new Error("Method 'checkHealth()' must be implemented.");
  }

  // ── Retry wrappers ─────────────────────────────────────────────────

  /**
   * Calls generateText with automatic retry on 429/503 errors.
   * @param {string} prompt
   * @param {object} [options]
   * @param {number} [maxRetries=4]
   * @returns {Promise<{text: string, usage: object}>}
   */
  async generateTextWithRetry(prompt, options = {}, maxRetries = 4) {
    return this._withRetry(() => this.generateText(prompt, options), maxRetries);
  }

  /**
   * Calls generateJSON with automatic retry on 429/503 errors.
   * @param {string} prompt
   * @param {object} [options]
   * @param {number} [maxRetries=4]
   * @returns {Promise<{data: object, usage: object}>}
   */
  async generateJSONWithRetry(prompt, options = {}, maxRetries = 4) {
    return this._withRetry(() => this.generateJSON(prompt, options), maxRetries);
  }

  /**
   * Generic retry wrapper with exponential backoff.
   * Retries on 429 (rate-limit) and 503 (overloaded) errors.
   */
  async _withRetry(fn, maxRetries = 4) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
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
}

module.exports = BaseProvider;

