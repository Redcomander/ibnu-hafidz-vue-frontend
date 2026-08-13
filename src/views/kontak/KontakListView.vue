<template>
  <div class="space-y-5 md:space-y-6 pb-24 md:pb-0">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Database Kontak Calon Santri</h1>
        <p class="text-xs sm:text-sm text-gray-500 mt-1">Kelola status follow-up, handler, dan akses WhatsApp dari satu halaman.</p>
      </div>
      <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
        <select
          v-if="auth.hasPermission('template_pesan.view')"
          v-model="selectedTemplateId"
          class="input-field !py-2.5 text-xs sm:text-sm min-h-10 col-span-2 sm:col-span-1 sm:min-w-[220px]"
        >
          <option value="">Pilih Template WA</option>
          <option v-for="item in templates" :key="item.id" :value="String(item.id)">
            {{ item.nama }}
          </option>
        </select>
        <div
          class="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold sm:text-xs"
          :class="waConnected ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'"
        >
          <span class="h-2.5 w-2.5 rounded-full" :class="waConnected ? 'bg-emerald-500' : 'bg-slate-400'" aria-hidden="true"></span>
          {{ waConnected ? 'WA Terhubung' : 'WA Belum Terhubung' }}
        </div>
        <button
          v-if="auth.hasPermission('kontak.view') && data.length > 0 && !bulkPaused && !bulkSendLoading"
          class="btn-primary !py-2.5 !px-3 text-xs sm:text-sm min-h-10"
          @click="sendAllContacts"
        >
          Kirim Semua WA
        </button>
        <button
          v-if="bulkSendLoading && !bulkPaused"
          class="btn-secondary !py-2.5 !px-3 text-xs sm:text-sm min-h-10"
          @click="pauseBulkSend"
        >
          Pause
        </button>
        <button
          v-if="bulkPaused"
          class="btn-primary !py-2.5 !px-3 text-xs sm:text-sm min-h-10"
          @click="resumeBulkSend"
        >
          Resume
        </button>
        <button
          v-if="auth.hasPermission('kontak.view')"
          class="btn-secondary !py-2.5 !px-3 text-xs sm:text-sm min-h-10"
          @click="openWAConnectModal"
        >
          {{ waConnected ? 'Reconnect WA' : 'Login WA' }}
        </button>
        <button
          v-if="auth.hasPermission('kontak.view')"
          class="btn-secondary !py-2.5 !px-3 text-xs sm:text-sm min-h-10"
          @click="handleExportExcel"
        >
          Export Excel
        </button>
        <button
          v-if="auth.hasPermission('kontak.delete') && selectedIds.length > 0"
          class="px-3 py-2.5 text-xs sm:text-sm rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 font-semibold min-h-10"
          @click="handleBulkDelete"
        >
          Hapus Terpilih ({{ selectedIds.length }})
        </button>
        <RouterLink
          v-if="auth.hasPermission('kontak.import')"
          to="/dashboard/kontak/import-excel"
          class="btn-secondary !py-2.5 !px-3 text-xs sm:text-sm min-h-10"
        >
          Import Excel
        </RouterLink>
        <RouterLink
          v-if="auth.hasPermission('template_pesan.view')"
          to="/dashboard/kontak/template"
          class="btn-primary !py-2.5 !px-3 text-xs sm:text-sm min-h-10"
        >
          Template Pesan
        </RouterLink>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
      <div class="glass-card p-3 sm:p-4" v-for="card in cards" :key="card.label">
        <p class="text-xs text-gray-500">{{ card.label }}</p>
        <p class="text-lg sm:text-xl font-bold text-gray-800 mt-1">{{ card.value }}</p>
      </div>
    </div>

    <KontakFilterBar
      :search="search"
      :status="filters.status"
      :handler-id="filters.handler_id"
      :sumber-data="filters.sumber_data"
      :handlers="handlers"
      :sumber-options="sumberOptions"
      :can-delete-sumber="auth.hasPermission('kontak.delete') && !!filters.sumber_data"
      @update:search="search = $event"
      @update:status="filters.status = $event"
      @update:handlerId="filters.handler_id = $event"
      @update:sumberData="filters.sumber_data = $event"
      @delete-sumber="handleDeleteSource"
      @reset="resetFilters"
    />

    <div v-if="bulkSendLoading || bulkSendProgress > 0 || bulkPaused" class="glass-card rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/80 dark:bg-emerald-950/20">
      <div class="mb-2 flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-200">Proses pengiriman bulk</p>
          <p class="text-xs text-emerald-600 dark:text-emerald-300">
            {{ bulkPaused ? 'Dijeda sementara' : bulkSendCurrentName ? `Saat ini: ${bulkSendCurrentName}` : 'Menyiapkan pengiriman...' }}
          </p>
        </div>
        <div class="text-right">
          <span class="block text-xs font-semibold text-emerald-700 dark:text-emerald-200">{{ bulkSendProgress }}%</span>
          <span class="block text-[10px] text-emerald-600 dark:text-emerald-300">{{ bulkSuccessCount }} sukses / {{ bulkFailedCount }} gagal</span>
        </div>
      </div>
      <div class="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/40">
        <div
          class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
          :style="{ width: `${bulkSendProgress}%` }"
        ></div>
      </div>
      <div class="flex items-center justify-between gap-2 text-[11px] text-emerald-700 dark:text-emerald-200">
        <span>Diproses: {{ Math.min(bulkSuccessCount + bulkFailedCount, bulkQueue.length) }}/{{ bulkQueue.length || 0 }}</span>
        <span>{{ bulkPaused ? 'Paused' : bulkSendLoading ? 'Running' : 'Ready' }}</span>
      </div>
    </div>

    <div class="glass-card overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/80">
      <div v-if="loading" class="p-10 text-center text-sm text-slate-500 dark:text-slate-400">Memuat data kontak...</div>

      <template v-else>
        <div class="overflow-x-auto">
          <table class="data-table hidden min-w-[980px] md:table">
            <thead>
              <tr>
                <th class="w-10 text-center">
                  <input
                    v-if="auth.hasPermission('kontak.delete')"
                    type="checkbox"
                    class="w-4 h-4"
                    :checked="isAllPageSelected"
                    @change="toggleSelectAllPage"
                  />
                </th>
                <th>Nama</th>
                <th>No WhatsApp</th>
                <th>Status</th>
                <th>Handler</th>
                <th>Sumber</th>
                <th>Terakhir Dihubungi</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in data" :key="row.id" class="align-top">
                <td class="text-center">
                  <input
                    v-if="auth.hasPermission('kontak.delete')"
                    type="checkbox"
                    class="w-4 h-4"
                    :checked="selectedIds.includes(row.id)"
                    @change="toggleSelectRow(row.id, $event.target.checked)"
                  />
                </td>
                <td class="min-w-[180px]">
                  <div class="font-semibold text-slate-800 dark:text-slate-100">{{ row.nama }}</div>
                  <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">NIS: {{ row.nis || '-' }}</div>
                </td>
                <td class="whitespace-nowrap text-slate-700 dark:text-slate-200">{{ row.no_whatsapp }}</td>
                <td><StatusBadge :status="row.status_kontak" /></td>
                <td class="min-w-[140px] text-slate-700 dark:text-slate-200">{{ row.handler?.name || 'Belum ada' }}</td>
                <td class="min-w-[120px] text-slate-600 dark:text-slate-300">{{ row.sumber_data || '-' }}</td>
                <td class="min-w-[160px] text-slate-600 dark:text-slate-300">{{ formatDateTime(row.last_contact_at) }}</td>
                <td>
                  <div class="flex justify-end items-center gap-2">
                    <button
                      v-if="auth.hasPermission('kontak.edit')"
                      @click="openEdit(row)"
                      class="rounded-lg bg-indigo-100 px-2.5 py-1.5 text-[11px] font-medium text-indigo-700 transition hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:hover:bg-indigo-800/40 sm:text-xs"
                    >
                      Edit
                    </button>
                    <button
                      v-if="auth.hasPermission('kontak_riwayat.view')"
                      @click="openRiwayat(row)"
                      class="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:text-xs"
                    >
                      Riwayat
                    </button>
                    <button
                      v-if="auth.hasPermission('kontak.delete')"
                      @click="handleDelete(row.id)"
                      class="rounded-lg bg-rose-100 px-2.5 py-1.5 text-[11px] font-medium text-rose-700 transition hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:hover:bg-rose-800/40 sm:text-xs"
                    >
                      Hapus
                    </button>
                    <WhatsAppButton :kontak-id="row.id" :template-id="selectedTemplateIdNumber" />
                  </div>
                </td>
              </tr>
              <tr v-if="data.length === 0">
                <td :colspan="auth.hasPermission('kontak.delete') ? 8 : 7" class="py-8 text-center text-slate-400 dark:text-slate-500">Belum ada data kontak</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
          <div v-for="row in data" :key="row.id" class="space-y-3 p-4">
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 items-start gap-2">
                <input
                  v-if="auth.hasPermission('kontak.delete')"
                  type="checkbox"
                  class="mt-1 h-4 w-4 shrink-0"
                  :checked="selectedIds.includes(row.id)"
                  @change="toggleSelectRow(row.id, $event.target.checked)"
                />
                <div class="min-w-0">
                  <h3 class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ row.nama }}</h3>
                  <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ row.no_whatsapp }}</p>
                </div>
              </div>
              <StatusBadge :status="row.status_kontak" />
            </div>
            <div class="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <p>Handler: {{ row.handler?.name || 'Belum ada' }}</p>
              <p>Sumber: {{ row.sumber_data || '-' }}</p>
              <p>Terakhir: {{ formatDateTime(row.last_contact_at) }}</p>
            </div>
            <div class="grid grid-cols-2 gap-2 pt-1">
              <button
                v-if="auth.hasPermission('kontak.edit')"
                @click="openEdit(row)"
                class="min-h-9 rounded-lg bg-indigo-100 px-2.5 py-2 text-[11px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
              >
                Edit
              </button>
              <button
                v-if="auth.hasPermission('kontak_riwayat.view')"
                @click="openRiwayat(row)"
                class="min-h-9 rounded-lg bg-slate-100 px-2.5 py-2 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Riwayat
              </button>
              <button
                v-if="auth.hasPermission('kontak.delete')"
                @click="handleDelete(row.id)"
                class="min-h-9 rounded-lg bg-rose-100 px-2.5 py-2 text-[11px] font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
              >
                Hapus
              </button>
              <div class="col-span-2">
                <WhatsAppButton :kontak-id="row.id" :template-id="selectedTemplateIdNumber" class="w-full" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80">
          <p class="text-xs text-slate-500 dark:text-slate-400">Halaman {{ meta.page }} dari {{ meta.totalPages || 1 }}</p>
          <div class="flex gap-2">
            <button
              @click="setPage(meta.page - 1)"
              :disabled="meta.page <= 1"
              class="min-h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Prev
            </button>
            <button
              @click="setPage(meta.page + 1)"
              :disabled="meta.page >= meta.totalPages"
              class="min-h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </template>
    </div>

    <HandlerAssignModal
      v-model:show="showEditModal"
      :kontak="selectedKontak"
      :handlers="handlers"
      @save="saveEdit"
    />

    <WAQRModal :show="showWAQRModal" @close="showWAQRModal = false" />

    <teleport to="body">
      <div v-if="showRiwayat" class="fixed inset-0 z-[70] flex justify-end">
        <div class="absolute inset-0 bg-black/30" @click="showRiwayat = false"></div>
        <div class="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">Riwayat Kontak</h3>
            <p class="text-xs text-gray-500 mt-1">{{ riwayatTarget?.nama || '-' }}</p>
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-for="item in riwayatRows" :key="item.id" class="p-3 rounded-xl border border-gray-100 bg-gray-50">
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-semibold text-gray-700">{{ item.user?.name || 'Sistem' }}</p>
                <p class="text-[11px] text-gray-500">{{ formatDateTime(item.created_at) }}</p>
              </div>

              <div v-if="item.pesan_final" class="mt-2 rounded-lg bg-white px-2.5 py-2 text-[11px] text-gray-700 border border-gray-100 whitespace-pre-wrap break-words">
                {{ item.pesan_final }}
              </div>

              <p v-if="item.status_awal || item.status_akhir" class="text-xs text-gray-600 mt-2">
                {{ item.status_awal || '-' }} -> {{ item.status_akhir || '-' }}
              </p>

              <p v-if="item.dikirim_via" class="text-[11px] text-gray-500 mt-1">
                Via: {{ item.dikirim_via }}
              </p>

              <p v-if="item.catatan" class="text-xs text-gray-500 mt-1">{{ item.catatan }}</p>
            </div>
            <p v-if="riwayatRows.length === 0" class="text-sm text-gray-400">Belum ada riwayat.</p>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div
        v-if="auth.hasPermission('kontak.delete') && selectedIds.length > 0"
        class="fixed md:hidden bottom-3 left-3 right-3 z-[65]"
      >
        <div class="rounded-2xl bg-white/95 backdrop-blur border border-gray-200 shadow-xl p-3 flex items-center justify-between gap-2">
          <p class="text-xs font-medium text-gray-700">{{ selectedIds.length }} kontak dipilih</p>
          <button
            type="button"
            class="px-3 py-2 rounded-lg bg-rose-100 text-rose-700 text-xs font-semibold"
            @click="handleBulkDelete"
          >
            Hapus Terpilih
          </button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useTable } from '@/composables/useTable'
