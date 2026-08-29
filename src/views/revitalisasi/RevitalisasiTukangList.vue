<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-primary font-bold">Revitalisasi SMA</p>
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
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <span class="px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
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
            <button type="button" class="btn-secondary !py-2 !px-3 !text-xs" @click="openEditModal(item)">Edit</button>
            <button type="button" class="btn-danger !py-2 !px-3 !text-xs" @click="toggleStatus(item)">
              {{ item.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
            </button>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">HP</p>
            <p class="mt-1 font-medium">{{ item.phone || '-' }}</p>
          </div>
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Keterangan</p>
            <p class="mt-1 font-medium">{{ item.note || '-' }}</p>
          </div>
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Terakhir diubah</p>
            <p class="mt-1 font-medium">{{ formatDate(item.updated_at) }}</p>
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import SvgIcon from '@/components/ui/SvgIcon.vue'
import {
  createRevitalisasiTukang,
  fetchRevitalisasiTukang,
  updateRevitalisasiTukang,
} from '@/api/revitalisasi'

const search = ref('')
const showModal = ref(false)
const editingId = ref(null)
const loading = ref(false)
const list = ref([])

const form = ref({
  name: '',
  divisi: '',
  area: '',
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

function formatDate(value) {
  if (!value) return 'Baru dibuat'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function loadData() {
  loading.value = true
  try {
    const response = await fetchRevitalisasiTukang({ search: search.value })
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
    phone: '',
    note: '',
    is_active: true,
  }
  showModal.value = true
}

function openEditModal(item) {
  editingId.value = item.id
  form.value = { ...item }
  showModal.value = true
}

async function saveItem() {
  if (!form.value.name?.trim()) {
    alert('Nama tukang wajib diisi')
    return
  }

  try {
    if (editingId.value) {
      await updateRevitalisasiTukang(editingId.value, form.value)
    } else {
      await createRevitalisasiTukang(form.value)
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
    await updateRevitalisasiTukang(item.id, { ...item, is_active: !item.is_active })
    await loadData()
  } catch (error) {
    console.error(error)
    alert('Gagal mengubah status tukang.')
  }
}
</script>
