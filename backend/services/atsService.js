const FORBIDDEN_PATTERNS = [
  { pattern: /\\begin\{tabular\}/g, severity: 'critical', message: 'Tables used — most ATS systems cannot parse tabular layouts correctly' },
  { pattern: /\\includegraphics/g, severity: 'critical', message: 'Images detected — ATS systems cannot extract text from images' },
  { pattern: /\\begin\{multicols\}/g, severity: 'high', message: 'Multi-column layout — ATS may read left-to-right across columns, scrambling content' },
  { pattern: /[^\x00-\x7F]/g, severity: 'medium', message: 'Non-ASCII characters — may cause encoding issues in older ATS parsers' },
  { pattern: /\\rule/g, severity: 'low', message: 'Horizontal rules — unnecessary decorative elements may confuse parsers' },
  { pattern: /\\vspace\{\s*-\d/gi, severity: 'low', message: 'Negative vspace — overly tight spacing may cause text overlap in some renderers' },
];

const STANDARD_SECTION_HEADERS = [
  { name: 'Experience', aliases: ['work experience', 'employment', 'work history', 'professional experience', 'career history'] },
  { name: 'Education', aliases: ['academic background', 'academic history', 'schooling'] },
  { name: 'Skills', aliases: ['technical skills', 'core competencies', 'qualifications', 'expertise'] },
  { name: 'Projects', aliases: ['personal projects', 'open source', 'key projects'] },
  { name: 'Summary', aliases: ['objective', 'professional summary', 'career objective', 'profile', 'about me'] },
  { name: 'Certifications', aliases: ['certificates', 'licenses', 'accreditations'] },
];

// Number of standard sections at which a resume earns full section marks.
const SECTIONS_FOR_FULL_MARKS = 4;

// Percentage of the resume that can be matched keywords before it reads as
// stuffing rather than relevance.
const STUFFING_THRESHOLD = 15;

function stripLatex(text) {
  if (!text) return '';
  return text
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, '$1')
    .replace(/\\textbf\{([^}]*)\}/g, '$1')
    .replace(/\\textit\{([^}]*)\}/g, '$1')
    .replace(/\\emph\{([^}]*)\}/g, '$1')
    .replace(/\\scshape/g, '')
    .replace(/\\vspace\{[^}]*\}/g, '')
    .replace(/\\hspace\{[^}]*\}/g, ' ')
    .replace(/\\hfill/g, ' ')
    .replace(/\\noindent/g, '')
    .replace(/\\begin\{[^}]*\}/g, '')
    .replace(/\\end\{[^}]*\}/g, '')
    .replace(/\\item/g, '')
    .replace(/\\titleformat[^}]*(\{[^}]*\})?/g, '')
    .replace(/\\setlist[^}]*(\{[^}]*\})?/g, '')
    .replace(/\\usepackage[^}]*(\{[^}]*\})?/g, '')
    .replace(/\\documentclass[^}]*(\{[^}]*\})?/g, '')
    .replace(/\\pagestyle[^}]*/g, '')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}$%&_^~#|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function checkParseability(latexText) {
  const plainText = stripLatex(latexText);

  const contentRatio = latexText && latexText.length > 0
    ? parseFloat((plainText.length / latexText.length).toFixed(2))
    : 0;

  const contactPatterns = [
    { name: 'Email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
    { name: 'Phone', pattern: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/ },
    { name: 'LinkedIn', pattern: /linkedin\.com\/in\//i },
    { name: 'GitHub', pattern: /github\.com\//i },
  ];

  const foundContact = contactPatterns
    .filter(c => c.pattern.test(plainText))
    .map(c => c.name);

  const sectionsPresent = STANDARD_SECTION_HEADERS.map(h => {
    const found = new RegExp(`\\\\section\\{([^}]*${h.name}[^}]*)\\}`, 'i').test(latexText);
    if (found) return h.name;
    for (const alias of h.aliases) {
      if (new RegExp(`\\\\section\\{([^}]*${alias}[^}]*)\\}`, 'i').test(latexText)) return h.name;
    }
    return null;
  }).filter(Boolean);

  return {
    plainTextLength: plainText.length,
    contentRatio,
    contactFound: foundContact,
    sectionsFound: sectionsPresent,
    contactCompleteness: foundContact.length >= 2 ? 100 : foundContact.length >= 1 ? 50 : 0,
    // Clamped: 6 possible headers over a divisor of 4 previously yielded 150%.
    sectionCompleteness: Math.min(100, Math.round((sectionsPresent.length / SECTIONS_FOR_FULL_MARKS) * 100)),
    score:
      (contentRatio > 0.4 ? 30 : contentRatio > 0.2 ? 15 : 0) +
      (sectionsPresent.length >= 3 ? 30 : sectionsPresent.length >= 2 ? 20 : 10) +
      (foundContact.length >= 2 ? 40 : foundContact.length >= 1 ? 20 : 0)
  };
}

function checkFormatCompliance(latexText) {
  const violations = [];
  for (const fp of FORBIDDEN_PATTERNS) {
    const matches = latexText.match(fp.pattern);
    if (matches) {
      violations.push({
        type: fp.severity,
        message: fp.message,
        count: matches.length,
      });
    }
  }

  const criticalCount = violations.filter(v => v.type === 'critical').length;
  const highCount = violations.filter(v => v.type === 'high').length;
  const mediumCount = violations.filter(v => v.type === 'medium').length;
  const lowCount = violations.filter(v => v.type === 'low').length;

  const score = Math.max(0, 100 - (criticalCount * 30) - (highCount * 15) - (mediumCount * 8) - (lowCount * 3));

  return {
    violations,
    score: Math.min(score, 100)
  };
}

function analyzeKeywords(latexText, jobDescription) {
  if (!jobDescription || jobDescription.length < 20) {
    // `score: null` means "not applicable", and analyzeATS re-normalises the
    // remaining weights around it.
    //
    // This used to return 100. Since keyword relevance carries 40% of the
    // overall score, omitting a job description handed the user a free 40
    // points — so pasting the real job description, the thing we want them to
    // do, made their score go *down*.
    return {
      topKeywords: [],
      keywordMatches: [],
      matchRatio: 0,
      matchCount: 0,
      totalKeywords: 0,
      keywordDensity: 0,
      score: null,
      applicable: false,
    };
  }

  const plainText = stripLatex(latexText).toLowerCase();

  const jdWords = jobDescription.toLowerCase().match(/\b[a-zA-Z]{2,}\b/g) || [];
  const jdFreq = {};
  jdWords.forEach(w => { jdFreq[w] = (jdFreq[w] || 0) + 1; });
  const jdUniqueWords = [...new Set(jdWords)];

  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'this',
    'that', 'these', 'those', 'we', 'you', 'they', 'our', 'your', 'their',
    'its', 'his', 'her', 'all', 'each', 'every', 'some', 'any', 'no',
    'not', 'very', 'just', 'about', 'above', 'after', 'again', 'also',
    'being', 'more', 'most', 'much', 'only', 'other', 'own', 'same',
    'into', 'over', 'such', 'than', 'then', 'there', 'through',
  ]);

  const jdKeywords = jdUniqueWords
    .filter(w => w.length > 2 && !stopWords.has(w))
    .sort((a, b) => (jdFreq[b] || 0) - (jdFreq[a] || 0))
    .slice(0, 30);

  const resumeWords = plainText.match(/\b[a-zA-Z]{2,}\b/g) || [];
  const resumeWordSet = new Set(resumeWords);

  const keywordMatches = jdKeywords.map(kw => ({
    keyword: kw,
    found: resumeWordSet.has(kw),
    frequency: (jdFreq[kw] || 0),
  }));

  const matchCount = keywordMatches.filter(m => m.found).length;
  const matchRatio = matchCount / Math.max(keywordMatches.length, 1);

  // Density = how much of the resume is matched keywords.
  //
  // This previously summed each keyword's frequency *in the job description*
  // and divided by the resume's length — two different corpora, so the figure
  // meant nothing. Worse, it rose with match quality, so a well-targeted resume
  // crossed the "keyword stuffing" threshold and was penalised: matching
  // resumes scored *below* irrelevant ones.
  const resumeFreq = {};
  resumeWords.forEach((w) => { resumeFreq[w] = (resumeFreq[w] || 0) + 1; });

  const totalResumeWords = resumeWords.length;
  const matchedOccurrences = keywordMatches
    .filter(m => m.found)
    .reduce((sum, m) => sum + (resumeFreq[m.keyword] || 0), 0);

  const keywordDensity = totalResumeWords > 0
    ? parseFloat(((matchedOccurrences / totalResumeWords) * 100).toFixed(2))
    : 0;

  // Coverage of the job description's vocabulary is the signal. Density is only
  // a guard against genuine stuffing, applied as a bounded penalty so the score
  // stays monotonic in match quality.
  const stuffingPenalty = keywordDensity > STUFFING_THRESHOLD
    ? Math.min(30, Math.round((keywordDensity - STUFFING_THRESHOLD) * 3))
    : 0;
  const finalScore = Math.max(0, Math.round(matchRatio * 100) - stuffingPenalty);

  return {
    topKeywords: jdKeywords.slice(0, 10),
    keywordMatches,
    matchRatio: parseFloat(matchRatio.toFixed(2)),
    matchCount,
    totalKeywords: keywordMatches.length,
    keywordDensity,
    score: finalScore,
    applicable: true,
  };
}

