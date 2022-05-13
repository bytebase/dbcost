<template>
  <n-notification-provider :max="2">
    <n-loading-bar-provider>
      <router-view />
    </n-loading-bar-provider>
  </n-notification-provider>
</template>

<script lang="ts" setup>
import { NNotificationProvider, NLoadingBarProvider } from "naive-ui";
</script>
