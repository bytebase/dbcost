import { Term } from "./term";
import { useDBInstanceStore } from "../stores/dbInstance";

export type Region = {
  name: string;
  termList: Term[];
};

export const isValidRegion = (regionList: string[]): boolean => {
  const availableRegion = useDBInstanceStore().getAvailableRegionList();
  const regionSet: Set<String> = new Set<String>(availableRegion);
  regionList.forEach((region) => {
    if (!regionSet.has(region)) {
      return false;
    }
  });

  return true;
};
