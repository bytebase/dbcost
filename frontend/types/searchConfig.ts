import { CloudProvider, EngineType } from "./common";
import { ChargeType } from "./term";

export enum SearchBarType {
  DASHBOARD = "dashboard",
  INSTANCE_DETAIL = "instanceDetail",
  REGION_DETAIL = "regionDetail",
}

export type SearchConfig = {
  cloudProvider?: CloudProvider[];
  engineType: EngineType[];
  chargeType: ChargeType[];
  region: string[];
  minCPU: number;
  minRAM: number;
  keyword: string;
  utilization: number;
  leaseLength: number;
};

export const SearchConfigDefault: SearchConfig = {
  cloudProvider: ["AWS"],
  engineType: ["MYSQL"],
  chargeType: ["OnDemand", "Reserved"],
  region: ["US East (N. Virginia)"],
  keyword: "",
  minCPU: 0,
  minRAM: 0,
  utilization: 1,
  leaseLength: 1,
};
