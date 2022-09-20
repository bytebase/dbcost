import create from "zustand";
import { SearchConfig, SearchConfigDefault } from "@/types";

interface State {
  searchConfig: SearchConfig;
  reset: () => void;
  clear: () => void;
  update: <K extends keyof SearchConfig>(
    field: K,
    value: SearchConfig[K]
  ) => void;
}

export const useSearchConfigStore = create<State>()((set) => ({
  searchConfig: { ...SearchConfigDefault },
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
        minCPU: undefined,
        minRAM: undefined,
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
