<template>
  <div class="public-shell min-h-screen bg-gray-50 text-slate-900">
    <!-- Navbar -->
    <nav
      id="main-nav"
      :class="[
        'public-nav z-40 transition-all duration-300',
        navScrolled
          ? 'fixed inset-x-0 top-0 bg-emerald-900/95 backdrop-blur-md shadow-xl'
          : 'relative bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700',
      ]"
    >
      <!-- Scroll Progress Bar -->
      <div class="absolute bottom-0 left-0 h-[2px] bg-yellow-400/80 transition-all duration-150" :style="{ width: `${scrollProgress}%` }"></div>

      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">

          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-2.5 flex-shrink-0">
            <img
              :class="['w-auto transition-all duration-300', navScrolled ? 'h-9' : 'h-10']"
              src="/logo_putih.png"
              alt="Ibnu Hafidz"
            />
            <div class="hidden sm:flex flex-col leading-tight">
              <span class="font-heading text-sm font-bold tracking-widest text-white">IBNU HAFIDZ</span>
              <span class="text-[10px] uppercase tracking-[0.2em] text-emerald-200/80">Pondok Pesantren Tahfidz</span>
            </div>
          </router-link>

          <!-- Desktop Nav Links -->
          <div class="hidden md:flex items-center gap-1">
            <router-link to="/" :class="navLinkClass('/')">Beranda</router-link>
            <router-link to="/profil" :class="navLinkClass('/profil')">Profil</router-link>
            <router-link to="/all-article" :class="navLinkClass('/all-article')">Artikel</router-link>
            <a href="/galeri-prestasi" :class="navLinkClass('/galeri-prestasi')">Prestasi</a>

            <!-- Gallery Dropdown -->
            <div class="relative" @mouseenter="galleryOpen = true" @mouseleave="galleryOpen = false">
              <button :class="[navLinkClass('/gallery'), 'inline-flex items-center gap-1']">
                Galeri
                <svg :class="['h-3.5 w-3.5 transition-transform duration-200', galleryOpen ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <transition
                enter-active-class="transition ease-out duration-150"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-1"
              >
                <div v-if="galleryOpen" class="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-40 z-50">
                  <div class="rounded-xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
                    <a href="/gallery/photo" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition">
                      <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      Foto
                    </a>
                    <a href="/gallery/video" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition">
                      <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                      Video
                    </a>
                  </div>
                </div>
              </transition>
            </div>

            <a
              href="https://pendaftaran.ibnuhafidz.ponpes.id/"
              target="_blank"
              rel="noopener noreferrer"
              class="ml-2 inline-flex items-center rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-bold text-emerald-900 shadow hover:bg-yellow-300 transition duration-200"
            >
              Daftar Sekarang
            </a>
          </div>

          <!-- Mobile Hamburger -->
          <button
            aria-label="Toggle menu"
            class="flex md:hidden items-center justify-center w-9 h-9 rounded-lg text-white hover:bg-white/10 transition"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg v-if="!mobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu Drawer -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mobileMenuOpen" class="md:hidden bg-emerald-800/98 backdrop-blur-sm border-t border-white/10">
          <div class="max-w-7xl mx-auto px-4 py-4 space-y-0.5">
            <router-link to="/" :class="mobileNavLinkClass('/')" @click="mobileMenuOpen = false">Beranda</router-link>
            <router-link to="/profil" :class="mobileNavLinkClass('/profil')" @click="mobileMenuOpen = false">Profil</router-link>
            <router-link to="/all-article" :class="mobileNavLinkClass('/all-article')" @click="mobileMenuOpen = false">Artikel</router-link>
            <a href="/galeri-prestasi" :class="mobileNavLinkClass('/galeri-prestasi')" @click="mobileMenuOpen = false">Prestasi</a>

            <!-- Mobile Gallery Submenu -->
            <button :class="[mobileNavLinkClass('/gallery'), 'w-full flex items-center justify-between']" @click="mobileGalleryOpen = !mobileGalleryOpen">
              <span>Galeri</span>
              <svg :class="['h-4 w-4 transition-transform duration-200', mobileGalleryOpen ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div v-if="mobileGalleryOpen" class="pl-4 space-y-0.5">
              <a href="/gallery/photo" class="block rounded-lg px-3 py-2 text-sm text-emerald-100 hover:bg-white/10 transition" @click="mobileMenuOpen = false">Foto</a>
              <a href="/gallery/video" class="block rounded-lg px-3 py-2 text-sm text-emerald-100 hover:bg-white/10 transition" @click="mobileMenuOpen = false">Video</a>
            </div>

            <div class="pt-3 pb-1">
              <a
                href="https://pendaftaran.ibnuhafidz.ponpes.id/"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center rounded-full bg-yellow-400 px-6 py-2.5 text-sm font-bold text-emerald-900"
                @click="mobileMenuOpen = false"
              >
                Daftar Sekarang
              </a>
            </div>
          </div>
        </div>
      </transition>
    </nav>

    <main :class="['flex-grow transition-all duration-300', navScrolled ? 'pt-16' : 'pt-0']">
      <router-view />
    </main>

    <footer class="public-footer relative bg-gray-800 text-white">
      <div class="mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div class="md:col-span-1">
            <img src="/logo_putih.png" alt="Pondok Pesantren Ibnu Hafidz" class="h-16 w-auto" />
            <p class="mt-4 text-sm text-gray-300">
              Membentuk generasi Qurani yang berakhlak mulia, berwawasan luas, dan siap menghadapi tantangan global.
            </p>
            <div class="mt-6 flex space-x-4">
              <a href="https://www.facebook.com/ponpesibnuhafidz/" target="_blank" rel="noopener noreferrer" class="social-icon text-gray-300 hover:text-green-500" aria-label="Facebook">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.6c0-.9.2-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.4-4.1 4.2v2.4H7.5v3.2h2.8V22h3.2z" /></svg>
              </a>
              <a href="https://www.instagram.com/ponpesibnuhafidz/" target="_blank" rel="noopener noreferrer" class="social-icon text-gray-300 hover:text-green-500" aria-label="Instagram">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2.2A2.8 2.8 0 004.2 7v10A2.8 2.8 0 007 19.8h10a2.8 2.8 0 002.8-2.8V7A2.8 2.8 0 0017 4.2H7zm10.25 1.65a1.1 1.1 0 110 2.2 1.1 1.1 0 010-2.2zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2.2a2.8 2.8 0 100 5.6 2.8 2.8 0 000-5.6z" /></svg>
              </a>
              <a href="https://www.youtube.com/@ibnuhafidztv7314" target="_blank" rel="noopener noreferrer" class="social-icon text-gray-300 hover:text-green-500" aria-label="YouTube">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 00.5 6.2 31.8 31.8 0 000 12a31.8 31.8 0 00.5 5.8 3 3 0 002.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 002.1-2.1A31.8 31.8 0 0024 12a31.8 31.8 0 00-.5-5.8zM9.6 15.7V8.3l6.3 3.7-6.3 3.7z" /></svg>
              </a>
            </div>
          </div>

          <div>
            <h3 class="mb-4 border-b border-gray-700 pb-2 text-lg font-bold">Tautan Cepat</h3>
            <ul class="space-y-2">
              <li><router-link to="/" class="footer-link text-gray-300">Beranda</router-link></li>
              <li><router-link to="/profil" class="footer-link text-gray-300">Profil</router-link></li>
              <li><router-link to="/all-article" class="footer-link text-gray-300">Berita & Artikel</router-link></li>
              <li><a href="/galeri-prestasi" class="footer-link text-gray-300">Prestasi</a></li>
              <li><a href="/gallery/photo" class="footer-link text-gray-300">Galeri Foto</a></li>
              <li><a href="/gallery/video" class="footer-link text-gray-300">Galeri Video</a></li>
              <li><a href="https://pendaftaran.ibnuhafidz.ponpes.id/" target="_blank" rel="noopener noreferrer" class="footer-link text-gray-300">Pendaftaran</a></li>

            </ul>
          </div>

          <div>
            <h3 class="mb-4 border-b border-gray-700 pb-2 text-lg font-bold">Program Unggulan</h3>
            <ul class="space-y-2 text-gray-300">
              <li>Tahfidz Al-Quran Intensif</li>
              <li>Kajian Kitab dan Diniyyah</li>
              <li>Pendidikan Formal Terpadu</li>
              <li>Pembinaan Bahasa Arab dan Inggris</li>
            </ul>
          </div>

          <div>
            <h3 class="mb-4 border-b border-gray-700 pb-2 text-lg font-bold">Hubungi Kami</h3>
            <ul class="space-y-3 text-gray-300">
              <li class="flex items-start gap-3">
                <svg class="mt-1 h-4 w-4 flex-none text-green-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.1 2 5 5.1 5 9c0 5 7 13 7 13s7-8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" /></svg>
                <span>Sukamulya, RT.25/RW.06, Rancadaka, Kec. Pusakanagara, Kabupaten Subang, Jawa Barat 41255</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-1 h-4 w-4 flex-none text-green-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.5 15.5 0 006.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1 .3 2 .5 3.1.5.7 0 1.2.5 1.2 1.2V20c0 .7-.5 1.2-1.2 1.2C10.5 21.2 2.8 13.5 2.8 4.2 2.8 3.5 3.3 3 4 3h3.4c.7 0 1.2.5 1.2 1.2 0 1.1.2 2.1.5 3.1.1.4 0 .9-.3 1.2l-2.2 2.3z" /></svg>
                <a href="https://wa.me/6281212272775?text=Assalamu'alaikum%20Warahmatullahi%20Wabarakatuh.%0ASaya%20ingin%20bertanya%20lebih%20lanjut%20tentang%20Pondok%20Pesantren%20Ibnu%20Hafidz." target="_blank" rel="noopener noreferrer" class="hover:underline">+62 812-1227-2775</a>
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-1 h-4 w-4 flex-none text-green-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.8A10.2 10.2 0 1012 22.2 10.2 10.2 0 0012 1.8zm.8 10.6V7.2h-1.6v6.2l5.3 3.2.8-1.3-4.5-2.9z" /></svg>
                <span>Senin - Ahad: (24 Jam)</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="my-8 border-t border-gray-700"></div>

        <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p class="text-sm text-gray-400">&copy; {{ currentYear }} Pondok Pesantren Ibnu Hafidz. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'

