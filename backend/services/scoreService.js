const ACTION_VERBS = [
  'achieved', 'accelerated', 'architected', 'built', 'championed', 'configured',
  'consolidated', 'created', 'debugged', 'decreased', 'delivered', 'deployed',
  'designed', 'developed', 'devised', 'doubled', 'drove', 'eliminated',
  'enabled', 'encouraged', 'engineered', 'established', 'evaluated', 'executed',
  'expanded', 'expedited', 'extracted', 'fabricated', 'facilitated', 'formulated',
  'founded', 'generated', 'grew', 'identified', 'implemented', 'improved',
  'increased', 'initiated', 'instituted', 'integrated', 'introduced', 'invented',
  'launched', 'led', 'maintained', 'managed', 'mentored', 'migrated',
  'minimized', 'modernized', 'negotiated', 'optimized', 'orchestrated', 'overhauled',
  'pioneered', 'prevented', 'produced', 'programmed', 'published', 'rearchitected',
  'rebuild', 'reduced', 'reengineered', 'refactored', 'reorganized', 'resolved',
  'restructured', 'revamped', 'revitalized', 'simplified', 'slashed', 'solved',
  'spearheaded', 'standardized', 'steered', 'streamlined', 'strengthened', 'supercharged',
  'transformed', 'upgraded', 'accelerated', 'automated', 'centralized', 'coded',
  'composed', 'constructed', 'converted', 'customized', 'delegated', 'demonstrated',
  'drafted', 'enhanced', 'fostered', 'guided', 'hired', 'illuminated',
  'implemented', 'influenced', 'innovated', 'inspired', 'instituted', 'instructed',
  'mentored', 'navigated', 'operationalized', 'outperformed', 'pioneered', 'proposed',
  'rebuilt', 'reconciled', 'recovered', 'recruited', 'reduced', 'reengineered',
  'rehabilitated', 'remediated', 'remodeled', 'repaired', 'replaced', 'represented',
  'reproduced', 'restored', 'retooled', 'revised', 'revitalized', 'safeguarded',
  'scaled', 'shaped', 'shipped', 'shortened', 'shrank', 'stabilized',
  'stimulated', 'strategized', 'surpassed', 'sustained', 'systematized', 'tightened',
  'trained', 'tripled', 'unified', 'unlocked', 'utilized', 'validated',
  'weighed', 'widened', 'won', 'wrote'
];

function countActionVerbs(text) {
  if (!text) return { count: 0, verbs: [] };
  const lower = text.toLowerCase();
  const found = ACTION_VERBS.filter(v => {
    const regex = new RegExp(`\\b${v}\\b`, 'i');
    return regex.test(lower);
  });
  return { count: found.length, verbs: found };
}

function countQuantifiedMetrics(text) {
  if (!text) return 0;
  const patterns = [
    /\d+%/g,
    /\$\d+[kkmMbB]?/g,
    /\d+x\b/g,
    /\d+\s*(?:users|customers|clients|requests|queries|transactions|records|documents|files|nodes|pods|containers|services|APIs|endpoints|pages|components|tests)/gi,
    /\d+[kKmM]\b/g,
    /\d{2,}/g,
  ];
  let total = 0;
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) total += matches.length;
  }
  return total;
}

function checkSectionHeaders(text) {
  const expectedHeaders = ['experience', 'education', 'skills', 'projects', 'summary', 'objective', 'certifications'];
  const lower = text.toLowerCase();
  const found = expectedHeaders.filter(h => {
    const regex = new RegExp(`\\\\section\\{([^}]*${h}[^}]*)\\}`, 'i');
    return regex.test(lower);
  });
  return {
    present: found,
    missing: expectedHeaders.filter(h => !found.includes(h)),
    score: Math.round((found.length / Math.min(expectedHeaders.length, 5)) * 100)
  };
}

