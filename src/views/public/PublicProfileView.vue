<template>
  <div class="bg-white text-slate-900">
    <section class="hero-pattern relative overflow-hidden py-16 md:py-28 text-white">
      <div class="absolute inset-0 bg-emerald-800/90 z-0"></div>
      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center md:text-left">
        <p class="text-xs md:text-sm uppercase tracking-[0.25em] text-yellow-300 font-bold">Profil Pesantren</p>
        <h1 class="mt-4 font-heading text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">Tentang <span class="text-yellow-300">Ibnu Hafidz</span></h1>
        <p class="mt-4 md:mt-6 max-w-3xl mx-auto md:mx-0 text-base md:text-xl leading-relaxed text-emerald-50">
          Mengenal lebih dekat Pondok Pesantren Tahfidz Ibnu Hafidz, sejarah, visi misi, dan perkembangannya.
        </p>
        <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <a href="#program" class="inline-flex justify-center items-center rounded-full bg-yellow-400 px-8 py-3.5 text-sm md:text-base font-bold text-emerald-900 transition hover:bg-yellow-300 shadow-lg">
            Program Kami
          </a>
        </div>
      </div>
    </section>

    <!-- About / Sejarah Singkat -->
    <section class="py-16 md:py-24 bg-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-center">
          <div class="order-2 md:order-1">
            <span class="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold tracking-wider uppercase mb-4">Sejarah Singkat</span>
            <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-6 md:mb-8 leading-tight">Perjalanan Pesantren Tahfidz Ibnu Hafidz</h2>
            <div class="space-y-4 md:space-y-6 text-slate-600 text-base md:text-lg leading-relaxed">
              <p>
                Pesantren Tahfidz Ibnu Hafidz didirikan oleh <strong class="text-emerald-700">K.H Taslim Hafidz, Lc.</strong> (Alumni Universitas Al-Azhar Cairo Mesir) pada tahun 2018 dengan luas tanah 46.000 m&sup2;. Diresmikan pada tanggal 10 Juli 2019 oleh Gubernur TGB H. Dr. Zainul Majdi, Lc. MA.
              </p>
              <p>
                Santri perdana tahun ajaran 2019 - 2020 berjumlah 40 santri, dan saat ini sudah mencapai <strong class="text-emerald-700">{{ loading ? '...' : stats.santri_aktif }} santri</strong> dari berbagai daerah seperti Papua, Sulawesi, Aceh, dan juga dari Malaysia, serta didominasi dari wilayah Jawa Barat.
              </p>
              <p>
                Tenaga pengajar terdiri dari lulusan Universitas Al-Azhar Cairo Mesir, Pesantren Gontor, Pesantren Almawaddah, Pesantren Sidogiri, Alfalah Ploso, Dalwa, Ponpes Al Ashriyyah Nurul Iman, UI, UGM, UNDIP, UNM, dan Pesantren Daarul Qur'an milik Ust. Yusuf Mansur.
              </p>
            </div>
            
            <div class="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div class="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-4 flex-shrink-0">
                  <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <span class="block text-xs uppercase tracking-wider text-slate-500">Didirikan Tahun</span>
                  <span class="block text-lg font-bold text-emerald-700">2018</span>
                </div>
              </div>
              <div class="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-4 flex-shrink-0">
                  <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <span class="block text-xs uppercase tracking-wider text-slate-500">Jumlah Santri</span>
                  <span class="block text-lg font-bold text-emerald-700">{{ loading ? '...' : stats.santri_aktif }} Santri Aktif</span>
                </div>
              </div>
            </div>
          </div>
          <div class="order-1 md:order-2 relative">
             <!-- Placeholder or actual image from DB, mimicking blade structure -->
             <div class="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative">
                <div class="absolute inset-0 bg-emerald-900/20 z-10"></div>
                <img :src="'/drone2.JPG'" alt="Pesantren Area" class="w-full h-full object-cover" />
             </div>
             <!-- Decorators -->
             <div class="hidden md:block absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full opacity-30 blur-xl z-0"></div>
             <div class="hidden md:block absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-600 rounded-full opacity-20 blur-2xl z-0"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Visi & Misi -->
    <section class="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-12 md:mb-16">
          <span class="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Arah & Tujuan</span>
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">Visi & Misi</h2>
          <div class="w-20 md:w-24 h-1 md:h-1.5 bg-emerald-500 mx-auto rounded-full"></div>
          <p class="mt-6 text-slate-600 text-base md:text-lg max-w-2xl mx-auto">Komitmen kami untuk memberikan pendidikan berkualitas dan membentuk generasi Qur'ani yang berakhlak mulia.</p>
        </div>

        <div class="grid lg:grid-cols-[1fr_1.2fr] gap-8 md:gap-12">
          <!-- Visi -->
          <div class="bg-gradient-to-br from-emerald-800 to-emerald-600 p-8 md:p-12 rounded-[28px] shadow-2xl text-white flex flex-col justify-center flex-grow">
             <div class="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
               <svg class="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
             </div>
             <h3 class="text-sm font-semibold uppercase tracking-widest text-emerald-200 mb-3">Visi Kami</h3>
             <h4 class="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6">Menjadi Pesantren Terbaik Di Indonesia.</h4>
             <p class="text-emerald-50 text-base md:text-xl leading-relaxed">
              Melahirkan Generasi Berakhlak Mulia Yang Mandiri dan Memiliki Jiwa Kepemimpinan, Berwawasan Global dan Berprestasi Tingkat Internasional.
             </p>
          </div>

          <!-- Misi -->
          <div class="flex flex-col gap-4 md:gap-6">
            <h3 class="text-2xl font-bold text-slate-800 mb-2 md:mb-4 px-2">Misi Kami</h3>
            
            <div class="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100 flex gap-4 md:gap-6 transition hover:shadow-xl">
              <div class="w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-600 font-bold text-xl">1</div>
              <div>
                <h4 class="text-lg md:text-xl font-bold text-slate-800 mb-2">Tahfidz Al-Qur'an</h4>
                <p class="text-slate-600 text-sm md:text-base leading-relaxed">Menyelenggarakan program unggulan tahfidz Al Qur'an dan ilmu syar'i secara intensif dan tersistem.</p>
              </div>
            </div>

            <div class="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100 flex gap-4 md:gap-6 transition hover:shadow-xl">
              <div class="w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-600 font-bold text-xl">2</div>
              <div>
                <h4 class="text-lg md:text-xl font-bold text-slate-800 mb-2">Pembinaan Karakter</h4>
                <p class="text-slate-600 text-sm md:text-base leading-relaxed">Membina dan mendidik generasi muslim, memiliki jiwa yang ikhlas, mandiri, sehat jasmani dan rohani, berakhlak mulia serta bermanfaat untuk semua.</p>
              </div>
            </div>

            <div class="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100 flex gap-4 md:gap-6 transition hover:shadow-xl">
              <div class="w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-600 font-bold text-xl">3</div>
              <div>
                <h4 class="text-lg md:text-xl font-bold text-slate-800 mb-2">Pengembangan Potensi</h4>
                <p class="text-slate-600 text-sm md:text-base leading-relaxed">Menyelenggarakan program intensif agar peserta didik mampu melanjutkan ke Perguruan Tinggi Negeri dan Luar Negeri, serta membekali dengan Life Skill (Teknologi Informasi, Bisnis Pemasaran dan Pertanian).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Program Kami -->
    <section id="program" class="py-16 md:py-24 bg-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">Program Kami</h2>
          <div class="w-20 md:w-24 h-1 md:h-1.5 bg-yellow-400 mx-auto rounded-full"></div>
        </div>
        
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <article v-for="program in profileContent.programs" :key="program.title" class="bg-slate-50 rounded-3xl p-6 md:p-8 hover:bg-emerald-50 transition border border-slate-100 hover:border-emerald-200 group">
            <div class="w-14 h-14 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform" v-html="getProgramIcon(program.title)"></div>
            <h3 class="text-xl font-bold text-slate-800 mb-3">{{ program.title }}</h3>
            <p class="text-slate-600 text-sm md:text-base leading-relaxed">{{ program.description }}</p>
          </article>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { fetchPublicProfile } from '@/api/public'

