import { defineStore } from "pinia";
import { DBInstance, DBInstanceId } from "../types";

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
    getAvailableRegionList: (state) => (): string[] => {
      const regionSet = new Set<string>();
      state.dbInstanceList.forEach((db) => {
        db.regionList.forEach((r) => {
          regionSet.add(r.name);
        });
      });
      const regionList: string[] = [];
      regionSet.forEach((r) => {
        regionList.push(r);
      });
      regionList.sort();
      return regionList;
    },
  },

  actions: {
    loadDBInstanceList() {
      const receiver = [];
    },
  },
});
