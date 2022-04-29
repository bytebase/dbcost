<template>
  <div class="border-b pb-4">
    <n-checkbox-group
      :value="(props.regionList as any)"
      @update-value="handleUpdateRegion"
    >
      <n-grid :y-gap="4" :cols="`2 600:3 800:4`">
        <n-gi v-for="(region, i) in availableRegionList" :key="i">
          <n-checkbox :value="region" :label="region" />
        </n-gi>
      </n-grid>
    </n-checkbox-group>
  </div>
</template>

<script lang="ts" setup>
import { PropType, defineProps, defineEmits } from "vue";
import { useDBInstanceStore } from "../stores/dbInstance";
import { NGrid, NGi, NCheckboxGroup, NCheckbox } from "naive-ui";

const dbInstanceStore = useDBInstanceStore();
const availableRegionList = dbInstanceStore.getAvailableRegionList();

const props = defineProps({
  regionList: {
    type: Object as PropType<String[]>,
    default: [],
  },
});

const emit = defineEmits<{
  (e: "update-region", selectedRegion: string[]): void;
}>();

const handleUpdateRegion = (val: any[]) => {
  emit("update-region", val);
};
</script>
