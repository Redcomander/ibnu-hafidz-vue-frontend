<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-primary font-bold">Revitalisasi SMA</p>
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900">Material Datang</h1>
      </div>
      <button type="button" class="btn-primary w-full md:w-auto" @click="openCreateModal">+ Catat Datang</button>
    </div>

    <div class="glass-card p-4 md:p-5 rounded-2xl">
      <div class="flex flex-col md:flex-row gap-3">
        <div class="relative flex-1">
          <input v-model="search" type="text" class="input-field !pl-10" placeholder="Cari material, supplier, catatan..." />
        </div>
      </div>
    </div>

    <div v-if="loading" class="glass-card p-6 rounded-2xl text-sm text-gray-500">Memuat material datang...</div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div v-for="item in filteredItems" :key="item.id" class="glass-card p-4 rounded-2xl">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">{{ formatDate(item.tanggal) }}</p>
            <h3 class="text-lg font-bold text-gray-900">{{ item.nama_material }}</h3>
          </div>
          <div class="flex gap-2">
            <button type="button" class="btn-secondary !py-2 !px-3 !text-xs" @click="openDetailModal(item)">Detail</button>
            <button type="button" class="btn-secondary !py-2 !px-3 !text-xs" @click="openEditModal(item)">Edit</button>
            <button type="button" class="btn-danger !py-2 !px-3 !text-xs" @click="deleteItem(item.id)">Hapus</button>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm text-gray-600">
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Jumlah</p>
            <p class="mt-1 font-medium">{{ formatRupiah(item.jumlah) }} {{ item.satuan || '' }}</p>
          </div>
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Supplier</p>
            <p class="mt-1 font-medium">{{ item.supplier || '-' }}</p>
          </div>
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Dokumentasi</p>
            <button v-if="item.photo_path" type="button" @click="openPhotoModal(item.photo_path)" class="mt-1 font-medium text-primary underline">Lihat foto</button>
            <span v-else class="mt-1 font-medium text-gray-500">Belum ada</span>
          </div>
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Catatan</p>
            <p class="mt-1 font-medium">{{ item.catatan || '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!filteredItems.length && !loading" class="glass-card p-8 rounded-2xl text-center text-gray-500">
      Belum ada catatan material datang.
    </div>

    <div v-if="showModal" class="fixed inset-0 z-40 overflow-y-auto bg-black/50 flex items-end md:items-center justify-center p-3 md:p-6">
      <div class="w-full max-w-xl max-h-[90vh] overflow-y-auto overscroll-contain bg-white rounded-2xl shadow-2xl p-4 md:p-6 animate-fade-in">
        <div class="flex items-center justify-between mb-5">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-primary font-bold">Material</p>
            <h2 class="text-xl font-extrabold text-gray-900">{{ editingId ? 'Edit Material' : 'Catat Material' }}</h2>
          </div>
          <button type="button" @click="showModal = false" class="p-2 rounded-xl hover:bg-gray-100">✕</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label-field">Tanggal</label>
            <input v-model="form.tanggal" type="date" class="input-field" />
          </div>
          <div>
            <label class="label-field">Nama material</label>
            <input v-model="form.nama_material" type="text" class="input-field" placeholder="Semen, besi, cat..." />
          </div>
          <div>
            <label class="label-field">Jumlah</label>
            <input :value="formatRupiahDisplay(form.jumlah)" @input="handleCurrencyInput('jumlah', $event)" type="text" inputmode="numeric" class="input-field" placeholder="Rp 0" />
          </div>
          <div>
            <label class="label-field">Satuan</label>
            <input v-model="form.satuan" type="text" class="input-field" placeholder="sak / batang / pcs" />
          </div>
          <div>
            <label class="label-field">Nomor nota pengeluaran</label>
            <input v-model="form.nomor_nota_pengeluaran" type="text" class="input-field" placeholder="NO-2024-001" />
          </div>
          <div>
            <label class="label-field">Total pengeluaran</label>
            <input :value="formatRupiahDisplay(form.total_pengeluaran)" @input="handleCurrencyInput('total_pengeluaran', $event)" type="text" inputmode="numeric" class="input-field" placeholder="Rp 0" />
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Supplier</label>
            <input v-model="form.supplier" type="text" class="input-field" placeholder="Nama supplier" />
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Catatan</label>
            <textarea v-model="form.catatan" rows="3" class="input-field" placeholder="Kondisi material, kekurangan, atau catatan pengecekan"></textarea>
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Foto dokumentasi</label>
            <div class="upload-card">
              <label class="upload-dropzone" :class="{ 'has-file': selectedFiles.length || selectedFileName }">
                <input type="file" accept="image/*" multiple @change="onPhotoSelected" />
                <div class="upload-content">
                  <span class="upload-icon">IMG</span>
                  <div class="upload-copy">
                    <span class="upload-title">{{ selectedFiles.length ? `${selectedFiles.length} foto dipilih` : 'Pilih foto dokumentasi' }}</span>
                    <span class="upload-subtitle">JPG, PNG • bisa tambah lebih dari satu</span>
                  </div>
                </div>
              </label>
              <div v-if="selectedFiles.length" class="space-y-2">
                <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center justify-between rounded-lg border border-slate-200 bg-white/60 px-2 py-1 text-xs text-slate-700">
                  <span class="truncate">{{ file.name }}</span>
                  <button type="button" class="text-red-500 font-semibold" @click="removeSelectedFile(index)">Hapus</button>
                </div>
              </div>
              <div v-if="previewUrl" class="upload-preview">
                <img :src="previewUrl" alt="Foto dokumentasi" />
              </div>
              <div v-else-if="existingPhotoPreviewUrl" class="upload-preview">
                <img :src="existingPhotoPreviewUrl" alt="Foto dokumentasi lama" />
              </div>
            </div>
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Nota pengeluaran</label>
            <div class="upload-card">
              <label class="upload-dropzone" :class="{ 'has-file': selectedNotaFiles.length || selectedNotaFileName }">
                <input type="file" accept="image/*" multiple @change="onNotaPengeluaranSelected" />
                <div class="upload-content">
                  <span class="upload-icon">PDF</span>
                  <div class="upload-copy">
                    <span class="upload-title">{{ selectedNotaFiles.length ? `${selectedNotaFiles.length} nota dipilih` : 'Pilih foto nota pengeluaran' }}</span>
                    <span class="upload-subtitle">Foto nota • bisa tambah lebih dari satu</span>
                  </div>
                </div>
              </label>
              <div v-if="selectedNotaFiles.length" class="space-y-2">
                <div v-for="(file, index) in selectedNotaFiles" :key="index" class="flex items-center justify-between rounded-lg border border-slate-200 bg-white/60 px-2 py-1 text-xs text-slate-700">
                  <span class="truncate">{{ file.name }}</span>
                  <button type="button" class="text-red-500 font-semibold" @click="removeSelectedNotaFile(index)">Hapus</button>
                </div>
              </div>
              <div v-if="notaPreviewUrl" class="upload-preview">
                <img :src="notaPreviewUrl" alt="Nota pengeluaran" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col-reverse md:flex-row justify-end gap-3 mt-6">
          <button type="button" class="btn-secondary w-full md:w-auto" @click="showModal = false">Batal</button>
          <button type="button" class="btn-primary w-full md:w-auto" @click="saveItem">Simpan</button>
        </div>
      </div>
    </div>

    <div v-if="showImageModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div class="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900">Preview foto</h3>
          <button type="button" @click="closeImageModal" class="rounded-xl p-2 hover:bg-gray-100">✕</button>
        </div>
        <div class="max-h-[70vh] overflow-auto rounded-xl bg-gray-100 p-2">
          <img :src="activeImageUrl" alt="Preview foto" class="mx-auto max-h-[65vh] w-full rounded-xl object-contain" />
        </div>
        <div class="mt-4 flex justify-end">
          <a v-if="activeImageUrl" :href="activeImageUrl" download class="btn-secondary">Download</a>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div class="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-xl font-extrabold text-gray-900">Detail Material Datang</h3>
          <button type="button" @click="closeDetailModal" class="rounded-xl p-2 hover:bg-gray-100">✕</button>
        </div>
        <div v-if="detailItem" class="space-y-4 text-sm text-gray-700">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="rounded-xl bg-gray-50 p-3"><p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Tanggal</p><p class="mt-1 font-medium text-gray-900">{{ formatDate(detailItem.tanggal) }}</p></div>
            <div class="rounded-xl bg-gray-50 p-3"><p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Nama Material</p><p class="mt-1 font-medium text-gray-900">{{ detailItem.nama_material || '-' }}</p></div>
            <div class="rounded-xl bg-gray-50 p-3"><p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Jumlah</p><p class="mt-1 font-medium text-gray-900">{{ Number(detailItem.jumlah || 0).toLocaleString('id-ID') }} {{ detailItem.satuan || '' }}</p></div>
            <div class="rounded-xl bg-gray-50 p-3"><p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Supplier</p><p class="mt-1 font-medium text-gray-900">{{ detailItem.supplier || '-' }}</p></div>
            <div class="rounded-xl bg-gray-50 p-3"><p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Total Pengeluaran</p><p class="mt-1 font-medium text-gray-900">{{ formatRupiah(detailItem.total_pengeluaran) }}</p></div>
            <div class="rounded-xl bg-gray-50 p-3"><p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Nomor Nota</p><p class="mt-1 font-medium text-gray-900">{{ detailItem.nomor_nota_pengeluaran || '-' }}</p></div>
          </div>
          <div v-if="detailItem.catatan" class="rounded-xl border border-gray-200 p-3">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Catatan</p>
            <p class="mt-2 whitespace-pre-line text-gray-700">{{ detailItem.catatan }}</p>
          </div>
          <div v-if="detailPhotos.length" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="(photo, index) in detailPhotos" :key="photo + index" class="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
              <img :src="imageUrl(photo)" class="h-48 w-full object-cover" alt="Detail foto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { compressImageFile } from '@/utils/imageCompression'
import {
  createRevitalisasiMaterialDatang,
  deleteRevitalisasiMaterialDatang,
  fetchRevitalisasiMaterialDatang,
  updateRevitalisasiMaterialDatang,
} from '@/api/revitalisasi'

const search = ref('')
const loading = ref(false)
const showModal = ref(false)
const editingId = ref(null)
const list = ref([])
const currentPhoto = ref(null)
const currentNotaPengeluaran = ref(null)
const previewUrl = ref('')
const notaPreviewUrl = ref('')
const selectedFileName = ref('')
const selectedFiles = ref([])
const selectedNotaFiles = ref([])
const selectedNotaFileName = ref('')
const showImageModal = ref(false)
const activeImageUrl = ref('')
const existingPhotoPreviewUrl = ref('')
const showDetailModal = ref(false)
const detailItem = ref(null)

const form = ref({
  tanggal: new Date().toISOString().slice(0, 10),
  nama_material: '',
  jumlah: 0,
  satuan: '',
  supplier: '',
  catatan: '',
  nomor_nota_pengeluaran: '',
  total_pengeluaran: 0,
})

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return list.value
  return list.value.filter((item) => {
    const text = [item.nama_material, item.supplier, item.catatan].join(' ').toLowerCase()
    return text.includes(query)
  })
})

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatRupiah(value) {
  const number = Number(value || 0)
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

function splitPhotoPaths(value) {
  if (!value) return []
  return String(value).split(';').map((part) => part.trim()).filter(Boolean)
}

function imageUrl(path) {
  if (!path) return ''
  return `${window.location.origin}/uploads/${path}`
}

function openPhotoModal(path) {
  if (!path) return
  activeImageUrl.value = imageUrl(path)
  showImageModal.value = true
}

function closeImageModal() {
  showImageModal.value = false
  activeImageUrl.value = ''
}

function openDetailModal(item) {
  detailItem.value = item
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  detailItem.value = null
}

const detailPhotos = computed(() => {
  if (!detailItem.value) return []
  return splitPhotoPaths(detailItem.value.photo_path)
})

async function loadData() {
  loading.value = true
  try {
    const response = await fetchRevitalisasiMaterialDatang({ search: search.value })
    list.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.error(error)
    alert('Gagal memuat material datang.')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function openCreateModal() {
  editingId.value = null
  currentPhoto.value = null
  currentNotaPengeluaran.value = null
  previewUrl.value = ''
  notaPreviewUrl.value = ''
  selectedFileName.value = ''
  selectedNotaFileName.value = ''
  existingPhotoPreviewUrl.value = ''
  form.value = {
    tanggal: new Date().toISOString().slice(0, 10),
    nama_material: '',
    jumlah: 0,
    satuan: '',
    supplier: '',
    catatan: '',
    nomor_nota_pengeluaran: '',
    total_pengeluaran: 0,
  }
  showModal.value = true
}

function openEditModal(item) {
  editingId.value = item.id
  currentPhoto.value = null
  currentNotaPengeluaran.value = null
  previewUrl.value = ''
  notaPreviewUrl.value = ''
  selectedFileName.value = ''
  selectedNotaFileName.value = ''
  existingPhotoPreviewUrl.value = item.photo_path ? imageUrl(item.photo_path) : ''
  form.value = {
    tanggal: item.tanggal ? new Date(item.tanggal).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    nama_material: item.nama_material || '',
    jumlah: Number(item.jumlah || 0),
    satuan: item.satuan || '',
    supplier: item.supplier || '',
    catatan: item.catatan || '',
    nomor_nota_pengeluaran: item.nomor_nota_pengeluaran || '',
    total_pengeluaran: Number(item.total_pengeluaran || 0),
  }
  showModal.value = true
}

function removeSelectedFile(index) {
  selectedFiles.value.splice(index, 1)
  if (!selectedFiles.value.length) {
    previewUrl.value = ''
    selectedFileName.value = ''
    currentPhoto.value = null
  }
}

function removeSelectedNotaFile(index) {
  selectedNotaFiles.value.splice(index, 1)
  if (!selectedNotaFiles.value.length) {
    notaPreviewUrl.value = ''
    selectedNotaFileName.value = ''
    currentNotaPengeluaran.value = null
  }
}

async function onPhotoSelected(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return

  const processed = []
  for (const file of files) {
    const compressed = await compressImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8, maxSizeMB: 1.2 })
    processed.push(compressed)
  }

  selectedFiles.value = [...selectedFiles.value, ...processed]
  selectedFileName.value = selectedFiles.value.length ? `${selectedFiles.value.length} file siap dikirim` : ''
  if (processed[0]) {
    previewUrl.value = URL.createObjectURL(processed[0])
  }
  event.target.value = ''
}

async function onNotaPengeluaranSelected(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return

  const processed = []
  for (const file of files) {
    const compressed = await compressImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8, maxSizeMB: 1.2 })
    processed.push(compressed)
  }

  selectedNotaFiles.value = [...selectedNotaFiles.value, ...processed]
  selectedNotaFileName.value = selectedNotaFiles.value.length ? `${selectedNotaFiles.value.length} file siap dikirim` : ''
  if (processed[0]) {
    notaPreviewUrl.value = URL.createObjectURL(processed[0])
  }
  event.target.value = ''
}

