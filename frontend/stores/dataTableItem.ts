import { defineStore } from "pinia";
import { DataRow } from "../types";
import { getPrice, getRegionCode, getRegionName } from "../util";
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
    refreshExpectedCost() {
      const config = useSearchConfigStore().searchConfig;
      for (const item of this.dataRow) {
        item.expectedCost = getPrice(
          item,
          config.utilization,
          config.leaseLength
        );
      }
    },
    removeCheckedDataRowByKey(rowKey: string) {
      this.checkedRowKey = this.checkedRowKey.filter((key) => key !== rowKey);
      this.checkedDataRow = this.checkedDataRow.filter(
        (dataRow) => dataRow.key !== rowKey
      );
    },
    loadCheckedDataRowByKey(rowKeys: string[]) {
      let isNewlyEnter = false;

      const storedRowKeySet = new Set<string>(this.checkedRowKey);
      for (const key of rowKeys) {
        if (!storedRowKeySet.has(key)) {
          isNewlyEnter = true;
        }
      }

      if (!isNewlyEnter) {
        return;
      }

      const instanceNameMap = new Map<string, string[]>();
      for (const key of rowKeys) {
        // key == `${dbInstance.name}::${region.code}::${term.code}`
        const name = key.split("::")[0];
        if (instanceNameMap.has(name)) {
          instanceNameMap.get(name)?.push(key);
        }
        instanceNameMap.set(name, [key]);
      }

      const dbInstanceStore = useDBInstanceStore();
      dbInstanceStore.loadDBInstanceList();

      const dbInstances = dbInstanceStore.dbInstanceList.filter(
        (dbInstance) => {
          return instanceNameMap.has(dbInstance.name);
        }
      );

      const checkedDataRow = [];
      let cnt = 0;
      for (const dbInstance of dbInstances) {
        const keys = instanceNameMap.get(dbInstance.name) as string[];
        for (const key of keys) {
          const regionCode = key.split("::")[1];
          const region = dbInstance.regionList.filter((region) => {
            return region.code === regionCode;
          })[0];

          const termCode = key.split("::")[2];
          const term = region.termList.filter((term) => {
            return term.code === termCode;
          })[0];

          const newRow: DataRow = {
            id: cnt,
            key: key,
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
            region: getRegionName(regionCode),
            // we do not show user the diff at the compare page
            baseHourly: 0,
            expectedCost: 0,
          };
          checkedDataRow.push(newRow);
          cnt++;
        }
      }

      this.checkedRowKey = rowKeys;
      this.checkedDataRow = checkedDataRow;
    },
    addCheckedDataRowByKey(rowKey: string) {
      this.checkedRowKey.push(rowKey);
      const newAddedDataRow = this.dataRow.filter((row) => row.key === rowKey);
      this.checkedDataRow.push(...newAddedDataRow);
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

      let basePriceMap = new Map<string, number>();
      selectedTermList.forEach((term) => {
        if (term.type === "OnDemand") {
          basePriceMap.set(term.databaseEngine, term.hourlyUSD);
        }
      });

      const regionName = getRegionName(region.code);
      selectedTermList.forEach((term) => {
        const regionInstanceKey = `${dbInstance.name}::${region.code}::${term.databaseEngine}`;
        if (term.type === "OnDemand") {
        }
        const newRow: DataRow = {
          id: -1,
          // we use :: for separation because AWS use . and GCP use - as separator.
          key: `${dbInstance.name}::${region.code}::${term.code}`,
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
          baseHourly: basePriceMap.get(term.databaseEngine) as number,
          // we set this field
          expectedCost: 0,
        };
        newRow.expectedCost = getPrice(
          newRow,
          config.utilization,
          config.leaseLength
        );

        if (dataRowMap.has(regionInstanceKey)) {
          const existedDataRowList = dataRowMap.get(
            regionInstanceKey
          ) as DataRow[];
          newRow.id = existedDataRowList[0].id;
          existedDataRowList.push(newRow);
        } else {
          rowCnt++;
          newRow.id = rowCnt;
          dataRowMap.set(regionInstanceKey, [newRow]);
        }
      });
    });

    dataRowMap.forEach((val) => {
      val.sort((a, b) => {
        // sort the row according to the following criterion:
        // 1. on demand price go first
        // 2. sort on their expected cost
        if (a.leaseLength === "N/A") {
          return -1;
        } else if (b.leaseLength === "N/A") {
          return 1;
        }

        return a.expectedCost - b.expectedCost;
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
