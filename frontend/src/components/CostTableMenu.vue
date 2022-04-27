<template>
  <!-- region checkbox -->
  <div class="border-b pb-4">
    <n-button class="mb-4" size="small" @click="clearAll"> Clear All </n-button>
    <n-checkbox-group
      :value="(regionList as any)"
      @update-value="handleUpdateRegion"
    >
      <n-grid :y-gap="4" :cols="`2 600:3 800:4`">
        <n-gi v-for="(region, i) in availableRegionList" :key="i">
          <n-checkbox :value="region" :label="region" />
        </n-gi>
      </n-grid>
    </n-checkbox-group>
  </div>

  <div class="mt-2 flex flex-wrap">
    <!-- Min specification for Memory & CPU -->
    <div class="w-28 mr-2 pt-2 text-right">
      <n-input-number
        placeholder=""
        @update-value="handleUpdateMinCPU"
        :value="state.minCPU"
        :min="0"
        :max="999"
        :show-button="false"
      >
        <template #prefix>
          <span class="text-gray-500">Min CPU</span>
        </template>
      </n-input-number>
    </div>
    <div class="w-28 mr-2 pt-2 text-right">
      <n-input-number
        placeholder=""
        @update-value="handleUpdateMinRAM"
        :value="state.minRAM"
        :min="0"
        :max="999"
        :show-button="false"
      >
        <template #prefix>
          <span class="text-gray-500">Min RAM</span>
        </template>
      </n-input-number>
    </div>

    <!-- charge type checkbox -->
    <div class="mr-2 pt-2">
      <n-radio-group
        class="align-bottom"
        :default-value="props.chargeType"
        @update-value="handleUpdateChargeType"
      >
        <n-radio-button key="OnDemand" value="OnDemand" label="On Demand" />
        <n-radio-button key="Reserved" value="Reserved" label="Reserved" />
      </n-radio-group>
    </div>

    <!-- Database Engine Type -->
    <n-checkbox-group
      class="mr-2 pt-2"
      :value="props.engineType"
      @update:value="handleUpdateEngineType"
    >
      <n-checkbox
        class="align-middle pt-1.5"
        v-for="val in EngineCheckbox"
        :value="val.key"
      >
        <template #default>
          <n-avatar size="small" color="none" :src="val.iconPath" />
        </template>
      </n-checkbox>
    </n-checkbox-group>

    <!-- Search Bar -->
    <div class="pt-2">
      <n-input
        placeholder="Keyword"
        :value="state.searchKeyword"
        clearable
        @update-value="handleUpdateKeyword"
      >
        <template #prefix>
          <heroicons-outline:search class="h-5 w-5 text-green-600" />
        </template>
      </n-input>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ChargeType, EngineType } from "../types";
import { useDBInstanceStore } from "../stores/dbInstance";
import {
  NCheckboxGroup,
  NGrid,
  NCheckbox,
  NGi,
  NRadioGroup,
  NRadioButton,
  NButton,
  NAvatar,
  NInput,
  NInputNumber,
} from "naive-ui";
import { onMounted, PropType, reactive } from "vue";

const dbInstanceStore = useDBInstanceStore();
const availableRegionList = dbInstanceStore.getAvailableRegionList();

const props = defineProps({
  regionList: {
    type: Object as PropType<String[]>,
    default: [],
  },
  chargeType: {
    type: String as PropType<ChargeType>,
    default: "",
  },
  engineType: {
    type: Object as PropType<EngineType[]>,
    default: [""],
  },
});

const EngineCheckbox = [
  {
    key: "MYSQL",
    iconPath: new URL("../assets/icon/db-mysql.png", import.meta.url).href,
  },
  {
    key: "POSTGRES",
    iconPath: new URL("../assets/icon/db-postgres.png", import.meta.url).href,
  },
];

const emit = defineEmits<{
  (e: "update-region", selectedRegion: string[]): void;
  (e: "update-charge-type", selectedChargeType: ChargeType): void;
  (e: "update-engine-type", selectedEngineType: EngineType[]): void;
  (e: "update-keyword", typedKeyword: string): void;
  (e: "update-min-vcpu", minCPU: number): void;
  (e: "update-min-ram", minRAM: number): void;
}>();

interface LocalState {
  searchKeyword: string;
  minCPU: number;
  minRAM: number;
}

const state = reactive<LocalState>({
  searchKeyword: "",
  minCPU: 0,
  minRAM: 0,
});

const handleUpdateRegion = (val: any[]) => {
  emit("update-region", val);
};

const handleUpdateChargeType = (val: ChargeType) => {
  emit("update-charge-type", val);
};

const handleUpdateEngineType = (val: any) => {
  emit("update-engine-type", val);
};

const handleUpdateKeyword = (val: string) => {
  state.searchKeyword = val;
  emit("update-keyword", val);
};

const handleUpdateMinRAM = (val: any) => {
  state.minRAM = val;
  emit("update-min-ram", val);
};

const handleUpdateMinCPU = (val: any) => {
  state.minCPU = val;
  emit("update-min-vcpu", val);
};

const clearAll = () => {
  handleUpdateKeyword("");
  handleUpdateEngineType([]);
  handleUpdateRegion([]);
  handleUpdateMinCPU(0);
  handleUpdateMinRAM(0);
};
</script>

<style></style>
