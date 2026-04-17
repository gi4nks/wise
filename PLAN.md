# `@gi4nks/wise` — Piano di implementazione

> Modulo riusabile di astrazione AI per il monorepo gi4nks.  
> Fornisce: discovery modelli in tempo reale, factory Vercel AI SDK, componenti React per selezione modello e configurazione chiavi.

---

## 1. Obiettivi

| Obiettivo | Dettaglio |
|-----------|-----------|
| **Unico punto di accesso** | Tutte le app del monorepo importano da `@gi4nks/wise` invece di gestire provider in modo indipendente |
| **Modelli live** | `listModels()` interroga le API reali dei provider (non liste hardcoded) |
| **Cache in-memory** | TTL configurabile (default 5 min) per evitare chiamate ripetute |
| **Chiavi centralizzate** | Un componente React per inserire/salvare le chiavi API, riusabile in tutte le app |
| **Dual target** | `core/` funziona in Node.js (lens, CLI) e browser (Next.js server actions) |

---

## 2. Provider v1

| Provider | Endpoint discovery | Auth | Note |
|----------|--------------------|------|------|
| **Anthropic** | `GET https://api.anthropic.com/v1/models` | `x-api-key` header | Richiede API key |
| **Gemini** | `GET https://generativelanguage.googleapis.com/v1beta/models?key=...` | query param `key` | Filtra solo modelli `generateContent` |
| **Ollama** | `GET {baseUrl}/api/tags` | nessuna | `baseUrl` configurabile, default `http://localhost:11434` |

OpenAI escluso dalla v1 per scelta.

---

## 3. Struttura del package

```
commons/wise/
├── src/
│   ├── core/
│   │   ├── types.ts                ← tipi condivisi
│   │   ├── cache.ts                ← TTL cache in-memory
│   │   ├── providers/
│   │   │   ├── anthropic.ts        ← listModels + createClient
│   │   │   ├── gemini.ts           ← listModels + createClient
│   │   │   └── ollama.ts           ← listModels (no key)
│   │   ├── factory.ts              ← createAIModel() → Vercel AI SDK object
│   │   └── index.ts                ← re-export pubblico core
│   ├── react/
│   │   ├── ModelSelector.tsx       ← dropdown modelli raggruppati per provider
│   │   ├── ProviderKeyConfig.tsx   ← pannello inserimento/salvataggio chiavi
│   │   ├── WiseProvider.tsx        ← React context per config globale
│   │   └── index.ts                ← re-export pubblico react
│   └── index.ts                    ← re-export top-level (solo core)
├── package.json
├── tsup.config.ts
├── tsconfig.json
└── PLAN.md
```

---

## 4. Tipi (`core/types.ts`)

```ts
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
  ollama?: { baseUrl?: string };  // default: http://localhost:11434
}

export interface ListModelsOptions {
  ttl?: number;       // TTL cache in ms, default 5 * 60 * 1000
  signal?: AbortSignal;
}

export interface WiseConfig extends ProviderConfig {
  defaultProvider?: ProviderName;
  defaultModel?: string;
}
```

---

## 5. Cache (`core/cache.ts`)

Cache in-memory con TTL. Chiave = `${provider}:${JSON.stringify(config)}`.

```ts
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  get(key: string): T | null
  set(key: string, data: T, ttlMs: number): void
  invalidate(key: string): void
  invalidateAll(): void
}

export const modelCache = new TTLCache<ModelInfo[]>();
```

---

## 6. Provider implementations

### `providers/anthropic.ts`

```ts
export async function listAnthropicModels(
  apiKey: string,
  options?: ListModelsOptions
): Promise<ModelInfo[]>
// GET /v1/models, ritorna modelli con provider: 'anthropic'
// Response shape: { data: [{ id, display_name, ... }] }

export function createAnthropicClient(apiKey: string)
// ritorna anthropic(modelId) dall'SDK @ai-sdk/anthropic
// (lazy import per non rompere ambienti senza la dipendenza)
```

### `providers/gemini.ts`

```ts
export async function listGeminiModels(
  apiKey: string,
  options?: ListModelsOptions
): Promise<ModelInfo[]>
// GET /v1beta/models?key=... 
// Filtra: supportedGenerationMethods.includes('generateContent')
// name: "models/gemini-2.5-pro" → id: "gemini-2.5-pro"

export function createGeminiClient(apiKey: string)
// ritorna google(modelId) dall'SDK @ai-sdk/google
```