import api from '@/api'
import {
  bulkDeleteKontak,
  deleteKontak,
  deleteKontakSource,
  exportKontakExcel,
  fetchKontakSumberOptions,
  fetchKontakSummary,
  fetchRiwayatKontak,
  fetchTemplateList,
  updateKontak,
} from '@/api/kontak'
import { fetchWAStatus, sendWAMessage } from '@/api/wa'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import KontakFilterBar from '@/components/kontak/KontakFilterBar.vue'
import StatusBadge from '@/components/kontak/StatusBadge.vue'
import WhatsAppButton from '@/components/kontak/WhatsAppButton.vue'
import HandlerAssignModal from '@/components/kontak/HandlerAssignModal.vue'
import WAQRModal from '@/components/wa/WAQRModal.vue'

const auth = useAuthStore()
const toast = useToastStore()

const handlers = ref([])
const summary = ref(null)
const templates = ref([])
const sumberOptions = ref([])
const cachedKontakTemplateId = localStorage.getItem('kontak_template_id')
const selectedTemplateId = ref(cachedKontakTemplateId || '')
const selectedIds = ref([])

const {
  data,
  loading,
  meta,
  search,
  filters,
  sort,
  fetchData,
  setPage,
} = useTable('/kontak', {
  defaultSort: 'last_contact_at',
  defaultOrder: 'asc',
  initialFilters: {
    status: '',
    handler_id: '',
    sumber_data: localStorage.getItem('kontak_source_filter') || '',
  },
})

