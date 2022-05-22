<template>
  <div class="flex w-full justify-start">
    <div class="border-r mr-4 pr-2">
      <n-checkbox-group
        class="flex-col mt-2"
        :value="state.checkedParentRegionList"
      >
        <n-grid :y-gap="4" :cols="`1`">
          <n-gi v-for="(parentRegion, i) in state.parentRegionList" :key="i">
            <n-checkbox
              :value="parentRegion"
              :label="parentRegion"
              :indeterminate="isIndeterminate(parentRegion)"
              @click="handleClickParentRegion(parentRegion)"
            />
          </n-gi>
        </n-grid>
      </n-checkbox-group>
    </div>

    <div>
      <n-checkbox-group
        class="mt-2"
        :value="(props.checkedRegionList as string[])"
        @update-value="(val) =>  $emit('update-region', val as string[])"
      >
        <n-grid :y-gap="4" :cols="`2 s:3 m:4 l:5`" :responsive="'screen'">
          <n-gi v-for="(region, i) in availableRegionList" :key="i">
            <n-checkbox :value="region.name" :label="region.name" />
            <n-avatar
              v-if="region.providerCode.has('AWS')"
              :src="ProviderIcon.AWS"
              color="none"
              :size="20"
              class="align-bottom"
            />
            <n-avatar
              v-if="region.providerCode.has('GCP')"
              :src="ProviderIcon.GCP"
              color="none"
              :size="16"
              class="align-bottom ml-0.5 mb-0.5"
            />
          </n-gi>
        </n-grid>
      </n-checkbox-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  PropType,
  defineProps,
  defineEmits,
  reactive,
  watch,
  onMounted,
  computed,
} from "vue";
import { NGrid, NGi, NCheckboxGroup, NCheckbox, NAvatar } from "naive-ui";
import { AvailableRegion } from "../types";

const ProviderIcon = {
  GCP: new URL("../assets/icon/gcp.png", import.meta.url).href,
  AWS: new URL("../assets/icon/aws.png", import.meta.url).href,
};

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
  isIndeterminate: Map<string, boolean>;
  checkedParentRegionList: string[];
}

const state = reactive<LocalState>({
  parentRegionMap: new Map<string, string[]>(),
  parentRegionList: [],
  isIndeterminate: new Map<string, boolean>(),
  checkedParentRegionList: [],
});

const emit = defineEmits<{
  (e: "update-region", selectedRegion: string[]): void;
}>();

// "Asia Pacific (Hong Kong)" --->  ["Asia Pacific (Hong Kong", ""] ---> ["Asia Pacific", "Hong Kong"]
const getParentRegionName = (regionName: string) =>
  regionName.split(")")[0].split(" (")[0];

watch(
  () => props.availableRegionList,
  () => {
    const parentRegionList = [];
    state.parentRegionMap.clear();
    for (const region of props.availableRegionList) {
      const parent = getParentRegionName(region.name);

      if (state.parentRegionMap.has(parent)) {
        state.parentRegionMap.get(parent)?.push(region.name);
        continue;
      }
      parentRegionList.push(parent);
      state.parentRegionMap.set(parent, [region.name]);
    }
    parentRegionList.sort((a, b) => {
      if (a.includes("Other")) {
        return 1;
      } else if (b.includes("Other")) {
        return -1;
      }
      return a.localeCompare(b);
    });
    state.parentRegionList = parentRegionList;
  },
  { deep: true }
);

const handleClickParentRegion = (parentRegionName: string) => {
  const set = new Set(state.checkedParentRegionList);
  let checkedRegionList: String[] = props.checkedRegionList;
  // uncheck the parent region, all its child region should be unchecked.
  if (set.has(parentRegionName)) {
    set.delete(parentRegionName);

    checkedRegionList = checkedRegionList.filter(
      (regionName) =>
        getParentRegionName(regionName as string) !== parentRegionName
    );
  } else {
    // checking a new parent region, all its child region should be checked.
    set.add(parentRegionName);
    for (const region of props.availableRegionList) {
      const _parentRegionName = getParentRegionName(region.name);
      if (parentRegionName === _parentRegionName) {
        checkedRegionList.push(region.name);
      }
    }
  }
  const checkedParentRegionList: string[] = [];
  for (const key of set) {
    checkedParentRegionList.push(key);
  }
  state.checkedParentRegionList = checkedParentRegionList;
  emit("update-region", checkedRegionList as string[]);
};

watch(
  () => props.checkedRegionList,
  () => {
    // if there is no child region of a parent region checked, set the parent region status to unchecked.
    const set = new Set();
    for (const regionName of props.checkedRegionList) {
      set.add(getParentRegionName(regionName as string));
    }
    state.checkedParentRegionList = state.parentRegionList.filter(
      (parentRegionName) => set.has(parentRegionName)
    );
  }
);

const isIndeterminate = computed(() => (parentName: string): boolean => {
  const childRegionList = state.parentRegionMap.get(parentName) as String[];
  const childSRegionSet = new Set(childRegionList);
  let cnt = 0;
  for (const region of props.checkedRegionList) {
    if (childSRegionSet.has(region)) {
      cnt++;
    }
  }

  return 0 < cnt && cnt < childRegionList.length;
});

onMounted(() => {
  // init the status of the parent region
  const set = new Set<string>();
  for (const regionName of props.checkedRegionList) {
    set.add(getParentRegionName(regionName as string));
  }
  for (const parentRegionName of set) {
    state.checkedParentRegionList.push(parentRegionName);
  }
});
</script>