### `providers/ollama.ts`

```ts
export async function listOllamaModels(
  baseUrl?: string,
  options?: ListModelsOptions
): Promise<ModelInfo[]>
// GET {baseUrl}/api/tags
// Response: { models: [{ name, modified_at, size }] }
// name: "llama3.2:latest" → id: "llama3.2:latest", name: "llama3.2"

export function createOllamaClient(baseUrl?: string)
// ritorna createOpenAI({ baseURL: `${baseUrl}/v1` }) per compatibilità OpenAI
// Ollama espone API compatibile OpenAI su /v1
```

---

## 7. Factory (`core/factory.ts`)

Unica funzione d'ingresso per creare un modello Vercel AI SDK:

```ts
export async function listModels(
  provider: ProviderName,
  config: ProviderConfig,
  options?: ListModelsOptions
): Promise<ModelInfo[]>
// dispatcha al provider corretto con cache

export function createAIModel(
  provider: ProviderName,
  modelId: string,
  config: ProviderConfig
): LanguageModel
// ritorna l'oggetto LanguageModel del Vercel AI SDK
// usato direttamente con streamText(), generateText() ecc.

export async function listAllModels(
  config: ProviderConfig,
  options?: ListModelsOptions
): Promise<ModelInfo[]>
// chiama tutti i provider configurati in parallelo
// ignora silenziosamente i provider senza chiave / offline (Ollama)
```

---

## 8. Componenti React (`react/`)

### `WiseProvider.tsx` — Context globale

```tsx
interface WiseContextValue {
  config: WiseConfig;
  updateConfig: (patch: Partial<WiseConfig>) => void;
  models: ModelInfo[];          // già fetchati
  isLoading: boolean;
  error: string | null;
  refreshModels: () => Promise<void>;
}

export function WiseProvider({ config, children }: {
  config: WiseConfig;
  children: React.ReactNode;
})
// Wrappa l'app. Chiama listAllModels() al mount e quando config cambia.
// Persiste la config in localStorage (chiave: 'wise:config')
// NON mette le API key in localStorage — vedi sezione sicurezza.
```

### `ModelSelector.tsx` — Selezione modello

```tsx
export function ModelSelector({
  value,
  onChange,
  providers?,         // filtra i provider visibili
  className?,
}: {
  value: string | null;
  onChange: (modelId: string, provider: ProviderName) => void;
  providers?: ProviderName[];
  className?: string;
})
```

**UI:**
- `<select>` con `<optgroup>` per provider (DaisyUI `select`)
- Badge colorato per provider: `anthropic` → viola, `gemini` → blu, `ollama` → verde
- Skeleton mentre carica (`loading loading-spinner`)
- Messaggio inline se un provider non è configurato: "Configura chiave Anthropic →"

### `ProviderKeyConfig.tsx` — Configurazione chiavi

```tsx
export function ProviderKeyConfig({
  onSave?: (config: ProviderConfig) => void;
  className?: string;
})
```

**UI:**
- Card per ogni provider (DaisyUI `card`)
- Input `type="password"` per Anthropic e Gemini
- Input `type="url"` per Ollama base URL
- Pulsante "Testa connessione" → chiama `listModels()` e mostra badge OK/errore
- Pulsante "Salva" → chiama `onSave(config)`

**Sicurezza chiavi:**
- Le chiavi vengono passate a `onSave` e la gestione della persistenza spetta all'app
- In Next.js: le chiavi vanno in `.env.local` o in un secrets store — **mai in `localStorage`**
- Ogni app decide dove salvare (DB cifrato, env, sessione server)
- `WiseProvider` accetta la config via prop, non la legge da `localStorage`

---

## 9. Gestione chiavi API per contesto

### Next.js apps (homo, machina, fury, rino)

```
Flusso raccomandato:

1. L'utente inserisce la chiave in <ProviderKeyConfig>
2. onSave → Server Action → salva in DB (colonna cifrata) o in .env.local
3. Al caricamento della pagina: Server Action legge la chiave e la passa come prop a <WiseProvider>
4. <WiseProvider> chiama listAllModels() server-side (via Server Action)
5. I model IDs passano al client — le chiavi NON escono mai dal server
```

**Pattern Server Action:**
```ts
// app/actions/wise.actions.ts
'use server'
import { listAllModels } from '@gi4nks/wise';

export async function getAvailableModels() {
  return listAllModels({
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY! },
    gemini: { apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! },
    ollama: { baseUrl: process.env.OLLAMA_URL },
  });
}
```

