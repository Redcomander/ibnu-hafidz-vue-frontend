<template>
  <teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Login WhatsApp</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ waReady ? 'Akun WhatsApp sudah terhubung' : 'Scan QR untuk menghubungkan akun WhatsApp Anda' }}
            </p>
          </div>
          <button type="button" @click="$emit('close')" class="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200">✕</button>
        </div>

        <div v-if="loading" class="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <div class="relative flex h-20 w-20 items-center justify-center">
            <div class="absolute inset-0 animate-ping rounded-full bg-emerald-200/60 dark:bg-emerald-500/20"></div>
            <div class="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl shadow-sm dark:bg-emerald-900/40"> </div>
          </div>
          <div class="space-y-1">
            <p class="text-base font-semibold text-slate-700 dark:text-slate-200">
              {{ waReady ? 'Memeriksa status koneksi...' : 'Mempersiapkan QR login...' }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Tunggu sebentar sampai WhatsApp siap dibuatkan sesi login unik untuk akun Anda.
            </p>
          </div>
        </div>

        <div v-else-if="waReady" class="flex flex-col items-center gap-4 py-2 text-center">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl dark:bg-emerald-900/40"></div>
          <div class="space-y-1">
            <p class="text-lg font-semibold text-emerald-700 dark:text-emerald-300">WhatsApp Terhubung</p>
            <p class="text-sm text-slate-600 dark:text-slate-300">Akun Anda siap digunakan untuk kirim pesan.</p>
          </div>
          <div class="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            Status: terhubung
          </div>
          <div class="grid w-full gap-2 sm:grid-cols-2">
            <button
              type="button"
              @click="handleReconnect"
              class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Reconnect
            </button>
            <button
              type="button"
              @click="handleDisconnect"
              class="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60"
            >
              Disconnect
            </button>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Selesai
          </button>
        </div>

        <div v-else-if="qrImage" class="flex flex-col items-center gap-3">
          <div class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-950">
            <img :src="qrImage" alt="WhatsApp QR" class="h-60 w-60 object-contain" />
          </div>
          <p class="text-center text-xs text-slate-600 dark:text-slate-300">
            Buka WhatsApp di ponsel Anda → Menu → Linked Devices → Link a Device
          </p>
          <div class="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            Status: menunggu koneksi
          </div>
          <button
            type="button"
            @click="handleReconnect"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Refresh QR
          </button>
        </div>

        <div v-else class="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center text-sm text-slate-500 dark:text-slate-400">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-slate-800"></div>
          <p class="font-medium text-slate-600 dark:text-slate-300">Menunggu QR baru tersedia.</p>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { watch, ref, onBeforeUnmount } from 'vue'
import { fetchWAQRCode, fetchWAStatus, disconnectWA } from '@/api/wa'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
const qrImage = ref('')
const loading = ref(false)
const waReady = ref(false)
let statusTimer = null
let qrLoadInFlight = false

watch(() => props.show, async (value) => {
  if (!value) {
    if (statusTimer) {
      clearInterval(statusTimer)
      statusTimer = null
    }
    return
  }

  if (!qrImage.value) {
    await loadQRCode()
  }
  await checkWAStatus()
  startStatusPolling()
})

onBeforeUnmount(() => {
  if (statusTimer) {
    clearInterval(statusTimer)
    statusTimer = null
  }
})

async function checkWAStatus() {
  try {
    const response = await fetchWAStatus()
    const nextReady = !!response?.ready
    waReady.value = nextReady

    if (nextReady) {
      qrImage.value = ''
      loading.value = false
    }
  } catch {
    waReady.value = false
  }
}

async function handleReconnect() {
  loading.value = true
  try {
    await disconnectWA()
    qrImage.value = ''
    waReady.value = false
    await loadQRCode()
    await checkWAStatus()
  } catch {
    loading.value = true
  }
}

async function handleDisconnect() {
  loading.value = true
  try {
    await disconnectWA()
    qrImage.value = ''
    waReady.value = false
  } finally {
    loading.value = true
  }
}

function startStatusPolling() {
  if (statusTimer) return

  statusTimer = setInterval(async () => {
    if (!props.show) return
    await checkWAStatus()
  }, 5000)
}

async function loadQRCode() {
  if (qrLoadInFlight || qrImage.value) {
    return
  }

  qrLoadInFlight = true
  loading.value = true
  try {
    const response = await fetchWAQRCode()
    const nextQr = response?.qr || ''

    if (!nextQr) {
      qrImage.value = ''
      waReady.value = false
      loading.value = true
      return
    }

    qrImage.value = nextQr
    waReady.value = false
    loading.value = false
  } catch {
    qrImage.value = ''
    waReady.value = false
    loading.value = true
  } finally {
    qrLoadInFlight = false
  }
}
</script>