const selectedTemplateIdNumber = computed(() => {
  if (!selectedTemplateId.value) return null
  return Number(selectedTemplateId.value)
})

const isAllPageSelected = computed(() => {
  if (!data.value.length) return false
  return data.value.every((item) => selectedIds.value.includes(item.id))
})

const cards = computed(() => {
  const s = summary.value
  return [
    { label: 'Total Kontak', value: s?.total_kontak || 0 },
    { label: 'Assigned', value: s?.assigned || 0 },
    { label: 'Unassigned', value: s?.unassigned || 0 },
    { label: 'Total Import', value: s?.total_import || 0 },
    { label: 'Total Riwayat', value: s?.total_riwayat || 0 },
  ]
})

const showEditModal = ref(false)
const selectedKontak = ref(null)
const showWAQRModal = ref(false)
const waConnected = ref(false)
const bulkSendLoading = ref(false)
const bulkSendProgress = ref(0)
const bulkSendCurrentName = ref('')
const bulkSuccessCount = ref(0)
const bulkFailedCount = ref(0)
const bulkPaused = ref(false)
const bulkPauseRequested = ref(false)
const bulkQueue = ref([])
let waStatusTimer = null

const showRiwayat = ref(false)
const riwayatTarget = ref(null)
const riwayatRows = ref([])

