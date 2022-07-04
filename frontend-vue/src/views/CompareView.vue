<template>
  <div class="mx-5">
    <h1 class="font-semibold text-4xl text-center my-4">
      Cloud Database Instance Compare Sheet
    </h1>

    <div class="mb-4 justify-center space-x-2 flex">
      <n-button @click="router.push({ name: 'dashboard' })"
        >Back To Dashboard</n-button
      >
      <n-button @click="copyURL">Copy URL</n-button>
    </div>

    <div class="border-b mb-2 pb-2 flex justify-end">
      <cost-table-slider
        :utilization="searchConfigStore.searchConfig.utilization"
        :lease-length="searchConfigStore.searchConfig.leaseLength"
        @update-utilization="handleUpdateUtilization"
        @update-lease-length="handleUpdateLeaseLength"
      />
    </div>
    <!-- selected dashboard -->
    <div class="border-b mb-2 pb-2">
      <cost-table
        :utilization="searchConfigStore.searchConfig.utilization"
        :lease-length="searchConfigStore.searchConfig.leaseLength"
        :allow-select="false"
        :is-loading="false"
        :is-expended="true"
        :data-row="dataTableItemStore.checkedDataRow"
      />
    </div>
    <!-- chart -->
    <chart-tab :data="dataTableItemStore.checkedDataRow" />
  </div>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDataTableItemStore, useSearchConfigStore } from "../stores";
import { RouteQueryCompare } from "../types";
import { NButton, useNotification } from "naive-ui";

const dataTableItemStore = useDataTableItemStore();
const searchConfigStore = useSearchConfigStore();
const router = useRouter();
onMounted(() => {
  const query: RouteQueryCompare = router.currentRoute.value.query;
  dataTableItemStore.loadCheckedDataRowByKey(
    query.instance?.split(",") as string[]
  );
});

const handleUpdateUtilization = (val: number) => {
  searchConfigStore.searchConfig.utilization = val;
  dataTableItemStore.refreshExpectedCost();
};
const handleUpdateLeaseLength = (val: number) => {
  searchConfigStore.searchConfig.leaseLength = val;
  dataTableItemStore.refreshExpectedCost();
};

const notification = useNotification();
const copyURL = () => {
  navigator.clipboard
    .writeText(document.location.href)
    .then(() => {
      notification.success({
        content: "Successfully copied to clipboard",
        duration: 2000,
      });
    })
    .catch(() => {
      notification.error({
        content: "Fail to copy, please try again",
        duration: 2000,
      });
    });
};
</script>
