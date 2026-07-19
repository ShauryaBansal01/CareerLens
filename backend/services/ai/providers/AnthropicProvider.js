const BaseProvider = require('./BaseProvider');

const ANTHROPIC_API_BASE = 'https://api.anthropic.com/v1';

class AnthropicProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.defaultModel = 'claude-sonnet-4-20250514';
  }

  async initialize() {
    return true;
  }

  async _request(body) {
    const response = await fetch(`${ANTHROPIC_API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      err.status = response.status;
      throw err;
    }

    return response.json();
  }

  async generateText(prompt, options = {}) {
    const model = options.model || this.defaultModel;
    const data = await this._request({
      model,
      max_tokens: options.maxOutputTokens || 4096,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.7,
    });

    const text = data.content.map((c) => c.text).join('');

    return {
      text,
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        estimatedCostUSD: 0,
      },
    };
  }

  async generateJSON(prompt, options = {}) {
    const model = options.model || this.defaultModel;
    const data = await this._request({
      model,
      max_tokens: options.maxOutputTokens || 4096,
      messages: [{ role: 'user', content: prompt + '\n\nReturn ONLY valid JSON.' }],
      temperature: options.temperature ?? 0.7,
    });

    const text = data.content.map((c) => c.text).join('');
    const parsedData = JSON.parse(text);

    return {
      data: parsedData,
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        estimatedCostUSD: 0,
      },
    };
  }

  async checkHealth() {
    const data = await this._request({
      model: this.defaultModel,
      max_tokens: 1,
      messages: [{ role: 'user', content: 'Hello' }],
    });
    return !!data;
  }
}

module.exports = AnthropicProvider;
