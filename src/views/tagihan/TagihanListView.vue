<template>
  <div class="space-y-5 md:space-y-6 pb-24 md:pb-0">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Database Tagihan</h1>
        <p class="text-xs sm:text-sm text-gray-500 mt-1">Kelola total tagihan, status, dan sumber data dari satu halaman.</p>
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
        <button v-if="auth.hasPermission('tagihan.view')" class="btn-secondary !py-2.5 !px-3 text-xs sm:text-sm min-h-10" @click="handleExportExcel">Export Excel</button>
        <button v-if="auth.hasPermission('tagihan.delete') && selectedIds.length > 0" class="px-3 py-2.5 text-xs sm:text-sm rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 font-semibold min-h-10" @click="handleBulkDelete">Hapus Terpilih ({{ selectedIds.length }})</button>
        <RouterLink v-if="auth.hasPermission('tagihan.import')" to="/dashboard/tagihan/import-excel" class="btn-secondary !py-2.5 !px-3 text-xs sm:text-sm min-h-10">Import Excel</RouterLink>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
      <div v-for="card in cards" :key="card.label" class="glass-card p-3 sm:p-4">
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
      :can-delete-sumber="auth.hasPermission('tagihan.delete') && !!filters.sumber_data"
      @update:search="search = $event"
      @update:status="filters.status = $event"
      @update:handlerId="filters.handler_id = $event"
      @update:sumberData="filters.sumber_data = $event"
      @delete-sumber="handleDeleteSource"
      @reset="resetFilters"
    />

    <div class="glass-card overflow-hidden rounded-2xl">
      <div v-if="loading" class="p-10 text-center text-gray-500 text-sm">Memuat data tagihan...</div>
      <template v-else>
        <table class="data-table hidden md:table">
          <thead>
            <tr>
              <th class="w-10 text-center"><input v-if="auth.hasPermission('tagihan.delete')" type="checkbox" class="w-4 h-4" :checked="isAllPageSelected" @change="toggleSelectAllPage" /></th>
              <th>Nama</th>
              <th>Nomor</th>
              <th>Total</th>
              <th>Status</th>
              <th>Handler</th>
              <th>Sumber</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in data" :key="row.id">
              <td class="text-center"><input v-if="auth.hasPermission('tagihan.delete')" type="checkbox" class="w-4 h-4" :checked="selectedIds.includes(row.id)" @change="toggleSelectRow(row.id, $event.target.checked)" /></td>
              <td><div class="font-medium text-gray-800">{{ row.nama }}</div><div class="text-xs text-gray-500">NIS: {{ row.nis || '-' }}</div></td>
              <td class="text-gray-700">{{ row.no_whatsapp }}</td>
              <td class="text-gray-800 font-semibold">{{ formatCurrency(row.total_tagihan) }}</td>
              <td><span class="inline-flex rounded-full bg-slate-100 text-slate-700 px-2 py-1 text-[11px] font-semibold">{{ row.status_tagihan || 'belum_lunas' }}</span></td>
              <td class="text-gray-700">{{ row.handler?.name || 'Belum ada' }}</td>
              <td class="text-gray-600">{{ row.sumber_data || '-' }}</td>
              <td><div class="flex justify-end items-center gap-2"><button v-if="auth.hasPermission('tagihan.edit')" @click="openEdit(row)" class="px-2.5 py-1.5 text-xs rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200">Edit</button><button v-if="auth.hasPermission('tagihan.view')" @click="openWhatsApp(row)" class="px-2.5 py-1.5 text-xs rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200">WhatsApp</button><button v-if="auth.hasPermission('tagihan.delete')" @click="handleDelete(row.id)" class="px-2.5 py-1.5 text-xs rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200">Hapus</button></div></td>
            </tr>
            <tr v-if="data.length === 0"><td :colspan="auth.hasPermission('tagihan.delete') ? 8 : 7" class="text-center py-8 text-gray-400">Belum ada data tagihan</td></tr>
          </tbody>
        </table>

        <div class="md:hidden divide-y divide-gray-100">
          <div v-for="row in data" :key="row.id" class="p-4 space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-start gap-2 min-w-0">
                <input v-if="auth.hasPermission('tagihan.delete')" type="checkbox" class="mt-1 w-4 h-4 shrink-0" :checked="selectedIds.includes(row.id)" @change="toggleSelectRow(row.id, $event.target.checked)" />
                <div class="min-w-0"><h3 class="font-semibold text-gray-800 text-sm truncate">{{ row.nama }}</h3><p class="text-xs text-gray-500 truncate">{{ row.no_whatsapp }}</p></div>
              </div>
              <span class="inline-flex rounded-full bg-slate-100 text-slate-700 px-2 py-1 text-[11px] font-semibold">{{ row.status_tagihan || 'belum_lunas' }}</span>
            </div>
            <div class="text-xs text-gray-600 space-y-0.5">
              <p>Total: {{ formatCurrency(row.total_tagihan) }}</p>
              <p>Handler: {{ row.handler?.name || 'Belum ada' }}</p>
              <p>Sumber: {{ row.sumber_data || '-' }}</p>
            </div>
            <div class="grid grid-cols-2 gap-2 pt-1">
              <button v-if="auth.hasPermission('tagihan.edit')" @click="openEdit(row)" class="px-2.5 py-2 text-xs rounded-lg bg-indigo-100 text-indigo-700 font-medium min-h-9">Edit</button>
              <button v-if="auth.hasPermission('tagihan.view')" @click="openWhatsApp(row)" class="px-2.5 py-2 text-xs rounded-lg bg-emerald-100 text-emerald-700 font-medium min-h-9">WhatsApp</button>
              <button v-if="auth.hasPermission('tagihan.delete')" @click="handleDelete(row.id)" class="px-2.5 py-2 text-xs rounded-lg bg-rose-100 text-rose-700 font-medium min-h-9">Hapus</button>
            </div>
          </div>
        </div>

        <div class="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
          <p class="text-xs text-gray-500">Halaman {{ meta.page }} dari {{ meta.totalPages || 1 }}</p>
          <div class="flex gap-2">
            <button @click="setPage(meta.page - 1)" :disabled="meta.page <= 1" class="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 min-h-9">Prev</button>
            <button @click="setPage(meta.page + 1)" :disabled="meta.page >= meta.totalPages" class="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 min-h-9">Next</button>
          </div>
        </div>
      </template>
    </div>

    <teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="showEditModal = false"></div>
        <div class="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 class="text-lg font-bold text-gray-800">Edit Data Tagihan</h3>
              <p class="text-xs text-gray-500 mt-1">Perbarui data dan lanjutkan follow-up WhatsApp.</p>
            </div>
            <button type="button" class="text-gray-400 hover:text-gray-600" @click="showEditModal = false">✕</button>
          </div>

          <div v-if="selectedTagihan" class="p-5 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="space-y-1.5">
                <span class="text-xs font-medium text-gray-600">NIS</span>
                <input v-model="selectedTagihan.nis" type="text" class="input-field" placeholder="Masukkan NIS" />
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-medium text-gray-600">Nama</span>
                <input v-model="selectedTagihan.nama" type="text" class="input-field" placeholder="Nama lengkap" required />
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-medium text-gray-600">No WhatsApp</span>
                <input v-model="selectedTagihan.no_whatsapp" type="text" class="input-field" placeholder="0812..." required />
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-medium text-gray-600">Total Tagihan</span>
                <input v-model.number="selectedTagihan.total_tagihan" type="number" min="0" class="input-field" placeholder="0" />
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-medium text-gray-600">Status</span>
                <select v-model="selectedTagihan.status_tagihan" class="input-field">
                  <option value="belum_lunas">Belum Lunas</option>
                  <option value="tertunggak">Tertunggak</option>
                  <option value="lunas">Lunas</option>
                </select>
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-medium text-gray-600">Handler</span>
                <select v-model="selectedTagihan.handler_id" class="input-field">
                  <option :value="null">Belum ada</option>
                  <option v-for="user in handlers" :key="user.id" :value="user.id">{{ user.name }}</option>
                </select>
              </label>
              <label class="space-y-1.5 md:col-span-2">
                <span class="text-xs font-medium text-gray-600">Sumber Data</span>
                <input v-model="selectedTagihan.sumber_data" type="text" class="input-field" placeholder="Sumber data" />
              </label>
              <label class="space-y-1.5 md:col-span-2">
                <span class="text-xs font-medium text-gray-600">Catatan</span>
                <textarea v-model="selectedTagihan.catatan" rows="3" class="input-field" placeholder="Catatan follow-up"></textarea>
              </label>
            </div>

            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-2 border-t border-gray-100">
              <button type="button" @click="openWhatsAppFromModal" class="btn-secondary !py-2.5 !px-3 text-xs sm:text-sm min-h-10">
                WhatsApp Template
              </button>
              <div class="flex items-center gap-2">
                <button type="button" @click="showEditModal = false" class="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600">Batal</button>
                <button type="button" @click="saveEditFromModal" class="px-3 py-2 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Simpan</button>
              </div>
            </div>
          </div>
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
import { bulkDeleteTagihan, deleteTagihan, deleteTagihanSource, exportTagihanExcel, fetchTagihanSumberOptions, fetchTagihanSummary, updateTagihan } from '@/api/tagihan'
import { fetchTemplateList } from '@/api/kontak'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import KontakFilterBar from '@/components/kontak/KontakFilterBar.vue'

