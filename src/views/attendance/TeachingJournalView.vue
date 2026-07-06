<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Jurnal Mengajar</h1>
        <p class="text-sm text-gray-500 mt-1">Ringkasan materi mengajar formal per jadwal dan tanggal.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          @click="downloadSelected"
          :disabled="downloading || !selectedRows.length"
          class="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg class="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v10m0 0l-4-4m4 4l4-4m-9 8h10" /></svg>
          {{ downloading ? 'Mengunduh...' : `Download Terpilih (${selectedRows.length})` }}
        </button>
      </div>
    </div>

    <div class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div>
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Dari Tanggal</label>
          <input v-model="filters.start_date" type="date" class="input-field text-sm" @change="fetchJournals" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Sampai Tanggal</label>
          <input v-model="filters.end_date" type="date" class="input-field text-sm" @change="fetchJournals" />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Cari</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input v-model="search" type="text" placeholder="Pelajaran, kelas, pengajar, materi..." class="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30" @input="debouncedFetch" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedRows.length" class="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <span>{{ selectedRows.length }} jurnal dipilih</span>
      <button class="font-semibold hover:underline" @click="selectedRows = []">Kosongkan</button>
    </div>

    <div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div v-if="loading" class="py-12 text-center">
        <div class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        <p class="mt-2 text-sm text-gray-500">Memuat jurnal mengajar...</p>
      </div>

      <template v-else-if="journals.length">
        <div class="hidden overflow-x-auto lg:block">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-4 py-3">
                  <input type="checkbox" :checked="allCurrentSelected" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" @change="toggleSelectAll" />
                </th>
                <th class="px-4 py-3">Tanggal</th>
                <th class="px-4 py-3">Pelajaran</th>
                <th class="px-4 py-3">Kelas</th>
                <th class="px-4 py-3">Pengajar</th>
                <th class="px-4 py-3">Materi</th>
                <th class="px-4 py-3 text-center">Jumlah Kehadiran</th>
                <th class="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <template v-for="group in groupedJournals" :key="group.key">
                <tr class="bg-emerald-50/60">
                  <td colspan="8" class="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                    {{ group.label }} <span class="text-emerald-700/70">({{ group.rows.length }})</span>
                  </td>
                </tr>
                <tr v-for="row in group.rows" :key="row.journal_key" class="align-top hover:bg-gray-50/70">
                  <td class="px-4 py-3">
                    <input type="checkbox" :checked="selectedRows.includes(row.journal_key)" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" @change="toggleSelection(row.journal_key)" />
                  </td>
                  <td class="px-4 py-3 text-gray-600">{{ formatDate(row.tanggal) }}</td>
                  <td class="px-4 py-3 font-semibold text-gray-800">{{ row.lesson_name }}</td>
                  <td class="px-4 py-3 text-gray-700">{{ row.kelas_name || '-' }}</td>
                  <td class="px-4 py-3 text-gray-700">{{ row.teacher_name }}</td>
                  <td class="px-4 py-3 text-gray-600">
                    <div class="max-w-md whitespace-pre-line leading-6">{{ row.materi || '-' }}</div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{{ row.present_count }} / {{ row.student_count }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1.5">
                      <button class="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50" title="Download" @click="downloadRows([row])">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v10m0 0l-4-4m4 4l4-4m-9 8h10" /></svg>
                      </button>
                      <button v-if="canManage" class="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50" title="Edit" @click="openEdit(row)">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button v-if="canManage" class="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50" title="Hapus" @click="deleteJournal(row)">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div class="divide-y divide-gray-100 lg:hidden">
          <template v-for="group in groupedJournals" :key="`mobile-${group.key}`">
            <div class="bg-emerald-50/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-800">
              {{ group.label }} <span class="text-emerald-700/70">({{ group.rows.length }})</span>
            </div>
            <div v-for="row in group.rows" :key="`mobile-${row.journal_key}`" class="space-y-3 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-gray-800">{{ row.lesson_name }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(row.tanggal) }} · {{ row.kelas_name || '-' }}</p>
                  <p class="mt-1 text-xs text-gray-500">{{ row.teacher_name }}</p>
                </div>
                <input type="checkbox" :checked="selectedRows.includes(row.journal_key)" class="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" @change="toggleSelection(row.journal_key)" />
              </div>
              <div class="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs leading-6 text-emerald-900">{{ row.materi || '-' }}</div>
              <div class="flex items-center justify-between gap-3">
                <span class="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Hadir {{ row.present_count }} / {{ row.student_count }}</span>
                <div class="flex gap-1.5">
                  <button class="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50" @click="downloadRows([row])">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v10m0 0l-4-4m4 4l4-4m-9 8h10" /></svg>
                  </button>
                  <button v-if="canManage" class="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50" @click="openEdit(row)">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button v-if="canManage" class="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50" @click="deleteJournal(row)">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-4 py-3 text-sm text-gray-500">
          <p>{{ paginationLabel }}</p>
          <div class="flex gap-2">
            <button class="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40" :disabled="page <= 1" @click="page--; fetchJournals()">Prev</button>
            <button class="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40" :disabled="page * perPage >= total" @click="page++; fetchJournals()">Next</button>
          </div>
        </div>
      </template>

      <div v-else class="py-12 text-center text-sm text-gray-500">Belum ada jurnal mengajar pada periode ini.</div>
    </div>

    <Modal :show="showEditModal" title="Edit Jurnal Mengajar" max-width="2xl" @close="closeEdit">
      <form class="space-y-4" @submit.prevent="saveEdit">
        <div class="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p><strong>{{ editingRow?.lesson_name }}</strong></p>
          <p>{{ editingRow?.kelas_name || '-' }} · {{ editingRow?.teacher_name || '-' }}</p>
          <p>{{ editingRow ? formatDate(editingRow.tanggal) : '-' }}</p>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Materi</label>
          <textarea v-model="editMateri" rows="6" class="input-field w-full" placeholder="Tulis materi mengajar"></textarea>
        </div>
        <div class="flex justify-end gap-3 border-t pt-3">
          <button type="button" class="btn-secondary" @click="closeEdit">Batal</button>
          <button type="submit" class="btn-primary" :disabled="savingEdit">{{ savingEdit ? 'Menyimpan...' : 'Simpan' }}</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import api from '@/api'
