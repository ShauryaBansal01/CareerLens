const { GoogleGenAI } = require('@google/genai');
const BaseProvider = require('./BaseProvider');
const { safeParseJSON } = require('../../../utils/safeParseJSON');
const { estimateCostUSD } = require('../pricing');

const MODEL_TIER = {
  fast: 'gemini-2.5-flash',
  pro: 'gemini-2.5-pro',
};

const DEFAULT_MODEL = process.env.GEMINI_MODEL || MODEL_TIER.fast;

class GeminiProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    this.defaultModel = DEFAULT_MODEL;
  }

  async initialize() {
    return true;
  }

  /**
   * The SDK reports usage in `usageMetadata`. This was previously hardcoded to
   * zero, so the default provider — the one most calls actually go through —
   * recorded no token usage at all.
   */
  _usage(response, model) {
    const meta = response?.usageMetadata || {};
    const promptTokens = meta.promptTokenCount || 0;
    const completionTokens = meta.candidatesTokenCount || 0;
    return {
      model,
      promptTokens,
      completionTokens,
      totalTokens: meta.totalTokenCount || promptTokens + completionTokens,
      estimatedCostUSD: estimateCostUSD(model, promptTokens, completionTokens),
    };
  }

  /**
   * The SDK throws its own error shape; copy the HTTP status onto `.status` so
   * BaseProvider's retry logic can classify it.
   */
  _rethrow(error, label) {
    const status = error?.status || error?.code || error?.response?.status;
    if (status && !error.status) error.status = status;
    console.error(`[GeminiProvider] ${label} Error:`, error?.message || error);
    throw error;
  }

  async generateText(prompt, options = {}) {
    const model = options.model || this.defaultModel;
    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: options.temperature ?? 0.7,
          ...(options.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
        },
      });

      return {
        text: response.text ?? '',
        usage: this._usage(response, model),
      };
    } catch (error) {
      this._rethrow(error, 'generateText');
    }
  }

  async generateJSON(prompt, options = {}) {
    const model = options.model || this.defaultModel;
    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: options.temperature ?? 0.7,
          ...(options.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
        },
      });

      return {
        data: safeParseJSON(response.text),
        usage: this._usage(response, model),
      };
    } catch (error) {
      this._rethrow(error, 'generateJSON');
    }
  }

  async checkHealth() {
    await this.generateText('Hi', { maxOutputTokens: 1 });
    return true;
  }
}

module.exports = GeminiProvider;
