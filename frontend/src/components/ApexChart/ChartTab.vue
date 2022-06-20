<template>
  <div>
    <n-tabs
      default-value="total-cost"
      justify-content="space-evenly"
      type="segment"
    >
      <!-- hide this for now -->
      <!-- <n-tab-pane name="specification">
        <template #tab>
          <span class="font-semibold text-base">Specification</span>
        </template>
        <spec-bubble-chart class="mx-4" ref="bubbleChart" :data="data" />
      </n-tab-pane> -->
      <n-tab-pane name="total-cost" tab="Total Cost">
        <template #tab>
          <span class="font-semibold text-base">Total Cost</span>
        </template>
        <cost-line-chart class="mx-4" ref="lineChart" :data="data" />
      </n-tab-pane>
      <n-tab-pane name="yearly-cost" tab="Yearly Cost">
        <template #tab>
          <span class="font-semibold text-base">Yearly Cost</span>
        </template>
        <cost-stacked-chart class="mx-4" :data="data" />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref } from "vue";
import { NTabs, NTabPane } from "naive-ui";
import { DataRow } from "../../types";

const lineChart = ref();

defineProps({
  data: {
    type: Object as PropType<DataRow[]>,
    default: [],
  },
});
</script>