const auth = useAuthStore()
const toast = useToastStore()
const handlers = ref([])
const summary = ref(null)
const templates = ref([])
const sumberOptions = ref([])
const selectedTemplateId = ref('')
const selectedIds = ref([])
const showEditModal = ref(false)
const selectedTagihan = ref(null)

const { data, loading, meta, search, filters, sort, fetchData, setPage } = useTable('/tagihan', {
  defaultSort: 'updated_at',
  defaultOrder: 'desc',
  initialFilters: { status: '', handler_id: '', sumber_data: '' },
})

const selectedTemplateIdNumber = computed(() => {
  if (!selectedTemplateId.value) return null
  return Number(selectedTemplateId.value)
})

const isAllPageSelected = computed(() => data.value.length > 0 && data.value.every((item) => selectedIds.value.includes(item.id)))
const cards = computed(() => {
  const s = summary.value || {}
  return [
    { label: 'Total Tagihan', value: s.total_tagihan || 0 },
    { label: 'Belum Lunas', value: s.belum_lunas || 0 },
    { label: 'Lunas', value: s.lunas || 0 },
    { label: 'Assigned', value: s.assigned || 0 },
    { label: 'Unassigned', value: s.unassigned || 0 },
  ]
})

onMounted(async () => { await Promise.all([loadHandlers(), loadSummary(), loadTemplates(), loadSumberOptions()]) })
watch(data, (rows) => { const rowSet = new Set((rows || []).map((item) => item.id)); selectedIds.value = selectedIds.value.filter((id) => rowSet.has(id)) })

