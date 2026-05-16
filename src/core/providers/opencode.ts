import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { ModelInfo, ListModelsOptions } from '../types';

const DEFAULT_BASE_URL = 'https://opencode.ai/zen/v1';

export async function listOpenCodeModels(
  apiKey: string,
  baseUrl?: string,
  options?: ListModelsOptions
): Promise<ModelInfo[]> {
  const url = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
  try {
    const response = await fetch(`${url}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(`OpenCode API error: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.data || []).map((model: any) => ({
      id: model.id,
      name: model.id,
      provider: 'opencode',
    }));
  } catch {
    return [];
  }
}

export function createOpenCodeClient(apiKey: string, baseUrl?: string) {
  const url = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
  return createOpenAICompatible({
    name: 'opencode',
    baseURL: url,
    apiKey,
  });
}
