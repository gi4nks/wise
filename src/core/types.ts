export type ProviderName = 'anthropic' | 'gemini' | 'ollama';

export interface ModelInfo {
  id: string;
  name: string;
  provider: ProviderName;
  description?: string;
}

export interface ProviderConfig {
  anthropic?: { apiKey: string };
  gemini?: { apiKey: string };
  ollama?: { baseUrl?: string }; // default: http://localhost:11434
}

export interface ListModelsOptions {
  ttl?: number; // TTL cache in ms, default 5 * 60 * 1000
  signal?: AbortSignal;
}

export interface WiseConfig extends ProviderConfig {
  defaultProvider?: ProviderName;
  defaultModel?: string;
}
