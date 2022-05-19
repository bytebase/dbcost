import { defineStore } from "pinia";
import { DataRow } from "../components/CostTable";
import { getRegionCode, getRegionName } from "../util";
import { useSearchConfigStore, useDBInstanceStore } from ".";

interface State {
  dataRow: DataRow[];
  checkedDataRow: DataRow[];
  checkedRowKey: string[];
}

export default defineStore("dataTableItem", {
  state: (): State => ({
    dataRow: [],
    checkedDataRow: [],
    checkedRowKey: [],
  }),
  actions: {
    refresh() {
      this.dataRow = _generateDataRow();
    },
    removeCheckedDataRowByKey(rowKeys: string) {
      this.checkedRowKey = this.checkedRowKey.filter((key) => {
        return key !== rowKeys;
      });
      this.refreshChecked(this.checkedRowKey);
    },
    refreshChecked(rowKeys: string[]) {
      const rowKeySet = new Set<string>(rowKeys);
      const _checkedDataRow = this.dataRow.filter((row: DataRow) =>
        rowKeySet.has(row.key)
      );
      _checkedDataRow.forEach((row) => {
        // cancel the aggregation of the col.
        row.childCnt = 1;
      });

      this.checkedRowKey = rowKeys;
      this.checkedDataRow = _checkedDataRow;
    },
    clearDataRow() {
      this.dataRow = [];
    },
    clearAll() {
      this.dataRow = [];
      this.checkedRowKey = [];
    },
  },
});

const _generateDataRow = (): DataRow[] => {
  let rowCnt = 0;
  const res: DataRow[] = [];
  const config = useSearchConfigStore().searchConfig;
  const dbInstanceList = useDBInstanceStore().dbInstanceList;

  if (!config.region && !config.engineType && !config.chargeType) {
    return [];
  }

  const regionCodeList: string[] = [];
  config.region?.forEach((regionName) => {
    regionCodeList.push(...getRegionCode(regionName));
  });
  const cloudProviderSet = new Set(config.cloudProvider);
  const selectedRegionCodeSet = new Set(regionCodeList);
  const engineSet = new Set(config.engineType);
  const chargeTypeSet = new Set(config.chargeType);

  dbInstanceList.forEach((dbInstance) => {
    if (
      (config.minRAM && Number(dbInstance.memory) < config.minRAM) ||
      (config.minCPU && Number(dbInstance.cpu) < config.minCPU)
    ) {
      return;
    }

    if (!cloudProviderSet.has(dbInstance.cloudProvider)) {
      return;
    }

    const selectedRegionList = dbInstance.regionList.filter((region) => {
      if (selectedRegionCodeSet.has(region.code)) {
        return true;
      }
      return false;
    });
    // no region found
    if (selectedRegionList.length === 0) {
      return;
    }

    const dataRowList: DataRow[] = [];
    const dataRowMap: Map<string, DataRow[]> = new Map();

    // filter terms provided in each region
    selectedRegionList.forEach((region) => {
      const selectedTermList = region.termList.filter((term) => {
        if (
          chargeTypeSet.has(term.type) &&
          engineSet.has(term.databaseEngine)
        ) {
          return true;
        }
        return false;
      });

      const regionName = getRegionName(region.code);
      selectedTermList.forEach((term) => {
        const key = `${dbInstance.name}-${region.code}`;
        const newRow: DataRow = {
          id: -1,
          key: term.code,
          childCnt: 1,
          cloudProvider: dbInstance.cloudProvider,
          name: dbInstance.name,
          processor: dbInstance.processor,
          cpu: dbInstance.cpu,
          memory: dbInstance.memory,
          engineType: term.databaseEngine,
          commitment: { usd: term.commitmentUSD },
          hourly: { usd: term.hourlyUSD },
          leaseLength: term.payload?.leaseContractLength ?? "N/A",
          // we store the region code for each provider, and show the user the actual region information
          // e.g. AWS's us-east-1 and GCP's us-east-4 are refer to the same region (N. Virginia)
          region: regionName,
        };

        if (dataRowMap.has(key)) {
          const existedDataRowList = dataRowMap.get(key) as DataRow[];
          newRow.id = existedDataRowList[0].id;
          existedDataRowList.push(newRow);
        } else {
          rowCnt++;
          newRow.id = rowCnt;
          dataRowMap.set(key, [newRow]);
        }
      });
    });

    dataRowMap.forEach((val) => {
      val.sort((a, b) => {
        // sort the row according to the following criteria
        // 1. charge type
        // 2. ascend by lease length
        if (a.leaseLength == "N/A") {
          return -1;
        } else if (b.leaseLength == "N/A") {
          return 1;
        }
        return Number(a.leaseLength[0]) - Number(b.leaseLength[0]);
      });
      val[0].childCnt = val.length;
      dataRowList.push(...val);
    });

    // filter by keyword, we only enable this when the keyword is set by user
    const keyword = config.keyword?.toLowerCase();
    if (keyword) {
      const filteredDataRowList: DataRow[] = dataRowList.filter((row) => {
        if (
          row.name.toLowerCase().includes(keyword) ||
          row.memory.toLowerCase().includes(keyword) ||
          row.processor.toLowerCase().includes(keyword) ||
          row.region.toLowerCase().includes(keyword)
        ) {
          return true;
        }
        return false;
      });
      res.push(...filteredDataRowList);
      return;
    }

    res.push(...dataRowList);
  });

  return res;
};
