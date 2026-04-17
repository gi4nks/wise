import { createAnthropic } from '@ai-sdk/anthropic';
import { ModelInfo, ListModelsOptions } from '../types';

export async function listAnthropicModels(
  apiKey: string,
  options?: ListModelsOptions
): Promise<ModelInfo[]> {
  const response = await fetch('https://api.anthropic.com/v1/models', {
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
}

export function createAnthropicClient(apiKey: string) {
  return createAnthropic({
    apiKey,
  });
}
