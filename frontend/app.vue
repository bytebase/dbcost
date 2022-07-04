<template>
  <div>
    <Head>
      <Meta charset="UTF-8" />
      <Meta
        name="description"
        content="The Ultimate AWS RDS and Google Cloud SQL Instance Pricing Comparison Sheet"
      />
      <Meta
        name="keywords"
        content="aws,rds,gcp,cloudsql,database,pricing,cost,compare,"
      />
      <Link rel="icon" href="/favicon.ico" />
      <Meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <Title>DB Cost | RDS & Cloud SQL Instance Pricing Sheet</Title>
      <Script
        defer
        data-domain="dbcost.com"
        src="https://plausible.io/js/plausible.js"
      ></Script>
      <!-- Global site tag (gtag.js) - Google Analytics -->
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-H772TGHHK7"
      ></Script>
      <Script>
        window.dataLayer = window.dataLayer || []; function gtag() {
        dataLayer.push(arguments); } gtag("js", new Date()); gtag("config",
        "G-H772TGHHK7");
      </Script>
    </Head>
  </div>
  <n-notification-provider :max="2">
    <nuxt-layout><nuxt-page /></nuxt-layout>
  </n-notification-provider>
</template>

<script lang="ts" setup>
import { NNotificationProvider } from "naive-ui";
</script>
