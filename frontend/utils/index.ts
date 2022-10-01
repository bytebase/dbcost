export * from "./region";
export * from "./price";
export * from "./assets";
export * from "./config";
export * from "./table";

export const isEmptyArray = (arr: any[] | undefined) => {
  if (Array.isArray(arr) && !arr.length) {
    return true;
  }

  return false;
};
