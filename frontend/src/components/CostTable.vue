<template>
  <n-data-table :columns="columns" :data="state.selectedInstance" />
</template>

<script setup lang="ts">
import { NDataTable } from "naive-ui";
import { DBInstance } from "../types/dbInstance";
import { PropType, watch, reactive, onMounted } from "vue";
import { ChargeType, EngineType } from "../types";

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
    title: "vCPU",
    key: "vCPU",
    align: "center",
    sorter: {
      compare: (row1: DBInstance, row2: DBInstance) => row1.vCPU - row2.vCPU,
      multiple: 2,
    },
  },
  {
    title: "Memory",
    key: "memory",
    align: "center",
    defaultSortOrder: false,
    sorter: {
      compare: (row1: DBInstance, row2: DBInstance) =>
        Number(row1.memory) - Number(row2.memory),
      multiple: 2,
    },
  },
  {
    title: "Pricing",
    render: (dbInstance: DBInstance) => {
      if (dbInstance.regionList[0].termList.length > 0) {
        return "$ " + dbInstance.regionList[0].termList[0].usd;
      }
      return "N/A";
    },
  },
  {
    title: "Region",
    render: (dbInstance: DBInstance) => {
      return dbInstance.regionList[0].name;
    },
    ellipsis: {
      tooltip: true,
    },
    sorter: {
      compare: (row1: DBInstance, row2: DBInstance) => {
        const a = row1.regionList[0].name.toLocaleLowerCase();
        const b = row2.regionList[0].name.toLocaleLowerCase();
        const len = a.length > b.length ? b.length : a.length;
        for (let i = 0; i < len; i++) {
          if (a[i] < b[i]) {
            return false;
          } else if (a[i] > b[i]) {
            return true;
          }
        }
        return true;
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
});

interface LocalState {
  selectedInstance: DBInstance[];
}

const state = reactive<LocalState>({
  selectedInstance: [],
});

watch(
  () => props.chargeType,
  () => {
    refreshDataTable();
  }
);

watch(
  () => props.regionList.length,
  () => {
    refreshDataTable();
  }
);

const refreshDataTable = () => {
  const selectedRegionSet = new Set();
  props.regionList.forEach((val) => {
    selectedRegionSet.add(val);
  });

  state.selectedInstance = props.dbInstanceList.filter((e) => {
    const selectedRegion = e.regionList.filter((r) => {
      if (selectedRegionSet.has(r.name)) {
        return true;
      }
      return false;
    });

    // no region found
    if (selectedRegion.length === 0) {
      return false;
    }
    const termList = selectedRegion[0].termList.filter((t) => {
      if (t.type === props.chargeType && t.databaseEngine == props.engineType) {
        return true;
      }
      return false;
    });

    if (termList.length === 0) {
      return false;
    }
    selectedRegion[0].termList = termList;

    // only keep the selected region
    e.regionList = selectedRegion;

    return true;
  });
};

onMounted(() => {
  refreshDataTable();
});
</script>

<style scoped></style>
