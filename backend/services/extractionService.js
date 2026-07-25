const { callGeminiWithRetry } = require('../utils/retryWithBackoff');

const ACHIEVEMENT_EXTRACTION_EXAMPLES = `
EXAMPLE OUTPUT (for reference):
{
  "achievements": [
    {
      "originalText": "Worked on backend APIs",
      "enhancedText": "Designed and implemented 12 RESTful APIs handling 50K+ daily requests, reducing average response time by 35%",
      "metrics": ["50K+", "35%", "12"],
      "isQuantified": true
    },
    {
      "originalText": "Helped improve website performance",
      "enhancedText": "Optimized Core Web Vitals achieving 95+ Lighthouse scores across LCP, FID, and CLS metrics",
      "metrics": ["95+"],
      "isQuantified": true
    },
    {
      "originalText": "Worked with React components",
      "enhancedText": "Architected a reusable component library of 40+ React components adopted by 3 engineering teams",
      "metrics": ["40+", "3"],
      "isQuantified": true
    }
  ]
}
`;

exports.extractAchievements = async (apiKey, experienceEntries) => {
  try {
    const entriesJson = JSON.stringify(experienceEntries, null, 2);

    const prompt = `You are an expert Resume Achievement Extractor. Your job is to analyze work experience descriptions and extract or intelligently infer quantifiable achievements.

For each experience entry, transform vague descriptions into specific, measurable bullet points. Follow these rules:

1. If metrics are explicitly present (percentages, dollar amounts, time saved, users impacted), PRESERVE and emphasize them.
2. If metrics are missing but the role has typical measurable impact, infer REASONABLE metrics based on standard industry benchmarks for that role.
3. NEVER fabricate technologies, team sizes, or revenue figures without some basis in the text.
4. Each bullet must have at least one metric (%, $, numbers, time, scale).
5. Lead every bullet with a strong action verb (Engineered, Optimized, Architected, Spearheaded, Accelerated, etc.)

${ACHIEVEMENT_EXTRACTION_EXAMPLES}

INPUT EXPERIENCE:
${entriesJson}

Return EXACTLY this valid JSON (no markdown):
{
  "achievements": [
    {
      "originalText": "Original description text",
      "enhancedText": "Enhanced achievement with metrics",
      "metrics": ["metric1", "metric2"],
      "isQuantified": true
    }
  ],
  "summary": "One sentence summary of achievement extraction results"
}`;

    const response = await callGeminiWithRetry(apiKey, {
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Achievement extraction error:', error);
    return { achievements: [], summary: 'Achievement extraction failed' };
  }
};

exports.extractJdKeywords = async (apiKey, jobDescription) => {
  try {
    const prompt = `Extract the top 15-20 most important keywords, skills, technologies, and qualifications from this job description.

Focus on:
- Hard skills and technologies
- Required qualifications and certifications
- Domain-specific terminology
- Soft skills mentioned repeatedly

Return EXACTLY this JSON (no markdown):
{
  "keywords": ["keyword1", "keyword2"],
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "roleLevel": "Senior/Mid/Entry",
  "keyResponsibilities": ["responsibility1"]
}

JOB DESCRIPTION:
${jobDescription.substring(0, 5000)}`;

    const response = await callGeminiWithRetry(apiKey, {
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('JD keyword extraction error:', error);
    return { keywords: [], requiredSkills: [], preferredSkills: [], roleLevel: '', keyResponsibilities: [] };
  }
};
