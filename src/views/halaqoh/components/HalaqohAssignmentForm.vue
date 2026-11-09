<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <div
        class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-white rounded-t-xl">
          <h3 class="text-lg font-bold">
            {{ isEditing ? 'Edit Penugasan Halaqoh' : 'Tambah Penugasan Halaqoh' }}
          </h3>
          <p class="text-emerald-100 text-sm mt-0.5">
            {{ isEditing ? 'Ubah guru atau santri yang ditugaskan' : 'Pilih guru dan santri' }}
          </p>
        </div>

        <form @submit.prevent="save" class="p-6 space-y-5">
          <p v-if="!isAdmin" class="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Perubahan berlaku setelah disetujui admin. Cari santri mana pun. Perpindahan dari halaqoh guru lain harus disetujui admin.
          </p>
          <!-- Teacher Select -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Guru Pengampu</label>
            <SearchableSelect
              v-model="form.user_id"
              :options="teachers"
              placeholder="-- Pilih Guru --"
              label-key="name"
              value-key="id"
              :disabled="!isAdmin"
              :search-debounce="300"
            />
          </div>

          <!-- Helper Teacher (optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Guru Pembantu
              <span class="text-gray-400 font-normal">(opsional)</span>
            </label>
            <SearchableSelect
              v-model="form.helper_teacher_id"
              :options="helperTeacherOptions"
              placeholder="-- Tidak Ada --"
              label-key="name"
              value-key="id"
              :search-debounce="300"
            />
          </div>

          <!-- Student Multi-select -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Santri ({{ form.student_ids.length }} dipilih)
            </label>
            <div v-if="selectedStudents.length" class="mb-2 flex flex-wrap gap-2">
              <button v-for="student in selectedStudents" :key="student.id" type="button" @click="form.student_ids = form.student_ids.filter(id => id !== student.id)" class="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800" :aria-label="`Keluarkan ${student.nama_lengkap} dari pengajuan`">
                {{ student.nama_lengkap }} ?
              </button>
            </div>
            <p class="mb-2 text-xs text-gray-500">Ketik minimal 2 karakter untuk mencari semua santri. Hasil ditampilkan 20 per halaman.</p>
            <input
              v-model="studentSearch"
              type="text"
              placeholder="Cari nama santri (minimal 2 karakter)..."
              class="input-field mb-2"
            />
            <div
              class="border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-50"
            >
              <label
                v-for="s in filteredStudents"
                :key="s.id"
                class="student-option flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  :value="s.id"
                  v-model="form.student_ids"
                  class="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-400"
                />
                <span class="text-sm text-gray-700">{{ s.nama_lengkap || s.name }}</span>
                <span
                  v-if="s.current_teacher_id && Number(s.current_teacher_id) !== Number(form.user_id)"
                  class="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full ml-auto"
                >
                  Halaqoh: {{ s.current_teacher_name || 'Guru lain' }}
                </span>
              </label>
              <p v-if="studentLoading" class="text-center text-gray-400 text-sm py-4">Mencari santri...</p>
              <p v-else-if="!filteredStudents.length" class="text-center text-gray-400 text-sm py-4">
                Tidak ada santri ditemukan
              </p>
            </div>
          </div>

          <div v-if="studentTotalPages > 1" class="flex items-center justify-between text-xs">
            <button type="button" :disabled="studentLoading || studentPage <= 1" @click="loadStudentOptions(studentPage - 1)" class="btn-secondary">Sebelumnya</button>
            <span>{{ studentPage }} / {{ studentTotalPages }}</span>
            <button type="button" :disabled="studentLoading || studentPage >= studentTotalPages" @click="loadStudentOptions(studentPage + 1)" class="btn-secondary">Berikutnya</button>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="saving || !form.user_id || (!isEditing && !form.student_ids.length)"
              class="flex-1 px-4 py-2.5 text-sm rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? 'Mengirim...' : !isAdmin ? 'Ajukan ke Admin' : isEditing ? 'Perbarui' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useHalaqohStore } from '@/stores/halaqoh'
import { useToastStore } from '@/stores/toast'
import api from '@/api'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'

const props = defineProps({
  editingGroup: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const auth = useAuthStore()
const isAdmin = computed(() => auth.userRoles.some(role => ['admin', 'super_admin'].includes(role.name)))
const store = useHalaqohStore()
const toast = useToastStore()

const isEditing = computed(() => !!props.editingGroup)

const teachers = ref([])
const allStudents = ref([])
const knownStudents = ref({})
const studentLoading = ref(false)
const studentPage = ref(1)
const studentTotalPages = ref(1)
let studentRequestVersion = 0
const selectedStudents = computed(() => form.value.student_ids.map(id => knownStudents.value[id] || { id, nama_lengkap: `#${id}` }))
const studentSearch = ref('')
const debouncedStudentSearch = ref('')
const saving = ref(false)
let studentSearchTimer = null

const form = ref({
  user_id: '',
  student_ids: [],
  helper_teacher_id: null,
})

function normalizePaginatedItems(payload) {
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload)) return payload
  return []
}

async function loadStudentOptions(page = 1) {
  const version = ++studentRequestVersion
  studentLoading.value = true
  try {
    const { data } = await api.get('/halaqoh/student-options', { params: { page, per_page: 20, search: debouncedStudentSearch.value } })
    if (version !== studentRequestVersion) return
    allStudents.value = normalizePaginatedItems(data)
    for (const student of allStudents.value) knownStudents.value[student.id] = student
    studentPage.value = page
    studentTotalPages.value = Math.max(1, Number(data?.total_pages || 1))
  } catch (error) {
    if (version !== studentRequestVersion) return
    allStudents.value = []
    studentTotalPages.value = 1
    toast.error(error.response?.data?.message || 'Gagal mencari santri')
  } finally {
    if (version === studentRequestVersion) studentLoading.value = false
  }
}

async function loadTeacherOptions() {
  const { data } = await api.get('/halaqoh/teacher-options')
  return normalizePaginatedItems(data).map(normalizeTeacherOption)
}

const filteredStudents = computed(() => allStudents.value)

function normalizeTeacherOption(teacher) {
  if (!teacher) return teacher
  const displayName = teacher.name || teacher.username || teacher.email || teacher.display_name || 'Tanpa nama'
  return {
    ...teacher,
    name: displayName,
    display_name: displayName,
  }
}

const helperTeacherOptions = computed(() => {
  const options = [{ id: null, name: '-- Tidak Ada --' }]
  return options.concat(
    teachers.value
      .map(normalizeTeacherOption)
      .filter((t) => String(t.id) !== String(form.value.user_id))
  )
})

watch(studentSearch, (value) => {
  studentRequestVersion++
  if (studentSearchTimer) {
    clearTimeout(studentSearchTimer)
  }
  studentSearchTimer = setTimeout(() => {
    debouncedStudentSearch.value = value.trim()
    loadStudentOptions(1)
  }, 300)
})

onUnmounted(() => { clearTimeout(studentSearchTimer); studentRequestVersion++ })

onMounted(async () => {
  if (!isAdmin.value) form.value.user_id = auth.user?.id
  if (props.editingGroup) {
    form.value.user_id = props.editingGroup.teacher_id
    form.value.student_ids = props.editingGroup.assignments.map(assignment => assignment.student_id)
    form.value.helper_teacher_id = props.editingGroup.assignments[0]?.helper_teacher_id || null
    for (const assignment of props.editingGroup.assignments) {
      knownStudents.value[assignment.student_id] = { id: assignment.student_id, nama_lengkap: assignment.student?.nama_lengkap || `#${assignment.student_id}` }
    }
  }
  try {
    const [loadedTeachers] = await Promise.all([loadTeacherOptions(), loadStudentOptions()])
    teachers.value = loadedTeachers
  } catch {
    toast.error('Gagal memuat data guru/santri')
  }
})

async function save() {
  saving.value = true
  try {
    if (isEditing.value) {
      await store.updateAssignment(props.editingGroup.teacher_id, form.value)
      toast.success(isAdmin.value ? 'Penugasan berhasil diperbarui' : 'Pengajuan dikirim. Menunggu persetujuan admin.')
    } else {
      await store.createAssignment(form.value)
      toast.success(isAdmin.value ? 'Penugasan berhasil dibuat' : 'Pengajuan dikirim. Menunggu persetujuan admin.')
    }
    emit('saved')
  } catch (err) {
    toast.error(err.response?.data?.message || err.response?.data?.error || 'Gagal menyimpan')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
[data-theme="dark"] .student-option:hover {
  background-color: #1f2937 !important;
}
</style>
