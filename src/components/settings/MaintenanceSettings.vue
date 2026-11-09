<template>
  <section class="glass-card p-6 rounded-xl border border-amber-200" aria-labelledby="maintenance-settings-title">
    <h2 id="maintenance-settings-title" class="text-lg font-semibold text-gray-800">Mode Pemeliharaan</h2>
    <p class="text-sm text-gray-500 mt-1 mb-5">Administrator tetap dapat masuk dan menonaktifkan pemeliharaan.</p>
    <form class="space-y-4" @submit.prevent="save">
      <label class="flex items-center gap-3 text-sm font-medium"><input v-model="enabled" type="checkbox" :disabled="loading || saving" /> Aktifkan mode pemeliharaan</label>
      <label class="block text-sm">Cakupan
        <select v-model="scope" class="input-field mt-1" :disabled="loading || saving"><option value="all">Seluruh aplikasi kecuali administrator</option><option value="public">Website publik saja</option></select>
      </label>
      <label class="block text-sm">Pesan untuk pengunjung<textarea v-model="message" maxlength="500" rows="3" class="input-field mt-1" :disabled="loading || saving" /></label>
      <p v-if="error" role="alert" class="text-sm text-red-700">{{ error }}</p>
      <p v-if="success" role="status" class="text-sm text-green-700">{{ success }}</p>
      <button class="btn-primary" :disabled="loading || saving || loadFailed">{{ saving ? 'Menyimpan...' : 'Simpan pemeliharaan' }}</button>
      <button v-if="loadFailed" type="button" class="btn-secondary ml-3" @click="load">Muat ulang</button>
    </form>
  </section>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useMaintenanceStore } from '@/stores/maintenance'
const auth = useAuthStore()
const maintenance = useMaintenanceStore()
const enabled = ref(false)
const scope = ref('all')
const message = ref('')
const loading = ref(true)
const saving = ref(false)
const loadFailed = ref(false)
const error = ref('')
const success = ref('')
async function load() {
  loading.value = true; error.value = ''; loadFailed.value = false
  try {
    await maintenance.refresh(auth.accessToken)
    enabled.value = maintenance.enabled; scope.value = maintenance.scope; message.value = maintenance.message
  } catch { error.value = 'Gagal memuat pengaturan pemeliharaan.'; loadFailed.value = true }
  finally { loading.value = false }
}
async function save() {
  if (saving.value || loading.value || loadFailed.value) return
  saving.value = true; error.value = ''; success.value = ''
  try {
    const { data } = await api.put('/maintenance', { enabled: enabled.value, scope: scope.value, message: message.value })
    maintenance.update(data); message.value = maintenance.message
    success.value = maintenance.enabled ? 'Mode pemeliharaan diaktifkan.' : 'Mode pemeliharaan dinonaktifkan.'
  } catch { error.value = 'Gagal menyimpan. Pengaturan belum diperbarui.' }
  finally { saving.value = false }
}
onMounted(load)
</script>
