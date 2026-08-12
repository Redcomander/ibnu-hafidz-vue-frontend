<template>
  <div class="space-y-5 md:space-y-6 pb-6">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Template Pesan WhatsApp</h1>
        <p class="text-xs sm:text-sm text-gray-500 mt-1">
          Gunakan placeholder aktif: kontak = {nama}, {nis}, {no_whatsapp}, {status_kontak}, {sumber_data}, {tunggakan}; tagihan = {nama}, {nis}, {no_whatsapp}, {total_tagihan}, {tunggakan}, {status_tagihan}
        </p>
      </div>
      <button
        v-if="auth.hasPermission('template_pesan.create')"
        @click="openCreate"
        class="btn-primary !py-2.5 !px-3 text-sm min-h-10"
      >
        Tambah Template
      </button>
    </div>

    <div class="glass-card overflow-hidden">
      <table class="data-table hidden md:table">
        <thead>
          <tr>
            <th>Nama Template</th>
            <th>Konten</th>
            <th>Aktif</th>
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in templates" :key="row.id">
            <td class="font-medium text-gray-800">{{ row.nama }}</td>
            <td>
              <p class="text-xs text-gray-600 line-clamp-2 max-w-2xl">{{ row.konten }}</p>
            </td>
            <td>
              <span :class="row.aktif ? 'px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700' : 'px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600'">
                {{ row.aktif ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td>
              <div class="flex justify-end gap-2">
                <button
                  v-if="auth.hasPermission('template_pesan.edit')"
                  @click="openEdit(row)"
                  class="px-2.5 py-1.5 text-xs rounded-lg bg-indigo-100 text-indigo-700"
                >
                  Edit
                </button>
                <button
                  v-if="auth.hasPermission('template_pesan.delete')"
                  @click="removeTemplate(row.id)"
                  class="px-2.5 py-1.5 text-xs rounded-lg bg-rose-100 text-rose-700"
                >
                  Hapus
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="templates.length === 0">
            <td colspan="4" class="text-center py-8 text-gray-400">Belum ada template</td>
          </tr>
        </tbody>
      </table>

      <div class="md:hidden divide-y divide-gray-100">
        <div v-for="row in templates" :key="row.id" class="p-4 space-y-3">
          <div class="flex items-start justify-between gap-3">
            <h3 class="font-semibold text-gray-800 text-sm pr-2">{{ row.nama }}</h3>
            <span :class="row.aktif ? 'px-2 py-1 rounded-full text-[11px] bg-emerald-100 text-emerald-700' : 'px-2 py-1 rounded-full text-[11px] bg-gray-100 text-gray-600'">
              {{ row.aktif ? 'Aktif' : 'Nonaktif' }}
            </span>
          </div>
          <p class="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{{ row.konten }}</p>
          <div class="grid grid-cols-2 gap-2 pt-1">
            <button
              v-if="auth.hasPermission('template_pesan.edit')"
              @click="openEdit(row)"
              class="px-2.5 py-2 text-xs rounded-lg bg-indigo-100 text-indigo-700 min-h-9 font-medium"
            >
              Edit
            </button>
            <button
              v-if="auth.hasPermission('template_pesan.delete')"
              @click="removeTemplate(row.id)"
              class="px-2.5 py-2 text-xs rounded-lg bg-rose-100 text-rose-700 min-h-9 font-medium"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-black/45" @click="showForm = false"></div>
        <div class="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="text-base font-semibold text-gray-800">{{ editingId ? 'Edit Template' : 'Tambah Template' }}</h3>
          </div>
          <div class="p-5 space-y-4 overflow-y-auto flex-1">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Nama</label>
              <input v-model="form.nama" type="text" class="input-field !py-2.5 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Konten</label>
              <textarea v-model="form.konten" rows="8" class="input-field text-sm"></textarea>
            </div>
            <label class="inline-flex items-center gap-2 text-sm text-gray-700">
              <input v-model="form.aktif" type="checkbox" class="rounded border-gray-300" />
              Aktif
            </label>
          </div>
          <div class="px-4 sm:px-5 py-3 sm:py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 sticky bottom-0">
            <button @click="showForm = false" class="btn-secondary !py-2.5 !px-4 text-sm min-h-10">Batal</button>
            <button @click="submitForm" :disabled="saving" class="btn-primary !py-2.5 !px-4 text-sm min-h-10">
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { createTemplate, deleteTemplate, fetchTemplateList, updateTemplate } from '@/api/kontak'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const auth = useAuthStore()
const toast = useToastStore()

const templates = ref([])
const showForm = ref(false)
const editingId = ref(null)
const saving = ref(false)

const form = reactive({
  nama: '',
  konten: '',
  aktif: true,
})

onMounted(loadTemplates)

async function loadTemplates() {
  try {
    const response = await fetchTemplateList()
    templates.value = response?.data || []
  } catch {
    templates.value = []
  }
}

function openCreate() {
  editingId.value = null
  form.nama = ''
  form.konten = ''
  form.aktif = true
  showForm.value = true
}

function openEdit(row) {
  editingId.value = row.id
  form.nama = row.nama || ''
  form.konten = row.konten || ''
  form.aktif = !!row.aktif
  showForm.value = true
}

async function submitForm() {
  if (!form.nama.trim() || !form.konten.trim()) {
    toast.error('Nama dan konten template wajib diisi')
    return
  }

  saving.value = true
  try {
    const payload = {
      nama: form.nama,
      konten: form.konten,
      aktif: form.aktif,
    }

    if (editingId.value) {
      await updateTemplate(editingId.value, payload)
      toast.success('Template berhasil diperbarui')
    } else {
      await createTemplate(payload)
      toast.success('Template berhasil ditambahkan')
    }

    showForm.value = false
    await loadTemplates()
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menyimpan template')
  } finally {
    saving.value = false
  }
}

async function removeTemplate(id) {
  if (!window.confirm('Hapus template ini?')) return
  try {
    await deleteTemplate(id)
    toast.success('Template berhasil dihapus')
    await loadTemplates()
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menghapus template')
  }
}
</script>
