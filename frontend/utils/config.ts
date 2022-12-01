import { ParsedUrlQuery } from "querystring";
import { isEqual } from "lodash";
import { CloudProvider, SearchConfig, EngineType, ChargeType } from "@/types";

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

// Convert the parsedUrlQuery object from next.js to a SearchConfig object
export const processParsedUrlQuery = (
  parsedUrlQuery: ParsedUrlQuery
): Partial<SearchConfig> => {
  const config: Partial<SearchConfig> = parsedUrlQuery;

  // These properties must be arrays. If they are not, convert them to arrays.
  if (
    parsedUrlQuery.cloudProvider &&
    !Array.isArray(parsedUrlQuery.cloudProvider)
  ) {
    config.cloudProvider = [parsedUrlQuery.cloudProvider as CloudProvider];
  }
  if (parsedUrlQuery.engineType && !Array.isArray(parsedUrlQuery.engineType)) {
    config.engineType = [parsedUrlQuery.engineType as EngineType];
  }
  if (parsedUrlQuery.chargeType && !Array.isArray(parsedUrlQuery.chargeType)) {
    config.chargeType = [parsedUrlQuery.chargeType as ChargeType];
  }
  if (parsedUrlQuery.region && !Array.isArray(parsedUrlQuery.region)) {
    config.region = [parsedUrlQuery.region];
  }

  // These properties must be numbers.
  if (parsedUrlQuery.minCPU) {
    config.minCPU = Number(parsedUrlQuery.minCPU);
  }
  if (parsedUrlQuery.minRAM) {
    config.minRAM = Number(parsedUrlQuery.minRAM);
  }
  if (parsedUrlQuery.utilization) {
    config.utilization = Number(parsedUrlQuery.utilization);
  }
  if (parsedUrlQuery.leaseLength) {
    config.leaseLength = Number(parsedUrlQuery.leaseLength);
  }
  return config;
};
