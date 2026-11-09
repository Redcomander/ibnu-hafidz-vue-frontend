<template>
  <div class="halaqoh-requests review-page">
    <header class="review-page-header">
      <div><p class="hq-eyebrow">Persetujuan anggota</p><h1 class="hq-title">Validasi Perubahan Halaqoh</h1><p class="hq-muted review-subtitle">Tinjau daftar santri dan berikan keputusan untuk pengajuan guru.</p></div>
      <button class="hq-button" :disabled="loading || reviewingId !== null" @click="loadRequests"><SvgIcon name="refresh" :size="15" />Refresh</button>
    </header>
    <div v-if="loading" class="review-empty" role="status">Memuat pengajuan...</div>
    <div v-else-if="!requests.length" class="review-empty"><SvgIcon name="clipboard-check" :size="28" /><h2>Belum ada pengajuan</h2><p>Pengajuan perubahan dari guru akan muncul di sini.</p></div>
    <div v-else class="review-list">
      <article v-for="request in requests" :key="request.id" class="review-card">
        <header class="review-card-header">
          <div><p class="hq-eyebrow">{{ requestTypeLabel(request.request_type) }}</p><h2 class="hq-title">{{ request.teacher?.name || 'Guru' }}</h2><p class="review-meta">Pengajuan #{{ request.id }} <span aria-hidden="true">&middot;</span> {{ request.requested_by?.name || 'Guru' }}<template v-if="requestDate(request.created_at)"> <span aria-hidden="true">&middot;</span> {{ requestDate(request.created_at) }}</template></p></div>
          <span class="hq-badge" :data-status="request.status">{{ requestStatusLabel(request.status) }}</span>
        </header>
        <div class="review-body">
          <div class="review-comparison">
            <div class="review-roster"><p class="review-label">Daftar sebelumnya <span>{{ request.previous_student_ids?.length || 0 }} santri</span></p><p>{{ formatStudentList(request.previous_student_ids || []) }}</p></div>
            <div class="review-roster review-roster--proposed"><p class="review-label">{{ request.request_type.startsWith('delete') ? 'Diajukan untuk dihapus' : 'Daftar yang diajukan' }} <span>{{ request.student_ids?.length || 0 }} santri</span></p><p>{{ formatStudentList(request.student_ids || []) }}</p></div>
          </div>
          <p class="review-helper"><span>Guru pembantu</span>{{ request.request_type.startsWith('delete') ? 'Tidak berubah' : request.helper_teacher_id ? getTeacherName(request.helper_teacher_id) : 'Tidak ada' }}</p>
          <div v-if="request.reason" class="review-note"><p class="review-label">{{ request.status === 'rejected' ? 'Alasan penolakan' : 'Catatan admin' }}</p><p>{{ request.reason }}</p></div>
          <div v-if="hasTransfers(request)" class="review-transfer"><SvgIcon name="info" :size="17" /><div><strong>Perpindahan antar-halaqoh</strong><p>Persetujuan ini juga memindahkan {{ transferSummary(request) }}.</p></div></div>
        </div>
        <footer v-if="request.status === 'pending'" class="review-actions"><p>Perubahan diterapkan setelah disetujui.</p><div><button :disabled="reviewingId !== null" @click="reject(request.id)" class="hq-button">Tolak</button><button :disabled="reviewingId !== null" @click="approve(request.id)" class="hq-button hq-button--primary"><SvgIcon :name="reviewingId === request.id ? 'clock' : 'check'" :size="15" />{{ reviewingId === request.id ? 'Memproses...' : hasTransfers(request) ? 'Setujui Perpindahan' : 'Setujui' }}</button></div></footer>
      </article>
    </div>
    <HalaqohRejectionModal :show="Boolean(rejectionTarget)" :request="rejectionTarget" :busy="reviewingId !== null" :error="rejectionError" @close="closeRejection" @submit="submitRejection" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHalaqohStore } from '@/stores/halaqoh'
import { useToastStore } from '@/stores/toast'
import api from '@/api'
import SvgIcon from '@/components/ui/SvgIcon.vue'
import HalaqohRejectionModal from './components/HalaqohRejectionModal.vue'
import { requestDate, requestStatusLabel, requestTypeLabel } from '@/utils/halaqohRequests'
import '@/assets/halaqoh-requests.css'

const store = useHalaqohStore()
const toast = useToastStore()
const requests = ref([])
const loading = ref(false)
const reviewingId = ref(null)
const rejectionTarget = ref(null)
const rejectionError = ref('')
const allTeachers = ref([])
const allStudents = ref([])

const normalizePaginatedItems = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload)) return payload
  return []
}

async function loadRequests() {
  loading.value = true
  try {
    const { data } = await store.fetchAssignmentChangeRequests()
    requests.value = data || []
    allStudents.value = requests.value.flatMap(request => [...(request.student_details || []), ...(request.previous_student_details || [])])
    if (!allTeachers.value.length) {
      const teachers = await api.get('/halaqoh/teacher-options')
      allTeachers.value = normalizePaginatedItems(teachers.data)
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.response?.data?.error || 'Gagal memuat permintaan validasi')
  } finally {
    loading.value = false
  }
}

function getTeacherName(id) {
  return allTeachers.value.find((teacher) => teacher.id === id)?.name || `#${id}`
}

function formatStudentList(studentIds) {
  const names = studentIds
    .map((id) => allStudents.value.find((student) => student.id === id)?.nama_lengkap || `#${id}`)
    .filter(Boolean)
  return names.length ? names.join(', ') : 'Tidak ada siswa'
}

