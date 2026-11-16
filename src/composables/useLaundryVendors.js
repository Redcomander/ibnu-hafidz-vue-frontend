import { ref, onMounted, onBeforeUnmount } from 'vue'
import api from '@/api'

export function useLaundryVendors() {
  const vendors = ref([]), vendorsLoading = ref(false), vendorsError = ref(false)
  const controller = new AbortController()
  async function loadVendors() {
    if (vendorsLoading.value) return
    vendorsLoading.value = true; vendorsError.value = false
    try {
      const result = []
      let page = 1
      while (!controller.signal.aborted) {
        const { data } = await api.get('/laundry/vendors', { params: { page, per_page: 100 }, signal: controller.signal })
        const batch = Array.isArray(data.data) ? data.data : []
        result.push(...batch)
        if (page >= Number(data.total_pages || 1) || batch.length === 0) break
        page++
      }
      if (!controller.signal.aborted) vendors.value = result
    } catch {
      if (!controller.signal.aborted) vendorsError.value = true
    } finally { vendorsLoading.value = false }
  }
  onMounted(loadVendors)
  onBeforeUnmount(() => controller.abort())
  return { vendors, vendorsLoading, vendorsError, loadVendors }
}
