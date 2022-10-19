import { CloudProvider, EngineType } from "./common";

export interface DataSource {
  id: number;
  key: string;

  cloudProvider: CloudProvider;
  name: string;
  processor: string;
  cpu: number;
  memory: string;
  leaseLength: string;
  region: string;
  engineType: EngineType;
  commitment: { usd: number };
  hourly: { usd: number };

  // childCnt is used as table row span length
  childCnt: number;
  // baseHourly is the on demand hourly price of the instance in the same region
  baseHourly: number;
  // expectedCost is the expected cost with lease length and utilization
  expectedCost: number;
}

export enum TableType {
  DASHBOARD = "dashboard",
  INSTANCE_DETAIL = "instanceDetail",
  REGION_DETAIL = "regionDetail",
}

export interface RelatedType {
  name: string;
  CPU: number;
  memory: number;
}
