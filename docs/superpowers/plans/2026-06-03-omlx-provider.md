# oMLX Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add oMLX as a new provider in `@gi4nks/wise`

**Architecture:** oMLX is OpenAI-compatible, so we follow the existing `opencode` pattern — use `@ai-sdk/openai-compatible` (already a dependency) with a custom baseURL and Bearer auth.

**Tech Stack:** TypeScript, Vercel AI SDK (`@ai-sdk/openai-compatible`), vitest

---

### Task 1: Add `omlx` to types

**Files:**
- Modify: `src/core/types.ts`

- [ ] **Add `'omlx'` to ProviderName and add omlx config**

```typescript
export type ProviderName = 'anthropic' | 'gemini' | 'ollama' | 'openai' | 'opencode' | 'omlx';

export interface ProviderConfig {
  anthropic?: { apiKey: string; extraBody?: Record<string, any> };
  gemini?: { apiKey: string; extraBody?: Record<string, any> };
  ollama?: { baseUrl?: string; extraBody?: Record<string, any> };
  openai?: { apiKey: string; extraBody?: Record<string, any> };
  opencode?: { apiKey: string; baseUrl?: string; extraBody?: Record<string, any> };
  omlx?: { apiKey: string; baseUrl?: string; extraBody?: Record<string, any> };
}
```

- [ ] **Commit**

```bash
git add src/core/types.ts
git commit -m "feat(types): add omlx provider type"
```

---

### Task 2: Create oMLX provider file

**Files:**
- Create: `src/core/providers/omlx.ts`

- [ ] **Write provider implementation**

```typescript
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { ModelInfo, ListModelsOptions } from '../types';

const DEFAULT_BASE_URL = 'http://localhost:8000/v1';

export async function listOmlxModels(
  apiKey: string,
  baseUrl?: string,
  options?: ListModelsOptions
): Promise<ModelInfo[]> {
  const url = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
  try {
    const response = await fetch(`${url}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(`oMLX API error: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.data || []).map((model: any) => ({
      id: model.id,
      name: model.id,
      provider: 'omlx',
    }));
  } catch {
    return [];
  }
}

export function createOmlxClient(apiKey: string, baseUrl?: string, extraBody?: Record<string, any>) {
  const url = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
  return createOpenAICompatible({
    name: 'omlx',
    baseURL: url,
    apiKey,
    transformRequestBody: extraBody
      ? (args: any) => ({ ...args, ...extraBody })
      : undefined,
  });
}
```

- [ ] **Commit**

```bash
git add src/core/providers/omlx.ts
git commit -m "feat(providers): add omlx provider with model listing and client creation"
```

---

### Task 3: Wire oMLX into factory

**Files:**
- Modify: `src/core/factory.ts`

- [ ] **Add omlx import and switch cases**

```typescript
import {
  listOmlxModels,
  createOmlxClient,
} from './providers/omlx';
```

In `listModels`:
```typescript
      case 'omlx':
        if (config.omlx?.apiKey) {
          models = await listOmlxModels(
            config.omlx.apiKey,
            config.omlx.baseUrl,
            options
          );
        }
        break;
```

In `createAIModel`:
```typescript
    case 'omlx':
      if (!config.omlx?.apiKey) {
        throw new Error('oMLX API key is missing');
      }
      return createOmlxClient(
        config.omlx.apiKey,
        config.omlx.baseUrl,
        config.omlx?.extraBody,
      )(modelId);
```

Also update `listAllModels` provider array:
```typescript
const providers: ProviderName[] = ['anthropic', 'gemini', 'ollama', 'openai', 'opencode', 'omlx'];
```

- [ ] **Commit**

```bash
git add src/core/factory.ts
git commit -m "feat(factory): wire omlx into listModels and createAIModel"
```

---

### Task 4: Export oMLX from core

**Files:**
- Modify: `src/core/index.ts`

- [ ] **Add omlx export**

```typescript
export * from './providers/omlx';
```

- [ ] **Commit**

```bash
git add src/core/index.ts
git commit -m "chore: export omlx provider from core"
```

---

### Task 5: Write tests for oMLX

**Files:**
- Modify: `src/core/factory.test.ts`

- [ ] **Add test for oMLX model listing**

```typescript
  it('should list omlx models when omlx config is provided', async () => {
    (global.fetch as any).mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: 'Qwen3.5-122B-A10B-4bit' }, { id: 'Step-3.5-Flash-8bit' }] }),
    }));

    const config = {
      omlx: { apiKey: 'test-key', baseUrl: 'http://lab-server:8010/v1' },
    };

    const models = await listAllModels(config);

    expect(models).toHaveLength(2);
    expect(models[0]).toMatchObject({ id: 'Qwen3.5-122B-A10B-4bit', provider: 'omlx' });
  });
```

- [ ] **Run tests to verify they pass**

Run: `npx vitest run`
Expected: all tests (including new omlx test) PASS

- [ ] **Commit**

```bash
git add src/core/factory.test.ts
git commit -m "test: add omlx model listing test"
```

---

### Task 6: Verify build

- [ ] **Run type-check and lint**

Run: `npm run type-check && npm run lint`
Expected: no errors

- [ ] **Run build**

Run: `npm run build`
Expected: build succeeds, `dist/` updated

- [ ] **If all clean, make final commit (if anything changed)**

```bash
git add -A
git commit -m "chore: finalize omlx provider integration"
```
