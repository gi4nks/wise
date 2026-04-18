import { LanguageModel } from 'ai';
import {
  ProviderName,
  ModelInfo,
  ProviderConfig,
  ListModelsOptions,
} from './types';
import { modelCache } from './cache';
import {
  listAnthropicModels,
  createAnthropicClient,
} from './providers/anthropic';
import { listGeminiModels, createGeminiClient } from './providers/gemini';
import { listOllamaModels, createOllamaClient } from './providers/ollama';
import { listOpenAIModels, createOpenAIClient } from './providers/openai';

export async function listModels(
  provider: ProviderName,
  config: ProviderConfig,
  options?: ListModelsOptions
): Promise<ModelInfo[]> {
  const cacheKey = `${provider}:${JSON.stringify(config[provider])}`;
  const cached = modelCache.get(cacheKey);
  if (cached) return cached;

  let models: ModelInfo[] = [];

  try {
    switch (provider) {
      case 'anthropic':
        if (config.anthropic?.apiKey) {
          models = await listAnthropicModels(config.anthropic.apiKey, options);
        }
        break;
      case 'gemini':
        if (config.gemini?.apiKey) {
          models = await listGeminiModels(config.gemini.apiKey, options);
        }
        break;
      case 'ollama':
        models = await listOllamaModels(config.ollama?.baseUrl, options);
        break;
      case 'openai':
        if (config.openai?.apiKey) {
          models = await listOpenAIModels(config.openai.apiKey, options);
        }
        break;
    }
  } catch (error) {
    console.error(`Error listing models for ${provider}:`, error);
    return [];
  }

  if (models.length > 0) {
    modelCache.set(cacheKey, models, options?.ttl ?? 5 * 60 * 1000);
  }

  return models;
}

export async function listAllModels(
  config: ProviderConfig,
  options?: ListModelsOptions
): Promise<ModelInfo[]> {
  const providers: ProviderName[] = ['anthropic', 'gemini', 'ollama', 'openai'];
  const results = await Promise.allSettled(
    providers.map((p) => listModels(p, config, options))
  );

  return results.flatMap((res) => (res.status === 'fulfilled' ? res.value : []));
}

export function createAIModel(
  provider: ProviderName,
  modelId: string,
  config: ProviderConfig
): LanguageModel {
  switch (provider) {
    case 'anthropic':
      if (!config.anthropic?.apiKey) {
        throw new Error('Anthropic API key is missing');
      }
      return createAnthropicClient(config.anthropic.apiKey)(modelId, {
        extraBody: config.anthropic.extraBody,
      } as any);
    case 'gemini':
      if (!config.gemini?.apiKey) {
        throw new Error('Gemini API key is missing');
      }
      return createGeminiClient(config.gemini.apiKey)(modelId, {
        extraBody: config.gemini.extraBody,
      } as any);
    case 'ollama':
      return createOllamaClient(config.ollama?.baseUrl)(modelId, {
        extraBody: config.ollama?.extraBody,
      } as any);
    case 'openai':
      if (!config.openai?.apiKey) {
        throw new Error('OpenAI API key is missing');
      }
      return createOpenAIClient(config.openai.apiKey)(modelId, {
        extraBody: config.openai.extraBody,
      } as any);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
