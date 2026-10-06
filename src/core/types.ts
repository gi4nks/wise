export type ProviderName = 'anthropic' | 'gemini' | 'ollama' | 'omlx' | 'openai' | 'opencode';

export interface ModelInfo {
  id: string;
  name: string;
  provider: ProviderName;
  description?: string;
}

export interface ProviderConfig {
  anthropic?: { apiKey: string; baseUrl?: string; extraBody?: Record<string, any> };
  gemini?: { apiKey: string; baseUrl?: string; extraBody?: Record<string, any> };
  ollama?: { baseUrl?: string; extraBody?: Record<string, any> }; // default: http://localhost:11434
  omlx?: { apiKey: string; baseUrl?: string; extraBody?: Record<string, any> };
  openai?: { apiKey: string; baseUrl?: string; extraBody?: Record<string, any> };
  opencode?: { apiKey: string; baseUrl?: string; extraBody?: Record<string, any> };
}

export interface ListModelsOptions {
  ttl?: number; // TTL cache in ms, default 5 * 60 * 1000
  signal?: AbortSignal;
}

export interface WiseConfig extends ProviderConfig {
  defaultProvider?: ProviderName;
  defaultModel?: string;
}
