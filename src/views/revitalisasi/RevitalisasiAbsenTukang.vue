<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-primary font-bold">Revitalisasi SMA</p>
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900">Absen Tukang</h1>
      </div>
      <button type="button" class="btn-secondary w-full md:w-auto" @click="$router.push('/dashboard/revitalisasi/tukang')">
        Lihat Data Tukang
      </button>
    </div>

    <form class="glass-card p-4 md:p-5 rounded-2xl" @submit.prevent="saveAttendance">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label-field">Tanggal</label>
          <input v-model="form.date" type="date" class="input-field" />
        </div>
        <div>
          <label class="label-field">Nama tukang</label>
          <select v-model="form.tukang_id" class="input-field">
            <option value="">Pilih tukang</option>
            <option v-for="item in tukangList" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        </div>
        <div>
          <label class="label-field">Status</label>
          <select v-model="form.status" class="input-field">
            <option value="hadir">Hadir</option>
            <option value="izin">Izin</option>
            <option value="sakit">Sakit</option>
            <option value="alpha">Alpha</option>
          </select>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="label-field">Catatan</label>
          <textarea v-model="form.note" rows="3" class="input-field" placeholder="Catatan absensi"></textarea>
        </div>
        <div>
          <label class="label-field">Foto bukti</label>
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
              <img :src="previewUrl" alt="Foto bukti" />
            </div>
            <p v-else class="upload-hint">Foto opsional, akan dikompresi otomatis agar aman untuk HP.</p>
          </div>
        </div>
      </div>

      <div class="mt-5 flex justify-end">
        <button type="submit" class="btn-primary">Simpan Absen</button>
      </div>
    </form>

    <div class="glass-card p-4 md:p-5 rounded-2xl">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-900">Rekap Harian</h2>
        <span class="text-xs text-gray-500">{{ records.length }} data</span>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b border-gray-200">
              <th class="py-3 pr-3">Tanggal</th>
              <th class="py-3 pr-3">Tukang</th>
              <th class="py-3 pr-3">Status</th>
              <th class="py-3 pr-3">Catatan</th>
              <th class="py-3">Foto</th>
              <th class="py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in records" :key="row.id" class="border-b border-gray-100">
              <td class="py-3 pr-3">{{ formatDate(row.tanggal || row.date) }}</td>
              <td class="py-3 pr-3">{{ getTukangName(row.tukang_id) }}</td>
              <td class="py-3 pr-3">
                <span :class="['px-2.5 py-1 rounded-full text-[11px] font-semibold', statusClass(row.status)]">{{ row.status }}</span>
              </td>
              <td class="py-3 pr-3">{{ row.note || '-' }}</td>
              <td class="py-3 pr-3">
                <button v-if="row.photo_path" type="button" @click="openPhotoModal(row.photo_path)" class="text-primary text-xs font-semibold underline">Lihat</button>
                <span v-else class="text-gray-400 text-xs">-</span>
              </td>
              <td class="py-3">
                <button type="button" class="text-red-600 text-xs font-semibold" @click="deleteRecord(row.id)">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
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
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { compressImageFile } from '@/utils/imageCompression'
import {
  createRevitalisasiAbsen,
  deleteRevitalisasiAbsen,
  fetchRevitalisasiAbsen,
  fetchRevitalisasiTukang,
} from '@/api/revitalisasi'

const tukangList = ref([])
const records = ref([])

const form = ref({
  date: new Date().toISOString().slice(0, 10),
  tukang_id: '',
  status: 'hadir',
  note: '',
})

const previewUrl = ref('')
const compressedPhoto = ref(null)
const selectedFileName = ref('')
const selectedFiles = ref([])
const showImageModal = ref(false)
const activeImageUrl = ref('')

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

function getTukangName(id) {
  return tukangList.value.find((item) => item.id === Number(id))?.name || '-'
}

function statusClass(status) {
  const map = {
    hadir: 'bg-emerald-50 text-emerald-700',
    izin: 'bg-amber-50 text-amber-700',
    sakit: 'bg-sky-50 text-sky-700',
    alpha: 'bg-rose-50 text-rose-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

async function loadTukang() {
  try {
    const response = await fetchRevitalisasiTukang()
    tukangList.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.error(error)
  }
}

async function loadRecords() {
  try {
    const response = await fetchRevitalisasiAbsen()
    records.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.error(error)
    alert('Gagal memuat rekap absen tukang.')
  }
}

onMounted(async () => {
  await loadTukang()
  await loadRecords()
})

async function saveAttendance() {
  const tukangId = Number(form.value.tukang_id)
  if (!form.value.date || !tukangId || !form.value.status) {
    alert('Tanggal, nama tukang, dan status wajib diisi.')
    return
  }

  const payload = new FormData()
  payload.append('tanggal', form.value.date)
  payload.append('tukang_id', String(tukangId))
  payload.append('status', form.value.status)
  payload.append('note', form.value.note || '')

  selectedFiles.value.forEach((file) => {
    payload.append('photo', file)
  })

  try {
    await createRevitalisasiAbsen(payload)
    form.value = {
      date: new Date().toISOString().slice(0, 10),
      tukang_id: '',
      status: 'hadir',
      note: '',
    }
    previewUrl.value = ''
    compressedPhoto.value = null
    selectedFileName.value = ''
    selectedFiles.value = []
    await loadRecords()
  } catch (error) {
    console.error(error)
    alert('Gagal menyimpan absensi tukang.')
  }
}

function removeSelectedFile(index) {
  selectedFiles.value.splice(index, 1)
  if (!selectedFiles.value.length) {
    previewUrl.value = ''
    selectedFileName.value = ''
    compressedPhoto.value = null
  }
}

async function onPhotoSelected(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return

  const processed = []
  for (const file of files) {
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.8,
        maxSizeMB: 1.5,
      })
      processed.push(compressed)
    } catch (error) {
      console.error(error)
      alert(`Gagal mengompresi foto ${file.name}.`)
    }
  }

  if (!processed.length) return

  selectedFiles.value = [...selectedFiles.value, ...processed]
  selectedFileName.value = selectedFiles.value.length ? `${selectedFiles.value.length} file siap dikirim` : ''
  const firstFile = processed[0]
  if (firstFile) {
    previewUrl.value = URL.createObjectURL(firstFile)
  }
  event.target.value = ''
}

async function deleteRecord(id) {
  try {
    await deleteRevitalisasiAbsen(id)
    await loadRecords()
  } catch (error) {
    console.error(error)
    alert('Gagal menghapus data absensi.')
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

.upload-hint {
  margin-top: 0.2rem;
  font-size: 0.72rem;
  color: #64748b;
}
</style>
