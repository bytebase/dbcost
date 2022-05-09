import CostTable from "./CostTable.vue";
export default CostTable;

export type DataRow = {
  id: number;
  key: string;

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
