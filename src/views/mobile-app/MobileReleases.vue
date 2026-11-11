<template>
  <div class="release-studio">
    <div :inert="modalOpen || undefined">
      <header class="studio-header reveal">
        <div><p class="eyebrow"><span class="tiny-orbit" /> PUSAT DISTRIBUSI ANDROID</p><h1>Rilis Aplikasi Mobile</h1><p class="page-description">Pembaruan yang terencana. Pengalaman yang semakin baik.</p></div>
        <button class="studio-button button-surface" :disabled="loading || busy" @click="load"><SvgIcon name="refresh" :size="16" :class="{ spinning: loading }" aria-hidden="true" />Muat ulang</button>
      </header>
      <Transition name="notice"><div v-if="error" role="alert" class="studio-notice notice-error"><SvgIcon name="alert-triangle" :size="20" aria-hidden="true" /><span>{{ error }}</span></div></Transition>

      <section class="release-showcase reveal" aria-labelledby="active-release-title">
        <div class="showcase-orbit orbit-one" aria-hidden="true" /><div class="showcase-orbit orbit-two" aria-hidden="true" />
        <div class="showcase-copy">
          <span class="live-label"><span :class="{ 'is-live': active }" />{{ active ? 'TERSEDIA UNTUK PENGGUNA' : 'SIAP UNTUK RILIS PERTAMA' }}</span>
          <h2 id="active-release-title">{{ active ? 'Versi terbaru.\nLangkah baru.' : 'Pembaruan besar\ndimulai di sini.' }}</h2>
          <p>{{ active ? 'Rilis aktif ini tersedia untuk diunduh dan diperiksa langsung dari aplikasi pengguna.' : 'Unggah APK, periksa detailnya, lalu tentukan kapan pembaruan siap dibagikan.' }}</p>
          <div class="showcase-version"><strong>{{ active ? `v${active.version_name}` : 'Belum ada rilis aktif' }}</strong><span v-if="active">Build {{ active.version_code }}</span></div>
          <div class="showcase-meta"><span><SvgIcon name="calendar" :size="15" aria-hidden="true" />{{ active ? date(active.published_at) : 'Setiap unggahan dimulai sebagai draft' }}</span><span v-if="active"><SvgIcon name="database" :size="15" aria-hidden="true" />{{ size(active.file_size) }}</span></div>
          <button v-if="active" class="showcase-link" @click="details = active">Lihat catatan rilis <SvgIcon name="arrow-up-right" :size="17" aria-hidden="true" /></button>
        </div>
        <div class="showcase-visual" aria-hidden="true">
          <div class="floating-seal"><SvgIcon name="check-circle" :size="18" />{{ active ? 'Tanda tangan terverifikasi' : 'Distribusi terverifikasi' }}</div>
          <div class="phone-model"><div class="phone-camera" /><div class="phone-screen"><img src="/favicon.png" alt="" class="phone-logo" @error="hideBrokenLogo" /><span class="phone-brand">IBNU HAFIDZ</span><div class="phone-app-icon"><SvgIcon name="download" :size="27" /></div><strong>{{ active ? `Versi ${active.version_name}` : 'Siap bertumbuh' }}</strong><p>{{ active ? 'Pengalaman belajar,\nselangkah lebih baik.' : 'Satu pembaruan,\nbanyak kemungkinan.' }}</p><div class="phone-line"><i /><i /><i /></div><div class="phone-download">{{ active ? 'Pembaruan tersedia' : 'Rilis berikutnya menanti' }}<SvgIcon name="arrow-right" :size="13" /></div></div></div>
          <span class="visual-caption">DARI RUANG KERJA ANDA, KE SETIAP PERANGKAT.</span>
        </div>
      </section>

      <section class="studio-metrics" aria-label="Ringkasan distribusi">
        <article class="metric-card reveal" style="--delay: 70ms"><span class="metric-icon"><SvgIcon name="folder" :size="21" aria-hidden="true" /></span><div><p>Total rilis</p><strong>{{ total }} <small>versi tersimpan</small></strong><span>Draft, publikasi, dan arsip</span></div></article>
        <article class="metric-card reveal" style="--delay: 120ms"><span class="metric-icon gold"><SvgIcon name="settings" :size="21" aria-hidden="true" /></span><div><p>Kebijakan versi minimum</p><strong>{{ policy.minimum_supported_version_code ? `Build ${policy.minimum_supported_version_code}` : 'Semua versi' }}</strong><button v-if="policy.current_release_id" class="text-action" :disabled="busy" @click="openPolicy">Ubah kebijakan minimum <SvgIcon name="arrow-right" :size="13" aria-hidden="true" /></button><span v-else>Pembaruan opsional hingga ditentukan</span></div></article>
        <article class="metric-card reveal" style="--delay: 170ms"><span class="metric-icon" :class="{ gold: !ready }"><SvgIcon :name="ready ? 'check-circle' : 'warning'" :size="21" aria-hidden="true" /></span><div><p>Validasi server</p><strong class="readiness-title">{{ loading && !rows.length ? 'Memeriksa kesiapan…' : ready ? 'Siap memeriksa APK' : 'Konfigurasi diperlukan' }}</strong><span>{{ ready ? 'Package, sertifikat, dan integritas APK' : readiness || 'Periksa konfigurasi alat validasi server.' }}</span></div></article>
      </section>

      <div class="studio-workspace">
        <section class="upload-panel studio-panel reveal" style="--delay: 210ms" aria-labelledby="upload-title">
          <div class="panel-heading"><div><p class="eyebrow">RILIS BERIKUTNYA</p><h2 id="upload-title">Bawa perubahan baru.</h2><p>Siapkan APK terbaik Anda. Publikasikan saat semuanya siap.</p></div><span class="heading-icon"><SvgIcon name="upload" :size="23" aria-hidden="true" /></span></div>
          <ol class="release-steps" aria-label="Tahapan rilis"><li class="step-current"><span>01</span> Unggah</li><li><span>02</span> Tinjau draft</li><li><span>03</span> Publikasikan</li></ol>
          <form @submit.prevent="upload">
            <div class="dropzone" :class="{ 'is-dragging': dragging, 'has-file': file, 'is-disabled': busy || !ready }" role="button" :tabindex="busy || !ready ? -1 : 0" :aria-disabled="busy || !ready" aria-label="Pilih APK atau seret ke sini" @click="chooseFile" @keydown.enter.prevent="chooseFile" @keydown.space.prevent="chooseFile" @dragover.prevent @dragenter.prevent="dragEnter" @dragleave.prevent="dragLeave" @drop.prevent="dropFile">
              <input ref="fileInput" class="sr-only" type="file" tabindex="-1" aria-label="Berkas APK" accept=".apk,application/vnd.android.package-archive" :disabled="busy || !ready" @click.stop @change="selectFile" />
              <Transition name="file-choice" mode="out-in"><div :key="file ? 'selected' : 'empty'" class="dropzone-content"><span class="upload-glyph"><SvgIcon :name="file ? 'check-circle' : 'upload'" :size="28" aria-hidden="true" /></span><strong>{{ file ? file.name : dragging ? 'Lepaskan APK di sini' : 'Tarik APK ke sini' }}</strong><p>{{ file ? `${size(file.size)} · Siap diunggah sebagai draft` : 'atau klik untuk memilih berkas dari perangkat' }}</p><span class="file-type">{{ file ? 'Ganti berkas' : `.APK · Maksimal ${size(maxSize)}` }}</span></div></Transition>
            </div>
            <div v-if="file && !uploading" class="selected-file-footer"><span><SvgIcon name="info" :size="14" aria-hidden="true" /> Metadata akan dibaca dari APK.</span><button type="button" class="text-action" :disabled="busy" @click="clearFile">Hapus pilihan</button></div>
            <details class="metadata-disclosure"><summary>Sesuaikan metadata versi <span>Opsional <SvgIcon name="chevron-down" :size="15" aria-hidden="true" /></span></summary><div class="metadata-fields"><label>Nama versi (opsional)<input v-model.trim="form.version_name" maxlength="80" :disabled="busy" placeholder="Contoh: 1.0.1" /></label><label>Build number (opsional)<input v-model="form.version_code" type="number" min="1" max="2100000000" :disabled="busy" placeholder="Contoh: 13" /></label><p>Biarkan kosong untuk menggunakan versi dari APK. Jika diisi, nilainya harus cocok.</p></div></details>
            <label class="notes-field"><span>Catatan rilis <small>Yang baru untuk pengguna</small></span><textarea v-model="form.changelog" rows="4" maxlength="10000" :disabled="busy" placeholder="Ceritakan fitur baru dan perbaikan pada versi ini…" /><span class="field-footer">Tampil di aplikasi sebelum pengguna memperbarui.<span>{{ form.changelog.length.toLocaleString('id-ID') }}/10.000</span></span></label>
            <label class="policy-toggle"><input v-model="form.force_update" type="checkbox" :disabled="busy" /><span class="toggle-track" aria-hidden="true"><i /></span><span><strong>Usulkan pembaruan wajib</strong><small>Batas versi dikonfirmasi kembali saat publikasi.</small></span><SvgIcon name="info" :size="17" aria-hidden="true" /></label>
            <Transition name="notice"><div v-if="uploading" class="upload-progress" role="status" aria-live="polite"><div><span><SvgIcon name="spinner" :size="15" class="spinning" aria-hidden="true" />{{ progress === 100 ? 'Memeriksa APK di server…' : 'Mengunggah berkas…' }}</span><strong>{{ progress }}% <span class="upload-elapsed">{{ uploadDuration(elapsedMs) }}</span></strong></div><progress :value="progress" max="100" aria-label="Progres unggahan APK" /><p>{{ progress === 100 ? 'Tunggu hingga package, versi, sertifikat, ukuran, dan SHA-256 selesai diperiksa.' : 'Anda dapat membatalkan unggahan selama proses berlangsung.' }}</p></div></Transition>
            <Transition name="notice"><div v-if="uploadError" class="upload-error-card" role="alert"><div><SvgIcon name="alert-triangle" :size="19" aria-hidden="true" /><strong>{{ uploadError.title }}</strong></div><p>{{ uploadError.message }}</p><p class="upload-error-detail">{{ uploadError.detail }}</p><p>{{ uploadError.advice }}</p><button type="button" class="text-action" :disabled="busy || loading" @click="load">Muat ulang riwayat rilis <SvgIcon name="refresh" :size="14" aria-hidden="true" /></button></div></Transition>
            <div class="upload-actions"><button type="submit" class="studio-button button-primary" :disabled="busy || !ready || !file"><SvgIcon :name="uploading ? 'spinner' : 'upload'" :size="17" :class="{ spinning: uploading }" aria-hidden="true" />{{ uploading ? 'Mengunggah / memeriksa…' : 'Unggah sebagai draft' }}<SvgIcon v-if="!uploading" name="arrow-right" :size="16" aria-hidden="true" /></button><button v-if="uploading" type="button" class="studio-button button-surface" @click="abort?.abort()">Batalkan unggahan</button></div>
            <p class="upload-footnote"><SvgIcon name="check-circle" :size="14" aria-hidden="true" /> Unggahan tidak langsung tersedia untuk pengguna.</p>
          </form>
        </section>
        <aside class="studio-sidebar">
          <section class="validation-panel studio-panel reveal" style="--delay: 260ms"><p class="eyebrow">SEBELUM TERBANG</p><h2>Pemeriksaan berlapis.</h2><p>Setiap APK melewati validasi server sebelum bisa dipublikasikan.</p><ul><li v-for="(check, index) in validationChecks" :key="check.title" :style="{ '--delay': `${index * 45}ms` }"><span><SvgIcon :name="check.icon" :size="17" aria-hidden="true" /></span><div><strong>{{ check.title }}</strong><p>{{ check.description }}</p></div><SvgIcon name="check" :size="15" class="check-hint" aria-hidden="true" /></li></ul><div class="validation-caption"><SvgIcon name="info" :size="16" aria-hidden="true" />{{ ready ? 'Alat validasi tersedia. Hasil pemeriksaan tiap berkas diberikan setelah unggah.' : readiness || 'Unggahan tersedia setelah konfigurasi server lengkap.' }}</div></section>
          <section class="release-tip reveal" style="--delay: 300ms"><span class="tip-symbol" aria-hidden="true">✦</span><p class="eyebrow">RILIS DENGAN TENANG</p><h2>Mulai dari satu perangkat.</h2><p>Publikasikan sebagai pembaruan opsional, uji instalasi, lalu atur versi minimum saat siap.</p><span>Build minimum <strong>0</strong> = pembaruan opsional.</span></section>
        </aside>
      </div>
      <section class="history-panel studio-panel reveal" style="--delay: 330ms" aria-labelledby="history-title" :aria-busy="loading">
        <header class="history-heading"><div><p class="eyebrow">JEJAK PEMBARUAN</p><h2 id="history-title">Setiap versi punya cerita.</h2><p>Riwayat rilis <span class="count-pill">{{ total }}</span></p></div><div class="history-key"><span class="status-dot published" /> Publikasi <span class="status-dot draft" /> Draft <span class="status-dot archived" /> Arsip</div></header>
        <div v-if="loading" class="release-skeletons" role="status" aria-label="Memuat rilis"><div v-for="i in 3" :key="i" class="skeleton-row"><i /><span /><span /></div><span class="sr-only">Memuat rilis…</span></div>
        <div v-else-if="!rows.length" class="empty-releases"><span><SvgIcon name="folder" :size="30" aria-hidden="true" /></span><h3>Ruang untuk cerita pertama.</h3><p>Belum ada rilis. Unggah APK pertama Anda untuk memulai.</p><button class="studio-button button-surface" :disabled="!ready || busy" @click="focusUpload">Siapkan rilis pertama <SvgIcon name="arrow-up-right" :size="16" aria-hidden="true" /></button></div>
        <TransitionGroup v-else name="release-list" tag="div" class="release-list"><article v-for="(release, index) in rows" :key="release.id" class="release-row" :style="{ '--delay': `${Math.min(index, 6) * 40}ms` }">
          <div class="release-version-icon" :class="release.status"><SvgIcon :name="release.status === 'published' ? 'smartphone' : release.status === 'draft' ? 'document-text' : 'folder'" :size="24" aria-hidden="true" /></div>
          <div class="release-row-main"><div class="release-row-title"><h3>v{{ release.version_name }}</h3><span class="status-badge" :class="release.status"><span />{{ status(release.status) }}</span></div><p class="release-build">Build {{ release.version_code }} <span>·</span> {{ size(release.file_size) }}</p><p class="release-note">{{ release.changelog || 'Belum ada catatan untuk versi ini.' }}</p><div class="release-row-meta"><span><SvgIcon name="user" :size="13" aria-hidden="true" />{{ release.uploader?.name || `#${release.created_by}` }}</span><span :title="`Diunggah ${date(release.created_at)}`"><SvgIcon name="calendar" :size="13" aria-hidden="true" />{{ date(release.created_at) }}</span><span v-if="release.published_at">Publikasi {{ date(release.published_at) }}</span></div></div>
          <div class="release-row-actions"><button v-if="release.status === 'draft' && release.version_code > (policy.highest_version_code || 0)" class="studio-button button-primary button-small" :disabled="busy || !ready" @click="openPublish(release)"><SvgIcon name="arrow-up-right" :size="15" aria-hidden="true" />Publikasikan</button><div class="secondary-actions"><button :disabled="busy" @click="details = release">Detail</button><button :disabled="busy" @click="download(release)"><SvgIcon name="download" :size="14" aria-hidden="true" />Unduh APK</button><button v-if="release.status !== 'archived'" class="archive-action" :disabled="busy" @click="archiving = release">Arsipkan</button></div></div>
        </article></TransitionGroup>
        <footer class="history-pagination"><span>{{ total ? `${(page - 1) * 20 + 1}–${Math.min(page * 20, total)} dari ${total} rilis` : '0 rilis' }}</span><div><button class="pagination-button" aria-label="Sebelumnya" :disabled="page <= 1 || loading || busy" @click="changePage(-1)"><SvgIcon name="chevron-left" :size="17" aria-hidden="true" /></button><span>Halaman {{ page }}</span><button class="pagination-button" aria-label="Berikutnya" :disabled="page * 20 >= total || loading || busy" @click="changePage(1)"><SvgIcon name="chevron-right" :size="17" aria-hidden="true" /></button></div></footer>
      </section>
      <p class="studio-footer"><SvgIcon name="smartphone" :size="14" aria-hidden="true" /> IBNU HAFIDZ <span>·</span> Pembaruan terkelola, pengalaman terjaga.</p>
    </div>
    <Teleport to="body"><Transition name="studio-modal"><div v-if="modalOpen" class="release-studio-modal" @click.self="closeModal" @keydown="handleDialogKey">
      <section ref="dialog" role="dialog" aria-modal="true" :aria-labelledby="details ? 'details-title' : archiving ? 'archive-title' : 'release-dialog-title'" tabindex="-1" class="studio-dialog" :class="{ 'details-dialog': details }">
        <button class="dialog-close" aria-label="Tutup dialog" :disabled="busy" @click="closeModal"><SvgIcon name="x" :size="20" aria-hidden="true" /></button>
        <template v-if="details"><div class="dialog-emblem"><SvgIcon name="smartphone" :size="26" aria-hidden="true" /></div><p class="eyebrow">RINCIAN RILIS</p><h2 id="details-title">v{{ details.version_name }} <span class="dialog-build">Build {{ details.version_code }}</span></h2><span class="status-badge" :class="details.status"><span />{{ status(details.status) }}</span><div class="detail-facts"><div><span>Ukuran APK</span><strong>{{ size(details.file_size) }}</strong></div><div><span>Pengunggah</span><strong>{{ details.uploader?.name || `#${details.created_by}` }}</strong></div><div><span>Diunggah</span><strong>{{ date(details.created_at) }}</strong></div><div><span>Dipublikasikan</span><strong>{{ date(details.published_at) }}</strong></div></div><h3 class="dialog-section-label">Catatan rilis</h3><p class="detail-changelog">{{ details.changelog || 'Tidak ada catatan rilis.' }}</p><details class="metadata-disclosure integrity-details"><summary>Identitas &amp; integritas APK <SvgIcon name="chevron-down" :size="16" aria-hidden="true" /></summary><dl><dt>Package aplikasi</dt><dd>{{ details.package_name }}</dd><dt>SHA-256 APK</dt><dd>{{ details.sha256 }}</dd><dt>Sertifikat penandatangan</dt><dd>{{ details.signer_sha256 }}</dd></dl></details><div class="dialog-actions"><button class="studio-button button-surface" :disabled="busy" @click="closeModal">Tutup</button><button class="studio-button button-primary" :disabled="busy" @click="download(details)"><SvgIcon name="download" :size="16" aria-hidden="true" />Unduh APK</button></div></template>
        <template v-else-if="archiving"><div class="dialog-emblem warning-emblem"><SvgIcon name="folder" :size="26" aria-hidden="true" /></div><p class="eyebrow">SIMPAN DALAM RIWAYAT</p><h2 id="archive-title">Arsipkan v{{ archiving.version_name }}?</h2><p class="dialog-description">{{ archiving.status === 'published' ? 'Rilis aktif akan berhenti ditawarkan kepada pengguna sampai rilis baru dipublikasikan.' : 'Draft ini tidak akan tersedia untuk dipublikasikan.' }} Berkas APK dan riwayatnya tetap tersimpan.</p><div class="dialog-actions"><button class="studio-button button-surface" :disabled="busy" @click="closeModal">Batal</button><button class="studio-button button-danger" :disabled="busy" @click="archive">{{ busy ? 'Mengarsipkan…' : 'Konfirmasi arsip' }}</button></div></template>
        <form v-else @submit.prevent="confirmPolicy"><div class="dialog-emblem"><SvgIcon :name="publishing ? 'arrow-up-right' : 'settings'" :size="26" aria-hidden="true" /></div><p class="eyebrow">{{ publishing ? 'LANGKAH TERAKHIR' : 'KEBIJAKAN PEMBARUAN' }}</p><h2 id="release-dialog-title">{{ publishing ? `Publikasikan ${publishing.version_name} (${publishing.version_code})?` : 'Ubah versi minimum' }}</h2><p class="dialog-description">{{ publishing ? 'APK ini akan tersedia bagi pengguna. Rilis aktif sebelumnya akan masuk ke arsip.' : 'Menurunkan batas minimum memulihkan akses versi lama tanpa memasang APK versi lebih rendah.' }}</p><label class="minimum-field">Build minimum yang didukung<input v-model.number="minimum" type="number" min="0" :max="publishing?.version_code || active?.version_code" required :disabled="busy" /><small>Gunakan 0 untuk pembaruan opsional.</small></label><div class="policy-preview" :class="{ mandatory: minimum > 0 }" role="status"><SvgIcon :name="minimum > 0 ? 'warning' : 'check-circle'" :size="20" aria-hidden="true" /><p>{{ minimum > 0 ? `Pengguna dengan build di bawah ${minimum} WAJIB memperbarui aplikasi.` : 'Pembaruan opsional untuk semua versi lama.' }}</p></div><div class="dialog-actions"><button type="button" class="studio-button button-surface" :disabled="busy" @click="closeModal">Batal</button><button type="submit" class="studio-button button-primary" :disabled="busy"><SvgIcon :name="busy ? 'spinner' : 'check'" :size="16" :class="{ spinning: busy }" aria-hidden="true" />{{ busy ? 'Menyimpan…' : publishing ? 'Konfirmasi publikasi' : 'Simpan kebijakan' }}</button></div></form>
      </section>
    </div></Transition></Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import api from '@/api'