import Modal from '@/components/ui/Modal.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const authStore = useAuthStore()
const toast = useToastStore()

const today = new Date().toISOString().split('T')[0]
const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

const filters = ref({
  start_date: firstDay,
  end_date: today,
})
const search = ref('')
const journals = ref([])
const loading = ref(false)
const downloading = ref(false)
const selectedRows = ref([])
const page = ref(1)
const perPage = ref(15)
const total = ref(0)
const showEditModal = ref(false)
const editingRow = ref(null)
const editMateri = ref('')
const savingEdit = ref(false)

const canManage = computed(() => {
  const roles = authStore.userRoles?.map(role => role.name) || []
  return roles.some(role => ['super_admin', 'admin', 'staff', 'tim_presensi'].includes(role))
})

const allCurrentSelected = computed(() => journals.value.length > 0 && journals.value.every(row => selectedRows.value.includes(row.journal_key)))
const groupedJournals = computed(() => {
  const groups = {
    smp: [],
    sma: [],
    other: [],
  }

  journals.value.forEach((row) => {
    const jenjang = getJenjangFromClass(row.kelas_name)
    if (jenjang === 'SMP') groups.smp.push(row)
    else if (jenjang === 'SMA') groups.sma.push(row)
    else groups.other.push(row)
  })

  return [
    { key: 'smp', label: 'SMP', rows: groups.smp },
    { key: 'sma', label: 'SMA', rows: groups.sma },
    { key: 'other', label: 'Lainnya', rows: groups.other },
  ].filter(group => group.rows.length)
})
const paginationLabel = computed(() => {
  if (!total.value) return '0 data'
  const start = (page.value - 1) * perPage.value + 1
  const end = Math.min(page.value * perPage.value, total.value)
  return `${start}-${end} dari ${total.value} jurnal`
})

let searchTimer = null

onMounted(() => {
  fetchJournals()
})

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

