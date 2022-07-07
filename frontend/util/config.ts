import { SearchConfig } from "@/types";

import { isEqual } from "lodash-es";

export const isConfigChange = (
  oldConfig: SearchConfig,
  newConfig: SearchConfig
): boolean => {
  const _old = { ...oldConfig };
  const _new = { ...newConfig };
  return !isEqual(_old, _new);
};

export const isRefreshNeeded = (
  oldConfig: SearchConfig,
  newConfig: SearchConfig
): boolean => {
  const _old = { ...oldConfig };
  const _new = { ...newConfig };
  _old.utilization = 0;
  _old.leaseLength = 0;
  _new.utilization = 0;
  _new.leaseLength = 0;
  return !isEqual(_old, _new);
};
