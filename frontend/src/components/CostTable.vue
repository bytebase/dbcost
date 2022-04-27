<template>
  <n-data-table :columns="columns" :data="state.dataRow" />
</template>

<script setup lang="ts">
import { NDataTable, NAvatar } from "naive-ui";
import { DBInstance } from "../types/dbInstance";
import { PropType, watch, reactive, onMounted, h } from "vue";
import { ChargeType, EngineType } from "../types";
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

const columns: any = [
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
    title: "Processor",
    key: "processor",
    ellipsis: {
      tooltip: true,
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
    children: [
      {
        title: "Engine",
        align: "center",
        render: (row: RowData) => {
          if (row.engineType == "MYSQL") {
            return EngineIconRender.MYSQL;
          }
          return EngineIconRender.POSTGRES;
        },
      },
      {
        title: "Commitment",
        align: "right",
        render: (row: RowData) => {
          return `$${row.commitment.usd}`;
        },
      },
      {
        title: "Hourly Pay",
        align: "right",
        render: (row: RowData) => {
          return `$${row.hourly.usd.toFixed(2)}`;
        },
      },
      {
        title: "Lease Length",
        key: "leaseLength",
        align: "right",
        render: (row: RowData) => {
          return row.leaseLength;
        },
      },
    ],
    ellipsis: {
      tooltip: true,
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
];

const props = defineProps({
  dbInstanceList: {
    type: Object as PropType<DBInstance[]>,
    default: [],
  },
  regionList: {
    type: Object as PropType<string[]>,
    default: [],
  },
  chargeType: {
    type: Object as PropType<ChargeType[]>,
    default: [""],
  },
  engineType: {
    type: Object as PropType<EngineType[]>,
    default: [""],
  },
  keyword: {
    type: String,
    default: "",
  },
  minCPU: {
    type: Number,
    default: 0,
  },
  minRAM: {
    type: Number,
    default: 0,
  },
});

interface LocalState {
  dataRow: DataRow[];
}

const state = reactive<LocalState>({
  dataRow: [],
});

watch(
  () => props.chargeType,
  () => {
    refreshDataTable();
  }
);

watch(
  () => props.regionList,
  () => {
    refreshDataTable();
  }
);

watch(
  () => props.engineType,
  () => {
    refreshDataTable();
  }
);

watch(
  () => props.keyword,
  () => {
    refreshDataTable();
  }
);

watch(
  () => props.minCPU,
  () => {
    refreshDataTable();
  }
);

watch(
  () => props.minRAM,
  () => {
    refreshDataTable();
  }
);

const refreshDataTable = () => {
  state.dataRow = [];
  let rowCnt = 0;
  const selectedRegionSet = new Set<string>([...props.regionList]);
  const engineSet = new Set<string>([...props.engineType]);
  const chargeTypeSet = new Set<string>([...props.chargeType]);

  props.dbInstanceList.forEach((dbInstance) => {
    if (
      Number(dbInstance.memory) < props.minRAM ||
      Number(dbInstance.cpu) < props.minCPU
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
          leaseLength: term.payload?.leaseContractLength
            ? term.payload?.leaseContractLength
            : "INF",
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
        if (a.leaseLength == "INF") {
          return -1;
        } else if (b.leaseLength == "INF") {
          return 1;
        }
        return Number(a.leaseLength[0]) - Number(b.leaseLength[0]);
      });
      val[0].childCnt = val.length;
      dataRowList.push(...val);
    });

    // filter by keyword, we only enable this when the keyword is set by user
    const keyword = props.keyword;
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
