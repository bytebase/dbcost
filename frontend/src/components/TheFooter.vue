<template>
  <div
    class="pt-4 mx-2 space-y-2 border-t border-gray-200 md:flex md:items-center md:justify-between md:space-y-0"
  >
    <div>
      <div class="flex items-center justify-center space-x-1">
        <span>DB Cost -</span>
        <h2>The ultimate cloud database pricing sheet for AWS RDS</h2>
      </div>
      <div class="flex items-center md:justify-start justify-center space-x-1">
        <a
          class="text-blue-500 hover:text-blue-800"
          href="https://star-history.com"
          >Star History</a
        >
        <h2>- The missing GitHub star history graph</h2>
      </div>
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
