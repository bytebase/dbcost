<template>
  <h1
    class="flex flex-row justify-center mx-5 mt-4 text-4xl text-center text-slate-800 space-x-2"
  >
    The Ultimate AWS RDS and Google Cloud SQL Instance Pricing Sheet
  </h1>

  <!-- menu -->
  <div class="mx-5 mt-4 border-b pb-4">
    <div class="mb-4 justify-center space-x-2 flex">
      <n-button @click="clearAll">Clear All</n-button>
      <n-button @click="copyURL">Copy URL</n-button>
    </div>
    <cost-table-region-menu
      class="border-b pb-4"
      :available-region-list="state.availableRegions"
      :region-list="searchConfigStore.searchConfig.region"
      @update-region="handleUpdateRegion"
    />

    <cost-table-menu
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
  <div class="mx-5 mt-5">
    <cost-table
      :data-row="dataTableItemStore.dataRow"
      :is-loading="state.isLoading"
      :show-engine-type="showEngineType"
      :show-lease-length="showLeaseLength"
      :checked-row-keys="dataTableItemStore.checkedRowKey"
      @update-checked-row-keys="
        (val:string[]) => {
          handleCheckRowKeys(val, true);
        }
      "
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
} from "../types";
import {
  useSearchConfigStore,
  useDBInstanceStore,
  useDataTableItemStore,
} from "../stores";
import { useRouter } from "vue-router";

import { RouteParam } from "../router";
import { isEmptyArray } from "../util";

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
  isCheckedTableExpended: boolean;
}

const state = reactive<LocalState>({
  availableRegions: [],
  isLoading: false,
  isCheckedTableExpended: false,
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
const handleCheckRowKeys = (rowKeys: string[], needScroll: boolean) => {
  dataTableItemStore.refreshChecked(rowKeys);

  if (state.isCheckedTableExpended && needScroll) {
    if (dataTableItemStore.checkedRowKey.length > rowKeys.length) {
      window.scrollBy(0, -47);
    } else {
      window.scrollBy(0, 47);
    }
  }
};

const handleToggleIsExpanded = () => {
  state.isCheckedTableExpended = !state.isCheckedTableExpended;
};

const router = useRouter();
watch(
  () => searchConfigStore.searchConfig,
  () => {
    const config = searchConfigStore.searchConfig;
    const queryParam: RouteParam = {
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

    router.push({
      name: "dashboard",
      query: queryParam,
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
