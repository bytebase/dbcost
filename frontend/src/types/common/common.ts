export type RowStatus = "ARCHIVED" | "NORMAL";

export type Currency = "USD";

export type EngineType = "MYSQL" | "POSTGRES" | "ORACLE" | "SQLSERVER";

// "" meas empty cloud provider
export type CloudProvider = "AWS" | "ALIYUN" | "GCP" | "";

export const isValidCloudProvider = (val: string): boolean => {
  return val === "AWS" || val === "ALIYUN" || val === "GCP" || val === "";
};

export const isValidEngineType = (valList: string[]): boolean => {
  valList.forEach((engineType) => {
    if (
      engineType !== "MYSQL" &&
      engineType !== "POSTGRES" &&
      engineType !== "ORACLE" &&
      engineType !== "SQLSERVER"
    ) {
      return false;
    }
  });

  return true;
};
