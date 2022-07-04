<template>
  <header class="p-2 flex justify-between items-center bg-slate-800 text-white">
    <div class="inline-flex flex-row items-center gap-4">
      <nuxt-link to="/">
        <img
          class="h-8"
          src="@/assets/icon/dbcost-logo-full.png"
          alt="Bytebase"
        />
      </nuxt-link>
      <nuxt-link to="/provider/aws">
        <span class="h-8 text-lg pt-0.5 text-white"> AWS </span>
      </nuxt-link>
      <nuxt-link to="/provider/gcp">
        <span class="h-8 text-lg pt-0.5 text-white"> GCP </span>
      </nuxt-link>
    </div>

    <div class="inline-flex flex-row items-center text-3xl">
      ☁️&nbsp;&nbsp💸&nbsp;&nbsp;☁️&nbsp;&nbsp;💸&nbsp;&nbsp☁️
    </div>

    <div class="inline-flex float-right items-center space-x-2">
      <div v-is="'script'" async src="https://buttons.github.io/buttons.js" />
      <div class="mt-1">
        <client-only>
          <a
            class="github-button"
            href="https://github.com/bytebase/dbcost"
            data-color-scheme="no-preference: light; light: light; dark: dark;"
            data-show-count="false"
            aria-label="Star bytebase/dbcost on GitHub"
          >
            Star
          </a>
        </client-only>
      </div>

      <div class="-mt-0.5 flex items-center">
        <span>by</span>
        <n-tooltip trigger="hover" :show-arrow="false">
          <template #trigger>
            <div class="flex flex-row space-x-1">
              <a href="https://bytebase.com?ref=dbcost" target="_blank">
                <img
                  class="h-6 ml-2"
                  src="@/assets/icon/bytebase-logo-full-invert.svg"
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
  </header>
</template>

<script setup lang="ts">
import { NTooltip } from "naive-ui";
</script>