### CLI / Node.js (lens)

```ts
import { listModels, createAIModel } from '@gi4nks/wise';

// lens legge da ~/.config/lens/config.json o da process.env
const models = await listModels('anthropic', {
  anthropic: { apiKey: config.anthropicApiKey }
});
```

lens non usa i componenti React — consuma solo `@gi4nks/wise` (core).

---

## 10. `package.json`

```json
{
  "name": "@gi4nks/wise",
  "version": "1.0.0",
  "description": "Unified AI provider abstraction for gi4nks monorepo",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./src/index.ts",
      "require": "./src/index.ts"
    },
    "./react": {
      "types": "./dist/react/index.d.ts",
      "import": "./src/react/index.ts",
      "require": "./src/react/index.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^3.x",
    "@ai-sdk/google": "^3.x",
    "ai": "^6.x"
  },
  "peerDependencies": {
    "react": ">=18.0.0"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true }
  },
  "devDependencies": {
    "tsup": "^8.x",
    "typescript": "^5.x",
    "@types/react": "^19.x"
  }
}
```

**Nota:** `react` è peer opzionale — il core funziona senza React (per lens).

---

## 11. `tsup.config.ts`

```ts
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    external: ['react', 'react-dom'],
  },
  {
    entry: { 'react/index': 'src/react/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    external: ['react', 'react-dom'],
  },
]);
```

---

## 12. Integrazione nelle app esistenti

### homo

```ts
// lib/ai.ts — sostituisce la logica sparsa
import { createAIModel } from '@gi4nks/wise';

export function getModel(provider: string, modelId: string) {
  return createAIModel(provider, modelId, {
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY! },
    gemini: { apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! },
  });
}
```

```tsx
// components/ModelPicker.tsx
import { ModelSelector } from '@gi4nks/wise/react';
```

### machina

Sostituisce `AI_MODELS` hardcoded in `src/lib/ai-factory.ts` con `listAllModels()`.

### lens

```ts
// src/ai/Provider.ts — sostituisce il file attuale
import { listModels, type ModelInfo } from '@gi4nks/wise';
// I provider custom di lens diventano thin wrapper su wise/core
```

---

## 13. Fasi di implementazione

### Fase 1 — Core (blocco fondante)
- [ ] Setup package (`package.json`, `tsup.config.ts`, `tsconfig.json`)
- [ ] `core/types.ts`
- [ ] `core/cache.ts`
- [ ] `core/providers/anthropic.ts` — `listModels`
- [ ] `core/providers/gemini.ts` — `listModels`
- [ ] `core/providers/ollama.ts` — `listModels`
- [ ] `core/factory.ts` — `listModels`, `listAllModels`, `createAIModel`
- [ ] `core/index.ts`

### Fase 2 — React components
- [ ] `react/WiseProvider.tsx`
- [ ] `react/ModelSelector.tsx`
- [ ] `react/ProviderKeyConfig.tsx`
- [ ] `react/index.ts`

### Fase 3 — Integrazione homo
- [ ] Server Action `getAvailableModels()`
- [ ] Sostituire logica AI esistente con `createAIModel()`
- [ ] Integrare `<ModelSelector>` nell'UI

### Fase 4 — Integrazione machina
- [ ] Rimpiazzare `AI_MODELS` hardcoded con `listAllModels()`
- [ ] Integrare `<ProviderKeyConfig>` per gestione chiavi

### Fase 5 — Integrazione lens
- [ ] Sostituire `src/ai/Provider.ts` con wrapper su `@gi4nks/wise` core
- [ ] Aggiornare config CLI per passare chiavi a `wise`

### Fase 6 — Integrazione fury / rino / altri
- [ ] Aggiungere `<ModelSelector>` dove serve selezione modello

---

## 14. Decisioni aperte

| Punto | Opzione A | Opzione B | Default |
|-------|-----------|-----------|---------|
| Persistenza chiavi in Next.js | `.env.local` (solo dev) | Colonna DB cifrata | `.env.local` per ora |
| Ollama in ambienti cloud | Disabilitato se `OLLAMA_URL` non settato | Sempre tentato (fallisce silenziosamente) | Fallisce silenziosamente |
| TTL cache default | 5 minuti | Configurabile via `WiseProvider` | 5 min, configurabile |
| Vercel AI SDK version lock | Peerless, ogni app usa la sua | Bundled in wise | Peerless |
