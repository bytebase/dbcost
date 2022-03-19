<template>
  <cost-table />
</template>

<script setup lang="ts">
import CostTable from "./components/CostTable.vue";
import aws from "../../store/example/aws-raw.json";
import {
  AWSConvertor,
  AWSDBInstanceAttributeAdaptor,
  DBInstance,
} from "./types";
import { useDBInstanceStore } from "./stores/dbInstance";

const store = useDBInstanceStore();

const dbInstanceList = Object.entries(aws.products).reduce((pre, cur) => {
  if (cur[1].productFamily !== "Database Instance") {
    return pre;
  }
  const attr = cur[1].attributes;
  const converted = AWSConvertor(attr, AWSDBInstanceAttributeAdaptor);
  return pre.concat(converted);
}, [] as DBInstance[]);

store.dbInstanceList = dbInstanceList;
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
