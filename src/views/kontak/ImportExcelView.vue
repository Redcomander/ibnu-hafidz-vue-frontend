<template>
  <div class="space-y-5 md:space-y-6">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Import Kontak via Excel</h1>
      <p class="text-xs sm:text-sm text-gray-500 mt-1">Format minimal: kolom nama dan no_whatsapp. Kolom lain opsional.</p>
    </div>

    <div class="glass-card p-4 sm:p-5 space-y-4">
      <div class="rounded-xl border border-dashed border-gray-300 p-4 sm:p-5 bg-gray-50">
        <p class="text-sm font-medium text-gray-700">Upload file .xlsx untuk proses insert/update berdasarkan NIS.</p>
        <p class="text-xs text-gray-500 mt-1">Maksimal lebih baik 1.000 baris per file agar proses cepat dan stabil di mobile.</p>
        <input
          type="file"
          accept=".xlsx"
          class="mt-3 block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-100 file:text-indigo-700 file:font-medium"
          @change="onFileChange"
        />
        <p v-if="selectedFile" class="mt-2 text-xs text-gray-600 break-all">File dipilih: {{ selectedFile.name }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          class="btn-secondary !py-2.5 !px-4 text-sm min-h-10"
          :disabled="loadingTemplate"
          @click="downloadTemplate"
        >
          {{ loadingTemplate ? 'Menyiapkan...' : 'Download Template Import' }}
        </button>
        <button
          class="btn-primary !py-2.5 !px-4 text-sm min-h-10"
          :disabled="loading || !selectedFile"
          @click="submitImport"
        >
          {{ loading ? 'Mengimpor...' : 'Mulai Import' }}
        </button>
        <RouterLink to="/dashboard/kontak" class="btn-secondary !py-2.5 !px-4 text-sm min-h-10 flex items-center justify-center">Kembali</RouterLink>
      </div>
    </div>

    <div v-if="result" class="glass-card p-4 sm:p-5">
      <h2 class="font-semibold text-gray-800">Hasil Import</h2>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-2.5 sm:gap-3 mt-3">
        <div class="bg-slate-50 rounded-lg p-3">
          <p class="text-xs text-gray-500">Total Baris</p>
          <p class="text-lg font-semibold text-gray-800">{{ result.total_rows }}</p>
        </div>
        <div class="bg-emerald-50 rounded-lg p-3">
          <p class="text-xs text-emerald-600">Inserted</p>
          <p class="text-lg font-semibold text-emerald-700">{{ result.inserted_rows }}</p>
        </div>
        <div class="bg-indigo-50 rounded-lg p-3">
          <p class="text-xs text-indigo-600">Updated</p>
          <p class="text-lg font-semibold text-indigo-700">{{ result.updated_rows }}</p>
        </div>
        <div class="bg-rose-50 rounded-lg p-3">
          <p class="text-xs text-rose-600">Skipped</p>
          <p class="text-lg font-semibold text-rose-700">{{ result.skipped_rows }}</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-xs text-gray-500">Batch ID</p>
          <p class="text-lg font-semibold text-gray-800">{{ result.batch_id }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { downloadImportTemplateExcel, importKontakExcel } from '@/api/kontak'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const loading = ref(false)
const loadingTemplate = ref(false)
const selectedFile = ref(null)
const result = ref(null)

function onFileChange(event) {
  selectedFile.value = event.target.files?.[0] || null
}

async function submitImport() {
  if (!selectedFile.value) return

  loading.value = true
  result.value = null
  try {
    const response = await importKontakExcel(selectedFile.value)
    result.value = response?.data || null
    toast.success('Import kontak berhasil diproses')
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Import kontak gagal')
  } finally {
    loading.value = false
  }
}

async function downloadTemplate() {
  loadingTemplate.value = true
  try {
    const response = await downloadImportTemplateExcel()
    const blob = response?.data
    const contentDisposition = response?.headers?.['content-disposition'] || ''
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i)
    const filename = filenameMatch?.[1] || 'template_import_kontak.xlsx'

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal download template import')
  } finally {
    loadingTemplate.value = false
  }
}
</script>
