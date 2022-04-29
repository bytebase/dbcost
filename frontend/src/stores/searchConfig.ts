import { defineStore } from "pinia";
import { SearchConfig, SearchConfigDefault, SearchConfigEmpty } from "../types";

interface State {
  searchConfig: SearchConfig;
}

export const useSearchConfigStore = defineStore("searchConfig", {
  state: (): State => ({
    searchConfig: SearchConfigDefault,
  }),
  actions: {
    clearAll() {
      this.searchConfig = SearchConfigEmpty;
    },
  },
});