async function saveItem() {
  if (!form.value.tanggal || !form.value.nama_material) {
    alert('Tanggal dan nama material wajib diisi.')
    return
  }

  try {
    const payload = new FormData()
    payload.append('tanggal', form.value.tanggal)
    payload.append('nama_material', form.value.nama_material)
    payload.append('jumlah', String(form.value.jumlah || 0))
    payload.append('satuan', form.value.satuan || '')
    payload.append('supplier', form.value.supplier || '')
    payload.append('catatan', form.value.catatan || '')
    payload.append('nomor_nota_pengeluaran', form.value.nomor_nota_pengeluaran || '')
    payload.append('total_pengeluaran', String(form.value.total_pengeluaran || 0))
    selectedFiles.value.forEach((file) => {
      payload.append('photo', file)
    })
    selectedNotaFiles.value.forEach((file) => {
      payload.append('nota_pengeluaran', file)
    })

    if (editingId.value) {
      await updateRevitalisasiMaterialDatang(editingId.value, payload)
    } else {
      await createRevitalisasiMaterialDatang(payload)
    }
    showModal.value = false
    await loadData()
  } catch (error) {
    console.error(error)
    alert('Gagal menyimpan material datang.')
  }
}

async function deleteItem(id) {
  try {
    await deleteRevitalisasiMaterialDatang(id)
    await loadData()
  } catch (error) {
    console.error(error)
    alert('Gagal menghapus material datang.')
  }
}
</script>

<style scoped>
.upload-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 0.85rem;
  border-radius: 1.2rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(8px);
}

.upload-dropzone {
  position: relative;
  display: block;
  width: 100%;
  padding: 0.8rem 0.9rem;
  border-radius: 1rem;
  border: 1.5px dashed rgba(148, 163, 184, 0.35);
  background: rgba(15, 23, 42, 0.38);
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-dropzone:hover {
  border-color: rgba(148, 163, 184, 0.5);
  background: rgba(15, 23, 42, 0.52);
}

.upload-dropzone.has-file {
  border-style: solid;
  border-color: rgba(96, 165, 250, 0.5);
  background: rgba(30, 41, 59, 0.68);
}

.upload-dropzone input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-content {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.upload-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.85rem;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.upload-copy {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.upload-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-subtitle {
  font-size: 0.72rem;
  color: #94a3b8;
}

.upload-preview {
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.4);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.22);
}

.upload-preview img {
  display: block;
  width: 100%;
  height: 12rem;
  object-fit: cover;
}
</style>
