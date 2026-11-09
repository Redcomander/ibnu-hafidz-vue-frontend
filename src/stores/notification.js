import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import api from '@/api'
import { useAuthStore } from './auth'
import { useToastStore } from './toast'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadTotal = ref(0)
  const total = ref(0)
  const loading = ref(false)
  const error = ref('')
  const isConnected = ref(false)
  const eventSource = shallowRef(null)
  const auth = useAuthStore()
  const toast = useToastStore()
  const unreadCount = computed(() => unreadTotal.value)
  const hasMore = computed(() => notifications.value.length < total.value)
  let generation = 0, owner = null, initialized = false, connecting = false
  let reconnectTimer, pollTimer, refreshTimer, reconnectAttempt = 0
  let page = 1, fetching = false, revision = 0
  const current = epoch => initialized && epoch === generation && owner === String(auth.user?.id) && auth.isAuthenticated
  const countFrom = data => Number.isFinite(Number(data.unread_count))
    ? Math.max(0, Number(data.unread_count)) : notifications.value.filter(item => !item.is_read).length

  async function fetchRecent() {
    const epoch = generation
    if (!current(epoch) || fetching) return
    fetching = true
    const capturedRevision = revision
    try {
      const { data } = await api.get('/notifications?limit=10&page=1')
      if (!current(epoch)) return
      if (capturedRevision !== revision) { refreshSoon(); return }
      const recent = Array.isArray(data.data) ? data.data : []
      const ids = new Set(recent.map(item => String(item.id)))
      notifications.value = [...recent, ...notifications.value.slice(10).filter(item => !ids.has(String(item.id)))]
      unreadTotal.value = countFrom(data)
      total.value = Number(data.total) || recent.length
      error.value = ''
    } catch {
      if (current(epoch)) error.value = 'Gagal memuat notifikasi. Mencoba kembali otomatis.'
    } finally {
      if (epoch === generation) { fetching = false; loading.value = false }
    }
  }

  function refreshSoon() {
    clearTimeout(refreshTimer)
    refreshTimer = setTimeout(() => fetchRecent(), 200)
  }

  async function loadMore() {
    const epoch = generation
    if (!current(epoch) || fetching || !hasMore.value) return
    fetching = true; loading.value = true
    try {
      const { data } = await api.get(`/notifications?limit=10&page=${page + 1}`)
      if (!current(epoch)) return
      const ids = new Set(notifications.value.map(item => String(item.id)))
      notifications.value.push(...(Array.isArray(data.data) ? data.data : []).filter(item => !ids.has(String(item.id))))
      page++
      unreadTotal.value = countFrom(data)
      total.value = Number(data.total) || notifications.value.length
      error.value = ''
    } catch { if (current(epoch)) error.value = 'Gagal memuat notifikasi berikutnya.' }
    finally { if (epoch === generation) { fetching = false; loading.value = false } }
  }

  async function markAsRead(id = 'all') {
    const epoch = generation
    if (!current(epoch)) return false
    const capturedRevision = revision
    const visibleIDs = new Set(notifications.value.map(item => String(item.id)))
    try {
      const { data } = await api.put(`/notifications/${id}/read`)
      if (!current(epoch)) return false
      const unchanged = capturedRevision === revision
      revision++
      for (const item of notifications.value) if ((id === 'all' && visibleIDs.has(String(item.id))) || String(item.id) === String(id)) item.is_read = true
      if (unchanged) unreadTotal.value = countFrom(data)
      error.value = ''
      refreshSoon()
      return true
    } catch {
      if (current(epoch)) error.value = 'Gagal menandai notifikasi. Silakan coba lagi.'
      return false
    }
  }

  function scheduleReconnect() {
    if (!initialized || reconnectTimer || !auth.isAuthenticated) return
    const delay = Math.min(30000, 2000 * 2 ** Math.min(reconnectAttempt++, 4))
    reconnectTimer = setTimeout(() => { reconnectTimer = null; connectSSE() }, delay)
  }

  async function connectSSE() {
    const epoch = generation
    if (!current(epoch) || connecting || eventSource.value || typeof EventSource === 'undefined') return
    connecting = true
    try {
      const { data } = await api.post('/notifications/stream/ticket')
      if (!current(epoch)) return
      if (!data.ticket) { scheduleReconnect(); return }
      const source = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(data.ticket)}`, { withCredentials: true })
      eventSource.value = source
      source.onopen = () => {
        if (!current(epoch) || source !== eventSource.value) { source.close(); return }
        isConnected.value = true; reconnectAttempt = 0
        fetchRecent() // Recover messages missed while disconnected or registering.
      }
      source.onmessage = event => {
        if (!current(epoch) || source !== eventSource.value) return
        try {
          const item = JSON.parse(event.data)
          if (!item || !item.id || !item.title) return
          if (notifications.value.some(row => String(row.id) === String(item.id))) return
          revision++
          notifications.value.unshift(item)
          total.value++
          if (!item.is_read) { unreadTotal.value++; toast.info(item.title) }
          refreshSoon()
        } catch { /* Ignore malformed events; polling remains authoritative. */ }
      }
      source.onerror = () => {
        source.close()
        if (!current(epoch) || source !== eventSource.value) return
        eventSource.value = null; isConnected.value = false
        scheduleReconnect()
      }
    } catch { if (current(epoch)) scheduleReconnect() }
    finally { if (epoch === generation) connecting = false }
  }

  function wake() {
    if (document.hidden || !initialized) return
    fetchRecent(); connectSSE()
  }

  function disconnectSSE() {
    generation++
    initialized = false; owner = null; connecting = false; fetching = false
    clearTimeout(reconnectTimer); reconnectTimer = null
    clearTimeout(refreshTimer); refreshTimer = null
    clearInterval(pollTimer); pollTimer = null
    globalThis.removeEventListener('online', wake)
    document.removeEventListener('visibilitychange', wake)
    eventSource.value?.close(); eventSource.value = null
    isConnected.value = false; reconnectAttempt = 0
    notifications.value = []; unreadTotal.value = 0; total.value = 0; page = 1
    loading.value = false; error.value = ''; revision = 0
  }

  async function initialize() {
    if (!auth.isAuthenticated) return
    if (initialized && owner === String(auth.user?.id)) return
    disconnectSSE()
    owner = String(auth.user?.id); initialized = true; loading.value = true
    globalThis.addEventListener('online', wake)
    document.addEventListener('visibilitychange', wake)
    // Poll even with an open stream: handles proxy buffering, dropped events,
    // another server process and read-state changes made in another tab.
    pollTimer = setInterval(() => { if (!document.hidden) fetchRecent() }, 30000)
    await fetchRecent()
    connectSSE()
  }

  return { notifications, unreadCount, hasMore, loading, error, isConnected,
    fetchRecent, loadMore, markAsRead, connectSSE, disconnectSSE, initialize }
})
