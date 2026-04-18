export type ProviderName = 'anthropic' | 'gemini' | 'ollama' | 'openai';

export interface ModelInfo {
  id: string;
  name: string;
  provider: ProviderName;
  description?: string;
}

export interface ProviderConfig {
  anthropic?: { apiKey: string; extraBody?: Record<string, any> };
  gemini?: { apiKey: string; extraBody?: Record<string, any> };
  ollama?: { baseUrl?: string; extraBody?: Record<string, any> }; // default: http://localhost:11434
  openai?: { apiKey: string; extraBody?: Record<string, any> };
}

export interface ListModelsOptions {
  ttl?: number; // TTL cache in ms, default 5 * 60 * 1000
  signal?: AbortSignal;
}

export interface WiseConfig extends ProviderConfig {
  defaultProvider?: ProviderName;
  defaultModel?: string;
}
