<template>
  <!-- header -->
  <the-header />

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

  <the-footer class="px-3 my-5" />
</template>

<script setup lang="ts">
import { watch } from "vue";

import CostTable from "../components/CostTable.vue";
import CostTableMenu from "../components/CostTableMenu.vue";
import TheFooter from "../components/TheFooter.vue";
import TheHeader from "../components/TheHeader.vue";
import { NButton } from "naive-ui";

import { ChargeType, DBInstance, EngineType } from "../types";
import { useDBInstanceStore } from "../stores/dbInstance";
import { useSearchConfigStore } from "../stores/searchConfig";
import { useRouter } from "vue-router";

import aws from "../../../store/data/test/aws-sample.json";
import { RouteParam } from "../router";

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
      cloudProvider: config.cloudProvider,
      region: config.region.join(","),
      engineType: config.engineType.join(","),
      chargeType: config.chargeType.join(","),
      minCPU: config.minCPU,
      minRAM: config.minRAM,
      keyword: config.keyword,
    };
    router.push({
      name: "app",
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
