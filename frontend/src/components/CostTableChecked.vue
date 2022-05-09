<template>
  <div>
    <n-button
      :disabled="checkedRowKeys.length === 0"
      quaternary
      @click="
        () => {
          state.isExpended = !state.isExpended;
        }
      "
    >
      <div class="flex">
        <div class="font-medium text-lg pb-1">Selected Instance</div>
        <heroicons-outline:chevron-down
          class="ml-1 h-6"
          v-if="state.isExpended"
        />
        <heroicons-outline:chevron-up class="ml-1 h-6" v-else />
      </div>
    </n-button>

    <cost-table
      v-if="state.isExpended"
      class="my-2"
      virtual-scroll
      :data-row="dataRow"
      :isLoading="isLoading"
      :checked-row-keys="checkedRowKeys"
      :show-engine-type="true"
      :show-lease-length="true"
      @update-checked-row-keys="handleCheckRowKeys"
    />
  </div>
</template>

<script lang="ts" setup>
import { PropType, reactive, defineProps } from "vue";
import { DataRow } from "./costTable";

import { NButton } from "naive-ui";

interface LocalState {
  isExpended: boolean;
}

const state = reactive<LocalState>({
  isExpended: false,
});

const props = defineProps({
  dataRow: {
    type: Object as PropType<DataRow[]>,
    default: [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  checkedRowKeys: {
    type: Array as PropType<String[]>,
    default: [],
  },
});

const emit = defineEmits<{
  (e: "update-checked-row-keys", checkedRowKeys: string[]): void;
}>();

const handleCheckRowKeys = (rowKeys: string[]) => {
  emit("update-checked-row-keys", rowKeys);
};
</script>
