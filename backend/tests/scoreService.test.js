const scoreService = require('../services/scoreService');

// A LaTeX resume that should score at or near the ceiling: every standard
// section, plenty of distinct action verbs, several quantified outcomes.
const STRONG_RESUME = [
  '\\section{Summary}',
  '\\section{Experience}',
  '\\item Architected a billing service and increased throughput by 40%.',
  '\\item Reduced infrastructure spend by $120k while scaling to 3x peak load.',
  '\\item Migrated 50000 users with zero downtime.',
  '\\item Led and mentored four engineers; automated the release pipeline.',
  '\\item Optimized query latency and spearheaded the observability rollout.',
  '\\section{Education}',
  '\\section{Skills}',
  '\\section{Projects}',
].join('\n');

describe('scoreService.scoreResume', () => {
  describe('dimension scales', () => {
    it('reports every dimension on a real 0-100 scale', async () => {
      const result = await scoreService.scoreResume(STRONG_RESUME);
      for (const [name, dim] of Object.entries(result.dimensions)) {
        expect(dim.max).toBe(100);
        expect(dim.score).toBeGreaterThanOrEqual(0);
        expect(dim.score).toBeLessThanOrEqual(100);
        // Guards the old bug: contentQuality was computed against a maximum of
        // 30 while advertising max: 100.
        expect(`${name}:${dim.score}`).toBe(`${name}:${Math.round(dim.score)}`);
      }
    });

    it('lets a strong resume reach a high total (previously capped at 79)', async () => {
      const result = await scoreService.scoreResume(STRONG_RESUME);
      expect(result.totalScore).toBeGreaterThan(79);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });

    it('gives a strong resume full marks on content quality', async () => {
      const result = await scoreService.scoreResume(STRONG_RESUME);
      // The old formula made this unreachable above 30, so the UI bar was
      // always red regardless of resume quality.
      expect(result.dimensions.contentQuality.score).toBe(100);
    });

    it('scores an empty resume at zero without throwing', async () => {
      const result = await scoreService.scoreResume('');
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.dimensions.contentQuality.score).toBe(0);
      expect(result.dimensions.impact.score).toBe(0);
    });
  });

  describe('action verbs', () => {
    it('counts a repeated verb once', async () => {
      const result = await scoreService.scoreResume('Implemented and implemented and implemented.');
      expect(result.details.actionVerbs.count).toBe(1);
    });

    it('never returns a duplicate verb (the list had eight repeats)', async () => {
      const result = await scoreService.scoreResume(STRONG_RESUME);
      const found = result.details.actionVerbs.found;
      expect(new Set(found).size).toBe(found.length);
    });

    it('matches whole words only', async () => {
      const result = await scoreService.scoreResume('Ledger reledger unledgered.');
      expect(result.details.actionVerbs.found).not.toContain('led');
    });
  });

  describe('quantified metrics', () => {
    it('counts an overlapping match once', async () => {
      // "$100k" previously matched the currency, the k-suffix and the bare
      // digit patterns, scoring one metric three times.
      const result = await scoreService.scoreResume('Saved $100k.');
      expect(result.details.quantifiedMetrics.count).toBe(1);
    });

    it('does not treat years, postcodes or phone numbers as achievements', async () => {
      const result = await scoreService.scoreResume(
        'Worked 2019 2020 2021 2022 at 12345 Main Street, call 5551234567.'
      );
      expect(result.details.quantifiedMetrics.count).toBe(0);
    });

    it('counts genuine metrics', async () => {
      const result = await scoreService.scoreResume('Grew revenue 40% and served 50000 users at 3x scale.');
      expect(result.details.quantifiedMetrics.count).toBeGreaterThanOrEqual(3);
    });
  });

  describe('resumeData handling', () => {
    it('scores string values but not field names', async () => {
      // JSON.stringify used to fold key names and punctuation into the scored
      // text, so a field literally called "created" scored an action verb.
      const withVerbKeys = await scoreService.scoreResume('', {
        created: 'a', developed: 'b', launched: 'c', optimized: 'd', delivered: 'e',
      });
      expect(withVerbKeys.details.actionVerbs.count).toBe(0);
    });

    it('does still score nested string content', async () => {
      const result = await scoreService.scoreResume('', {
        experience: ['Engineered a payment system', 'Optimized latency'],
      });
      expect(result.details.actionVerbs.count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('section detection', () => {
    it('detects LaTeX sections', async () => {
      const result = await scoreService.scoreResume('\\section{Experience}\\section{Skills}');
      expect(result.details.sections.present).toEqual(expect.arrayContaining(['experience', 'skills']));
    });

    it('detects plain-text section headings', async () => {
      // Previously only \section{} matched, so any resume scored from rawText
      // reported zero sections.
      const plain = 'EXPERIENCE\nDid things\n\nEDUCATION\nA degree\n\nSKILLS\nSome skills';
      const result = await scoreService.scoreResume(plain);
      expect(result.details.sections.present).toEqual(
        expect.arrayContaining(['experience', 'education', 'skills'])
      );
    });

    it('never scores sections above 100', async () => {
      const all = ['experience', 'education', 'skills', 'projects', 'summary', 'objective', 'certifications']
        .map((h) => `\\section{${h}}`).join('');
      const result = await scoreService.scoreResume(all);
      expect(result.details.sections.score).toBeLessThanOrEqual(100);
    });
  });

  describe('dimension independence', () => {
    it('separates verb-driven and metric-driven dimensions', async () => {
      // Both dimensions used to derive from verbs + metrics combined, so they
      // moved in lockstep and jointly drove 40% of the total.
      const verbsOnly = await scoreService.scoreResume(
        'Architected, engineered, optimized, spearheaded and migrated the platform.'
      );
      expect(verbsOnly.dimensions.contentQuality.score).toBe(100);
      expect(verbsOnly.dimensions.impact.score).toBe(0);

      const metricsOnly = await scoreService.scoreResume('40% and $120k and 3x.');
      expect(metricsOnly.dimensions.impact.score).toBe(100);
      expect(metricsOnly.dimensions.contentQuality.score).toBe(0);
    });
  });

  describe('keyword relevance', () => {
    it('stays neutral when no job description is supplied', async () => {
      const result = await scoreService.scoreResume(STRONG_RESUME, {}, '');
      expect(result.dimensions.keywordRelevance.score).toBe(50);
    });

    it('rewards overlap with the job description', async () => {
      const jd = 'kubernetes kubernetes docker docker terraform terraform observability observability';
      const matching = await scoreService.scoreResume('kubernetes docker terraform observability', {}, jd);
      const notMatching = await scoreService.scoreResume('cooking gardening painting', {}, jd);
      expect(matching.dimensions.keywordRelevance.score)
        .toBeGreaterThan(notMatching.dimensions.keywordRelevance.score);
    });
  });
});

describe('scoreService.scoreWithAI', () => {
  const fakeProvider = (payload) => ({ generateJSON: jest.fn().mockResolvedValue({ data: payload }) });

  it('blends AI scores with the deterministic baseline', async () => {
    const provider = fakeProvider({
      aiScores: { contentQuality: 80, atsParsability: 80, keywordRelevance: 80, formatConsistency: 80, impact: 80 },
      aiTotalScore: 80,
      aiSummary: 'Solid.',
      aiSuggestions: ['Tighten the summary'],
    });
    const result = await scoreService.scoreWithAI(provider, STRONG_RESUME);
    expect(provider.generateJSON).toHaveBeenCalled();
    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.aiSummary).toBe('Solid.');
    expect(result.suggestions).toContain('Tighten the summary');
  });

  it('falls back to the deterministic score when the AI fails', async () => {
    const provider = { generateJSON: jest.fn().mockRejectedValue(new Error('provider down')) };
    const result = await scoreService.scoreWithAI(provider, STRONG_RESUME);
    const baseline = await scoreService.scoreResume(STRONG_RESUME);
    expect(result.totalScore).toBe(baseline.totalScore);
  });

  it('keeps every blended dimension within 0-100', async () => {
    const provider = fakeProvider({
      aiScores: { contentQuality: 100, atsParsability: 100, keywordRelevance: 100, formatConsistency: 100, impact: 100 },
      aiTotalScore: 100,
    });
    const result = await scoreService.scoreWithAI(provider, STRONG_RESUME);
    for (const dim of Object.values(result.dimensions)) {
      expect(dim.score).toBeGreaterThanOrEqual(0);
      expect(dim.score).toBeLessThanOrEqual(100);
    }
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });
});
