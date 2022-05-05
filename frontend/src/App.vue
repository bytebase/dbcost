<template>
  <n-notification-provider :max="2">
    <router-view />
  </n-notification-provider>
</template>

<script lang="ts" setup>
import { NNotificationProvider } from "naive-ui";
</script>
