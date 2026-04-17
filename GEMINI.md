# Wise - AI Context & Guidelines

Wise is a unified AI provider abstraction library. It handles model discovery, provider-specific client creation, and provides React components for AI configuration.

## Tech Stack
- **Language**: TypeScript
- **Runtime**: Node.js / Browser / Edge
- **Bundler**: `tsup` (CJS, ESM, DTS)
- **UI**: React + DaisyUI classes
- **Testing**: `vitest`
- **CI/CD**: GitHub Actions + `semantic-release`

## Core Principles
1. **Abstraction**: Hide provider-specific implementation details behind a unified API.
2. **Real-time Discovery**: Prefer querying provider APIs over hardcoded model lists.
3. **Efficiency**: Use TTL caching for API responses to minimize latency and rate-limiting issues.
4. **Security**: Never persist API keys in `localStorage` within the library; delegation of persistence is left to the host application.
5. **Vercel AI SDK First**: Designed to work seamlessly as a factory for Vercel AI SDK `LanguageModel` objects.

## Codebase Map
- `src/core/`: Pure logic for provider interaction, caching, and client factory.
  - `providers/`: Individual implementations for Anthropic, Gemini, and Ollama.
  - `factory.ts`: Unified entry point for model listing and creation.
- `src/react/`: React-specific integration.
  - `WiseProvider.tsx`: Context provider for global AI configuration.
  - `ModelSelector.tsx`: Dropdown component for model selection.
  - `ProviderKeyConfig.tsx`: UI for API key management.
- `src/index.ts`: Public entry point (core).
- `src/react/index.ts`: Public entry point (react).

## AI Guidelines
- **Versioning**: Adhere to Conventional Commits for all changes.
- **Testing**: Every new feature or provider must include unit tests.
- **Typing**: Maintain strict TypeScript types. Use `ProviderName` and `ModelInfo` consistently.
- **Style**: React components should use DaisyUI-compatible CSS classes.
- **Providers**: When adding a new provider, implement both `listModels` and `createClient` logic.

## Workflow
- Build: `make build`
- Test: `make test`
- Lint: `make lint`
- Dev: `npm run dev`
