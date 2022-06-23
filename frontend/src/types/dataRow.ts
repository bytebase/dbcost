import { CloudProvider } from "./common";

export type DataRow = {
  id: number;
  key: string;

  cloudProvider: CloudProvider;
  name: string;
  processor: string;
  cpu: number;
  memory: string;
  leaseLength: string;
  region: string;
  engineType: string;
  commitment: { usd: number };
  hourly: { usd: number };

  // childCnt is for calculating the number of col needed to collapse
  childCnt: number;
  // baseHourly is the on demand hourly price of the instance in the same region
  baseHourly: number;
  // expectedCost is the expected cost with lease length and utilization
  expectedCost: number;
};