import SvgIcon from '@/components/ui/SvgIcon.vue'
import { APK_UPLOAD_TIMEOUT_MS, uploadDuration, uploadFailure } from './upload-feedback'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const auth = useAuthStore(), toast = useToastStore()
const rows = ref([]), total = ref(0), page = ref(1), policy = ref({}), active = ref(null)
const loading = ref(false), busy = ref(false), uploading = ref(false), progress = ref(0), error = ref('')
const ready = ref(false), readiness = ref(''), maxSize = ref(150 * 1024 * 1024), file = ref(null), fileInput = ref(null)
const publishing = ref(null), editingPolicy = ref(false), details = ref(null), archiving = ref(null), minimum = ref(0)
const dragging = ref(false), dialog = ref(null)
const uploadError = ref(null), elapsedMs = ref(0)
let uploadStartedAt = 0, uploadTimer = null
function stopUploadTimer() { if (uploadTimer) clearInterval(uploadTimer); uploadTimer = null }
const form = reactive({ version_name: '', version_code: '', changelog: '', force_update: false })
const modalOpen = computed(() => Boolean(publishing.value || editingPolicy.value || details.value || archiving.value))
const validationChecks = [
  { icon: 'smartphone', title: 'Aplikasi yang tepat', description: 'Package sesuai dengan aplikasi Ibnu Hafidz.' },
  { icon: 'tag', title: 'Versi yang konsisten', description: 'Nama versi dan nomor build dibaca dari APK.' },
  { icon: 'check-circle', title: 'Sertifikat tepercaya', description: 'Tanda tangan cocok dengan aplikasi terpasang.' },
  { icon: 'scan', title: 'Berkas yang utuh', description: 'Ukuran berkas dan SHA-256 diverifikasi.' },
]
let abort = null, dragDepth = 0, loadGeneration = 0, disposed = false, previousFocus = null, bodyOverflow = ''
const objectUrls = new Map()
const size = bytes => `${(Number(bytes || 0) / 1048576).toFixed(1)} MB`
const date = value => value ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const status = value => ({ draft: 'Draft', published: 'Dipublikasikan', archived: 'Diarsipkan' }[value] || value)
const message = e => e.response?.data?.message || e.response?.data?.error || 'Operasi belum berhasil. Periksa koneksi lalu coba lagi.'
const hideBrokenLogo = event => { event.target.style.display = 'none' }
async function load() {
  if (!auth.hasRole('super_admin') || disposed) return
  const generation = ++loadGeneration
  loading.value = true; error.value = ''
  try {
    const { data } = await api.get('/admin/app/releases', { params: { page: page.value } })
    if (disposed || generation !== loadGeneration) return
    rows.value = data.data || []; total.value = data.total || 0; policy.value = data.policy || {}
    ready.value = data.upload_ready === true; readiness.value = data.readiness_message || ''; maxSize.value = data.max_file_size || 150 * 1024 * 1024
    active.value = rows.value.find(r => r.id === policy.value.current_release_id) || null
    if (!active.value && policy.value.current_release_id) { const current = await api.get(`/admin/app/releases/${policy.value.current_release_id}`); if (!disposed && generation === loadGeneration) active.value = current.data }
  } catch (e) { if (!disposed && generation === loadGeneration) error.value = message(e) }
  finally { if (!disposed && generation === loadGeneration) loading.value = false }
}
function chooseFile() { if (!busy.value && ready.value) fileInput.value?.click() }
function clearFile() { file.value = null; if (fileInput.value) fileInput.value.value = '' }
function validateFile(chosen) {
  if (busy.value || !ready.value) return
  clearFile()
  if (!chosen) return
  if (!chosen.name.toLowerCase().endsWith('.apk') || chosen.size > maxSize.value || chosen.size === 0) { toast.error(`Pilih APK dengan ukuran hingga ${size(maxSize.value)}.`); return }
  file.value = chosen
}
function selectFile(event) { validateFile(event.target.files?.[0]) }
function dragEnter() { if (!busy.value && ready.value) { dragDepth++; dragging.value = true } }
function dragLeave() { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) dragging.value = false }
function dropFile(event) { dragDepth = 0; dragging.value = false; validateFile(event.dataTransfer?.files?.[0]) }
function focusUpload() { const el = fileInput.value?.closest('.dropzone'); el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }); el?.focus({ preventScroll: true }) }
function changePage(delta) { page.value += delta; load() }
async function upload() {
  if (busy.value || !ready.value || !file.value || !auth.hasRole('super_admin')) return
  busy.value = uploading.value = true; progress.value = 0; uploadError.value = null; abort = new AbortController()
  stopUploadTimer(); uploadStartedAt = Date.now(); elapsedMs.value = 0
  uploadTimer = setInterval(() => { elapsedMs.value = Date.now() - uploadStartedAt }, 1000)
  const body = new FormData(); for (const [key, value] of Object.entries(form)) body.append(key, String(value)); body.append('apk', file.value)
  try {
    await api.post('/admin/app/releases', body, { signal: abort.signal, timeout: APK_UPLOAD_TIMEOUT_MS, onUploadProgress: e => { if (e.total && !disposed) progress.value = Math.min(100, Math.round(e.loaded * 100 / e.total)) } })
    if (disposed) return
    toast.success('APK tervalidasi dan disimpan sebagai draft. Belum dipublikasikan.'); clearFile(); page.value = 1; await load()
  } catch (e) { if (!disposed) { elapsedMs.value = Date.now() - uploadStartedAt; uploadError.value = uploadFailure(e, { elapsedMs: elapsedMs.value, progress: progress.value }); toast.error(uploadError.value.title) } }
  finally { stopUploadTimer(); busy.value = uploading.value = false; abort = null }
}
function openPublish(release) { publishing.value = release; minimum.value = release.force_update ? release.version_code : policy.value.minimum_supported_version_code || 0 }
function openPolicy() { editingPolicy.value = true; minimum.value = policy.value.minimum_supported_version_code || 0 }
function closeModal() { if (!busy.value) { publishing.value = null; editingPolicy.value = false; details.value = null; archiving.value = null } }
async function confirmPolicy() {
  if (busy.value || !auth.hasRole('super_admin')) return
  const limit = publishing.value?.version_code || active.value?.version_code
  if (!Number.isInteger(minimum.value) || minimum.value < 0 || minimum.value > limit) { toast.error('Build minimum harus berupa angka bulat dari 0 hingga build rilis.'); return }
  busy.value = true
  try { const body = { minimum_supported_version_code: minimum.value }; if (publishing.value) await api.post(`/admin/app/releases/${publishing.value.id}/publish`, body); else await api.put('/admin/app/policy', body); if (disposed) return; toast.success('Kebijakan rilis berhasil disimpan.'); publishing.value = null; editingPolicy.value = false; await load() }
  catch (e) { if (!disposed) toast.error(message(e)) }
  finally { busy.value = false }
}
async function archive() {
  if (busy.value || !archiving.value || !auth.hasRole('super_admin')) return
  busy.value = true
  try { await api.post(`/admin/app/releases/${archiving.value.id}/archive`); if (!disposed) { toast.success('Rilis diarsipkan.'); archiving.value = null; await load() } }
  catch (e) { if (!disposed) toast.error(message(e)) }
  finally { busy.value = false }
}
async function download(release) {
  if (busy.value || !auth.hasRole('super_admin')) return
  busy.value = true
  try { const response = await api.get(`/admin/app/releases/${release.id}/download`, { responseType: 'blob', timeout: 180000 }); if (disposed) return; const url = URL.createObjectURL(response.data), link = document.createElement('a'); link.href = url; link.download = `ibnu-hafidz-${release.version_code}.apk`; link.click(); objectUrls.set(url, setTimeout(() => { URL.revokeObjectURL(url); objectUrls.delete(url) }, 60000)) }
  catch (e) { if (!disposed) toast.error(message(e)) }
  finally { busy.value = false }
}
function handleDialogKey(event) {
  if (event.key === 'Escape') { event.preventDefault(); closeModal(); return }
  if (event.key !== 'Tab') return
  const controls = [...dialog.value.querySelectorAll('button:not(:disabled), input:not(:disabled), summary, [tabindex="0"]')].filter(el => el.getClientRects().length)
  if (!controls.length) { event.preventDefault(); dialog.value.focus(); return }
  const first = controls[0], last = controls.at(-1)
  if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.value)) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.value)) { event.preventDefault(); first.focus() }
}
watch(modalOpen, async open => {
  if (open) { previousFocus = document.activeElement; bodyOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; await nextTick(); dialog.value?.focus() }
  else { document.body.style.overflow = bodyOverflow; await nextTick(); if (previousFocus?.isConnected) previousFocus.focus() }
})
onMounted(load)
onBeforeUnmount(() => { disposed = true; loadGeneration++; stopUploadTimer(); abort?.abort(); if (modalOpen.value) document.body.style.overflow = bodyOverflow; for (const [url, timer] of objectUrls) { clearTimeout(timer); URL.revokeObjectURL(url) } })
</script>

<style scoped src="./mobile-releases.css"></style>
