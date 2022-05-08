<template>
  <n-data-table
    :row-key="(row) => row.id"
    :columns="columns"
    :data="dataRow"
    :loading="isLoading"
  />
</template>
<script setup lang="ts">
import { NDataTable, NAvatar, NTag, NTooltip } from "naive-ui";
import { PropType, h, computed } from "vue";

import { DataRow } from "./";

const EngineIconRender = {
  MYSQL: h(
    NAvatar,
    {
      src: new URL("../../assets/icon/db-mysql.png", import.meta.url).href,
      size: 16,
      class: "mt-1",
      color: "none",
    },
    {}
  ),
  POSTGRES: h(
    NAvatar,
    {
      src: new URL("../../assets/icon/db-postgres.png", import.meta.url).href,
      size: 16,
      class: "mt-1",
      color: "none",
    },
    {}
  ),
};

// pricingContent is the col of the pricing, we need to dynamic render this section.
// e.g. when user only select single engine, the engine icon is unnecessary
const pricingContent = {
  commitmentWithEngine: {
    title: "Commitment",
    align: "right",
    render: (row: DataRow) => {
      let engineIcon;
      if (row.engineType === "MYSQL") {
        engineIcon = EngineIconRender.MYSQL;
      } else if (row.engineType === "POSTGRES") {
        engineIcon = EngineIconRender.POSTGRES;
      }
      return h("div", { class: "justify-between flex" }, [
        engineIcon,
        h("div", {}, `$${row.commitment.usd}`),
      ]);
    },
  },
  commitmentWithoutEngine: {
    title: "Commitment",
    align: "right",
    render: (row: DataRow) => {
      return `$${row.commitment.usd}`;
    },
  },
  hourlyPay: {
    title: "Hourly Pay",
    align: "right",
    render: (row: DataRow) => {
      return `$${row.hourly.usd.toFixed(2)}`;
    },
  },
  leaseLength: {
    title: "Lease Length",
    key: "leaseLength",
    align: "right",
  },
};

// the order of the array will affect the order of the column of the table
// the desired order is: [engine, hourly pay, commitment, lease length]
const getPricingContent = () => {
  const col = [];
  if (props.showEngineType) {
    col.push(pricingContent.commitmentWithEngine);
  } else {
    col.push(pricingContent.commitmentWithoutEngine);
  }
  col.push(pricingContent.hourlyPay);
  if (props.showLeaseLength) {
    col.push(pricingContent.leaseLength);
  }

  return col;
};

const columns: any = computed(() => [
  {
    title: "Name",
    key: "name",
    ellipsis: {
      tooltip: true,
    },
    rowSpan: (rowData: DataRow) => {
      return rowData.childCnt;
    },
  },
  {
    title: "Region",
    key: "region",
    ellipsis: {
      tooltip: true,
    },
    sorter: {
      // sort by the case-insensitive alphabetical order
      compare: (row1: DataRow, row2: DataRow) => {
        const a = row1.region.toLocaleLowerCase();
        const b = row2.region.toLocaleLowerCase();
        const len = a.length > b.length ? b.length : a.length;
        for (let i = 0; i < len; i++) {
          if (a[i] < b[i]) {
            return false;
          } else if (a[i] > b[i]) {
            return true;
          }
        }

        // if tow region are identical, sort them with id
        if (a.length == b.length) {
          return row1.id - row2.id;
        }

        return a.length - b.length;
      },
      multiple: 1,
    },
    rowSpan: (rowData: DataRow) => {
      return rowData.childCnt;
    },
  },
  {
    title: "CPU",
    key: "cpu",
    align: "right",
    sorter: {
      compare: (row1: DataRow, row2: DataRow) => row1.cpu - row2.cpu,
      multiple: 2,
    },
    rowSpan: (rowData: DataRow) => {
      return rowData.childCnt;
    },
    ellipsis: {
      tooltip: false,
    },
    render(row: DataRow) {
      let shortenProcessor = "";
      if (window.innerWidth > 1080) {
        shortenProcessor = row.processor.split(" ").slice(0, 2).join(" ");
      } else if (window.innerWidth > 800) {
        shortenProcessor = row.processor.split(" ")[0];
      }

      // if the screen is too short, hide the processor
      let render: any;
      if (window.innerWidth > 800) {
        render = h("div", {}, [
          h(
            NTag,
            {
              round: true,
              class: "inline mr-2 ",
              type: row.processor === "" ? "warning" : "info",
              size: "small",
              bordered: false,
            },
            {
              default: () => (row.processor === "" ? "N/A" : shortenProcessor),
            }
          ),
          h("div", { class: "inline-block text-right w-6" }, row.cpu),
        ]);
      } else {
        // if the screen is too short, hide the processor
        render = row.cpu;
      }

      return h(
        NTooltip,
        {},
        {
          default: () => (row.processor === "" ? "N/A" : row.processor),
          trigger: () => render,
        }
      );
    },
  },
  {
    title: "Memory",
    key: "memory",
    align: "right",
    defaultSortOrder: false,
    sorter: {
      compare: (row1: DataRow, row2: DataRow) =>
        Number(row1.memory) - Number(row2.memory),
      multiple: 2,
    },
    rowSpan: (rowData: DataRow) => {
      return rowData.childCnt;
    },
  },
  {
    title: "Pricing",
    key: "pricing",
    align: "center",
    children: getPricingContent(),
    ellipsis: {
      tooltip: true,
    },
  },
]);

const props = defineProps({
  dataRow: {
    type: Array as PropType<DataRow[]>,
    default: () => [],
  },
  isLoading: { type: Boolean, default: () => false },
  showEngineType: { type: Boolean, default: () => false },
  showLeaseLength: { type: Boolean, default: () => false },
});
</script>
