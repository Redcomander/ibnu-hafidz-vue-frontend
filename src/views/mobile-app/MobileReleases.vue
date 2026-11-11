<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div><p class="text-xs font-bold uppercase tracking-widest text-emerald-700">Distribusi Android privat</p><h1 class="mt-2 text-2xl font-bold text-slate-900">Rilis Aplikasi Mobile</h1><p class="mt-2 text-sm text-slate-500">Unggah APK bertanda tangan, tinjau, lalu publikasikan untuk pengguna.</p></div>
      <button class="btn-secondary" :disabled="loading || busy" @click="load">Muat ulang</button>
    </header>
    <p v-if="error" role="alert" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">{{ error }}</p>
    <section class="grid gap-4 md:grid-cols-3">
      <div class="glass-card p-5"><p class="text-sm text-slate-500">Versi aktif</p><p class="mt-2 text-2xl font-bold">{{ active?.version_name || 'Belum dipublikasikan' }}</p><p class="text-sm text-slate-500">{{ active ? `Build ${active.version_code} · ${size(active.file_size)}` : 'Unggahan baru selalu menjadi draft.' }}</p><p class="mt-2 text-xs text-slate-500">{{ date(active?.published_at) }}</p></div>
      <div class="glass-card p-5"><p class="text-sm text-slate-500">Kebijakan versi minimum</p><p class="mt-2 text-2xl font-bold">{{ policy.minimum_supported_version_code || 'Semua versi' }}</p><p class="text-sm text-slate-500">Build di bawah batas ini wajib memperbarui aplikasi.</p><button v-if="policy.current_release_id" class="mt-3 text-sm font-bold text-emerald-700" :disabled="busy" @click="openPolicy">Ubah kebijakan minimum</button></div>
      <div class="glass-card p-5"><p class="text-sm text-slate-500">Validasi server</p><p class="mt-2 font-bold" :class="ready ? 'text-emerald-700' : 'text-amber-700'">{{ ready ? 'Siap memeriksa APK' : 'Konfigurasi diperlukan' }}</p><p class="mt-2 text-sm text-slate-500">{{ readiness || 'Package, versi, sertifikat, ukuran dan SHA-256 diverifikasi sebelum publikasi.' }}</p></div>
    </section>
    <form class="glass-card space-y-4 p-5 md:p-6" @submit.prevent="upload">
      <div><h2 class="text-lg font-bold">Unggah draft APK</h2><p class="text-sm text-slate-500">Batas {{ size(maxSize) }}. Versi diambil dari APK; isian versi opsional dipakai untuk mencocokkan metadata.</p></div>
      <label class="block text-sm font-semibold">Berkas APK<input ref="fileInput" class="mt-2 block w-full rounded-xl border border-slate-200 p-3" type="file" accept=".apk,application/vnd.android.package-archive" :disabled="busy || !ready" required @change="selectFile" /></label>
      <div class="grid gap-4 sm:grid-cols-2"><label class="text-sm">Nama versi (opsional)<input v-model.trim="form.version_name" class="input-field mt-1 w-full" maxlength="80" :disabled="busy" placeholder="Diambil dari APK" /></label><label class="text-sm">Build number (opsional)<input v-model="form.version_code" class="input-field mt-1 w-full" type="number" min="1" max="2100000000" :disabled="busy" placeholder="Diambil dari APK" /></label></div>
      <label class="block text-sm">Catatan rilis<textarea v-model="form.changelog" class="input-field mt-1 min-h-28 w-full" maxlength="10000" :disabled="busy" placeholder="Perbaikan dan fitur baru untuk pengguna" /></label>
      <label class="flex gap-3 text-sm"><input v-model="form.force_update" type="checkbox" :disabled="busy" /><span>Usulkan pembaruan wajib. Batas versi tetap harus dikonfirmasi saat publikasi.</span></label>
      <div v-if="uploading" role="status"><progress class="w-full" :value="progress" max="100" /><p class="text-sm">{{ progress }}% terkirim{{ progress === 100 ? ' · Memeriksa APK di server...' : '' }}</p></div>
      <div class="flex flex-wrap gap-3"><button type="submit" class="btn-primary" :disabled="busy || !ready || !file">{{ uploading ? 'Mengunggah / memeriksa...' : 'Unggah sebagai draft' }}</button><button v-if="uploading" type="button" class="btn-secondary" @click="abort?.abort()">Batalkan unggahan</button></div>
    </form>
    <section class="glass-card overflow-hidden">
      <div class="flex items-center justify-between p-5"><h2 class="font-bold">Riwayat rilis</h2><span class="text-sm text-slate-500">{{ total }} rilis</span></div>
      <p v-if="loading" class="p-5" role="status">Memuat rilis...</p>
      <p v-else-if="!rows.length" class="p-5 text-slate-500">Belum ada rilis. Mulai dengan mengunggah APK release yang sesuai.</p>
      <div v-else class="overflow-x-auto"><table class="w-full whitespace-nowrap text-left text-sm"><thead class="bg-slate-50 text-slate-500"><tr><th v-for="label in ['Versi / Build','Ukuran','Diunggah','Publikasi','Status','Pengunggah','Tindakan']" :key="label" class="p-4 font-semibold">{{ label }}</th></tr></thead><tbody><tr v-for="release in rows" :key="release.id" class="border-t border-slate-100"><td class="p-4 font-semibold">{{ release.version_name }} / {{ release.version_code }}</td><td class="p-4">{{ size(release.file_size) }}</td><td class="p-4">{{ date(release.created_at) }}</td><td class="p-4">{{ date(release.published_at) }}</td><td class="p-4"><span class="rounded-full px-3 py-1 text-xs font-bold" :class="release.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'">{{ status(release.status) }}</span></td><td class="p-4">{{ release.uploader?.name || `#${release.created_by}` }}</td><td class="p-4"><div class="flex gap-3"><button class="font-semibold text-emerald-700" @click="details = release">Detail</button><button :disabled="busy" @click="download(release)">Unduh APK</button><button v-if="release.status === 'draft' && release.version_code > policy.highest_version_code" :disabled="busy || !ready" class="font-semibold text-emerald-700" @click="openPublish(release)">Publikasikan</button><button v-if="release.status !== 'archived'" :disabled="busy" class="text-red-700" @click="archive(release)">Arsipkan</button></div></td></tr></tbody></table></div>
      <div class="flex items-center justify-between gap-4 p-5"><button class="btn-secondary" :disabled="page <= 1 || loading || busy" @click="page--; load()">Sebelumnya</button><span class="text-sm">Halaman {{ page }}</span><button class="btn-secondary" :disabled="page * 20 >= total || loading || busy" @click="page++; load()">Berikutnya</button></div>
    </section>
    <div v-if="publishing || editingPolicy" class="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4" @click.self="closePolicy" @keydown.esc="closePolicy">
      <form role="dialog" aria-modal="true" aria-labelledby="release-dialog-title" class="w-full max-w-lg space-y-4 rounded-3xl bg-white p-6" @submit.prevent="confirmPolicy"><h2 id="release-dialog-title" class="text-xl font-bold">{{ publishing ? `Publikasikan ${publishing.version_name} (${publishing.version_code})?` : 'Ubah versi minimum' }}</h2><p class="text-sm text-slate-600">{{ publishing ? 'Rilis aktif sebelumnya akan diarsipkan. APK draft ini akan tersedia bagi pengguna.' : 'Menurunkan batas minimum memulihkan akses versi lama tanpa memasang APK versi lebih rendah.' }}</p><label class="block text-sm font-semibold">Build minimum yang didukung<input v-model.number="minimum" type="number" min="0" :max="publishing?.version_code || active?.version_code" class="input-field mt-2 w-full" required :disabled="busy" /></label><p class="text-sm text-amber-800">{{ minimum > 0 ? `Pengguna dengan build di bawah ${minimum} WAJIB memperbarui aplikasi.` : 'Pembaruan opsional untuk semua versi lama.' }}</p><div class="flex justify-end gap-3"><button type="button" class="btn-secondary" :disabled="busy" @click="closePolicy">Batal</button><button type="submit" class="btn-primary" :disabled="busy">{{ busy ? 'Menyimpan...' : publishing ? 'Konfirmasi publikasi' : 'Simpan kebijakan' }}</button></div></form>
    </div>
    <div v-if="details" class="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4" @click.self="details = null"><section role="dialog" aria-modal="true" aria-label="Detail rilis" class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6"><h2 class="text-xl font-bold">{{ details.version_name }} · Build {{ details.version_code }}</h2><p class="mt-3 text-sm">{{ details.package_name }}</p><p class="mt-4 whitespace-pre-wrap">{{ details.changelog || 'Tidak ada catatan rilis.' }}</p><dl class="mt-5 space-y-2 break-all text-xs"><dt>SHA-256 APK</dt><dd>{{ details.sha256 }}</dd><dt>Sertifikat penandatangan</dt><dd>{{ details.signer_sha256 }}</dd></dl><button class="btn-secondary mt-6" @click="details = null">Tutup</button></section></div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
