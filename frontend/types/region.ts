import { Term } from "./term";

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
