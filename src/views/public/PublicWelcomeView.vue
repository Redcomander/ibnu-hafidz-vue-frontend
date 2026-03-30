<template>
  <div class="bg-slate-50 text-slate-900">
    <!-- Hero Section -->
    <section class="relative flex items-center overflow-hidden text-white bg-slate-900">
      <div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(13,77,38,0.92),rgba(33,123,52,0.85))] z-0"></div>
      <div class="absolute top-0 right-0 w-full h-full bg-cover bg-center opacity-30 mix-blend-overlay z-0" :style="{ backgroundImage: 'url(/welcome2.JPG)' }"></div>
      
      <div class="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 mt-12 md:mt-24 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:py-32">
        <div class="text-center lg:text-left">
          <div class="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <span class="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
            Pendaftaran Dibuka
          </div>
          <h1 class="mt-6 font-heading text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Pondok Pesantren Tahfidz <br class="hidden sm:block"/> <span class="text-yellow-400">Ibnu Hafidz</span>
          </h1>
          <p class="mx-auto mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-emerald-50 lg:mx-0">
            Membangun generasi Qur'ani melalui tahfidz intensif, pendidikan formal, dan pembinaan karakter berlandaskan adab dan nilai-nilai Islam sesuai pemahaman Salafus Shalih.
          </p>
          <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 lg:justify-start">
            <a href="https://pendaftaran.ibnuhafidz.ponpes.id/" class="w-full sm:w-auto inline-flex justify-center items-center rounded-full bg-yellow-400 px-8 py-3.5 text-sm font-bold text-emerald-900 transition hover:bg-yellow-300 hover:scale-105 shadow-xl">
              Daftar Sekarang
            </a>
            <a href="https://wa.me/6281212272775?text=Assalamu'alaikum%20Warahmatullahi%20Wabarakatuh.%0ASaya%20ingin%20bertanya%20lebih%20lanjut%20tentang%20Pondok%20Pesantren%20Ibnu%20Hafidz." target="_blank" class="w-full sm:w-auto inline-flex justify-center items-center rounded-full border-2 border-white/70 px-8 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-emerald-900">
              Hubungi Admin
            </a>
          </div>
          
          <!-- Stats Mobile/Desktop -->
          <div class="mt-12 grid grid-cols-3 gap-3 md:gap-6 border-t border-white/20 pt-8 max-w-3xl mx-auto lg:mx-0">
            <div class="text-center lg:text-left">
              <p class="text-3xl md:text-4xl font-bold text-yellow-400">{{ loading ? '...' : stats.santri_aktif }}+</p>
              <p class="mt-1 text-xs md:text-sm font-medium text-emerald-100 uppercase tracking-wide">Santri Aktif</p>
            </div>
            <div class="text-center lg:text-left">
              <p class="text-3xl md:text-4xl font-bold text-yellow-400">{{ loading ? '...' : stats.ustadz_berpengalaman }}+</p>
              <p class="mt-1 text-xs md:text-sm font-medium text-emerald-100 uppercase tracking-wide">Pengajar</p>
            </div>
            <div class="text-center lg:text-left">
              <p class="text-3xl md:text-4xl font-bold text-yellow-400">{{ loading ? '...' : stats.tahun_berdiri }}+</p>
              <p class="mt-1 text-xs md:text-sm font-medium text-emerald-100 uppercase tracking-wide">Tahun Berdiri</p>
            </div>
          </div>
        </div>

        <div class="hidden lg:block relative h-full w-full">
           <div class="absolute right-0 top-1/2 -translate-y-1/2 w-[120%] aspect-square bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>
           <div class="grid grid-cols-2 gap-4 relative z-10 transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
              <img :src="'/welcome5.jpeg'" alt="Kegiatan Santri" class="mt-12 w-full h-48 md:h-64 object-cover rounded-2xl shadow-2xl border-4 border-white/10" @error="$event.target.style.display='none'"/>
              <img :src="'/welcome2.JPG'" alt="Santri Hafidz" class="w-full h-48 md:h-64 object-cover rounded-2xl shadow-2xl border-4 border-white/10" @error="$event.target.style.display='none'"/>
           </div>
        </div>
      </div>
    </section>

    <!-- Program Unggulan (Migrated Text) -->
    <section class="py-16 md:py-24 bg-white relative">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span class="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Program Integrasi</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight">Program Unggulan</h2>
          <p class="mt-4 text-slate-600 text-base md:text-lg leading-relaxed">Kurikulum komprehensif yang memadukan Tahfidz, pendidikan Diniyyah, pendidikan Formal, dan pengembangan karakter.</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="(prog, idx) in homeContent.programs.length ? homeContent.programs : defaultPrograms" :key="idx" class="group rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl transition bg-white">
            <div class="aspect-[4/3] w-full overflow-hidden relative">
              <div class="absolute inset-0 bg-emerald-900/40 z-10 transition group-hover:bg-emerald-900/10"></div>
              <img :src="getProgramImage(prog.title)" :alt="prog.title" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform" onerror="this.src='/drone2.JPG'"/>
              <div class="absolute bottom-0 left-0 w-full p-6 z-20 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent">
                <h3 class="text-xl font-bold text-white leading-tight">{{ prog.title }}</h3>
              </div>
            </div>
            <div class="p-6">
              <p class="text-sm text-slate-600 leading-relaxed">{{ prog.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Video Profile Section -->
    <section class="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full blur-[80px] opacity-20"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-500 rounded-full blur-[80px] opacity-20"></div>
      
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">
          <div class="order-2 lg:order-1">
            <div class="rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 aspect-video bg-black relative">
              <iframe
                class="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/CtrcqPfah-E?rel=0&modestbranding=1&showinfo=0"
                title="Pondok Pesantren Ibnu Hafidz"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>
          <div class="order-1 lg:order-2 text-center lg:text-left">
            <span class="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold tracking-wider uppercase mb-4 border border-emerald-400/30">Video Profile</span>
            <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">Kenali Ibnu Hafidz Lebih Dekat</h2>
            <p class="text-emerald-50 max-w-2xl mx-auto lg:mx-0 text-base md:text-lg leading-relaxed mb-8">
              Saksikan gambaran lengkap tentang kehidupan santri, program pendidikan, fasilitas modern, dan suasana islami yang menjadi ciri khas Pondok Pesantren Ibnu Hafidz.
            </p>
            <div class="space-y-4 text-left max-w-xl mx-auto lg:mx-0">
              <div class="flex items-start gap-4">
                <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                </div>
                <p class="text-emerald-100 text-sm md:text-base">Tahfidz intensif dengan pendampingan harian dan musyrif tersertifikasi.</p>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                </div>
                <p class="text-emerald-100 text-sm md:text-base">Kurikulum formal dan Diniyyah yang berjalan seimbang terintegrasi.</p>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                </div>
                <p class="text-emerald-100 text-sm md:text-base">Lingkungan asrama kondusif untuk pembiasaan ibadah sunnah dan adab.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Galeri Pesantren -->
    <section class="py-16 md:py-24 bg-emerald-50 overflow-hidden">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 md:mb-14 text-center">
        <span class="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Galeri Pesantren</span>
        <h2 class="text-3xl md:text-4xl font-extrabold text-slate-800">Suasana Kehidupan Santri</h2>
        <p class="mt-4 text-slate-600 text-base md:text-lg max-w-2xl mx-auto">Potret kegiatan, lingkungan belajar, dan atmosfer pesantren yang mendukung pembentukan hafalan dan adab.</p>
      </div>

      <!-- Marquee Wrapper for Mobile/Desktop seamless flow -->
      <div class="relative w-full overflow-hidden flex flex-col gap-6">
        <!-- Top Track -->
        <div class="flex animate-marquee whitespace-nowrap w-max">
          <div v-for="(img, idx) in marqueeTrack1" :key="idx" class="mx-3 w-64 md:w-80 flex-none rounded-2xl md:rounded-[32px] overflow-hidden shadow-lg border-2 border-white/50 bg-white">
            <img :src="img.src" :alt="img.alt" loading="lazy" decoding="async" class="w-full h-48 md:h-64 object-cover" onerror="this.src='/welcome2.JPG'"/>
          </div>
        </div>
      </div>
      <div class="mt-10 text-center">
        <router-link to="/gallery/photo" class="inline-flex items-center text-emerald-700 font-bold hover:text-emerald-800">
          Lihat Semua Galeri
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </router-link>
      </div>
    </section>

    <!-- News / Articles -->
    <section class="py-16 md:py-24 bg-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
         <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
           <div>
             <span class="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Update Terkini</span>
             <h2 class="text-3xl md:text-4xl font-extrabold text-slate-800">Berita & Artikel</h2>
           </div>
           <router-link to="/all-article" class="hidden md:inline-flex items-center px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-full transition">
              Lihat Berita Lainnya
           </router-link>
         </div>

         <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
           <article v-for="(art, idx) in displayedArticles" :key="idx" class="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition group flex flex-col">
             <div class="h-48 bg-slate-200 overflow-hidden relative">
               <img v-if="art.gambar || art.thumbnail" :src="getArticleImage(art.gambar || art.thumbnail)" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
               <div v-else class="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-200 group-hover:scale-105 transition duration-500">
                 <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/></svg>
               </div>
             </div>
             <div class="p-6 flex-grow flex flex-col">
               <span class="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">{{ art.category?.name || 'Berita' }}</span>
               <h3 class="text-lg font-bold text-slate-800 mb-3 line-clamp-2">{{ art.title }}</h3>
               <p class="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow">{{ art.excerpt || 'Baca artikel terbaru dari lingkungan pondok pesantren Ibnu Hafidz.' }}</p>
               <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                 <span class="text-xs text-slate-500 font-medium">{{ formatDate(art.published_at || art.created_at) }}</span>
                 <router-link :to="'/berita/' + art.slug" class="text-sm font-bold text-emerald-600 hover:text-emerald-800">Baca Selengkapnya</router-link>
               </div>
             </div>
           </article>

           <div v-if="!displayedArticles.length && !loading" class="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-500">
             Belum ada artikel terbaru.
           </div>
         </div>

         <!-- Mobile View More -->
         <div class="mt-8 text-center md:hidden">
            <router-link to="/all-article" class="inline-flex w-full items-center justify-center px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition">
              Lihat Berita Lainnya
           </router-link>
         </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 35s linear infinite;
}
.animate-marquee:hover {
  animation-play-state: paused;
}
</style>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchPublicHome } from '@/api/public'
import { normalizePublicMediaUrl } from '@/utils/mediaUrl'

