import { SearchConfig } from "@/types";

import { isEqual } from "lodash";

export const hasConfigChanged = (
  oldConfig: SearchConfig,
  newConfig: SearchConfig
): boolean => !isEqual({ ...oldConfig }, { ...newConfig });

export const shouldRefresh = (
  oldConfig: SearchConfig,
  newConfig: SearchConfig
): boolean =>
  !isEqual(
    { ...oldConfig, utilization: 0, leaseLength: 0 },
    { ...newConfig, utilization: 0, leaseLength: 0 }
  );
