<template>
  <div class="flex justify-start">
    <div class="border-r pr-2 mr-2 items-baseline">
      <div class="flex mb-1">
        Utilization
        <n-tooltip trigger="hover">
          <template #trigger>
            <heroicons-outline:information-circle class="font-light pt-1" />
          </template>
          Utilization is used to served as a multiplier in the derivation of the
          price.
        </n-tooltip>
        <span class="ml-2 font-mono">{{ Math.trunc(utilization * 100) }}%</span>
      </div>

      <n-slider
        :format-tooltip="(val) => `${Math.trunc(val * 100)}%`"
        :min="0"
        :max="1"
        class="w-40"
        :value="utilization"
        :step="0.01"
        @update-value="(val) => emit('update-utilization', val)"
      />
    </div>

    <div class="ml-2">
      <div class="flex mb-1">
        Lease Length
        <n-tooltip trigger="hover">
          <template #trigger>
            <heroicons-outline:information-circle class="font-light pt-1" />
          </template>
          Utilization is the total length to derive the price in the last column
          of the the data table.
        </n-tooltip>
        <span class="ml-2 font-mono">{{ rentYear }} Year</span>
      </div>

      <n-slider
        :format-tooltip="(val) => `${val} Year`"
        :min="1"
        :max="3"
        class="w-40 align-middle"
        :value="rentYear"
        :step="1"
        @update-value="(val) => emit('update-lease-length', val)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NSlider, NTooltip } from "naive-ui";

const props = defineProps({
  utilization: {
    type: Number,
    default: 1,
  },
  rentYear: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits<{
  (e: "update-utilization", val: number): void;
  (e: "update-lease-length", val: number): void;
}>();
</script>
