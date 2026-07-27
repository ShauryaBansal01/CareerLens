/**
 * Safely parse JSON from LLM responses. Handles:
 * - Markdown code fences the model may wrap around JSON
 * - Leading/trailing prose around the JSON body
 * - Unescaped control characters in string values
 * - Trailing commas before closing brackets
 *
 * Shared by the AI providers and the controllers — every place that turns a
 * model response into an object must go through here, because a bare
 * JSON.parse() throws on the fenced output models routinely produce.
 */
const safeParseJSON = (text) => {
  if (!text) throw new Error('Empty response from AI');

  // Strip markdown code fences
  const cleaned = String(text)
    .replace(/^\s*```(?:json)?\s*[\r\n]+/i, '')
    .replace(/[\r\n]+\s*```\s*$/i, '')
    .trim();

  // First attempt: direct parse
  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    // Second attempt: fix common LLM JSON issues
    try {
      const repaired = cleaned
        // Remove trailing commas before } or ]
        .replace(/,\s*([}\]])/g, '$1')
        // Escape unescaped newlines/tabs inside string values
        .replace(/(["'])(?:(?!\1)[\s\S])*?\1/g, (match) => {
          return match
            .replace(/(?<!\\)\n/g, '\\n')
            .replace(/(?<!\\)\r/g, '\\r')
            .replace(/(?<!\\)\t/g, '\\t');
        });

      return JSON.parse(repaired);
    } catch {
      // Third attempt: the model wrapped JSON in prose — extract the outermost
      // object or array and try that.
      const start = cleaned.search(/[{[]/);
      const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
      if (start !== -1 && end > start) {
        try {
          return JSON.parse(cleaned.slice(start, end + 1));
        } catch {
          // fall through to the shared failure path
        }
      }

      console.error('safeParseJSON: all parse attempts failed.');
      console.error('Original error:', firstError.message);
      console.error('First 500 chars of response:', String(text).substring(0, 500));
      throw firstError;
    }
  }
};

module.exports = { safeParseJSON };
