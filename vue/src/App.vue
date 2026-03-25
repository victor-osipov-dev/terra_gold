<script setup lang="ts">
import type { router } from "./router";
</script>

<template>
    <div class="mobile-wrapper">
        <router-view></router-view>
    </div>
</template>

<style scoped>
.mobile-wrapper {
    max-width: 480px;
    margin: 0 auto;
    /* padding: 16px; */

    min-height: 100vh;

    background: linear-gradient(180deg, #c8f7a4, #8ed081);
}
</style>

