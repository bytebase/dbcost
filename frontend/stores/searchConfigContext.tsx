import {
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { SearchConfig, SearchConfigDefault } from "@/types";

const SearchConfigContext = createContext<ContextStore>({
  searchConfig: SearchConfigDefault,
  isFiltering: () => false,
  reset: () => null,
  clear: () => null,
  update: () => null,
});

interface ProviderProps {
  children: React.ReactNode;
}

interface ContextStore {
  searchConfig: SearchConfig;
  isFiltering: () => boolean;
  reset: () => void;
  clear: () => void;
  update: <K extends keyof SearchConfig>(
    field: K,
    value: SearchConfig[K]
  ) => void;
}

export const SearchConfigContextProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const [searchConfig, setSearchConfig] =
    useState<SearchConfig>(SearchConfigDefault);

  const { Provider } = SearchConfigContext;

  const isFiltering = useCallback(
    (): boolean =>
      searchConfig.keyword.length > 0 ||
      searchConfig.minCPU > 0 ||
      searchConfig.minRAM > 0 ||
      searchConfig.chargeType.length < 2,
    [
      searchConfig.chargeType.length,
      searchConfig.keyword.length,
      searchConfig.minCPU,
      searchConfig.minRAM,
    ]
  );

  const reset = useCallback(() => {
    setSearchConfig({ ...SearchConfigDefault });
  }, []);

  const clear = useCallback(() => {
    setSearchConfig({
      chargeType: [],
      cloudProvider: [],
      engineType: [],
      keyword: "",
      minCPU: 0,
      minRAM: 0,
      region: [],
      utilization: SearchConfigDefault.utilization,
      leaseLength: SearchConfigDefault.leaseLength,
    });
  }, []);

  const update = useCallback(
    <K extends keyof SearchConfig>(field: K, value: SearchConfig[K]) => {
      setSearchConfig((state) => ({
        ...state,
        [field]: value,
      }));
    },
    []
  );

  const searchConfigContextStore: ContextStore = useMemo(
    () => ({
      searchConfig,
      isFiltering,
      reset,
      clear,
      update,
    }),
    [clear, isFiltering, reset, searchConfig, update]
  );

  return <Provider value={searchConfigContextStore}>{children}</Provider>;
};

export const useSearchConfigContext = () =>
  useContext<ContextStore>(SearchConfigContext);
