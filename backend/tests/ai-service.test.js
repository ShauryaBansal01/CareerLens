const AIServiceFactory = require('../services/ai/AIServiceFactory');
const GeminiProvider = require('../services/ai/providers/GeminiProvider');
const OpenAIProvider = require('../services/ai/providers/OpenAIProvider');
const AnthropicProvider = require('../services/ai/providers/AnthropicProvider');

describe('AIServiceFactory', () => {
  describe('getProvider', () => {
    it('returns GeminiProvider for gemini', () => {
      const provider = AIServiceFactory.getProvider('gemini', 'test-key');
      expect(provider).toBeInstanceOf(GeminiProvider);
    });

    it('returns OpenAIProvider for openai', () => {
      const provider = AIServiceFactory.getProvider('openai', 'test-key');
      expect(provider).toBeInstanceOf(OpenAIProvider);
    });

    it('returns AnthropicProvider for anthropic', () => {
      const provider = AIServiceFactory.getProvider('anthropic', 'test-key');
      expect(provider).toBeInstanceOf(AnthropicProvider);
    });

    it('throws for unknown provider', () => {
      expect(() => AIServiceFactory.getProvider('unknown', 'test-key')).toThrow('Unknown AI Provider');
    });

    it('passes apiKey to provider', () => {
      const provider = AIServiceFactory.getProvider('openai', 'sk-test-123');
      expect(provider.apiKey).toBe('sk-test-123');
    });

    it('all three providers extend BaseProvider', () => {
      const BaseProvider = require('../services/ai/providers/BaseProvider');
      const gemini = AIServiceFactory.getProvider('gemini', 'k1');
      const openai = AIServiceFactory.getProvider('openai', 'k2');
      const anthropic = AIServiceFactory.getProvider('anthropic', 'k3');
      expect(gemini).toBeInstanceOf(BaseProvider);
      expect(openai).toBeInstanceOf(BaseProvider);
      expect(anthropic).toBeInstanceOf(BaseProvider);
    });
  });

  describe('getSystemDefaultProvider', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('returns GeminiProvider when GEMINI_API_KEY is set', () => {
      process.env.GEMINI_API_KEY = 'test-key';
      const provider = AIServiceFactory.getSystemDefaultProvider();
      expect(provider).toBeInstanceOf(GeminiProvider);
    });

    it('throws when no AI key is configured', () => {
      delete process.env.GEMINI_API_KEY;
      expect(() => AIServiceFactory.getSystemDefaultProvider()).toThrow(
        'No system default AI provider configured.'
      );
    });
  });
});
