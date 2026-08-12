<template>
  <div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
    <button
      type="button"
      @click="sendAuto"
      :disabled="loading"
      class="inline-flex min-h-9 items-center justify-center rounded-lg bg-emerald-600 px-2.5 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-xs"
    >
      {{ loading ? 'Mengirim...' : 'Kirim Otomatis' }}
    </button>

    <button
      type="button"
      @click="openManual"
      :disabled="loading"
      class="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:text-xs"
    >
      Manual
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { fetchWhatsAppLink } from '@/api/kontak'
import { fetchWAStatus, sendWAMessage } from '@/api/wa'
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
  loginRequired: {
    type: Function,
    default: null,
  },
})

const loading = ref(false)
const toast = useToastStore()

async function sendAuto() {
  loading.value = true
  try {
    const status = await fetchWAStatus()
    if (status?.ready) {
      const payload = {
        kontak_id: props.kontakId,
        template_id: props.templateId || undefined,
      }
      if (props.withLog) payload.log = 1

      await sendWAMessage(payload)
      toast.success('Pesan WhatsApp berhasil dikirim')
      return
    }

    if (props.loginRequired) {
      props.loginRequired()
      return
    }

    throw new Error('WhatsApp belum terhubung. Gunakan tombol Manual atau Login WA terlebih dahulu.')
  } catch (err) {
    toast.error(err?.response?.data?.message || err?.message || 'Gagal mengirim WhatsApp')
  } finally {
    loading.value = false
  }
}

async function openManual() {
  loading.value = true
  try {
    if (props.loginRequired) {
      props.loginRequired()
      return
    }

    const params = {}
    if (props.templateId) params.template_id = props.templateId
    if (props.withLog) params.log = 1

    const response = await fetchWhatsAppLink(props.kontakId, params)
    if (!response?.url) {
      throw new Error('URL WhatsApp tidak tersedia')
    }

    window.open(response.url, '_blank', 'noopener,noreferrer')
  } catch (err) {
    toast.error(err?.response?.data?.message || err?.message || 'Gagal membuka WhatsApp')
  } finally {
    loading.value = false
  }
}
</script>
