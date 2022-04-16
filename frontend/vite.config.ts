import { defineConfig } from "vite";
import { resolve } from "path";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";
import vue from "@vitejs/plugin-vue";

const r = (...args: string[]) => resolve(__dirname, ...args);

// https://vitejs.dev/config/
export default defineConfig({
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
});
