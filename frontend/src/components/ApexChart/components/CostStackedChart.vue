<template>
  <div>
    <vue-apex-charts
      type="bar"
      ref="chart"
      :options="options"
      :series="series"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref, PropType, computed } from "vue";
import { DataRow } from "../../CostTable";
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
  const res = [];
  for (const i in props.data) {
    res.push(`Instance-${i}`);
  }

  return res;
};

const options = computed(() => {
  let xGrid = getXGrid();
  return {
    title: {
      text: "Yearly Cost",
      align: "Middle",
      margin: 10,
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    chart: {
      toolbar: { show: false },
      fontFamily: "xkcd",
      stacked: true,
    },
    xaxis: {
      categories: xGrid,
      title: {
        text: "USD",
      },
      labels: {
        formatter: (val: number) => "$" + val,
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => {
          return "$" + val;
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      offsetX: 40,
    },
  };
});

const yearInHour = 365 * 24;
const availableRate = 1;
const series = computed(() => {
  const onDemandRes = [];
  const commitmentRes = [];

  for (const row of props.data) {
    const onDemandYearly = row.hourly.usd * yearInHour * availableRate;
    let commitmentYearly = row.commitment.usd;
    if (row.leaseLength === "3yr") {
      commitmentYearly /= 3;
    }

    onDemandRes.push(Math.trunc(onDemandYearly));
    commitmentRes.push(Math.trunc(commitmentYearly));
  }
  return [
    { name: "Commitment", data: commitmentRes },
    { name: "On Demand", data: onDemandRes },
  ];
});
</script>
