# Pengelolaan rilis APK privat

Halaman: `/dashboard/mobile-app/releases` atau `/admin/mobile-app/releases`.
Menu **Sistem → Rilis Aplikasi Mobile** hanya terlihat bagi `super_admin`.
Backend tetap memeriksa autentikasi dan role secara independen.

1. Pastikan migration 002 serta storage/aapt/apksigner/Java dan sertifikat sudah
   dikonfigurasi. Kesiapan dan batas ukuran ditampilkan di dashboard.
2. Unggah APK release non-debuggable. Nama/build dapat dikosongkan agar memakai
   hasil ekstraksi server; jika diisi harus sama dengan metadata APK.
3. Isi catatan rilis. Usulan wajib di form tidak mengaktifkan kebijakan publik.
4. Tinjau detail, hash, signer dan draft. Unduhan draft hanya untuk Super Admin.
5. Tekan Publikasikan dan konfirmasi build minimum: 0 berarti opsional; nilai
   lebih tinggi mewajibkan perangkat dengan build di bawahnya memperbarui.
6. Rilis lama diarsipkan, bukan dihapus. Mengarsipkan rilis aktif menghentikan
   tawaran update. Kebijakan minimum dapat diturunkan tanpa downgrade Android.

Dashboard memakai API Axios, layout, toast dan guard role yang sudah ada. Upload
memiliki progres/batal, validasi ukuran dan pesan kegagalan. Tabel riwayat
memiliki pagination dan horizontal scroll pada layar kecil.

Pengujian: build Vite, unit session, dan enam tes Playwright desktop/mobile
untuk akses, draft upload dan konfirmasi publikasi. Mocks tidak memverifikasi
konfigurasi Apache atau proses instalasi pada telepon.

Panduan deployment cPanel dan checklist dua APK ada di repository backend:
`MOBILE_APP_RELEASES.md`. Tidak ada deployment otomatis pada implementasi ini.
