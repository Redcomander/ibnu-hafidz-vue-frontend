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

    <button
      type="button"
      @click="openManualBusiness"
      :disabled="loading"
      class="inline-flex min-h-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] font-semibold text-amber-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-900/50 sm:text-xs"
    >
      Manual Business
    </button>
  </div>

  <teleport to="body">
    <div v-if="showAccountPicker" class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4">
      <div class="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900">
        <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">Pilih akun WhatsApp</p>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Pilih sesi yang mau dipakai untuk kirim pesan.</p>
        <div class="mt-4 grid gap-2">
          <button
            v-for="option in accountOptions"
            :key="option.value"
            type="button"
            @click="confirmAccount(option.value)"
            class="rounded-xl border px-3 py-2.5 text-sm font-medium transition"
            :class="selectedAccountType === option.value
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-200'
              : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'"
          >
            {{ option.label }}
          </button>
        </div>
        <button
          type="button"
          @click="showAccountPicker = false"
          class="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
        >
          Batal
        </button>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'
import { fetchWhatsAppLink } from '@/api/kontak'
import { fetchWAStatus, sendWAMessage } from '@/api/wa'
import { useToastStore } from '@/stores/toast'

const accountOptions = [
  { value: 'shared', label: 'Shared' },
  { value: 'personal', label: 'WhatsApp Personal' },
  { value: 'business', label: 'WhatsApp Business' },
]

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
const emit = defineEmits(['sent'])
const showAccountPicker = ref(false)
const selectedAccountType = ref('shared')
const pendingAction = ref(null)

function confirmAccount(accountType) {
  selectedAccountType.value = accountType
  showAccountPicker.value = false

  if (!pendingAction.value) return

  const nextAction = pendingAction.value
  pendingAction.value = null

  if (nextAction === 'manual') {
    openManual(true)
  }
}

async function sendAuto(forceSelected = false) {
  if (!selectedAccountType.value) {
    selectedAccountType.value = 'shared'
  }

  loading.value = true
  try {
    const accountType = selectedAccountType.value || 'shared'
    const status = await fetchWAStatus(undefined, accountType)
    if (status?.ready || status?.connected) {
      const payload = {
        kontak_id: props.kontakId,
        template_id: props.templateId || undefined,
        account_type: accountType,
      }
      if (props.withLog) payload.log = 1

      await sendWAMessage(payload)
      emit('sent')
      toast.success(`Pesan WhatsApp berhasil dikirim via ${accountType}`)
      return
    }

    if (props.loginRequired) {
      props.loginRequired({ accountType })
      return
    }

    throw new Error(`WhatsApp ${accountType} belum terhubung. Silakan login akun tersebut terlebih dahulu.`)
  } catch (err) {
    toast.error(err?.response?.data?.message || err?.message || 'Gagal mengirim WhatsApp')
  } finally {
    loading.value = false
  }
}

function openAccountPicker(action) {
  if (action !== 'manual') return
  pendingAction.value = action
  showAccountPicker.value = true
}

function openManualBusiness() {
  selectedAccountType.value = 'business'
  openManual(true)
}

async function openManual(forceSelected = false) {
  if (!forceSelected) {
    openAccountPicker('manual')
    return
  }

  loading.value = true
  try {
    const accountType = selectedAccountType.value || 'shared'
    if (props.loginRequired) {
      props.loginRequired({ accountType })
      return
    }

    const params = { account_type: accountType }
    if (props.templateId) params.template_id = props.templateId
    if (props.withLog) params.log = 1

    const response = await fetchWhatsAppLink(props.kontakId, params)
    if (!response?.url) {
      throw new Error('URL WhatsApp tidak tersedia')
    }

    window.open(response.url, '_blank', 'noopener,noreferrer')
    emit('sent')
  } catch (err) {
    toast.error(err?.response?.data?.message || err?.message || 'Gagal membuka WhatsApp')
  } finally {
    loading.value = false
  }
}
</script>
