<template>
  <n-data-table
    :columns="columns"
    :data="dataRow"
    :loading="isLoading"
    :checked-row-keys="checkedRowKeys"
    @update-checked-row-keys="(rowKeys:any[])=>emit('update-checked-row-keys', rowKeys)"
  />
</template>
<script setup lang="ts">
import { NDataTable, NTooltip } from "naive-ui";
import { PropType, h, computed } from "vue";
import { getDiff, getDigit, getIconPath } from "@/util";
import { compareTableCostComparer, dashboardCostComparer } from "./util";

import { DataRow } from "@/types";

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
  showDiff: { type: Boolean, default: false },
  showEngineType: { type: Boolean, default: false },
  showLeaseLength: { type: Boolean, default: false },
  utilization: { type: Number, default: 1 },
  leaseLength: { type: Number, default: 1 },
});

const ProviderIconRender = {
  GCP: h(
    "img",
    {
      src: getIconPath("gcp.png"),
      class: "mr-1 mb-0.5 inline h-2",
    },
    {}
  ),
  AWS: h(
    "img",
    {
      src: getIconPath("aws.png"),
      class: "mr-1 mb-0.5 inline h-2",
    },
    {}
  ),
};

const EngineIconRender = {
  MYSQL: h(
    "img",
    {
      src: getIconPath("db-mysql.png"),
      class: "py-1 h-6",
    },
    {}
  ),
  POSTGRES: h(
    "img",
    {
      src: getIconPath("db-postgres.png"),
      class: "py-1 h-6",
    },
    {}
  ),
};

const router = useRouter();
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
      return h(
        "span",
        { class: "font-mono" },
        `$${getDigit(row.hourly.usd, 2)}`
      );
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
  expectedCost: {
    title: "Expected Cost",
    key: "expectedCost",
    align: "right",
    defaultSortOrder: "ascend",
    sorter: {
      compare:
        router.currentRoute.value.name === "compare"
          ? compareTableCostComparer
          : dashboardCostComparer,
      multiple: 2,
    },
    render: (row: DataRow) =>
      h(
        NTooltip,
        {},
        {
          default: () =>
            `$${getDigit(
              row.expectedCost,
              2
            )} is calculated based on utilization ${(
              props.utilization * 100
            ).toFixed(0)}% for ${props.leaseLength} year${
              props.leaseLength > 1 ? "s" : ""
            } lease`,
          trigger: () =>
            h(
              "span",
              { class: "font-mono" },
              `
              $${getDigit(row.expectedCost, 0)}
              ${
                row.leaseLength !== "N/A" && props.showDiff
                  ? "(" +
                    (
                      getDiff(row, props.utilization, props.leaseLength) * 100
                    ).toFixed(0) +
                    "%)"
                  : ""
              }
              `
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

  col.push(pricingContent.expectedCost);
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
        rowSpan: (rowData: DataRow) => {
          return rowData.childCnt;
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
          const cpuRender = h(
            "div",
            { class: "inline-block text-right w-6 font-mono" },
            row.cpu
          );

          return h(
            NTooltip,
            {},
            {
              default: () =>
                row.processor === "" ? "N/A" : row.processor.split(" ")[1],
              trigger: () => cpuRender,
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
</script>