const auth = useAuthStore(), toast = useToastStore()
const rows = ref([]), total = ref(0), page = ref(1), policy = ref({}), active = ref(null)
const loading = ref(false), busy = ref(false), uploading = ref(false), progress = ref(0), error = ref('')
const ready = ref(false), readiness = ref(''), maxSize = ref(150 * 1024 * 1024), file = ref(null), fileInput = ref(null)
const publishing = ref(null), editingPolicy = ref(false), details = ref(null), minimum = ref(0)
const form = reactive({ version_name: '', version_code: '', changelog: '', force_update: false })
let abort = null
const size = bytes => `${(Number(bytes || 0) / 1048576).toFixed(1)} MB`
const date = value => value ? new Date(value).toLocaleString('id-ID') : '—'
const status = value => ({ draft: 'Draft', published: 'Dipublikasikan', archived: 'Diarsipkan' }[value] || value)
const message = e => e.response?.data?.message || e.response?.data?.error || 'Operasi belum berhasil. Periksa koneksi lalu coba lagi.'
async function load() {
 if (!auth.hasRole('super_admin')) return
 loading.value = true; error.value = ''
 try { const { data } = await api.get('/admin/app/releases', { params: { page: page.value } }); rows.value = data.data || []; total.value = data.total; policy.value = data.policy; ready.value = data.upload_ready; readiness.value = data.readiness_message; maxSize.value = data.max_file_size
 active.value = rows.value.find(r => r.id === policy.value.current_release_id) || null
 if (!active.value && policy.value.current_release_id) active.value = (await api.get(`/admin/app/releases/${policy.value.current_release_id}`)).data
 } catch (e) { error.value = message(e) } finally { loading.value = false }
}
function selectFile(event) { const chosen = event.target.files?.[0]; file.value = null; if (!chosen) return; if (!chosen.name.toLowerCase().endsWith('.apk') || chosen.size > maxSize.value || chosen.size === 0) { toast.error(`Pilih APK dengan ukuran hingga ${size(maxSize.value)}.`); event.target.value = ''; return } file.value = chosen }
async function upload() {
 if (busy.value || !file.value || !auth.hasRole('super_admin')) return
 busy.value = uploading.value = true; progress.value = 0; abort = new AbortController()
 const body = new FormData(); for (const [key, value] of Object.entries(form)) body.append(key, String(value)); body.append('apk', file.value)
 try { await api.post('/admin/app/releases', body, { signal: abort.signal, timeout: 180000, onUploadProgress: e => { if (e.total) progress.value = Math.min(100, Math.round(e.loaded * 100 / e.total)) } }); toast.success('APK tervalidasi dan disimpan sebagai draft. Belum dipublikasikan.'); file.value = null; if (fileInput.value) fileInput.value.value = ''; page.value = 1; await load() } catch (e) { toast.error(e.code === 'ERR_CANCELED' ? 'Unggahan dibatalkan. Muat ulang untuk memastikan hasil server.' : message(e)) } finally { busy.value = uploading.value = false; abort = null }
}
function openPublish(release) { publishing.value = release; minimum.value = release.force_update ? release.version_code : policy.value.minimum_supported_version_code || 0 }
function openPolicy() { editingPolicy.value = true; minimum.value = policy.value.minimum_supported_version_code || 0 }
function closePolicy() { if (!busy.value) { publishing.value = null; editingPolicy.value = false } }
async function confirmPolicy() { if (busy.value) return; busy.value = true; try { const body = { minimum_supported_version_code: minimum.value }; if (publishing.value) await api.post(`/admin/app/releases/${publishing.value.id}/publish`, body); else await api.put('/admin/app/policy', body); toast.success('Kebijakan rilis berhasil disimpan.'); publishing.value = null; editingPolicy.value = false; await load() } catch (e) { toast.error(message(e)) } finally { busy.value = false } }
async function archive(release) { if (busy.value || !window.confirm(release.status === 'published' ? 'Arsipkan rilis aktif? Pemeriksaan pembaruan akan berhenti menawarkan APK sampai rilis baru dipublikasikan. Berkas dan riwayat tetap disimpan.' : 'Arsipkan draft ini? Berkas dan riwayat tetap disimpan.')) return; busy.value = true; try { await api.post(`/admin/app/releases/${release.id}/archive`); toast.success('Rilis diarsipkan.'); await load() } catch (e) { toast.error(message(e)) } finally { busy.value = false } }
async function download(release) { if (busy.value) return; busy.value = true; try { const response = await api.get(`/admin/app/releases/${release.id}/download`, { responseType: 'blob', timeout: 180000 }); const url = URL.createObjectURL(response.data); const link = document.createElement('a'); link.href = url; link.download = `ibnu-hafidz-${release.version_code}.apk`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 60000) } catch (e) { toast.error(message(e)) } finally { busy.value = false } }
onMounted(load)
onBeforeUnmount(() => abort?.abort())
</script>
