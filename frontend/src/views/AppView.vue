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
    <n-button class="mb-4" @click="clearAll">Clear All</n-button>

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
      :db-instance-list="dbInstanceStore.dbInstanceList"
      :config="searchConfigStore.searchConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";

import CostTable from "../components/CostTable.vue";
import CostTableMenu from "../components/CostTableMenu.vue";
import { NButton } from "naive-ui";

import { ChargeType, DBInstance, EngineType } from "../types";
import { useDBInstanceStore } from "../stores/dbInstance";
import { useSearchConfigStore } from "../stores/searchConfig";
import { useRouter } from "vue-router";

import aws from "../../../store/data/test/aws-sample.json";
import { RouteParam } from "../router";
import { isEmptyArray } from "../util";

const dbInstanceStore = useDBInstanceStore();
dbInstanceStore.dbInstanceList = aws as unknown as DBInstance[];

const searchConfigStore = useSearchConfigStore();

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
      provider: config.cloudProvider,
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

const clearAll = () => {
  searchConfigStore.clearAll();
};
</script>

<style></style>
