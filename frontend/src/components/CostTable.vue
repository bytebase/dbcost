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
    title: "Memory",
    key: "memory",
  },
  {
    title: "Price",
    key: "price",
  },
];

const store = useDBInstanceStore();
</script>

<style scoped></style>
