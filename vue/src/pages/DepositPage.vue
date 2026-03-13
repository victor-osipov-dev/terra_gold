<script setup>
import { ref, onMounted } from "vue";
import { NCard, NAvatar, NTag, NButton, NSpace, NDivider } from "naive-ui";

import { TonConnectUI } from "@tonconnect/ui";
import { useRoute } from "vue-router";
import WebApp from "@twa-dev/sdk";

const route = useRoute();
const user = WebApp.initDataUnsafe.user;

const walletAddress = ref(null);

let tonConnectUI = new TonConnectUI({
    manifestUrl: "https://ai-box-cars.ru/tonconnect-manifest.json",
});

tonConnectUI.onStatusChange((wallet) => {
    walletAddress.value = wallet?.account?.address || null;
});

async function connectWallet() {
    await tonConnectUI.openModal();
}

if (route.query.action == "deposit") {
    setTimeout(() => {
        if (!walletAddress) {
            connectWallet();
        }
    }, 1000);
}
</script>

<template>
    <div class="mobile-wrapper">
        <n-card class="profile-card">
            <!-- HEADER -->
            <div class="profile-header">
                <n-avatar round :size="70" :src="user?.photo_url" />

                <div class="profile-info">
                    <h3>{{ user?.first_name }} {{ user?.last_name }}</h3>

                    <span class="username"> @{{ user?.username }} </span>
                </div>
            </div>

            <n-divider />

            <!-- FARM INFO -->
            <n-space vertical>
                <n-space justify="space-between">
                    <n-tag type="warning"> 💰 {{ 5 }} USDT </n-tag>
                </n-space>

                <n-space justify="space-between">
                    <n-tag type="info"> 🌐 Вы в {{ 5 }} чатах </n-tag>

                    <n-tag type="info"> 💬 Ваши чаты {{ 1 }} </n-tag>
                </n-space>
            </n-space>

            <n-divider />

            <!-- TON WALLET -->
            <div class="wallet-section">
                <n-button
                    v-if="!walletAddress"
                    type="primary"
                    block
                    round
                    @click="connectWallet"
                >
                    🔗 Подключить TON кошелёк
                </n-button>

                <n-tag v-else type="success" round>
                    💎 {{ walletAddress.slice(0, 6) }}...{{
                        walletAddress.slice(-4)
                    }}
                </n-tag>
            </div>

            <n-divider />

            <!-- ACTION BUTTONS -->
            <n-space vertical>
                <n-button type="success" block round>
                    💬 Управление чатами
                </n-button>

                <n-button type="success" block round> 📩 Пополнить </n-button>
            </n-space>
        </n-card>
    </div>
</template>

<style scoped>
.mobile-wrapper {
    max-width: 480px;
    margin: 0 auto;
    padding: 16px;

    min-height: 100vh;

    background: linear-gradient(180deg, #c8f7a4, #8ed081);
}

.profile-card {
    border-radius: 20px;
}

.profile-header {
    display: flex;
    gap: 14px;
    align-items: center;
}

.profile-info h3 {
    margin: 0;
    font-size: 18px;
}

.username {
    opacity: 0.6;
    font-size: 14px;
}

.wallet-section {
    text-align: center;
}
</style>
