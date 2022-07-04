<template>
  <div class="flex justify-start">
    <div class="pr-2 mr-2 items-baseline">
      <div class="flex mb-1 items-center">
        Utilization
        <n-tooltip trigger="hover">
          <template #trigger>
            <heroicons-outline:information-circle
              class="font-light align-baseline w-4 h-4 text-gray-500 ml-0.5"
            />
          </template>
          Utilization is the time percentage actually used during the entire
          lease length.
        </n-tooltip>
        <span class="ml-2 font-mono">{{ Math.trunc(utilization * 100) }}%</span>
      </div>

      <n-slider
        :format-tooltip="(val:number) => `${Math.trunc(val * 100)}%`"
        :min="0.01"
        :max="1"
        class="w-40"
        :value="utilization"
        :step="0.01"
        @update-value="(val:number) => emit('update-utilization', val)"
      />
    </div>

    <div class="ml-2">
      <div class="flex mb-1 items-center">
        Lease Length
        <span class="ml-2 font-mono">{{ leaseLength }} Year</span>
      </div>

      <n-slider
        :format-tooltip="(val:number) => `${val} Year`"
        :min="1"
        :max="3"
        class="w-40 align-middle"
        :value="leaseLength"
        :step="1"
        @update-value="(val:number) => emit('update-lease-length', val)"
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
  leaseLength: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits<{
  (e: "update-utilization", val: number): void;
  (e: "update-lease-length", val: number): void;
}>();
</script>
