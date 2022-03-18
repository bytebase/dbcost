<template>
  <n-data-table :columns="columns"></n-data-table>
</template>

<script setup lang="ts">
import { DBInstance } from "../types";
import { NDataTable } from "naive-ui";

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

const props = defineProps<{
  dbInstanceList?: DBInstance[];
}>();
</script>

<style scoped></style>
