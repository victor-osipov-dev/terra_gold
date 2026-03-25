<script setup>
import { computed, ref, watchEffect } from "vue";
import { connectTON } from "../api";
import { useRouter } from "vue-router";
import { useUser } from "../shared/composables/user";
import { useQuery } from "@tanstack/vue-query";

const router = useRouter()
const { tonConnectUI, connectedWallet } = connectTON()
const { data: user } = useUser();

const walletConnected = computed(() => !!connectedWallet.value)
const selectedAmount = ref(1);
const customValue = ref(1);

const amounts = [1, 5, 10, 25, 50];

const merchantAddress = "UQCtuLgvIXZ8z2cEosLKxKHsiPgcrepaK-VnBPaFZhTI1NZL";

watchEffect(() => {
    selectedAmount.value = customValue.value
})

const { data: payload } = useQuery({
    queryKey: [customValue],
    queryFn: async () => {
        const res = await fetch("https://ai-box-cars.ru:8000/create-ton-payload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comment: 'user_id:' + user.value.id }),
        });
        if (!res.ok) throw new Error("Ошибка запроса");
        const json = await res.json();
        return json.payload;
    }
})

function selectAmount(amount) {
    selectedAmount.value = amount;
    customValue.value = amount;
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
    const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
            address: merchantAddress,
            amount: amountNano.toString(),
            payload: payload.value
        }]
    };

    try {
        await tonConnectUI.sendTransaction(tx);
    } catch (e) {
        console.error("Transaction failed", e);
    }
}
</script>

<template>
    <div class="farm-page">

        <!-- Fence top -->
        <div class="fence-top">
            <span v-for="i in 20" :key="i" class="fence-post" />
        </div>

        <!-- Back button -->
        <button class="back-btn" @click="router.push('/')">← Назад</button>

        <!-- Main card -->
        <div class="barn-card">

            <!-- Header -->
            <header class="barn-header">
                <div class="barn-label">💎 TON Кошелёк</div>
                <h1 class="barn-title">Пополнить<br /><span>баланс</span></h1>
                <div class="header-divider">
                    <span>🌾</span><span class="divider-line" /><span>🌾</span>
                </div>
            </header>

            <!-- Amount section -->
            <div class="section">
                <div class="section-label">🪙 Выберите сумму</div>

                <!-- Quick amounts -->
                <div class="amounts-grid">
                    <button v-for="amount in amounts" :key="amount"
                        :class="['amount-chip', selectedAmount === amount ? 'amount-chip--active' : '']"
                        @click="selectAmount(amount)">
                        <span class="amount-icon">💎</span>
                        {{ amount }} TON
                    </button>
                </div>

                <!-- Custom input -->
                <div class="custom-input-wrap">
                    <span class="custom-input-label">Другая сумма:</span>
                    <div class="custom-input-row">
                        <button class="stepper-btn" @click="selectAmount(Math.max(1, customValue - 1))">−</button>
                        <input class="custom-input" type="number" :value="customValue" min="1" max="1000"
                            @input="e => selectAmount(Math.min(1000, Math.max(1, +e.target.value || 1)))" />
                        <button class="stepper-btn" @click="selectAmount(Math.min(1000, customValue + 1))">+</button>
                    </div>
                </div>
            </div>

            <!-- Straw divider -->
            <div class="straw-divider"><span v-for="i in 14" :key="i">−</span></div>

            <!-- Summary -->
            <div class="summary-box">
                <div class="summary-row">
                    <span class="summary-key">💰 Сумма</span>
                    <span class="summary-val">{{ selectedAmount }} TON</span>
                </div>
                <!-- <div class="summary-row">
                    <span class="summary-key">📦 В нано-TON</span>
                    <span class="summary-val mono">{{ (selectedAmount * 1e9).toLocaleString() }}</span>
                </div> -->
            </div>

            <!-- Straw divider -->
            <div class="straw-divider"><span v-for="i in 14" :key="i">−</span></div>

            <!-- Action -->
            <div class="action-section">
                <button v-if="!walletConnected" class="farm-btn farm-btn--blue" @click="connectWallet">
                    🔗 Подключить кошелёк
                </button>

                <button v-else class="farm-btn farm-btn--green" @click="deposit">
                    📩 Пополнить {{ selectedAmount }} TON
                </button>

                <div class="action-hint">
                    Средства поступят на ваш счёт в течение нескольких минут
                </div>
            </div>

        </div>

        <!-- Grass -->
        <div class="grass-row">
            <span v-for="i in 16" :key="i" class="grass-blade">🌿</span>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Comfortaa:wght@400;600;700&display=swap');

