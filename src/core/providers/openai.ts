import { createOpenAI } from '@ai-sdk/openai';
import { ModelInfo, ListModelsOptions } from '../types';

export async function listOpenAIModels(
  apiKey: string,
  options?: ListModelsOptions,
  baseUrl?: string
): Promise<ModelInfo[]> {
  // OpenAI doesn't have a very clean public model list endpoint without auth headers
  // We can use the standard one if needed
  const modelsUrl = baseUrl
    ? `${baseUrl.replace(/\/+$/, '')}/models`
    : 'https://api.openai.com/v1/models';
  try {
    const response = await fetch(modelsUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((model: any) => ({
      id: model.id,
      name: model.id,
      provider: 'openai',
      description: `Created by ${model.owned_by}`,
    }));
  } catch (error) {
     // Fallback to a static list if fetching fails
     return [
       { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
       { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
       { id: 'o1-preview', name: 'o1 Preview', provider: 'openai' },
     ];
  }
}

export function createOpenAIClient(apiKey: string, baseUrl?: string) {
  return createOpenAI({
    apiKey,
    ...(baseUrl ? { baseURL: baseUrl } : {}),
  });
}
