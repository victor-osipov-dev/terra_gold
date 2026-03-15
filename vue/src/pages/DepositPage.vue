<script setup>
import { computed, ref, watchEffect } from "vue";
import { NCard, NButton, NSpace, NDivider, NTag, NInputNumber } from "naive-ui";
import { connectTON } from "../api";
import { useRouter } from "vue-router";
import { useUser } from "../shared/composables/user";
// import { beginCell } from "ton-core";

const router = useRouter()
const { tonConnectUI, connectedWallet } = connectTON()
const { data: user, isLoading, error } = useUser();

const walletConnected = computed(() => !!connectedWallet.value)
const selectedAmount = ref(1);

const amounts = [1, 5, 10, 25, 50];

const merchantAddress = "UQCtuLgvIXZ8z2cEosLKxKHsiPgcrepaK-VnBPaFZhTI1NZL"; // адрес для пополнения



function selectAmount(amount) {
    selectedAmount.value = amount;
}

async function connectWallet() {
    await tonConnectUI.openModal();
}

async function deposit() {
    if (!tonConnectUI.wallet) {
        await connectWallet();
        return;
    }

    const amountNano = selectedAmount.value * 1e9;

    // const payload = beginCell()
    //     .storeUint(0, 32)       // optional op code
    //     .storeStringTail("user_id:" + user.id)
    //     .endCell()
    //     .toBoc()
    //     .toString("base64");
    const payload = btoa("user_id:" + user.id);

    const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
            {
                address: merchantAddress,
                amount: amountNano.toString(),
                payload
            }
        ]
    };

    try {
        const response = await tonConnectUI.sendTransaction(tx);
        
    } catch (e) {
        console.error("Transaction failed", e);
    }
}

const value = ref(1)
watchEffect(() => {
    selectAmount(value.value)
})
</script>

<template>
    <n-button class="back-button" type="info" size="small" @click="router.push('/')">
        Назад
    </n-button>
    

    <n-card class="deposit-card" title="Пополнить TON">

        <div class="amount-title">
            Укажите сумму
        </div>

        <n-space justify="center">
            <n-tag v-for="amount in amounts" :key="amount" size="large"
                :type="selectedAmount === amount ? 'success' : 'default'" class="amount-tag"
                @click="selectAmount(amount)">
                {{ amount }} TON
            </n-tag>

            <n-input-number v-model:value="value" min="1" max="1000"/>
        </n-space>

        <n-divider />

        <n-space vertical align="center">

            <n-button v-if="!walletConnected" type="primary" size="large" @click="connectWallet">
                Подключить кошелёк
            </n-button>

            <n-button v-else type="success" size="large" @click="deposit">
                Пополнить {{ selectedAmount }} TON
            </n-button>

        </n-space>

    </n-card>
</template>

<style scoped>
.deposit-card {
    border-radius: 20px;
    max-width: 420px;
    margin: auto;
}

.amount-title {
    text-align: center;
    margin-bottom: 12px;
    font-weight: 600;
}

.amount-tag {
    cursor: pointer;
    font-size: 16px;
    padding: 10px 16px;
}
.back-button {
    margin-bottom: 1rem;
}
</style>