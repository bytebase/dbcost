import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import AppLayout from "../layout/AppLayout.vue";

import { useSearchConfigStore } from "../stores/searchConfig";
import {
  ChargeType,
  CloudProvider,
  EngineType,
  isValidChargeType,
  isValidCloudProvider,
  isValidEngineType,
  isValidRegion,
  SearchConfig,
  SearchConfigDefault,
} from "../types";

// RouteParam is the query param used in the URL
// to make the URL as simple as possible,
// we do the following mapping between the attribute in SearchConfig and the attribute in Query Param:
//    cloudProvider -> provider
//    engineType -> engine
//    chargeType -> charge
export type RouteParam = {
  provider?: string;
  engine?: string;
  charge?: string;
  region?: string;
  minCPU?: number;
  minRAM?: number;
  keyword?: string;
};

export const RouteParamDefault: RouteParam = {
  provider: SearchConfigDefault.cloudProvider,
  region: SearchConfigDefault.region?.join(","),
  engine: SearchConfigDefault.engineType?.join(","),
  charge: SearchConfigDefault.chargeType?.join(","),
};

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "app",
    component: AppLayout,
    children: [
      {
        path: "",
        name: "dashboard",
        components: {
          body: () => import("../views/AppView.vue"),
        },
      },
      {
        path: "404",
        name: "404",
        components: {
          body: () => import("../views/Page404.vue"),
        },
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to /*, from, savedPosition */) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }
  },
});

router.beforeEach((to, from, next) => {
  if (
    // directly access index page
    to.fullPath === "/" ||
    // typed in URL with param
    from.name ||
    to.name === "404"
  ) {
    next();
    return;
  }

  // no resource
  if (to.matched.length === 0) {
    next({ name: "404" });
    return;
  }
  try {
    const query = to.query as RouteParam;
    const config: SearchConfig = {
      cloudProvider: query.provider as CloudProvider,
      region: query.region?.split(","),
      chargeType: query.charge?.split(",") as ChargeType[],
      engineType: query.engine?.split(",") as EngineType[],
      keyword: query.keyword ? (query.keyword as string) : "",
      minCPU: query.minCPU ? Number(query.minCPU) : 0,
      minRAM: query.minRAM ? Number(query.minRAM) : 0,
    };
    if (
      (!config.cloudProvider || isValidCloudProvider(config.cloudProvider)) &&
      (!config.region || isValidRegion(config.region)) &&
      (!config.chargeType || isValidChargeType(config.chargeType)) &&
      (!config.engineType || isValidEngineType(config.engineType))
    ) {
      const searchConfigStore = useSearchConfigStore();
      searchConfigStore.searchConfig = config;
      next();
      return;
    }
  } catch (e) {}

  // if the query param is invalid or some errors occur, use default setting
  next({
    name: "dashboard",
    replace: true,
    query: RouteParamDefault,
  });
  return;
});

router.afterEach((to /*, from */) => {});