onMounted(async () => {
  await Promise.all([loadHandlers(), loadSummary(), loadTemplates(), loadSumberOptions()])
  await refreshWAStatus()
  startWAStatusPolling()
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', stopWAStatusPolling)
  }
})

onBeforeUnmount(() => {
  stopWAStatusPolling()
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('pagehide', stopWAStatusPolling)
  }
})

function stopWAStatusPolling() {
  if (waStatusTimer) {
    clearInterval(waStatusTimer)
    waStatusTimer = null
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    stopWAStatusPolling()
    return
  }

  startWAStatusPolling()
}

async function refreshWAStatus() {
  try {
    const response = await fetchWAStatus()
    waConnected.value = !!response?.ready
  } catch {
    waConnected.value = false
  }
}

function startWAStatusPolling() {
  if (waStatusTimer || document.visibilityState === 'hidden') return
  waStatusTimer = setInterval(() => {
    if (document.visibilityState === 'hidden') {
      stopWAStatusPolling()
      return
    }
    refreshWAStatus()
  }, 5000)
}

watch(data, (rows) => {
  const rowSet = new Set((rows || []).map((item) => item.id))
  selectedIds.value = selectedIds.value.filter((id) => rowSet.has(id))
})

watch(
  () => filters.sumber_data,
  (value) => {
    if (value) {
      localStorage.setItem('kontak_source_filter', value)
      return
    }
    localStorage.removeItem('kontak_source_filter')
  }
)

