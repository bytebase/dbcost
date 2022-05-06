export type RowStatus = "ARCHIVED" | "NORMAL";

export type Currency = "USD";

export type EngineType = "MYSQL" | "POSTGRES" | "ORACLE" | "SQLSERVER";

// "" meas empty cloud provider
export type CloudProvider = "AWS" | "ALIYUN" | "GCP" | "";

export const isValidCloudProvider = (providerList: string[]): boolean => {
  for (const provider in providerList) {
    if (provider !== "AWS" && provider !== "GCP" && provider !== "") {
      return false;
    }
  }

  return true;
};

export const isValidEngineType = (engineTypeList: string[]): boolean => {
  for (const engineType in engineTypeList) {
    if (
      engineType !== "MYSQL" &&
      engineType !== "POSTGRES" &&
      engineType !== "ORACLE" &&
      engineType !== "SQLSERVER"
    ) {
      return false;
    }
  }

  return true;
};
