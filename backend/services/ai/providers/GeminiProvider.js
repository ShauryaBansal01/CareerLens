const { GoogleGenAI } = require('@google/genai');
const BaseProvider = require('./BaseProvider');

const MODEL_TIER = {
  fast: 'gemini-2.5-flash',
  pro: 'gemini-2.5-pro',
};

class GeminiProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    this.defaultModel = 'gemini-2.5-flash';
  }

  async initialize() {
    return true;
  }

  async generateText(prompt, options = {}) {
    try {
      const model = options.model || this.defaultModel;
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: options.temperature || 0.7,
          ...(options.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
        }
      });

      return {
        text: response.text,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          estimatedCostUSD: 0
        }
      };
    } catch (error) {
      console.error('[GeminiProvider] generateText Error:', error);
      throw error;
    }
  }

  async generateJSON(prompt, options = {}) {
    try {
      const model = options.model || this.defaultModel;
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: options.temperature || 0.7,
          ...(options.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
        }
      });

      const parsedData = JSON.parse(response.text);

      return {
        data: parsedData,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          estimatedCostUSD: 0
        }
      };
    } catch (error) {
      console.error('[GeminiProvider] generateJSON Error:', error);
      throw error;
    }
  }

  async checkHealth() {
    await this.generateText("Hello", { maxOutputTokens: 1 });
    return true;
  }
}

module.exports = GeminiProvider;
