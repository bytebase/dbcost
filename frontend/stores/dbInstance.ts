import create from "zustand";
import { AvailableRegion, DBInstance, DBInstanceId, Region } from "@/types";
import { getRegionName } from "@/util";

interface State {
  dbInstanceList: DBInstance[];
  // getters
  getDBInstanceById: (id: DBInstanceId) => DBInstance | null;
  getAvailableRegionList: () => AvailableRegion[];
  getAvailableRegionSet: () => Set<string>;
  // actions
  loadDBInstanceList: () => void;
}

export const useDBInstanceStore = create<State>()((set, get) => ({
  dbInstanceList: [],
  getDBInstanceById: (dbInstanceId: DBInstanceId): DBInstance | null => {
    const dbInstance = get().dbInstanceList.filter((db) => {
      db.id === dbInstanceId;
    });
    if (dbInstance.length === 0) {
      return null;
    }
    return dbInstance[0];
  },
  getAvailableRegionList: (): AvailableRegion[] => {
    const regionMap = new Map<string, Map<string, string>>();
    get().dbInstanceList.forEach((db) => {
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
  getAvailableRegionSet: (): Set<string> => {
    const regionSet = new Set<string>();
    get().dbInstanceList.forEach((db) => {
      db.regionList.forEach((region) => {
        regionSet.add(getRegionName(region.code));
      });
    });

    return regionSet;
  },
  loadDBInstanceList: async () => {
    let sourceFileName = "dbInstance.json";
    const { default: data } = await import(`../../data/${sourceFileName}`);
    set({ dbInstanceList: data });
  },
}));

export const useAvailableRegionList = () =>
  useDBInstanceStore((state) => state.getAvailableRegionList());
