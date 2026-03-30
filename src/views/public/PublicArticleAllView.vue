<template>
  <div class="min-h-screen bg-slate-50 pb-16">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white py-16 md:py-24 relative overflow-hidden">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 class="text-3xl md:text-5xl font-extrabold mb-4">Berita & Artikel</h1>
        <p class="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto">Kumpulan berita, informasi pesantren, dan artikel islami terbaru.</p>
      </div>
    </section>

    <!-- Content -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
      
      <!-- Search & Filters -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="w-full md:w-1/2 relative">
          <input 
            v-model="searchQuery" 
            @input="debounceSearch"
            type="text" 
            placeholder="Cari artikel..." 
            class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          >
          <svg class="w-6 h-6 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="n in 6" :key="n" class="bg-white rounded-3xl shadow p-4 animate-pulse">
          <div class="w-full h-48 bg-slate-200 rounded-2xl mb-4"></div>
          <div class="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
          <div class="h-4 bg-slate-200 rounded w-full mb-2"></div>
          <div class="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
          <div class="flex gap-2">
            <div class="h-8 bg-slate-200 rounded-full w-20"></div>
          </div>
        </div>
      </div>

      <!-- Articles Grid -->
      <div v-else-if="articles.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <article v-for="article in articles" :key="article.id" class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-slate-100 flex flex-col h-full group">
          <router-link :to="'/berita/' + article.slug" class="block aspect-video overflow-hidden relative">
            <img v-if="article.gambar || article.thumbnail" :src="articleImage(article.gambar || article.thumbnail)" :alt="article.title" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy">
            <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <div v-if="article.category" class="absolute top-4 left-4">
              <span class="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 shadow-sm">{{ article.category.name }}</span>
            </div>
          </router-link>
          
          <div class="p-6 flex flex-col flex-grow">
            <!-- Meta info -->
            <div class="flex items-center text-xs text-slate-500 mb-3 space-x-4">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1 pb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {{ formatDate(article.published_at || article.created_at) }}
              </span>
              <span class="flex items-center" v-if="article.author">
                <svg class="w-4 h-4 mr-1 pb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                {{ article.author.name }}
              </span>
            </div>

            <!-- Title -->
            <router-link :to="'/berita/' + article.slug" class="block">
              <h3 class="text-xl font-bold text-slate-800 mb-3 leading-snug line-clamp-2 group-hover:text-emerald-600 transition">{{ article.title }}</h3>
            </router-link>
            
            <!-- Description -->
            <p class="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow">{{ stripHtml(article.content || article.body) }}</p>
            
            <!-- Read More -->
            <div class="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
              <router-link :to="'/berita/' + article.slug" class="inline-flex items-center text-emerald-600 font-bold text-sm hover:text-emerald-700 transition">
                Baca Selengkapnya
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </router-link>
              
              <span class="text-xs text-slate-400 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                {{ article.views || 0 }}x
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-2xl shadow-sm p-16 text-center border border-slate-100">
        <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">Tidak Ada Artikel</h3>
        <p class="text-slate-500 max-w-md mx-auto">Kami tidak menemukan artikel yang sesuai dengan pencarian Anda. Coba kata kunci lain.</p>
        <button v-if="searchQuery" @click="resetSearch" class="mt-6 px-6 py-2.5 bg-emerald-100 text-emerald-700 font-bold rounded-full hover:bg-emerald-200 transition">
          Reset Pencarian
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-12 flex justify-center items-center space-x-2">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        
        <div class="flex items-center mx-2 space-x-1">
          <button 
            v-for="page in displayedPages" 
            :key="page"
            @click="page !== '...' ? changePage(page) : null"
            :class="[
              'w-10 h-10 rounded-xl font-bold transition flex items-center justify-center',
              page === currentPage 
                ? 'bg-emerald-600 text-white shadow-md' 
                : page === '...'
                  ? 'text-slate-400 cursor-default'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchPublicArticles } from '@/api/public'
import { normalizePublicMediaUrl } from '@/utils/mediaUrl'

const articles = ref([])
const loading = ref(true)
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
let searchTimeout = null

const loadArticles = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: 9,
    }
    
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    
    const data = await fetchPublicArticles(params)
    articles.value = data.articles || []
    totalPages.value = data.total_pages || 1
  } catch (err) {
    console.error('Failed to load articles:', err)
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadArticles()
  }, 500)
}

const resetSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  loadArticles()
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadArticles()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Compute pagination to show something like: 1 2 3 ... 10
const displayedPages = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  
  if (current <= 3) {
    return [1, 2, 3, 4, '...', total]
  }
  
  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total]
  }
  
  return [1, '...', current - 1, current, current + 1, '...', total]
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const stripHtml = (html) => {
  if (!html) return ''
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const articleImage = (path) => normalizePublicMediaUrl(path, '/welcome2.JPG')

onMounted(() => {
  loadArticles()
})
</script>
