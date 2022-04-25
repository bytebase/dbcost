<template>
  <n-data-table :columns="columns" :data="state.dataRow" />
</template>

<script setup lang="ts">
import { NDataTable } from "naive-ui";
import { DBInstance } from "../types/dbInstance";
import { PropType, watch, reactive, onMounted } from "vue";
import { ChargeType, EngineType } from "../types";
import { RowData } from "naive-ui/lib/data-table/src/interface";

type DataRow = {
  id: number;

  name: string;
  processor: string;
  cpu: number;
  memory: string;
  leaseLength?: string;
  commitment: { usd: number };
  hourly: { usd: number };
  region: string;
};

const columns: any = [
  {
    title: "Name",
    key: "name",
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: "Processor",
    key: "processor",
    ellipsis: {
      tooltip: true,
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
  },
  {
    title: "Pricing",
    key: "pricing",
    align: "center",
    children: [
      {
        title: "Commitment",
        key: "commitment.usd",
        render: (row: RowData) => {
          return `$${row.commitment.usd}`;
        },
      },
      {
        title: "Hourly Pay",
        key: "hourly.usd",
        render: (row: RowData) => {
          return `$${row.hourly.usd}`;
        },
      },
      {
        title: "Lease Length",
        key: "leaseLength",
        align: "center",
        render: (row: RowData) => {
          return row.leaseLength ? row.leaseLength : "INF";
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
    type: String as PropType<ChargeType>,
    default: "",
  },
  engineType: {
    type: String as PropType<EngineType>,
    default: "",
  },
  keyword: {
    type: String,
    default: "",
  },
  minVCPU: {
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
  () => props.minVCPU,
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
  props.dbInstanceList.forEach((dbInstance) => {
    if (
      Number(dbInstance.memory) < props.minRAM ||
      Number(dbInstance.cpu) < props.minVCPU
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
    // filter terms provided in each region
    selectedRegionList.forEach((region) => {
      const selectedTermList = region.termList.filter((term) => {
        if (
          term.type === props.chargeType &&
          term.databaseEngine == props.engineType
        ) {
          return true;
        }
        return false;
      });

      selectedTermList.forEach((term) => {
        // make a new copy so that the original one will remain unaffected
        rowCnt++;
        dataRowList.push({
          id: rowCnt,

          name: dbInstance.name,
          processor: dbInstance.processor,
          memory: dbInstance.memory,
          cpu: dbInstance.cpu,
          leaseLength: term.payload?.leaseContractLength,
          commitment: { usd: term.commitmentUSD },
          hourly: { usd: term.hourlyUSD },
          region: region.name,
        });
      });
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
