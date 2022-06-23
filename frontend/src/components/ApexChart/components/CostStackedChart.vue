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
import { DataRow } from "../../../types";
import VueApexCharts from "vue3-apexcharts";
import { getRegionName } from "../../../util";

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
  // <<Name>> << Region>>  Reserved | On Demand
  for (const item of props.data) {
    getRegionName;
    res.push(
      `
      ${item.name}
      ${item.region.split(")")[0].split(" (")[1]}
      ${item.leaseLength === "N/A" ? "On Demand" : "Reserved"}
      `
    );
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
        horizontal: false,
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
        text: "Instance",
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
      horizontalAlign: "right",
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
  const res = [];
  if (commitmentRes.filter((val) => val !== 0).length != 0) {
    res.push({ name: "Commitment", data: commitmentRes });
  }

  if (onDemandRes.filter((val) => val !== 0).length != 0) {
    res.push({ name: "On Demand", data: onDemandRes });
  }

  return res;
});
</script>
