const GeminiProvider = require('./providers/GeminiProvider');
const OpenAIProvider = require('./providers/OpenAIProvider');

class AIServiceFactory {
  /**
   * Returns an instance of the requested AI Provider.
   * @param {string} providerName - 'gemini', 'openai', or 'anthropic'
   * @param {string} apiKey - The decrypted API key
   * @returns {BaseProvider}
   */
  static getProvider(providerName, apiKey) {
    switch (providerName) {
      case 'gemini':
        return new GeminiProvider(apiKey);
      case 'openai':
        return new OpenAIProvider(apiKey);
      case 'anthropic':
        // return new AnthropicProvider(apiKey);
        throw new Error(`Provider ${providerName} is not yet supported`);
      default:
        throw new Error(`Unknown AI Provider: ${providerName}`);
    }
  }

  /**
   * Helper to get the default system provider using environment variables.
   * Useful when the user doesn't have an active BYOK key.
   */
  static getSystemDefaultProvider() {
    // Fallback logic
    if (process.env.GEMINI_API_KEY) {
      return new GeminiProvider(process.env.GEMINI_API_KEY);
    }
    throw new Error("No system default AI provider configured.");
  }
}

module.exports = AIServiceFactory;
