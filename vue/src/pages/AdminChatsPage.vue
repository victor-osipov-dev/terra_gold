<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useQuery } from '@tanstack/vue-query'
import WebApp from "@twa-dev/sdk";
import { useRouter } from 'vue-router';
import { getRoleLabel } from '../shared/utils/string';

const router = useRouter()
const userId = WebApp.initDataUnsafe.user.id

const fetchChats = async () => {
    const res = await axios.get(`https://ai-box-cars.ru:8000/user/${userId}/admin-chats-live`)
    return res.data
}

const { data: chats, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-chats', userId],
    queryFn: fetchChats
})

const manageChat = (chat) => {
    router.push(`/management-chat/${chat.chat_id}`)
}

const PLOT_ICONS = ['🌾', '🌽', '🥕', '🍅', '🥦', '🌻', '🍓', '🥔']
function plotIcon(chatId) {
    chatId = chatId >= 0 ? chatId : chatId * -1;
    return PLOT_ICONS[Number(chatId) % PLOT_ICONS.length];
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

        <!-- Main barn card -->
        <div class="barn-card">

            <!-- Header -->
            <header class="barn-header">
                <div class="barn-label">🐓 Ваши угодья</div>
                <h1 class="barn-title">Управление<br /><span>чатами</span></h1>
                <div class="header-divider">
                    <span>🌾</span><span class="divider-line" /><span>🌾</span>
                </div>
            </header>

            <!-- Refresh -->
            <div class="refresh-row">
                <button class="refresh-btn" :class="{ spinning: isFetching }" @click="refetch" :disabled="isFetching">
                    <span class="refresh-icon">{{ isFetching ? '🌀' : '🔄' }}</span>
                    {{ isFetching ? 'Обновляем…' : 'Обновить' }}
                </button>
            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="farm-loading">
                <div class="windmill">🌀</div>
                <span class="farm-loading-text">Собираем урожай чатов…</span>
            </div>

            <!-- Empty -->
            <div v-else-if="!chats?.length" class="farm-empty">
                <div class="farm-empty-art">🌵</div>
                <div class="farm-empty-title">Угодья пусты</div>
                <div class="farm-empty-desc">Чатов для управления пока нет</div>
            </div>

            <!-- List -->
            <ul v-else class="plot-list">
                <li v-for="(chat, idx) in chats" :key="chat.chat_id" class="plot-card"
                    :style="{ animationDelay: `${idx * 65}ms` }">
                    <!-- Crop icon -->
                    <div class="plot-icon">{{ plotIcon(chat.chat_id) }}</div>

                    <!-- Info -->
                    <div class="plot-info">
                        <div class="plot-title">{{ chat.title }}</div>
                        <span :class="['plot-role', chat.role === 'creator' ? 'role--owner' : 'role--worker']">
                            {{ chat.role === 'creator' ? '👑 Владелец' : '🌿 ' + getRoleLabel(chat.role) }}
                        </span>
                    </div>

                    <!-- Manage button -->
                    <button class="manage-btn" @click="manageChat(chat)">
                        Войти
                    </button>
                </li>
            </ul>
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

/* ── Back btn ── */
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
}

.back-btn:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 var(--bark);
}

/* ── Barn card ── */
.barn-card {
    width: calc(100% - 24px);
    max-width: 480px;
    background: var(--cream);
    border: 3px solid var(--wood);
    border-radius: 20px;
    margin: 14px 12px 0;
    overflow: hidden;
    box-shadow: 0 6px 0 var(--bark), 0 10px 28px rgba(61, 43, 31, .18);
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

/* ── Refresh row ── */
.refresh-row {
    display: flex;
    justify-content: flex-end;
    padding: 10px 14px 4px;
    background: var(--warm);
    border-bottom: 2px dashed var(--wood-lt);
}

.refresh-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 14px;
    background: var(--field);
    border: 2px solid #4e7f30;
    border-radius: 20px;
    color: #fff;
    font-family: 'Nunito', sans-serif;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 3px 0 #3a6020;
    transition: transform .1s, box-shadow .1s, opacity .15s;
    width: 150px;
    margin-bottom: 0.5rem;
    justify-content: center;
}

.refresh-btn:disabled {
    opacity: .7;
    cursor: default;
}

.refresh-btn:not(:disabled):active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 #3a6020;
}

.refresh-icon {
    font-size: 14px;
}

.refresh-btn.spinning .refresh-icon {
    animation: spin .8s linear infinite;
    display: inline-block;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* ── Loading ── */
.farm-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 52px 20px;
}

.windmill {
    font-size: 40px;
    animation: spin 1.2s linear infinite;
}

.farm-loading-text {
    font-size: 14px;
    color: var(--muted);
    font-weight: 700;
}

/* ── Empty ── */
.farm-empty {
    padding: 44px 24px;
    text-align: center;
}

.farm-empty-art {
    font-size: 52px;
    margin-bottom: 12px;
}

.farm-empty-title {
    font-family: 'Comfortaa', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 8px;
}

.farm-empty-desc {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.6;
}

/* ── Plot list ── */
.plot-list {
    list-style: none;
    margin: 0;
    padding: 12px 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 9px;
}

/* ── Plot card ── */
.plot-card {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--warm);
    border: 2px solid var(--wood-lt);
    border-radius: 14px;
    padding: 12px 13px;
    position: relative;
    overflow: hidden;
    animation: popIn .35s cubic-bezier(.34, 1.56, .64, 1) both;
    transition: transform .12s, border-color .15s;
}

.plot-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(135deg, transparent 0, transparent 8px,
            rgba(200, 146, 74, .04) 8px, rgba(200, 146, 74, .04) 9px);
    pointer-events: none;
}

.plot-card:hover {
    border-color: var(--wood);
}

.plot-card:active {
    transform: scale(.98);
}

@keyframes popIn {
    from {
        opacity: 0;
        transform: scale(.92) translateY(8px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* ── Plot icon ── */
.plot-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #e8f5d0, #d0ebb0);
    border: 2px solid #a8d470;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
}

/* ── Plot info ── */
.plot-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.plot-title {
    font-family: 'Comfortaa', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.plot-role {
    display: inline-flex;
    align-items: center;
    padding: 2px 9px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    width: fit-content;
}

.role--owner {
    background: rgba(232, 160, 32, .15);
    color: #8a5010;
    border: 1px solid rgba(232, 160, 32, .4);
}

.role--worker {
    background: rgba(120, 168, 75, .15);
    color: #3a6e18;
    border: 1px solid rgba(120, 168, 75, .35);
}

/* ── Manage button ── */
.manage-btn {
    flex-shrink: 0;
    padding: 8px 16px;
    background: var(--wood);
    border: 2px solid var(--bark);
    border-radius: 20px;
    color: #fff;
    font-family: 'Nunito', sans-serif;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 3px 0 var(--bark);
    transition: transform .1s, box-shadow .1s;
    text-shadow: 0 1px 2px rgba(0, 0, 0, .2);
    white-space: nowrap;
}

.manage-btn:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 var(--bark);
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

/* 📱 Mobile */
@media (max-width: 360px) {
    .plot-card {
        flex-wrap: wrap;
    }

    .manage-btn {
        width: 100%;
        justify-content: center;
    }

    .plot-title {
        white-space: normal;
    }
}
</style>