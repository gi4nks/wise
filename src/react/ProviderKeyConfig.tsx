import { useState } from 'react';
import { ProviderConfig, ProviderName } from '../core/types';
import { listModels } from '../core/factory';

interface ProviderKeyConfigProps {
  initialConfig?: ProviderConfig;
  onSave?: (config: ProviderConfig) => void;
  className?: string;
}

export function ProviderKeyConfig({
  initialConfig,
  onSave,
  className = '',
}: ProviderKeyConfigProps) {
  const [config, setConfig] = useState<ProviderConfig>(
    initialConfig || {
      anthropic: { apiKey: '' },
      gemini: { apiKey: '' },
      ollama: { baseUrl: 'http://localhost:11434' },
      openai: { apiKey: '' },
    }
  );

  const [testStatus, setTestStatus] = useState<
    Record<ProviderName, 'idle' | 'loading' | 'success' | 'error'>
  >({
    anthropic: 'idle',
    gemini: 'idle',
    ollama: 'idle',
    openai: 'idle',
  });

  const handleTest = async (provider: ProviderName) => {
    setTestStatus((prev) => ({ ...prev, [provider]: 'loading' }));
    try {
      const models = await listModels(provider, config);
      if (models.length > 0) {
        setTestStatus((prev) => ({ ...prev, [provider]: 'success' }));
      } else {
        setTestStatus((prev) => ({ ...prev, [provider]: 'error' }));
      }
    } catch (_err) {
      setTestStatus((prev) => ({ ...prev, [provider]: 'error' }));
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* OpenAI */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body p-4">
          <h3 className="card-title text-sm flex justify-between items-center">
            OpenAI
            {testStatus.openai === 'success' && (
              <div className="badge badge-success badge-sm">OK</div>
            )}
            {testStatus.openai === 'error' && (
              <div className="badge badge-error badge-sm">Errore</div>
            )}
          </h3>
          <div className="flex gap-2 items-end">
            <div className="form-control flex-1">
              <label className="label py-1">
                <span className="label-text text-xs">API Key</span>
              </label>
              <input
                type="password"
                className="input input-bordered input-sm"
                value={config.openai?.apiKey || ''}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    openai: { apiKey: e.target.value },
                  }))
                }
                placeholder="sk-..."
              />
            </div>
            <button
              className={`btn btn-sm btn-outline ${
                testStatus.openai === 'loading' ? 'loading' : ''
              }`}
              onClick={() => handleTest('openai')}
            >
              Test
            </button>
          </div>
        </div>
      </div>

      {/* Anthropic */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body p-4">
          <h3 className="card-title text-sm flex justify-between items-center">
            Anthropic
            {testStatus.anthropic === 'success' && (
              <div className="badge badge-success badge-sm">OK</div>
            )}
            {testStatus.anthropic === 'error' && (
              <div className="badge badge-error badge-sm">Errore</div>
            )}
          </h3>
          <div className="flex gap-2 items-end">
            <div className="form-control flex-1">
              <label className="label py-1">
                <span className="label-text text-xs">API Key</span>
              </label>
              <input
                type="password"
                className="input input-bordered input-sm"
                value={config.anthropic?.apiKey || ''}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    anthropic: { apiKey: e.target.value },
                  }))
                }
                placeholder="sk-ant-..."
              />
            </div>
            <button
              className={`btn btn-sm btn-outline ${
                testStatus.anthropic === 'loading' ? 'loading' : ''
              }`}
              onClick={() => handleTest('anthropic')}
            >
              Test
            </button>
          </div>
        </div>
      </div>

      {/* Gemini */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body p-4">
          <h3 className="card-title text-sm flex justify-between items-center">
            Gemini
            {testStatus.gemini === 'success' && (
              <div className="badge badge-success badge-sm">OK</div>
            )}
            {testStatus.gemini === 'error' && (
              <div className="badge badge-error badge-sm">Errore</div>
            )}
          </h3>
          <div className="flex gap-2 items-end">
            <div className="form-control flex-1">
              <label className="label py-1">
                <span className="label-text text-xs">API Key</span>
              </label>
              <input
                type="password"
                className="input input-bordered input-sm"
                value={config.gemini?.apiKey || ''}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    gemini: { apiKey: e.target.value },
                  }))
                }
                placeholder="AIza..."
              />
            </div>
            <button
              className={`btn btn-sm btn-outline ${
                testStatus.gemini === 'loading' ? 'loading' : ''
              }`}
              onClick={() => handleTest('gemini')}
            >
              Test
            </button>
          </div>
        </div>
      </div>

      {/* Ollama */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body p-4">
          <h3 className="card-title text-sm flex justify-between items-center">
            Ollama
            {testStatus.ollama === 'success' && (
              <div className="badge badge-success badge-sm">OK</div>
            )}
            {testStatus.ollama === 'error' && (
              <div className="badge badge-error badge-sm">Errore</div>
            )}
          </h3>
          <div className="flex gap-2 items-end">
            <div className="form-control flex-1">
              <label className="label py-1">
                <span className="label-text text-xs">Base URL</span>
              </label>
              <input
                type="url"
                className="input input-bordered input-sm"
                value={config.ollama?.baseUrl || ''}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    ollama: { baseUrl: e.target.value },
                  }))
                }
                placeholder="http://localhost:11434"
              />
            </div>
            <button
              className={`btn btn-sm btn-outline ${
                testStatus.ollama === 'loading' ? 'loading' : ''
              }`}
              onClick={() => handleTest('ollama')}
            >
              Test
            </button>
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary w-full btn-sm"
        onClick={() => onSave?.(config)}
      >
        Salva configurazione
      </button>
    </div>
  );
}
