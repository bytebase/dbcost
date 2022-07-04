<template>
  <div>
    <the-header />

    <!-- side bar toggle -->
    <div
      v-show="dataTableItemStore.checkedDataRow.length > 0"
      class="fixed z-20 m-4 right-4 top-20"
      @click="() => (state.isCollapsed = !state.isCollapsed)"
    >
      <n-badge :value="dataTableItemStore.checkedDataRow.length">
        <n-button
          round
          type="primary"
          class="text-white bg-green-600 text-base"
        >
          Compare
        </n-button>
      </n-badge>
    </div>

    <!-- side bar -->
    <div class="fixed z-20 top-0">
      <check-instance-sidebar
        @collapse="() => (state.isCollapsed = !state.isCollapsed)"
        :isCollapsed="state.isCollapsed"
      />
    </div>

    <!-- shadow mask -->
    <div
      v-show="!state.isCollapsed"
      @click.prevent="() => (state.isCollapsed = !state.isCollapsed)"
      class="fixed w-full h-full bg-black opacity-50 z-10"
      style="top: 0; left: 0px"
    ></div>

    <!-- main content -->
    <div class="z-0">
      <slot />
    </div>

    <the-footer class="px-3 my-5" />
  </div>
</template>

<script lang="ts" setup>
import { NButton, NBadge } from "naive-ui";
import { useDataTableItemStore } from "@/stores";

const dataTableItemStore = useDataTableItemStore();

interface LocalState {
  isCollapsed: boolean;
}

const state = reactive<LocalState>({
  isCollapsed: true,
});
</script>
