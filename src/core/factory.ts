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
import {
  listOpenCodeModels,
  createOpenCodeClient,
} from './providers/opencode';
import { listOmlxModels, createOmlxClient } from './providers/omlx';

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
          models = await listAnthropicModels(
            config.anthropic.apiKey,
            options,
            config.anthropic.baseUrl,
          );
        }
        break;
      case 'gemini':
        if (config.gemini?.apiKey) {
          models = await listGeminiModels(
            config.gemini.apiKey,
            options,
            config.gemini.baseUrl,
          );
        }
        break;
      case 'ollama':
        models = await listOllamaModels(config.ollama?.baseUrl, options);
        break;
      case 'openai':
        if (config.openai?.apiKey) {
          models = await listOpenAIModels(
            config.openai.apiKey,
            options,
            config.openai.baseUrl,
          );
        }
        break;
      case 'opencode':
        if (config.opencode?.apiKey) {
          models = await listOpenCodeModels(
            config.opencode.apiKey,
            config.opencode.baseUrl,
            options
          );
        }
        break;
      case 'omlx':
        if (config.omlx?.apiKey) {
          models = await listOmlxModels(
            config.omlx.apiKey,
            config.omlx.baseUrl,
            options
          );
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
  const providers: ProviderName[] = ['anthropic', 'gemini', 'ollama', 'omlx', 'openai', 'opencode'];
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
      return createAnthropicClient(config.anthropic.apiKey, config.anthropic.baseUrl)(modelId);
    case 'gemini':
      if (!config.gemini?.apiKey) {
        throw new Error('Gemini API key is missing');
      }
      return createGeminiClient(config.gemini.apiKey, config.gemini.baseUrl)(modelId);
    case 'ollama':
      return createOllamaClient(config.ollama?.baseUrl)(modelId, {
        // `think` is caller-controlled via extraBody (e.g. {think:false} for
        // agentic calls that must reply fast). Omitting it keeps the model's
        // hidden thinking channel: `content` stays clean prose and reasoning
        // lands in the separate `thinking` field (2026-08-17: forcing
        // think:false on Qwen3.5 makes it dump meta-analysis inline and write
        // NO prose at all).
        ...config.ollama?.extraBody, // Spread injection payload at root
        options: config.ollama?.extraBody, // Keep for backward compatibility with Ollama options
      } as any);
    case 'openai':
      if (!config.openai?.apiKey) {
        throw new Error('OpenAI API key is missing');
      }
      return createOpenAIClient(config.openai.apiKey, config.openai.baseUrl)(modelId);
    case 'opencode':
      if (!config.opencode?.apiKey) {
        throw new Error('OpenCode API key is missing');
      }
      return createOpenCodeClient(
        config.opencode.apiKey,
        config.opencode.baseUrl,
        config.opencode?.extraBody,
      )(modelId);
    case 'omlx':
      if (!config.omlx?.apiKey) {
        throw new Error('oMLX API key is missing');
      }
      return createOmlxClient(
        config.omlx.apiKey,
        config.omlx.baseUrl,
        config.omlx?.extraBody,
      )(modelId);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
