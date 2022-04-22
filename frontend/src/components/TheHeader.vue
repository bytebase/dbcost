<template>
  <div class="px-5 pt-4 items-center">
    <div class="inline-flex flex-row items-center">
      <a href="https://bytebase.com" target="_blank">
        <img class="h-7" src="../assets/icon/dbcost.png" alt="Bytebase" />
      </a>
      <span class="inline font-bold text-xl text-center">DB Cost</span>
    </div>

    <div class="inline-flex float-right items-center space-x-4">
      <div class="">
        <div v-is="'script'" async src="https://buttons.github.io/buttons.js" />
        <a
          class="github-button"
          href="https://github.com/bytebase/dbcost"
          data-color-scheme="no-preference: light; light: light; dark: dark;"
          data-size="large"
          data-show-count="true"
          aria-label="Star bytebase/dbcost on GitHub"
          >Star</a
        >
      </div>

      <div class="flex items-center pb-1.5">
        <span>Made By</span>
        <a href="https://bytebase.com" target="_blank">
          <img
            class="h-7 ml-2"
            src="../assets/icon/logo-icon.svg"
            alt="Bytebase"
          />
        </a>
        <div class="ml-1">
          <n-tooltip trigger="hover" :show-arrow="false">
            <template #trigger>
              <heroicons-outline:information-circle class="h-4 text-gray-600" />
            </template>
            <template #default>
              <span>Learn More About Bytebase</span>
            </template>
          </n-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NTooltip } from "naive-ui";
</script>
