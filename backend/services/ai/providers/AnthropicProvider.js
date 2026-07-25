const BaseProvider = require('./BaseProvider');
const { safeParseJSON } = require('../../../utils/safeParseJSON');
const { estimateCostUSD } = require('../pricing');

const ANTHROPIC_API_BASE = 'https://api.anthropic.com/v1';
const ANTHROPIC_VERSION = '2023-06-01';

// claude-sonnet-4-20250514 retired on 2026-06-15 and now 404s.
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';

// Thinking is ON by default on Claude Opus 5, and max_tokens caps thinking +
// response text together — this ceiling has to leave room for both or answers
// truncate mid-sentence.
const DEFAULT_MAX_TOKENS = 8192;

class AnthropicProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.defaultModel = DEFAULT_MODEL;
  }

  async initialize() {
    return true;
  }

  async _request(body) {
    const response = await this._fetchWithTimeout(`${ANTHROPIC_API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw await this._errorFromResponse(response, 'Anthropic');
    }

    return response.json();
  }

  /**
   * Claude Opus 5 rejects temperature/top_p/top_k with a 400 — reasoning depth
   * is controlled by `effort` instead. `low` keeps latency and token spend
   * down for the short generation tasks this app makes.
   */
  _buildBody(prompt, options) {
    return {
      model: options.model || this.defaultModel,
      max_tokens: options.maxOutputTokens || DEFAULT_MAX_TOKENS,
      output_config: { effort: options.effort || 'low' },
      messages: [{ role: 'user', content: prompt }],
    };
  }

  _extractText(data) {
    // Only text blocks carry prose. Thinking blocks come back with empty text
    // by default, and mapping every block to `.text` splices in "undefined".
    return (data.content || [])
      .filter((block) => block.type === 'text' && typeof block.text === 'string')
      .map((block) => block.text)
      .join('');
  }

  _usage(data, model) {
    const promptTokens = data.usage?.input_tokens || 0;
    const completionTokens = data.usage?.output_tokens || 0;
    return {
      model,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      estimatedCostUSD: estimateCostUSD(model, promptTokens, completionTokens),
    };
  }

  async generateText(prompt, options = {}) {
    const body = this._buildBody(prompt, options);
    const data = await this._request(body);

    return {
      text: this._extractText(data),
      usage: this._usage(data, body.model),
    };
  }

  async generateJSON(prompt, options = {}) {
    const body = this._buildBody(
      `${prompt}\n\nReturn ONLY valid JSON, with no surrounding prose or markdown fences.`,
      options
    );
    const data = await this._request(body);

    return {
      data: safeParseJSON(this._extractText(data)),
      usage: this._usage(data, body.model),
    };
  }

  async checkHealth() {
    const data = await this._request({
      model: this.defaultModel,
      max_tokens: 1,
      messages: [{ role: 'user', content: 'Hi' }],
    });
    return !!data;
  }
}

module.exports = AnthropicProvider;