watch(
  selectedTemplateId,
  (value) => {
    if (value) {
      localStorage.setItem('kontak_template_id', String(value))
      return
    }
    localStorage.removeItem('kontak_template_id')
  }
)

async function loadHandlers() {
  try {
    const { data: response } = await api.get('/users', {
      params: { page: 1, per_page: 200, sort: 'name', order: 'asc' },
    })
    handlers.value = response?.data || []
  } catch {
    handlers.value = []
  }
}

async function loadSummary() {
  try {
    const response = await fetchKontakSummary()
    summary.value = response?.data || null
  } catch {
    summary.value = null
  }
}

async function loadTemplates() {
  try {
    const response = await fetchTemplateList({ aktif: 1 })
    templates.value = response?.data || []
  } catch {
    templates.value = []
  }
}

async function loadSumberOptions() {
  try {
    const response = await fetchKontakSumberOptions()
    const values = Array.isArray(response?.data) ? response.data : []
    sumberOptions.value = values.map((value) => ({ value, label: value }))
  } catch {
    sumberOptions.value = []
  }
}

function resetFilters() {
  search.value = ''
  filters.status = ''
  filters.handler_id = ''
  // keep source filter stable so it does not reset unexpectedly
}

async function handleDeleteSource() {
  const source = filters.sumber_data
  if (!source) return
  if (!window.confirm(`Hapus semua kontak dengan sumber "${source}"?`)) return

  try {
    await deleteKontakSource(source)
    // keep the current source selection until the user intentionally clears it
    toast.success('Sumber kontak berhasil dihapus')
    await Promise.all([fetchData(), loadSummary(), loadSumberOptions()])
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menghapus sumber kontak')
  }
}

function openEdit(row) {
  selectedKontak.value = row
  showEditModal.value = true
}

function openWAConnectModal() {
  showWAQRModal.value = true
}

async function pauseBulkSend() {
  bulkPauseRequested.value = true
  bulkPaused.value = true
  toast.info('Pengiriman bulk dijeda')
}

async function resumeBulkSend() {
  if (!bulkQueue.value.length) return
  bulkPauseRequested.value = false
  bulkPaused.value = false
  bulkSendLoading.value = true
  await processBulkQueue()
}

async function waitForMacroBreak(blockIndex, totalBlocks) {
  if (blockIndex <= 0 || totalBlocks <= 0) return
  const blockSize = 10 + Math.floor(Math.random() * 6)
  if (blockIndex % blockSize !== 0) return

  const breakMinutes = 15 + Math.random() * 15
  const breakMs = breakMinutes * 60 * 1000
  bulkSendCurrentName.value = 'Istirahat blok otomatis...'
  await new Promise((resolve) => setTimeout(resolve, breakMs))
}

