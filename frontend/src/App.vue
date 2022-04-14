<template>
  <!-- header -->
  <div class="inset-0">
    <div class="px-5 pt-5">
      <span class="font-bold text-lg">DB COST</span>
      <img
        class="w-5 ml-5 inline float-right"
        src="./assets/icon/logo-icon.svg"
        alt="Bytebase"
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
      :db-instance-list="aws"
      :region="selectedRegion"
      :charge-type="selectedChargeType"
    />
  </div>
</template>

<script setup lang="ts">
import CostTable from "./components/CostTable.vue";
import CostTableMenu from "./components/CostTableMenu.vue";
import { ChargeType } from "./types";
import aws from "../../store/data/test/aws-full.json";

const selectedRegion = "us-east-1";
const selectedChargeType: ChargeType = "OnDemand";
</script>

<style></style>
