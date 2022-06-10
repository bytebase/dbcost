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

    <div class="border-b mb-2 pb-2">
      <cost-table-slider
        :utilization="state.utilization"
        :rent-year="state.rentYear"
        @update-utilization="(val:number) => (state.utilization = val)"
        @update-lease-length="(val:number) => (state.rentYear = val)"
      />
    </div>
    <!-- selected dashboard -->
    <div class="border-b mb-2 pb-2">
      <cost-table
        :utilization="state.utilization"
        :rent-year="state.rentYear"
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
import { onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { useDataTableItemStore } from "../stores";
import { RouteQueryCompare } from "../types";
import { NButton, useNotification } from "naive-ui";

const dataTableItemStore = useDataTableItemStore();
const router = useRouter();
onMounted(() => {
  const query: RouteQueryCompare = router.currentRoute.value.query;
  useDataTableItemStore().loadCheckedDataRowByKey(
    query.instance?.split(",") as string[]
  );
});

interface LocalState {
  utilization: number;
  rentYear: number;
}

const state = reactive<LocalState>({
  utilization: 1,
  rentYear: 1,
});

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
