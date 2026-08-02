const atsService = require('../services/atsService');

const CLEAN_RESUME = [
  '\\documentclass{article}',
  '\\section{Summary}',
  'Backend engineer. ada@example.com | +1 555 123 4567',
  'linkedin.com/in/ada github.com/ada',
  '\\section{Experience}',
  '\\item Built kubernetes tooling and docker pipelines with terraform.',
  '\\section{Education}',
  '\\section{Skills}',
  'kubernetes docker terraform observability postgresql',
  '\\section{Projects}',
].join('\n');

const JOB_DESCRIPTION =
  'We need an engineer strong in kubernetes and docker. ' +
  'Experience with terraform and observability is required. ' +
  'You will work on postgresql and distributed systems.';

describe('atsService.analyzeATS', () => {
  it('rejects content too short to analyse', async () => {
    const result = await atsService.analyzeATS('');
    expect(result.overallScore).toBe(0);
    expect(result.criticalIssues.length).toBeGreaterThan(0);
  });

  describe('missing job description', () => {
    it('does not award free points for omitting one', async () => {
      // Previously the keyword dimension returned 100 when no JD was given,
      // and it carries 40% of the overall score.
      const withoutJd = await atsService.analyzeATS(CLEAN_RESUME, {}, '');
      expect(withoutJd.keywordAnalysis.score).toBeNull();
      expect(withoutJd.overallScore).toBeLessThanOrEqual(100);
    });

    it('derives the score only from the applicable dimensions', async () => {
      // No free 40 points: the overall must be exactly the re-normalised blend
      // of parseability and format compliance.
      const r = await atsService.analyzeATS(CLEAN_RESUME, {}, '');
      const expected = Math.round(
        (r.parseability.score * 0.35 + r.formatCompliance.score * 0.25) / 0.60
      );
      expect(r.overallScore).toBe(expected);
    });

    it('omits keyword checks entirely when not applicable', async () => {
      const result = await atsService.analyzeATS(CLEAN_RESUME, {}, '');
      expect(result.checks.some((c) => c.category === 'keywords')).toBe(false);
    });

    it('includes keyword checks when a job description is present', async () => {
      const result = await atsService.analyzeATS(CLEAN_RESUME, {}, JOB_DESCRIPTION);
      expect(result.checks.some((c) => c.category === 'keywords')).toBe(true);
    });
  });

  describe('score bounds', () => {
    it('keeps the overall score within 0-100 with and without a job description', async () => {
      for (const jd of ['', JOB_DESCRIPTION]) {
        const result = await atsService.analyzeATS(CLEAN_RESUME, {}, jd);
        expect(result.overallScore).toBeGreaterThanOrEqual(0);
        expect(result.overallScore).toBeLessThanOrEqual(100);
      }
    });

    it('keeps parseability within 0-100', async () => {
      const result = await atsService.analyzeATS(CLEAN_RESUME, {}, JOB_DESCRIPTION);
      expect(result.parseability.score).toBeGreaterThanOrEqual(0);
      expect(result.parseability.score).toBeLessThanOrEqual(100);
    });
  });

  describe('formatted output', () => {
    it('renders the extraction ratio as a whole number', async () => {
      // 0.29 * 100 used to print as "28.999999999999996%".
      const result = await atsService.analyzeATS(CLEAN_RESUME, {}, JOB_DESCRIPTION);
      const detail = result.checks.find((c) => c.detail.includes('extraction ratio')).detail;
      const value = detail.match(/([\d.]+)%/)[1];
      expect(value).not.toContain('.');
    });
  });

  describe('format compliance', () => {
    it('flags tables as critical', async () => {
      const withTable = `${CLEAN_RESUME}\n\\begin{tabular}{ll}a & b\\end{tabular}`;
      const result = await atsService.analyzeATS(withTable, {}, JOB_DESCRIPTION);
      expect(result.criticalIssues.join(' ')).toMatch(/table/i);
    });

    it('flags images as critical', async () => {
      const withImage = `${CLEAN_RESUME}\n\\includegraphics{photo.png}`;
      const result = await atsService.analyzeATS(withImage, {}, JOB_DESCRIPTION);
      expect(result.criticalIssues.join(' ')).toMatch(/image/i);
    });

    it('scores a clean resume above one riddled with violations', async () => {
      const messy = `${CLEAN_RESUME}\n\\begin{tabular}{ll}a\\end{tabular}\\includegraphics{p.png}\\begin{multicols}{2}`;
      const clean = await atsService.analyzeATS(CLEAN_RESUME, {}, JOB_DESCRIPTION);
      const dirty = await atsService.analyzeATS(messy, {}, JOB_DESCRIPTION);
      expect(clean.overallScore).toBeGreaterThan(dirty.overallScore);
    });
  });

  describe('keyword analysis', () => {
    it('scores a matching resume above a non-matching one', async () => {
      const irrelevant = CLEAN_RESUME
        .replace(/kubernetes|docker|terraform|observability|postgresql/g, 'gardening');
      const matching = await atsService.analyzeATS(CLEAN_RESUME, {}, JOB_DESCRIPTION);
      const notMatching = await atsService.analyzeATS(irrelevant, {}, JOB_DESCRIPTION);
      expect(matching.keywordAnalysis.score).toBeGreaterThan(notMatching.keywordAnalysis.score);
    });

    it('detects contact details', async () => {
      const result = await atsService.analyzeATS(CLEAN_RESUME, {}, JOB_DESCRIPTION);
      expect(result.parseability.contactFound).toEqual(expect.arrayContaining(['Email']));
    });
  });
});
