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

  <!-- compare selection -->
  <div class="mx-5 mt-4 border-b pb-4">
    <!-- selected dashboard -->
    <cost-table-checked
      :data-row="state.checkedDataRow"
      :is-loading="state.isLoading"
      :is-expended="state.isCheckedTableExpended"
      :checked-row-keys="state.checkRowKeys"
      @update-checked-row-keys="
        (val:string[]) => {
          handleCheckRowKeys(val, false);
        }
      "
      @toggle-is-expanded="handleToggleIsExpanded"
    />

    <!-- chart -->
    <composite-chart
      class="mx-4 mt-2"
      v-show="state.isCheckedTableExpended"
      :data="state.checkedDataRow"
    />
  </div>

  <!-- dashboard -->
  <div class="mx-5 mt-5">
    <cost-table
      :data-row="state.dataRow"
      :is-loading="state.isLoading"
      :show-engine-type="showEngineType"
      :show-lease-length="showLeaseLength"
      :checked-row-keys="state.checkRowKeys"
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

import { DataRow } from "../components/CostTable";
import { NButton, useNotification } from "naive-ui";

import {
  AvailableRegion,
  ChargeType,
  CloudProvider,
  EngineType,
} from "../types";
import { useDBInstanceStore } from "../stores/dbInstance";
import { useSearchConfigStore } from "../stores/searchConfig";
import { useRouter } from "vue-router";

import { RouteParam } from "../router";
import { isEmptyArray, getRegionCode, getRegionName } from "../util";

const dbInstanceStore = useDBInstanceStore();
dbInstanceStore.loadDBInstanceList();

watch(
  () => dbInstanceStore.dbInstanceList.length,
  () => {
    state.availableRegions = dbInstanceStore.getAvailableRegionList();
    refreshDataTable();
  }
);

const searchConfigStore = useSearchConfigStore();

interface LocalState {
  availableRegions: AvailableRegion[];
  dataRow: DataRow[];
  checkRowKeys: string[];
  checkedDataRow: DataRow[];
  isLoading: boolean;
  isCheckedTableExpended: boolean;
}

const state = reactive<LocalState>({
  availableRegions: [],
  dataRow: [],
  checkRowKeys: [],
  checkedDataRow: [],
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
  const rowKeySet = new Set<string>(rowKeys);
  state.checkedDataRow = state.dataRow.filter((row: DataRow) =>
    rowKeySet.has(row.key)
  );
  state.checkedDataRow.forEach((row) => {
    row.childCnt = 1;
  });

  if (state.isCheckedTableExpended && needScroll) {
    if (state.checkRowKeys.length > rowKeys.length) {
      window.scrollBy(0, -47);
    } else {
      window.scrollBy(0, 47);
    }
  }

  state.checkRowKeys = rowKeys;
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
    state.dataRow = [];
    state.isLoading = true;
    setTimeout(() => {
      refreshDataTable();
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
const refreshDataTable = () => {
  let rowCnt = 0;
  const config = searchConfigStore.searchConfig;
  const dbInstanceList = dbInstanceStore.dbInstanceList;

  if (!config.region && !config.engineType && !config.chargeType) {
    return;
  }

  const regionCodeList: string[] = [];
  config.region?.forEach((regionName) => {
    regionCodeList.push(...getRegionCode(regionName));
  });
  const cloudProviderSet = new Set(config.cloudProvider);
  const selectedRegionCodeSet = new Set(regionCodeList);
  const engineSet = new Set(config.engineType);
  const chargeTypeSet = new Set(config.chargeType);

  dbInstanceList.forEach((dbInstance) => {
    if (
      (config.minRAM && Number(dbInstance.memory) < config.minRAM) ||
      (config.minCPU && Number(dbInstance.cpu) < config.minCPU)
    ) {
      return;
    }

    if (!cloudProviderSet.has(dbInstance.cloudProvider)) {
      return;
    }

    const selectedRegionList = dbInstance.regionList.filter((region) => {
      if (selectedRegionCodeSet.has(region.code)) {
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

      const regionName = getRegionName(region.code);
      selectedTermList.forEach((term) => {
        const key = `${dbInstance.name}-${region.code}`;
        const newRow: DataRow = {
          id: -1,
          key: term.code,
          childCnt: 1,
          cloudProvider: dbInstance.cloudProvider,
          name: dbInstance.name,
          processor: dbInstance.processor,
          cpu: dbInstance.cpu,
          memory: dbInstance.memory,
          engineType: term.databaseEngine,
          commitment: { usd: term.commitmentUSD },
          hourly: { usd: term.hourlyUSD },
          leaseLength: term.payload?.leaseContractLength ?? "N/A",
          // we store the region code for each provider, and show the user the actual region information
          // e.g. AWS's us-east-1 and GCP's us-east-4 are refer to the same region (N. Virginia)
          region: regionName,
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
    const keyword = config.keyword?.toLowerCase();
    if (keyword) {
      const filteredDataRowList: DataRow[] = dataRowList.filter((row) => {
        if (
          row.name.toLowerCase().includes(keyword) ||
          row.memory.toLowerCase().includes(keyword) ||
          row.processor.toLowerCase().includes(keyword) ||
          row.region.toLowerCase().includes(keyword)
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

const clearAll = () => {
  searchConfigStore.clearAll();
  state.dataRow = [];
};

onMounted(() => {
  state.availableRegions = dbInstanceStore.getAvailableRegionList();
  refreshDataTable();
});
</script>

<style></style>
