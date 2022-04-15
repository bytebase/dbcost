<template>
  <!-- header -->
  <div class="inset-0">
    <div class="px-5 pt-5 items-center">
      <span class="font-bold text-lg text-center">DB COST</span>
      <img
        class="w-5 ml-5 inline float-right"
        src="./assets/icon/logo-icon.svg"
      />
    </div>
  </div>

  <!-- menu -->
  <div class="mx-5 mt-1">
    <cost-table-menu
      :region-list="state.selectedRegionList"
      :charge-type="state.selectedChargeType"
      :engine-type="state.selectedEngineType"
      @update-region="handleUpdateRegion"
      @update-charge-type="handleUpdateChargeType"
      @update-engine-type="handleUpdateEngineType"
    />
  </div>

  <!-- dashboard -->
  <div class="mx-5 mt-5">
    <cost-table
      :db-instance-list="dbInstanceStore.dbInstanceList"
      :region-list="state.selectedRegionList"
      :charge-type="state.selectedChargeType"
      :engine-type="state.selectedEngineType"
    />
  </div>

  <the-footer class="px-3 my-5" />
</template>

<script setup lang="ts">
import CostTable from "./components/CostTable.vue";
import CostTableMenu from "./components/CostTableMenu.vue";
import TheFooter from "./components/TheFooter.vue";
import { ChargeType, DBInstance, EngineType } from "./types";
import { useDBInstanceStore } from "./stores/dbInstance";
import aws from "../../store/data/test/aws-full.json";

import { reactive } from "vue";

const dbInstanceStore = useDBInstanceStore();
dbInstanceStore.dbInstanceList = aws as DBInstance[];

interface LocalState {
  selectedRegionList: string[];
  selectedChargeType: ChargeType;
  selectedEngineType: EngineType;
}

const state = reactive<LocalState>({
  selectedRegionList: [],
  selectedChargeType: "OnDemand",
  selectedEngineType: "MYSQL",
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
</script>

<style></style>
