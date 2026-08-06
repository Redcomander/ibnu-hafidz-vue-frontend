<template>
  <teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/45" @click="$emit('update:show', false)"></div>

      <div class="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col">
        <div class="px-5 py-4 border-b border-gray-100">
          <h3 class="text-base font-semibold text-gray-800">Edit Kontak</h3>
          <p class="text-xs text-gray-500 mt-1">Perbarui status dan handler penanggung jawab.</p>
        </div>

        <div class="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">Nama</label>
            <input v-model="form.nama" type="text" class="input-field !py-2.5 text-sm" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">No WhatsApp</label>
            <input v-model="form.no_whatsapp" type="text" class="input-field !py-2.5 text-sm" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">Status Kontak</label>
            <select v-model="form.status_kontak" class="input-field !py-2.5 text-sm">
              <option value="baru">Baru</option>
              <option value="follow_up">Follow Up</option>
              <option value="prospek">Prospek</option>
              <option value="deal">Deal</option>
              <option value="tidak_aktif">Tidak Aktif</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">Handler</label>
            <select v-model="form.handler_id" class="input-field !py-2.5 text-sm">
              <option :value="null">Belum Ditentukan</option>
              <option v-for="user in handlers" :key="user.id" :value="user.id">{{ user.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">Alamat</label>
            <textarea v-model="form.alamat" rows="2" class="input-field text-sm"></textarea>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">Alamat Lengkap</label>
            <textarea v-model="form.alamat_lengkap" rows="3" class="input-field text-sm"></textarea>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">Catatan</label>
            <textarea v-model="form.catatan" rows="2" class="input-field text-sm"></textarea>
          </div>
        </div>

        <div class="px-4 sm:px-5 py-3 sm:py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 sticky bottom-0">
          <button type="button" @click="$emit('update:show', false)" class="btn-secondary !py-2.5 !px-4 text-sm min-h-10">Batal</button>
          <button type="button" @click="submit" :disabled="saving" class="btn-primary !py-2.5 !px-4 text-sm min-h-10">
            {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { reactive, watch, ref } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  kontak: { type: Object, default: null },
  handlers: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:show', 'save'])
const saving = ref(false)

const form = reactive({
  nama: '',
  no_whatsapp: '',
  status_kontak: 'baru',
  handler_id: null,
  alamat: '',
  alamat_lengkap: '',
  catatan: '',
})

watch(
  () => props.kontak,
  (val) => {
    form.nama = val?.nama || ''
    form.no_whatsapp = val?.no_whatsapp || ''
    form.status_kontak = val?.status_kontak || 'baru'
    form.handler_id = val?.handler_id ?? null
    form.alamat = val?.alamat || ''
    form.alamat_lengkap = val?.alamat_lengkap || ''
    form.catatan = val?.catatan || ''
  },
  { immediate: true }
)

async function submit() {
  if (!props.kontak?.id) return
  saving.value = true
  try {
    await emit('save', {
      id: props.kontak.id,
      payload: {
        nama: form.nama,
        no_whatsapp: form.no_whatsapp,
        status_kontak: form.status_kontak,
        handler_id: form.handler_id,
        alamat: form.alamat || null,
        alamat_lengkap: form.alamat_lengkap || null,
        catatan: form.catatan || null,
        nis: props.kontak.nis || null,
        sumber_data: props.kontak.sumber_data || null,
      },
    })
  } finally {
    saving.value = false
  }
}
</script>
