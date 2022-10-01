import create from "zustand";
import { dataSource } from "@/types";
import { useDBInstanceStore, useSearchConfigStore } from "@/stores";
import { getPrice, getRegionCode, getRegionName } from "@/utils";

interface State {
  dataSource: dataSource[];
  checkedDataRow: dataSource[];
  checkedRowKey: string[];
  refresh: () => void;
  refreshExpectedCost: () => void;
  sort: (sorter: (a: dataSource, b: dataSource) => number) => void;
}

export const useTableDataStore = create<State>()((set, get) => ({
  dataSource: [],
  checkedDataRow: [],
  checkedRowKey: [],
  refresh: () => {
    set({ dataSource: generateDataSource() });
  },
  refreshExpectedCost: () => {
    const { utilization, leaseLength } =
      useSearchConfigStore.getState().searchConfig;
    const dataSource = get().dataSource;
    dataSource.forEach((row) => {
      row.expectedCost = getPrice(row, utilization, leaseLength);
    });
    set({ dataSource });
  },
  sort: (sorter: (a: dataSource, b: dataSource) => number) => {
    const dataSource = get().dataSource;
    dataSource.sort(sorter);
    set({ dataSource });
  },
}));

const generateDataSource = (): dataSource[] => {
  let rowCount = 0;
  const dataSource: dataSource[] = [];
  const {
    cloudProvider,
    region,
    engineType,
    chargeType,
    minCPU,
    minRAM,
    utilization,
    leaseLength,
    keyword,
  } = useSearchConfigStore.getState().searchConfig;
  const dbInstanceList = useDBInstanceStore.getState().dbInstanceList;

  // If any of these three below is empty, display no table row.
  if (
    region.length === 0 ||
    engineType.length === 0 ||
    chargeType.length === 0
  ) {
    return [];
  }

  const cloudProviderSet = new Set(cloudProvider);
  const selectedRegionCodeSet = new Set(
    region.map((region) => getRegionCode(region)).flat()
  );
  const engineSet = new Set(engineType);
  const chargeTypeSet = new Set(chargeType);

  // Process each db instance.
  dbInstanceList.forEach((dbInstance) => {
    if (
      (minRAM !== undefined && Number(dbInstance.memory) < minRAM) ||
      (minCPU !== undefined && Number(dbInstance.cpu) < minCPU)
    ) {
      return;
    }

    if (!cloudProviderSet.has(dbInstance.cloudProvider)) {
      return;
    }

    const selectedRegionList = dbInstance.regionList.filter((region) =>
      selectedRegionCodeSet.has(region.code)
    );

    if (selectedRegionList.length === 0) {
      return;
    }

    const dataRowList: dataSource[] = [];
    const dataRowMap: Map<string, dataSource[]> = new Map();

    selectedRegionList.forEach((region) => {
      const selectedTermList = region.termList.filter(
        (term) =>
          chargeTypeSet.has(term.type) && engineSet.has(term.databaseEngine)
      );

      let basePriceMap = new Map<string, number>();
      selectedTermList.forEach((term) => {
        if (term.type === "OnDemand") {
          basePriceMap.set(term.databaseEngine, term.hourlyUSD);
        }
      });

      const regionName = getRegionName(region.code);
      selectedTermList.forEach((term) => {
        const regionInstanceKey = `${dbInstance.name}::${region.code}::${term.databaseEngine}`;
        const newRow: dataSource = {
          // set this later
          id: -1,
          // We use :: for separation because AWS use . and GCP use - as separator.
          key: `${dbInstance.name}::${region.code}::${term.code}`,
          // set this later
          childCnt: 0,
          childAfter: 0,
          acsendChildIndex: 0,
          descendChildIndex: 0,
          cloudProvider: dbInstance.cloudProvider,
          name: dbInstance.name,
          processor: dbInstance.processor,
          cpu: dbInstance.cpu,
          memory: dbInstance.memory,
          engineType: term.databaseEngine,
          commitment: { usd: term.commitmentUSD },
          hourly: { usd: term.hourlyUSD },
          leaseLength: term.payload?.leaseContractLength ?? "N/A",
          // We store the region code for each provider, and show the user the actual region information.
          // e.g. AWS's us-east-1 and GCP's us-east-4 are refer to the same region (N. Virginia)
          region: regionName,
          baseHourly: basePriceMap.get(term.databaseEngine) as number,
          // set this later
          expectedCost: 0,
        };
        newRow.expectedCost = getPrice(newRow, utilization, leaseLength);

        if (dataRowMap.has(regionInstanceKey)) {
          const existedDataRowList = dataRowMap.get(
            regionInstanceKey
          ) as dataSource[];
          newRow.id = existedDataRowList[0].id;
          existedDataRowList.push(newRow);
        } else {
          rowCount++;
          newRow.id = rowCount;
          dataRowMap.set(regionInstanceKey, [newRow]);
        }
      });
    });

    dataRowMap.forEach((rows) => {
      rows.sort((a, b) => {
        // Sort rows according to the following criterion:
        // 1. On demand price goes first.
        // 2. Sort on expected cost.
        if (a.leaseLength === "N/A") {
          return -1;
        } else if (b.leaseLength === "N/A") {
          return 1;
        }

        return a.expectedCost - b.expectedCost;
      });
      rows.forEach((row, index) => {
        row.childCnt = rows.length;
        row.acsendChildIndex = index;
        row.descendChildIndex = rows.length - index - 1;
        row.childAfter = rows.length - index;
      });
      dataRowList.push(...rows);
    });

    const searchKey = keyword?.toLowerCase();
    if (searchKey) {
      // filter by keyword
      const filteredDataRowList: dataSource[] = dataRowList.filter(
        (row) =>
          row.name.toLowerCase().includes(searchKey) ||
          row.memory.toLowerCase().includes(searchKey) ||
          row.processor.toLowerCase().includes(searchKey) ||
          row.region.toLowerCase().includes(searchKey)
      );
      dataSource.push(...filteredDataRowList);
      return;
    }

    dataSource.push(...dataRowList);
  });

  return dataSource;
};
