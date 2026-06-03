import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listAllModels } from './factory';
import { modelCache } from './cache';

describe('listAllModels', () => {
  beforeEach(() => {
    modelCache.invalidateAll();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should call all providers and combine results', async () => {
    // Anthropic Mock
    (global.fetch as any).mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: 'claude-3-opus', display_name: 'Claude 3 Opus' }] }),
    }));

    // Gemini Mock
    (global.fetch as any).mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ models: [{ name: 'models/gemini-pro', supportedGenerationMethods: ['generateContent'] }] }),
    }));

    // Ollama Mock
    (global.fetch as any).mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ models: [{ name: 'llama3:latest' }] }),
    }));

    const config = {
      anthropic: { apiKey: 'test-key' },
      gemini: { apiKey: 'test-key' },
    };

    const models = await listAllModels(config);

    expect(models).toHaveLength(3);
    const ids = models.map(m => m.id);
    expect(ids).toContain('claude-3-opus');
    expect(ids).toContain('gemini-pro');
    expect(ids).toContain('llama3:latest');
  });

  it('should return static fallback models when API is unreachable', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    
    const config = {
      anthropic: { apiKey: 'test-key' },
    };
    
    const models = await listAllModels(config);
    // Anthropic returns static fallback models when API is unreachable
    expect(models.length).toBeGreaterThan(0);
    expect(models.every(m => m.provider === 'anthropic')).toBe(true);
  });

  it('should list omlx models when omlx config is provided', async () => {
    // Ollama always calls fetch (no config guard), so return empty
    (global.fetch as any).mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ models: [] }),
    }));

    (global.fetch as any).mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: 'Qwen3.5-122B-A10B-4bit' }, { id: 'Step-3.5-Flash-8bit' }] }),
    }));

    const config = {
      omlx: { apiKey: 'test-key', baseUrl: 'http://parmenide:8010/v1' },
    };

    const models = await listAllModels(config);

    expect(models).toHaveLength(2);
    expect(models[0]).toMatchObject({ id: 'Qwen3.5-122B-A10B-4bit', provider: 'omlx' });
  });
});
