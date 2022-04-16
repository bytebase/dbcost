<template>
  <div class="px-5 pt-5 items-center">
    <img
      class="inline w-6 h-6 align-text-bottom"
      src="../assets/icon/logo-icon.svg"
    />
    <span class="inline font-bold text-xl text-center ml-2">DB COST</span>

    <div class="inline align-middle float-right">
      <div v-is="'script'" async src="https://buttons.github.io/buttons.js" />
      <a
        class="github-button"
        href="https://github.com/bytebase/dbcost"
        data-color-scheme="no-preference: light; light: light; dark: dark;"
        data-size="middle"
        data-show-count="true"
        aria-label="Star bytebase/dbcost on GitHub"
        >Star</a
      >
    </div>
  </div>
</template>

<script setup lang="ts"></script>
