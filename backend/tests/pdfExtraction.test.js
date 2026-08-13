const atsService = require('../services/atsService');

const RESUME = [
  '\\section{Summary}',
  'ada@example.com | +1 555 123 4567 | github.com/ada',
  '\\section{Experience}',
  '\\item Engineered REST APIs in Node.js and Express.',
  '\\section{Education}',
  '\\section{Skills}',
].join('\n');

describe('uploaded-PDF layout warnings', () => {
  it('reports nothing extra when no layout data is available', async () => {
    // The pdf-parse fallback path: no glyph geometry, so no layout claims.
    const result = await atsService.analyzeATS(RESUME, { rawText: 'x' }, '');
    expect(result.criticalIssues.some((i) => /multi-column/i.test(i))).toBe(false);
  });

  it('raises a critical issue for a multi-column upload', async () => {
    // This is the gap the Java service closes: the LaTeX source is clean, so
    // the regex checks in atsService see nothing wrong, but the PDF the user
    // actually uploaded was two-column.
    const result = await atsService.analyzeATS(RESUME, {
      rawText: 'x',
      sourceLayout: {
        columnCount: 2,
        warnings: ['Multi-column layout detected — many ATS parsers read straight across columns.'],
      },
    }, '');
    expect(result.criticalIssues.some((i) => /multi-column/i.test(i))).toBe(true);
  });

  it('treats a scanned document as critical', async () => {
    const result = await atsService.analyzeATS(RESUME, {
      rawText: 'x',
      sourceLayout: { warnings: ['Very little selectable text found — this may be a scanned document.'] },
    }, '');
    expect(result.criticalIssues.some((i) => /scanned/i.test(i))).toBe(true);
  });

  it('treats page count as advice rather than a blocker', async () => {
    const result = await atsService.analyzeATS(RESUME, {
      rawText: 'x',
      sourceLayout: { pageCount: 4, warnings: ['Resume is 4 pages — most reviewers expect 2 or fewer.'] },
    }, '');
    expect(result.warnings.some((w) => /pages/i.test(w))).toBe(true);
    expect(result.criticalIssues.some((i) => /pages/i.test(i))).toBe(false);
  });

  it('ignores malformed layout data', async () => {
    for (const bad of [null, undefined, {}, { warnings: 'not-an-array' }]) {
      const result = await atsService.analyzeATS(RESUME, { rawText: 'x', sourceLayout: bad }, '');
      expect(Array.isArray(result.criticalIssues)).toBe(true);
    }
  });
});
