import { CloudProvider } from "./common";

export interface dataSource {
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

  // childCnt is used as table row span length
  childCnt: number;
  // childAfter is the count of row span length after this row
  childAfter: number;
  acsendChildIndex: number;
  descendChildIndex: number;
  // baseHourly is the on demand hourly price of the instance in the same region
  baseHourly: number;
  // expectedCost is the expected cost with lease length and utilization
  expectedCost: number;
}
