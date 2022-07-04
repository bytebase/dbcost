<template>
  <div class="flex justify-between">
    <div class="mt-2 pt-2 flex flex-wrap items-center">
      <!-- Cloud Provider  -->
      <n-checkbox-group
        v-if="hasProvider"
        class="mr-2 pb-2"
        :value="props.cloudProvider"
        @update:value="handleUpdateCloudProvider"
      >
        <n-checkbox
          :class="val.class"
          v-for="val in ProviderCheckbox"
          :value="val.key"
        >
          <template #default>
            <img :src="val.src" :width="val.width" :style="val.style" />
          </template>
        </n-checkbox>
      </n-checkbox-group>

      <!-- Database Engine Type -->
      <n-checkbox-group
        class="mr-2 pb-2"
        :value="props.engineType"
        @update:value="handleUpdateEngineType"
      >
        <n-checkbox v-for="val in EngineCheckbox" :value="val.key">
          <template #default>
            <img :src="val.src" :width="val.width" :style="val.style" />
          </template>
        </n-checkbox>
      </n-checkbox-group>

      <!-- charge type checkbox -->
      <n-checkbox-group
        class="mr-2 pb-2"
        :value="props.chargeType"
        @update:value="handleUpdateChargeType"
      >
        <n-checkbox value="OnDemand" label="On Demand" />
        <n-checkbox value="Reserved" label="Reserved" />
      </n-checkbox-group>

      <!-- Min specification for Memory & CPU -->
      <div class="mr-2 flex">
        <div class="w-28 mr-2 pb-2 text-right">
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
        <div class="w-28 mr-2 pb-2 text-right">
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
      </div>

      <!-- Search Bar -->
      <div class="pb-2">
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

    <!-- utilization & lease length slider -->
    <cost-table-slider
      class="pt-2 items-center"
      :utilization="props.utilization"
      :lease-length="props.leaseLength"
      @update-utilization="(val:number) => emit('update-utilization',val)"
      @update-lease-length="(val:number) => emit('update-lease-length',val)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ChargeType, CloudProvider, EngineType } from "@/types";
import { NCheckboxGroup, NCheckbox, NInput, NInputNumber } from "naive-ui";
import { PropType } from "vue";
import { getIconPath } from "@/util";

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
  utilization: {
    type: Number,
    default: 1,
  },
  leaseLength: {
    type: Number,
    default: 1,
  },
});

const ProviderCheckbox = [
  {
    key: "AWS",
    src: getIconPath("aws.png"),
    width: 24,
    class: "pr-1 items-center",
    style: "transform:scale(1)",
  },
  {
    key: "GCP",
    src: getIconPath("gcp.png"),
    width: 24,
    class: "items-center",
    style: "transform:scale(0.9)",
  },
];

const EngineCheckbox = [
  {
    key: "MYSQL",
    src: getIconPath("db-mysql.png"),
    width: 24,
    style: "transform:scale(0.75)",
  },
  {
    key: "POSTGRES",
    src: getIconPath("db-postgres.png"),
    width: 24,
    style: "transform:scale(0.75)",
  },
];

const emit = defineEmits<{
  (e: "update-cloud-provider", selectedCloudProvider: CloudProvider[]): void;
  (e: "update-engine-type", selectedEngineType: EngineType[]): void;
  (e: "update-charge-type", selectedChargeType: ChargeType[]): void;
  (e: "update-keyword", typedKeyword: string): void;
  (e: "update-min-vcpu", minCPU: number): void;
  (e: "update-min-ram", minRAM: number): void;
  (e: "update-utilization", val: number): void;
  (e: "update-lease-length", val: number): void;
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
