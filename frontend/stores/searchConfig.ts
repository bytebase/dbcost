import create from "zustand";
import { SearchConfig, SearchConfigDefault } from "@/types";

interface State {
  searchConfig: SearchConfig;
  isFiltering: () => boolean;
  reset: () => void;
  clear: () => void;
  update: <K extends keyof SearchConfig>(
    field: K,
    value: SearchConfig[K]
  ) => void;
}

export const useSearchConfigStore = create<State>()((set, get) => ({
  searchConfig: { ...SearchConfigDefault },
  isFiltering: () => {
    const searchConfig = get().searchConfig;
    return (
      searchConfig.keyword.length > 0 ||
      searchConfig.minCPU > 0 ||
      searchConfig.minRAM > 0 ||
      searchConfig.chargeType.length < 2
    );
  },
  reset: () => {
    set({ searchConfig: { ...SearchConfigDefault } });
  },
  clear: () => {
    set({
      searchConfig: {
        chargeType: [],
        cloudProvider: [],
        engineType: [],
        keyword: "",
        minCPU: 0,
        minRAM: 0,
        region: [],
        utilization: SearchConfigDefault.utilization,
        leaseLength: SearchConfigDefault.leaseLength,
      },
    });
  },
  // actions
  update: <K extends keyof SearchConfig>(field: K, value: SearchConfig[K]) => {
    set((state) => ({
      searchConfig: {
        ...state.searchConfig,
        [field]: value,
      },
    }));
  },
}));
