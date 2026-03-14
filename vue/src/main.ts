import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";

const app = createApp(App);
app.use(router);
// Создаём QueryClient
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,   // по умолчанию 5 минут кеш
            refetchOnWindowFocus: false,
        },
    },
});

// Регистрируем плагин Vue Query
app.use(VueQueryPlugin, { queryClient });
app.mount("#app");
