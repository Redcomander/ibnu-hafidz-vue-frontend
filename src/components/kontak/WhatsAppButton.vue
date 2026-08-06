<template>
  <button
    type="button"
    @click="openWhatsApp"
    :disabled="loading"
    class="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 min-h-9 disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {{ loading ? 'Membuka...' : 'WhatsApp' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { fetchWhatsAppLink } from '@/api/kontak'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  kontakId: {
    type: Number,
    required: true,
  },
  templateId: {
    type: [Number, null],
    default: null,
  },
  withLog: {
    type: Boolean,
    default: true,
  },
})

const loading = ref(false)
const toast = useToastStore()

async function openWhatsApp() {
  loading.value = true
  try {
    const params = {}
    if (props.templateId) params.template_id = props.templateId
    if (props.withLog) params.log = 1

    const response = await fetchWhatsAppLink(props.kontakId, params)
    if (!response?.url) {
      throw new Error('URL WhatsApp tidak tersedia')
    }
    window.open(response.url, '_blank')
  } catch (err) {
    toast.error(err?.response?.data?.message || err?.message || 'Gagal membuka WhatsApp')
  } finally {
    loading.value = false
  }
}
</script>
