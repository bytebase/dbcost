import CostTable from "./CostTable.vue";
import { CloudProvider } from "../../types";
type DataRow = {
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

export { CostTable, DataRow };
