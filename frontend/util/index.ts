import { getRegionCode, getRegionName } from "./region";
import { getDiff, getPrice, getDigit } from "./price";
export { getRegionCode, getRegionName, getDiff, getPrice, getDigit };

export const isEmptyArray = (arr: any[] | undefined) => {
  if (Array.isArray(arr) && !arr.length) {
    return true;
  }

  return false;
};
