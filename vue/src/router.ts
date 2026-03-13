import { createRouter, createWebHistory } from "vue-router";
import ProfilePage from "./pages/ProfilePage.vue";
import DepositPage from "./pages/DepositPage.vue";

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            component: () => import("./pages/ProfilePage.vue"),
        },
        {
            path: "/deposit",
            component: () => import("./pages/DepositPage.vue"),
        },
    ],
});
