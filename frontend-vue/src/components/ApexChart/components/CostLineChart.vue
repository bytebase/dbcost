<template>
  <div>
    <vue-apex-charts
      type="line"
      ref="chart"
      :options="options"
      :series="series"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref, PropType, computed } from "vue";
import { xkcdify } from "../utils";
import { DataRow } from "../../../types";
import VueApexCharts from "vue3-apexcharts";

const chart = ref();
const props = defineProps({
  data: {
    type: Array as PropType<DataRow[]>,
    default: [],
  },
});

const toggleSeries = (seriesName: string) => {
  chart.value.toggleSeries(seriesName);
};

// Setup syntactic sugar will not expose any method within <script> block.
// We need to expose explicitly.
defineExpose({
  toggleSeries,
});

const getXGrid = () => {
  for (const row of props.data) {
    if (row.leaseLength.includes("3")) {
      const res = [];
      for (let i = 0; i < 36; i += 4) {
        res.push(i);
      }
      return res;
    }
  }

  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
};

const monthInHour = 30 * 24;
const availableRate = 1;
const options = computed(() => {
  let xGrid = getXGrid();
  return {
    title: {
      text: "Total Cost",
      align: "Middle",
      margin: 10,
    },
    chart: {
      toolbar: { show: false },
      fontFamily: "xkcd",
      events: {
        // The dom element is not available until the dom is mounted.
        // So we update this when everything is ready.
        // animationEnd: chart.value
        //   ? xkcdify.bind(this, chart.value.$el as HTMLElement, [])
        //   : undefined,
      },
    },
    xaxis: {
      categories: xGrid,
      title: {
        text: "Month",
      },
    },
    yaxis: {
      forceNiceScale: true,
      title: {
        text: "USD",
      },
    },
    stroke: {
      show: true,
      width: 3,
      dashArray: 0,
    },

    legend: {
      position: "bottom",
      horizontalAlign: "center",

      showForSingleSeries: true,
      show: props.data.length > 0,
    },

    tooltip: {
      x: {
        show: true,
        formatter: (i: number) => {
          return `Total cost of the first ${i} month`;
        },
      },
      y: {
        formatter: (i: number) => {
          return `${i} USD`;
        },
      },
    },
  };
});

const series = computed(() => {
  let xGrid = getXGrid();

  const res = [];
  for (const row of props.data) {
    const fees = [];
    let commitmentCycle = 999999;
    if (row.leaseLength === "1yr") {
      commitmentCycle = 12;
    }
    if (row.leaseLength === "3yr") {
      commitmentCycle = 36;
    }

    for (const x of xGrid) {
      const commitmentPayTime = 1 + Math.trunc(x / commitmentCycle);
      const totalCost =
        x * monthInHour * availableRate * row.hourly.usd +
        commitmentPayTime * row.commitment.usd;
      fees.push(Math.trunc(totalCost));
    }
    res.push({
      name: `${row.cloudProvider} - ${row.name} - ${row.region} - ${
        row.engineType
      }${row.leaseLength === "N/A" ? "" : "-" + row.leaseLength}`,
      data: fees,
    });
  }

  return res;
});
</script>
