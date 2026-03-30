<template>
  <div class="bg-gray-50 text-slate-900">
    <section class="bg-gradient-to-br from-emerald-700 to-emerald-900 py-14 text-white">
      <div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 class="text-4xl font-extrabold md:text-5xl">Gallery Photo</h1>
        <p class="mt-3 text-white/90">Dokumentasi kegiatan dan momen Pondok Pesantren Tahfidz Ibnu Hafidz</p>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="rounded-2xl bg-white p-5 shadow-md">
        <div class="grid gap-4 md:grid-cols-[1fr_220px]">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Cari foto..."
            class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <select
            v-model="filters.album"
            class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Semua Album</option>
            <option v-for="album in albums" :key="album.id" :value="album.slug">{{ album.title }}</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="py-12 text-center text-slate-500">Memuat galeri foto...</div>
      <div v-else-if="error" class="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>
      <div v-else-if="!items.length" class="mt-8 rounded-2xl bg-white p-8 text-center text-slate-600 shadow">Belum ada foto yang tersedia.</div>

      <div v-else class="mt-8 columns-2 gap-4 md:columns-3 lg:columns-4 xl:columns-5">
        <article
          v-for="item in items"
          :key="item.id"
          class="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg"
        >
          <button type="button" class="block w-full" @click="activeIndex = items.findIndex((it) => it.id === item.id)">
            <img :src="toImageUrl(item)" :alt="item.title" class="h-auto w-full object-cover" />
          </button>
          <div class="px-3 py-2 text-xs text-slate-500">
            {{ formatDate(item.created_at) }}
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
      v-if="activeItem"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4"
      @click.self="activeIndex = -1"
    >
      <button type="button" class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white" @click.stop="prevImage">&#10094;</button>
      <div class="max-w-[90vw]">
        <img :src="toImageUrl(activeItem)" :alt="activeItem.title" class="max-h-[85vh] w-auto max-w-full rounded-lg object-contain" />
        <p class="mt-4 text-center text-sm text-white/80">{{ activeItem.title }}</p>
      </div>
      <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white" @click.stop="nextImage">&#10095;</button>
      <button type="button" class="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-white" @click="activeIndex = -1">Tutup</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { fetchPublicGalleryPhoto } from '@/api/public'
import { normalizePublicMediaUrl } from '@/utils/mediaUrl'

const loading = ref(false)
const error = ref('')
const items = ref([])
const albums = ref([])
const page = ref(1)
const perPage = 20
const total = ref(0)
const activeIndex = ref(-1)

const filters = ref({
  search: '',
  album: '',
})

const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / perPage)))
const activeItem = computed(() => (activeIndex.value >= 0 ? items.value[activeIndex.value] : null))

function toImageUrl(item) {
  if (item?.webp_path) return normalizePublicMediaUrl(item.webp_path, '')
  return normalizePublicMediaUrl(item?.path, '')
}

function formatDate(value) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function prevImage() {
  if (!items.value.length) return
  activeIndex.value = (activeIndex.value - 1 + items.value.length) % items.value.length
}

function nextImage() {
  if (!items.value.length) return
  activeIndex.value = (activeIndex.value + 1) % items.value.length
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchPublicGalleryPhoto({
      page: page.value,
      per_page: perPage,
      search: filters.value.search || undefined,
      album: filters.value.album || undefined,
    })

    items.value = data.items || []
    albums.value = data.albums || []
    total.value = Number(data.total || 0)
  } catch (err) {
    error.value = err?.response?.data?.message || 'Gagal mengambil data galeri foto.'
  } finally {
    loading.value = false
  }
}

watch([page, filters], loadData, { deep: true, immediate: true })
watch(
  () => [filters.value.search, filters.value.album],
  () => {
    page.value = 1
  },
)
</script>
