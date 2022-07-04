import { getRegionCode, getRegionName } from "./region";
import { getDiff, getPrice, getDigit } from "./price";
import { isConfigChange, isRefreshNeeded } from "./config";
import { getIconPath } from "./assets";

export {
  getRegionCode,
  getRegionName,
  getDiff,
  getPrice,
  getDigit,
  isConfigChange,
  isRefreshNeeded,
  getIconPath,
};

export const isEmptyArray = (arr: any[] | undefined) => {
  if (Array.isArray(arr) && !arr.length) {
    return true;
  }

  return false;
};
