<template>
  <h1
    class="flex flex-row justify-center mx-5 mt-4 text-4xl text-center text-slate-800 space-x-2"
  >
    {{ title }}
  </h1>

  <!-- menu -->
  <div class="mx-5 mt-4 border-b pb-4">
    <div class="mb-4 justify-center space-x-2 flex">
      <n-button @click="clearAll">Clear All</n-button>
      <n-button
        :disabled="dataTableItemStore.checkedRowKey.length === 0"
        class="text-center bg-green-600 text-white"
        @click="handleClickCompare"
      >
        Go Compare
      </n-button>
      <n-button @click="copyURL">Copy URL</n-button>
    </div>
    <cost-table-region-menu
      class="border-b pb-4"
      :available-region-list="state.availableRegions"
      :checked-region-list="searchConfigStore.searchConfig.region"
      @update-region="handleUpdateRegion"
    />

    <cost-table-menu
      :has-provider="$route.name !== 'provider'"
      :cloud-provider="searchConfigStore.searchConfig.cloudProvider"
      :engine-type="searchConfigStore.searchConfig.engineType"
      :charge-type="searchConfigStore.searchConfig.chargeType"
      :keyword="searchConfigStore.searchConfig.keyword"
      :min-r-a-m="searchConfigStore.searchConfig.minRAM"
      :min-c-p-u="searchConfigStore.searchConfig.minCPU"
      @update-cloud-provider="handleUpdateCloudProvider"
      @update-engine-type="handleUpdateEngineType"
      @update-charge-type="handleUpdateChargeType"
      @update-keyword="handleUpdateKeyword"
      @update-min-vcpu="handleUpdateMinCPU"
      @update-min-ram="handleUpdateMinRAM"
    />
  </div>

  <!-- dashboard -->
  <div class="mx-5 mt-4">
    <cost-table-slider
      :utilization="state.utilization"
      :rent-year="state.rentYear"
      @update-utilization="(val:number) => (state.utilization = val)"
      @update-lease-length="(val:number) => (state.rentYear = val)"
    />
    <cost-table
      class="mt-4"
      :utilization="state.utilization"
      :rent-year="state.rentYear"
      :data-row="dataTableItemStore.dataRow"
      :is-loading="state.isLoading"
      :show-engine-type="showEngineType"
      :show-lease-length="showLeaseLength"
      :checked-row-keys="dataTableItemStore.checkedRowKey"
      @update-checked-row-keys="(val:string[]) => handleCheckRowKeys(val)"
    />
  </div>
</template>

<script setup lang="ts">
import { watch, reactive, ref, computed, onMounted } from "vue";
import { NButton, useNotification } from "naive-ui";

import {
  AvailableRegion,
  ChargeType,
  CloudProvider,
  EngineType,
  RouteQueryDashBoard,
} from "../types";
import {
  useSearchConfigStore,
  useDBInstanceStore,
  useDataTableItemStore,
} from "../stores";
import { useRouter } from "vue-router";

import { isEmptyArray } from "../util";
import { RouteQueryCompare } from "../types/route";

const dbInstanceStore = useDBInstanceStore();

const dataTableItemStore = useDataTableItemStore();

watch(
  () => dbInstanceStore.dbInstanceList.length,
  () => {
    state.availableRegions = dbInstanceStore.getAvailableRegionList();
    dataTableItemStore.refresh();
  }
);

const searchConfigStore = useSearchConfigStore();

interface LocalState {
  availableRegions: AvailableRegion[];
  isLoading: boolean;
  utilization: number;
  rentYear: number;
}

const state = reactive<LocalState>({
  availableRegions: [],
  isLoading: false,
  utilization: 1,
  rentYear: 1,
});

const title = computed(() => {
  const curRoute = router.currentRoute.value;
  if (curRoute.name === "provider") {
    if (curRoute.params.provider === "AWS") {
      return `The Ultimate AWS RDS Instance Pricing Sheet`;
    }
    if (curRoute.params.provider === "GCP") {
      return `The Ultimate Google Cloud SQL Instance Pricing Sheet`;
    }
  }
  return "The Ultimate AWS RDS and Google Cloud SQL Instance Pricing Sheet";
});

