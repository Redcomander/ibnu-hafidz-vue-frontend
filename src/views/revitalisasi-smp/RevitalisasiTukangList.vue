<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-primary font-bold">Revitalisasi SMP</p>
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900">Data Tukang</h1>
      </div>
      <button type="button" class="btn-primary w-full md:w-auto" @click="openCreateModal">
        + Tambah Tukang
      </button>
    </div>

    <div class="glass-card p-4 md:p-5 rounded-2xl">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="relative flex-1 max-w-md">
          <SvgIcon name="search" :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="search" type="text" class="input-field !pl-10 !rounded-xl" placeholder="Cari tukang, divisi, nomor HP..." />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-2">
            <input v-model="reportStartDate" type="date" class="input-field !py-2 !text-xs" />
            <span class="text-xs text-gray-400">s/d</span>
            <input v-model="reportEndDate" type="date" class="input-field !py-2 !text-xs" />
          </div>
          <button type="button" class="btn-secondary !py-2 !px-3 !text-xs" @click="exportReport('excel')">Export Excel</button>
          <button type="button" class="btn-danger !py-2 !px-3 !text-xs" @click="exportReport('pdf')">Export PDF</button>
          <span class="px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs">
            {{ list.filter((item) => item.is_active).length }} aktif
          </span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="glass-card p-6 rounded-2xl text-sm text-gray-500">Memuat data tukang...</div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div v-for="item in filteredList" :key="item.id" class="glass-card p-4 rounded-2xl">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
              {{ item.name?.charAt(0)?.toUpperCase() || 'T' }}
            </div>
            <div>
              <h3 class="font-bold text-gray-900 text-base">{{ item.name }}</h3>
              <p class="text-xs text-gray-500">{{ item.divisi || '-' }} · {{ item.area || '-' }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 md:justify-end">
            <span :class="['px-2.5 py-1 rounded-full text-[11px] font-semibold', item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-600']">
              {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
            </span>
            <button type="button" class="btn-secondary !py-2 !px-3 !text-xs" @click="openKasbonModal(item)">Kasbon</button>
            <button type="button" class="btn-secondary !py-2 !px-3 !text-xs" @click="openEditModal(item)">Edit</button>
            <button type="button" class="btn-danger !py-2 !px-3 !text-xs" @click="toggleStatus(item)">
              {{ item.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
            </button>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-3 text-sm text-gray-600">
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">HP</p>
            <p class="mt-1 font-medium">{{ item.phone || '-' }}</p>
          </div>
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Gaji Harian</p>
            <p class="mt-1 font-medium">{{ formatRupiah(item.gaji_harian) }}</p>
          </div>
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Kasbon</p>
            <p class="mt-1 font-medium text-amber-700">{{ formatRupiah(item.kasbon || 0) }}</p>
          </div>
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Potong</p>
            <p class="mt-1 font-medium capitalize">{{ item.cara_potong || 'langsung' }}</p>
          </div>
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Gaji Bersih</p>
            <p class="mt-1 font-medium text-emerald-700">{{ formatRupiah(Math.max((Number(item.gaji_harian) || 0) - (Number(item.kasbon) || 0), 0)) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!filteredList.length && !loading" class="glass-card p-8 rounded-2xl text-center text-gray-500">
      Belum ada data tukang.
    </div>

    <div v-if="showModal" class="fixed inset-0 z-40 overflow-y-auto bg-black/50 flex items-end md:items-center justify-center p-3 md:p-6">
      <div class="w-full max-w-xl max-h-[90vh] overflow-y-auto overscroll-contain bg-white rounded-2xl shadow-2xl p-4 md:p-6 animate-fade-in">
        <div class="flex items-center justify-between mb-5">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-primary font-bold">Tukang</p>
            <h2 class="text-xl font-extrabold text-gray-900">{{ editingId ? 'Edit Tukang' : 'Tambah Tukang' }}</h2>
          </div>
          <button type="button" @click="showModal = false" class="p-2 rounded-xl hover:bg-gray-100">
            <SvgIcon name="x" :size="16" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="label-field">Nama tukang</label>
            <input v-model="form.name" type="text" class="input-field" placeholder="Contoh: Budi Santoso" />
          </div>
          <div>
            <label class="label-field">Divisi / Pekerjaan</label>
            <input v-model="form.divisi" type="text" class="input-field" placeholder="Contoh: Tukang Bangunan" />
          </div>
          <div>
            <label class="label-field">Area kerja</label>
            <input v-model="form.area" type="text" class="input-field" placeholder="Contoh: Gedung Utama" />
          </div>
          <div>
            <label class="label-field">Gaji harian</label>
            <input :value="formatRupiahDisplay(form.gaji_harian)" @input="handleCurrencyInput('gaji_harian', $event)" type="text" inputmode="numeric" class="input-field" placeholder="Rp 0" />
          </div>
          <div>
            <label class="label-field">Kasbon / potongan</label>
            <input :value="formatRupiahDisplay(form.kasbon)" @input="handleCurrencyInput('kasbon', $event)" type="text" inputmode="numeric" class="input-field" placeholder="Rp 0" />
          </div>
          <div>
            <label class="label-field">Cara potong</label>
            <select v-model="form.cara_potong" class="input-field">
              <option value="langsung">Langsung</option>
              <option value="angsuran">Angsuran</option>
            </select>
          </div>
          <div>
            <label class="label-field">Nomor HP</label>
            <input v-model="form.phone" type="text" class="input-field" placeholder="08xxxx" />
          </div>
          <div>
            <label class="label-field">Status</label>
            <select v-model="form.is_active" class="input-field">
              <option :value="true">Aktif</option>
              <option :value="false">Nonaktif</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Catatan</label>
            <textarea v-model="form.note" rows="3" class="input-field" placeholder="Catatan tambahan untuk tukang"></textarea>
          </div>
        </div>

        <div class="flex flex-col-reverse md:flex-row justify-end gap-3 mt-6">
          <button type="button" class="btn-secondary w-full md:w-auto" @click="showModal = false">Batal</button>
          <button type="button" class="btn-primary w-full md:w-auto" @click="saveItem">Simpan</button>
        </div>
      </div>
    </div>

    <div v-if="kasbonModalOpen" class="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-end md:items-center justify-center p-3 md:p-6">
      <div class="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-4 md:p-6 animate-fade-in">
        <div class="flex items-center justify-between mb-5">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-primary font-bold">Kasbon</p>
            <h2 class="text-xl font-extrabold text-gray-900">{{ selectedKasbonTukang?.name || 'Riwayat Kasbon' }}</h2>
          </div>
          <button type="button" @click="kasbonModalOpen = false" class="p-2 rounded-xl hover:bg-gray-100">
            <SvgIcon name="x" :size="16" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label class="label-field">Jenis</label>
            <select v-model="kasbonForm.jenis" class="input-field">
              <option value="penambahan">Penambahan Kasbon</option>
              <option value="pelunasan">Pelunasan / Potongan</option>
            </select>
          </div>
          <div>
            <label class="label-field">Tanggal</label>
            <input v-model="kasbonForm.tanggal" type="date" class="input-field" />
          </div>
          <div>
            <label class="label-field">Jumlah</label>
            <input :value="formatRupiahDisplay(kasbonForm.jumlah)" @input="handleKasbonCurrencyInput($event)" type="text" inputmode="numeric" class="input-field" placeholder="Rp 0" />
          </div>
          <div>
            <label class="label-field">Metode</label>
            <select v-model="kasbonForm.metode" class="input-field">
              <option value="langsung">Langsung</option>
              <option value="angsuran">Angsuran</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Keterangan</label>
            <textarea v-model="kasbonForm.keterangan" rows="2" class="input-field" placeholder="Contoh: Kasbon belanja material, cicilan gaji, dll"></textarea>
          </div>
        </div>

        <div class="flex justify-end mb-4">
          <button type="button" class="btn-primary" @click="saveKasbonEntry">Simpan transaksi</button>
        </div>

        <div class="space-y-3 max-h-[260px] overflow-y-auto pr-1">
          <div v-if="!kasbonEntries.length" class="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
            Belum ada riwayat kasbon.
          </div>

          <div v-for="entry in kasbonEntries" :key="entry.id" class="rounded-xl border border-gray-200 p-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span :class="['px-2 py-1 rounded-full text-[10px] font-semibold uppercase', entry.jenis === 'pelunasan' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700']">{{ entry.jenis }}</span>
                  <span class="text-[11px] text-gray-500">{{ entry.metode || 'langsung' }}</span>
                </div>
                <p class="mt-1 text-sm font-semibold text-gray-800">{{ formatDate(entry.tanggal) }}</p>
                <p class="text-xs text-gray-500">{{ entry.keterangan || 'Tanpa keterangan' }}</p>
              </div>
              <div class="text-right">
                <p :class="['font-bold', entry.jenis === 'pelunasan' ? 'text-emerald-700' : 'text-amber-700']">{{ entry.jenis === 'pelunasan' ? '-' : '+' }}{{ formatRupiah(entry.jumlah) }}</p>
                <p class="text-[11px] text-gray-500">Saldo: {{ formatRupiah(entry.saldo || 0) }}</p>
                <button type="button" class="mt-2 text-[11px] text-red-600 hover:text-red-700" @click="deleteKasbonEntry(entry.id)">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import SvgIcon from '@/components/ui/SvgIcon.vue'
import {
  createRevitalisasiSmpKasbon,
  createRevitalisasiSmpTukang,
  deleteRevitalisasiSmpKasbon,
  exportRevitalisasiSmpPayrollReport,
  fetchRevitalisasiSmpKasbon,
  fetchRevitalisasiSmpTukang,
  updateRevitalisasiSmpTukang,
} from '@/api/revitalisasiSmp'

const search = ref('')
const showModal = ref(false)
const editingId = ref(null)
const loading = ref(false)
const list = ref([])
const kasbonModalOpen = ref(false)
const selectedKasbonTukang = ref(null)
const kasbonEntries = ref([])
const now = new Date()
const reportStartDate = ref(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10))
const reportEndDate = ref(now.toISOString().slice(0, 10))

const form = ref({
  name: '',
  divisi: '',
  area: '',
  gaji_harian: 0,
  kasbon: 0,
  cara_potong: 'langsung',
  phone: '',
  note: '',
  is_active: true,
})

const filteredList = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return list.value
  return list.value.filter((item) => {
    const text = [item.name, item.divisi, item.area, item.phone, item.note].join(' ').toLowerCase()
    return text.includes(query)
  })
})

const kasbonForm = ref({
  tukang_id: null,
  tanggal: new Date().toISOString().slice(0, 10),
  jenis: 'penambahan',
  jumlah: 0,
  metode: 'langsung',
  keterangan: '',
})

function formatDate(value) {
  if (!value) return 'Baru dibuat'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatRupiah(value) {
  const number = Number(value || 0)
  if (!Number.isFinite(number)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number)
}

function formatRupiahDisplay(value) {
  const number = Number(String(value || 0).replace(/\D/g, '')) || 0
  if (!number) return ''
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number)
}

function handleCurrencyInput(field, event) {
  const digits = String(event.target.value).replace(/\D/g, '')
  form.value[field] = digits ? Number(digits) : 0
}

function handleKasbonCurrencyInput(event) {
  const digits = String(event.target.value).replace(/\D/g, '')
  kasbonForm.value.jumlah = digits ? Number(digits) : 0
}

async function loadData() {
  loading.value = true
  try {
    const response = await fetchRevitalisasiSmpTukang({ search: search.value })
    list.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.error(error)
    alert('Gagal memuat data tukang.')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function openCreateModal() {
  editingId.value = null
  form.value = {
    name: '',
    divisi: '',
    area: '',
    gaji_harian: 0,
    kasbon: 0,
    cara_potong: 'langsung',
    phone: '',
    note: '',
    is_active: true,
  }
  showModal.value = true
}

function openEditModal(item) {
  editingId.value = item.id
  form.value = {
    ...item,
    kasbon: Number(item.kasbon || 0),
    cara_potong: item.cara_potong || 'langsung',
  }
  showModal.value = true
}

async function exportReport(format = 'excel') {
  try {
    const params = {}
    if (reportStartDate.value) params.date_from = reportStartDate.value
    if (reportEndDate.value) params.date_to = reportEndDate.value

    const response = await exportRevitalisasiSmpPayrollReport(format, params)
    const mimeType = format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf'
    const blob = new Blob([response.data], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `laporan_gaji_revitalisasi_smp_${format === 'excel' ? 'xlsx' : 'pdf'}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    alert('Gagal mengekspor laporan gaji.')
  }
}

function resetKasbonForm() {
  kasbonForm.value = {
    tukang_id: selectedKasbonTukang.value?.id || null,
    tanggal: new Date().toISOString().slice(0, 10),
    jenis: 'penambahan',
    jumlah: 0,
    metode: 'langsung',
    keterangan: '',
  }
}

async function loadKasbonEntries(tukangId) {
  if (!tukangId) {
    kasbonEntries.value = []
    return
  }

  try {
    const response = await fetchRevitalisasiSmpKasbon({ tukang_id: tukangId })
    kasbonEntries.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.error(error)
    alert('Gagal memuat riwayat kasbon.')
  }
}

async function openKasbonModal(item) {
  selectedKasbonTukang.value = item
  kasbonModalOpen.value = true
  resetKasbonForm()
  await loadKasbonEntries(item?.id)
}

async function saveKasbonEntry() {
  if (!selectedKasbonTukang.value) return
  if (!kasbonForm.value.jumlah || kasbonForm.value.jumlah <= 0) {
    alert('Jumlah kasbon wajib lebih dari 0.')
    return
  }

  try {
    await createRevitalisasiSmpKasbon({
      ...kasbonForm.value,
      tukang_id: selectedKasbonTukang.value.id,
    })
    await loadKasbonEntries(selectedKasbonTukang.value.id)
    await loadData()
    resetKasbonForm()
  } catch (error) {
    console.error(error)
    alert('Gagal menyimpan transaksi kasbon.')
  }
}

async function deleteKasbonEntry(id) {
  if (!id) return
  try {
    await deleteRevitalisasiSmpKasbon(id)
    await loadKasbonEntries(selectedKasbonTukang.value?.id)
    await loadData()
  } catch (error) {
    console.error(error)
    alert('Gagal menghapus riwayat kasbon.')
  }
}

async function saveItem() {
  if (!form.value.name?.trim()) {
    alert('Nama tukang wajib diisi')
    return
  }

  try {
    if (editingId.value) {
      await updateRevitalisasiSmpTukang(editingId.value, form.value)
    } else {
      await createRevitalisasiSmpTukang(form.value)
    }
    showModal.value = false
    await loadData()
  } catch (error) {
    console.error(error)
    alert('Gagal menyimpan data tukang.')
  }
}

async function toggleStatus(item) {
  try {
    await updateRevitalisasiSmpTukang(item.id, { ...item, is_active: !item.is_active })
    await loadData()
  } catch (error) {
    console.error(error)
    alert('Gagal mengubah status tukang.')
  }
}
</script>
