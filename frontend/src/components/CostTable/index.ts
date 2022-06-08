import CostTable from "./CostTable.vue";
import { CloudProvider } from "../../types";
type DataRow = {
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
};

export { CostTable, DataRow };
