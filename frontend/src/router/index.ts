import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import App from "../layout/AppLayout.vue";
import { useSearchConfigStore } from "../stores/searchConfig";
import { ChargeType, CloudProvider, EngineType } from "../types";

export type RouteParam = {
  cloudProvider: string;
  engineType: string;
  chargeType: string;
  region: string;
  minCPU: number;
  minRAM: number;
  keyword: string;
};
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "app",
    component: App,
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
  // directly access index page
  if (to.fullPath === "/") {
    next();
    return;
  }

  // typed in URL with param
  if (!from.name) {
    const config = useSearchConfigStore().searchConfig;
    const query = to.query;

    config.cloudProvider = query.cloudProvider as CloudProvider;
    config.region = (query.region as string).split("-");
    config.chargeType = (query.chargeType as string).split("-") as ChargeType[];
    config.engineType = (query.engineType as string).split("-") as EngineType[];
    config.keyword = query.keyword as string;
    config.minCPU = Number(query.minCPU as string);
    config.minRAM = Number(query.minRAM as string);
  }

  next();
});

router.afterEach((to /*, from */) => {});
