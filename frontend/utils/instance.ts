import { CloudProvider } from "@/types";

export const getInstanceClass = (
  name: string,
  provider: CloudProvider
): string => {
  switch (provider) {
    case "AWS":
      return `${name.split(".").slice(0, 2).join(".")}.`;
    case "GCP":
      return `${name.split("-").slice(0, 2).join("-")}-`;
    default:
      return "";
  }
};

export const getInstanceFamily = (
  name: string,
  provider: CloudProvider
): string => {
  switch (provider) {
    case "AWS":
      return name.split(".")[1].charAt(0);
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
