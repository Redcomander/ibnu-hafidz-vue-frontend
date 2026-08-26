<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Validasi Perubahan Halaqoh</h1>
        <p class="text-sm text-gray-500">Persetujuan untuk perubahan milik guru yang diajukan dari halaman Halaqoh.</p>
      </div>
      <button @click="loadRequests" class="btn-primary text-sm px-4 py-2">Refresh</button>
    </div>

    <div v-if="loading" class="rounded-xl bg-white p-6 shadow-sm border border-slate-200 text-center text-sm text-gray-500">
      Memuat permintaan...
    </div>

    <div v-else-if="!requests.length" class="rounded-xl bg-white p-8 shadow-sm border border-slate-200 text-center text-sm text-gray-500">
      Tidak ada permintaan validasi yang tertunda.
    </div>

    <div v-else class="space-y-4">
      <div v-for="request in requests" :key="request.id" class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400">Request #{{ request.id }}</p>
            <h2 class="text-lg font-semibold text-slate-800">{{ request.teacher?.name || 'Guru' }}</h2>
            <p class="text-sm text-slate-500">Diajukan oleh: {{ request.requested_by?.name || 'Unknown' }} • {{ request.request_type }}</p>
          </div>
          <span :class="[
            'inline-flex px-2.5 py-1 text-xs rounded-full font-medium',
            request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
            request.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
            'bg-red-100 text-red-700'
          ]">{{ request.status }}</span>
        </div>

        <div class="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <p class="font-medium text-slate-700 mb-1">Siswa baru</p>
            <p v-if="request.student_ids?.length">{{ formatStudentList(request.student_ids) }}</p>
            <p v-else class="text-slate-400">Tidak ada</p>
          </div>
          <div>
            <p class="font-medium text-slate-700 mb-1">Guru pembantu</p>
            <p>{{ request.helper_teacher_id ? getTeacherName(request.helper_teacher_id) : 'Tidak ada' }}</p>
          </div>
        </div>

        <div v-if="request.reason" class="mt-3 text-sm text-slate-600">
          <span class="font-medium text-slate-700">Alasan:</span> {{ request.reason }}
        </div>

        <div v-if="request.status === 'pending'" class="mt-4 flex flex-wrap gap-2">
          <button @click="approve(request.id)" class="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 text-sm font-medium">Setujui</button>
          <button @click="reject(request.id)" class="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium">Tolak</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHalaqohStore } from '@/stores/halaqoh'
import { useToastStore } from '@/stores/toast'

const store = useHalaqohStore()
const toast = useToastStore()
const requests = ref([])
const loading = ref(false)
const allTeachers = ref([])
const allStudents = ref([])

const normalizePaginatedItems = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload)) return payload
  return []
}

async function loadAllPages(path, perPage = 1000) {
  let page = 1
  let totalPages = 1
  const allItems = []

  do {
    const { data } = await window.axios.get(path, { params: { page, per_page: perPage } })
    allItems.push(...normalizePaginatedItems(data))
    totalPages = Number(data?.total_pages || 1)
    page += 1
  } while (page <= totalPages)

  return allItems
}

async function loadRequests() {
  loading.value = true
  try {
    const { data } = await store.fetchAssignmentChangeRequests()
    requests.value = data || []
    if (!allTeachers.value.length) {
      allTeachers.value = await loadAllPages('/users')
      allStudents.value = await loadAllPages('/students')
    }
  } catch (error) {
    toast.error(error.response?.data?.error || 'Gagal memuat permintaan validasi')
  } finally {
    loading.value = false
  }
}

function getTeacherName(id) {
  return allTeachers.value.find((teacher) => teacher.id === id)?.name || `#${id}`
}

function formatStudentList(studentIds) {
  const names = studentIds
    .map((id) => allStudents.value.find((student) => student.id === id)?.nama_lengkap || `#${id}`)
    .filter(Boolean)
  return names.length ? names.join(', ') : 'Tidak ada siswa'
}

async function approve(id) {
  try {
    await store.approveAssignmentChangeRequest(id)
    toast.success('Permintaan berhasil disetujui')
    await loadRequests()
  } catch (error) {
    toast.error(error.response?.data?.error || 'Gagal menyetujui permintaan')
  }
}

async function reject(id) {
  const reason = window.prompt('Alasan penolakan:') || 'Permintaan ditolak oleh admin'
  try {
    await store.rejectAssignmentChangeRequest(id, { reason })
    toast.success('Permintaan berhasil ditolak')
    await loadRequests()
  } catch (error) {
    toast.error(error.response?.data?.error || 'Gagal menolak permintaan')
  }
}

onMounted(loadRequests)
</script>
