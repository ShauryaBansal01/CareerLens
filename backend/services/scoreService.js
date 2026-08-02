// De-duplicated at module load. The literal below was hand-maintained and had
// eight repeats ('accelerated', 'implemented', 'mentored', 'instituted',
// 'pioneered', 'reduced', 'reengineered', 'revitalized'). Because matching used
// `filter` over this array, one occurrence of a repeated verb scored twice and
// was listed twice back to the user.
const ACTION_VERBS = [...new Set([
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
])];

// Tokenize once and intersect, rather than running ~140 regexes over the whole
// document. Same result, one pass, and a Set can't double-count.
function countActionVerbs(text) {
  if (!text) return { count: 0, verbs: [] };
  const words = new Set(text.toLowerCase().match(/\b[a-z]+\b/g) || []);
  const found = ACTION_VERBS.filter((v) => words.has(v));
  return { count: found.length, verbs: found };
}

// Ordered most-specific first: a span already claimed by an earlier pattern is
// not counted again, so "$100k" is one metric rather than three.
//
// The previous implementation summed six overlapping patterns, one of which was
// a bare /\d{2,}/ — that matched every year, postcode and phone fragment on the
// page, so a resume full of dates scored as though it were full of achievements.
const METRIC_PATTERNS = [
  /\d+(?:\.\d+)?\s?%/g,
  /[$€£]\s?\d+(?:[.,]\d+)*\s?[kKmMbB]?\b/g,
  /\b\d+(?:\.\d+)?\s?x\b/gi,
  /\b\d+(?:[.,]\d{3})*\+?\s*(?:users|customers|clients|requests|queries|transactions|records|documents|files|nodes|pods|containers|services|APIs|endpoints|pages|components|tests|downloads|installs|hours|weeks|months)\b/gi,
  /\b\d+(?:\.\d+)?[kKmMbB]\b/g,
];

function countQuantifiedMetrics(text) {
  if (!text) return 0;

  const claimed = [];
  let total = 0;

  for (const pattern of METRIC_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      // Skip anything overlapping a span an earlier pattern already claimed.
      if (claimed.some(([s, e]) => start < e && end > s)) continue;
      claimed.push([start, end]);
      total += 1;
    }
  }

  return total;
}

// Collect only the string *values* from the parsed resume. Previously this was
// JSON.stringify(resumeData), which fed field names, braces, quotes and every
// numeric value into the verb and metric counters — scoring the data structure
// rather than the resume.
function collectText(value, depth = 0) {
  if (depth > 5 || value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return '';
  if (Array.isArray(value)) return value.map((v) => collectText(v, depth + 1)).join(' ');
  if (typeof value === 'object') return Object.values(value).map((v) => collectText(v, depth + 1)).join(' ');
  return '';
}

// Counts at which a resume earns full marks on each signal.
const TARGET_ACTION_VERBS = 5;
const TARGET_METRICS = 3;

const EXPECTED_HEADERS = ['experience', 'education', 'skills', 'projects', 'summary', 'objective', 'certifications'];

// A well-formed resume carries roughly this many standard sections; finding
// more shouldn't push the score past full marks.
const HEADERS_FOR_FULL_MARKS = 5;

function checkSectionHeaders(text) {
  const lower = (text || '').toLowerCase();

  const found = EXPECTED_HEADERS.filter((h) => {
    // LaTeX resumes: \section{Experience} / \section*{Work Experience}
    if (new RegExp(`\\\\section\\*?\\{[^}]*${h}[^}]*\\}`, 'i').test(lower)) return true;
    // Plain-text resumes: a line that is just the header. This path was missing
    // entirely, so any resume scored from rawText reported zero sections.
    return new RegExp(`^\\s*${h}\\b[^\\n]{0,20}$`, 'im').test(lower);
  });

  return {
    present: found,
    missing: EXPECTED_HEADERS.filter((h) => !found.includes(h)),
    // Clamped: dividing 7 possible headers by 5 previously allowed 140%.
    score: Math.min(100, Math.round((found.length / HEADERS_FOR_FULL_MARKS) * 100)),
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
  const fullText = `${text} ${collectText(resumeData)}`;

  const actionVerbs = countActionVerbs(fullText);
  const quantifiedMetrics = countQuantifiedMetrics(fullText);

  // Normalised 0-1 signals. Kept separate because they feed two different
  // dimensions below.
  const verbRatio = Math.min(actionVerbs.count / TARGET_ACTION_VERBS, 1);
  const metricRatio = Math.min(quantifiedMetrics / TARGET_METRICS, 1);

  const sectionCheck = checkSectionHeaders(text);
  const bulletCheck = checkBulletConsistency(text);
  const formattingWarnings = checkForbiddenPatterns(text);
  const parseability = calculateLatexParseability(text);

  // Every dimension is on a real 0-100 scale.
  //
  // `contentQuality` used to be `(verbScore + metricScore) / 50 * 30`, which
  // capped at 30 while being reported as `max: 100` — so a flawless resume
  // showed 30/100 and rendered permanently red in the UI, and the weighted
  // total could never exceed 79.
  //
  // It also shared both inputs with `impact`, so verbs and metrics silently
  // drove 40% of the total through two supposedly independent bars. They are
  // now split: language strength vs. quantified outcomes.
  const contentQuality = Math.round(verbRatio * 100);
  const impactScore = Math.round(metricRatio * 100);
  const atsParsability = parseability.score;
  const formatConsistency = Math.max(0, Math.min(100, sectionCheck.score + (bulletCheck.consistent ? 20 : 0) - (formattingWarnings.length * 10)));

  let keywordRelevance = 50;
  if (jobDescription && jobDescription.length > 20) {
    const jdWords = jobDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    // A Set, not an array — `resumeWords.includes` inside a filter made this
    // O(topWords × resumeLength) on every scoring call.
    const resumeWords = new Set(fullText.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
    const jdUnique = [...new Set(jdWords)];
    const jdFreq = {};
    jdWords.forEach(w => { jdFreq[w] = (jdFreq[w] || 0) + 1; });
    const topJdWords = jdUnique.sort((a, b) => (jdFreq[b] || 0) - (jdFreq[a] || 0)).slice(0, 50);
    const matches = topJdWords.filter(w => resumeWords.has(w));
    keywordRelevance = Math.round((matches.length / Math.max(topJdWords.length, 1)) * 100);
  }

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
      ...(actionVerbs.count < TARGET_ACTION_VERBS ? [`Add more action verbs — aim for at least ${TARGET_ACTION_VERBS} across your resume`] : []),
      ...(quantifiedMetrics < TARGET_METRICS ? ['Include quantifiable metrics — percentages, dollar amounts, or scale numbers'] : []),
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
