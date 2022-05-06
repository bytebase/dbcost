import { Term } from "./term";
import { useDBInstanceStore } from "../stores/dbInstance";

export type Region = {
  name: string;
  termList: Term[];
};

export type AvailableRegion = {
  name: string;
  provider: Set<string>;
};

export const isValidRegion = (regionList: string[]): boolean => {
  const availableRegion = useDBInstanceStore().getAvailableRegionList();
  const regionSet: Set<String> = new Set<String>();
  availableRegion.forEach((region) => {
    regionSet.add(region.name);
  });

  for (const region in regionList) {
    if (!regionSet.has(region)) {
      return false;
    }
  }

  return true;
};
