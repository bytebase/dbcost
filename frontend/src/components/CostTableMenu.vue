<template>
  <div class="text-center">{{ state.selectedRegion }}</div>
  <div class="text-center">{{ state.selectedChargeType }}</div>
</template>
<script lang="ts" setup>
import { PropType, reactive } from "vue";
import { ChargeType } from "../types";

type LocalState = {
  selectedRegion: string;
  selectedChargeType: ChargeType;
};

const props = defineProps({
  regionList: {
    type: Object as PropType<string>,
    default: [],
  },
  region: {
    type: String,
    default: "ap-northeast-2",
  },
  chargeType: {
    type: String as PropType<ChargeType>,
    default: "OnDemand",
  },
});

const state = reactive<LocalState>({
  selectedRegion: props.region,
  selectedChargeType: props.chargeType,
});
</script>

<style></style>
