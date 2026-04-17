# @gi4nks/wise

> Unified AI provider abstraction for the gi4nks monorepo.

Wise provides a seamless way to interact with multiple AI providers (Anthropic, Gemini, Ollama) using a consistent API, real-time model discovery, and built-in React components for configuration and selection.

## Features

- **Unified Access**: One point of entry for multiple AI providers.
- **Live Model Discovery**: Fetches available models directly from provider APIs (not hardcoded).
- **In-memory Cache**: Built-in TTL cache for model lists to optimize performance.
- **Vercel AI SDK Integration**: Directly creates `LanguageModel` objects for use with `ai` package.
- **React Ready**: Includes a global provider, model selector, and API key configuration components.
- **Edge Compatible**: Works in Node.js, Browser, and Edge runtimes.

## Installation

```bash
npm install @gi4nks/wise
```

## Usage

### Core API (Node.js / Server-side)

```ts
import { listAllModels, createAIModel } from '@gi4nks/wise';

const config = {
  anthropic: { apiKey: process.env.ANTHROPIC_API_KEY },
  gemini: { apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY },
  ollama: { baseUrl: 'http://localhost:11434' }
};

// List all available models across providers
const models = await listAllModels(config);

// Create a Vercel AI SDK model instance
const model = createAIModel('anthropic', 'claude-3-5-sonnet-20240620', config);

// Use with Vercel AI SDK
import { generateText } from 'ai';
const { text } = await generateText({
  model,
  prompt: 'Write a haiku about TypeScript.',
});
```

### React API

```tsx
import { WiseProvider, ModelSelector, ProviderKeyConfig } from '@gi4nks/wise/react';

function App() {
  const [config, setConfig] = useState(initialConfig);
  const [selectedModel, setSelectedModel] = useState(null);

  return (
    <WiseProvider config={config}>
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold">AI Settings</h2>
        
        <ProviderKeyConfig 
          initialConfig={config} 
          onSave={(newConfig) => setConfig(newConfig)} 
        />
        
        <ModelSelector 
          value={selectedModel} 
          onChange={(id, provider) => setSelectedModel(id)} 
        />
      </div>
    </WiseProvider>
  );
}
```

## Development

- `make install`: Install dependencies
- `make build`: Build the package
- `make test`: Run tests
- `make lint`: Run linting

## License

MIT