.farm-page {
    --bark: #6b4226;
    --wood: #c8924a;
    --wood-lt: #e8b87a;
    --straw: #f5e6a3;
    --field: #78a84b;
    --cream: #fdf6e8;
    --warm: #faf0db;
    --text: #3d2b1f;
    --muted: #8a6a4a;
    --red-barn: #b83028;
    --gold: #e8a020;
    --sky-blue: #4a90c4;

    font-family: 'Nunito', sans-serif;
    background: linear-gradient(180deg, #cfe8fa 0%, #d4edd4 40%, #a8d470 100%);
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* ── Fence ── */
.fence-top {
    width: 100%;
    display: flex;
    padding: 0 3px;
    margin-bottom: -1px;
    z-index: 2;
    position: relative;
}

.fence-post {
    flex: 1;
    height: 26px;
    background: var(--wood);
    border: 2px solid var(--bark);
    border-bottom: none;
    border-radius: 3px 3px 0 0;
    box-shadow: inset 0 3px 0 rgba(255, 255, 255, .25);
}

/* ── Back ── */
.back-btn {
    align-self: flex-start;
    margin: 12px 16px 0;
    padding: 7px 18px;
    background: var(--wood);
    border: 2px solid var(--bark);
    border-radius: 20px;
    color: #fff;
    font-family: 'Nunito', sans-serif;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 3px 0 var(--bark);
    transition: transform .1s, box-shadow .1s;
    text-shadow: 0 1px 2px rgba(0, 0, 0, .25);
    position: relative;
    z-index: 1;
}

.back-btn:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 var(--bark);
}

/* ── Barn card ── */
.barn-card {
    width: calc(100% - 24px);
    max-width: 420px;
    background: var(--cream);
    border: 3px solid var(--wood);
    border-radius: 20px;
    margin: 14px 12px 0;
    overflow: hidden;
    box-shadow: 0 6px 0 var(--bark), 0 10px 28px rgba(61, 43, 31, .18);
    position: relative;
    z-index: 1;
}

/* ── Header ── */
.barn-header {
    background: linear-gradient(160deg, var(--red-barn) 0%, #922018 100%);
    padding: 22px 20px 18px;
    text-align: center;
    border-bottom: 3px solid var(--bark);
    position: relative;
}

.barn-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(90deg, transparent 0, transparent 18px,
            rgba(0, 0, 0, .07) 18px, rgba(0, 0, 0, .07) 20px);
    pointer-events: none;
}

.barn-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, .7);
    margin-bottom: 6px;
}

.barn-title {
    font-family: 'Comfortaa', sans-serif;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.3;
    color: #fff;
    text-shadow: 0 2px 5px rgba(0, 0, 0, .3);
    margin: 0;
}

.barn-title span {
    color: var(--straw);
}

.header-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
}

.divider-line {
    flex: 1;
    max-width: 60px;
    height: 2px;
    background: rgba(255, 255, 255, .3);
    border-radius: 2px;
}

/* ── Section ── */
.section {
    padding: 18px 16px 6px;
}

.section-label {
    font-family: 'Comfortaa', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--muted);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: .06em;
}

/* ── Amount chips ── */
.amounts-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
}

