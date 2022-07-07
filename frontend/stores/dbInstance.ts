import { defineStore } from "pinia";
import { AvailableRegion, DBInstance, DBInstanceId, Region } from "../types";
import { getRegionName } from "../util";
interface State {
  dbInstanceList: DBInstance[];
}

export default defineStore("dbInstance", {
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
      const regionMap = new Map<string, Map<string, string>>();
      state.dbInstanceList.forEach((db) => {
        db.regionList.forEach((region: Region) => {
          const regionName = getRegionName(region.code);
          if (!regionMap.has(regionName)) {
            const newMap = new Map<string, string>();
            regionMap.set(regionName, newMap);
          }

          regionMap.get(regionName)?.set(db.cloudProvider, region.code);
        });
      });

      const availableRegionList: AvailableRegion[] = [];
      regionMap.forEach((providerCode, regionName) => {
        availableRegionList.push({
          name: regionName,
          providerCode: providerCode,
        });
      });

      return availableRegionList.sort(
        (a: AvailableRegion, b: AvailableRegion) => {
          if (a.name.includes("Other")) {
            return 1;
          } else if (b.name.includes("Other")) {
            return -1;
          }
          return a.name.localeCompare(b.name);
        }
      );
    },

    getAvailableRegionSet: (state) => (): Set<string> => {
      const regionSet = new Set<string>();
      state.dbInstanceList.forEach((db) => {
        db.regionList.forEach((region) => {
          regionSet.add(getRegionName(region.code));
        });
      });

      return regionSet;
    },
  },

  actions: {
    async loadDBInstanceList() {
      let sourceFileName = "dbInstance.json";

      const data = import.meta.glob(`../../data/*.json`);
      for (const path in data) {
        if (path.includes(sourceFileName)) {
          data[path]().then((mod) => {
            this.dbInstanceList = mod.default;
          });
        }
      }
    },
  },
});
