<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { connectTON } from "../api";
import { useUser } from "../shared/composables/user";

const { tonConnectUI, connectedWallet, connectedWalletPromise } = connectTON()

const route = useRoute();
const router = useRouter()
const walletAddress = computed(() => connectedWallet.value?.account.address)
const { data: user, isLoading } = useUser();

async function connectWallet() {
    await tonConnectUI.openModal();
}

if (route.query.action == "deposit") {
    connectedWalletPromise
        .then(() => router.push('/deposit'))
        .catch(() => connectWallet())
}
</script>

<template>
    <div class="farm-page">

        <!-- Fence top -->
        <div class="fence-top">
            <span v-for="i in 20" :key="i" class="fence-post" />
        </div>

        <!-- Sky & sun decoration -->
        <div class="sky-deco" aria-hidden="true">
            <span class="sun">☀️</span>
            <span class="cloud cloud-1">☁️</span>
            <span class="cloud cloud-2">☁️</span>
        </div>

        <!-- Profile farmhouse card -->
        <div class="farmhouse-card">

            <!-- Header: barn roof -->
            <div class="barn-roof">
                <div class="roof-triangle" />
                <div class="roof-label">🌻 Ваш профиль</div>
            </div>

            <!-- Avatar + name -->
            <div class="farmer-header">
                <div class="avatar-wrap">
                    <img
                        v-if="user?.photo_url"
                        :src="user.photo_url"
                        class="farmer-avatar"
                        alt="avatar"
                    />
                    <div v-else class="farmer-avatar farmer-avatar--placeholder">🧑‍🌾</div>
                    <div class="avatar-badge">👑</div>
                </div>

                <div class="farmer-info">
                    <div class="farmer-name">
                        <template v-if="isLoading">Загрузка…</template>
                        <template v-else>{{ user?.first_name }} {{ user?.last_name }}</template>
                    </div>
                    <div class="farmer-username">@{{ user?.username }}</div>
                </div>
            </div>

            <!-- Divider straw -->
            <div class="straw-divider"><span v-for="i in 12" :key="i">−</span></div>

            <!-- Stats row -->
            <div class="stats-row">
                <div class="stat-chip stat-chip--gold">
                    <span class="stat-icon">💰</span>
                    <div class="stat-body">
                        <div class="stat-val">{{ user?.balance ?? '—' }}</div>
                        <div class="stat-lbl">USDT</div>
                    </div>
                </div>
                <div class="stat-chip stat-chip--green">
                    <span class="stat-icon">🌐</span>
                    <div class="stat-body">
                        <div class="stat-val">{{ user?.all_chats_user_count ?? '—' }}</div>
                        <div class="stat-lbl">чатов</div>
                    </div>
                </div>
            </div>

            <!-- Divider straw -->
            <div class="straw-divider"><span v-for="i in 12" :key="i">−</span></div>

            <!-- TON Wallet section -->
            <div class="wallet-section">
                <div class="section-label">💎 TON Кошелёк</div>

                <button
                    v-if="!walletAddress"
                    class="farm-btn farm-btn--blue"
                    @click="connectWallet"
                >
                    🔗 Подключить кошелёк
                </button>

                <template v-else>
                    <div class="wallet-chip">
                        💎 {{ walletAddress?.slice(0, 6) }}…{{ walletAddress?.slice(-4) }}
                    </div>
                    <button
                        class="farm-btn farm-btn--red farm-btn--sm"
                        @click="tonConnectUI.disconnect()"
                    >
                        Отключить
                    </button>
                </template>
            </div>

            <!-- Divider straw -->
            <div class="straw-divider"><span v-for="i in 12" :key="i">−</span></div>

            <!-- Action buttons -->
            <div class="action-buttons">
                <button
                    class="farm-btn farm-btn--brown"
                    @click="router.push('/admin-chats')"
                >
                    💬 Управление чатами
                </button>
                <button
                    class="farm-btn farm-btn--green"
                    @click="router.push('/deposit')"
                >
                    📩 Пополнить
                </button>
            </div>

        </div>

        <!-- Grass bottom -->
        <div class="grass-row">
            <span v-for="i in 16" :key="i" class="grass-blade">🌿</span>
        </div>

    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Comfortaa:wght@400;600;700&display=swap');

