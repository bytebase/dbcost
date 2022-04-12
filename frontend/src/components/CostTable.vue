<template>
  <n-data-table
    :columns="columns"
    :data="state.selectedInstance"
  ></n-data-table>
</template>

<script setup lang="ts">
import { NDataTable } from "naive-ui";
import { DBInstance } from "../types/dbInstance";
import { PropType, watch, reactive, onMounted } from "vue";
import { ChargeType, Region, Term } from "../types";

const columns: any = [
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Processor",
    key: "processor",
  },
  {
    title: "vCPU",
    key: "vCPU",
    align: "center",
  },
  {
    title: "Memory",
    key: "memory",
    align: "center",
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
    selectedRegion[0].termList = termList;

    // only keep the selected region
    e.regionList = selectedRegion;
    return true;
  });
};

onMounted(() => {
  filterDBInstance(props.region);
});
</script>

<style scoped></style>
