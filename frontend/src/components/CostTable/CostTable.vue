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
import { NDataTable, NAvatar, NTooltip } from "naive-ui";
import { PropType, h, computed } from "vue";
import { getDiff, getDigit } from "../../util";

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
  showDiff: { type: Boolean, default: false },
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
      class: "mr-1 pt-0.5",
      color: "none",
    },
    {}
  ),
  AWS: h(
    NAvatar,
    {
      src: new URL("../../assets/icon/aws.png", import.meta.url).href,
      size: 12,
      class: " mr-1 py-0.5",
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
  cost: {
    title: "Expected Cost",
    key: "cost",
    align: "right",
    defaultSortOrder: "ascend",
    sorter: {
      // we sort the price col by the baseline(on demand) price
      compare: (row1: DataRow, row2: DataRow) => {
        if (row1.baseHourly === row2.baseHourly) {
          if (row1.id === row2.id) {
            if (row1.childCnt === row2.childCnt) {
              if (row1.leaseLength !== "N/A" && row2.leaseLength !== "N/A") {
                return row1.expectedCost - row2.expectedCost;
              }
              // put the on demand type at the top
              if (row1.leaseLength === "N/A") {
                return -1;
              } else {
                return 1;
              }
            }
            // make sure that the on demand type is always at the top
            return row2.childCnt - row1.childCnt;
          }
          return row1.id - row2.id;
        }
        return row1.baseHourly - row2.baseHourly;
      },
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
            ).toFixed(0)}% for ${props.rentYear} year${
              props.rentYear > 1 ? "s" : ""
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
                      getDiff(row, props.utilization, props.rentYear) * 100
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
