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
        <n-tooltip trigger="hover" :show-arrow="false">
          <template #trigger>
            <div class="flex flex-row space-x-1">
              <a href="https://bytebase.com?ref=dbcost" target="_blank">
                <img
                  class="h-6 ml-2"
                  src="../assets/icon/logo-full-invert.svg"
                  alt="Bytebase"
                />
              </a>
              <heroicons-outline:information-circle class="ml-1 h-6" />
            </div>
          </template>
          <template #default>
            <span
              >Safe Database Schema Change and Version Control for Teams</span
            >
          </template>
        </n-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NTooltip } from "naive-ui";
</script>
