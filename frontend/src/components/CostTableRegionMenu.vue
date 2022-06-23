<template>
  <div class="flex w-full justify-start">
    <!-- parent region -->
    <div class="border-r flex-col mr-4 w-36">
      <n-checkbox-group class="mt-2" :value="state.checkedParentRegionList">
        <n-checkbox
          class="pb-1 w-36"
          v-for="(parentRegion, i) in state.parentRegionList"
          :key="i"
          :value="parentRegion"
          :label="parentRegion"
          :indeterminate="isIndeterminate(parentRegion)"
          @click="handleClickParentRegion(parentRegion)"
        />
      </n-checkbox-group>
    </div>

    <!-- child region -->
    <div class="w-full">
      <n-checkbox-group
        class="mt-2 flex flex-wrap justify-start"
        :value="(props.checkedRegionList as string[])"
        @update-value="(val :string[]) => $emit('update-region', val)"
      >
        <div
          class="pr-6 w-80 pb-1 flex"
          v-for="(region, i) in activeAvailableRegionList"
          :key="i"
        >
          <n-checkbox :value="region.name" :label="region.name" />
          <div class="flex">
            <img
              v-if="
                region.providerCode.has('AWS') && routeParamProvide.has('AWS')
              "
              :src="ProviderIcon.AWS"
              width="20"
              class="py-1 mr-1 items-bottom"
              style="transform: scale(0.9)"
            />
            <img
              v-if="
                region.providerCode.has('GCP') && routeParamProvide.has('GCP')
              "
              :src="ProviderIcon.GCP"
              width="24"
              class="p-0.5 items-bottom"
              style="transform: scale(0.9)"
            />
          </div>
        </div>
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
import { NCheckboxGroup, NCheckbox, NAvatar } from "naive-ui";
import { AvailableRegion } from "../types";
import { useRouter } from "vue-router";

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

const router = useRouter();
const routeParamProvide = computed(() =>
  router.currentRoute.value.params?.provider
    ? new Set([router.currentRoute.value.params?.provider])
    : new Set(["GCP", "AWS"])
);
const activeAvailableRegionList = computed(
  (): AvailableRegion[] | undefined => {
    // all provider is included (AWS, GCP)
    if (routeParamProvide.value.size === 2) {
      return props.availableRegionList;
    }
    if (routeParamProvide.value.has("AWS")) {
      return props.availableRegionList.filter((region) =>
        region.providerCode.has("AWS")
      );
    }
    if (routeParamProvide.value.has("GCP")) {
      return props.availableRegionList.filter((region) =>
        region.providerCode.has("GCP")
      );
    }
  }
);

// "Asia Pacific (Hong Kong)" --->  ["Asia Pacific (Hong Kong", ""] ---> ["Asia Pacific", "Hong Kong"]
const getParentRegionName = (regionName: string) =>
  regionName.split(")")[0].split(" (")[0];

watch(
  activeAvailableRegionList,
  () => {
    const parentRegionList = [];
    state.parentRegionMap.clear();
    for (const region of activeAvailableRegionList?.value) {
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
  let checkedRegionList: String[] = [...props.checkedRegionList];
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
