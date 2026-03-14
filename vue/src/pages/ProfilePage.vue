<script lang="ts" setup>
import { computed, ref } from "vue";
import { NCard, NAvatar, NTag, NButton, NSpace, NDivider } from "naive-ui";
import { useRoute, useRouter } from "vue-router";
import WebApp from "@twa-dev/sdk";
import { connectTON } from "../api";

const { tonConnectUI, connectedWallet, connectedWalletPromise } = connectTON()


const route = useRoute();
const router = useRouter()
const user = WebApp.initDataUnsafe.user;
const data = ref<any>(null);
const walletAddress = computed(() => connectedWallet.value?.account.address)



fetch("https://ai-box-cars.ru:8000/api/verify", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        initData: WebApp.initData,
    }),
})
    .then((response) => response.json())
    .then((json) => {
        console.log(json);
        // data.value = json;
    })
    .catch((err) => {
        data.value = "err";
    });



async function connectWallet() {
    await tonConnectUI.openModal();
}

if (route.query.action == "deposit") {
    connectedWalletPromise
        .then((wallet) => {
            router.push('/deposit')
        })
        .catch(() => {
            connectWallet()
        })
}
</script>

<template>
    <div>{{ data }} {{ walletAddress }}</div>
    <!-- <pre>{{ walletRef }}</pre> -->
     
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
            <n-button v-if="!walletAddress" type="primary" block round @click="connectWallet">
                🔗 Подключить TON кошелёк
            </n-button>

            <n-tag v-else type="success" round>
                💎 {{ walletAddress?.slice(0, 6) }}...{{
                    walletAddress?.slice(-4)
                }}
            </n-tag>

            <n-button v-if="walletAddress" @click="tonConnectUI.disconnect()" type="error" block round
                style="width: max-content;"> Отключить кошелёк </n-button>
        </div>

        <n-divider />

        <!-- ACTION BUTTONS -->
        <n-space vertical>
            <n-button type="success" block round>
                💬 Управление чатами
            </n-button>

            <n-button @click="() => {
                router.push('/deposit')
            }" type="success" block round> 📩 Пополнить </n-button>
        </n-space>

    </n-card>
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
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
}
</style>
