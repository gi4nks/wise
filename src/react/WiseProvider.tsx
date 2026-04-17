import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  WiseConfig,
  ModelInfo,
} from '../core/types';
import { listAllModels } from '../core/factory';

interface WiseContextValue {
  config: WiseConfig;
  updateConfig: (patch: Partial<WiseConfig>) => void;
  models: ModelInfo[];
  isLoading: boolean;
  error: string | null;
  refreshModels: () => Promise<void>;
}

const WiseContext = createContext<WiseContextValue | undefined>(undefined);

export function WiseProvider({
  config: initialConfig,
  children,
}: {
  config: WiseConfig;
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<WiseConfig>(initialConfig);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConfig = useCallback((patch: Partial<WiseConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const refreshModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedModels = await listAllModels(config);
      setModels(fetchedModels);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch models');
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    refreshModels();
  }, [refreshModels]);

  return (
    <WiseContext.Provider
      value={{
        config,
        updateConfig,
        models,
        isLoading,
        error,
        refreshModels,
      }}
    >
      {children}
    </WiseContext.Provider>
  );
}

export function useWise() {
  const context = useContext(WiseContext);
  if (context === undefined) {
    throw new Error('useWise must be used within a WiseProvider');
  }
  return context;
}
