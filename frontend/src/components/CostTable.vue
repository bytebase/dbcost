<template>
  <n-data-table :columns="columns" :data="store.dbInstanceList"></n-data-table>
</template>

<script setup lang="ts">
import { NDataTable } from "naive-ui";
import { useDBInstanceStore } from "../stores/dbInstance";

const columns = [
  {
    title: "Name",
    key: "name",
  },
  {
    title: "vCPU",
    key: "vCPU",
  },
  {
    title: "Processor",
    key: "processor",
  },
  {
    title: "Memory",
    key: "memory",
  },
  {
    title: "On Demand",
    key: "price",
  },
  {
    title: "Reserved",
    key: "price",
  },
];

const store = useDBInstanceStore();
</script>

<style scoped></style>
