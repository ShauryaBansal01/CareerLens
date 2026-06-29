const { GoogleGenAI } = require('@google/genai');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calls Gemini with automatic retry on 429 (rate-limit) and 503 (overloaded).
 * Parses "retry in Xs" from the error message when available.
 *
 * @param {string} apiKey - Gemini API key
 * @param {Object} params - Parameters forwarded to `ai.models.generateContent`
 *   (must include `contents`; `model` defaults to gemini-2.5-flash)
 * @param {Object} [options]
 * @param {number} [options.maxRetries=4]
 * @param {string} [options.model='gemini-2.5-flash']
 * @returns {Promise<Object>} The raw Gemini response
 */
async function callGeminiWithRetry(apiKey, params, options = {}) {
  const { maxRetries = 4, model = 'gemini-2.5-flash' } = options;
  const ai = new GoogleGenAI({ apiKey });

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await ai.models.generateContent({ ...params, model });
    } catch (error) {
      const isRetryable = error.status === 503 || error.status === 429;
      const isLastAttempt = attempt >= maxRetries - 1;

      if (isRetryable && !isLastAttempt) {
        // Use server-suggested delay if available, otherwise exponential backoff
        let delayMs = [5000, 15000, 30000, 60000][attempt] || 30000;
        const match = String(error).match(/retry in ([\d.]+)s/);
        if (match && match[1]) {
          delayMs = Math.ceil(parseFloat(match[1]) * 1000) + 2000;
        }

        console.warn(
          `[retryWithBackoff] Gemini ${error.status}. ` +
          `Retrying in ${Math.round(delayMs / 1000)}s... ` +
          `(attempt ${attempt + 1}/${maxRetries})`
        );
        await sleep(delayMs);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Strips markdown code-fence wrappers that LLMs sometimes add despite instructions.
 * Handles ```latex, ```tex, bare ```, with or without \r\n.
 *
 * @param {string} text - Raw LLM output
 * @returns {string} Cleaned text
 */
function stripCodeFences(text) {
  if (!text) return '';
  return text
    .replace(/^\s*```(?:latex|tex)?\s*[\r\n]+/i, '')
    .replace(/[\r\n]+\s*```\s*$/i, '')
    .trim();
}

module.exports = { callGeminiWithRetry, stripCodeFences, sleep };