async function processBulkQueue() {
  const contacts = bulkQueue.value
  if (!contacts.length) return

  const blockSize = 10 + Math.floor(Math.random() * 6)

  for (let index = 0; index < contacts.length; index += 1) {
    if (bulkPauseRequested.value) {
      bulkPaused.value = true
      bulkSendLoading.value = false
      return
    }

    const contact = contacts[index]
    const contactName = contact.nama || `Kontak ${index + 1}`
    bulkSendCurrentName.value = contactName
    bulkSendProgress.value = Math.round((index / contacts.length) * 100)

    try {
      await sendWAMessage({
        kontak_id: contact.id,
        template_id: selectedTemplateIdNumber.value || undefined,
        log: 1,
      })
      bulkSuccessCount.value += 1
    } catch (err) {
      bulkFailedCount.value += 1
      console.error('Bulk WA send failed for contact', contact.id, err)
    }

    if (index < contacts.length - 1) {
      const delayMs = 4000 + Math.random() * 6000
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }

    const blockIndex = index + 1
    if (blockIndex >= blockSize && blockIndex % blockSize === 0 && index < contacts.length - 1) {
      await waitForMacroBreak(blockIndex, blockSize)
    }
  }

  bulkSendProgress.value = 100
  bulkSendCurrentName.value = 'Selesai'
  toast.success(`Pengiriman bulk selesai: ${bulkSuccessCount.value} sukses, ${bulkFailedCount.value} gagal`)
  bulkSendLoading.value = false
  bulkPaused.value = false
  bulkPauseRequested.value = false
}

async function sendAllContacts() {
  if (bulkSendLoading.value) return

  const contacts = [...data.value]
  if (!contacts.length) {
    toast.error('Tidak ada kontak yang bisa dikirim')
    return
  }

  try {
    const status = await fetchWAStatus()
    if (!status?.ready) {
      showWAQRModal.value = true
      toast.error('WhatsApp belum terhubung. Silakan login WA terlebih dahulu.')
      return
    }

    bulkQueue.value = contacts
    bulkSendLoading.value = true
    bulkSendProgress.value = 0
    bulkSendCurrentName.value = ''
    bulkSuccessCount.value = 0
    bulkFailedCount.value = 0
    bulkPaused.value = false
    bulkPauseRequested.value = false

    await processBulkQueue()
  } catch (err) {
    toast.error(err?.response?.data?.message || err?.message || 'Gagal memulai pengiriman bulk')
    bulkSendLoading.value = false
    bulkPaused.value = false
    bulkPauseRequested.value = false
  }
}

async function saveEdit({ id, payload }) {
  try {
    await updateKontak(id, payload)
    showEditModal.value = false
    toast.success('Kontak berhasil diperbarui')
    await Promise.all([fetchData(), loadSummary()])
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal memperbarui kontak')
  }
}

function toggleSelectRow(id, checked) {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
    return
  }
  selectedIds.value = selectedIds.value.filter((val) => val !== id)
}

function toggleSelectAllPage(event) {
  const checked = !!event?.target?.checked
  if (!checked) {
    selectedIds.value = []
    return
  }
  selectedIds.value = data.value.map((item) => item.id)
}

async function handleDelete(id) {
  if (!window.confirm('Hapus kontak ini?')) return
  try {
    await deleteKontak(id)
    selectedIds.value = selectedIds.value.filter((val) => val !== id)
    toast.success('Kontak berhasil dihapus')
    await Promise.all([fetchData(), loadSummary()])
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menghapus kontak')
  }
}

async function handleBulkDelete() {
  if (!selectedIds.value.length) return
  if (!window.confirm(`Hapus ${selectedIds.value.length} kontak terpilih?`)) return
  try {
    await bulkDeleteKontak(selectedIds.value)
    selectedIds.value = []
    toast.success('Kontak terpilih berhasil dihapus')
    await Promise.all([fetchData(), loadSummary()])
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menghapus kontak terpilih')
  }
}

async function handleExportExcel() {
  try {
    const response = await exportKontakExcel({
      search: search.value || undefined,
      status: filters.status || undefined,
      handler_id: filters.handler_id || undefined,
      sumber_data: filters.sumber_data || undefined,
      sort: sort.field,
      order: sort.order,
    })
    downloadBlobResponse(response, 'kontak_export.xlsx')
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal export data kontak')
  }
}

async function openRiwayat(row) {
  riwayatTarget.value = row
  showRiwayat.value = true
  riwayatRows.value = []
  try {
    const response = await fetchRiwayatKontak(row.id)
    riwayatRows.value = response?.data || []
  } catch {
    riwayatRows.value = []
  }
}

function formatDateTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function downloadBlobResponse(response, fallbackName) {
  const blob = response?.data
  const contentDisposition = response?.headers?.['content-disposition'] || ''
  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i)
  const filename = filenameMatch?.[1] || fallbackName

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
</script>
