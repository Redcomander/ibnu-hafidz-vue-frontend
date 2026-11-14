<template>
  <main class="app-download">
    <nav><RouterLink to="/" class="brand"><img src="/favicon.png" alt="" />IBNU HAFIDZ</RouterLink><span>Khusus Android</span></nav>
    <section class="download-card">
      <div class="download-intro"><span class="eyebrow">ABSENSI DALAM GENGGAMAN</span><h1>Satu aplikasi.<br />Lebih mudah terhubung.</h1><p>Jadwal, presensi, dan informasi halaqoh. Unduh aplikasi Ibnu Hafidz dan mulai dengan akun Anda.</p><div class="feature-tags"><span>Jadwal mengajar</span><span>Absensi santri &amp; guru</span><span>Halaqoh</span></div><p class="permanent-note">Simpan halaman ini. Tautannya tetap sama setiap ada pembaruan.</p></div>
      <div class="download-panel" aria-live="polite" :aria-busy="loading">
        <img class="app-logo" src="/favicon.png" alt="Logo Ibnu Hafidz" />
        <h2>Ibnu Hafidz</h2><p>Aplikasi sistem absensi</p>
        <p v-if="loading">Memeriksa versi terbaru...</p>
        <template v-else-if="release"><div class="version"><strong>Versi {{ release.latest_version }}</strong><span>Build {{ release.latest_version_code }} · {{ size }}</span></div><button class="download-primary" :disabled="downloading" @click="download">{{ downloading ? 'Memeriksa pembaruan...' : 'Download APK Android' }}</button><p class="download-hint">Instal sebagai pembaruan jika aplikasi sudah terpasang.</p><details v-if="release.changelog"><summary>Apa yang baru?</summary><p class="changelog">{{ release.changelog }}</p></details></template>
        <p v-else-if="!error">Belum ada aplikasi yang dipublikasikan. Silakan kembali nanti.</p>
        <div v-if="error" role="alert" class="download-error"><p>{{ error }}</p><button @click="load">Coba lagi</button></div>
      </div>
    </section>
    <section class="install-guide"><h2>Mulai dalam tiga langkah</h2><ol><li><strong>01. Unduh APK</strong><p>Tekan tombol download untuk mengambil rilis terbaru.</p></li><li><strong>02. Pasang aplikasi</strong><p>Buka berkas APK. Jika diminta Android, izinkan pemasangan dari browser atau pengelola berkas yang Anda gunakan.</p></li><li><strong>03. Masuk ke akun</strong><p>Gunakan akun Ibnu Hafidz Anda. Hubungi admin jika menemui kendala.</p></li></ol></section>
    <footer>Ibnu Hafidz · Terhubung untuk pendidikan yang lebih baik.</footer>
  </main>
</template>
<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import axios from 'axios'
const release = ref(null), loading = ref(false), downloading = ref(false), error = ref('')
let controller, disposed = false
const size = computed(() => `${(Number(release.value?.file_size || 0) / 1024 / 1024).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`)
async function fetchRelease() {
  controller?.abort()
  controller = new AbortController()
  const { data } = await axios.get('/api/app/version', { params: { version_code: 0, _: Date.now() }, timeout: 30000, signal: controller.signal, headers: { 'Cache-Control': 'no-cache' } })
  if (!Number(data.latest_version_code) || !data.download_url) return null
  const url = new URL(data.download_url)
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !/^\/api\/app\/download\/\d+$/.test(url.pathname)) throw new Error('invalid-release')
  return { ...data, download_url: url.href }
}
async function load() {
  if (loading.value || downloading.value) return
  loading.value = true; error.value = ''; release.value = null
  try { const data = await fetchRelease(); if (!disposed) release.value = data }
  catch { if (!disposed) error.value = 'Tidak dapat memeriksa rilis. Periksa koneksi lalu coba lagi.' }
  finally { loading.value = false }
}
async function download() {
  if (downloading.value) return
  downloading.value = true; error.value = ''
  try {
    // Recheck at the moment of download: a release may change while this page is open.
    const data = await fetchRelease()
    if (disposed) return
    release.value = data
    if (!data) { error.value = 'Rilis belum tersedia. Silakan coba lagi nanti.'; return }
    window.location.assign(data.download_url)
  } catch { if (!disposed) error.value = 'Download belum dapat dimulai. Periksa koneksi lalu coba lagi.' }
  finally { downloading.value = false }
}
onMounted(load)
onBeforeUnmount(() => { disposed = true; controller?.abort() })
</script>
<style scoped>
.app-download{min-height:100vh;background:radial-gradient(ellipse at top left,#dce9db,transparent 60%),#f6f7ef;color:#193c30;padding:28px max(24px,calc((100vw - 1120px)/2));font-family:inherit}.app-download nav{display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:12px}.brand{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:2px;color:inherit;text-decoration:none}.brand img{width:36px;height:36px;object-fit:contain}.download-card{display:grid;grid-template-columns:1.25fr 1fr;gap:56px;align-items:center;padding:64px 0}.eyebrow{font-size:11px;letter-spacing:3px;font-weight:800}.download-intro h1{font-size:clamp(32px,4.6vw,62px);line-height:1.08;letter-spacing:-2px;margin:22px 0}.download-intro p{line-height:1.8;max-width:490px;color:#50695d}.feature-tags{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0}.feature-tags span{font-size:12px;background:#e2ebdf;padding:8px 12px;border-radius:24px}.permanent-note{font-size:12px}.download-panel{padding:36px;background:#173e32;color:#fff;border-radius:28px;box-shadow:0 24px 65px #183e3220;text-align:center;min-width:0}.app-logo{width:84px;height:84px;object-fit:contain;background:#fff;border-radius:24px;padding:12px;margin:auto}.download-panel h2{font-size:28px;margin:18px 0 4px}.download-panel>p{color:#c5d8cc;font-size:14px}.version{display:grid;gap:8px;margin:28px 0}.version span{font-size:12px;color:#c5d8cc}.download-primary{width:100%;padding:16px;border:0;border-radius:14px;background:#e6c573;color:#26392b;font-weight:800;cursor:pointer;transition:transform .2s}.download-primary:hover{transform:translateY(-2px)}.download-primary:disabled{opacity:.6;cursor:wait}.download-hint{font-size:11px!important}.download-panel details{text-align:left;border-top:1px solid #ffffff25;margin-top:24px;padding-top:18px;font-size:13px}.download-panel summary{cursor:pointer}.changelog{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;color:#d6e3d8}.download-error{margin-top:20px;padding:12px;background:#ffffff12;border-radius:12px;font-size:13px}.download-error button{padding:8px 16px;background:#fff;color:#193c30;border:0;border-radius:8px}.install-guide{border-top:1px solid #cfdbcf;padding:32px 0}.install-guide h2{font-size:23px}.install-guide ol{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;list-style:none;padding:0}.install-guide p{font-size:13px;line-height:1.8;color:#50695d}footer{padding:24px 0;font-size:11px;color:#50695d}button:focus-visible,summary:focus-visible,a:focus-visible{outline:3px solid #d6a847;outline-offset:4px}@media(max-width:700px){.download-card{grid-template-columns:1fr;gap:28px;padding:40px 0}.install-guide ol{grid-template-columns:1fr;gap:12px}.download-panel{padding:28px}.brand{letter-spacing:1px;font-size:11px}}@media(prefers-reduced-motion:reduce){.download-primary{transition:none}.download-primary:hover{transform:none}}
</style>
