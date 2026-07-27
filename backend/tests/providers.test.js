const AIServiceFactory = require('../services/ai/AIServiceFactory');

global.fetch = jest.fn();

function mockFetchOnce(status, body) {
  fetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('AI Providers', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('GeminiProvider', () => {
    it('is instantiated without error', () => {
      const provider = AIServiceFactory.getProvider('gemini', 'test-key');
      expect(provider).toBeDefined();
    });
  });

  describe('OpenAIProvider', () => {
    let provider;

    beforeEach(() => {
      provider = AIServiceFactory.getProvider('openai', 'sk-test-key');
    });

    describe('generateText', () => {
      it('returns text and usage on success', async () => {
        mockFetchOnce(200, {
          choices: [{ message: { content: 'Hello from OpenAI' } }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        });

        const result = await provider.generateText('Hello');
        expect(result.text).toBe('Hello from OpenAI');
        expect(result.usage.totalTokens).toBe(15);
      });

      it('throws on API error', async () => {
        mockFetchOnce(429, { error: { message: 'Rate limited' } });
        await expect(provider.generateText('Hello')).rejects.toThrow();
      });
    });

    describe('generateJSON', () => {
      it('returns parsed JSON on success', async () => {
        mockFetchOnce(200, {
          choices: [{ message: { content: '{"key": "value"}' } }],
          usage: { total_tokens: 10 },
        });

        const result = await provider.generateJSON('Give me JSON');
        expect(result.data).toEqual({ key: 'value' });
      });

      it('throws on invalid JSON response', async () => {
        mockFetchOnce(200, {
          choices: [{ message: { content: 'Not JSON' } }],
          usage: { total_tokens: 5 },
        });
        await expect(provider.generateJSON('Give me JSON')).rejects.toThrow();
      });
    });

    describe('checkHealth', () => {
      it('returns true when API responds', async () => {
        mockFetchOnce(200, {
          choices: [{ message: { content: 'Hi' } }],
          usage: {},
        });
        const healthy = await provider.checkHealth();
        expect(healthy).toBe(true);
      });
    });
  });

  describe('AnthropicProvider', () => {
    let provider;

    beforeEach(() => {
      provider = AIServiceFactory.getProvider('anthropic', 'sk-ant-test-key');
    });

    describe('generateText', () => {
      it('returns text and usage on success', async () => {
        mockFetchOnce(200, {
          content: [{ type: 'text', text: 'Hello from Claude' }],
          usage: { input_tokens: 10, output_tokens: 5 },
        });

        const result = await provider.generateText('Hello');
        expect(result.text).toBe('Hello from Claude');
        expect(result.usage.totalTokens).toBe(15);
      });

      it('throws on API error', async () => {
        mockFetchOnce(500, { error: { message: 'Server error' } });
        await expect(provider.generateText('Hello')).rejects.toThrow();
      });
    });

    describe('generateJSON', () => {
      it('returns parsed JSON', async () => {
        mockFetchOnce(200, {
          content: [{ type: 'text', text: '{"answer": 42}' }],
          usage: { input_tokens: 5, output_tokens: 3 },
        });

        const result = await provider.generateJSON('Give JSON');
        expect(result.data).toEqual({ answer: 42 });
      });
    });

    describe('checkHealth', () => {
      it('returns true when API responds', async () => {
        mockFetchOnce(200, {
          content: [{ type: 'text', text: 'Hi' }],
          usage: {},
        });
        const healthy = await provider.checkHealth();
        expect(healthy).toBe(true);
      });
    });
  });

  describe('Retry mechanism (BaseProvider)', () => {
    let provider;

    beforeEach(() => {
      provider = AIServiceFactory.getProvider('openai', 'sk-test');
    });

    it('retries on 429 and succeeds', async () => {
      mockFetchOnce(429, { error: { message: 'Rate limited' } });
      mockFetchOnce(200, {
        choices: [{ message: { content: 'Success after retry' } }],
        usage: { total_tokens: 5 },
      });

      const result = await provider.generateTextWithRetry('Hello', {}, 2);
      expect(result.text).toBe('Success after retry');
      expect(fetch).toHaveBeenCalledTimes(2);
    }, 15000);

    it('gives up after max retries on persistent 429', async () => {
      mockFetchOnce(429, {});
      mockFetchOnce(429, {});

      await expect(provider.generateTextWithRetry('Hello', {}, 2)).rejects.toThrow();
      expect(fetch).toHaveBeenCalledTimes(2);
    }, 15000);
  });
});
