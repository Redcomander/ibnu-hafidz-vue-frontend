<template>
  <div class="bg-gray-50 text-slate-900">
    <section class="bg-gradient-to-br from-emerald-700 to-emerald-900 py-14 text-white">
      <div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 class="text-4xl font-extrabold md:text-5xl">Gallery Videos</h1>
        <p class="mt-3 text-white/90">Koleksi video kegiatan dan momen berharga Pondok Pesantren Ibnu Hafidz</p>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="rounded-2xl bg-white p-5 shadow-md">
        <div class="grid gap-4 md:grid-cols-[1fr_170px_220px_220px]">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Cari video..."
            class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <select
            v-model="filters.sort"
            class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
          </select>
          <select
            v-model="filters.source"
            class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Source</option>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="upload">Uploaded</option>
            <option value="url">URL</option>
          </select>
          <select
            v-model="filters.album"
            class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Albums</option>
            <option v-for="album in albums" :key="album.id" :value="album.slug">{{ album.title }}</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="py-12 text-center text-slate-500">Memuat galeri video...</div>
      <div v-else-if="error" class="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>
      <div v-else-if="!sortedItems.length" class="mt-8 rounded-2xl bg-white p-8 text-center text-slate-600 shadow">Belum ada video yang tersedia.</div>

      <div v-else class="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <article
          v-for="item in sortedItems"
          :key="item.id"
          class="overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
        >
          <button type="button" class="relative block w-full" @click="openVideo(item)">
            <img :src="thumbnailFor(item)" :alt="item.title" class="aspect-video w-full object-cover" />
            <div class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition hover:opacity-100">
              <div class="rounded-full bg-white/90 p-3 text-emerald-700">▶</div>
            </div>
          </button>
          <div class="p-4">
            <h3 class="line-clamp-2 text-sm font-semibold text-slate-900">{{ item.title }}</h3>
            <p class="mt-2 text-xs uppercase tracking-[0.1em] text-slate-500">{{ item.source }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ formatDate(item.created_at) }}</p>
          </div>
        </article>
      </div>

      <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          class="rounded-full border border-slate-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="page <= 1"
          @click="page -= 1"
        >
          Sebelumnya
        </button>
        <span class="text-sm text-slate-600">Halaman {{ page }} dari {{ totalPages }}</span>
        <button
          type="button"
          class="rounded-full border border-slate-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="page >= totalPages"
          @click="page += 1"
        >
          Berikutnya
        </button>
      </div>
    </section>

    <div
      v-if="activeVideo"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4"
      @click.self="activeVideo = null"
    >
      <div class="w-full max-w-5xl">
        <div class="aspect-video overflow-hidden rounded-2xl bg-black">
          <iframe
            v-if="isEmbeddable(activeVideo)"
            :src="embedUrl(activeVideo)"
            class="h-full w-full"
            title="Video preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
          <video v-else controls class="h-full w-full">
            <source :src="activeVideo.path" />
          </video>
        </div>
        <p class="mt-4 text-center text-white">{{ activeVideo.title }}</p>
        <div class="mt-4 text-center">
          <button type="button" class="rounded-full bg-white/10 px-4 py-2 text-sm text-white" @click="activeVideo = null">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { fetchPublicGalleryVideo } from '@/api/public'

const loading = ref(false)
const error = ref('')
const items = ref([])
const albums = ref([])
const page = ref(1)
const perPage = 20
const total = ref(0)
const activeVideo = ref(null)

const filters = ref({
  search: '',
  source: 'all',
  album: '',
  sort: 'latest',
})

const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / perPage)))

const sortedItems = computed(() => {
  const cloned = [...items.value]
  const sort = filters.value.sort
  if (sort === 'oldest') {
    cloned.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  } else if (sort === 'title_asc') {
    cloned.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'id'))
  } else if (sort === 'title_desc') {
    cloned.sort((a, b) => String(b.title || '').localeCompare(String(a.title || ''), 'id'))
  } else {
    cloned.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  return cloned
})

function formatDate(value) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function thumbnailFor(item) {
  if (!item?.path) return '/welcome2.JPG'
  if (item.source === 'youtube') {
    const id = extractYouTubeId(item.path)
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '/welcome2.JPG'
  }
  if (item.source === 'upload' || item.source === 'url') {
    return '/welcome5.jpeg'
  }
  return '/welcome2.JPG'
}

function extractYouTubeId(url) {
  if (!url) return ''
  const pattern = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/
  const match = String(url).match(pattern)
  return match?.[1] || ''
}

function isEmbeddable(item) {
  return ['youtube', 'instagram', 'tiktok', 'url'].includes(item.source)
}

function embedUrl(item) {
  const raw = item?.path || ''
  if (item.source === 'youtube') {
    const id = extractYouTubeId(raw)
    return id ? `https://www.youtube.com/embed/${id}` : raw
  }
  if (item.source === 'instagram') {
    return raw
  }
  if (item.source === 'tiktok') {
    return raw
  }
  return raw
}

function openVideo(item) {
  activeVideo.value = item
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchPublicGalleryVideo({
      page: page.value,
      per_page: perPage,
      search: filters.value.search || undefined,
      source: filters.value.source || 'all',
      album: filters.value.album || undefined,
    })

    items.value = data.items || []
    albums.value = data.albums || []
    total.value = Number(data.total || 0)
  } catch (err) {
    error.value = err?.response?.data?.message || 'Gagal mengambil data galeri video.'
  } finally {
    loading.value = false
  }
}

watch([page, filters], loadData, { deep: true, immediate: true })
watch(
  () => [filters.value.search, filters.value.source, filters.value.album],
  () => {
    page.value = 1
  },
)
</script>
