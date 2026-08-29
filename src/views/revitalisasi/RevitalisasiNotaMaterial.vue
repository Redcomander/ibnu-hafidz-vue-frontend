<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-primary font-bold">Revitalisasi SMA</p>
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900">Nota Material</h1>
      </div>
      <button type="button" class="btn-primary w-full md:w-auto" @click="openCreateModal">+ Tambah Nota</button>
    </div>

    <div class="glass-card p-4 md:p-5 rounded-2xl">
      <div class="flex flex-col md:flex-row gap-3">
        <div class="relative flex-1">
          <input v-model="search" type="text" class="input-field !pl-10" placeholder="Cari nomor nota, supplier, keterangan..." />
        </div>
      </div>
    </div>

    <div v-if="loading" class="glass-card p-6 rounded-2xl text-sm text-gray-500">Memuat nota material...</div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div v-for="item in filteredItems" :key="item.id" class="glass-card p-4 rounded-2xl">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">{{ item.nomor_nota }}</p>
            <h3 class="text-lg font-bold text-gray-900">{{ item.supplier }}</h3>
          </div>
          <div class="flex gap-2">
            <button type="button" class="btn-secondary !py-2 !px-3 !text-xs" @click="openEditModal(item)">Edit</button>
            <button type="button" class="btn-danger !py-2 !px-3 !text-xs" @click="deleteItem(item.id)">Hapus</button>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Tanggal</p>
            <p class="mt-1 font-medium">{{ formatDate(item.tanggal) }}</p>
          </div>
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Total</p>
            <p class="mt-1 font-medium">Rp {{ Number(item.total_nilai || 0).toLocaleString('id-ID') }}</p>
          </div>
          <div class="rounded-xl bg-gray-50 p-2.5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Dokumentasi</p>
            <button v-if="item.photo_path" type="button" @click="openPhotoModal(item.photo_path)" class="mt-1 font-medium text-primary underline">Lihat foto</button>
            <span v-else class="mt-1 font-medium text-gray-500">Belum ada</span>
          </div>
        </div>

        <p v-if="item.keterangan" class="mt-4 text-sm text-gray-600">{{ item.keterangan }}</p>
      </div>
    </div>

    <div v-if="!filteredItems.length && !loading" class="glass-card p-8 rounded-2xl text-center text-gray-500">
      Belum ada nota material.
    </div>

    <div v-if="showModal" class="fixed inset-0 z-40 overflow-y-auto bg-black/50 flex items-end md:items-center justify-center p-3 md:p-6">
      <div class="w-full max-w-xl max-h-[90vh] overflow-y-auto overscroll-contain bg-white rounded-2xl shadow-2xl p-4 md:p-6 animate-fade-in">
        <div class="flex items-center justify-between mb-5">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-primary font-bold">Nota</p>
            <h2 class="text-xl font-extrabold text-gray-900">{{ editingId ? 'Edit Nota' : 'Tambah Nota' }}</h2>
          </div>
          <button type="button" @click="showModal = false" class="p-2 rounded-xl hover:bg-gray-100">✕</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label-field">Tanggal</label>
            <input v-model="form.tanggal" type="date" class="input-field" />
          </div>
          <div>
            <label class="label-field">Nomor nota</label>
            <input v-model="form.nomor_nota" type="text" class="input-field" placeholder="INV-001" />
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Supplier</label>
            <input v-model="form.supplier" type="text" class="input-field" placeholder="Nama supplier" />
          </div>
          <div>
            <label class="label-field">Total nilai</label>
            <input v-model.number="form.total_nilai" type="number" min="0" class="input-field" placeholder="0" />
          </div>
          <div>
            <label class="label-field">Foto nota</label>
            <div class="upload-card">
              <label class="upload-dropzone" :class="{ 'has-file': selectedFileName }">
                <input type="file" accept="image/*" @change="onPhotoSelected" />
                <div class="upload-content">
                  <span class="upload-icon">IMG</span>
                  <div class="upload-copy">
                    <span class="upload-title">{{ selectedFileName || 'Pilih foto nota' }}</span>
                    <span class="upload-subtitle">JPG, PNG • otomatis dikompresi</span>
                  </div>
                </div>
              </label>
              <div v-if="previewUrl" class="upload-preview">
                <img :src="previewUrl" alt="Foto nota" />
              </div>
              <div v-else-if="existingPhotoPreviewUrl" class="upload-preview">
                <img :src="existingPhotoPreviewUrl" alt="Foto lama" />
              </div>
            </div>
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Keterangan</label>
            <textarea v-model="form.keterangan" rows="3" class="input-field" placeholder="Catatan tambahan"></textarea>
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  createRevitalisasiNotaMaterial,
  deleteRevitalisasiNotaMaterial,
  fetchRevitalisasiNotaMaterial,
  updateRevitalisasiNotaMaterial,
} from '@/api/revitalisasi'
import { compressImageFile } from '@/utils/imageCompression'

