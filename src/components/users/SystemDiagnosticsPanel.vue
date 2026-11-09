<template>
  <section class="space-y-4" aria-label="Diagnostik produksi">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="glass-card p-4"><p class="text-sm text-gray-500">Error tersimpan</p><strong class="text-2xl text-red-700">{{ summary.errors || 0 }}</strong></div>
      <div class="glass-card p-4"><p class="text-sm text-gray-500">Peringatan</p><strong class="text-2xl text-amber-700">{{ summary.warnings || 0 }}</strong></div>
      <div class="glass-card p-4"><p class="text-sm text-gray-500">Belum ditangani</p><strong class="text-2xl">{{ summary.unresolved || 0 }}</strong></div>
    </div>
    <div class="glass-card p-5 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold">Debug produksi</h2>
          <p class="text-sm text-gray-500">Error server selalu dicatat. Debug menambahkan request ditolak dan request lambat selama 15 menit.</p>
        </div>
        <button class="btn-secondary" :disabled="changingDebug || loading" @click="toggleDebug">{{ changingDebug ? 'Menyimpan...' : settings.debug_enabled ? 'Matikan debug' : 'Aktifkan debug 15 menit' }}</button>
      </div>
      <p v-if="settings.debug_enabled" class="text-sm text-amber-700">Debug aktif sampai {{ formatDate(settings.debug_until) }}.</p>
      <p v-if="settings.storage_healthy === false" role="alert" class="text-sm text-red-700">Penyimpanan log bermasalah. Periksa izin folder dan kapasitas disk server.</p>
      <p class="text-xs text-gray-500">Maksimal {{ settings.max_events || 1000 }} kejadian selama {{ settings.retention_days || 7 }} hari. Payload, password, token, dan SQL tidak direkam.</p>
    </div>
    <form class="glass-card p-4 flex flex-wrap gap-3" @submit.prevent="load">
      <input v-model="filters.search" aria-label="Cari diagnostik" placeholder="ID laporan, route, fingerprint..." class="input-field !w-auto flex-1 min-w-0" />
      <select v-model="filters.severity" aria-label="Tingkat diagnostik" class="input-field !w-auto"><option value="">Semua tingkat</option><option value="error">Error</option><option value="warning">Peringatan</option></select>
      <select v-model="filters.resolved" aria-label="Status penanganan" class="input-field !w-auto"><option value="">Semua penanganan</option><option value="false">Belum ditangani</option><option value="true">Sudah ditangani</option></select>
      <input v-model="filters.status" aria-label="Status HTTP diagnostik" type="number" min="100" max="599" placeholder="HTTP status" class="input-field !w-auto max-w-36" />
      <button class="btn-secondary" :disabled="loading">Refresh diagnostik</button>
      <label class="text-sm flex items-center gap-2"><input v-model="autoRefresh" type="checkbox" /> Refresh otomatis</label>
    </form>
    <p v-if="error" role="alert" class="text-sm text-red-700">{{ error }}</p>
    <p v-if="loading" role="status" class="text-sm text-gray-500">Memuat diagnostik...</p>
    <div v-else class="space-y-3">
      <article v-for="event in events" :key="event.id" class="glass-card p-4 border border-gray-100 rounded-xl">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2"><span class="badge" :class="event.severity === 'error' ? 'badge-danger' : 'badge-warning'">{{ event.status }} · {{ event.kind }}</span><span class="text-xs text-gray-500">{{ formatDate(event.created_at) }}</span><span v-if="event.resolved" class="badge badge-success">Sudah ditangani</span></div>
            <p class="font-mono text-sm break-all">{{ event.method }} {{ event.route }}</p>
            <p class="text-xs text-gray-500 break-all">ID laporan: {{ event.request_id }} · {{ event.duration_ms }} ms</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button class="btn-secondary" @click="openDetails(event)">Detail kejadian</button>
            <button class="btn-secondary" :disabled="saving === event.id" @click="resolve(event)">{{ event.resolved ? 'Buka kembali' : 'Tandai ditangani' }}</button>
          </div>
        </div>
      </article>
      <p v-if="!events.length" class="glass-card p-8 text-center text-gray-500">Tidak ada kejadian yang cocok.</p>
    </div>
    <div class="flex items-center justify-between gap-3 text-sm">
      <p>{{ total }} kejadian · Halaman {{ page }} / {{ Math.max(1, pages) }}</p>
      <div class="flex gap-2"><button class="btn-secondary" :disabled="page <= 1 || loading" @click="page--; load()">Sebelumnya</button><button class="btn-secondary" :disabled="page >= pages || loading" @click="page++; load()">Berikutnya</button></div>
    </div>
    <dialog ref="dialog" aria-labelledby="diagnostic-detail-title" class="diagnostic-dialog" @close="selected = null" @click="closeBackdrop">
      <div v-if="selected" class="p-5 space-y-4">
        <div class="flex items-center justify-between gap-3"><h2 id="diagnostic-detail-title" class="font-semibold">Detail diagnostik</h2><button class="btn-secondary" @click="dialog.close()">Tutup</button></div>
        <p class="text-sm">{{ selected.summary }}</p>
        <dl class="text-sm space-y-2 break-all"><div><dt class="text-gray-500">ID laporan</dt><dd class="font-mono select-text">{{ selected.request_id }}</dd></div><div><dt class="text-gray-500">Fingerprint</dt><dd>{{ selected.fingerprint }}</dd></div><div><dt class="text-gray-500">Handler</dt><dd>{{ selected.handler || '-' }}</dd></div><div><dt class="text-gray-500">ID log aktivitas</dt><dd>{{ selected.activity_log_id || '-' }}</dd></div><div v-if="selected.resolved"><dt class="text-gray-500">Ditangani oleh</dt><dd>User #{{ selected.resolved_by }} · {{ formatDate(selected.resolved_at) }}</dd></div></dl>
        <pre v-if="selected.frames?.length" class="text-xs overflow-auto p-4 rounded-lg bg-gray-950 text-gray-100 max-h-72">{{ selected.frames.join('\n') }}</pre>
        <p class="text-xs text-gray-500">Status ditangani hanya mengubah catatan ini; tidak memperbaiki kode atau menghapus log audit.</p>
      </div>
    </dialog>
  </section>
