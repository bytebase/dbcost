import { defineNuxtConfig } from "nuxt";
import { resolve } from "path";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";

const r = (...args: string[]) => resolve(__dirname, ...args);

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  // https://v3.nuxtjs.org/migration/runtime-config
  runtimeConfig: {
    // Config within public will be also exposed to the client
    public: {
      mode: "sample",
    },
  },
  css: ["~/assets/css/tailwind.css", "~/assets/css/font.css"],
  modules: ["@pinia/nuxt", "unplugin-icons/nuxt", "lodash"],
  build: {
    transpile: [
      "naive-ui",
      "vueuc",
      "@css-render/vue3-ssr",
      "@juggle/resize-observer",
    ],
    postcss: {
      postcssOptions: {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
        },
      },
    },
  },
  vite: {
    optimizeDeps: {
      include: ["date-fns-tz/esm/formatInTimeZone"],
    },
    plugins: [
      Components({
        dirs: [r("./components"), r("./pages")],
        resolvers: [IconsResolver({ prefix: "" })],
      }),
      Icons({ autoInstall: true }),
    ],
    assetsInclude: [r("../data")],
    server: {
      fs: {
        // Set this to false to access the .json file outside the frontend folder
        strict: false,
      },
    },
  },

  googleAnalytics: {
    id: "G-H772TGHHK7",
  },

  sitemap: {
    hostname: "https://dbcost.com",
    gzip: true,
  },
});
