<template>
  <header class="app-topbar" aria-label="Navigasi atas">
    <div class="topbar-location">
      <button type="button" class="topbar-icon mobile-menu" aria-label="Buka menu navigasi" @click="$emit('toggle-menu')"><SvgIcon name="menu" :size="21" /></button>
      <div class="topbar-heading"><span class="topbar-eyebrow">RUANG KERJA <i></i> IBNU HAFIDZ</span><nav aria-label="Lokasi halaman"><router-link to="/dashboard">Dashboard</router-link><template v-if="route.name !== 'dashboard' && route.meta.title"><SvgIcon name="chevron-right" :size="13" /><span class="current-page">{{ route.meta.title }}</span></template></nav></div>
    </div>
    <div class="topbar-actions">
      <div class="topbar-search-wrap">
        <button ref="searchTrigger" type="button" class="topbar-search-trigger" aria-label="Cari halaman" :aria-expanded="searchOpen" aria-controls="navigation-search" @click.stop="toggleSearch"><SvgIcon name="search" :size="18" /><span>Cari halaman…</span><kbd>/</kbd></button>
        <section v-if="searchOpen" id="navigation-search" v-click-outside="closeSearch" class="navigation-search" role="search" aria-label="Pencarian navigasi" @keydown.esc.stop.prevent="closeSearch(true)">
          <div class="navigation-search-input"><SvgIcon name="search" :size="18" /><input ref="searchInput" v-model="query" type="search" aria-label="Cari menu halaman" placeholder="Nama halaman atau menu…" @keydown.down.prevent="resultLinks[0]?.focus()" /><button type="button" class="topbar-icon" aria-label="Tutup pencarian" @click="closeSearch(true)"><SvgIcon name="x" :size="17" /></button></div>
          <p class="search-caption">{{ query ? `${results.length} halaman ditemukan` : 'Akses cepat sesuai hak akses Anda' }}</p>
          <div class="navigation-results"><router-link v-for="(item,index) in results" :key="String(item.to)" :ref="el => resultLinks[index] = el?.$el" :to="item.to" @click="closeSearch()" @keydown.down.prevent="resultLinks[index + 1]?.focus()" @keydown.up.prevent="index === 0 ? searchInput?.focus() : resultLinks[index - 1]?.focus()"><span class="result-icon"><SvgIcon :name="item.icon || 'dashboard'" :size="18" /></span><span>{{ item.label }}</span><SvgIcon name="arrow-right" :size="15" /></router-link><p v-if="!results.length" class="search-empty">Tidak ada halaman yang sesuai. Coba kata kunci lain.</p></div>
        </section>
      </div>
      <span class="topbar-divider"></span>
      <button type="button" class="topbar-icon theme-toggle" :aria-label="theme.isDark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'" :title="theme.isDark ? 'Tema terang' : 'Tema gelap'" @click="theme.toggleTheme()"><SvgIcon :name="theme.isDark ? 'sun' : 'moon'" :size="19" /></button>
      <div class="topbar-notifications">
        <button type="button" class="topbar-icon notification-trigger" aria-label="Notifikasi" aria-controls="notification-panel" :aria-expanded="notificationsOpen" @click.stop="notificationsOpen = !notificationsOpen; searchOpen = false"><SvgIcon name="bell" :size="21" /><span v-if="notifications.unreadCount" class="notification-count">{{ notifications.unreadCount > 99 ? '99+' : notifications.unreadCount }}</span></button>
        <NotificationDropdown v-if="notificationsOpen" v-click-outside="() => notificationsOpen = false" @close="notificationsOpen = false" />
      </div>
      <div class="topbar-identity" :title="userName"><span class="topbar-avatar"><img v-if="avatar && !avatarFailed" :src="avatar" alt="" @error="avatarFailed = true" /><span v-else>{{ userName?.charAt(0)?.toUpperCase() || 'U' }}</span></span><span class="topbar-identity-copy"><strong>{{ userName || 'Pengguna' }}</strong><small>Akun saya</small></span></div>
    </div>
  </header>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useNotificationStore } from '@/stores/notification'
import SvgIcon from '@/components/ui/SvgIcon.vue'
import NotificationDropdown from '@/components/ui/NotificationDropdown.vue'
import '@/assets/top-navigation.css'

const props = defineProps({ items: { type: Array, default: () => [] }, userName: String, avatar: String })
defineEmits(['toggle-menu'])
const theme = useThemeStore(), notifications = useNotificationStore(), route = useRoute()
const searchOpen = ref(false), notificationsOpen = ref(false), query = ref(''), searchInput = ref(null), searchTrigger = ref(null), avatarFailed = ref(false)
const resultLinks = []
const results = computed(() => {
  const seen = new Set(), needle = query.value.trim().toLocaleLowerCase('id-ID')
  return props.items.filter(item => {
    if (!item.to || item.type === 'header' || seen.has(String(item.to))) return false
    seen.add(String(item.to))
    return `${item.label} ${item.sectionHeader || ''}`.toLocaleLowerCase('id-ID').includes(needle)
  }).slice(0, 12)
})
async function toggleSearch() {
  if (searchOpen.value) { closeSearch(true); return }
  searchOpen.value = true; notificationsOpen.value = false
  await nextTick(); searchInput.value?.focus()
}
function closeSearch(restore = false) { searchOpen.value = false; if (restore === true) searchTrigger.value?.focus() }
function shortcut(event) {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || event.target?.closest('input,textarea,select,[contenteditable="true"]')) return
  event.preventDefault(); if (!searchOpen.value) toggleSearch()
}
watch(() => route.fullPath, () => { searchOpen.value = false; notificationsOpen.value = false })
watch(() => props.avatar, () => { avatarFailed.value = false })
onMounted(() => document.addEventListener('keydown', shortcut))
onUnmounted(() => document.removeEventListener('keydown', shortcut))
</script>
