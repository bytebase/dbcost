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
      :region="selectedRegion"
      :charge-type="selectedChargeType"
    />
  </div>

  <!-- dashboard -->
  <div class="mx-5 mt-5">
    <cost-table
      :db-instance-list="my_asw"
      :region="selectedRegion"
      :charge-type="selectedChargeType"
    />
  </div>

  <the-footer class="px-3 my-5" />
</template>

<script setup lang="ts">
import CostTable from "./components/CostTable.vue";
import CostTableMenu from "./components/CostTableMenu.vue";
import TheFooter from "./components/TheFooter.vue";
import { ChargeType, DBInstance } from "./types";
import aws from "../../store/data/test/aws-full.json";

const my_asw = aws as DBInstance[];

const selectedRegion = "us-east-1";
const selectedChargeType: ChargeType = "OnDemand";
</script>

<style></style>