const loading = ref(true)
const error = ref('')
const stats = ref({
  santri_aktif: 250,
  ustadz_berpengalaman: 35,
  tahun_berdiri: 2018,
})
const heroImages = ref([])
const articles = ref([])

const defaultPrograms = [
  { title: 'Tahfidz Sangat Intensif', description: 'Program tahfidz terbagi menjadi kelas ziyadah, murajaah, dan mutqin.' },
  { title: 'Kajian Kitab Kuning', description: 'Pembelajaran kitab standar khas pesantren untuk membentuk pemahaman agama yang lurus.' },
  { title: 'Lancar Bahasa Arab dan Inggris', description: 'Lingkungan berbahasa Arab dan Inggris untuk komunikasi harian santri.' },
  { title: 'Bimbingan Kuliah ke Luar Negeri', description: 'Bimbingan intensif bagi santri yang ingin melanjutkan studi ke Timur Tengah.' }
]

const programImageMap = {
  'Tahfidz Sangat Intensif': '/tahfidz.webp',
  'Program Tahfidz Sangat Intensif': '/tahfidz.webp',
  'Kajian Kitab Kuning': '/kajian_kitab.webp',
  'Lancar Bahasa Arab dan Inggris': '/arab.webp',
  'Bimbingan Kuliah ke Luar Negeri': '/luar_negri.webp',
}

