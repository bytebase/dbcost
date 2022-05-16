import { CloudProvider, EngineType } from "./common";
import { ChargeType } from "./term";

export type SearchConfig = {
  cloudProvider?: CloudProvider[];
  engineType?: EngineType[];
  chargeType?: ChargeType[];
  region?: string[];
  minCPU?: number;
  minRAM?: number;
  keyword?: string;
};

export const SearchConfigDefault: SearchConfig = {
  cloudProvider: ["AWS", "GCP"],
  engineType: ["MYSQL"],
  chargeType: ["OnDemand"],
  region: ["US East (N. Virginia)"],
};