function checkBulletConsistency(text) {
  const bulletItems = text.match(/\\item\s+[^\n]+/g) || [];
  if (bulletItems.length === 0) return { consistent: true, count: 0, endingVariations: [] };

  const endings = bulletItems.map(b => {
    const trimmed = b.trim();
    const lastChar = trimmed[trimmed.length - 1];
    return lastChar;
  });

  const uniqueEndings = [...new Set(endings)];
  return {
    consistent: uniqueEndings.length <= 2,
    count: bulletItems.length,
    endingVariations: uniqueEndings
  };
}

function checkForbiddenPatterns(text) {
  const warnings = [];
  if (/\\begin\{tabular\}/.test(text)) warnings.push('Tables detected — ATS systems may struggle to parse tabular data');
  if (/\\includegraphics/.test(text)) warnings.push('Images detected — most ATS systems cannot process images');
  if (/\\begin\{multicols\}/.test(text)) warnings.push('Multi-column layout detected — some ATS systems read left-to-right across columns');
  if (/[^\x00-\x7F]/.test(text)) warnings.push('Non-ASCII characters detected — may cause encoding issues in some ATS parsers');
  return warnings;
}

function calculateLatexParseability(text) {
  const textOnly = text
    .replace(/\\(?:section|subsection|textbf|textit|emph|href|noindent|small|large|Huge|footnotesize|scshape|vspace)\{/g, '')
    .replace(/\\(?:begin|end)\{.*?\}/g, '')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}$%&_^~#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const ratio = textOnly.length / Math.max(text.length, 1);
  return {
    extractedLength: textOnly.length,
    originalLength: text.length,
    ratio: parseFloat(ratio.toFixed(2)),
    score: Math.round(Math.min(ratio * 100, 100))
  };
}

exports.scoreResume = async (resumeLatex, resumeData = {}, jobDescription = '') => {
  const text = resumeLatex || resumeData.rawText || '';
  const fullText = text + ' ' + JSON.stringify(resumeData);

  const actionVerbs = countActionVerbs(fullText);
  const quantifiedMetrics = countQuantifiedMetrics(fullText);
  const verbScore = Math.min(Math.round((actionVerbs.count / 5) * 25), 25);
  const metricScore = Math.min(Math.round((quantifiedMetrics / 3) * 25), 25);

  const sectionCheck = checkSectionHeaders(text);
  const bulletCheck = checkBulletConsistency(text);
  const formattingWarnings = checkForbiddenPatterns(text);
  const parseability = calculateLatexParseability(text);

  const contentQuality = Math.round((verbScore + metricScore) / 50 * 30);
  const atsParsability = parseability.score;
  const formatConsistency = Math.min(100, sectionCheck.score + (bulletCheck.consistent ? 20 : 0) - (formattingWarnings.length * 10));

  let keywordRelevance = 50;
  if (jobDescription && jobDescription.length > 20) {
    const jdWords = jobDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const resumeWords = fullText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const jdUnique = [...new Set(jdWords)];
    const jdFreq = {};
    jdWords.forEach(w => { jdFreq[w] = (jdFreq[w] || 0) + 1; });
    const topJdWords = jdUnique.sort((a, b) => (jdFreq[b] || 0) - (jdFreq[a] || 0)).slice(0, 50);
    const matches = topJdWords.filter(w => resumeWords.includes(w));
    keywordRelevance = Math.round((matches.length / Math.max(topJdWords.length, 1)) * 100);
  }

  const impactScore = Math.min(100, Math.round((metricScore + verbScore) * 2));

  const totalScore = Math.round(
    (contentQuality * 0.30) +
    (atsParsability * 0.25) +
    (keywordRelevance * 0.25) +
    (formatConsistency * 0.10) +
    (impactScore * 0.10)
  );

  return {
    totalScore,
    dimensions: {
      contentQuality: { score: contentQuality, max: 100, label: 'Content Quality' },
      atsParsability: { score: atsParsability, max: 100, label: 'ATS Parsability' },
      keywordRelevance: { score: keywordRelevance, max: 100, label: 'Keyword Relevance' },
      formatConsistency: { score: formatConsistency, max: 100, label: 'Format Consistency' },
      impact: { score: impactScore, max: 100, label: 'Impact & Metrics' }
    },
    details: {
      actionVerbs: { count: actionVerbs.count, found: actionVerbs.verbs },
      quantifiedMetrics: { count: quantifiedMetrics },
      sections: sectionCheck,
      bulletConsistency: bulletCheck,
      formattingWarnings,
      parseability
    },
    suggestions: [
      ...(actionVerbs.count < 5 ? ['Add more action verbs — aim for at least 5 across your resume'] : []),
      ...(quantifiedMetrics < 3 ? ['Include quantifiable metrics — percentages, dollar amounts, or scale numbers'] : []),
      ...(sectionCheck.missing.length > 0 ? [`Missing standard sections: ${sectionCheck.missing.join(', ')}`] : []),
      ...formattingWarnings
    ]
  };
};