async function approve(id) {
  if (reviewingId.value !== null) return
  reviewingId.value = id
  try {
    const request = requests.value.find(item => item.id === id)
    await store.approveAssignmentChangeRequest(id, { confirm_transfers: hasTransfers(request) })
    toast.success('Permintaan berhasil disetujui')
    await loadRequests()
  } catch (error) {
    toast.error(error.response?.data?.message || error.response?.data?.error || 'Gagal menyetujui permintaan')
  } finally {
    reviewingId.value = null
  }
}

function hasTransfers(request) {
  return request && ['create', 'update'].includes(request.request_type) && Object.values(request.student_owner_snapshot || {}).some(owner => Number(owner) !== 0 && Number(owner) !== Number(request.target_teacher_id || request.teacher_id))
}

function transferSummary(request) {
  return (request.student_ids || []).filter(id => {
    const owner = Number(request.student_owner_snapshot?.[id] || 0)
    return owner && owner !== Number(request.target_teacher_id || request.teacher_id)
  }).map(id => `${formatStudentList([id])} (${getTeacherName(Number(request.student_owner_snapshot[id]))})`).join(', ')
}

function reject(id) {
  if (reviewingId.value !== null) return
  rejectionError.value = ''
  rejectionTarget.value = requests.value.find(request => request.id === id) || null
}

function closeRejection() {
  if (reviewingId.value !== null) return
  rejectionTarget.value = null
  rejectionError.value = ''
}

async function submitRejection(reason) {
  if (!rejectionTarget.value || reviewingId.value !== null) return
  if (!reason.trim()) { rejectionError.value = 'Isi alasan penolakan terlebih dahulu.'; return }
  reviewingId.value = rejectionTarget.value.id
  rejectionError.value = ''
  try {
    await store.rejectAssignmentChangeRequest(rejectionTarget.value.id, { reason: reason.trim() })
    rejectionTarget.value = null
    toast.success('Pengajuan ditolak. Catatan telah dikirim kepada guru.')
    await loadRequests()
  } catch (error) {
    rejectionError.value = error.response?.data?.message || 'Pengajuan belum berhasil ditolak. Silakan coba lagi.'
  } finally {
    reviewingId.value = null
  }
}

onMounted(loadRequests)
</script>

<style scoped>
.review-page { max-width: 1080px; margin: 0 auto; }
.review-page-header { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 28px; }
.review-page-header .hq-title { font-size: 26px; }
.review-subtitle { margin: 8px 0 0; font-size: 13px; }
.review-empty { padding: 52px 24px; text-align: center; border: 1px dashed var(--hq-line); border-radius: 16px; color: var(--hq-muted); background: var(--hq-bg); }
.review-empty h2 { margin-top: 12px; color: var(--hq-text); font-size: 16px; font-weight: 700; }
.review-empty p { margin-top: 5px; font-size: 12px; }
.review-list { display: grid; gap: 18px; }
.review-card { overflow: hidden; background: var(--hq-bg); border: 1px solid var(--hq-line); border-radius: 16px; box-shadow: 0 6px 22px #071b3108; }
.review-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; padding: 22px 24px; border-bottom: 1px solid var(--hq-line); }
.review-meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0 0; color: var(--hq-muted); font-size: 11px; font-variant-numeric: tabular-nums; }
.review-body { padding: 22px 24px; }
.review-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.review-roster { min-width: 0; padding: 15px 17px; border: 1px solid var(--hq-line); border-radius: 11px; background: var(--hq-soft); }
.review-roster--proposed { border-top: 2px solid var(--hq-green); }
.review-label { margin: 0 0 8px; color: var(--hq-muted); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.review-label span { display: block; margin-top: 3px; font-size: 10px; font-weight: 500; letter-spacing: normal; text-transform: none; }
.review-roster > p:last-child, .review-note > p:last-child { margin: 0; color: var(--hq-text); font-size: 12px; line-height: 1.9; overflow-wrap: anywhere; white-space: pre-wrap; }
.review-helper { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; margin: 18px 0 0; font-size: 12px; }
.review-helper span { color: var(--hq-muted); }
.review-note { margin-top: 18px; padding: 14px 16px; border-left: 2px solid var(--hq-red); border-radius: 0 9px 9px 0; background: var(--hq-soft); }
.review-transfer { display: flex; align-items: flex-start; gap: 9px; margin-top: 18px; padding: 13px 15px; border-radius: 9px; color: var(--hq-amber); background: var(--hq-amber-bg); font-size: 12px; }
.review-transfer svg { margin-top: 2px; }
.review-transfer p { margin: 3px 0 0; overflow-wrap: anywhere; }
.review-actions { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 16px 24px; border-top: 1px solid var(--hq-line); background: var(--hq-soft); }
.review-actions > p { margin: 0; color: var(--hq-muted); font-size: 11px; }
.review-actions > div { display: flex; gap: 9px; }
@media (max-width: 640px) { .review-page-header { align-items: flex-start; margin-bottom: 20px; } .review-page-header .hq-title { font-size: 21px; } .review-card-header, .review-body { padding: 18px; } .review-card-header { flex-wrap: wrap; } .review-comparison { grid-template-columns: 1fr; } .review-actions { padding: 15px 18px; flex-direction: column; align-items: stretch; } .review-actions > div .hq-button { flex: 1; } }
</style>
