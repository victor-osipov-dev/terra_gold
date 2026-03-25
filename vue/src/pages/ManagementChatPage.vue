<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const chatId = route.params.chatId

if (!chatId) router.back()

// ---------- Types ----------

type PartType = 'PERCENT' | 'FIXED'

interface ChatRevenueShare {
    id: bigint | number
    chat_id: bigint | number
    user_id?: bigint | number | null
    others: boolean
    part: string | number
    part_type: PartType
    created_at: string
    updated_at: string
}

// ---------- API ----------

async function fetchIncomeParts(chatId: string | number): Promise<ChatRevenueShare[]> {
    const res = await fetch(`https://ai-box-cars.ru:8000/chats/${chatId}/income-parts`)
    if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`)
    const data = await res.json()
    return Array.isArray(data) ? data : []
}

// ---------- Query ----------

const {
    data: shares,
    isLoading,
    isError,
    error,
    refetch,
} = useQuery({
    queryKey: computed(() => ['income-parts', chatId]),
    queryFn: () => fetchIncomeParts(+chatId!),
    staleTime: 60_000,
    retry: 2,
})

// ---------- Computed ----------

const sortedShares = computed(() =>
    shares.value ? [...shares.value].sort((a, b) => Number(b.part) - Number(a.part)) : []
)

const isEmpty = computed(() => !isLoading.value && !isError.value && sortedShares.value.length === 0)

const recipientLabel = computed(() => {
    const n = sortedShares.value.length
    if (n === 1) return 'рабочий'
    if (n < 5) return 'рабочего'
    return 'рабочих'
})

const totalFormatted = computed(() => {
    if (!shares.value?.length) return '—'
    const hasPercent = shares.value.some(s => s.part_type === 'PERCENT')
    const total = shares.value.reduce((acc, s) => acc + Number(s.part), 0)
    return hasPercent ? `${total.toFixed(0)}%` : `${total.toLocaleString('ru')} ₽`
})

const maxPart = computed(() =>
    shares.value ? Math.max(...shares.value.map(s => Number(s.part))) : 0
)

// ---------- Helpers ----------

function barWidth(item: ChatRevenueShare): number {
    if (!maxPart.value) return 0
    return Math.round((Number(item.part) / maxPart.value) * 100)
}

function formatPart(part: string | number): string {
    const n = Number(part)
    return n % 1 === 0 ? n.toString() : n.toFixed(2)
}

function typeLabel(type: PartType): string {
    return type === 'PERCENT' ? 'доля урожая' : 'фиксированный мешок'
}

function rankEmoji(idx: number): string {
    return ['🥇', '🥈', '🥉'][idx] ?? '🌾'
}

const AVATAR_COLORS = [
    { bg: '#78a84b', border: '#5a8a30', text: '#fff' },
    { bg: '#c97d3a', border: '#a85f20', text: '#fff' },
    { bg: '#e8b84b', border: '#c99a2e', text: '#7a4f10' },
    { bg: '#6b9e5e', border: '#4e7f42', text: '#fff' },
    { bg: '#d4795a', border: '#b55a3a', text: '#fff' },
    { bg: '#8fbc6e', border: '#6da04d', text: '#fff' },
]

function avatarStyle(userId?: bigint | number | null): Record<string, string> {
    const c = AVATAR_COLORS[Number(userId ?? 0) % AVATAR_COLORS.length]
    return { background: c.bg, border: `2px solid ${c.border}`, color: c.text }
}

function initials(userId?: bigint | number | null): string {
    return userId ? String(userId).slice(-2) : '?'
}

function errorMessage(err: unknown): string {
    if (err instanceof Error) return err.message
    return 'Не удалось загрузить данные'
}
</script>

<template>
    <div class="farm-page">
        <!-- Fence top -->
        <div class="fence-top">
            <span v-for="i in 18" :key="i" class="fence-post" />
        </div>

        <!-- Back button -->
        <button class="back-btn" @click="router.back()">← Назад</button>

        <!-- Main card -->
        <div class="barn-card">
            <!-- Header -->
            <header class="barn-header">
                <div class="barn-label">🌻 Прибыль недели</div>
                <h1 class="barn-title">Деление<br /><span>недельной прибыли</span></h1>
                <div class="header-divider">
                    <span>🌾</span><span class="divider-line" /><span>🌾</span>
                </div>
            </header>

            <!-- Loading -->
            <div v-if="isLoading" class="farm-loading">
                <div class="windmill">🌀</div>
                <span class="farm-loading-text">Считаем прибыль…</span>
            </div>

            <!-- Error -->
            <div v-else-if="isError" class="farm-error">
                <div class="farm-error-icon">🐛</div>
                <div class="farm-error-text">{{ errorMessage(error) }}</div>
                <button class="farm-btn-retry" @click="() => refetch()">🔄 Попробовать снова</button>
            </div>

            <template v-else>
                <!-- Empty -->
                <div v-if="isEmpty" class="farm-empty">
                    <div class="farm-empty-art">🤝</div>
                    <div class="farm-empty-title">Доли не заданы</div>
                    <div class="farm-empty-desc">
                        Урожай делится поровну<br />между всеми
                    </div>
                </div>

                <template v-else>
                    <!-- Summary -->
                    <div class="harvest-summary">
                        <div class="harvest-stat">
                            <div class="harvest-num">{{ sortedShares.length }}</div>
                            <div class="harvest-label">{{ recipientLabel }}</div>
                        </div>
                        <div class="harvest-divider">💰</div>
                        <div class="harvest-stat">
                            <div class="harvest-num harvest-num--sm">{{ totalFormatted }}</div>
                            <div class="harvest-label">общая прибыль</div>
                        </div>
                    </div>

                    <!-- List -->
                    <ul class="farm-list">
                        <li v-for="(item, idx) in sortedShares" :key="String(item.id)" class="farm-row"
                            :style="{ animationDelay: `${idx * 70}ms` }">
                            <div class="farm-rank">{{ rankEmoji(idx) }}</div>

                            <div :class="['farm-avatar', item.others ? 'farm-avatar--others' : '']"
                                :style="item.others ? undefined : avatarStyle(item.user_id)">
                                {{ item.others ? '🌍' : initials(item.user_id) }}
                            </div>

                            <div class="farm-info">
                                <div class="farm-name">
                                    {{ item.others ? 'Остальные рабочие' : `${item.user.first_name} ${item.user.last_name}` }}
                                </div>
                                <div class="farm-meta">
                                    <span
                                        :class="['farm-tag', item.part_type === 'PERCENT' ? 'farm-tag--percent' : 'farm-tag--fixed']">
                                        {{ item.part_type === 'PERCENT' ? '🌾 %' : '💰 $' }}
                                    </span>
                                    <span class="farm-type-label">{{ typeLabel(item.part_type) }}</span>
                                </div>
                                <div class="harvest-bar-row">
                                    <div class="harvest-bar-bg">
                                        <div class="harvest-bar-fill" :style="{ width: `${barWidth(item)}%` }" />
                                    </div>
                                    <span class="harvest-bar-pct">{{ barWidth(item) }}%</span>
                                </div>
                            </div>

                            <div class="farm-part">
                                <div class="farm-part-value">{{ formatPart(item.part) }}</div>
                                <div class="farm-part-unit">
                                    {{ item.part_type === 'PERCENT' ? 'процентов' : 'рублей' }}
                                </div>
                            </div>
                        </li>
                    </ul>
                </template>
            </template>
        </div>

        <!-- Grass bottom -->
        <div class="grass-row">
            <span v-for="i in 14" :key="i" class="grass-blade">🌿</span>
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
    --sky: #d4edd4;
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
    padding: 0 4px;
    margin-bottom: -1px;
    position: relative;
    z-index: 2;
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

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.farm-loading-text {
    font-size: 14px;
    color: var(--muted);
    font-weight: 700;
}

/* ── Error ── */
.farm-error {
    padding: 36px 24px;
    text-align: center;
}

.farm-error-icon {
    font-size: 40px;
    margin-bottom: 10px;
}

.farm-error-text {
    font-size: 13px;
    color: #b83028;
    font-weight: 700;
    margin-bottom: 14px;
}

.farm-btn-retry {
    padding: 10px 22px;
    background: var(--field);
    border: 2px solid #4e7f30;
    border-radius: 20px;
    color: #fff;
    font-family: 'Nunito', sans-serif;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 3px 0 #3a6020;
    transition: transform .1s, box-shadow .1s;
}

.farm-btn-retry:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 #3a6020;
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

/* ── Summary ── */
.harvest-summary {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    background: var(--warm);
    border-bottom: 2px dashed var(--wood);
}

.harvest-stat {
    flex: 1;
    text-align: center;
}

.harvest-divider {
    font-size: 26px;
    flex-shrink: 0;
}

.harvest-num {
    font-family: 'Comfortaa', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--bark);
    line-height: 1;
}

.harvest-num--sm {
    font-size: 20px;
}

.harvest-label {
    font-size: 10px;
    color: var(--muted);
    font-weight: 700;
    margin-top: 3px;
    text-transform: uppercase;
    letter-spacing: .06em;
}

/* ── List ── */
.farm-list {
    list-style: none;
    margin: 0;
    padding: 12px 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 9px;
}

/* ── Row ── */
.farm-row {
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
    transition: transform .12s;
}

.farm-row::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(135deg, transparent 0, transparent 8px,
            rgba(200, 146, 74, .04) 8px, rgba(200, 146, 74, .04) 9px);
    pointer-events: none;
}

.farm-row:active {
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

/* ── Rank ── */
.farm-rank {
    font-size: 22px;
    flex-shrink: 0;
    width: 28px;
    text-align: center;
}

/* ── Avatar ── */
.farm-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 800;
    flex-shrink: 0;
    font-family: 'Comfortaa', sans-serif;
    box-shadow: 0 2px 5px rgba(0, 0, 0, .15);
}

.farm-avatar--others {
    background: linear-gradient(135deg, #78a84b, #a8d470);
    border: 2px solid #4e7f30;
    color: #fff;
    font-size: 22px;
}

/* ── Info ── */
.farm-info {
    flex: 1;
    min-width: 0;
}

.farm-name {
    font-family: 'Comfortaa', sans-serif;
    font-weight: 700;
    font-size: 13px;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.farm-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 3px;
}

.farm-tag {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 1px 8px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
}

.farm-tag--percent {
    background: rgba(120, 168, 75, .15);
    color: #3a6e18;
    border: 1px solid rgba(120, 168, 75, .35);
}

.farm-tag--fixed {
    background: rgba(200, 146, 74, .15);
    color: #7a4a10;
    border: 1px solid rgba(200, 146, 74, .35);
}

.farm-type-label {
    font-size: 10px;
    color: var(--muted);
    font-weight: 600;
}

/* ── Bar ── */
.harvest-bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 7px;
}

.harvest-bar-bg {
    flex: 1;
    height: 6px;
    background: rgba(200, 146, 74, .2);
    border-radius: 99px;
    overflow: hidden;
    border: 1px solid rgba(200, 146, 74, .25);
}

.harvest-bar-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, var(--field), var(--gold));
    transition: width .7s cubic-bezier(.34, 1.56, .64, 1);
}

.harvest-bar-pct {
    font-size: 10px;
    color: var(--muted);
    font-weight: 700;
    font-family: 'Comfortaa', sans-serif;
    min-width: 28px;
    text-align: right;
}

/* ── Part ── */
.farm-part {
    text-align: right;
    flex-shrink: 0;
}

.farm-part-value {
    font-family: 'Comfortaa', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--bark);
    line-height: 1;
}

.farm-part-unit {
    font-size: 10px;
    color: var(--muted);
    margin-top: 2px;
    font-weight: 600;
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