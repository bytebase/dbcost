<template>
  <n-notification-provider :max="2">
    <nuxt-layout><nuxt-page /></nuxt-layout>
  </n-notification-provider>
</template>

<script lang="ts" setup>
import { NNotificationProvider } from "naive-ui";

interface LocalState {
  isCollapsed: boolean;
}

reactive<LocalState>({
  isCollapsed: true,
});
</script>
