<template>
  <div>
    <vue-apex-charts
      ref="chart"
      type="scatter"
      :options="options"
      :series="series"
      @legend-click="handleLegendClick"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref, PropType, computed } from "vue";
import { xkcdify } from "../utils";
import { DataRow } from "../../../types";
import VueApexCharts from "vue3-apexcharts";
import { ApexOptions } from "apexcharts";

const chart = ref();
const props = defineProps({
  data: {
    type: Array as PropType<DataRow[]>,
    default: [],
  },
});

const emit = defineEmits<{
  (e: "legend-click", clickedSeriesName: string): void;
}>();

const handleLegendClick = (
  chart: any,
  seriesIndex: number,
  globalContext: { config: ApexOptions }
) => {
  const clickedSeries = globalContext.config.series?.at(seriesIndex) as {
    name: string;
  };
  emit("legend-click", clickedSeries.name);
};

const options = computed(() => {
  let maxCPU = -1;
  let maxRAM = -1;
  for (const row of props.data) {
    maxCPU = Math.max(Number(row.cpu), maxCPU);
    maxRAM = Math.max(Number(row.memory), maxRAM);
  }

  return {
    chart: {
      toolbar: { show: false },
      fontFamily: "xkcd",
      events: {
        // The dom element is not available until the dom is mounted.
        // So we update this when everything is ready.
        // updated: chart.value
        //   ? xkcdify.bind(this, chart.value.$el as HTMLElement, [])
        //   : undefined,
      },
    },
    dataLabels: {
      enabled: false,
    },
    title: {
      text: "Specification",
      align: "Middle",
      margin: 10,
    },
    fill: {
      opacity: 0.8,
    },
    xaxis: {
      forceNiceScale: true,
      tickAmount: 5,
      max: maxCPU,
      min: 1,
      title: {
        text: "CPU / Core",
      },
    },
    yaxis: {
      forceNiceScale: true,
      tickAmount: 5,
      max: maxRAM,
      min: 1,
      title: {
        text: "RAM / GiB",
      },
    },
    stroke: {
      show: true,
      width: 4,
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
        formatter: (
          value: string,
          { series, seriesIndex, dataPointIndex, w }: any
        ) => {
          return "";
        },
        title: {
          formatter: (seriesName: string) => seriesName,
        },
      },
      y: {
        formatter: (
          value: number,
          { series, seriesIndex, dataPointIndex, w }: any
        ) => {
          const data = w.config.series[seriesIndex].data[0];
          const CPU = data[0];
          const RAM = data[1];
          return `${CPU} core, ${RAM} GiB\n`;
        },
        title: {
          formatter: (
            value: number,
            { series, seriesIndex, dataPointIndex, w }: any
          ) => {
            const name = w.config.series[seriesIndex].name;
            return name.split(" - ")[1];
          },
        },
      },
      z: {
        title: "",
      },
    },
  };
});

const series = computed(() => {
  const res = [];
  for (const row of props.data) {
    res.push({
      name: `${row.cloudProvider} - ${row.name} - ${row.region} - ${
        row.engineType
      }${row.leaseLength === "N/A" ? "" : "-" + row.leaseLength}`,
      data: [
        [
          row.cpu,
          row.memory,
          `Hourly: $${row.hourly.usd}  Commitment: $${row.commitment.usd}  Lease Length: ${row.leaseLength}`,
        ],
      ],
    });
  }
  return res;
});
</script>
