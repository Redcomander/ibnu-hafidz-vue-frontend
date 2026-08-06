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
      @update:search="search = $event"
      @update:status="filters.status = $event"
      @update:handlerId="filters.handler_id = $event"
      @update:sumberData="filters.sumber_data = $event"
      @reset="resetFilters"
    />

    <div class="glass-card overflow-hidden rounded-2xl">
      <div v-if="loading" class="p-10 text-center text-gray-500 text-sm">Memuat data kontak...</div>

      <template v-else>
        <table class="data-table hidden md:table">
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
            <tr v-for="row in data" :key="row.id">
              <td class="text-center">
                <input
                  v-if="auth.hasPermission('kontak.delete')"
                  type="checkbox"
                  class="w-4 h-4"
                  :checked="selectedIds.includes(row.id)"
                  @change="toggleSelectRow(row.id, $event.target.checked)"
                />
              </td>
              <td>
                <div class="font-medium text-gray-800">{{ row.nama }}</div>
                <div class="text-xs text-gray-500">NIS: {{ row.nis || '-' }}</div>
              </td>
              <td class="text-gray-700">{{ row.no_whatsapp }}</td>
              <td><StatusBadge :status="row.status_kontak" /></td>
              <td class="text-gray-700">{{ row.handler?.name || 'Belum ada' }}</td>
              <td class="text-gray-600">{{ row.sumber_data || '-' }}</td>
              <td class="text-gray-600">{{ formatDateTime(row.last_contact_at) }}</td>
              <td>
                <div class="flex justify-end items-center gap-2">
                  <button
                    v-if="auth.hasPermission('kontak.edit')"
                    @click="openEdit(row)"
                    class="px-2.5 py-1.5 text-xs rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  >
                    Edit
                  </button>
                  <button
                    v-if="auth.hasPermission('kontak_riwayat.view')"
                    @click="openRiwayat(row)"
                    class="px-2.5 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Riwayat
                  </button>
                  <button
                    v-if="auth.hasPermission('kontak.delete')"
                    @click="handleDelete(row.id)"
                    class="px-2.5 py-1.5 text-xs rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200"
                  >
                    Hapus
                  </button>
                  <WhatsAppButton :kontak-id="row.id" :template-id="selectedTemplateIdNumber" />
                </div>
              </td>
            </tr>
            <tr v-if="data.length === 0">
              <td :colspan="auth.hasPermission('kontak.delete') ? 8 : 7" class="text-center py-8 text-gray-400">Belum ada data kontak</td>
            </tr>
          </tbody>
        </table>

        <div class="md:hidden divide-y divide-gray-100">
          <div v-for="row in data" :key="row.id" class="p-4 space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-start gap-2 min-w-0">
                <input
                  v-if="auth.hasPermission('kontak.delete')"
                  type="checkbox"
                  class="mt-1 w-4 h-4 shrink-0"
                  :checked="selectedIds.includes(row.id)"
                  @change="toggleSelectRow(row.id, $event.target.checked)"
                />
                <div class="min-w-0">
                  <h3 class="font-semibold text-gray-800 text-sm truncate">{{ row.nama }}</h3>
                  <p class="text-xs text-gray-500 truncate">{{ row.no_whatsapp }}</p>
                </div>
              </div>
              <StatusBadge :status="row.status_kontak" />
            </div>
            <div class="text-xs text-gray-600 space-y-0.5">
              <p>Handler: {{ row.handler?.name || 'Belum ada' }}</p>
              <p>Sumber: {{ row.sumber_data || '-' }}</p>
              <p>Terakhir: {{ formatDateTime(row.last_contact_at) }}</p>
            </div>
            <div class="grid grid-cols-2 gap-2 pt-1">
              <button
                v-if="auth.hasPermission('kontak.edit')"
                @click="openEdit(row)"
                class="px-2.5 py-2 text-xs rounded-lg bg-indigo-100 text-indigo-700 font-medium min-h-9"
              >
                Edit
              </button>
              <button
                v-if="auth.hasPermission('kontak_riwayat.view')"
                @click="openRiwayat(row)"
                class="px-2.5 py-2 text-xs rounded-lg bg-gray-100 text-gray-700 font-medium min-h-9"
              >
                Riwayat
              </button>
              <button
                v-if="auth.hasPermission('kontak.delete')"
                @click="handleDelete(row.id)"
                class="px-2.5 py-2 text-xs rounded-lg bg-rose-100 text-rose-700 font-medium min-h-9"
              >
                Hapus
              </button>
              <WhatsAppButton :kontak-id="row.id" :template-id="selectedTemplateIdNumber" class="w-full" />
            </div>
          </div>
        </div>

        <div class="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
          <p class="text-xs text-gray-500">Halaman {{ meta.page }} dari {{ meta.totalPages || 1 }}</p>
          <div class="flex gap-2">
            <button
              @click="setPage(meta.page - 1)"
              :disabled="meta.page <= 1"
              class="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 min-h-9"
            >
              Prev
            </button>
            <button
              @click="setPage(meta.page + 1)"
              :disabled="meta.page >= meta.totalPages"
              class="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 min-h-9"
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
              <p class="text-xs text-gray-600 mt-1">
                {{ item.status_awal || '-' }} -> {{ item.status_akhir || '-' }}
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
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useTable } from '@/composables/useTable'
import api from '@/api'
import {
  bulkDeleteKontak,
  deleteKontak,
  exportKontakExcel,
  fetchKontakSumberOptions,
  fetchKontakSummary,
  fetchRiwayatKontak,
  fetchTemplateList,
  updateKontak,
} from '@/api/kontak'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import KontakFilterBar from '@/components/kontak/KontakFilterBar.vue'
import StatusBadge from '@/components/kontak/StatusBadge.vue'
import WhatsAppButton from '@/components/kontak/WhatsAppButton.vue'
import HandlerAssignModal from '@/components/kontak/HandlerAssignModal.vue'

const auth = useAuthStore()
const toast = useToastStore()

const handlers = ref([])
const summary = ref(null)
const templates = ref([])
const sumberOptions = ref([])
const selectedTemplateId = ref('')
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
  defaultSort: 'updated_at',
  defaultOrder: 'desc',
  initialFilters: {
    status: '',
    handler_id: '',
    sumber_data: '',
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

const showRiwayat = ref(false)
const riwayatTarget = ref(null)
const riwayatRows = ref([])

onMounted(async () => {
  await Promise.all([loadHandlers(), loadSummary(), loadTemplates(), loadSumberOptions()])
})

watch(data, (rows) => {
  const rowSet = new Set((rows || []).map((item) => item.id))
  selectedIds.value = selectedIds.value.filter((id) => rowSet.has(id))
})

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
  filters.sumber_data = ''
}

function openEdit(row) {
  selectedKontak.value = row
  showEditModal.value = true
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
