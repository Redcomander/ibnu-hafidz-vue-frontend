<template>
  <section id="notification-panel" ref="panel" class="notification-panel" role="region" aria-label="Daftar notifikasi" tabindex="-1" @keydown.esc.stop.prevent="closePanel">
    <header class="notification-header">
      <div class="header-top">
        <span class="eyebrow"><SvgIcon name="bell" :size="14" /> RUANG INFORMASI</span>
        <button type="button" class="close-button" aria-label="Tutup notifikasi" @click="closePanel"><SvgIcon name="x" :size="18" /></button>
      </div>
      <h3>Pusat Notifikasi</h3>
      <p>{{ store.unreadCount ? `${store.unreadCount} kabar menunggu untuk Anda baca.` : 'Semua kabar sudah Anda baca.' }}</p>
      <div class="header-bottom">
        <span class="connection"><i :class="{ live: store.isConnected }"></i>{{ store.isConnected ? 'Pembaruan langsung' : 'Pembaruan berkala' }}</span>
        <button type="button" class="read-all" :disabled="store.unreadCount === 0 || marking" @click="markAll"><SvgIcon name="check-circle" :size="14" />{{ marking ? 'Menandai…' : 'Tandai semua dibaca' }}</button>
      </div>
    </header>
    <div class="notification-tools">
      <div class="filter-row" role="group" aria-label="Filter notifikasi">
        <button type="button" :aria-pressed="filter === 'all'" @click="filter = 'all'">Semua</button>
        <button type="button" :aria-pressed="filter === 'unread'" @click="filter = 'unread'">Belum dibaca <span>{{ store.unreadCount }}</span></button>
      </div>
      <label class="notification-search"><SvgIcon name="search" :size="17" /><input v-model="search" type="search" aria-label="Cari notifikasi" placeholder="Cari kabar atau informasi…" /></label>
    </div>
    <div class="notification-content" :aria-busy="store.loading">
      <div v-if="store.error" class="error-state" role="alert"><SvgIcon name="alert-triangle" :size="18" /><div>{{ store.error }}<button type="button" @click="store.fetchRecent()">Coba lagi</button></div></div>
      <div v-if="store.loading && !store.notifications.length" class="loading-state" role="status">Memuat notifikasi…<div v-for="n in 3" :key="n" class="skeleton"></div></div>
      <div v-if="!store.loading && !store.error && !visible.length" class="empty-state">
        <div class="empty-icon"><SvgIcon :name="search ? 'search' : 'check-circle'" :size="30" /></div>
        <h4>{{ search ? 'Kabar tidak ditemukan' : filter === 'unread' ? 'Sudah terbaca semua' : 'Belum ada kabar' }}</h4>
        <p>{{ search ? 'Coba kata kunci lain atau muat kabar sebelumnya.' : 'Informasi terbaru akan muncul di sini.' }}</p>
      </div>
      <template v-for="group in groups" :key="group.label">
        <div class="date-label">{{ group.label }} <span>{{ group.items.length }}</span></div>
        <button v-for="notif in group.items" :key="notif.id" type="button" class="notification-item" :class="{ unread: !notif.is_read }" :disabled="opening !== null" @click="handleClick(notif)">
          <span class="item-icon" :class="category(notif).tone"><SvgIcon :name="category(notif).icon" :size="19" /></span>
          <span class="item-copy">
            <span class="item-meta"><span>{{ category(notif).label }}</span><time :datetime="notif.created_at" :title="fullTime(notif.created_at)">{{ formatTime(notif.created_at) }}</time></span>
            <span class="item-title">{{ notif.title }}<i v-if="!notif.is_read" class="unread-dot" aria-label="Belum dibaca"></i></span>
            <span class="item-message">{{ notif.message }}</span>
            <span class="item-action">{{ opening === notif.id ? 'Membuka…' : safeAction(notif.action_url) ? 'Lihat selengkapnya' : 'Tandai dibaca' }}<SvgIcon name="arrow-right" :size="13" /></span>
          </span>
        </button>
      </template>
      <div v-if="store.hasMore" class="load-more"><p v-if="search || filter === 'unread'">Pencarian dan filter berlaku pada kabar yang sudah dimuat.</p><button type="button" :disabled="store.loading" @click="store.loadMore()">{{ store.loading ? 'Memuat…' : 'Lihat notifikasi sebelumnya' }}</button></div>
    </div>
    <footer class="notification-footer"><SvgIcon name="info" :size="13" /> Informasi sesuai akses akun Anda.</footer>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import SvgIcon from '@/components/ui/SvgIcon.vue'

