<template>
  <h1
    class="flex flex-row justify-center mx-5 mt-4 text-4xl text-center text-slate-800 space-x-2"
  >
    <span>💸</span>
    <span
      >The Ultimate
      <a
        class="text-blue-600 underline"
        href="https://aws.amazon.com/rds"
        target="_blank"
        >AWS RDS</a
      >
      Instance Pricing Sheet</span
    >
    <span>💸</span>
  </h1>

  <!-- menu -->
  <div class="mx-5 mt-4">
    <div class="mb-4 justify-between flex">
      <n-button @click="clearAll">Clear All</n-button>
      <n-button @click="copyURL">Copy URL</n-button>
    </div>
    <cost-table-region-menu
      class="border-b pb-4"
      :region-list="searchConfigStore.searchConfig.region"
      @update-region="handleUpdateRegion"
    />

    <cost-table-menu
      :charge-type="searchConfigStore.searchConfig.chargeType"
      :engine-type="searchConfigStore.searchConfig.engineType"
      :keyword="searchConfigStore.searchConfig.keyword"
      :min-r-a-m="searchConfigStore.searchConfig.minRAM"
      :min-c-p-u="searchConfigStore.searchConfig.minCPU"
      @update-charge-type="handleUpdateChargeType"
      @update-engine-type="handleUpdateEngineType"
      @update-keyword="handleUpdateKeyword"
      @update-min-vcpu="handleUpdateMinCPU"
      @update-min-ram="handleUpdateMinRAM"
    />
  </div>

  <!-- dashboard -->
  <div class="mx-5 mt-5">
    <cost-table
      :data-row="state.dataRow"
      :is-loading="state.isLoading"
      :show-engine-type="showEngineType"
      :show-lease-length="showLeaseLength"
    />
  </div>
</template>

<script setup lang="ts">
import { watch, reactive, ref, computed, onMounted } from "vue";

import { DataRow } from "../components/CostTable";
import { NButton, useNotification } from "naive-ui";

import { ChargeType, DBInstance, EngineType } from "../types";
import { useDBInstanceStore } from "../stores/dbInstance";
import { useSearchConfigStore } from "../stores/searchConfig";
import { useRouter } from "vue-router";

import aws from "../../../store/data/test/aws.json";
import { RouteParam } from "../router";
import { isEmptyArray, getRegionCode, getRegionName } from "../util";

const dbInstanceStore = useDBInstanceStore();
dbInstanceStore.dbInstanceList = aws as unknown as DBInstance[];

const searchConfigStore = useSearchConfigStore();

interface LocalState {
  dataRow: DataRow[];
  isLoading: boolean;
}

const state = reactive<LocalState>({
  dataRow: [],
  isLoading: false,
});

const handleUpdateRegion = (val: string[]) => {
  searchConfigStore.searchConfig.region = val;
};
const handleUpdateChargeType = (val: ChargeType[]) => {
  searchConfigStore.searchConfig.chargeType = val;
};
const handleUpdateEngineType = (val: EngineType[]) => {
  searchConfigStore.searchConfig.engineType = val;
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
    state.isLoading = true;
    refreshDataTable();
    state.isLoading = false;
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
  state.dataRow = [];
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
    const keyword = config.keyword;
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
};

onMounted(() => {
  refreshDataTable();
});
</script>

<style></style>
