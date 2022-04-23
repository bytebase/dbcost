<template>
  <div class="p-2 items-center bg-slate-800 text-white">
    <div class="inline-flex flex-row items-center">
      <a href="https://bytebase.com?ref=dbcost" target="_blank">
        <img class="h-6" src="../assets/icon/dbcost.png" alt="Bytebase" />
      </a>
      <span class="inline font-bold text-xl text-center">DB Cost</span>
    </div>

    <div class="mt-1.5 inline-flex float-right items-center space-x-2">
      <div v-is="'script'" async src="https://buttons.github.io/buttons.js" />
      <a
        class="github-button"
        href="https://github.com/bytebase/dbcost"
        data-color-scheme="no-preference: light; light: light; dark: dark;"
        data-show-count="false"
        aria-label="Star bytebase/dbcost on GitHub"
        >Star</a
      >

      <div class="flex items-center -mt-1.5">
        <span>by</span>
        <a href="https://bytebase.com?ref=dbcost" target="_blank">
          <img
            class="h-5 ml-2"
            src="../assets/icon/logo-full-invert.svg"
            alt="Bytebase"
          />
        </a>
        <div class="ml-1">
          <n-tooltip trigger="hover" :show-arrow="false">
            <template #trigger>
              <heroicons-outline:information-circle class="h-6" />
            </template>
            <template #default>
              <span>Learn More about Bytebase</span>
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
