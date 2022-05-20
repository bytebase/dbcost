import { defineConfig, UserConfigExport } from "vite";
import { resolve } from "path";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";
import vue from "@vitejs/plugin-vue";
import generateSitemap from "./scripts/sitemap";

const r = (...args: string[]) => resolve(__dirname, ...args);

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const config: UserConfigExport = {
    plugins: [
      vue(),
      Components({
        dirs: [r("src/components")],
        // auto import icons
        resolvers: [
          IconsResolver({
            prefix: "",
          }),
        ],
      }),
      Icons(),
    ],
    assetsInclude: [r("../data")],
    server: {
      fs: {
        // Set this to false to access the .json file outside the frontend folder
        strict: false,
      },
    },
    resolve: {
      alias: {
        "./runtimeConfig": "./runtimeConfig.browser",
      },
    },
  };
  generateSitemap();

  return config;
});