exports.scoreWithAI = async (aiProvider, resumeLatex, resumeData = {}, jobDescription = '') => {
  const baseScore = await exports.scoreResume(resumeLatex, resumeData, jobDescription);
  const text = resumeLatex || resumeData.rawText || '';

  const prompt = `You are a Senior Technical Recruiter evaluating a resume. Score each dimension 0-100 and provide evidence.

SCORING RUBRIC:
1. Content Quality (30% weight): Are achievements in STAR format? Quantified with metrics? Strong action verbs?
2. ATS Parsability (25% weight): Can a machine parse this clearly? Standard headers? Clean formatting?
3. Keyword Relevance (25% weight): Does it target the given role/JD? Proper terminology?
4. Format Consistency (10% weight): Is formatting consistent? Bullet style uniform?
5. Impact (10% weight): Are results measurable and impressive?

RESUME (LaTeX):
${text.substring(0, 6000)}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription.substring(0, 2000)}\n` : ''}

Return EXACTLY this JSON (no markdown):
{
  "aiScores": {
    "contentQuality": 75,
    "atsParsability": 80,
    "keywordRelevance": 65,
    "formatConsistency": 90,
    "impact": 70
  },
  "aiTotalScore": 76,
  "aiSummary": "One paragraph assessment",
  "aiSuggestions": ["suggestion1", "suggestion2"]
}`;

  try {
    const response = await aiProvider.generateJSON(prompt, { temperature: 0.3 });
    const ai = response.data;

    const blendedScore = Math.round(
      (baseScore.totalScore * 0.4) +
      ((ai.aiTotalScore || baseScore.totalScore) * 0.6)
    );

    return {
      totalScore: blendedScore,
      dimensions: {
        contentQuality: {
          score: Math.round(((baseScore.dimensions.contentQuality.score * 0.3) + ((ai.aiScores?.contentQuality || 50) * 0.7))),
          max: 100,
          label: 'Content Quality'
        },
        atsParsability: {
          score: Math.round(((baseScore.dimensions.atsParsability.score * 0.5) + ((ai.aiScores?.atsParsability || 50) * 0.5))),
          max: 100,
          label: 'ATS Parsability'
        },
        keywordRelevance: {
          score: Math.round(((baseScore.dimensions.keywordRelevance.score * 0.3) + ((ai.aiScores?.keywordRelevance || 50) * 0.7))),
          max: 100,
          label: 'Keyword Relevance'
        },
        formatConsistency: {
          score: Math.round(((baseScore.dimensions.formatConsistency.score * 0.5) + ((ai.aiScores?.formatConsistency || 50) * 0.5))),
          max: 100,
          label: 'Format Consistency'
        },
        impact: {
          score: Math.round(((baseScore.dimensions.impact.score * 0.3) + ((ai.aiScores?.impact || 50) * 0.7))),
          max: 100,
          label: 'Impact & Metrics'
        }
      },
      details: baseScore.details,
      aiSummary: ai.aiSummary || '',
      suggestions: [...new Set([...baseScore.suggestions, ...(ai.aiSuggestions || [])])]
    };
  } catch (error) {
    console.error('AI scoring error, falling back to deterministic:', error.message);
    return baseScore;
  }
};
