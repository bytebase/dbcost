import { Term } from "./term";
import { useDBInstanceStore } from "../stores";

export type Region = {
  code: string;
  termList: Term[];
};

export type AvailableRegion = {
  name: string;
  // providerCode is the mapping between between provider and the region code
  // e.g. N. Virginia is coded 'us-east-1' in AWS,  us-east4 in GCP
  providerCode: Map<string, string>;
};

export const isValidRegion = (regionList: string[]): boolean => {
  const availableRegionSet = useDBInstanceStore().getAvailableRegionSet();
  for (const idx in regionList) {
    const region = regionList[idx];
    if (!availableRegionSet.has(region)) {
      return true;
    }
  }

  return false;
};
