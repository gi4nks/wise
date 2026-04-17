import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ModelInfo, ListModelsOptions } from '../types';

export async function listGeminiModels(
  apiKey: string,
  options?: ListModelsOptions
): Promise<ModelInfo[]> {
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
}

export function createGeminiClient(apiKey: string) {
  return createGoogleGenerativeAI({
    apiKey,
  });
}
