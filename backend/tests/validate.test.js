const { schemas } = require('../middleware/validate');

describe('Validation Schemas', () => {
  describe('login', () => {
    it('accepts valid login', () => {
      const result = schemas.login.safeParse({ email: 'test@example.com', password: 'secret123' });
      expect(result.success).toBe(true);
    });

    it('rejects missing email', () => {
      const result = schemas.login.safeParse({ password: 'secret123' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = schemas.login.safeParse({ email: 'notanemail', password: 'secret123' });
      expect(result.success).toBe(false);
    });

    it('rejects missing password', () => {
      const result = schemas.login.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(false);
    });
  });

  describe('register', () => {
    it('accepts valid registration', () => {
      const result = schemas.register.safeParse({
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects short name', () => {
      const result = schemas.register.safeParse({
        name: 'J',
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = schemas.register.safeParse({
        name: 'John',
        email: 'john@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('coverLetter', () => {
    it('accepts valid input', () => {
      const result = schemas.coverLetter.safeParse({
        jobDescription: 'We are looking for a software engineer with 5+ years of experience...',
      });
      expect(result.success).toBe(true);
    });

    it('accepts with tone', () => {
      const result = schemas.coverLetter.safeParse({
        jobDescription: 'We are looking for a software engineer...',
        tone: 'Confident',
      });
      expect(result.success).toBe(true);
    });

    it('rejects short job description', () => {
      const result = schemas.coverLetter.safeParse({ jobDescription: 'Too short' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid tone', () => {
      const result = schemas.coverLetter.safeParse({
        jobDescription: 'We are looking for a software engineer...',
        tone: 'InvalidTone',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('rewriteSection', () => {
    it('accepts valid input', () => {
      const result = schemas.rewriteSection.safeParse({
        sectionType: 'experience',
        sectionContent: 'Worked on various projects involving software development...',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing sectionType', () => {
      const result = schemas.rewriteSection.safeParse({ sectionContent: 'Some content here...' });
      expect(result.success).toBe(false);
    });

    it('rejects short sectionContent', () => {
      const result = schemas.rewriteSection.safeParse({ sectionType: 'experience', sectionContent: 'Short' });
      expect(result.success).toBe(false);
    });
  });

  describe('optimizeResumeFromFeedback', () => {
    it('accepts valid feedback with critical', () => {
      const result = schemas.optimizeResumeFromFeedback.safeParse({
        feedback: { critical: [{ issue: 'Missing keywords' }], suggested: [] },
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty feedback', () => {
      const result = schemas.optimizeResumeFromFeedback.safeParse({ feedback: {} });
      expect(result.success).toBe(false);
    });
  });

  describe('profileUpdate', () => {
    it('accepts partial profile update', () => {
      const result = schemas.profileUpdate.safeParse({
        basics: { name: 'John' },
      });
      expect(result.success).toBe(true);
    });

    it('accepts full profile', () => {
      const result = schemas.profileUpdate.safeParse({
        basics: { name: 'John', email: 'john@example.com' },
        skills: ['JavaScript', 'React'],
        experience: [{ company: 'Acme', role: 'Developer', duration: '2020-2023' }],
      });
      expect(result.success).toBe(true);
    });
  });
});
