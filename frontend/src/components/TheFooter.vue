<template>
  <div
    class="pt-4 mx-2 space-y-2 border-t border-gray-200 md:flex md:items-center md:justify-between md:space-y-0"
  >
    <div class="flex items-center justify-center space-x-2">
      <a href="https://bytebase.com?ref=dbcost" target="_blank">
        <img class="h-5" src="../assets/icon/logo-full.svg" alt="Bytebase" />
      </a>
      <span>
        Safer and Faster Database Schema Change and Version Control for
        Teams</span
      >
    </div>

    <div class="flex flex-row justify-center items-center space-x-2">
      <a
        class="text-blue-500 hover:text-blue-800"
        href="https://github.com/bytebase/dbcost"
        target="_blank"
      >
        Send us a Pull Request
      </a>
      <a
        class="twitter-follow-button"
        href="https://twitter.com/Bytebase"
        data-show-count="false"
      >
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const year = computed(() => {
  return new Date().getFullYear();
});
</script>
