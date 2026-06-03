import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { ModelInfo, ListModelsOptions } from '../types';

const DEFAULT_BASE_URL = 'http://localhost:8000/v1';

export async function listOmlxModels(
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
      throw new Error(`oMLX API error: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.data || []).map((model: any) => ({
      id: model.id,
      name: model.id,
      provider: 'omlx',
    }));
  } catch {
    return [];
  }
}

export function createOmlxClient(apiKey: string, baseUrl?: string, extraBody?: Record<string, any>) {
  const url = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
  return createOpenAICompatible({
    name: 'omlx',
    baseURL: url,
    apiKey,
    transformRequestBody: extraBody
      ? (args: any) => ({ ...args, ...extraBody })
      : undefined,
  });
}
