/**
 * Compares user skills to required skills intelligently via AI.
 * Returns a rich gap analysis with proficiency levels, categories,
 * evidence, priority, and a weighted readiness score.
 *
 * @param {Object} aiProvider - The injected AI Provider instance
 * @param {Array<String>} userSkills
 * @param {Array<String>} requiredSkills
 * @returns {Object} Gap analysis result
 */
exports.calculateSkillGapAI = async (aiProvider, userSkills, requiredSkills) => {
  const normalizedRequiredSkills = requiredSkills.map(s => s.toLowerCase());

  if (normalizedRequiredSkills.length === 0) {
    return {
      matchedSkills: [],
      missingSkills: [],
      matchPercentage: 0,
      skillsWeightedScore: 0,
      totalRequired: 0,
      categories: { languages: [], frameworks: [], tools: [], concepts: [] },
      overallReadinessVerdict: 'No required skills specified for this role.',
    };
  }

  // ── Proficiency weights used for the weighted score calculation ──────────
  const PROFICIENCY_WEIGHTS = { strong: 1.0, moderate: 0.7, basic: 0.4 };

  let matchedSkills = [];
  let missingSkills = [];
  let categories = { languages: [], frameworks: [], tools: [], concepts: [] };
  let overallReadinessVerdict = '';

  try {
    const prompt = `You are a strict, expert technical recruiter AI performing a skill-gap analysis.

TARGET ROLE REQUIRED SKILLS (exactly these, in lowercase):
${normalizedRequiredSkills.map((s, i) => `${i + 1}. ${s}`).join('\n')}

CANDIDATE'S CLAIMED SKILLS:
${userSkills.map((s, i) => `${i + 1}. ${s}`).join('\n')}

INSTRUCTIONS:
1. For each REQUIRED skill, determine whether the candidate HAS it or is MISSING it.
   - Map aliases intelligently (e.g. "react.js" matches "react", "node" matches "node.js", "pg" matches "postgresql", "mongo" matches "mongodb").
   - Only match if the candidate genuinely possesses the skill or a direct equivalent.
2. For each MATCHED skill, assess the candidate's likely proficiency:
   - "strong" = skill is explicitly listed and likely production-level (core skill, multiple related skills present)
   - "moderate" = skill is listed but supporting evidence is limited
   - "basic" = only a loose alias match or tangentially related skill
   Provide a short "evidence" string explaining why you matched it and at what level.
3. For each MISSING skill, assess its priority for the role:
   - "critical" = the role cannot be performed without it (e.g. primary language/framework)
   - "important" = significantly expected but can be learned on the job
   - "nice-to-have" = beneficial but not a dealbreaker
   Provide a one-sentence "recommendation" for how to learn it.
4. Categorize ALL required skills (both matched and missing) into exactly four categories:
   - "languages" (programming languages)
   - "frameworks" (libraries, frameworks, SDKs)
   - "tools" (platforms, services, CLI tools, databases)
   - "concepts" (methodologies, patterns, practices, soft skills)
   Each skill should appear in exactly one category.
5. Write a 1-2 sentence "overallReadinessVerdict" summarizing the candidate's fit.

Return EXACTLY this JSON (no markdown, no extra keys):
{
  "matchedRequiredSkills": [
    { "skill": "<exact required skill string>", "proficiency": "strong|moderate|basic", "evidence": "..." }
  ],
  "missingRequiredSkills": [
    { "skill": "<exact required skill string>", "priority": "critical|important|nice-to-have", "recommendation": "..." }
  ],
  "categories": {
    "languages": ["skill1", "skill2"],
    "frameworks": ["skill3"],
    "tools": ["skill4"],
    "concepts": ["skill5"]
  },
  "overallReadinessVerdict": "..."
}

CRITICAL: The "skill" values in matchedRequiredSkills and missingRequiredSkills MUST exactly match the strings from the TARGET ROLE REQUIRED SKILLS list above. Do not use the candidate's alias spelling.`;

    const response = await aiProvider.generateJSON(prompt, { temperature: 0.3 });
    const parsed = response.data;

    // ── Normalize matched skills ────────────────────────────────────────────
    if (Array.isArray(parsed.matchedRequiredSkills)) {
      matchedSkills = parsed.matchedRequiredSkills.map(item => ({
        skill: (item.skill || '').toLowerCase(),
        proficiency: ['strong', 'moderate', 'basic'].includes(item.proficiency) ? item.proficiency : 'moderate',
        evidence: item.evidence || '',
      }));
    }

    // ── Normalize missing skills ────────────────────────────────────────────
    if (Array.isArray(parsed.missingRequiredSkills)) {
      missingSkills = parsed.missingRequiredSkills.map(item => ({
        skill: (item.skill || '').toLowerCase(),
        priority: ['critical', 'important', 'nice-to-have'].includes(item.priority) ? item.priority : 'important',
        recommendation: item.recommendation || '',
      }));
    }

    // ── Categories ──────────────────────────────────────────────────────────
    if (parsed.categories && typeof parsed.categories === 'object') {
      categories = {
        languages:  Array.isArray(parsed.categories.languages)  ? parsed.categories.languages.map(s => s.toLowerCase())  : [],
        frameworks: Array.isArray(parsed.categories.frameworks) ? parsed.categories.frameworks.map(s => s.toLowerCase()) : [],
        tools:      Array.isArray(parsed.categories.tools)      ? parsed.categories.tools.map(s => s.toLowerCase())      : [],
        concepts:   Array.isArray(parsed.categories.concepts)   ? parsed.categories.concepts.map(s => s.toLowerCase())   : [],
      };
    }

    overallReadinessVerdict = parsed.overallReadinessVerdict || '';

  } catch (error) {
    console.error('AI Skill Gap Error:', error);

    // ── Fallback: strict string matching with default proficiency ──────────
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
    matchedSkills = normalizedRequiredSkills
      .filter(skill => normalizedUserSkills.includes(skill))
      .map(skill => ({ skill, proficiency: 'moderate', evidence: 'Exact string match (AI fallback)' }));

    missingSkills = normalizedRequiredSkills
      .filter(skill => !normalizedUserSkills.includes(skill))
      .map(skill => ({ skill, priority: 'important', recommendation: 'Consider learning this skill.' }));

    overallReadinessVerdict = 'Analysis performed with basic string matching (AI was unavailable).';
  }

  // ── Weighted score calculation ──────────────────────────────────────────
  const totalRequired = normalizedRequiredSkills.length;

  const weightedMatchSum = matchedSkills.reduce((sum, item) => {
    return sum + (PROFICIENCY_WEIGHTS[item.proficiency] || 0.5);
  }, 0);

  const matchPercentage = totalRequired > 0
    ? Math.round((matchedSkills.length / totalRequired) * 100)
    : 0;

  // Weighted score: accounts for proficiency depth, not just count
  // Max possible = totalRequired * 1.0 (all strong) → maps to 50 points
  const skillsWeightedScore = totalRequired > 0
    ? parseFloat(((weightedMatchSum / totalRequired) * 50).toFixed(2))
    : 0;

  return {
    matchedSkills,
    missingSkills,
    matchPercentage,
    skillsWeightedScore,
    totalRequired,
    categories,
    overallReadinessVerdict,
  };
};