const route = useRoute()
const theme = useThemeStore()
const mobileMenuOpen = ref(false)
const mobileGalleryOpen = ref(false)
const galleryOpen = ref(false)
const navScrolled = ref(false)
const scrollProgress = ref(0)
const currentYear = new Date().getFullYear()

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}

function navLinkClass(path) {
  const active = isActive(path)
  return [
    'relative px-3 py-1.5 text-xs font-medium tracking-wide transition-colors duration-200 rounded-md',
    active
      ? 'text-white after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4/5 after:h-0.5 after:bg-yellow-400 after:rounded-full'
      : 'text-white/75 hover:text-white',
  ]
}

function mobileNavLinkClass(path) {
  const active = isActive(path)
  return [
    'block rounded-lg px-3 py-2.5 text-sm font-medium transition',
    active ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white',
  ]
}

function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  scrollProgress.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
  navScrolled.value = scrollTop > 50
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'light')
  document.body.style.overflow = ''
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
  document.documentElement.setAttribute('data-theme', theme.isDark ? 'dark' : 'light')
  window.removeEventListener('scroll', handleScroll)
})

watch(mobileMenuOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (!isOpen) {
    mobileGalleryOpen.value = false
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cinzel:wght@700;800&family=Montserrat:wght@300;400;500;600;700&display=swap');

.public-shell {
  font-family: 'Montserrat', sans-serif;
}

.font-heading {
  font-family: 'Cinzel', serif;
}

/* Keep any remaining CSS that may exist below */
.admin-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  height: 0;
  background: linear-gradient(to bottom, rgba(76, 175, 80, 0.12), transparent);
  transition: height 0.3s ease;
  z-index: -1;
}

.admin-btn:hover::before {
  height: 100%;
}

.scroll-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1001;
  height: 3px;
  background: linear-gradient(to right, #ffeb3b, #ffc107);
  transition: width 0.2s ease;
}

.hamburger-icon {
  position: relative;
  height: 24px;
  width: 24px;
}

.hamburger-icon span {
  position: absolute;
  left: 0;
  display: block;
  height: 3px;
  width: 100%;
  border-radius: 9999px;
  background: white;
  transition: all 0.3s ease;
}

.hamburger-icon span:nth-child(1) {
  top: 4px;
}

.hamburger-icon span:nth-child(2) {
  top: 11px;
}

.hamburger-icon span:nth-child(3) {
  top: 18px;
}

.hamburger-icon.open span:nth-child(1) {
  top: 11px;
  transform: rotate(135deg);
}

.hamburger-icon.open span:nth-child(2) {
  opacity: 0;
  left: -60px;
}

.hamburger-icon.open span:nth-child(3) {
  top: 11px;
  transform: rotate(-135deg);
}

.footer-link {
  position: relative;
  transition: all 0.3s ease;
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 2px;
  width: 0;
  background-color: #4caf50;
  transition: width 0.3s ease;
}

.footer-link:hover {
  color: #4caf50;
}

.footer-link:hover::after {
  width: 100%;
}

.social-icon {
  transition: all 0.3s ease;
}

.social-icon:hover {
  transform: translateY(-5px);
}

@media (max-width: 767px) {
  .public-nav .nav-link.active {
    border-left: 4px solid #fff;
    background-color: rgba(255, 255, 255, 0.1);
    padding-left: calc(0.75rem + 4px);
  }
}
</style>