const homeContent = ref({
  programs: defaultPrograms
})

const fallbackHeroImages = [
  { src: '/welcome2.JPG', alt: 'Santri Tahfidz' },
  { src: '/welcome5.jpeg', alt: 'Kegiatan Pondok' },
  { src: '/drone2.JPG', alt: 'Area Pesantren' },
  { src: '/tahfidz.webp', alt: 'Setoran Hafalan' },
  { src: '/jadwal.jpeg', alt: 'Jadwal Santri' }
]

const marqueeTrack1 = computed(() => {
  const source = heroImages.value.length
    ? heroImages.value.map((i) => ({ src: normalizePublicMediaUrl(i.path), alt: i.title }))
    : fallbackHeroImages
  return [...source, ...source] // 2x is enough for seamless looping
})

function getArticleImage(path) {
  return normalizePublicMediaUrl(path, '/welcome2.JPG')
}

const displayedArticles = computed(() => articles.value.slice(0, 3))

function formatDate(dateValue) {
  if (!dateValue) return '-'
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function getProgramImage(title) {
  return programImageMap[title] || '/welcome2.JPG'
}

onMounted(async () => {
  try {
    const data = await fetchPublicHome()
    if (data.stats) stats.value = data.stats
    if (data.hero_images && data.hero_images.length) heroImages.value = data.hero_images
    if (data.articles && data.articles.length) articles.value = data.articles
  } catch (err) {
    console.error('Home load error:', err)
  } finally {
    loading.value = false
  }
})
</script>
