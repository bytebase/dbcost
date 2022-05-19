<template>
  <div class="mx-5">
    <h1 class="font-semibold text-4xl text-center my-4">
      Cloud Database Instance Compare Sheet
    </h1>
    <!-- selected dashboard -->
    <div class="border-b mb-4">
      <cost-table
        :is-loading="false"
        :is-expended="true"
        :data-row="dataTableItemStore.dataRow"
        :checked-row-keys="dataTableItemStore.checkedRowKey"
      />
    </div>
    <!-- chart -->
    <chart-tab :data="dataTableItemStore.dataRow" />
  </div>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { useDataTableItemStore, useDBInstanceStore } from "../stores";

const dbInstanceStore = useDBInstanceStore();
dbInstanceStore.loadDBInstanceList();

const dataTableItemStore = useDataTableItemStore();

onMounted(() => {
  dataTableItemStore.refresh();
});
</script>
