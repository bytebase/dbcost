import { useSearchConfigStore, useDBInstanceStore } from "@/stores";
import {
  ChargeType,
  CloudProvider,
  EngineType,
  isValidChargeType,
  isValidCloudProvider,
  isValidEngineType,
  isValidRegion,
  SearchConfig,
  RouteQueryDashBoard,
  RouteQueryCompare,
} from "@/types";

const PageName = {
  IndexPage: "index",
  PageNotFound: "404",
  ComparePage: "compare",
  ProviderPage: "provider-name",
};

// https://v3.nuxtjs.org/guide/directory-structure/middleware
export default defineNuxtRouteMiddleware(async (to, from) => {
  const dbInstanceStore = useDBInstanceStore();
  if (dbInstanceStore.dbInstanceList.length === 0) {
    await dbInstanceStore.loadDBInstanceList();
  }

  console.log(`${String(from.name)} ---> ${String(to.name)}`);

  if (
    // directly access
    to.fullPath === "/" ||
    to.fullPath === "/provider/gcp" ||
    to.fullPath === "/provider/aws" ||
    // from.fullPath === to.fullPath is true only when user first type in a URL in the browser.
    // We need to load the search config from the URL.
    from.fullPath !== to.fullPath ||
    to.name === "404"
  ) {
    return;
  }

  if (to.matched.length === 0) {
    return "/404";
  }

  const searchConfigStore = useSearchConfigStore();
  try {
    if (to.name === PageName.IndexPage) {
      const query = to.query as RouteQueryDashBoard;
      const config: SearchConfig = {
        cloudProvider: query.provider?.split(",") as CloudProvider[],
        region: query.region?.split(","),
        chargeType: query.charge?.split(",") as ChargeType[],
        engineType: query.engine?.split(",") as EngineType[],
        keyword: query.keyword ? (query.keyword as string) : "",
        minCPU: query.minCPU ? Number(query.minCPU) : 0,
        minRAM: query.minRAM ? Number(query.minRAM) : 0,
        leaseLength: query.lease ? Number(query.lease) : 1,
        utilization: query.utilization ? Number(query.utilization) : 1,
      };
      if (
        (!config.cloudProvider || isValidCloudProvider(config.cloudProvider)) &&
        (!config.region || isValidRegion(config.region)) &&
        (!config.chargeType || isValidChargeType(config.chargeType)) &&
        (!config.engineType || isValidEngineType(config.engineType))
      ) {
        searchConfigStore.searchConfig = config;
        return;
      }
      // if the config is invalid, will redirect to index page with default setting
      console.log("invalid config");
    }

    if (to.name === PageName.ComparePage) {
      const query = to.query as RouteQueryCompare;
      if (!query.instance) {
        console.log("unknown instance, redirecting to 404");
        return "/404";
      }
      return;
    }

    // TODO fix me
    if (to.name === PageName.ProviderPage) {
      const query = to.query as RouteQueryDashBoard;
      const config: SearchConfig = {
        cloudProvider: [
          to.params["name"].toString().toUpperCase() as CloudProvider,
        ],
        region: query.region?.split(","),
        chargeType: query.charge?.split(",") as ChargeType[],
        engineType: query.engine?.split(",") as EngineType[],
        keyword: query.keyword ? (query.keyword as string) : "",
        minCPU: query.minCPU ? Number(query.minCPU) : 0,
        minRAM: query.minRAM ? Number(query.minRAM) : 0,
        leaseLength: query.lease ? Number(query.lease) : 1,
        utilization: query.utilization ? Number(query.utilization) : 1,
      };
      if (
        (!config.region || isValidRegion(config.region)) &&
        (!config.chargeType || isValidChargeType(config.chargeType)) &&
        (!config.engineType || isValidEngineType(config.engineType))
      ) {
        searchConfigStore.searchConfig = config;
        return;
      }
      // if the config is invalid, will redirect to index page with default setting
      console.log("invalid config");
    }
  } catch (e) {}

  // if the query param is invalid or some errors occur, use default setting
  console.log("redirecting to index page with default setting");
  searchConfigStore.setToDefault();
  return "/";
});