/**
 * Layout problems found in the *uploaded PDF*, as opposed to the LaTeX source.
 *
 * The regex checks in this file can only inspect LaTeX, so a two-column resume
 * uploaded as a PDF — precisely the layout ATS parsers scramble — was invisible
 * to the scorer. pdf-service supplies these; without it the list is empty and
 * behaviour is unchanged.
 */
function sourceLayoutIssues(resumeData) {
  const layout = resumeData.sourceLayout;
  if (!layout || !Array.isArray(layout.warnings)) return { critical: [], warnings: [] };

  const critical = [];
  const warnings = [];

  for (const message of layout.warnings) {
    // Multi-column and scanned documents break extraction outright; page count
    // is advice.
    if (/multi-column|scanned/i.test(message)) critical.push(message);
    else warnings.push(message);
  }

  return { critical, warnings };
}

exports.analyzeATS = async (resumeLatex, resumeData = {}, jobDescription = '') => {
  const latexText = resumeLatex || resumeData.rawLatexCode || '';

  if (!latexText || latexText.length < 50) {
    return {
      overallScore: 0,
      error: 'No valid LaTeX resume found to analyze',
      parseability: { score: 0, issues: ['No LaTeX content'] },
      formatCompliance: { score: 0, violations: [] },
      keywordAnalysis: { score: 0 },
      checks: [],
      warnings: ['No resume content to analyze'],
      criticalIssues: ['Upload or generate a resume first']
    };
  }

  const parseability = checkParseability(latexText);
  const formatCompliance = checkFormatCompliance(latexText);
  const keywordAnalysis = analyzeKeywords(latexText, jobDescription);

  // Re-normalise so a missing job description neither inflates nor deflates the
  // result — the remaining dimensions simply carry proportionally more weight.
  const WEIGHTS = { parseability: 0.35, format: 0.25, keyword: 0.40 };
  const keywordsApplicable = keywordAnalysis.score !== null;

  const weightedSum =
    parseability.score * WEIGHTS.parseability +
    formatCompliance.score * WEIGHTS.format +
    (keywordsApplicable ? keywordAnalysis.score * WEIGHTS.keyword : 0);

  const totalWeight = WEIGHTS.parseability + WEIGHTS.format + (keywordsApplicable ? WEIGHTS.keyword : 0);

  const overallScore = Math.round(weightedSum / totalWeight);

  const checks = [
    // Math.round, because contentRatio is a float: 0.29 * 100 rendered as
    // "28.999999999999996%" in the UI.
    { category: 'parseability', passed: parseability.score >= 70, detail: `ATS text extraction ratio: ${Math.round(parseability.contentRatio * 100)}%` },
    { category: 'parseability', passed: parseability.sectionsFound.length >= 3, detail: `Standard sections found: ${parseability.sectionsFound.join(', ') || 'none'}` },
    { category: 'parseability', passed: parseability.contactFound.length >= 2, detail: `Contact info found: ${parseability.contactFound.join(', ') || 'incomplete'}` },
    { category: 'format', passed: formatCompliance.violations.filter(v => v.type === 'critical').length === 0, detail: `Format violations: ${formatCompliance.violations.length}` },
    { category: 'format', passed: formatCompliance.score >= 70, detail: `Format compliance score: ${formatCompliance.score}/100` },
    // Keyword checks only make sense against a job description.
    ...(keywordsApplicable ? [
      { category: 'keywords', passed: keywordAnalysis.matchRatio >= 0.5, detail: `Keyword match rate: ${Math.round(keywordAnalysis.matchRatio * 100)}%` },
      { category: 'keywords', passed: keywordAnalysis.score >= 60, detail: `Keyword score: ${keywordAnalysis.score}/100` },
    ] : []),
  ];

  const layoutIssues = sourceLayoutIssues(resumeData);

  const warnings = [
    ...formatCompliance.violations
      .filter(v => v.type === 'medium' || v.type === 'low')
      .map(v => v.message),
    ...layoutIssues.warnings,
  ];

  const criticalIssues = [
    ...layoutIssues.critical,
    ...formatCompliance.violations.filter(v => v.type === 'critical').map(v => v.message),
    ...(parseability.score < 50 ? ['Low ATS parseability — text extraction may fail'] : []),
    ...(keywordsApplicable && keywordAnalysis.score < 40 ? ['Poor keyword alignment with job description'] : []),
  ];

  return {
    overallScore,
    parseability: {
      score: parseability.score,
      contentRatio: parseability.contentRatio,
      sectionsFound: parseability.sectionsFound,
      contactFound: parseability.contactFound,
      plainTextLength: parseability.plainTextLength,
    },
    formatCompliance: {
      score: formatCompliance.score,
      violations: formatCompliance.violations,
    },
    keywordAnalysis: {
      score: keywordAnalysis.score,
      topKeywords: keywordAnalysis.topKeywords,
      matchRatio: keywordAnalysis.matchRatio,
      matchCount: keywordAnalysis.matchCount,
      totalKeywords: keywordAnalysis.totalKeywords,
      keywordDensity: keywordAnalysis.keywordDensity,
    },
    checks,
    warnings,
    criticalIssues,
  };
};
