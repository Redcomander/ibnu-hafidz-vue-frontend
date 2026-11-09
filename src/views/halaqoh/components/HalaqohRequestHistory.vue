<template>
  <section class="halaqoh-requests request-history" aria-labelledby="halaqoh-history-title">
    <details class="history-disclosure" open>
    <summary class="history-header" aria-labelledby="halaqoh-history-title">
      <div class="history-heading">
        <span class="history-mark"><SvgIcon name="clipboard-check" :size="21" aria-hidden="true" /></span>
        <div>
          <p class="hq-eyebrow">Riwayat pengajuan</p>
          <h2 id="halaqoh-history-title" class="hq-title">Pengajuan Perubahan Halaqoh</h2>
          <p class="history-description">Pantau pembaruan anggota dan tanggapan admin.</p>
        </div>
      </div>
      <span class="history-header-actions">
        <span class="history-count">{{ requests.length }} pengajuan</span>
        <SvgIcon class="history-chevron" name="chevron-down" :size="20" aria-hidden="true" />
      </span>
    </summary>
    <ol class="history-list">
      <li v-for="request in visibleRequests" :key="request.id" class="history-row" :data-status="request.status">
        <span class="history-status-icon" aria-hidden="true"><SvgIcon :name="request.status === 'approved' ? 'check' : request.status === 'rejected' ? 'x' : 'clock'" :size="16" /></span>
        <div class="history-content">
          <div class="history-row-heading">
            <div>
              <h3 class="history-row-title">{{ requestTypeLabel(request.request_type) }}</h3>
              <div class="history-meta"><span>Pengajuan #{{ request.id }}</span><template v-if="requestDate(request.created_at)"><span aria-hidden="true">&middot;</span><time :datetime="request.created_at">{{ requestDate(request.created_at) }}</time></template></div>
            </div>
            <span class="hq-badge" :data-status="request.status">{{ requestStatusLabel(request.status) }}</span>
          </div>
          <div v-if="request.reason" class="history-note">
            <span class="history-note-label">{{ request.status === 'rejected' ? 'Alasan penolakan' : 'Catatan admin' }}</span>
            <p>{{ request.reason }}</p>
          </div>
        </div>
      </li>
    </ol>
    <footer v-if="pendingCount || requests.length > 5" class="history-footer">
      <p v-if="pendingCount"><SvgIcon name="clock" :size="14" aria-hidden="true" /> {{ pendingCount }} pengajuan menunggu. Perubahan berlaku setelah disetujui admin.</p>
      <button v-if="requests.length > 5" type="button" :aria-expanded="expanded" @click="expanded = !expanded">{{ expanded ? 'Tampilkan lebih sedikit' : 'Lihat semua pengajuan' }}</button>
    </footer>
    </details>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import SvgIcon from '@/components/ui/SvgIcon.vue'
import { requestDate, requestStatusLabel, requestTypeLabel } from '@/utils/halaqohRequests'
import '@/assets/halaqoh-requests.css'

const props = defineProps({ requests: { type: Array, default: () => [] } })
const expanded = ref(false)
const visibleRequests = computed(() => expanded.value ? props.requests : props.requests.slice(0, 5))
const pendingCount = computed(() => props.requests.filter(request => request.status === 'pending').length)
</script>

<style scoped>
.request-history { overflow: hidden; background: var(--hq-bg); border: 1px solid var(--hq-line); border-radius: 18px; box-shadow: 0 8px 28px #071b3110; }
.history-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px; background: radial-gradient(ellipse at top right, #159b7d0c, transparent 65%); }
.history-header { cursor: pointer; list-style: none; }
.history-header::-webkit-details-marker { display: none; }
.history-header:focus-visible { outline: 2px solid var(--hq-green); outline-offset: -4px; border-radius: 16px; }
.history-header-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; color: var(--hq-muted); }
.history-chevron { transition: transform .2s ease; }
.history-disclosure[open] .history-chevron { transform: rotate(180deg); }
@media (prefers-reduced-motion: reduce) { .history-chevron { transition: none; } }
.history-heading { display: flex; align-items: center; gap: 14px; min-width: 0; }
.history-mark { display: grid; place-items: center; width: 46px; height: 46px; flex-shrink: 0; border: 1px solid var(--hq-line); border-radius: 14px; color: var(--hq-green); background: var(--hq-green-bg); }
.history-description { margin: 6px 0 0; color: var(--hq-muted); font-size: 12px; }
.history-count { flex-shrink: 0; padding: 5px 10px; border: 1px solid var(--hq-line); border-radius: 8px; color: var(--hq-muted); font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; }
.history-list { margin: 0; padding: 0 24px; list-style: none; }
.history-row { display: flex; gap: 13px; padding: 20px 0; border-top: 1px solid var(--hq-line); }
.history-status-icon { display: grid; place-items: center; flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; background: var(--hq-soft); color: var(--hq-muted); }
.history-row[data-status="approved"] .history-status-icon { color: var(--hq-green); background: var(--hq-green-bg); }
.history-row[data-status="rejected"] .history-status-icon { color: var(--hq-red); background: var(--hq-red-bg); }
.history-row[data-status="pending"] .history-status-icon { color: var(--hq-amber); background: var(--hq-amber-bg); }
.history-content { flex: 1; min-width: 0; }
.history-row-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.history-row-title { margin: 0; color: var(--hq-text); font-size: 13px; font-weight: 700; letter-spacing: -.015em; line-height: 1.6; }
.history-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin-top: 3px; color: var(--hq-muted); font-size: 11px; font-variant-numeric: tabular-nums; }
.history-note { margin-top: 12px; padding: 12px 14px; border-left: 2px solid var(--hq-line); border-radius: 0 8px 8px 0; background: var(--hq-soft); }
.history-note-label { display: block; margin-bottom: 3px; color: var(--hq-muted); font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.history-note p { margin: 0; color: var(--hq-text); font-size: 12px; line-height: 1.8; white-space: pre-wrap; overflow-wrap: anywhere; }
.history-footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 24px; border-top: 1px solid var(--hq-line); background: var(--hq-soft); }
.history-footer p { display: flex; align-items: flex-start; gap: 7px; margin: 0; color: var(--hq-muted); font-size: 11px; }
.history-footer svg { margin-top: 2px; }
.history-footer button { color: var(--hq-green); font-size: 11px; font-weight: 800; }
@media (max-width: 640px) { .history-header { padding: 20px 16px; align-items: flex-start; } .history-count { display: none; } .history-heading { gap: 10px; } .hq-title { font-size: 16px; } .history-mark { width: 38px; height: 38px; border-radius: 11px; } .history-list { padding: 0 16px; } .history-row-heading { flex-direction: column; gap: 9px; } .history-row { gap: 10px; } .history-footer { padding: 14px 16px; } }
</style>