const search = ref('')
const loading = ref(false)
const showModal = ref(false)
const editingId = ref(null)
const list = ref([])
const currentPhoto = ref(null)
const previewUrl = ref('')
const selectedFileName = ref('')
const showImageModal = ref(false)
const activeImageUrl = ref('')
const existingPhotoPreviewUrl = ref('')

const form = ref({
  tanggal: new Date().toISOString().slice(0, 10),
  nomor_nota: '',
  supplier: '',
  keterangan: '',
  total_nilai: 0,
})

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return list.value
  return list.value.filter((item) => {
    const text = [item.nomor_nota, item.supplier, item.keterangan].join(' ').toLowerCase()
    return text.includes(query)
  })
})

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
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

async function loadData() {
  loading.value = true
  try {
    const response = await fetchRevitalisasiNotaMaterial({ search: search.value })
    list.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.error(error)
    alert('Gagal memuat nota material.')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function openCreateModal() {
  editingId.value = null
  currentPhoto.value = null
  previewUrl.value = ''
  selectedFileName.value = ''
  existingPhotoPreviewUrl.value = ''
  form.value = {
    tanggal: new Date().toISOString().slice(0, 10),
    nomor_nota: '',
    supplier: '',
    keterangan: '',
    total_nilai: 0,
  }
  showModal.value = true
}

function openEditModal(item) {
  editingId.value = item.id
  currentPhoto.value = null
  previewUrl.value = ''
  selectedFileName.value = ''
  existingPhotoPreviewUrl.value = item.photo_path ? imageUrl(item.photo_path) : ''
  form.value = {
    tanggal: item.tanggal ? new Date(item.tanggal).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    nomor_nota: item.nomor_nota || '',
    supplier: item.supplier || '',
    keterangan: item.keterangan || '',
    total_nilai: Number(item.total_nilai || 0),
  }
  showModal.value = true
}

async function onPhotoSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const compressed = await compressImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8, maxSizeMB: 1.2 })
  currentPhoto.value = compressed
  previewUrl.value = URL.createObjectURL(compressed)
  selectedFileName.value = file.name
}

async function saveItem() {
  if (!form.value.tanggal || !form.value.nomor_nota || !form.value.supplier) {
    alert('Tanggal, nomor nota, dan supplier wajib diisi.')
    return
  }

  try {
    const payload = new FormData()
    payload.append('tanggal', form.value.tanggal)
    payload.append('nomor_nota', form.value.nomor_nota)
    payload.append('supplier', form.value.supplier)
    payload.append('keterangan', form.value.keterangan || '')
    payload.append('total_nilai', String(form.value.total_nilai || 0))
    if (currentPhoto.value) payload.append('photo', currentPhoto.value)

    if (editingId.value) {
      await updateRevitalisasiNotaMaterial(editingId.value, payload)
    } else {
      await createRevitalisasiNotaMaterial(payload)
    }
    showModal.value = false
    await loadData()
  } catch (error) {
    console.error(error)
    alert('Gagal menyimpan nota material.')
  }
}

async function deleteItem(id) {
  try {
    await deleteRevitalisasiNotaMaterial(id)
    await loadData()
  } catch (error) {
    console.error(error)
    alert('Gagal menghapus nota material.')
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
