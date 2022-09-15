import create from "zustand";
import { SearchConfig, SearchConfigDefault } from "@/types";

interface State {
  searchConfig: SearchConfig;
  reset: () => void;
  clear: () => void;
  setRegion: (regionList: string[]) => void;
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
  setRegion: (regionList: string[]) => {
    set((state) => ({
      ...state,
      searchConfig: {
        ...state.searchConfig,
        region: regionList,
      },
    }));
  },
}));
