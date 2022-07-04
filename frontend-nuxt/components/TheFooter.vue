<template>
  <footer
    class="pt-4 mx-2 space-y-2 border-t border-gray-200 md:flex md:items-center md:justify-between md:space-y-0"
  >
    <div>
      <div class="flex items-center justify-center space-x-1">
        <h2>
          The ultimate cloud database pricing sheet for AWS RDS and Google Cloud
          SQL instance
        </h2>
      </div>
    </div>

    <div
      class="text-sm leading-8 flex flex-row flex-wrap justify-center items-center underline text-blue-700 hover:opacity-80"
    >
      <a href="https://star-history.com" target="_blank">
        GitHub Star History
      </a>
    </div>

    <div
      class="text-sm leading-8 flex flex-row flex-nowrap justify-center items-center"
    >
      <span class="text-gray-600">
        Sponsored by
        <a
          class="text-blue-500 font-bold hover:opacity-80"
          href="https://bytebase.com"
          target="_blank"
          >Bytebase</a
        >
      </span>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const year = computed(() => {
  return new Date().getFullYear();
});
</script>
