const BaseProvider = require('./BaseProvider');

const OPENAI_API_BASE = 'https://api.openai.com/v1';

class OpenAIProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.defaultModel = 'gpt-4o-mini';
  }

  async initialize() {
    return true;
  }

  async _request(body) {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      err.status = response.status;
      throw err;
    }

    return response.json();
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
      text: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        estimatedCostUSD: 0,
      },
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

    const parsedData = JSON.parse(data.choices[0].message.content);

    return {
      data: parsedData,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        estimatedCostUSD: 0,
      },
    };
  }

  async checkHealth() {
    const data = await this._request({
      model: this.defaultModel,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 1,
    });
    return !!data;
  }
}

module.exports = OpenAIProvider;
