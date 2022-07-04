<template>
  <div>
    <n-button quaternary @click="handleToggleIsExpanded">
      <div class="flex">
        <div class="font-medium text-lg pb-1">
          Compare Selection {{ dataRow.length === 0 ? "" : dataRow.length }}
        </div>

        <heroicons-outline:chevron-down class="ml-1 h-6" v-show="isExpended" />
        <heroicons-outline:chevron-up class="ml-1 h-6" v-show="!isExpended" />
      </div>
    </n-button>

    <cost-table
      v-show="isExpended"
      class="my-2"
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
import { DataRow } from "../types";

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
  isExpended: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  checkedRowKeys: {
    type: Array as PropType<string[]>,
    default: [],
  },
});

const emit = defineEmits<{
  (e: "update-checked-row-keys", checkedRowKeys: string[]): void;
  (e: "toggle-is-expanded"): void;
}>();

const handleCheckRowKeys = (rowKeys: string[]) => {
  emit("update-checked-row-keys", rowKeys);
};

const handleToggleIsExpanded = () => {
  emit("toggle-is-expanded");
};
</script>
