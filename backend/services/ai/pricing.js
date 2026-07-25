/**
 * Per-model token pricing, in USD per 1,000,000 tokens.
 *
 * Previously every provider hardcoded `estimatedCostUSD: 0`, which made the
 * entire AIUsage cost table meaningless. Costs are now derived from this map.
 *
 * ── Maintenance ───────────────────────────────────────────────────────────
 * Anthropic prices verified 2026-07-27 against the Anthropic pricing docs.
 * OpenAI and Gemini prices are NOT filled in — populate them from each
 * provider's pricing page, or set the env overrides below. An unpriced model
 * records `estimatedCostUSD: null` (explicitly "unknown"), never a fake 0.
 *
 * Env override format (JSON), useful when prices change between deploys:
 *   AI_PRICING_OVERRIDES={"gpt-4o-mini":{"input":0.15,"output":0.6}}
 */

const PRICING = {
  // ── Anthropic ─────────────────────────────────────────────────────────
  'claude-opus-5':     { input: 5.00,  output: 25.00 },
  'claude-opus-4-8':   { input: 5.00,  output: 25.00 },
  'claude-opus-4-7':   { input: 5.00,  output: 25.00 },
  'claude-sonnet-5':   { input: 3.00,  output: 15.00 },
  'claude-sonnet-4-6': { input: 3.00,  output: 15.00 },
  'claude-haiku-4-5':  { input: 1.00,  output: 5.00 },
  'claude-fable-5':    { input: 10.00, output: 50.00 },

  // ── OpenAI ────────────────────────────────────────────────────────────
  // TODO: populate from https://openai.com/api/pricing/ or AI_PRICING_OVERRIDES.
  // Left absent deliberately rather than guessed.

  // ── Google Gemini ─────────────────────────────────────────────────────
  // TODO: populate from https://ai.google.dev/pricing or AI_PRICING_OVERRIDES.
};

let overrides = null;
function getOverrides() {
  if (overrides) return overrides;
  overrides = {};
  if (process.env.AI_PRICING_OVERRIDES) {
    try {
      overrides = JSON.parse(process.env.AI_PRICING_OVERRIDES);
    } catch (err) {
      console.error('[pricing] AI_PRICING_OVERRIDES is not valid JSON — ignoring:', err.message);
    }
  }
  return overrides;
}

/**
 * @returns {number|null} cost in USD, or null when the model has no known price
 */
function estimateCostUSD(model, promptTokens = 0, completionTokens = 0) {
  if (!model) return null;
  const rate = getOverrides()[model] || PRICING[model];
  if (!rate) return null;

  const cost =
    (promptTokens / 1_000_000) * rate.input +
    (completionTokens / 1_000_000) * rate.output;

  // Round to sub-cent precision; these are fractions of a cent per call.
  return Math.round(cost * 1e6) / 1e6;
}

module.exports = { estimateCostUSD, PRICING };
