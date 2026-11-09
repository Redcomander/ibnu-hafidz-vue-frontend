import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useMaintenanceStore = defineStore('maintenance', () => {
  const enabled = ref(false)
  const scope = ref('all')
  const message = ref('Kami sedang melakukan pemeliharaan sistem. Silakan kembali beberapa saat lagi.')
  const canBypass = ref(false)
  function update(data) {
    enabled.value = data.enabled === true
    scope.value = data.scope || 'all'
    message.value = data.message || 'Kami sedang melakukan pemeliharaan sistem. Silakan kembali beberapa saat lagi.'
    canBypass.value = data.can_bypass === true
  }
  async function refresh(token) {
    const { data } = await axios.get('/api/maintenance', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true, timeout: 10000,
    })
    update(data)
    return data
  }
  return { enabled, scope, message, canBypass, update, refresh }
})
