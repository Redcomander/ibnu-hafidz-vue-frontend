<template>
  <div class="bg-gray-50 text-slate-900">
    <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <h1 class="text-center text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">Galeri Prestasi Siswa</h1>
        <p class="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">
          Jelajahi pencapaian luar biasa siswa-siswi kami dalam berbagai bidang.
        </p>

        <div class="mt-10 grid gap-4 md:grid-cols-[1fr_220px_220px]">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Cari prestasi..."
            class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
          />
          <select
            v-model="filters.kategori"
            class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Semua Kategori</option>
            <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
          </select>
          <select
            v-model="filters.tingkat"
            class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Semua Tingkat</option>
            <option v-for="item in levels" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>

        <div v-if="loading" class="mt-12 text-center text-slate-500">Memuat data prestasi...</div>
        <div v-else-if="error" class="mt-12 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>

        <div v-else-if="!items.length" class="mt-12 rounded-2xl bg-white p-10 text-center text-slate-600 shadow">
          <p class="text-xl font-semibold">Tidak ada prestasi yang ditampilkan saat ini.</p>
          <p class="mt-2">Silakan kembali lagi nanti untuk melihat pencapaian terbaru kami.</p>
        </div>

        <div v-else class="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
          <article
            v-for="item in items"
            :key="item.id"
            class="group mb-6 break-inside-avoid overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
          >
            <img
              v-if="item.photo_path"
              :src="toMediaUrl(item.photo_path)"
              :alt="item.nama_prestasi"
              class="h-auto w-full object-cover"
            />
            <div v-else class="flex h-52 items-center justify-center bg-slate-200 text-slate-500">Tidak ada foto</div>

            <div class="p-5">
              <h3 class="text-xl font-bold text-slate-900">{{ item.nama_prestasi }}</h3>
              <p class="mt-2 text-sm text-slate-600"><span class="font-semibold">Santri:</span> {{ item.student?.nama_lengkap || 'Umum' }}</p>
              <p class="mt-1 text-sm text-slate-600"><span class="font-semibold">Tanggal:</span> {{ formatDate(item.tanggal) }}</p>
              <p v-if="item.deskripsi" class="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{{ item.deskripsi }}</p>
              <button
                type="button"
                class="mt-4 inline-flex rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                @click="selected = item"
              >
                Lihat Detail
              </button>
            </div>
          </article>
        </div>

        <div v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-3">
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
      </div>
    </section>

    <div
      v-if="selected"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      @click.self="selected = null"
    >
      <div class="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <img
          v-if="selected.photo_path"
          :src="toMediaUrl(selected.photo_path)"
          :alt="selected.nama_prestasi"
          class="max-h-[55vh] w-full object-contain bg-slate-100"
        />
        <div class="p-6">
          <h3 class="text-2xl font-bold text-slate-900">{{ selected.nama_prestasi }}</h3>
          <p class="mt-2 text-sm text-slate-600"><span class="font-semibold">Santri:</span> {{ selected.student?.nama_lengkap || 'Umum' }}</p>
          <p class="mt-1 text-sm text-slate-600"><span class="font-semibold">Kategori:</span> {{ selected.kategori }}</p>
          <p class="mt-1 text-sm text-slate-600"><span class="font-semibold">Tingkat:</span> {{ selected.tingkat || '-' }}</p>
          <p class="mt-1 text-sm text-slate-600"><span class="font-semibold">Tanggal:</span> {{ formatDate(selected.tanggal) }}</p>
          <p v-if="selected.deskripsi" class="mt-4 text-sm leading-7 text-slate-700">{{ selected.deskripsi }}</p>
          <div class="mt-5 text-right">
            <button type="button" class="rounded-full bg-slate-800 px-5 py-2 text-sm font-semibold text-white" @click="selected = null">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { fetchPublicPrestasi } from '@/api/public'
import { normalizePublicMediaUrl } from '@/utils/mediaUrl'

const loading = ref(false)
const error = ref('')
const items = ref([])
const categories = ref([])
const levels = ref([])
const selected = ref(null)
const page = ref(1)
const perPage = 12
const total = ref(0)

const filters = ref({
  search: '',
  kategori: '',
  tingkat: '',
})

const totalPages = computed(() => {
  if (!total.value) return 1
  return Math.max(1, Math.ceil(total.value / perPage))
})

function toMediaUrl(path) {
  return normalizePublicMediaUrl(path, '')
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const parsed = new Date(dateStr)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchPublicPrestasi({
      page: page.value,
      per_page: perPage,
      search: filters.value.search || undefined,
      kategori: filters.value.kategori || undefined,
      tingkat: filters.value.tingkat || undefined,
    })

    items.value = data.items || []
    categories.value = data.categories || []
    levels.value = data.levels || []
    total.value = Number(data.total || 0)
  } catch (err) {
    error.value = err?.response?.data?.message || 'Gagal mengambil data prestasi.'
  } finally {
    loading.value = false
  }
}

watch([page, filters], loadData, { deep: true, immediate: true })
watch(
  () => [filters.value.search, filters.value.kategori, filters.value.tingkat],
  () => {
    page.value = 1
  },
)
</script>
