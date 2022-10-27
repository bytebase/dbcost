import { CloudProvider } from "@/types";

export const getInstanceFamily = (
  name: string,
  provider: CloudProvider,
  withoutSeparator: boolean = false
): string => {
  switch (provider) {
    case "AWS":
      if (withoutSeparator) {
        return `${name.split(".")[1]}`;
      }
      return `${name.split(".").slice(0, 2).join(".")}.`;
    case "GCP":
      if (withoutSeparator) {
        return `${name.split("-")[1]}`;
      }
      return `${name.split("-").slice(0, 2).join("-")}-`;
    default:
      return "";
  }
};

export const getInstanceSize = (
  name: string,
  provider: CloudProvider
): string => {
  switch (provider) {
    case "AWS":
      return name.split(".")[2];
    default:
      return "";
  }
};
