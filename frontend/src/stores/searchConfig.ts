import { defineStore } from "pinia";
import { SearchConfig, SearchConfigDefault } from "../types";

interface State {
  searchConfig: SearchConfig;
}

export default defineStore("searchConfig", {
  state: (): State => ({
    searchConfig: { ...SearchConfigDefault },
  }),
  actions: {
    setToDefault() {
      this.searchConfig.chargeType = SearchConfigDefault.chargeType;
      this.searchConfig.cloudProvider = SearchConfigDefault.cloudProvider;
      this.searchConfig.engineType = SearchConfigDefault.engineType;
      this.searchConfig.keyword = SearchConfigDefault.keyword;
      this.searchConfig.minCPU = SearchConfigDefault.minCPU;
      this.searchConfig.minRAM = SearchConfigDefault.minRAM;
      this.searchConfig.region = SearchConfigDefault.region;
      this.searchConfig.utilization = SearchConfigDefault.utilization;
      this.searchConfig.leaseLength = SearchConfigDefault.leaseLength;
    },
    clearAll() {
      this.searchConfig.chargeType = [];
      this.searchConfig.cloudProvider = [];
      this.searchConfig.engineType = [];
      this.searchConfig.keyword = "";
      this.searchConfig.minCPU = undefined;
      this.searchConfig.minRAM = undefined;
      this.searchConfig.region = [];
      this.searchConfig.utilization = SearchConfigDefault.utilization;
      this.searchConfig.leaseLength = SearchConfigDefault.leaseLength;
    },
  },
});
