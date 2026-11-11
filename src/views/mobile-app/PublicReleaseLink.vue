<template>
  <div v-if="isPublic" class="public-share" :class="{ 'on-showcase': showcase }">
    <button type="button" class="share-button" :disabled="disabled || copying" @click="copyLink">
      <SvgIcon :name="copied ? 'check' : 'link'" :size="15" aria-hidden="true" />
      {{ copying ? 'Menyalin…' : copied ? 'Link tersalin' : 'Salin link download' }}
    </button>
    <div v-if="manualLink" class="manual-share">
      <label>Link download APK<input ref="linkInput" :value="manualLink" readonly @focus="$event.target.select()" /></label>
      <p>Browser tidak mengizinkan penyalinan otomatis. Pilih dan salin tautan di atas.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onBeforeUnmount } from 'vue'
import api from '@/api'
import SvgIcon from '@/components/ui/SvgIcon.vue'
import { useToastStore } from '@/stores/toast'

const props = defineProps({ release: { type: Object, required: true }, currentReleaseId: { type: [Number, String], default: null }, disabled: Boolean, showcase: Boolean })
const toast = useToastStore()
const isPublic = computed(() => props.release.status === 'published' && Number(props.release.id) > 0 && Number(props.release.id) === Number(props.currentReleaseId))
const copying = ref(false), copied = ref(false), manualLink = ref(''), linkInput = ref(null)
let disposed = false, controller = null, feedbackTimer = null
async function copyLink() {
  if (!isPublic.value || props.disabled || copying.value) return
  copying.value = true; copied.value = false; manualLink.value = ''
  const id = props.release.id, code = props.release.version_code
  controller = new AbortController()
  try {
    // Use the configured public origin, which may differ from the admin host.
    const { data } = await api.get('/app/version', { params: { version_code: 0 }, signal: controller.signal })
    if (disposed || !isPublic.value || props.release.id !== id) return
    let url
    try { url = new URL(data.download_url) }
    catch { throw new Error('Rilis aktif berubah atau link belum tersedia. Muat ulang riwayat rilis.') }
    if (Number(data.latest_version_code) !== Number(code) || url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== `/api/app/download/${id}`) {
      throw new Error('Rilis aktif berubah atau link belum tersedia. Muat ulang riwayat rilis.')
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(url.href)
      if (disposed) return
      copied.value = true
      toast.success('Link download APK berhasil disalin. Siap dibagikan ke WhatsApp.')
      clearTimeout(feedbackTimer)
      feedbackTimer = setTimeout(() => { copied.value = false }, 2500)
    } catch {
      if (disposed) return
      manualLink.value = url.href
      await nextTick()
      linkInput.value?.focus(); linkInput.value?.select()
    }
  } catch (error) {
    if (!disposed) toast.error(error.response?.data?.message || (error.response ? 'Link download belum tersedia. Muat ulang halaman dan coba lagi.' : error.message?.startsWith('Rilis aktif') ? error.message : 'Tidak dapat mengambil link download. Periksa koneksi ke server lalu coba lagi.'))
  } finally { copying.value = false; controller = null }
}
onBeforeUnmount(() => { disposed = true; controller?.abort(); clearTimeout(feedbackTimer) })
</script>

<style scoped>
.public-share { min-width: 0; }
.share-button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 8px 11px; min-height: 36px; font-size: 11px; font-weight: 700; border: 1px solid var(--rs-line); border-radius: 10px; background: var(--rs-soft); color: var(--rs-green); transition: transform .2s, background .2s; }
.share-button:hover:not(:disabled) { transform: translateY(-2px); background: var(--rs-wash); }
.share-button:focus-visible { outline: 3px solid var(--rs-gold); outline-offset: 3px; }
.share-button:disabled { opacity: .5; cursor: not-allowed; }
.on-showcase { margin-top: 16px; }
.on-showcase .share-button { border-color: #ffffff30; background: #ffffff10; color: #e3ecb9; }
.on-showcase .share-button:hover { background: #ffffff20; }
.manual-share { max-width: 350px; margin-top: 10px; padding: 12px; border: 1px solid var(--rs-line); border-radius: 10px; background: var(--rs-paper); color: var(--rs-ink); }
.manual-share label { display: block; font-size: 11px; font-weight: 700; }
.manual-share input { display: block; width: 100%; min-width: 0; padding: 8px; margin-top: 7px; border: 1px solid var(--rs-line); border-radius: 7px; background: var(--rs-wash); color: var(--rs-ink); font-size: 11px; }
.manual-share p { font-size: 10px; margin: 8px 0 0; line-height: 1.6; }
@media(prefers-reduced-motion: reduce) { .share-button { transition: none; } .share-button:hover:not(:disabled) { transform: none; } }
</style>
