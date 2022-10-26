import {
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { getRegionName } from "@/utils";
import { AvailableRegion, DBInstance, DBInstanceId, Region } from "@/types";

const DBInstanceContext = createContext<ContextStore>({
  dbInstanceList: [],
  // getters
  getDBInstanceById: () => null,
  getAvailableRegionList: () => [],
  getAvailableRegionSet: () => new Set(),
  // actions
  loadDBInstanceList: () => null,
});

interface ProviderProps {
  children: React.ReactNode;
}

interface ContextStore {
  dbInstanceList: DBInstance[];
  // getters
  getDBInstanceById: (id: DBInstanceId) => DBInstance | null;
  getAvailableRegionList: () => AvailableRegion[];
  getAvailableRegionSet: () => Set<string>;
  // actions
  loadDBInstanceList: () => void;
}

export const DBInstanceContextProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const [dbInstanceList, setDBInstanceList] = useState<DBInstance[]>([]);

  const { Provider } = DBInstanceContext;

  const getDBInstanceById = useCallback(
    (dbInstanceId: DBInstanceId): DBInstance | null => {
      const dbInstance = dbInstanceList.filter((db) => {
        db.id === dbInstanceId;
      });
      if (dbInstance.length === 0) {
        return null;
      }
      return dbInstance[0];
    },
    [dbInstanceList]
  );

  const getAvailableRegionList = useCallback((): AvailableRegion[] => {
    const regionMap = new Map<string, Map<string, string>>();
    dbInstanceList.forEach((db) => {
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
  }, [dbInstanceList]);

  const getAvailableRegionSet = useCallback((): Set<string> => {
    const regionSet = new Set<string>();
    dbInstanceList.forEach((db) => {
      db.regionList.forEach((region) => {
        regionSet.add(getRegionName(region.code));
      });
    });

    return regionSet;
  }, [dbInstanceList]);

  const loadDBInstanceList = useCallback(async () => {
    const data = (await import("@data")).default as DBInstance[];
    setDBInstanceList(data);
  }, []);

  const dbInstanceContextStore: ContextStore = useMemo(
    () => ({
      dbInstanceList,
      getDBInstanceById,
      getAvailableRegionList,
      getAvailableRegionSet,
      loadDBInstanceList,
    }),
    [
      dbInstanceList,
      getAvailableRegionList,
      getAvailableRegionSet,
      getDBInstanceById,
      loadDBInstanceList,
    ]
  );

  return <Provider value={dbInstanceContextStore}>{children}</Provider>;
};

export const useDBInstanceContext = () =>
  useContext<ContextStore>(DBInstanceContext);
