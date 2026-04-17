import { useMemo } from 'react';
import { useWise } from './WiseProvider';
import { ProviderName } from '../core/types';

interface ModelSelectorProps {
  value: string | null;
  onChange: (modelId: string, provider: ProviderName) => void;
  providers?: ProviderName[];
  className?: string;
}

export function ModelSelector({
  value,
  onChange,
  providers: allowedProviders,
  className = '',
}: ModelSelectorProps) {
  const { models, isLoading, error } = useWise();

  const groupedModels = useMemo(() => {
    const filtered = allowedProviders
      ? models.filter((m) => allowedProviders.includes(m.provider))
      : models;

    return filtered.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    }, {} as Record<ProviderName, typeof models>);
  }, [models, allowedProviders]);

  if (isLoading && models.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="loading loading-spinner loading-sm"></span>
        <span className="text-sm opacity-70">Caricamento modelli...</span>
      </div>
    );
  }

  if (error && models.length === 0) {
    return (
      <div className={`text-error text-sm ${className}`}>Errore: {error}</div>
    );
  }

  return (
    <select
      className={`select select-bordered w-full ${className}`}
      value={value || ''}
      onChange={(e) => {
        const modelId = e.target.value;
        const model = models.find((m) => m.id === modelId);
        if (model) {
          onChange(model.id, model.provider);
        }
      }}
    >
      <option value="" disabled>
        Seleziona un modello
      </option>
      {(Object.entries(groupedModels) as [ProviderName, typeof models][]).map(
        ([provider, providerModels]) => (
          <optgroup key={provider} label={provider.toUpperCase()}>
            {providerModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </optgroup>
        )
      )}
    </select>
  );
}
