import { SearchConfig, DataRow } from "../types";
import { isEqual } from "lodash";

export const isEmptyArray = (arr: any[] | undefined) => {
  if (Array.isArray(arr) && !arr.length) {
    return true;
  }

  return false;
};

const regionCodeMap: Map<string, string> = new Map<string, string>([
  // AWS
  ["us-gov-east-1", "AWS GovCloud (US-East)"],
  ["us-gov-west-1", "AWS GovCloud (US-West)"],
  ["af-south-1", "Africa (Cape Town)"],
  ["ap-east-1", "Asia Pacific (Hong Kong)"],
  ["ap-northeast-1", "Asia Pacific (Tokyo)"],
  ["ap-northeast-2", "Asia Pacific (Seoul)"],
  ["ap-northeast-3", "Asia Pacific (Osaka)"],
  ["ap-south-1", "Asia Pacific (Mumbai)"],
  ["ap-southeast-1", "Asia Pacific (Singapore)"],
  ["ap-southeast-2", "Asia Pacific (Sydney)"],
  ["ap-southeast-3", "Asia Pacific (Jakarta)"],
  ["ca-central-1", "Canada (Central)"],
  ["eu-central-1", "Europe (Frankfurt)"],
  ["eu-north-1", "Europe (Stockholm)"],
  ["eu-south-1", "Europe (Milan)"],
  ["eu-west-1", "Europe (Ireland)"],
  ["eu-west-2", "Europe (London)"],
  ["eu-west-3", "Europe (Paris)"],
  ["me-south-1", "Middle East (Bahrain)"],
  ["sa-east-1", "South America (Sao Paulo)"],
  ["us-east-1", "US East (N. Virginia)"],
  ["us-east-2", "US East (Ohio)"],
  ["us-west-1", "US West (N. California)"],
  ["us-west-2", "US West (Oregon)"],
  ["us-west-2-lax-1", "US West (Los Angeles)"],

  // GCP
  ["asia-east1", "Asia Pacific (Taiwan)"],
  ["asia-east2", "Asia Pacific (Hong Kong)"],
  ["asia-northeast1", "Asia Pacific (Tokyo)"],
  ["asia-northeast2", "Asia Pacific (Osaka)"],
  ["asia-northeast3", "Asia Pacific (Seoul)"],
  ["asia-south1", "Asia Pacific (Mumbai)"],
  ["asia-south2", "Asia Pacific (Delhi)"],
  ["asia-southeast1", "Asia Pacific (Singapore)"],
  ["asia-southeast2", "Asia Pacific (Jakarta)"],
  ["australia-southeast1", "Asia Pacific (Sydney)"],
  ["australia-southeast2", "Asia Pacific (Melbourne)"],
  ["europe-central2", "Europe (Warsaw)"],
  ["europe-north1", "Europe (Finland)"],
  ["europe-west1", "Europe (Belgium)"],
  ["europe-west2", "Europe (London)"],
  ["europe-west3", "Europe (Frankfurt)"],
  ["europe-west4", "Europe (Netherlands)"],
  ["europe-west6", "Europe (Zurich)"],
  ["europe-west8", "Europe (Milan)"],
  ["europe-west9", "Europe (Paris)"],
  ["northamerica-northeast1", "Canada (Montréal)"],
  ["northamerica-northeast2", "Canada (Toronto)"],
  ["southamerica-east1", "South America (Osasco)"],
  ["southamerica-west1", "South America (Santiago)"],
  ["us-central1", "US Central (Iowa)"],
  ["us-east1", "US East (South Carolina)"],
  ["us-east4", "US East (N. Virginia)"],
  ["us-west1", "US West (Oregon)"],
  ["us-west2", "US West (Los Angeles)"],
  ["us-west3", "US West (Salt Lake City)"],
  ["us-west4", "US West (Las Vegas)"],
]);

export const getRegionName = (regionCode: string): string => {
  if (!regionCodeMap.has(regionCode)) {
    // If the code is not included in the map, we just show user the code.
    // Also, we need to update the map manually.
    regionCodeMap.set(regionCode, `Other (${regionCode})`);
  }
  return regionCodeMap.get(regionCode) as string;
};

export const getRegionCode = (regionName: string): string[] => {
  const regionCode: string[] = [];
  regionCodeMap.forEach((_regionName, code) => {
    if (_regionName === regionName) {
      regionCode.push(code);
    }
  });

  return regionCode;
};

const YearInHour = 365 * 24;
export const getPrice = (
  dataRow: DataRow,
  utilization: number,
  leaseLength: number
): number => {
  // charged on demand.
  if (dataRow.leaseLength === "N/A") {
    return leaseLength * YearInHour * dataRow.hourly.usd * utilization;
  }

  // Charged reserved
  // Reserved means you will be charged anytime, even you do not use it, so the utilization factor is left here.
  let reservedCharge = leaseLength * YearInHour * dataRow.hourly.usd;
  // The commitment should be charged immediately.
  if (dataRow.leaseLength === "1yr") {
    reservedCharge += dataRow.commitment.usd * leaseLength;
  }
  if (dataRow.leaseLength === "3yr" && leaseLength) {
    reservedCharge += dataRow.commitment.usd * Math.ceil(leaseLength / 3);
  }
  return reservedCharge;
};

export const getDiff = (
  dataRow: DataRow,
  utilization: number,
  leaseLength: number
): number => {
  const baseCharge =
    leaseLength * YearInHour * dataRow.baseHourly * utilization;
  return (dataRow.expectedCost - baseCharge) / baseCharge;
};

// At least 2 digits of the decimal part would be display,
// it it is still 0.00, show all the digits until first 0 occur.
// e.g.
//    0.001 --> 0.001
//    0.011 --> 0.01
//    123.011 --> 123.01
export const getDigit = (val: number, leastDigitCnt: number): string => {
  let res = val.toFixed(leastDigitCnt);
  if (
    res[res.length - 1] !== "0" ||
    res[res.length - 2] !== "0" ||
    Number(res) === val
  ) {
    return res;
  }

  for (let i = leastDigitCnt + 1; ; i++) {
    res = val.toFixed(i);
    if (Number(res) === val) {
      return res;
    }
  }
};

export const isConfigChange = (
  oldConfig: SearchConfig,
  newConfig: SearchConfig
): boolean => {
  const _old = { ...oldConfig };
  const _new = { ...newConfig };
  _old.utilization = 0;
  _old.leaseLength = 0;
  _new.utilization = 0;
  _new.leaseLength = 0;

  return isEqual(_old, _new);
};