const handleUpdateRegion = (val: string[]) => {
  searchConfigStore.searchConfig.region = val;
};
const handleUpdateCloudProvider = (val: CloudProvider[]) => {
  searchConfigStore.searchConfig.cloudProvider = val;
};
const handleUpdateEngineType = (val: EngineType[]) => {
  searchConfigStore.searchConfig.engineType = val;
};
const handleUpdateChargeType = (val: ChargeType[]) => {
  searchConfigStore.searchConfig.chargeType = val;
};
const handleUpdateKeyword = (val: string) => {
  searchConfigStore.searchConfig.keyword = val;
};
const handleUpdateMinRAM = (val: any) => {
  searchConfigStore.searchConfig.minRAM = val;
};
const handleUpdateMinCPU = (val: any) => {
  searchConfigStore.searchConfig.minCPU = val;
};
const handleCheckRowKeys = (rowKeys: string[]) => {
  const checkRowKey = dataTableItemStore.checkedRowKey;
  // a key is added
  if (rowKeys.length > checkRowKey.length) {
    const set = new Set(checkRowKey);
    for (const rowKey of rowKeys) {
      if (!set.has(rowKey)) {
        dataTableItemStore.addCheckedDataRowByKey(rowKey);
      }
    }
  }
  // a key is removed
  else {
    const set = new Set(rowKeys);
    for (const rowKey of checkRowKey) {
      if (!set.has(rowKey)) {
        dataTableItemStore.removeCheckedDataRowByKey(rowKey);
      }
    }
  }
};

const handleClickCompare = () => {
  const routeQuery: RouteQueryCompare = {
    key: dataTableItemStore.checkedRowKey.join(","),
  };

  router.push({ name: "compare", query: routeQuery });
};

const router = useRouter();
watch(
  () => searchConfigStore.searchConfig,
  () => {
    const config = searchConfigStore.searchConfig;
    const routeQuery: RouteQueryDashBoard = {
      provider: isEmptyArray(config.cloudProvider)
        ? undefined
        : config.cloudProvider?.join(","),
      region: isEmptyArray(config.region)
        ? undefined
        : config.region?.join(","),
      engine: isEmptyArray(config.engineType)
        ? undefined
        : config.engineType?.join(","),
      charge: isEmptyArray(config.chargeType)
        ? undefined
        : config.chargeType?.join(","),
      minCPU: config.minCPU === 0 ? undefined : config.minCPU,
      minRAM: config.minRAM === 0 ? undefined : config.minRAM,
      keyword: config.keyword === "" ? undefined : config.keyword,
    };

    const curRoute = router.currentRoute.value;
    if (curRoute.name === "provider") {
      routeQuery.provider = undefined;
    }
    router.push({
      name: curRoute.name as string,
      query: routeQuery,
    });
  },
  {
    deep: true,
  }
);

const notification = useNotification();
const copyURL = () => {
  navigator.clipboard
    .writeText(document.location.href)
    .then(() => {
      notification.success({
        content: "Successfully copied to clipboard",
        duration: 2000,
      });
    })
    .catch(() => {
      notification.error({
        content: "Fail to copy, please try again",
        duration: 2000,
      });
    });
};

const config = ref(searchConfigStore.searchConfig);
watch(
  config, // ref to searchConfigStore.searchConfig
  () => {
    // We set the dataRow to empty here for a better animation.
    // Otherwise the loading circle would appear right in the middle of the data table, which may be elusive.
    dataTableItemStore.clearDataRow();
    state.isLoading = true;
    setTimeout(() => {
      dataTableItemStore.refresh();
      state.isLoading = false;
    }, 100);
  },
  {
    deep: true,
  }
);

const showEngineType = computed(
  () => config.value.engineType && config.value.engineType.length > 1
);
const showLeaseLength = computed(() => {
  const chargeTypeSet = new Set(config.value.chargeType);
  return chargeTypeSet.size > 1 || chargeTypeSet.has("Reserved");
});

const clearAll = () => {
  searchConfigStore.clearAll();
  dataTableItemStore.clearAll();
};

onMounted(() => {
  state.availableRegions = dbInstanceStore.getAvailableRegionList();
  dataTableItemStore.refresh();
});
</script>

<style></style>
