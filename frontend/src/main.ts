import { createApp } from "vue";
import { createPinia } from "pinia";
import VueApexCharts from "vue3-apexcharts";
import { router } from "./router";
import App from "./App.vue";
import "./assets/css/tailwind.css";
import "./assets/css/font.css";

// https://pinia.vuejs.org/
const pinia = createPinia();

const app = createApp(App);
// Allow template to access various function
app.config.globalProperties.window = window;
app.config.globalProperties.console = console;

app.use(pinia).use(router).use(VueApexCharts);
app.mount("#app");