const loading = ref(true)
const error = ref('')
const stats = ref({
  santri_aktif: 250,
  tenaga_pengajar: 35,
  tahun_berdiri: 2018
})

const programIcons = {
  tahfidz: `<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  diniyyah: `<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  bahasa: `<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  formal: `<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  default: `<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
}

const getProgramIcon = (title) => {
  const t = title.toLowerCase()
  if (t.includes('tahfidz')) return programIcons.tahfidz
  if (t.includes('diniyyah')) return programIcons.diniyyah
  if (t.includes('bahasa')) return programIcons.bahasa
  if (t.includes('formal')) return programIcons.formal
  return programIcons.default
}

const profileContent = ref({
  programs: [
    { title: 'Tahfidz Al-Qur\'an', description: 'Hafalan 30 Juz secara mutqin dengan pembinaan metode tersistem & terukur.' },
    { title: 'Pendidikan Diniyyah', description: 'Pengkajian kitab kuning dan keislaman yang komprehensif (Aqidah, Fiqih, Tafsir, Hadits).' },
    { title: 'Pendidikan Formal', description: 'SMP dan SMA Terpadu yang menginduk ke Dinas Pendidikan namun tetap bernuansa khas kepesantrenan.' },
    { title: 'Pengembangan Bahasa', description: 'Bahasa Arab dan Inggris secara intensif untuk komunikasi harian di lingkungan pesantren.' },
    { title: 'Life Skill & Ekstrakurikuler', description: 'Pelatihan multimedia, bisnis, memanah, berenang, bela diri, hingga agribisnis.' }
  ]
})

onMounted(async () => {
  try {
    const data = await fetchPublicProfile()
    if(data.stats) {
      stats.value = data.stats
    }
  } catch (err) {
    console.error('Failed to fetch profile stats:', err)
  } finally {
    loading.value = false
  }
})
</script>
