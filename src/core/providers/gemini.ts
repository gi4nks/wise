import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ModelInfo, ListModelsOptions } from '../types';

export async function listGeminiModels(
  apiKey: string,
  options?: ListModelsOptions
): Promise<ModelInfo[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        signal: options?.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.models
      .filter((model: any) =>
        model.supportedGenerationMethods.includes('generateContent')
      )
      .map((model: any) => {
        const id = model.name.replace('models/', '');
        return {
          id,
          name: model.displayName || id,
          provider: 'gemini',
          description: model.description,
        };
      });
  } catch (_error) {
    // Fallback to stable static list if API call fails or key is invalid
    return [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini', description: 'Fast and efficient' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', description: 'High intelligence' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', description: 'Balanced speed' },
      { id: 'gemini-2.0-flash-lite-preview-02-05', name: 'Gemini 2.0 Flash Lite', provider: 'gemini' },
    ];
  }
}

export function createGeminiClient(apiKey: string) {
  return createGoogleGenerativeAI({
    apiKey,
  });
}
