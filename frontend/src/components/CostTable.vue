<template>
  <n-data-table :columns="columns" :data="state.dataRow" />
</template>

<script setup lang="ts">
import { NDataTable, NAvatar, NTag } from "naive-ui";
import { DBInstance } from "../types/dbInstance";
import { PropType, watch, reactive, onMounted, h, computed } from "vue";
import { SearchConfig } from "../types";
import { RowData } from "naive-ui/lib/data-table/src/interface";

const EngineIconRender = {
  MYSQL: h(
    NAvatar,
    {
      src: new URL("../assets/icon/db-mysql.png", import.meta.url).href,
      size: 16,
      color: "none",
    },
    {}
  ),
  POSTGRES: h(
    NAvatar,
    {
      src: new URL("../assets/icon/db-postgres.png", import.meta.url).href,
      size: 16,
      color: "none",
    },
    {}
  ),
};

type DataRow = {
  id: number;

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

// pricingContent is the col of the pricing, we need to dynamic render this section.
// e.g. when user only select single engine, the engine icon is unnecessary
const pricingContent = {
  engine: {
    title: "Engine",
    align: "center",
    render: (row: RowData) => {
      if (row.engineType == "MYSQL") {
        return EngineIconRender.MYSQL;
      }
      return EngineIconRender.POSTGRES;
    },
  },
  commitment: {
    title: "Commitment",
    align: "right",
    render: (row: RowData) => {
      return `$${row.commitment.usd}`;
    },
  },
  hourlyPay: {
    title: "Hourly Pay",
    align: "right",
    render: (row: RowData) => {
      return `$${row.hourly.usd.toFixed(2)}`;
    },
  },
  leaseLength: {
    title: "Lease Length",
    key: "leaseLength",
    align: "right",
  },
};

// the order of the array will affect the order of the column of the table
// the desired order is: [engine, hourly pay, commitment, lease length]
const getPricingContent = () => {
  const config = props.config;
  const col = [];
  // we show the engine icon when user select muti-engine
  if (config.engineType.length > 1) {
    col.push(pricingContent.engine);
  }
  col.push(pricingContent.commitment);
  col.push(pricingContent.hourlyPay);
  // we show the lease length only when user select 'Reserved' charge type or muti-chargeType
  const chargeTypeSet = new Set(config.chargeType);
  if (config.chargeType.length > 1 || chargeTypeSet.has("Reserved")) {
    col.push(pricingContent.leaseLength);
  }

  return col;
};

const columns: any = computed(() => [
  {
    title: "Name",
    key: "name",
    ellipsis: {
      tooltip: true,
    },
    rowSpan: (rowData: RowData) => {
      return rowData.childCnt;
    },
  },
  {
    title: "Region",
    key: "region",
    ellipsis: {
      tooltip: true,
    },
    sorter: {
      // sort by the case-insensitive alphabetical order
      compare: (row1: DataRow, row2: DataRow) => {
        const a = row1.region.toLocaleLowerCase();
        const b = row2.region.toLocaleLowerCase();
        const len = a.length > b.length ? b.length : a.length;
        for (let i = 0; i < len; i++) {
          if (a[i] < b[i]) {
            return false;
          } else if (a[i] > b[i]) {
            return true;
          }
        }

        // if tow region are identical, sort them with id
        if (a.length == b.length) {
          return row1.id - row2.id;
        }

        return a.length - b.length;
      },
      multiple: 1,
    },
    rowSpan: (rowData: RowData) => {
      return rowData.childCnt;
    },
  },
  {
    title: "CPU",
    key: "cpu",
    align: "center",
    sorter: {
      compare: (row1: DataRow, row2: DataRow) => row1.cpu - row2.cpu,
      multiple: 2,
    },
    rowSpan: (rowData: RowData) => {
      return rowData.childCnt;
    },
    ellipsis: {
      tooltip: true,
    },
    render(row: DataRow) {
      return [
        row.cpu,
        h(
          NTag,
          {
            round: true,
            type: "info",
            size: "small",
            bordered: false,
            class: "ml-1",
          },
          { default: () => row.processor, type: "info" }
        ),
      ];
    },
  },
  {
    title: "Memory",
    key: "memory",
    align: "center",
    defaultSortOrder: false,
    sorter: {
      compare: (row1: DataRow, row2: DataRow) =>
        Number(row1.memory) - Number(row2.memory),
      multiple: 2,
    },
    rowSpan: (rowData: RowData) => {
      return rowData.childCnt;
    },
  },
  {
    title: "Pricing",
    key: "pricing",
    align: "center",
    children: getPricingContent(),
    ellipsis: {
      tooltip: true,
    },
  },
]);

const props = defineProps({
  dbInstanceList: {
    type: Array as PropType<DBInstance[]>,
    default: () => [],
  },
  config: {
    type: Object as PropType<SearchConfig>,
    default: () => {},
  },
});

interface LocalState {
  dataRow: DataRow[];
}

const state = reactive<LocalState>({
  dataRow: [],
});

watch(
  () => props.config,
  () => {
    refreshDataTable();
  },
  {
    deep: true,
  }
);

const refreshDataTable = () => {
  const config = props.config;
  const dbInstanceList = props.dbInstanceList;

  state.dataRow = [];
  let rowCnt = 0;
  const selectedRegionSet = new Set<string>([...config.region]);
  const engineSet = new Set<string>([...config.engineType]);
  const chargeTypeSet = new Set<string>([...config.chargeType]);

  dbInstanceList.forEach((dbInstance) => {
    if (
      Number(dbInstance.memory) < config.minRAM ||
      Number(dbInstance.cpu) < config.minCPU
    ) {
      return;
    }

    const selectedRegionList = dbInstance.regionList.filter((region) => {
      if (selectedRegionSet.has(region.name)) {
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

      selectedTermList.forEach((term) => {
        const key = `${dbInstance.name}-${region.name}`;
        const newRow: DataRow = {
          id: -1,
          childCnt: 1,
          name: dbInstance.name,
          processor: dbInstance.processor,
          cpu: dbInstance.cpu,
          memory: dbInstance.memory,
          engineType: term.databaseEngine,
          commitment: { usd: term.commitmentUSD },
          hourly: { usd: term.hourlyUSD },
          leaseLength: term.payload?.leaseContractLength ?? "N/A",
          region: region.name,
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
    const keyword = config.keyword;
    if (keyword.length > 0) {
      const filteredDataRowList: DataRow[] = dataRowList.filter((row) => {
        if (
          row.name.includes(keyword) ||
          row.memory.includes(keyword) ||
          row.processor.includes(keyword) ||
          row.region.includes(keyword)
        ) {
          return true;
        }
        return false;
      });
      state.dataRow.push(...filteredDataRowList);
      return;
    }

    state.dataRow.push(...dataRowList);
  });
};

onMounted(() => {
  refreshDataTable();
});
</script>

<style scoped></style>
