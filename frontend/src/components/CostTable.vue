<template>
  <n-data-table :columns="columns" :data="state.dataRow" />
</template>

<script setup lang="ts">
import { NDataTable, NAvatar, NTag, NTooltip } from "naive-ui";
import { DBInstance } from "../types/dbInstance";
import { PropType, watch, reactive, onMounted, h, computed } from "vue";
import { SearchConfig } from "../types";
import { getRegionCode, getRegionName } from "../util";

const EngineIconRender = {
  MYSQL: h(
    NAvatar,
    {
      src: new URL("../assets/icon/db-mysql.png", import.meta.url).href,
      size: 16,
      class: "mt-1",
      color: "none",
    },
    {}
  ),
  POSTGRES: h(
    NAvatar,
    {
      src: new URL("../assets/icon/db-postgres.png", import.meta.url).href,
      size: 16,
      class: "mt-1",
      color: "none",
    },
    {}
  ),
};

const ProviderIconRender = {
  GCP: h(
    NAvatar,
    {
      src: new URL("../assets/icon/gcp.png", import.meta.url).href,
      size: 12,
      class: "align-middle mb-1 mr-1",
      color: "none",
    },
    {}
  ),
  AWS: h(
    NAvatar,
    {
      src: new URL("../assets/icon/aws.png", import.meta.url).href,
      size: 16,
      class: "align-middle mr-1",
      color: "none",
    },
    {}
  ),
};

type DataRow = {
  id: number;

  cloudProvider: string;
  name: string;
  processor: string;
  cpu: number;
  memory: string;
  leaseLength: string;
  region: string;
  engineType: string;
  commitment: { usd: number };
  hourly: { usd: number };

  childCnt: number;
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
  const config = props.config;
  const col = [];
  // we show the engine icon when user select muti-engine
  if (config.engineType && config.engineType.length > 1) {
    col.push(pricingContent.commitmentWithEngine);
  } else {
    col.push(pricingContent.commitmentWithoutEngine);
  }
  col.push(pricingContent.hourlyPay);
  // we show the lease length only when user select 'Reserved' charge type or muti-chargeType
  const chargeTypeSet = new Set(config.chargeType);
  if (chargeTypeSet.size > 1 || chargeTypeSet.has("Reserved")) {
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

        // if tow region are identical, sort them with instance's id
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
  dbInstanceList: {
    type: Array as PropType<DBInstance[]>,
    default: () => [],
  },
  config: {
    type: Object as PropType<SearchConfig>,
    default: () => {},
  },
});

interface LocalState {
  dataRow: DataRow[];
}

const state = reactive<LocalState>({
  dataRow: [],
});

watch(
  () => props.config,
  () => {
    refreshDataTable();
  },
  {
    deep: true,
  }
);

const refreshDataTable = () => {
  state.dataRow = [];
  let rowCnt = 0;
  const config = props.config;
  const dbInstanceList = props.dbInstanceList;

  if (!config.region && !config.engineType && !config.chargeType) {
    return;
  }

  const regionCodeList: string[] = [];
  config.region?.forEach((regionName) => {
    regionCodeList.push(...getRegionCode(regionName));
  });
  const selectedRegionCodeSet = new Set(regionCodeList);
  const engineSet = new Set(config.engineType);
  const chargeTypeSet = new Set(config.chargeType);

  dbInstanceList.forEach((dbInstance) => {
    if (
      (config.minRAM && Number(dbInstance.memory) < config.minRAM) ||
      (config.minCPU && Number(dbInstance.cpu) < config.minCPU)
    ) {
      return;
    }

    const selectedRegionList = dbInstance.regionList.filter((region) => {
      if (selectedRegionCodeSet.has(region.code)) {
        return true;
      }
      return false;
    });
    // no region found
    if (selectedRegionList.length === 0) {
      return;
    }

    const dataRowList: DataRow[] = [];
    const dataRowMap: Map<string, DataRow[]> = new Map();

    // filter terms provided in each region
    selectedRegionList.forEach((region) => {
      const selectedTermList = region.termList.filter((term) => {
        if (
          chargeTypeSet.has(term.type) &&
          engineSet.has(term.databaseEngine)
        ) {
          return true;
        }
        return false;
      });

      const regionName = getRegionName(region.code);
      selectedTermList.forEach((term) => {
        const key = `${dbInstance.name}-${region.code}`;
        const newRow: DataRow = {
          id: -1,
          childCnt: 1,
          cloudProvider: dbInstance.cloudProvider,
          name: dbInstance.name,
          processor: dbInstance.processor,
          cpu: dbInstance.cpu,
          memory: dbInstance.memory,
          engineType: term.databaseEngine,
          commitment: { usd: term.commitmentUSD },
          hourly: { usd: term.hourlyUSD },
          leaseLength: term.payload?.leaseContractLength ?? "N/A",
          // we store the region code for each provider, and show the user the actual region information
          // e.g. AWS's us-east-1 and GCP's us-east-4 are refer to the same region (N. Virginia)
          region: regionName,
        };

        if (dataRowMap.has(key)) {
          const existedDataRowList = dataRowMap.get(key) as DataRow[];
          newRow.id = existedDataRowList[0].id;
          existedDataRowList.push(newRow);
        } else {
          rowCnt++;
          newRow.id = rowCnt;
          dataRowMap.set(key, [newRow]);
        }
      });
    });

    dataRowMap.forEach((val) => {
      val.sort((a, b) => {
        // sort the row according to the following criteria
        // 1. charge type
        // 2. ascend by lease length
        if (a.leaseLength == "N/A") {
          return -1;
        } else if (b.leaseLength == "N/A") {
          return 1;
        }
        return Number(a.leaseLength[0]) - Number(b.leaseLength[0]);
      });
      val[0].childCnt = val.length;
      dataRowList.push(...val);
    });

    // filter by keyword, we only enable this when the keyword is set by user
    const keyword = config.keyword;
    if (keyword) {
      const filteredDataRowList: DataRow[] = dataRowList.filter((row) => {
        if (
          row.name.includes(keyword) ||
          row.memory.includes(keyword) ||
          row.processor.includes(keyword) ||
          row.region.includes(keyword)
        ) {
          return true;
        }
        return false;
      });
      state.dataRow.push(...filteredDataRowList);
      return;
    }

    state.dataRow.push(...dataRowList);
  });
};

onMounted(() => {
  refreshDataTable();
});
</script>

<style scoped></style>