const store = useNotificationStore(), router = useRouter()
const emit = defineEmits(['close'])
const panel = ref(null), search = ref(''), filter = ref('all'), marking = ref(false), opening = ref(null)
let trigger
onMounted(async () => {
  trigger = document.activeElement
  store.fetchRecent()
  await nextTick()
  panel.value?.focus({ preventScroll: true })
})
function closePanel() { emit('close'); trigger?.focus?.({ preventScroll: true }) }
const visible = computed(() => store.notifications.filter(n => (filter.value !== 'unread' || !n.is_read) && `${n.title ?? ''} ${n.message ?? ''}`.toLocaleLowerCase('id-ID').includes(search.value.trim().toLocaleLowerCase('id-ID'))))
function dayLabel(raw) {
  const date = new Date(raw), today = new Date()
  if (Number.isNaN(date.getTime())) return 'Lainnya'
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Hari ini'
  if (date.toDateString() === yesterday.toDateString()) return 'Kemarin'
  return 'Sebelumnya'
}
const groups = computed(() => ['Hari ini', 'Kemarin', 'Sebelumnya', 'Lainnya'].map(label => ({ label, items: visible.value.filter(n => dayLabel(n.created_at) === label) })).filter(g => g.items.length))
function category(n) {
  const text = `${n.type ?? ''} ${n.action_url ?? ''} ${n.title ?? ''}`.toLowerCase()
  if (/halaqoh/.test(text)) return { label: 'Halaqoh', icon: 'user-group', tone: 'emerald' }
  if (/absen|attendance|jadwal|schedule/.test(text)) return { label: 'Presensi & jadwal', icon: 'clipboard-check', tone: 'gold' }
  return { label: 'Informasi', icon: 'bell', tone: 'blue' }
}
function safeAction(url) { return typeof url === 'string' && /^\/(?!\/)/.test(url) && !/[\\\u0000-\u001f]/.test(url) }
async function markAll() { if (marking.value) return; marking.value = true; try { await store.markAsRead('all') } finally { marking.value = false } }
async function handleClick(notif) {
  if (opening.value !== null) return
  opening.value = notif.id
  try {
    if (!notif.is_read && !await store.markAsRead(notif.id)) return
    if (safeAction(notif.action_url)) await router.push(notif.action_url)
    closePanel()
  } finally { opening.value = null }
}
function fullTime(raw) { const date = new Date(raw); return Number.isNaN(date.getTime()) ? 'Waktu tidak tersedia' : date.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) }
function formatTime(raw) {
  const date = new Date(raw), diff = Math.max(0, Date.now() - date.getTime())
  if (Number.isNaN(diff)) return '—'
  if (diff < 60000) return 'Baru saja'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} mnt`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.notification-panel{display:flex;flex-direction:column;max-height:calc(100dvh - 100px);position:absolute;right:0;top:calc(100% + 14px);width:420px;max-width:calc(100vw - 24px);border-radius:24px;background:#fff;color:#233d35;border:1px solid #e5ebe7;box-shadow:0 24px 70px #123c3526,0 4px 14px #123c350d;overflow:hidden;z-index:70;outline:none;transform-origin:top right;animation:notification-in .2s ease-out}
.notification-header{padding:20px 22px 17px;background:linear-gradient(125deg,#123e35,#246251);color:white}.header-top,.header-bottom,.item-meta{display:flex;align-items:center;justify-content:space-between;gap:8px}.eyebrow{display:flex;align-items:center;gap:7px;font-size:9px;letter-spacing:2px;font-weight:700;color:#e2c986}.close-button{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#ffffff12;color:#fff}.close-button:hover{background:#ffffff28}.notification-header h3{font-size:23px;letter-spacing:-.6px;font-weight:800;margin:9px 0 5px}.notification-header p{font-size:12px;color:#d6e6dd;margin-bottom:20px}.connection{display:flex;align-items:center;gap:6px;font-size:10px;color:#d1e3d9}.connection i{width:6px;height:6px;border-radius:50%;background:#c6cfc9}.connection i.live{background:#91dbb2;box-shadow:0 0 0 3px #91dbb218}.read-all{display:flex;align-items:center;gap:5px;color:#ead397;font-size:10px;font-weight:600}.read-all:disabled{opacity:.45;cursor:default}.notification-tools{padding:16px 18px 12px;border-bottom:1px solid #edf0ed}.filter-row{display:flex;gap:6px;margin-bottom:13px}.filter-row button{padding:7px 12px;border-radius:10px;font-size:12px;font-weight:600;color:#708078;transition:background .15s}.filter-row button[aria-pressed=true]{background:#eaf2ed;color:#194c3b}.filter-row span{font-size:10px;margin-left:4px}.notification-search{display:flex;align-items:center;gap:9px;background:#f5f7f4;border:1px solid #e8ede7;padding:10px 12px;border-radius:12px;color:#829087}.notification-search:focus-within{border-color:#46775d;box-shadow:0 0 0 3px #dce9df}.notification-search input{background:transparent;outline:none;font-size:12px;width:100%;min-width:0}.notification-header,.notification-tools,.notification-footer{flex-shrink:0}.notification-content{flex:1;min-height:0;max-height:440px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}.date-label{padding:14px 22px 7px;color:#8b968d;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;display:flex;justify-content:space-between}.date-label span{letter-spacing:0}.notification-item{display:flex;gap:12px;width:100%;text-align:left;padding:15px 22px;border-bottom:1px solid #f0f3ef;transition:background .15s}.notification-item:hover{background:#f5f8f4}.notification-item.unread{background:#f1f7f2}.notification-item.unread:hover{background:#e8f1e9}.notification-item:disabled{cursor:wait}.item-icon{width:37px;height:37px;border-radius:12px;display:grid;place-items:center;flex-shrink:0}.emerald{color:#276348;background:#dfeee3}.gold{color:#a37a2b;background:#f7eed9}.blue{color:#5273a0;background:#e7edf5}.item-copy{display:block;min-width:0;flex:1}.item-meta{font-size:9px;color:#819186;margin-bottom:5px}.item-meta time{white-space:nowrap}.item-title{font-size:13px;font-weight:650;line-height:1.5;display:block;overflow-wrap:anywhere}.unread .item-title{font-weight:750}.unread-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#34815e;margin-left:7px;vertical-align:middle}.item-message{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:11px;color:#78877c;line-height:1.6;margin-top:4px;overflow-wrap:anywhere}.item-action{display:flex;align-items:center;gap:6px;font-size:10px;font-weight:600;color:#387357;margin-top:9px}.notification-footer{display:flex;align-items:center;justify-content:center;gap:7px;padding:12px;font-size:10px;color:#8a968c;background:#fafbf8;border-top:1px solid #edf0e9}.load-more{padding:14px 20px;text-align:center}.load-more p{font-size:10px;color:#829087;margin-bottom:8px}.load-more button{font-size:12px;font-weight:600;color:#276348;padding:8px 16px;border:1px solid #dbe8dc;border-radius:10px}.empty-state{text-align:center;padding:30px 25px}.empty-icon{width:62px;height:62px;border-radius:22px;background:#eff5ed;display:grid;place-items:center;margin:0 auto 14px;color:#4b7e58}.empty-state h4{font-weight:700;font-size:14px}.empty-state p{font-size:12px;color:#819087;margin-top:7px}.error-state{margin:12px;display:flex;gap:10px;padding:12px;border-radius:12px;background:#fff2ef;color:#9b453b;font-size:12px}.error-state button{display:block;text-decoration:underline;margin-top:5px}.loading-state{padding:18px;color:#829087;font-size:12px}.skeleton{height:60px;background:#f0f4ee;border-radius:12px;margin-top:12px}button:focus-visible{outline:2px solid #be9a45;outline-offset:-3px}.close-button:focus-visible,.read-all:focus-visible{outline-color:#efd99d}
@keyframes notification-in{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
:global(.dark) .notification-panel{background:#172b24;color:#e1ede5;border-color:#344b3e}:global(.dark) .notification-tools,:global(.dark) .notification-footer{border-color:#304538}:global(.dark) .notification-search,:global(.dark) .filter-row button[aria-pressed=true]{background:#253c30;border-color:#3b5542;color:#c1dac8}:global(.dark) .notification-item{border-color:#293e31}:global(.dark) .notification-item.unread,:global(.dark) .notification-item:hover{background:#233d2c}:global(.dark) .notification-footer{background:#192f25}:global(.dark) .skeleton{background:#2b4234}
@media(max-width:640px){.notification-panel{position:fixed;top:76px;right:12px;left:12px;width:auto}.notification-panel{max-height:calc(100dvh - 90px)}.notification-header{padding:17px 19px}.notification-item{padding:14px 18px}}
@media(prefers-reduced-motion:reduce){.notification-panel{animation:none}*{transition:none!important}}
@media(max-height:600px){.notification-panel{overflow-y:auto}.notification-content{flex:none;max-height:240px}.notification-header p{display:none}}
</style>
