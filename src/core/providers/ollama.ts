import { createOllama } from 'ollama-ai-provider';
import { ModelInfo, ListModelsOptions } from '../types';

export async function listOllamaModels(
  baseUrl: string = 'http://localhost:11434',
  options?: ListModelsOptions
): Promise<ModelInfo[]> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: options?.signal,
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.models.map((model: any) => ({
      id: model.name,
      name: model.name.split(':')[0],
      provider: 'ollama',
      description: `Ollama model ${model.name}`,
    }));
  } catch (_error) {
    // Ollama might not be running or signal aborted
    return [];
  }
}

export function createOllamaClient(baseUrl: string = 'http://localhost:11434') {
  return createOllama({
    baseURL: `${baseUrl}/api`,
  });
}
