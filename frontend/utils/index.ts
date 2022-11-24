export * from "./region";
export * from "./price";
export * from "./assets";
export * from "./config";
export * from "./table";
export * from "./instance";
export * from "./compare";

export const isEmptyArray = (arr: any[] | undefined) => {
  if (Array.isArray(arr) && !arr.length) {
    return true;
  }

  return false;
};

// 10000 -> 10,000
export const withComma = (value: number | string) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Convert "NaN" to "-". This is for line chart's tooltip.
export const filterNaN = (value: number | string): string => {
  switch (typeof value) {
    case "number":
      if (Number.isNaN(value)) {
        return "-";
      }
      return String(value);

    case "string":
      if (value === "NaN") {
        return "-";
      }
      return value;

    default:
      return value;
  }
};
