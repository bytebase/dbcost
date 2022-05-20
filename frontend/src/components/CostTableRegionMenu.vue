<template>
  <div>
    <n-checkbox-group
      class="flex-col border-b pb-2 mb-2"
      v-model:value="state.checkedParentRegionList"
    >
      <n-grid :y-gap="4" :cols="`2 760:3 980:4`">
        <n-gi v-for="(parentRegion, i) in state.parentRegionList" :key="i">
          <n-checkbox :value="parentRegion" :label="parentRegion" />
        </n-gi>
      </n-grid>
    </n-checkbox-group>

    <n-checkbox-group
      :value="(props.checkedRegionList as string[])"
      @update-value="(val) => emit('update-region', val as string[])"
    >
      <n-grid :y-gap="4" :cols="`2 760:3 980:4`">
        <n-gi v-for="(region, i) in regionOptionList" :key="i">
          <n-checkbox
            :value="region.name"
            :label="getChildRegionName(region)"
          />
          <n-avatar
            v-if="region.providerCode.has('AWS')"
            :src="ProviderIcon.AWS"
            color="none"
            :size="20"
            class="align-bottom ml-1"
          />
          <n-avatar
            v-if="region.providerCode.has('GCP')"
            :src="ProviderIcon.GCP"
            color="none"
            :size="16"
            class="align-bottom ml-1 mb-0.5"
          />
        </n-gi>
      </n-grid>
    </n-checkbox-group>
  </div>
</template>

<script lang="ts" setup>
import {
  PropType,
  defineProps,
  defineEmits,
  reactive,
  onMounted,
  watch,
  computed,
  onUpdated,
} from "vue";
import { NGrid, NGi, NCheckboxGroup, NCheckbox, NAvatar } from "naive-ui";
import { AvailableRegion } from "../types";
import { useFalseUntilTruthy } from ".pnpm/vooks@0.2.12_vue@3.2.31/node_modules/vooks";

const props = defineProps({
  availableRegionList: {
    type: Object as PropType<AvailableRegion[]>,
    default: [],
  },
  checkedRegionList: {
    type: Object as PropType<String[]>,
    default: [],
  },
});

interface LocalState {
  parentRegionMap: Map<string, string[]>;
  parentRegionList: string[];
  checkedParentRegionList: string[];
}

const state = reactive<LocalState>({
  parentRegionMap: new Map<string, string[]>(),
  parentRegionList: [],
  checkedParentRegionList: [],
});

const ProviderIcon = {
  GCP: new URL("../assets/icon/gcp.png", import.meta.url).href,
  AWS: new URL("../assets/icon/aws.png", import.meta.url).href,
};

const emit = defineEmits<{
  (e: "update-region", selectedRegion: string[]): void;
}>();

// "Asia Pacific (Hong Kong)" --->  ["Asia Pacific (Hong Kong", ""] ---> ["Asia Pacific", "Hong Kong"]
const getParentRegionName = (region: AvailableRegion) =>
  region.name.split(")")[0].split(" (")[0];
const getChildRegionName = (region: AvailableRegion) =>
  region.name.split(")")[0].split(" (")[1];

watch(
  () => props.availableRegionList,
  () => {
    const parentRegionList = [];
    state.parentRegionMap.clear();
    for (const region of props.availableRegionList) {
      const parent = getParentRegionName(region);
      const child = getChildRegionName(region);

      if (state.parentRegionMap.has(parent)) {
        state.parentRegionMap.get(parent)?.push(child);
        continue;
      }
      parentRegionList.push(parent);
      state.parentRegionMap.set(parent, [child]);
    }
    parentRegionList.sort((a, b) => a.localeCompare(b));
    console.log(parentRegionList);
    state.parentRegionList = parentRegionList;
  },
  { deep: true }
);

const regionOptionList = computed(() => {
  const res = [];

  const set = new Set(props.checkedRegionList);

  // push the checked region first, so that when its parent is unchecked this region will still rendered at the child region checkbox.
  // the for loop is to keep the order as it is.
  for (const checkedRegionName of props.checkedRegionList) {
    for (const region of props.availableRegionList) {
      if (checkedRegionName == region.name) {
        res.push(region);
      }
    }
  }

  for (const parentRegion of state.checkedParentRegionList) {
    for (const region of props.availableRegionList) {
      // prevent duplicate
      if (set.has(region.name)) {
        continue;
      }
      if (region.name.includes(parentRegion)) {
        res.push(region);
      }
    }
  }

  return res;
});
</script>