async function fetchJournals() {
  loading.value = true
  try {
    const params = {
      type: 'formal',
      start_date: filters.value.start_date,
      end_date: filters.value.end_date,
      search: search.value || undefined,
      page: page.value,
      per_page: perPage.value,
    }
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === '') delete params[key]
    })
    const { data } = await api.get('/attendance/journals', { params })
    journals.value = data.data || []
    total.value = data.total || 0
    perPage.value = data.per_page || perPage.value
    const availableKeys = new Set(journals.value.map(row => row.journal_key))
    selectedRows.value = selectedRows.value.filter(key => availableKeys.has(key))
  } catch (error) {
    toast.error(error.response?.data?.error || 'Gagal memuat jurnal mengajar')
  } finally {
    loading.value = false
  }
}

function debouncedFetch() {
  page.value = 1
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(fetchJournals, 300)
}

function toggleSelection(key) {
  const index = selectedRows.value.indexOf(key)
  if (index === -1) selectedRows.value.push(key)
  else selectedRows.value.splice(index, 1)
}

function toggleSelectAll() {
  if (allCurrentSelected.value) {
    selectedRows.value = selectedRows.value.filter(key => !journals.value.some(row => row.journal_key === key))
    return
  }
  const merged = new Set(selectedRows.value)
  journals.value.forEach(row => merged.add(row.journal_key))
  selectedRows.value = Array.from(merged)
}

function selectedPayloadFromRows(rows) {
  return rows.map(row => ({ jadwal_id: row.jadwal_id, tanggal: row.tanggal }))
}

async function downloadRows(rows) {
  downloading.value = true
  try {
    const response = await api.post('/attendance/journals/export/pdf', {
      items: selectedPayloadFromRows(rows),
    }, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', rows.length > 1 ? `jurnal_mengajar_${today}.pdf` : `jurnal_mengajar_${rows[0].tanggal}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    toast.error(error.response?.data?.error || 'Gagal mengunduh jurnal mengajar')
  } finally {
    downloading.value = false
  }
}

async function downloadSelected() {
  const rows = journals.value.filter(row => selectedRows.value.includes(row.journal_key))
  if (!rows.length) return
  await downloadRows(rows)
}

function openEdit(row) {
  editingRow.value = row
  editMateri.value = row.materi || ''
  showEditModal.value = true
}

function closeEdit() {
  showEditModal.value = false
  editingRow.value = null
  editMateri.value = ''
}

async function saveEdit() {
  if (!editingRow.value) return
  savingEdit.value = true
  try {
    await api.put(`/attendance/journals/${editingRow.value.jadwal_id}/${editingRow.value.tanggal}`, {
      materi: editMateri.value,
    })
    toast.success('Jurnal mengajar diperbarui')
    closeEdit()
    await fetchJournals()
  } catch (error) {
    toast.error(error.response?.data?.error || 'Gagal memperbarui jurnal mengajar')
  } finally {
    savingEdit.value = false
  }
}

async function deleteJournal(row) {
  if (!window.confirm(`Hapus jurnal mengajar ${row.lesson_name} pada ${formatDate(row.tanggal)}?`)) return
  try {
    await api.delete(`/attendance/journals/${row.jadwal_id}/${row.tanggal}`)
    selectedRows.value = selectedRows.value.filter(key => key !== row.journal_key)
    toast.success('Jurnal mengajar dihapus')
    await fetchJournals()
  } catch (error) {
    toast.error(error.response?.data?.error || 'Gagal menghapus jurnal mengajar')
  }
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getJenjangFromClass(kelasName) {
  const text = (kelasName || '').toString().toLowerCase()
  if (!text) return 'Other'
  if (text.includes('smp')) return 'SMP'
  if (text.includes('sma')) return 'SMA'

  const match = text.match(/\b(\d{1,2})\b/)
  if (!match) return 'Other'
  const tingkat = Number(match[1])
  if (Number.isNaN(tingkat)) return 'Other'
  if (tingkat >= 7 && tingkat <= 9) return 'SMP'
  if (tingkat >= 10) return 'SMA'
  return 'Other'
}
</script>