.amount-chip {
    flex: 1 1 calc(33% - 8px);
    min-width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 10px 8px;
    background: var(--warm);
    border: 2px solid var(--wood-lt);
    border-radius: 14px;
    font-family: 'Comfortaa', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    cursor: pointer;
    transition: transform .1s, border-color .15s, background .15s, box-shadow .1s;
    box-shadow: 0 2px 0 var(--wood-lt);
}

.amount-chip:active {
    transform: translateY(1px);
    box-shadow: 0 1px 0 var(--wood-lt);
}

.amount-chip--active {
    background: rgba(120, 168, 75, .15);
    border-color: var(--field);
    color: #3a6e18;
    box-shadow: 0 2px 0 #4e7f30;
}

.amount-icon {
    font-size: 14px;
}

/* ── Custom input ── */
.custom-input-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.custom-input-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: .06em;
}

.custom-input-row {
    display: flex;
    align-items: center;
    gap: 0;
    background: var(--warm);
    border: 2px solid var(--wood-lt);
    border-radius: 14px;
    overflow: hidden;
}

.stepper-btn {
    width: 44px;
    height: 44px;
    background: var(--wood-lt);
    border: none;
    font-size: 20px;
    font-weight: 800;
    color: var(--bark);
    cursor: pointer;
    transition: background .12s;
    flex-shrink: 0;
}

.stepper-btn:hover {
    background: var(--wood);
    color: #fff;
}

.stepper-btn:active {
    background: var(--bark);
    color: #fff;
}

.custom-input {
    flex: 1;
    border: none;
    background: transparent;
    text-align: center;
    font-family: 'Comfortaa', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    padding: 0 8px;
    outline: none;
    -moz-appearance: textfield;
}

.custom-input::-webkit-outer-spin-button,
.custom-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

/* ── Straw divider ── */
.straw-divider {
    display: flex;
    justify-content: center;
    gap: 1px;
    color: var(--wood-lt);
    font-size: 12px;
    letter-spacing: 2px;
    padding: 10px 0 6px;
    opacity: .6;
}

/* ── Summary ── */
.summary-box {
    margin: 0 16px 4px;
    background: var(--warm);
    border: 2px solid var(--wood-lt);
    border-radius: 14px;
    overflow: hidden;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px dashed var(--wood-lt);
}

.summary-row:last-child {
    border-bottom: none;
}

.summary-key {
    font-size: 12px;
    font-weight: 700;
    color: var(--muted);
}

.summary-val {
    font-family: 'Comfortaa', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
}

.mono {
    font-family: 'Courier New', monospace;
    font-size: 12px;
}

/* ── Action section ── */
.action-section {
    padding: 4px 16px 20px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
}

.action-hint {
    text-align: center;
    font-size: 11px;
    color: var(--muted);
    font-style: italic;
    line-height: 1.4;
    padding: 0 8px;
}

/* ── Farm buttons ── */
.farm-btn {
    width: 100%;
    padding: 13px 20px;
    border-radius: 20px;
    border: 2px solid transparent;
    font-family: 'Nunito', sans-serif;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition: transform .1s, box-shadow .1s;
    text-shadow: 0 1px 2px rgba(0, 0, 0, .2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.farm-btn:active {
    transform: translateY(2px);
}

.farm-btn--green {
    background: var(--field);
    border-color: #4e7f30;
    color: #fff;
    box-shadow: 0 4px 0 #3a6020;
}

.farm-btn--green:active {
    box-shadow: 0 1px 0 #3a6020;
}

.farm-btn--blue {
    background: var(--sky-blue);
    border-color: #2a6a9a;
    color: #fff;
    box-shadow: 0 4px 0 #2a5a80;
}

.farm-btn--blue:active {
    box-shadow: 0 1px 0 #2a5a80;
}

/* ── Grass ── */
.grass-row {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 2px;
    margin-top: 8px;
    padding-bottom: max(env(safe-area-inset-bottom), 12px);
}

.grass-blade {
    font-size: 18px;
    opacity: .8;
}
</style>