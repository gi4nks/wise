import { createAnthropic } from '@ai-sdk/anthropic';
import { ModelInfo, ListModelsOptions } from '../types';

export async function listAnthropicModels(
  apiKey: string,
  options?: ListModelsOptions,
  baseUrl?: string
): Promise<ModelInfo[]> {
  const modelsUrl = baseUrl
    ? `${baseUrl.replace(/\/+$/, '')}/models`
    : 'https://api.anthropic.com/v1/models';
  try {
    const response = await fetch(modelsUrl, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((model: any) => ({
      id: model.id,
      name: model.display_name || model.id,
      provider: 'anthropic',
      description: `Anthropic ${model.id} model`,
    }));
  } catch (_error) {
    // Fallback to stable static list if API call fails or key is invalid
    return [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', description: 'Expert writing & coding' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', description: 'Fastest model' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', description: 'Most intelligent' },
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', provider: 'anthropic', description: 'Latest standard' },
    ];
  }
}

export function createAnthropicClient(apiKey: string, baseUrl?: string) {
  return createAnthropic({
    apiKey,
    ...(baseUrl ? { baseURL: baseUrl } : {}),
  });
}