async function loadHandlers() {
  try {
    const { data: response } = await api.get('/users', { params: { page: 1, per_page: 200, sort: 'name', order: 'asc' } })
    handlers.value = response?.data || []
  } catch {
    handlers.value = []
  }
}

async function loadSummary() {
  try {
    const response = await fetchTagihanSummary()
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
    const response = await fetchTagihanSumberOptions()
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
  selectedTagihan.value = {
    id: row.id,
    nis: row.nis || '',
    nama: row.nama,
    no_whatsapp: row.no_whatsapp,
    total_tagihan: row.total_tagihan || 0,
    status_tagihan: row.status_tagihan || 'belum_lunas',
    handler_id: row.handler_id || null,
    sumber_data: row.sumber_data || '',
    catatan: row.catatan || '',
  }
  showEditModal.value = true
}

async function saveEditFromModal() {
  if (!selectedTagihan.value) return

  const payload = {
    nis: selectedTagihan.value.nis || '',
    nama: selectedTagihan.value.nama,
    no_whatsapp: selectedTagihan.value.no_whatsapp,
    total_tagihan: selectedTagihan.value.total_tagihan,
    status_tagihan: selectedTagihan.value.status_tagihan || 'belum_lunas',
    handler_id: selectedTagihan.value.handler_id || null,
    sumber_data: selectedTagihan.value.sumber_data || '',
    catatan: selectedTagihan.value.catatan || '',
  }

  try {
    await updateTagihan(selectedTagihan.value.id, payload)
    showEditModal.value = false
    toast.success('Tagihan berhasil diperbarui')
    await Promise.all([fetchData(), loadSummary()])
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal memperbarui tagihan')
  }
}

async function openWhatsAppFromModal() {
  if (!selectedTagihan.value) return
  await openWhatsApp(selectedTagihan.value)
}

async function openWhatsApp(row) {
  try {
    const params = {}
    if (selectedTemplateIdNumber.value) params.template_id = selectedTemplateIdNumber.value
    params.log = 1

    const response = await api.get(`/tagihan/${row.id}/wa-link`, { params })
    if (!response?.data?.url) {
      throw new Error('URL WhatsApp tidak tersedia')
    }
    window.open(response.data.url, '_blank')
  } catch (err) {
    toast.error(err?.response?.data?.message || err?.message || 'Gagal membuka WhatsApp')
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
  if (!checked) { selectedIds.value = []; return }
  selectedIds.value = data.value.map((item) => item.id)
}

async function handleDelete(id) {
  if (!window.confirm('Hapus tagihan ini?')) return
  try {
    await deleteTagihan(id)
    selectedIds.value = selectedIds.value.filter((val) => val !== id)
    toast.success('Tagihan berhasil dihapus')
    await Promise.all([fetchData(), loadSummary()])
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menghapus tagihan')
  }
}

async function handleBulkDelete() {
  if (!selectedIds.value.length) return
  if (!window.confirm(`Hapus ${selectedIds.value.length} tagihan terpilih?`)) return
  try {
    await bulkDeleteTagihan(selectedIds.value)
    selectedIds.value = []
    toast.success('Tagihan terpilih berhasil dihapus')
    await Promise.all([fetchData(), loadSummary()])
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menghapus tagihan terpilih')
  }
}

async function handleDeleteSource() {
  const source = filters.sumber_data
  if (!source) return
  if (!window.confirm(`Hapus semua tagihan dengan sumber "${source}"?`)) return
  try {
    await deleteTagihanSource(source)
    filters.sumber_data = ''
    toast.success('Sumber tagihan berhasil dihapus')
    await Promise.all([fetchData(), loadSummary(), loadSumberOptions()])
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menghapus sumber tagihan')
  }
}

async function handleExportExcel() {
  try {
    const response = await exportTagihanExcel({
      search: search.value || undefined,
      status: filters.status || undefined,
      handler_id: filters.handler_id || undefined,
      sumber_data: filters.sumber_data || undefined,
      sort: sort.field,
      order: sort.order,
    })
    downloadBlobResponse(response, 'tagihan_export.xlsx')
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal export data tagihan')
  }
}

function formatCurrency(value) {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
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
