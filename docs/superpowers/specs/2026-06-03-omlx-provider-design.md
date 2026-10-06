# oMLX Provider Integration for @gi4nks/wise

## Objective

Add oMLX as a new AI provider in the wise unified provider abstraction. oMLX is an OpenAI-compatible LLM inference server for Apple Silicon.

## Changes

### 1. `src/core/types.ts`

- Add `'omlx'` to the `ProviderName` union type
- Add `omlx?: { apiKey: string; baseUrl?: string; extraBody?: Record<string, any> }` to `ProviderConfig`

### 2. `src/core/providers/omlx.ts` (new file)

- `listOmlxModels(apiKey, baseUrl?, options?)` — fetches `{baseUrl}/models` with Bearer auth, returns `ModelInfo[]`. Default baseUrl: `http://localhost:8000/v1` (oMLX default port).
- `createOmlxClient(apiKey, baseUrl?, extraBody?)` — uses `createOpenAICompatible` from `@ai-sdk/openai-compatible` (already a dependency), following the opencode pattern.

### 3. `src/core/factory.ts`

- Import `listOmlxModels` and `createOmlxClient`
- Add `'omlx'` case in `listModels()` — calls `listOmlxModels(config.omlx.apiKey, config.omlx.baseUrl, options)`
- Add `'omlx'` case in `createAIModel()` — validates `config.omlx.apiKey`, calls `createOmlxClient(config.omlx.apiKey, config.omlx.baseUrl, config.omlx.extraBody)(modelId)`

### 4. `src/core/index.ts`

- Add `export * from './providers/omlx'`

### 5. `src/core/factory.test.ts` (optional)

- Optionally add a test case for oMLX model listing

## Usage Example

```ts
const config = {
  omlx: {
    apiKey: process.env.OMLX_API_KEY,
    baseUrl: 'http://lab-server:8010/v1',
  },
};

const models = await listAllModels(config);
const model = createAIModel('omlx', 'Qwen3.5-122B-A10B-4bit', config);
```

## Provider Name

- `ProviderName`: `'omlx'`
- Internal client name passed to `createOpenAICompatible`: `'omlx'`
