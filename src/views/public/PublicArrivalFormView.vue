<template>
  <div class="max-w-3xl mx-auto px-4 py-10">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
      <h1 class="text-2xl font-bold text-slate-900">Form Kedatangan</h1>
      <p class="text-sm text-slate-500 mt-1">Catat kedatangan santri atau pengajar.</p>

      <div v-if="notice" :class="['mt-4 rounded-lg px-4 py-3 text-sm', notice.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200']">
        {{ notice.message }}
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="submitForm">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Tanggal Kedatangan</label>
          <input v-model="form.tanggal_kedatangan" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Jenis Kehadiran</label>
          <select v-model="form.arrival_type" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="student">Santri</option>
            <option value="user">Pengajar</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Gender</label>
          <select v-model="form.gender" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Semua</option>
            <option value="L">Banin (L)</option>
            <option value="P">Banat (P)</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Cari {{ form.arrival_type === 'student' ? 'Santri' : 'Pengajar' }}</label>
          <input
            v-model.trim="searchText"
            type="text"
            :placeholder="form.arrival_type === 'student' ? 'Ketik nama santri...' : 'Ketik nama pengajar...'"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >

          <div v-if="showResults" class="mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
            <button
              v-for="item in searchResults"
              :key="item.id"
              type="button"
              class="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
              @click="selectEntry(item)"
            >
              <div class="flex items-center justify-between gap-2">
                <span>{{ item.nama_lengkap || item.name }}</span>
                <span v-if="item.gender_label" class="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap" :class="item.gender_code === 'L' ? 'bg-blue-100 text-blue-700' : item.gender_code === 'P' ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-700'">
                  {{ item.gender_label }}
                </span>
              </div>
            </button>
            <div v-if="!searchResults.length" class="px-3 py-3 text-sm text-slate-500">Tidak ada hasil.</div>
          </div>
        </div>

        <div v-if="selectedName" class="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">
          Terpilih: <span class="font-semibold">{{ selectedName }}</span>
        </div>

        <button :disabled="submitting || !isValid" class="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5">
          {{ submitting ? 'Menyimpan...' : 'Simpan Kedatangan' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchPublicArrivalEntries, submitPublicArrival } from '@/api/arrivals'

const route = useRoute()
const token = computed(() => String(route.params.token || ''))

const form = ref({
  tanggal_kedatangan: new Date().toISOString().slice(0, 10),
  arrival_type: 'student',
  gender: '',
  student_id: null,
  user_id: null,
})

const submitting = ref(false)
const searchText = ref('')
const searchResults = ref([])
const selectedName = ref('')
const notice = ref(null)
let searchTimer = null

watch(() => form.value.arrival_type, () => {
  form.value.student_id = null
  form.value.user_id = null
  selectedName.value = ''
  searchText.value = ''
  searchResults.value = []
})

watch(() => form.value.gender, () => {
  form.value.student_id = null
  form.value.user_id = null
  selectedName.value = ''
  searchText.value = ''
  searchResults.value = []
})

watch(searchText, (val) => {
  clearTimeout(searchTimer)
  const q = String(val || '').trim()
  if (q.length < 2) {
    searchResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    try {
      searchResults.value = await searchPublicArrivalEntries(
        token.value,
        form.value.arrival_type === 'student' ? 'students' : 'users',
        q,
        form.value.gender || undefined,
      )
    } catch {
      searchResults.value = []
    }
  }, 250)
})

const showResults = computed(() => searchText.value.trim().length >= 2)

const isValid = computed(() => {
  if (!form.value.tanggal_kedatangan) return false
  if (form.value.arrival_type === 'student') return !!form.value.student_id
  return !!form.value.user_id
})

function selectEntry(item) {
  selectedName.value = item.nama_lengkap || item.name || '-'
  searchText.value = selectedName.value
  searchResults.value = []

  if (form.value.arrival_type === 'student') {
    form.value.student_id = item.id
    form.value.user_id = null
  } else {
    form.value.user_id = item.id
    form.value.student_id = null
  }
}

async function submitForm() {
  if (!isValid.value) return
  submitting.value = true
  notice.value = null

  try {
    const payload = {
      tanggal_kedatangan: form.value.tanggal_kedatangan,
      arrival_type: form.value.arrival_type,
      student_id: form.value.student_id,
      user_id: form.value.user_id,
    }

    const res = await submitPublicArrival(token.value, payload)
    notice.value = { type: 'success', message: res.message || 'Data berhasil disimpan.' }
  } catch (e) {
    notice.value = { type: 'error', message: e?.response?.data?.message || 'Gagal menyimpan kedatangan.' }
  } finally {
    submitting.value = false
  }
}
</script>
