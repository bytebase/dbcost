import { useDBInstanceStore } from "../src/stores/dbInstance";
import { CloudProvider } from "../src/types";

export const cloudProviderList: string[] = ["AWS", "GCP"];

export const cloudServiceList: (cloudProvider: CloudProvider) => string[] = (
  cloudProvider: CloudProvider
) => {
  if (cloudProvider === "AWS") {
    return ["RDS"];
  } else if (cloudProvider === "GCP") {
    return ["Cloud SQL"];
  }
  return [];
};

export const databaseList: string[] = ["MySQL", "PostgreSQL"];

// charge type On Demand is set to "", for user may not type in On Demand explicitly.
export const chargeTypeList: string[] = ["Reserved", ""];

export const machineTypeList: (cloudProvider: CloudProvider) => string[] = (
  cloudProvider: CloudProvider
) => {
  const dbInstanceStore = useDBInstanceStore();
  dbInstanceStore.loadDBInstanceList();
  const dbInstance = dbInstanceStore.dbInstanceList;

  const _machineTypeList: string[] = [];
  dbInstance.forEach((instance) => {
    if (instance.cloudProvider === cloudProvider) {
      if (cloudProvider === "GCP") {
        // e.g. db-N1Standard-96-360
        _machineTypeList.push(instance.name);
      } else if (cloudProvider === "AWS") {
        // e.g. db.r6g.4xlarge --> db-r6g-4xlarge
        _machineTypeList.push(instance.name.split(".").join("-"));
      }
    }
  });

  return _machineTypeList;
};
