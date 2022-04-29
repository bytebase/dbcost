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
      :region-list="state.selectedRegionList"
      @update-region="handleUpdateRegion"
    />

    <cost-table-menu
      :charge-type="state.selectedChargeType"
      :engine-type="state.selectedEngineType"
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
      :region-list="state.selectedRegionList"
      :charge-type="state.selectedChargeType"
      :engine-type="state.selectedEngineType"
      :keyword="state.typedKeyword"
      :minCPU="state.minCPU"
      :minRAM="state.minRAM"
    />
  </div>

  <the-footer class="px-3 my-5" />
</template>

<script setup lang="ts">
import CostTable from "../components/CostTable.vue";
import CostTableMenu from "../components/CostTableMenu.vue";
import TheFooter from "../components/TheFooter.vue";
import TheHeader from "../components/TheHeader.vue";

import { ChargeType, DBInstance, EngineType } from "../types";
import { useDBInstanceStore } from "../stores/dbInstance";
import { useRouter } from "vue-router";
import { routeParam } from "../router";

import aws from "../../../store/data/test/aws-sample.json";
import { NButton } from "naive-ui";

import { reactive, watch } from "vue";

const dbInstanceStore = useDBInstanceStore();
dbInstanceStore.dbInstanceList = aws as unknown as DBInstance[];

interface LocalState {
  selectedRegionList: string[];
  selectedChargeType: ChargeType[];
  selectedEngineType: EngineType[];
  typedKeyword: string;
  minCPU: number;
  minRAM: number;
}

const state = reactive<LocalState>({
  selectedRegionList: ["US East (N. Virginia)"],
  selectedChargeType: ["OnDemand"],
  selectedEngineType: ["MYSQL"],
  typedKeyword: "",
  minCPU: 0,
  minRAM: 0,
});

const handleUpdateRegion = (val: string[]) => {
  state.selectedRegionList = val;
};
const handleUpdateChargeType = (val: ChargeType[]) => {
  state.selectedChargeType = val;
};
const handleUpdateEngineType = (val: EngineType[]) => {
  state.selectedEngineType = val;
};
const handleUpdateKeyword = (val: string) => {
  state.typedKeyword = val;
};
const handleUpdateMinRAM = (val: any) => {
  state.minRAM = val;
};
const handleUpdateMinCPU = (val: any) => {
  state.minCPU = val;
};

const router = useRouter();
watch(
  () => [
    state.minCPU,
    state.minRAM,
    state.selectedChargeType,
    state.selectedEngineType,
    state.selectedRegionList,
    state.typedKeyword,
  ],
  () => {
    const params: routeParam = {
      provider: "AWS",
      engine: state.selectedEngineType.join("&"),
      region: state.selectedRegionList.join("&"),
      chargeType: state.selectedChargeType.join("&"),
      minCPU: state.minCPU,
      minRAM: state.minRAM,
      keyword: state.typedKeyword ?? "",
    };
    router.replace({
      name: "app",
      query: params,
    });
  }
);

const clearAll = () => {
  handleUpdateKeyword("");
  handleUpdateEngineType([]);
  handleUpdateRegion([]);
  handleUpdateMinCPU(0);
  handleUpdateMinRAM(0);
};
</script>

<style></style>
