<template>
  <div class="mt-2 space-x-2 flex justify-end">
    <!-- region dropdown -->
    <n-dropdown
      :options="dropdownOptionList"
      placement="bottom-start"
      trigger="click"
      @select="handleUpdateRegion"
    >
      <n-button :type="region.length === 0 ? '' : 'primary'" ghost>{{
        region.length === 0 ? "Select Region" : region
      }}</n-button>
    </n-dropdown>

    <!-- charge type checkbox -->
    <n-radio-group
      class="align-bottom"
      :default-value="props.chargeType"
      @update-value="handleUpdateChargeType"
    >
      <n-radio-button key="OnDemand" value="OnDemand" label="On Demand" />
      <n-radio-button key="Reserved" value="Reserved" label="Reserved" />
    </n-radio-group>

    <!-- Database Engine Type -->
    <!-- NOTE that the price of MYSQL and POSTGRES are happened to be identical -->
    <!-- It is not gurant -->
    <n-radio-group
      class="align-bottom"
      :default-value="props.engineType"
      @update-value="handleUpdateEngineType"
    >
      <n-radio-button key="MYSQL" value="MYSQL">
        <n-avatar
          class="pt-1"
          size="small"
          color="none"
          :src="EngineIconPath.MYSQL"
        />
      </n-radio-button>
      <n-radio-button key="POSTGRES" value="POSTGRES" label="Reserved">
        <n-avatar
          class="pt-1"
          size="small"
          color="none"
          :src="EngineIconPath.POSTGRES"
        />
      </n-radio-button>
    </n-radio-group>

    <!-- Search Bar -->
    <div class="inline-block align-bottom">
      <n-input
        placeholder="Keyword"
        clearable
        @update-value="handleUpdateKeyword"
      >
        <template #prefix>
          <heroicons-outline:search class="h-5 w-5 text-green-600" />
        </template>
      </n-input>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ChargeType, EngineType } from "../types";
import { useDBInstanceStore } from "../stores/dbInstance";
import {
  NRadioGroup,
  NRadioButton,
  NButton,
  NDropdown,
  NAvatar,
  NInput,
  DropdownGroupOption,
} from "naive-ui";
import { computed, PropType } from "vue";

const dbInstanceStore = useDBInstanceStore();
const availableRegionList = dbInstanceStore.getAvailableRegionList();

const props = defineProps({
  region: {
    type: String,
    default: "",
  },
  chargeType: {
    type: String as PropType<ChargeType>,
    default: "",
  },
  engineType: {
    type: String as PropType<EngineType>,
    default: "",
  },
});

const EngineIconPath = {
  MYSQL: new URL("../assets/icon/db-mysql.png", import.meta.url).href,
  POSTGRES: new URL("../assets/icon/db-postgres.png", import.meta.url).href,
};

const dropdownOptionList = computed(() => {
  const dropDownList: any = [];
  const parentKey = new Set<string>();

  availableRegionList.forEach((region) => {
    const parentRegion = region.substring(0, region.indexOf("(") - 1);
    const childRegion = region.substring(
      region.indexOf("(") + 1,
      region.indexOf(")")
    );
    if (parentKey.has(parentRegion)) {
      dropDownList.forEach((e: DropdownGroupOption) => {
        if (e.label == parentRegion) {
          e.children.push({
            label: childRegion,
            key: childRegion,
          });
        }
      });
    } else {
      parentKey.add(parentRegion);
      dropDownList.push({
        label: parentRegion,
        key: parentRegion,
        children: [
          {
            label: childRegion,
            key: region,
          },
        ],
      });
    }
  });
  return dropDownList;
});
const emit = defineEmits<{
  (e: "update-region", selectedRegion: string): void;
  (e: "update-charge-type", selectedChargeType: ChargeType): void;
  (e: "update-engine-type", selectedEngineType: EngineType): void;
  (e: "update-keyword", typedKeyword: string): void;
}>();

const handleUpdateRegion = (val: string) => {
  emit("update-region", val);
};

const handleUpdateChargeType = (val: ChargeType) => {
  emit("update-charge-type", val);
};

const handleUpdateEngineType = (val: EngineType) => {
  emit("update-engine-type", val);
};

const handleUpdateKeyword = (val: string) => {
  emit("update-keyword", val);
};
</script>

<style></style>
