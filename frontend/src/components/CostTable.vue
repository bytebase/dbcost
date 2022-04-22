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
      const termList = dbInstance.regionList[0].termList;
      if (termList.length > 0) {
        const term = termList[0];
        if (term.type == "OnDemand") {
          return `$ ${term.usd}`;
        } else if (term.type == "Reserved") {
          return `$ ${term.usd} (${term.payload?.leaseContractLength} ${term.payload?.purchaseOption})`;
        }
      }
      return "N/A";
    },
    ellipsis: {
      tooltip: true,
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
  engineType: {
    type: String as PropType<EngineType>,
    default: "",
  },
  keyword: {
    type: String,
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
  () => props.region,
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

const refreshDataTable = () => {
  state.selectedInstance = [];
  props.dbInstanceList.forEach((dbInstance) => {
    const selectedRegion = dbInstance.regionList.filter((region) => {
      if (region.name == props.region) {
        return true;
      }
      return false;
    });
    // no region found
    if (selectedRegion.length === 0) {
      return;
    }

    const selectedTermList = selectedRegion[0].termList.filter((term) => {
      if (
        term.type === props.chargeType &&
        term.databaseEngine == props.engineType
      ) {
        return true;
      }
      return false;
    });
    // no pricing info available
    if (selectedTermList.length === 0) {
      return;
    }

    // make a new copy so that the original one will remain unaffected
    const selectedInstance = {
      ...dbInstance,
      regionList: [
        {
          name: selectedRegion[0].name,
          termList: selectedTermList,
        },
      ],
    };

    // filter by keyword, we only enable this when the keyword is set by user
    const keyword = props.keyword;
    if (
      keyword.length > 0 &&
      !selectedInstance.name.includes(keyword) &&
      !selectedInstance.processor.includes(keyword)
    ) {
      return;
    }

    state.selectedInstance.push(selectedInstance);
  });
};

onMounted(() => {
  refreshDataTable();
});
</script>

<style scoped></style>
