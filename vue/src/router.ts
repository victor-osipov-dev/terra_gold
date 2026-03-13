import { createRouter, createWebHistory } from "vue-router";
import ProfilePage from "./pages/ProfilePage.vue";

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: ProfilePage
        }
    ]
})