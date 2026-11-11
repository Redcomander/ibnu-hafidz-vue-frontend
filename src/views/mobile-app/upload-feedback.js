// APK uploads need more time than ordinary API calls on slower connections.
// This remains bounded and manually cancellable; failed writes are never retried here.
export const APK_UPLOAD_TIMEOUT_MS = 30 * 60 * 1000

export function uploadDuration(milliseconds) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function uploadFailure(error, { elapsedMs = 0, progress = 0 } = {}) {
  const status = Number(error.response?.status) || 0
  const data = error.response?.data
  const serverMessage = data && typeof data === 'object'
    ? [data.message, data.error].find(value => typeof value === 'string') : null
  const canceled = error.code === 'ERR_CANCELED'
  const timedOut = ['ECONNABORTED', 'ETIMEDOUT'].includes(error.code)
  let title, message, uncertain = false
  if (canceled) {
    title = 'Unggahan dibatalkan'
    message = 'Permintaan unggah telah dibatalkan dari perangkat ini.'
    uncertain = true
  } else if (timedOut) {
    title = 'Batas waktu unggahan tercapai'
    message = 'Waktu unggah atau menunggu pemeriksaan APK melewati batas aplikasi. Ini dapat terjadi pada koneksi lambat meskipun internet masih aktif.'
    uncertain = true
  } else if ([408, 502, 504, 524].includes(status)) {
    title = 'Hosting menghentikan atau kehabisan waktu unggah'
    message = `Server/proxy mengembalikan HTTP ${status}. Periksa timeout proxy, batas waktu membaca request, dan log hosting untuk endpoint unggah APK.`
    uncertain = true
  } else if (status === 413) {
    title = 'Berkas melebihi batas unggahan'
    message = serverMessage || 'Hosting menolak ukuran request. Batas Apache/proxy dan backend harus mencukupi ukuran APK beserta data formulir.'
  } else if ([401, 403].includes(status)) {
    title = status === 401 ? 'Sesi unggah perlu diperbarui' : 'Unggahan ditolak oleh server'
    message = serverMessage || (status === 401 ? 'Muat ulang halaman dan pastikan Anda masih masuk sebagai Super Admin.' : 'Periksa izin akun dan aturan Imunify360/WAF hosting. Memiliki internet saja tidak menjamin request diizinkan.')
  } else if (status) {
    title = status >= 500 ? 'Server belum berhasil memproses APK' : 'APK belum dapat disimpan'
    message = serverMessage || `Server mengembalikan HTTP ${status}. Periksa log backend/hosting; respons ini tidak menjelaskan adanya gangguan internet pada perangkat.`
    uncertain = status >= 500
  } else {
    title = 'Koneksi ke server terputus'
    message = 'Browser tidak menerima respons server. Penyebabnya dapat berupa koneksi perangkat, proxy, atau perlindungan hosting; internet yang masih aktif belum menyingkirkan kemungkinan tersebut.'
    uncertain = true
  }
  const rawId = error.response?.headers?.['x-request-id'] || data?.request_id
  const requestId = typeof rawId === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(rawId) ? rawId : ''
  return {
    title,
    message: String(message).slice(0, 1500),
    detail: `Durasi ${uploadDuration(elapsedMs)} · Progres browser ${Math.min(100, Math.max(0, Number(progress) || 0))}% · ${status ? `HTTP ${status}` : timedOut ? 'Timeout aplikasi' : canceled ? 'Dibatalkan' : 'Tanpa respons HTTP'}${requestId ? ` · Request ID ${requestId}` : ''}`,
    advice: uncertain ? 'Muat ulang riwayat rilis sebelum mencoba lagi. Server mungkin sudah menerima sebagian atau seluruh request; pastikan build belum tersimpan.' : 'Perbaiki penyebab penolakan sebelum mengunggah kembali.',
  }
}
