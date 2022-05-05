import { defineStore } from "pinia";
import { AvailableRegion, DBInstance, DBInstanceId } from "../types";

interface State {
  dbInstanceList: DBInstance[];
}

export const useDBInstanceStore = defineStore("dbInstance", {
  state: (): State => ({
    dbInstanceList: [],
  }),

  getters: {
    getDBInstanceById:
      (state) =>
      (dbInstanceId: DBInstanceId): DBInstance | null => {
        const dbInstance = state.dbInstanceList.filter((ele) => {
          ele.id === dbInstanceId;
        });
        if (dbInstance.length === 0) {
          return null;
        }
        return dbInstance[0];
      },
    getAvailableRegionList: (state) => (): AvailableRegion[] => {
      const regionMap = new Map<string, Set<string>>();

      state.dbInstanceList.forEach((db) => {
        db.regionList.forEach((r) => {
          if (regionMap.has(r.name)) {
            regionMap.get(r.name)?.add(db.cloudProvider);
          } else {
            regionMap.set(r.name, new Set<string>(db.cloudProvider));
          }
        });
      });

      const regionList: AvailableRegion[] = [];
      regionMap.forEach((providerSet, regionName) => {
        regionList.push({ name: regionName, provider: providerSet });
      });

      return regionList;
    },
  },

  actions: {
    loadDBInstanceList() {
      const receiver = [];
    },
  },
});
