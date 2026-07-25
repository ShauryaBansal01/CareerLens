const BaseProvider = require('./BaseProvider');
const { safeParseJSON } = require('../../../utils/safeParseJSON');
const { estimateCostUSD } = require('../pricing');

const OPENAI_API_BASE = 'https://api.openai.com/v1';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

class OpenAIProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.defaultModel = DEFAULT_MODEL;
  }

  async initialize() {
    return true;
  }

  async _request(body) {
    const response = await this._fetchWithTimeout(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw await this._errorFromResponse(response, 'OpenAI');
    }

    return response.json();
  }

  _usage(data, model) {
    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;
    return {
      model,
      promptTokens,
      completionTokens,
      totalTokens: data.usage?.total_tokens || promptTokens + completionTokens,
      estimatedCostUSD: estimateCostUSD(model, promptTokens, completionTokens),
    };
  }

  async generateText(prompt, options = {}) {
    const model = options.model || this.defaultModel;
    const data = await this._request({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.7,
      ...(options.maxOutputTokens ? { max_tokens: options.maxOutputTokens } : {}),
    });

    return {
      text: data.choices?.[0]?.message?.content ?? '',
      usage: this._usage(data, model),
    };
  }

  async generateJSON(prompt, options = {}) {
    const model = options.model || this.defaultModel;
    const data = await this._request({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.7,
      response_format: { type: 'json_object' },
      ...(options.maxOutputTokens ? { max_tokens: options.maxOutputTokens } : {}),
    });

    return {
      data: safeParseJSON(data.choices?.[0]?.message?.content),
      usage: this._usage(data, model),
    };
  }

  async checkHealth() {
    const data = await this._request({
      model: this.defaultModel,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 1,
    });
    return !!data;
  }
}

module.exports = OpenAIProvider;
