<template>
  <!-- This example requires Tailwind CSS v2.0+ -->
  <div class="max-w-max mx-auto">
    <div class="max-w-max mx-auto mt-4">
      <span class="text-md">The URL does not look correct.</span>
    </div>
    <div class="max-w-max mx-auto mt-2">
      <n-button type="primary" @click.prevent="back" ghost
        >Back To Dashboard</n-button
      >
    </div>
    <img class="overflow-hidden" src="../assets/illustration/404.webp" alt="" />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { NButton } from "naive-ui";

const router = useRouter();

const back = () => {
  router.push({ name: "dashboard" });
};
</script>
