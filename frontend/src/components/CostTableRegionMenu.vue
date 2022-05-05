<template>
  <div class="border-b pb-4">
    <n-checkbox-group
      :value="(props.regionList as any)"
      @update-value="handleUpdateRegion"
    >
      <n-grid :y-gap="4" :cols="`2 600:3 800:4`">
        <n-gi v-for="(region, i) in availableRegionList" :key="i">
          <n-checkbox :value="region.name" :label="region.name" />
          <n-avatar
            v-if="region.provider.has('AWS')"
            :src="ProviderIcon.AWS"
            color="none"
            :size="20"
            class="align-bottom ml-1"
          />
          <n-avatar
            v-if="region.provider.has('GCP')"
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
import { PropType, defineProps, defineEmits } from "vue";
import { useDBInstanceStore } from "../stores/dbInstance";
import { NGrid, NGi, NCheckboxGroup, NCheckbox, NAvatar } from "naive-ui";

const dbInstanceStore = useDBInstanceStore();
const availableRegionList = dbInstanceStore.getAvailableRegionList();

const props = defineProps({
  regionList: {
    type: Object as PropType<String[]>,
    default: [],
  },
});

const ProviderIcon = {
  GCP: new URL("../assets/icon/gcp.png", import.meta.url).href,
  AWS: new URL("../assets/icon/aws.png", import.meta.url).href,
};

const emit = defineEmits<{
  (e: "update-region", selectedRegion: string[]): void;
}>();

const handleUpdateRegion = (val: any[]) => {
  emit("update-region", val);
};
const click = () => {
  console.log("click");
};
</script>
