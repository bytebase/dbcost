<template>
  <n-data-table
    :columns="columns"
    :data="dataRow"
    :loading="isLoading"
    :checked-row-keys="checkedRowKeys"
    @update-checked-row-keys="handleCheckRowKeys"
  />
</template>
<script setup lang="ts">
import { NDataTable, NAvatar, NTag, NTooltip } from "naive-ui";
import { PropType, h, computed } from "vue";
import { getPrice } from "../../util";

import { DataRow } from "./";

const props = defineProps({
  dataRow: {
    type: Array as PropType<DataRow[]>,
    default: () => [],
  },
  checkedRowKeys: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  allowSelect: {
    type: Boolean,
    default: true,
  },
  isLoading: { type: Boolean, default: false },
  showEngineType: { type: Boolean, default: false },
  showLeaseLength: { type: Boolean, default: false },
  utilization: { type: Number, default: 1 },
  rentYear: { type: Number, default: 1 },
});

const ProviderIconRender = {
  GCP: h(
    NAvatar,
    {
      src: new URL("../../assets/icon/gcp.png", import.meta.url).href,
      size: 12,
      class: "align-middle mb-1 mr-1",
      color: "none",
    },
    {}
  ),
  AWS: h(
    NAvatar,
    {
      src: new URL("../../assets/icon/aws.png", import.meta.url).href,
      size: 16,
      class: "align-middle mr-1",
      color: "none",
    },
    {}
  ),
};

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
      return h("span", { class: "font-mono" }, `$${row.commitment.usd}`);
    },
  },
  hourlyPay: {
    title: "Hourly",
    align: "right",
    render: (row: DataRow) => {
      return h("span", { class: "font-mono" }, `$${row.hourly.usd.toFixed(2)}`);
    },
  },
  leaseLength: {
    title: "Lease Length",
    key: "leaseLength",
    align: "right",
    render: (row: DataRow) => {
      return h("span", { class: "font-mono" }, row.leaseLength);
    },
  },
  cost: {
    title: "Expected Cost",
    key: "cost",
    align: "right",
    render: (row: DataRow) =>
      h(
        NTooltip,
        {},
        {
          default: `This cost is derived under the available rate of ${(
            props.utilization * 100
          ).toFixed(0)}% for ${props.rentYear} year${
            props.rentYear > 1 ? "s" : ""
          }`,
          trigger: h(
            "span",
            { class: "font-mono" },
            `$${getPrice(row, props.utilization, props.rentYear).toFixed(0)}`
          ),
        }
      ),
  },
};

// the order of the array will affect the order of the column of the table
// the desired order is: [engine, hourly pay, commitment, lease length]
const getPricingContent = () => {
  const col = [];
  if (props.showLeaseLength) {
    col.push(pricingContent.leaseLength);
  }
  if (props.showEngineType) {
    col.push(pricingContent.commitmentWithEngine);
  } else {
    col.push(pricingContent.commitmentWithoutEngine);
  }
  col.push(pricingContent.hourlyPay);

  col.push(pricingContent.cost);
  return col;
};

const columns: any = computed(() => {
  let res = [];
  if (props.allowSelect) {
    res.push({
      type: "selection",
    });
  }
  res.push(
    ...[
      {
        title: "Name",
        key: "name",
        ellipsis: {
          tooltip: true,
        },
        rowSpan: (rowData: DataRow) => {
          return rowData.childCnt;
        },
        render(row: DataRow) {
          if (row.cloudProvider === "AWS") {
            return [ProviderIconRender.AWS, row.name];
          } else if (row.cloudProvider === "GCP") {
            return [ProviderIconRender.GCP, row.name];
          }

          return row.name;
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
            const stringComp = a.localeCompare(b);
            if (stringComp !== 0) {
              return stringComp;
            }

            // if tow region are identical, sort them with id
            return row1.id - row2.id;
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
          const cpuRender = h(
            "div",
            { class: "inline-block text-right w-6 font-mono" },
            row.cpu
          );

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
                  default: () =>
                    row.processor === "" ? "N/A" : shortenProcessor,
                }
              ),
              cpuRender,
            ]);
          } else {
            // if the screen is too short, hide the processor
            render = cpuRender;
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
        render(row: DataRow) {
          return h("span", { class: " font-mono" }, row.memory);
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
    ]
  );
  return res;
});

const emit = defineEmits<{
  (e: "update-checked-row-keys", checkedRowKeys: string[]): void;
}>();

const handleCheckRowKeys = (rowKeys: any[]) => {
  emit("update-checked-row-keys", rowKeys);
};
</script>
