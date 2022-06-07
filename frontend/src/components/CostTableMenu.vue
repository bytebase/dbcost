<template>
  <div class="mt-2 flex flex-wrap">
    <!-- Cloud Provider  -->
    <n-checkbox-group
      v-if="hasProvider"
      class="mr-4 pt-3.5"
      :value="props.cloudProvider"
      @update:value="handleUpdateCloudProvider"
    >
      <n-checkbox
        :class="val.class"
        v-for="val in ProviderCheckbox"
        :value="val.key"
      >
        <template #default>
          <img :src="val.iconPath" :width="val.width" :style="val.style" />
        </template>
      </n-checkbox>
    </n-checkbox-group>

    <!-- Database Engine Type -->
    <n-checkbox-group
      class="mr-4 pt-2"
      :value="props.engineType"
      @update:value="handleUpdateEngineType"
    >
      <n-checkbox class="pt-1.5" v-for="val in EngineCheckbox" :value="val.key">
        <template #default>
          <img :src="val.iconPath" :width="val.width" />
        </template>
      </n-checkbox>
    </n-checkbox-group>

    <!-- charge type checkbox -->
    <n-checkbox-group
      class="mr-2 pt-2"
      :value="props.chargeType"
      @update:value="handleUpdateChargeType"
    >
      <n-checkbox class="pt-1.5" value="OnDemand" label="On Demand" />
      <n-checkbox class="pt-1.5" value="Reserved" label="Reserved" />
    </n-checkbox-group>

    <!-- Min specification for Memory & CPU -->
    <div class="w-28 mr-2 pt-2 text-right">
      <n-input-number
        placeholder=""
        @update-value="handleUpdateMinCPU"
        :value="props.minCPU"
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
        :value="props.minRAM"
        :min="0"
        :max="999"
        :show-button="false"
      >
        <template #prefix>
          <span class="text-gray-500">Min RAM</span>
        </template>
      </n-input-number>
    </div>

    <!-- Search Bar -->
    <div class="pt-2">
      <n-input
        placeholder="Keyword"
        :value="props.keyword"
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
import { ChargeType, CloudProvider, EngineType } from "../types";
import { NCheckboxGroup, NCheckbox, NInput, NInputNumber } from "naive-ui";
import { PropType } from "vue";

const props = defineProps({
  hasProvider: {
    type: Boolean,
    default: true,
  },
  cloudProvider: {
    type: Object as PropType<CloudProvider[]>,
    default: [""],
  },
  engineType: {
    type: Object as PropType<EngineType[]>,
    default: [""],
  },
  chargeType: {
    type: Object as PropType<ChargeType[]>,
    default: [""],
  },
  keyword: {
    type: String,
    default: "",
  },
  minRAM: {
    type: Number,
    default: 0,
  },
  minCPU: {
    type: Number,
    default: 0,
  },
});

const ProviderCheckbox = [
  {
    key: "AWS",
    iconPath: new URL("../assets/icon/aws.png", import.meta.url).href,
    width: 24,
    class: "pr-1",
    style: "transform:scale(1.3)",
  },
  {
    key: "GCP",
    iconPath: new URL("../assets/icon/gcp.png", import.meta.url).href,
    width: 24,
    style: "transform:scale(0.9)",
  },
];

const EngineCheckbox = [
  {
    key: "MYSQL",
    iconPath: new URL("../assets/icon/db-mysql.png", import.meta.url).href,
    width: 24,
  },
  {
    key: "POSTGRES",
    iconPath: new URL("../assets/icon/db-postgres.png", import.meta.url).href,
    width: 24,
  },
];

const emit = defineEmits<{
  (e: "update-cloud-provider", selectedCloudProvider: CloudProvider[]): void;
  (e: "update-engine-type", selectedEngineType: EngineType[]): void;
  (e: "update-charge-type", selectedChargeType: ChargeType[]): void;
  (e: "update-keyword", typedKeyword: string): void;
  (e: "update-min-vcpu", minCPU: number): void;
  (e: "update-min-ram", minRAM: number): void;
}>();

const handleUpdateCloudProvider = (val: any) => {
  emit("update-cloud-provider", val);
};

const handleUpdateEngineType = (val: any) => {
  emit("update-engine-type", val);
};

const handleUpdateChargeType = (val: any) => {
  emit("update-charge-type", val);
};

const handleUpdateKeyword = (val: string) => {
  emit("update-keyword", val);
};

const handleUpdateMinRAM = (val: any) => {
  emit("update-min-ram", val);
};

const handleUpdateMinCPU = (val: any) => {
  emit("update-min-vcpu", val);
};
</script>

<style></style>
