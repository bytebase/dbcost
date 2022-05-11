import { CloudProvider } from "../../types";
import CostTable from "./CostTable.vue";
export type DataRow = {
  id: number;

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

  childCnt: number;
};

export default CostTable;
