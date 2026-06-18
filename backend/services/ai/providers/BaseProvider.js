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
}

module.exports = BaseProvider;
