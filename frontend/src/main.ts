import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./assets/css/tailwind.css";

// https://pinia.vuejs.org/
const pinia = createPinia();

const app = createApp(App);

app.use(pinia).mount("#app");
