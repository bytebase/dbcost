<template>
  <the-header />

  <!-- side bar toggle -->
  <div
    class="fixed z-20 m-4 right-0 bottom-20"
    @click="() => (state.isCollapsed = !state.isCollapsed)"
  >
    <n-badge :value="dataTableStore.checkedDataRow.length">
      <n-avatar :size="48" round class="bg-green-600 hover:bg-green-800">
        <heroicons-outline:shopping-cart />
      </n-avatar>
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
    <router-view name="body" />
  </div>

  <the-footer class="px-3 my-5" />
</template>

<script lang="ts" setup>
import { NAvatar, NBadge } from "naive-ui";
import { reactive } from "vue";
import { useDataTableStore } from "../stores";

const dataTableStore = useDataTableStore();

interface LocalState {
  isCollapsed: boolean;
}

const state = reactive<LocalState>({
  isCollapsed: true,
});
</script>
