<template>
  <Teleport to="body">
    <dialog ref="dialog" class="halaqoh-requests rejection-dialog" aria-labelledby="halaqoh-rejection-title" aria-describedby="halaqoh-rejection-description" @cancel.prevent="requestClose" @click="onBackdrop">
      <form novalidate @submit.prevent="submit">
        <header class="rejection-header">
          <span class="rejection-mark"><SvgIcon name="x-circle" :size="22" aria-hidden="true" /></span>
          <button type="button" class="rejection-close" aria-label="Tutup dialog" :disabled="busy" @click="requestClose"><SvgIcon name="x" :size="19" /></button>
          <p class="hq-eyebrow">Tinjauan pengajuan</p>
          <h2 id="halaqoh-rejection-title" class="hq-title">Tolak pengajuan</h2>
          <p id="halaqoh-rejection-description" class="rejection-description">Beri catatan yang jelas agar guru dapat memperbaiki pengajuannya.</p>
        </header>
        <div class="rejection-body">
          <div class="rejection-context"><span>Pengajuan #{{ request?.id }}</span><strong>{{ request?.teacher?.name || 'Guru' }}</strong></div>
          <label for="halaqoh-rejection-reason" class="rejection-label">Alasan penolakan <span aria-hidden="true">*</span></label>
          <textarea id="halaqoh-rejection-reason" ref="textarea" v-model="reason" autofocus rows="5" maxlength="2000" aria-required="true" :aria-invalid="Boolean(validationError || error)" aria-describedby="rejection-help rejection-error" placeholder="Jelaskan bagian yang perlu diperbaiki..." :disabled="busy" @input="validationError = ''"></textarea>
          <div class="rejection-help"><p id="rejection-help">Catatan ini akan terlihat oleh guru yang mengajukan.</p><span>{{ reason.length }}/2000</span></div>
          <p v-if="validationError || error" id="rejection-error" class="rejection-error" role="alert">{{ validationError || error }}</p>
        </div>
        <footer class="rejection-footer">
          <button type="button" class="hq-button" :disabled="busy" @click="requestClose">Kembali</button>
          <button type="submit" class="hq-button hq-button--danger" :disabled="busy || !reason.trim()"><SvgIcon :name="busy ? 'clock' : 'x-circle'" :size="15" />{{ busy ? 'Memproses...' : 'Tolak pengajuan' }}</button>
        </footer>
      </form>
    </dialog>
  </Teleport>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SvgIcon from '@/components/ui/SvgIcon.vue'
import '@/assets/halaqoh-requests.css'

const props = defineProps({ show: Boolean, request: { type: Object, default: null }, busy: Boolean, error: { type: String, default: '' } })
const emit = defineEmits(['close', 'submit'])
const dialog = ref(null)
const textarea = ref(null)
const reason = ref('')
const validationError = ref('')
let previousFocus = null

function syncDialog() {
  if (!dialog.value) return
  if (props.show && !dialog.value.open) {
    previousFocus = document.activeElement
    reason.value = ''
    validationError.value = ''
    dialog.value.showModal()
    nextTick(() => textarea.value?.focus())
  } else if (!props.show && dialog.value.open) {
    dialog.value.close()
    if (previousFocus?.isConnected) previousFocus.focus()
  }
}
function requestClose() { if (!props.busy) emit('close') }
function onBackdrop(event) {
  if (event.target !== dialog.value) return
  const box = dialog.value.getBoundingClientRect()
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) requestClose()
}
function submit() {
  if (props.busy) return
  if (!reason.value.trim()) { validationError.value = 'Isi alasan penolakan terlebih dahulu.'; textarea.value?.focus(); return }
  emit('submit', reason.value.trim())
}
watch(() => props.show, syncDialog, { flush: 'post' })
onMounted(syncDialog)
onBeforeUnmount(() => { if (dialog.value?.open) dialog.value.close() })
</script>

<style scoped>
.rejection-dialog { position: fixed; inset: 0; width: min(510px, calc(100% - 32px)); max-height: calc(100dvh - 32px); margin: auto; padding: 0; overflow: auto; border: 1px solid var(--hq-line); border-radius: 20px; background: var(--hq-bg); color: var(--hq-text); box-shadow: 0 28px 100px #0005; }
.rejection-dialog::backdrop { background: #030b19b8; backdrop-filter: blur(5px); }
.rejection-header { position: relative; padding: 28px 28px 0; }
.rejection-mark { display: grid; place-items: center; width: 44px; height: 44px; margin-bottom: 18px; border-radius: 13px; background: var(--hq-red-bg); color: var(--hq-red); }
.rejection-close { position: absolute; top: 22px; right: 22px; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 8px; color: var(--hq-muted); }
.rejection-close:hover { background: var(--hq-soft); }
.rejection-description { margin: 9px 0 0; max-width: 360px; color: var(--hq-muted); font-size: 13px; line-height: 1.8; }
.rejection-body { padding: 22px 28px 26px; }
.rejection-context { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; padding: 11px 13px; border: 1px solid var(--hq-line); border-radius: 9px; background: var(--hq-soft); font-size: 11px; }
.rejection-context span { color: var(--hq-muted); font-variant-numeric: tabular-nums; }
.rejection-context strong { color: var(--hq-text); font-weight: 700; }
.rejection-label { display: block; margin-bottom: 8px; color: var(--hq-text); font-size: 12px; font-weight: 700; }
.rejection-label span { color: var(--hq-red); }
.rejection-dialog textarea { display: block; box-sizing: border-box; width: 100%; min-height: 130px; padding: 13px 14px; resize: vertical; border: 1px solid var(--hq-line); border-radius: 10px; background: var(--hq-bg); color: var(--hq-text); font: inherit; font-size: 13px; line-height: 1.8; }
.rejection-dialog textarea::placeholder { color: var(--hq-muted); opacity: .75; }
.rejection-dialog textarea[aria-invalid="true"] { border-color: var(--hq-red); }
.rejection-help { display: flex; justify-content: space-between; gap: 14px; margin-top: 8px; color: var(--hq-muted); font-size: 10px; }
.rejection-help p { margin: 0; }
.rejection-help span { flex-shrink: 0; font-variant-numeric: tabular-nums; }
.rejection-error { margin: 12px 0 0; color: var(--hq-red); font-size: 12px; }
.rejection-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 18px 28px; border-top: 1px solid var(--hq-line); background: var(--hq-soft); }
@media (max-width: 480px) { .rejection-header { padding: 24px 20px 0; } .rejection-body { padding: 20px; } .rejection-footer { padding: 16px 20px; } .rejection-footer .hq-button { flex: 1; } }
</style>
