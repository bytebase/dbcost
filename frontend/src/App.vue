<template>
  <!-- header -->
  <the-header />

  <!-- menu -->
  <div class="mx-5 mt-4">
    <cost-table-menu
      :region-list="state.selectedRegionList"
      :charge-type="state.selectedChargeType"
      :engine-type="state.selectedEngineType"
      @update-region="handleUpdateRegion"
      @update-charge-type="handleUpdateChargeType"
      @update-engine-type="handleUpdateEngineType"
      @update-keyword="handleUpdateKeyword"
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
    />
  </div>

  <the-footer class="px-3 my-5" />
</template>

<script setup lang="ts">
import CostTable from "./components/CostTable.vue";
import CostTableMenu from "./components/CostTableMenu.vue";
import TheFooter from "./components/TheFooter.vue";
import TheHeader from "./components/TheHeader.vue";

import { ChargeType, DBInstance, EngineType } from "./types";
import { useDBInstanceStore } from "./stores/dbInstance";
import aws from "../../store/data/test/aws-sample.json";

import { reactive } from "vue";

const dbInstanceStore = useDBInstanceStore();
dbInstanceStore.dbInstanceList = aws as unknown as DBInstance[];

interface LocalState {
  selectedRegionList: string[];
  selectedChargeType: ChargeType;
  selectedEngineType: EngineType;
  typedKeyword: string;
}

const state = reactive<LocalState>({
  selectedRegionList: [],
  selectedChargeType: "OnDemand",
  selectedEngineType: "MYSQL",
  typedKeyword: "",
});

const handleUpdateRegion = (val: string[]) => {
  state.selectedRegionList = val;
};

const handleUpdateChargeType = (val: ChargeType) => {
  state.selectedChargeType = val;
};
const handleUpdateEngineType = (val: EngineType) => {
  state.selectedEngineType = val;
};
const handleUpdateKeyword = (val: string) => {
  state.typedKeyword = val;
};
</script>

<style></style>
