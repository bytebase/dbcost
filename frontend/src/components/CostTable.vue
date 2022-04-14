<template>
  <n-data-table :columns="columns" :data="state.selectedInstance" />
</template>

<script setup lang="ts">
import { NDataTable } from "naive-ui";
import { DBInstance } from "../types/dbInstance";
import { PropType, watch, reactive, onMounted } from "vue";
import { ChargeType } from "../types";

const columns: any = [
  {
    title: "Name",
    key: "name",
    width: "20%",
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: "Processor",
    key: "processor",
    width: "30%",
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: "vCPU",
    key: "vCPU",
    align: "center",
    defaultSortOrder: "ascend",
    sorter: {
      compare: (row1: DBInstance, row2: DBInstance) => row1.vCPU - row2.vCPU,
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
    },
  },
  {
    title: "On Demand",
    render: (dbInstance: DBInstance) => {
      if (dbInstance.regionList[0].termList.length > 0) {
        return "$ " + dbInstance.regionList[0].termList[0].usd;
      }
      return "N/A";
    },
  },
];

const props = defineProps({
  dbInstanceList: {
    type: Object as PropType<DBInstance[]>,
    default: [],
  },
  region: {
    type: String,
    default: "",
  },
  chargeType: {
    type: String as PropType<ChargeType>,
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
  () => props.region,
  (value) => console.log("change region to ", value)
);

const filterDBInstance = (region: string) => {
  state.selectedInstance = props.dbInstanceList.filter((e) => {
    const selectedRegion = e.regionList.filter((r) => {
      if (r.name === region) {
        return true;
      }
      return false;
    });

    // no region found
    if (selectedRegion.length === 0) {
      return false;
    }
    const termList = selectedRegion[0].termList.filter((t) => {
      if (t.type === props.chargeType && t.databaseEngine.includes("MySQL")) {
        return true;
      }
      return false;
    });

    // if (termList.length === 0) {
    //   return false;
    // }
    selectedRegion[0].termList = termList;

    // only keep the selected region
    e.regionList = selectedRegion;
    return true;
  });
};

const pagination = { pageSize: 10 };

onMounted(() => {
  filterDBInstance(props.region);
});
</script>

<style scoped></style>
