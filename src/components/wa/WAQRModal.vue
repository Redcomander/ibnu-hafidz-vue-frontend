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
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Tutup modal"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18"></path>
            </svg>
          </button>
        </div>

        <transition name="wa-card" mode="out-in">
          <div :key="stateKey" class="wa-card-shell">
            <div v-if="loading" class="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center text-sm text-slate-500 dark:text-slate-400">
              <div class="relative flex h-20 w-20 items-center justify-center">
                <div class="absolute inset-0 animate-ping rounded-full bg-emerald-200/60 dark:bg-emerald-500/20"></div>
                <div class="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 shadow-sm dark:bg-emerald-900/40">
                  <svg viewBox="0 0 24 24" class="h-7 w-7 text-emerald-600 dark:text-emerald-300" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="7" y="2.7" width="10" height="18" rx="2.5"></rect>
                    <circle cx="12" cy="16.2" r="1.3"></circle>
                  </svg>
                </div>
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
              <div class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <svg viewBox="0 0 24 24" class="h-10 w-10 text-emerald-600 dark:text-emerald-300" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.2 4.2L19 2.8"></path>
                </svg>
              </div>
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
                <img :src="qrImage" alt="WhatsApp QR" class="h-60 w-60 object-contain transition-all duration-300" />
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
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <svg viewBox="0 0 24 24" class="h-8 w-8 text-slate-500 dark:text-slate-300" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M7 8.8V6.2A2.2 2.2 0 0 1 9.2 4h5.6A2.2 2.2 0 0 1 17 6.2v2.6"></path>
                  <rect x="5" y="8.8" width="14" height="12" rx="2.8"></rect>
                  <path d="M12 13.5v3.5"></path>
                </svg>
              </div>
              <p class="font-medium text-slate-600 dark:text-slate-300">Menunggu QR baru tersedia.</p>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.wa-card-shell {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.wa-card-enter-active,
.wa-card-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.wa-card-enter-from,
.wa-card-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.wa-card-enter-to,
.wa-card-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>

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
const stateKey = ref('loading')
let statusTimer = null
let qrLoadInFlight = false
let activeRequest = null

function stopPolling() {
  if (statusTimer) {
    clearInterval(statusTimer)
    statusTimer = null
  }

  if (activeRequest) {
    activeRequest.abort()
    activeRequest = null
  }
}

function handlePageVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    stopPolling()
    return
  }

  if (props.show) {
    startStatusPolling()
  }
}

watch(() => props.show, async (value) => {
  if (!value) {
    stopPolling()
    return
  }

  loading.value = true
  stateKey.value = 'loading'
  await loadQRCode(true)
  await checkWAStatus()
  startStatusPolling()
})

onBeforeUnmount(() => {
  stopPolling()
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handlePageVisibilityChange)
    window.removeEventListener('pagehide', stopPolling)
  }
})

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', handlePageVisibilityChange)
  window.addEventListener('pagehide', stopPolling)
}

async function checkWAStatus() {
  if (!props.show) return

  const controller = new AbortController()
  activeRequest = controller

  try {
    const response = await fetchWAStatus(controller.signal)
    if (!props.show) return

    const nextReady = !!response?.ready
    const nextQr = response?.qr || ''
    waReady.value = nextReady

    if (nextReady) {
      qrImage.value = ''
      loading.value = false
      stateKey.value = 'connected'
      return
    }

    if (nextQr) {
      loading.value = true
      stateKey.value = 'loading'
      await loadQRCode(true)
      return
    }

    if (!qrImage.value) {
      loading.value = true
      stateKey.value = 'loading'
    }
  } catch (error) {
    if (error?.name === 'AbortError') return
    waReady.value = false
    loading.value = true
    stateKey.value = 'loading'
  } finally {
    if (activeRequest === controller) {
      activeRequest = null
    }
  }
}

async function handleReconnect() {
  loading.value = true
  stateKey.value = 'loading'
  try {
    stopPolling()
    await disconnectWA()
    qrImage.value = ''
    waReady.value = false
    await loadQRCode(true)
    await checkWAStatus()
    startStatusPolling()
  } catch (error) {
    if (error?.name !== 'AbortError') {
      loading.value = true
      stateKey.value = 'loading'
    }
  }
}

async function handleDisconnect() {
  loading.value = true
  stateKey.value = 'loading'
  try {
    stopPolling()
    await disconnectWA()
    qrImage.value = ''
    waReady.value = false
  } finally {
    loading.value = true
    stateKey.value = 'loading'
  }
}

function startStatusPolling() {
  if (statusTimer || !props.show) return

  statusTimer = setInterval(async () => {
    if (!props.show || document.visibilityState === 'hidden') return
    await checkWAStatus()
  }, 5000)
}

async function loadQRCode(force = false) {
  if (!props.show) return
  if (!force && (qrLoadInFlight || qrImage.value)) {
    return
  }

  qrLoadInFlight = true
  loading.value = true
  stateKey.value = 'loading'

  const controller = new AbortController()
  activeRequest = controller

  try {
    const response = await fetchWAQRCode(controller.signal)
    if (!props.show) return

    const nextQr = response?.qr || ''

    if (!nextQr) {
      qrImage.value = ''
      waReady.value = false
      loading.value = true
      stateKey.value = 'loading'
      return
    }

    qrImage.value = nextQr
    waReady.value = false
    loading.value = false
    stateKey.value = 'qr'
  } catch (error) {
    if (error?.name === 'AbortError') return
    qrImage.value = ''
    waReady.value = false
    loading.value = true
    stateKey.value = 'loading'
  } finally {
    qrLoadInFlight = false
    if (activeRequest === controller) {
      activeRequest = null
    }
  }
}
</script>

