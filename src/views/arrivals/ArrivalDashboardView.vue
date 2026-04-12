<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard Kedatangan</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Ringkasan kedatangan santri dan pengajar.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <input v-model="selectedDate" type="date" class="input-field !w-auto" />
        <select v-model="selectedGender" class="input-field !w-auto">
          <option value="">Semua</option>
          <option value="L">Banin (L)</option>
          <option value="P">Banat (P)</option>
        </select>
        <button class="btn-primary px-4 py-2" @click="loadData">Tampilkan</button>
      </div>
    </div>

    <div v-if="data.public_form_url" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:bg-emerald-900/20 dark:border-emerald-700">
      <p class="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Link Absen Kedatangan</p>
      <a :href="data.public_form_url" target="_blank" rel="noopener" class="text-sm underline text-emerald-700 dark:text-emerald-300 break-all">
        {{ data.public_form_url }}
      </a>
      <p class="mt-2 text-xs text-emerald-700 dark:text-emerald-300">Bagikan link ini hanya ke pihak yang boleh mengisi absen kedatangan.</p>
    </div>
    <div v-else class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300">
      Token akses belum diatur. Set nilai STUDENT_ARRIVAL_ACCESS_TOKEN agar form publik bisa dipakai.
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div class="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">Pengaturan Waktu Terakhir Datang Santri</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Input santri setelah waktu ini akan ditandai sebagai terlambat.</p>
          <p class="text-xs mt-2" :class="data.student_deadline_at ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'">
            {{ data.student_deadline_at ? `Batas saat ini: ${formatDateTime(data.student_deadline_at)}` : 'Batas belum diatur.' }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-2">
          <input v-model="deadlineInput" type="datetime-local" class="input-field !w-auto" />
          <button class="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 whitespace-nowrap" @click="saveDeadline">
            Simpan Batas
          </button>
          <button class="rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 whitespace-nowrap" @click="confirmResetStudents">
            Reset Semua Santri
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400">Total Kedatangan</p>
        <p class="text-3xl font-bold text-emerald-600 mt-2">{{ data.totals?.all || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400">Total Santri Datang</p>
        <p class="text-3xl font-bold text-teal-600 mt-2">{{ data.totals?.students || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400">Total Pengajar Datang</p>
        <p class="text-3xl font-bold text-cyan-600 mt-2">{{ data.totals?.users || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400">Kelas Dengan Kedatangan</p>
        <p class="text-3xl font-bold text-indigo-600 mt-2">{{ data.totals?.classes_with_arrivals || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400">Santri Telat</p>
        <p class="text-3xl font-bold text-rose-600 mt-2">{{ data.totals?.student_late || 0 }}</p>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Berdasarkan batas waktu terakhir datang</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400">Santri per Gender</p>
        <div class="mt-3 flex items-center justify-between text-sm">
          <span class="inline-flex items-center rounded-full px-2.5 py-1 bg-blue-100 text-blue-700">Banin (L)</span>
          <span class="font-semibold text-slate-900 dark:text-slate-100">{{ data.totals?.student_banin || 0 }}</span>
        </div>
        <div class="mt-2 flex items-center justify-between text-sm">
          <span class="inline-flex items-center rounded-full px-2.5 py-1 bg-pink-100 text-pink-700">Banat (P)</span>
          <span class="font-semibold text-slate-900 dark:text-slate-100">{{ data.totals?.student_banat || 0 }}</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400">Pengajar per Gender</p>
        <div class="mt-3 flex items-center justify-between text-sm">
          <span class="inline-flex items-center rounded-full px-2.5 py-1 bg-blue-100 text-blue-700">Banin (L)</span>
          <span class="font-semibold text-slate-900 dark:text-slate-100">{{ data.totals?.user_banin || 0 }}</span>
        </div>
        <div class="mt-2 flex items-center justify-between text-sm">
          <span class="inline-flex items-center rounded-full px-2.5 py-1 bg-pink-100 text-pink-700">Banat (P)</span>
          <span class="font-semibold text-slate-900 dark:text-slate-100">{{ data.totals?.user_banat || 0 }}</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400">Total Umum per Gender</p>
        <div class="mt-3 flex items-center justify-between text-sm">
          <span class="inline-flex items-center rounded-full px-2.5 py-1 bg-blue-100 text-blue-700">Banin (L)</span>
          <span class="font-semibold text-slate-900 dark:text-slate-100">{{ data.totals?.total_banin || 0 }}</span>
        </div>
        <div class="mt-2 flex items-center justify-between text-sm">
          <span class="inline-flex items-center rounded-full px-2.5 py-1 bg-pink-100 text-pink-700">Banat (P)</span>
          <span class="font-semibold text-slate-900 dark:text-slate-100">{{ data.totals?.total_banat || 0 }}</span>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 class="font-semibold text-slate-900 dark:text-slate-100">Daftar Santri Terlambat</h2>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Menampilkan santri yang input kedatangan setelah batas waktu.</p>
      </div>

      <div v-if="!data.student_deadline_at" class="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
        Batas waktu belum diatur, jadi daftar keterlambatan belum bisa dihitung.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300">
            <tr>
              <th class="text-left px-4 py-3">Nama Santri</th>
              <th class="text-left px-4 py-3">Kelas</th>
              <th class="text-left px-4 py-3">Waktu Input</th>
              <th class="text-right px-4 py-3">Telat (Hari)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="(row, idx) in (data.late_student_arrivals || [])" :key="idx">
              <td class="px-4 py-3 text-slate-900 dark:text-slate-100">
                <div class="flex items-center gap-2">
                  <span>{{ row.nama || '-' }}</span>
                  <span v-if="row.gender_label" class="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap" :class="row.gender_code === 'L' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : row.gender_code === 'P' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'">
                    {{ row.gender_label }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ row.kelas || '-' }}</td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ formatDateTime(row.created_at) }}</td>
              <td class="px-4 py-3 text-right">
                <span class="inline-flex items-center rounded-full px-2.5 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 font-medium">
                  {{ row.late_days || 0 }} hari
                </span>
              </td>
            </tr>
            <tr v-if="!(data.late_student_arrivals || []).length">
              <td colspan="4" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Tidak ada santri yang terlambat pada tanggal ini.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 class="font-semibold text-slate-900 dark:text-slate-100">Jumlah Datang Per Kelas</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300">
              <tr>
                <th class="text-left px-4 py-3">Kelas</th>
                <th class="text-left px-4 py-3">Tingkat</th>
                <th class="text-right px-4 py-3">Sudah Datang</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr v-for="k in (data.kelas_stats || [])" :key="k.id">
                <td class="px-4 py-3 text-slate-900 dark:text-slate-100">{{ k.nama }}</td>
                <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ k.tingkat || '-' }}</td>
                <td class="px-4 py-3 text-right font-semibold" :class="k.jumlah_hadir > 0 ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400'">{{ k.jumlah_hadir }}</td>
              </tr>
              <tr v-if="!(data.kelas_stats || []).length">
                <td colspan="3" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Data kelas belum tersedia.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 class="font-semibold text-slate-900 dark:text-slate-100">Daftar Kedatangan</h2>
        </div>
        <div class="max-h-[440px] overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
          <div v-for="(a, idx) in (data.arrivals || [])" :key="idx" class="px-4 py-3">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <p class="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{{ a.nama || '-' }}</p>
                <span v-if="a.gender_label" class="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap" :class="a.gender_code === 'L' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : a.gender_code === 'P' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'">
                  {{ a.gender_label }}
                </span>
              </div>
              <span class="text-[11px] px-2 py-0.5 rounded-full" :class="a.jenis === 'Pengajar' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'">
                {{ a.jenis }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {{ formatDate(a.tanggal_kedatangan) }}
              <span v-if="a.kelas"> • {{ a.kelas }}</span>
            </p>
            <div v-if="a.jenis === 'Santri' && data.student_deadline_at" class="mt-2">
              <span class="text-[11px] px-2 py-0.5 rounded-full" :class="a.is_late ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'">
                {{ a.is_late ? 'Terlambat' : 'Tepat Waktu' }}
              </span>
            </div>
          </div>
          <div v-if="!(data.arrivals || []).length" class="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Belum ada kedatangan yang tercatat pada tanggal ini.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchArrivalDashboard, resetStudentArrivals, updateArrivalDeadline } from '@/api/arrivals'

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const selectedGender = ref('')
const data = ref({})
const deadlineInput = ref('')

async function loadData() {
  try {
    data.value = await fetchArrivalDashboard(selectedDate.value, selectedGender.value)
    deadlineInput.value = toDateTimeLocalValue(data.value.student_deadline_at)
  } catch {
    data.value = {
      arrivals: [],
      kelas_stats: [],
      late_student_arrivals: [],
      totals: {
        all: 0,
        students: 0,
        users: 0,
        student_late: 0,
        student_banin: 0,
        student_banat: 0,
        user_banin: 0,
        user_banat: 0,
        total_banin: 0,
        total_banat: 0,
        classes_with_arrivals: 0,
      },
    }
  }
}

async function saveDeadline() {
  try {
    await updateArrivalDeadline(deadlineInput.value || null)
    await loadData()
  } catch {
    // Keep silent fallback like existing dashboard actions.
  }
}

async function confirmResetStudents() {
  const ok = window.confirm('Reset semua data kedatangan santri dan kosongkan batas waktu?')
  if (!ok) return

  try {
    await resetStudentArrivals()
    await loadData()
  } catch {
    // Keep silent fallback like existing dashboard actions.
  }
}

function formatDate(raw) {
  if (!raw) return '-'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(raw) {
  if (!raw) return '-'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toDateTimeLocalValue(raw) {
  if (!raw) return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return ''
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

onMounted(loadData)
</script>
