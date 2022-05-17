<template>
  <div>
    <div class="justify-center flex items-center">
      <spec-bubble-chart
        class="max-w-xl w-1/2"
        ref="bubbleChart"
        :data="data"
        @legend-click="handleLegendClick"
      />
      <cost-line-chart class="max-w-lg w-1/2" ref="lineChart" :data="data" />
    </div>
    <div class="justify-center flex items-center">
      <cost-stacked-chart class="w-2/3" :data="data" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref } from "vue";
import { DataRow } from "../CostTable";

const lineChart = ref();

defineProps({
  data: {
    type: Object as PropType<DataRow[]>,
    default: [],
  },
});

const handleLegendClick = (legendName: string) => {
  lineChart.value.toggleSeries(legendName);
};
</script>
