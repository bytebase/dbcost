import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import App from "@/layout/AppLayout.vue";

export type routeParam = {
  provider: string;
  engine: string;
  region: string;
  chargeType: string;
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
  next();
});

router.afterEach((to /*, from */) => {});
