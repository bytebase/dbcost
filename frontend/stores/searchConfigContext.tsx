import {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import isEmpty from "lodash/isEmpty";
import { processParsedUrlQuery } from "@/utils";
import { SearchConfig, SearchConfigDefault, SearchConfigEmpty } from "@/types";

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
  const router = useRouter();
  const [searchConfig, setSearchConfig] =
    useState<SearchConfig>(SearchConfigDefault);

  useEffect(() => {
    if (router.query) {
      if (isEmpty(router.query)) {
        // If no query specified, use default search config.
        setSearchConfig(SearchConfigDefault);
      } else {
        // Else, use as query specified.
        setSearchConfig({
          ...SearchConfigEmpty,
          ...processParsedUrlQuery(router.query),
        });
      }
    }
  }, [router.query]);

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
    router.push({ pathname: router.pathname, query: {} }, undefined, {
      shallow: true,
    });
  }, [router]);

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
      setSearchConfig((state) => {
        const newState = {
          ...state,
          [field]: value,
        };

        // update URL query string after search config change
        router.push(
          {
            pathname: router.pathname,
            query: newState,
          },
          undefined,
          // use shallow-routing to avoid page reload
          { shallow: true }
        );

        return newState;
      });
    },
    [router]
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
