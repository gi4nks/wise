import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAIModel, listModels } from '../factory';
import { modelCache } from '../cache';

function jsonResponse(body: unknown) {
  return {
    ok: true,
    statusText: 'OK',
    json: async () => body,
  };
}

describe('custom provider base URLs', () => {
  beforeEach(() => {
    modelCache.invalidateAll();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses a custom Anthropic endpoint for model discovery and model calls', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [{ id: 'claude-custom' }] }) as Response);

    const models = await listModels('anthropic', {
      anthropic: { apiKey: 'test-key', baseUrl: 'https://proxy.example/v1/' },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://proxy.example/v1/models',
      expect.objectContaining({ headers: expect.objectContaining({ 'x-api-key': 'test-key' }) }),
    );
    expect(models.map(({ id }) => id)).toEqual(['claude-custom']);

    const model = createAIModel('anthropic', 'claude-custom', {
      anthropic: { apiKey: 'test-key', baseUrl: 'https://proxy.example/v1' },
    });
    expect((model as unknown as { config: { baseURL: string } }).config.baseURL)
      .toBe('https://proxy.example/v1');
  });

  it('uses a custom Gemini endpoint for model discovery and model calls', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({
      models: [{ name: 'models/gemini-custom', supportedGenerationMethods: ['generateContent'] }],
    }) as Response);

    const models = await listModels('gemini', {
      gemini: { apiKey: 'test-key', baseUrl: 'https://proxy.example/v1beta/' },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://proxy.example/v1beta/models?key=test-key',
      expect.any(Object),
    );
    expect(models.map(({ id }) => id)).toEqual(['gemini-custom']);

    const model = createAIModel('gemini', 'gemini-custom', {
      gemini: { apiKey: 'test-key', baseUrl: 'https://proxy.example/v1beta' },
    });
    expect((model as unknown as { config: { baseURL: string } }).config.baseURL)
      .toBe('https://proxy.example/v1beta');
  });

  it('uses a custom OpenAI-compatible endpoint for discovery and model calls', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [{ id: 'model-custom', owned_by: 'proxy' }] }) as Response);

    const models = await listModels('openai', {
      openai: { apiKey: 'test-key', baseUrl: 'https://proxy.example/v1/' },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://proxy.example/v1/models',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-key' }) }),
    );
    expect(models.map(({ id }) => id)).toEqual(['model-custom']);

    const model = createAIModel('openai', 'model-custom', {
      openai: { apiKey: 'test-key', baseUrl: 'https://proxy.example/v1' },
    });
    const config = (model as unknown as {
      config: { url: (input: { path: string }) => string };
    }).config;
    expect(config.url({ path: '/responses' })).toBe('https://proxy.example/v1/responses');
  });
});
