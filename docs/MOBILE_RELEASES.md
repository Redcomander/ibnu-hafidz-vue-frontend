# Pengelolaan rilis APK privat

Halaman: `/dashboard/mobile-app/releases` atau `/admin/mobile-app/releases`.
Menu **Sistem → Rilis Aplikasi Mobile** hanya terlihat bagi `super_admin`.
Backend tetap memeriksa autentikasi dan role secara independen.

Tombol **Salin link download** tersedia pada ringkasan, kartu riwayat, dan detail
rilis aktif yang dipublikasikan. Link diambil dari metadata publik backend dan
langsung menuju APK (`/api/app/download/ID`), tanpa token atau endpoint admin.
Draft dan arsip tidak menyediakan link publik. Jika clipboard ditolak browser,
tautan ditampilkan dalam kolom yang dapat dipilih dan disalin manual. Rilis yang
kemudian diarsipkan tidak lagi dapat diunduh melalui link publik lamanya.

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

Dashboard memakai API Axios, layout, toast dan guard role yang sudah ada. Desain
studio rilis memakai warna hijau dan emas, pratinjau versi aktif, kartu ringkasan,
drag-and-drop APK, metadata opsional yang dapat dilipat, serta toggle usulan wajib.
Upload memiliki progres/batal, validasi ukuran dan pesan kegagalan. Riwayat memakai
kartu responsif dengan pagination. Dialog detail, publikasi, kebijakan minimum,
dan arsip mendukung keyboard, Escape, penguncian fokus, serta pengembalian fokus.

Animasi mencakup masuk halaman bertahap, pratinjau ponsel, hover kartu/tombol,
pergantian berkas, progres unggah, loading skeleton, serta transisi dialog dan
daftar. Preferensi reduced motion menonaktifkan animasi. Tema terang dan gelap
menggunakan variabel warna khusus halaman; tidak menambah library animasi.

Unggah APK memiliki batas waktu aplikasi 30 menit untuk koneksi lambat, tombol
batal dan penghitung durasi. Persentase berasal dari browser, bukan konfirmasi
bahwa berkas sudah tersimpan atau selesai divalidasi oleh backend. Error unggah
menampilkan durasi, progres terakhir, status HTTP dan request ID bila tersedia.
HTTP 413 mengarah ke batas ukuran; 408/502/504/524 mengarah ke proxy/hosting;
401/403 mengarah ke sesi/izin atau WAF. Tanpa respons HTTP, penyebab jaringan
perangkat dan hosting belum dapat dibedakan. Timeout frontend yang lebih panjang
tidak mengubah timeout Apache/proxy/Imunify360. Setelah timeout atau putus koneksi,
muat ulang riwayat sebelum mengulang unggahan; tidak ada retry otomatis.

Pengujian: build Vite, 5 tes unit session/error unggah, dan 20 tes Playwright desktop/mobile untuk
akses, draft upload, konfirmasi publikasi/arsip, validasi drag-and-drop, penutupan
dan fokus dialog, keadaan kosong/tidak siap, responsivitas, tema, serta reduced
motion. Mocks tidak memverifikasi konfigurasi Apache atau instalasi pada telepon.

Panduan deployment cPanel dan checklist dua APK ada di repository backend:
`MOBILE_APP_RELEASES.md`. Tidak ada deployment otomatis pada implementasi ini.
