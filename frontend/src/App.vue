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
      @update-region="handleUpdateRegion"
      @update-charge-type="handleUpdateChargeType"
    />
  </div>

  <!-- dashboard -->
  <div class="mx-5 mt-5">
    <cost-table
      :db-instance-list="dbInstanceStore.dbInstanceList"
      :region-list="state.selectedRegionList"
      :charge-type="state.selectedChargeType"
    />
  </div>

  <the-footer class="px-3 my-5" />
</template>

<script setup lang="ts">
import CostTable from "./components/CostTable.vue";
import CostTableMenu from "./components/CostTableMenu.vue";
import TheFooter from "./components/TheFooter.vue";
import { ChargeType, DBInstance } from "./types";
import { useDBInstanceStore } from "./stores/dbInstance";
import aws from "../../store/data/test/aws-full.json";

import { reactive } from "vue";

const dbInstanceStore = useDBInstanceStore();
dbInstanceStore.dbInstanceList = aws as DBInstance[];

interface LocalState {
  selectedRegionList: string[];
  selectedChargeType: ChargeType;
}

const state = reactive<LocalState>({
  selectedRegionList: ["Asia Pacific (Sydney)"],
  selectedChargeType: "OnDemand",
});

const handleUpdateRegion = (val: string[]) => {
  console.log("app", val);
  state.selectedRegionList = val;
};

const handleUpdateChargeType = (val: ChargeType) => {
  state.selectedChargeType = val;
};
</script>

<style></style>
