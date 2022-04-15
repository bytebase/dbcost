<template>
  <!-- region checkbox -->
  <n-button class="mb-1" size="small" @click="handleUpdateRegion([])">
    Clear All
  </n-button>
  <n-checkbox-group
    :value="(regionList as any)"
    @update-value="handleUpdateRegion"
  >
    <n-grid :y-gap="4" :cols="3">
      <n-gi v-for="(region, i) in availableRegionList" :key="i">
        <n-checkbox :value="region" :label="region" />
      </n-gi>
    </n-grid>
  </n-checkbox-group>

  <!-- charge type checkbox -->
  <n-radio-group
    class="mt-2"
    :default-value="props.chargeType"
    @update-value="handleUpdateChargeType"
  >
    <n-radio-button key="OnDemand" value="OnDemand" label="On Demand" />
    <n-radio-button key="Reserved" value="Reserved" label="Reserved" />
  </n-radio-group>
</template>

<script lang="ts" setup>
import { ChargeType } from "../types";
import { useDBInstanceStore } from "../stores/dbInstance";
import {
  NCheckboxGroup,
  NGrid,
  NCheckbox,
  NGi,
  NRadioGroup,
  NRadioButton,
  NButton,
} from "naive-ui";
import { PropType } from "vue";

const dbInstanceStore = useDBInstanceStore();
const availableRegionList = dbInstanceStore.getAvailableRegionList();

const props = defineProps({
  regionList: {
    type: Object as PropType<String[]>,
    default: "",
  },
  chargeType: {
    type: String as PropType<ChargeType>,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "update-region", selectedRegion: string[]): void;
  (e: "update-charge-type", selectedChargeType: ChargeType): void;
}>();

const handleUpdateRegion = (val: any[]) => {
  emit("update-region", val);
};

const handleUpdateChargeType = (val: ChargeType) => {
  emit("update-charge-type", val);
};
</script>

<style></style>
