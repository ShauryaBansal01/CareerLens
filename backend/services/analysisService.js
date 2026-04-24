const { GoogleGenAI } = require('@google/genai');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callGemini = async (params, maxRetries = 4) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await ai.models.generateContent({ ...params, model: 'gemini-2.5-flash' });
    } catch (err) {
      if ((err.status === 503 || err.status === 429) && i < maxRetries - 1) {
        let delay = [5000, 15000, 30000][i] || 30000;
        const m = String(err).match(/retry in ([\d\.]+)s/);
        if (m) delay = Math.ceil(parseFloat(m[1]) * 1000) + 2000;
        console.warn(`[Analysis] Gemini ${err.status}, retrying in ${Math.round(delay/1000)}s...`);
        await sleep(delay);
      } else throw err;
    }
  }
};

/**
 * Compares user skills to required skills intelligently via AI.
 * @param {Array<String>} userSkills 
 * @param {Array<String>} requiredSkills 
 * @returns {Object} Gap analysis result
 */
exports.calculateSkillGapAI = async (userSkills, requiredSkills) => {
  const normalizedRequiredSkills = requiredSkills.map(s => s.toLowerCase());
  
  if (normalizedRequiredSkills.length === 0) {
    return { matchedSkills: [], missingSkills: [], matchPercentage: 0, skillsWeightedScore: 0, totalRequired: 0 };
  }

  let matchedSkills = [];
  let missingSkills = [...normalizedRequiredSkills];

  try {
    const prompt = `You are a strict technical recruiter AI. 
    The Target Role REQUIRES exactly these core skills: ${normalizedRequiredSkills.join(', ')}.
    The Candidate HAS exactly these skills: ${userSkills.join(', ')}.
    Analyze the candidate's skills against the required skills. Map aliases intelligently (e.g. "react.js" meets the requirement for "react", "node" meets "node.js").
    Return EXACTLY a JSON object containing the required skills split into two arrays:
    {
      "matchedRequiredSkills": [...],
      "missingRequiredSkills": [...]
    }
    NOTE: The items in the arrays MUST EXACTLY MATCH the strings from the Target Role REQUIRED list. Do not use the candidate's alias spelling. Do not include markdown.`;

    const response = await callGemini({
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text);
    // Ensure all strings match the original required casing/format
    // The prompt enforces this, but let's be safe:
    matchedSkills = parsed.matchedRequiredSkills ? parsed.matchedRequiredSkills.map(s => s.toLowerCase()) : [];
    missingSkills = parsed.missingRequiredSkills ? parsed.missingRequiredSkills.map(s => s.toLowerCase()) : [];
  } catch (error) {
    console.error('Gemini Skill Gap Error:', error);
    // fallback to strict string matching
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
    matchedSkills = normalizedRequiredSkills.filter(skill => normalizedUserSkills.includes(skill));
    missingSkills = normalizedRequiredSkills.filter(skill => !normalizedUserSkills.includes(skill));
  }

  const totalRequired = normalizedRequiredSkills.length;
  let matchPercentage = totalRequired > 0 ? Math.round((matchedSkills.length / totalRequired) * 100) : 0;
  const skillsWeightedScore = parseFloat(((matchPercentage / 100) * 50).toFixed(2));

  return {
    matchedSkills,
    missingSkills,
    matchPercentage,
    skillsWeightedScore,
    totalRequired
  };
};
