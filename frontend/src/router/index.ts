import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import AppLayout from "../layout/AppLayout.vue";

import { useSearchConfigStore } from "../stores";
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
  RouteQueryDashBoard,
  RouteQueryCompare,
} from "../types";

export const RouteQueryDashBoardDefault: RouteQueryDashBoard = {
  provider: SearchConfigDefault.cloudProvider?.join(","),
  region: SearchConfigDefault.region?.join(","),
  engine: SearchConfigDefault.engineType?.join(","),
  charge: SearchConfigDefault.chargeType?.join(","),
};

// If any route is updated, please update the routes in ./util/sitemap.ts also.
export const routes: Array<RouteRecordRaw> = [
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
        path: "compare",
        name: "compare",
        components: {
          body: () => import("../views/CompareView.vue"),
        },
      },
      {
        path: "provider/:provider",
        name: "provider",
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

  const searchConfigStore = useSearchConfigStore();
  try {
    if (to.name === "dashboard") {
      const query = to.query as RouteQueryDashBoard;
      const config: SearchConfig = {
        cloudProvider: query.provider?.split(",") as CloudProvider[],
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
        searchConfigStore.searchConfig = config;
        next();
        return;
      }
    }

    if (to.name === "compare") {
      const query = to.query as RouteQueryCompare;
      if (!query.key) {
        next({ name: "404" });
        return;
      }
      next();
      return;
    }

    if (to.name === "provider") {
      const provider = to.params.provider as string;
      if (!provider || !isValidCloudProvider([provider])) {
        next({ name: "404" });
        return;
      }

      searchConfigStore.searchConfig.cloudProvider = [
        provider as CloudProvider,
      ];

      next();
      return;
    }
  } catch (e) {}

  // if the query param is invalid or some errors occur, use default setting
  next({
    name: "dashboard",
    replace: true,
    query: RouteQueryDashBoardDefault,
  });
  return;
});

router.afterEach((to /*, from */) => {});