.farm-page {
    --bark:      #6b4226;
    --wood:      #c8924a;
    --wood-lt:   #e8b87a;
    --straw:     #f5e6a3;
    --field:     #78a84b;
    --cream:     #fdf6e8;
    --warm:      #faf0db;
    --text:      #3d2b1f;
    --muted:     #8a6a4a;
    --red-barn:  #b83028;
    --gold:      #e8a020;
    --sky-blue:  #4a90c4;

    font-family: 'Nunito', sans-serif;
    background: linear-gradient(180deg, #cfe8fa 0%, #d4edd4 45%, #a8d470 100%);
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow-x: hidden;
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
    box-shadow: inset 0 3px 0 rgba(255,255,255,.25);
}

/* ── Sky deco ── */
.sky-deco {
    position: absolute;
    top: 30px;
    left: 0; right: 0;
    pointer-events: none;
    z-index: 0;
}
.sun {
    position: absolute;
    right: 20px; top: 0;
    font-size: 34px;
    animation: sway 6s ease-in-out infinite;
}
.cloud {
    position: absolute;
    font-size: 28px;
    opacity: .8;
    animation: drift 14s linear infinite;
}
.cloud-1 { top: 8px; left: -40px; animation-duration: 18s; }
.cloud-2 { top: 22px; left: -80px; animation-duration: 24s; animation-delay: -8s; font-size: 22px; }
@keyframes drift { to { transform: translateX(calc(100vw + 80px)); } }
@keyframes sway  {
    0%,100% { transform: rotate(-4deg) scale(1); }
    50%      { transform: rotate(4deg) scale(1.06); }
}

/* ── Farmhouse card ── */
.farmhouse-card {
    position: relative;
    z-index: 1;
    width: calc(100% - 24px);
    max-width: 420px;
    background: var(--cream);
    border: 3px solid var(--wood);
    border-radius: 0 0 20px 20px;
    margin: 52px 12px 0;
    overflow: hidden;
    box-shadow: 0 6px 0 var(--bark), 0 10px 28px rgba(61,43,31,.18);
}

/* ── Barn roof ── */
.barn-roof {
    background: linear-gradient(160deg, var(--red-barn) 0%, #922018 100%);
    padding: 14px 20px 16px;
    text-align: center;
    border-bottom: 3px solid var(--bark);
    position: relative;
}
.barn-roof::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
        90deg, transparent 0, transparent 18px,
        rgba(0,0,0,.07) 18px, rgba(0,0,0,.07) 20px
    );
    pointer-events: none;
}
.roof-label {
    font-family: 'Comfortaa', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--straw);
    letter-spacing: .06em;
    position: relative;
}

/* ── Farmer header ── */
.farmer-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 18px 4px;
}
.avatar-wrap {
    position: relative;
    flex-shrink: 0;
}
.farmer-avatar {
    width: 70px; height: 70px;
    border-radius: 50%;
    border: 3px solid var(--wood);
    box-shadow: 0 3px 8px rgba(107,66,38,.25);
    object-fit: cover;
    display: flex; align-items: center; justify-content: center;
    background: #e8f5d0;
}
.farmer-avatar--placeholder {
    font-size: 36px;
}
.avatar-badge {
    position: absolute;
    bottom: -2px; right: -2px;
    background: var(--gold);
    border: 2px solid var(--bark);
    border-radius: 50%;
    width: 22px; height: 22px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
}
.farmer-info { flex: 1; min-width: 0; }
.farmer-name {
    font-family: 'Comfortaa', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.farmer-username {
    font-size: 13px;
    color: var(--muted);
    margin-top: 3px;
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

/* ── Stats row ── */
.stats-row {
    display: flex;
    gap: 10px;
    padding: 0 16px 4px;
}
.stat-chip {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 14px;
    border: 2px solid transparent;
}
.stat-chip--gold {
    background: rgba(232,160,32,.12);
    border-color: rgba(232,160,32,.35);
}
.stat-chip--green {
    background: rgba(120,168,75,.12);
    border-color: rgba(120,168,75,.35);
}
.stat-icon { font-size: 22px; flex-shrink: 0; }
.stat-val {
    font-family: 'Comfortaa', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    line-height: 1;
}
.stat-lbl {
    font-size: 10px;
    color: var(--muted);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .05em;
    margin-top: 2px;
}

/* ── Wallet section ── */
.wallet-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 0 16px 4px;
}
.section-label {
    font-family: 'Comfortaa', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: .08em;
    align-self: flex-start;
    margin-bottom: 2px;
}
.wallet-chip {
    width: 100%;
    text-align: center;
    padding: 9px 16px;
    background: rgba(74,144,196,.1);
    border: 2px solid rgba(74,144,196,.3);
    border-radius: 20px;
    font-family: 'Comfortaa', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--sky-blue);
}

/* ── Farm buttons ── */
.farm-btn {
    width: 100%;
    padding: 11px 20px;
    border-radius: 20px;
    border: 2px solid transparent;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition: transform .1s, box-shadow .1s;
    text-shadow: 0 1px 2px rgba(0,0,0,.2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}
.farm-btn:active { transform: translateY(2px); }

.farm-btn--sm { font-size: 12px; padding: 7px 18px; width: auto; }

.farm-btn--green {
    background: var(--field);
    border-color: #4e7f30;
    color: #fff;
    box-shadow: 0 4px 0 #3a6020;
}
.farm-btn--green:active { box-shadow: 0 1px 0 #3a6020; }

.farm-btn--brown {
    background: var(--wood);
    border-color: var(--bark);
    color: #fff;
    box-shadow: 0 4px 0 var(--bark);
}
.farm-btn--brown:active { box-shadow: 0 1px 0 var(--bark); }

.farm-btn--blue {
    background: var(--sky-blue);
    border-color: #2a6a9a;
    color: #fff;
    box-shadow: 0 4px 0 #2a5a80;
}
.farm-btn--blue:active { box-shadow: 0 1px 0 #2a5a80; }

.farm-btn--red {
    background: var(--red-barn);
    border-color: #7a1510;
    color: #fff;
    box-shadow: 0 3px 0 #6a1010;
}
.farm-btn--red:active { box-shadow: 0 1px 0 #6a1010; }

/* ── Action buttons ── */
.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 16px 20px;
}

/* ── Grass ── */
.grass-row {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 2px;
    margin-top: 8px;
    padding-bottom: max(env(safe-area-inset-bottom), 12px);
    position: relative;
    z-index: 1;
}
.grass-blade { font-size: 18px; opacity: .8; }
</style>