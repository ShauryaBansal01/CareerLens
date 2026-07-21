const { GoogleGenerativeAI } = require('@google/generative-ai');

function stripCodeFences(text) {
  return text.replace(/^```(latex)?\n?/im, '').replace(/\n?```$/im, '').trim();
}

function sanitizeLatexCode(code) {
  const colorNames = ['black','white','red','green','blue','cyan','magenta','yellow','gray','grey','darkgray','darkgrey','lightgray','lightgrey','brown','lime','olive','orange','pink','purple','teal','violet'];
  const upperPattern = new RegExp(`\\b(${colorNames.map(c => c.toUpperCase()).join('|')})\\b`, 'g');
  const lowerMap = Object.fromEntries(colorNames.map(c => [c.toUpperCase(), c]));
  return code.replace(upperPattern, m => lowerMap[m]);
}

async function callGeminiWithRetry(apiKey, requestPayload, options = {}) {
  const { model: modelName = 'gemini-2.5-flash', maxRetries = 3 } = options;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(requestPayload.contents);
      const response = result.response;
      const text = response.text();
      return { text };
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

module.exports = { callGeminiWithRetry, stripCodeFences, sanitizeLatexCode };
