<template>
  <cost-table />
</template>

<script setup lang="ts">
import CostTable from "./components/CostTable.vue";
import aws from "../../store/data/test/aws.json";
import { useDBInstanceStore } from "./stores/dbInstance";

const store = useDBInstanceStore();
store.dbInstanceList = aws;
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
