import { defineStore } from "pinia";
import { SearchConfig, SearchConfigDefault } from "../types";

interface State {
  searchConfig: SearchConfig;
}

export const useSearchConfigStore = defineStore("searchConfig", {
  state: (): State => ({
    searchConfig: SearchConfigDefault,
  }),
  actions: {
    clearAll() {
      this.searchConfig.chargeType = [];
      this.searchConfig.cloudProvider = [];
      this.searchConfig.engineType = [];
      this.searchConfig.keyword = "";
      this.searchConfig.minCPU = undefined;
      this.searchConfig.minRAM = undefined;
      this.searchConfig.region = [];
    },
  },
});
