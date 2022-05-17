<template>
  <div>
    <spec-bubble-chart
      ref="bubbleChart"
      style="width: 100%"
      :data="data"
      @legend-click="handleLegendClick"
    />
    <cost-line-chart ref="lineChart" style="width: 100%" :data="data" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, PropType, ref } from "vue";
import { DataRow } from "../CostTable";

const lineChart = ref();

defineProps({
  data: {
    type: Object as PropType<DataRow[]>,
    default: [],
  },
});

const handleLegendClick = (legendName: string) => {
  // lineChart.value.toggleSeries(legendName);
  lineChart.value.toggleSeries(legendName);
};
onMounted(() => {
  console.log(lineChart.value);
});
</script>