</template>
<script setup>
import { ref, reactive, watch, nextTick, onMounted, onUnmounted } from 'vue'
import api from '@/api'
const events = ref([]), summary = ref({}), settings = ref({})
const page = ref(1), pages = ref(1), total = ref(0)
const filters = reactive({ search: '', severity: '', resolved: '', status: '' })
const loading = ref(false), changingDebug = ref(false), autoRefresh = ref(false), saving = ref(''), error = ref('')
const selected = ref(null), dialog = ref(null)
let debounce, timer, controller, generation = 0
const formatDate = value => value ? new Date(value).toLocaleString('id-ID') : '-'
async function load() {
  const current = ++generation
  controller?.abort(); controller = new AbortController()
  loading.value = true; error.value = ''
  try {
    const { data } = await api.get('/system-logs', { params: { ...filters, page: page.value }, signal: controller.signal })
    if (current !== generation) return
    events.value = data.data || []; summary.value = data.summary || {}; settings.value = data.settings || {}
    total.value = data.total || 0; pages.value = data.total_pages || 1
  } catch (err) { if (err.code !== 'ERR_CANCELED' && current === generation) error.value = 'Gagal memuat diagnostik. Silakan coba lagi.' }
  finally { if (current === generation) loading.value = false }
}
async function toggleDebug() {
  changingDebug.value = true; error.value = ''
  try { const { data } = await api.put('/system-logs/debug', { enabled: !settings.value.debug_enabled }); settings.value = data }
  catch { error.value = 'Gagal mengubah mode debug. Status belum diperbarui.' }
  finally { changingDebug.value = false }
}
async function resolve(event) {
  if (saving.value) return
  saving.value = event.id; error.value = ''
  try { await api.put(`/system-logs/${event.id}/resolution`, { resolved: !event.resolved }); await load() }
  catch { error.value = 'Gagal menyimpan status penanganan.' }
  finally { saving.value = '' }
}
async function openDetails(event) { selected.value = event; await nextTick(); dialog.value.showModal() }
function closeBackdrop(event) { if (event.target === dialog.value) dialog.value.close() }
watch(filters, () => { clearTimeout(debounce); debounce = setTimeout(() => { page.value = 1; load() }, 350) })
onMounted(() => { load(); timer = setInterval(() => { if (autoRefresh.value && !document.hidden && !loading.value && !selected.value) load() }, 15000) })
onUnmounted(() => { generation++; controller?.abort(); clearTimeout(debounce); clearInterval(timer) })
</script>
<style scoped>
.diagnostic-dialog { width: min(720px, calc(100vw - 2rem)); max-height: 85vh; overflow: auto; border: 0; border-radius: 16px; color: var(--text-dark); background: var(--bg-card); }
.diagnostic-dialog::backdrop { background: #0008; }
</style>
