<template>
  <div>
    <!-- Page Header -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
    >
      <div>
        <h1 class="text-2xl font-bold text-primary-dark tracking-tight">
          Data Santri
        </h1>
        <p class="text-gray-500 text-sm mt-1">
          Kelola data santri pondok pesantren
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <input ref="importInput" type="file" accept=".csv" class="hidden" @change="handleImport" />
        <button
          v-if="auth.hasPermission('students.view')"
          @click="downloadTemplate"
          class="btn-secondary flex items-center gap-2 !px-3"
        >
          <SvgIcon name="document" :size="14" />
          <span>Template</span>
        </button>
        <button
          v-if="auth.hasPermission('students.view')"
          @click="exportStudents"
          class="btn-secondary flex items-center gap-2 !px-3"
        >
          <SvgIcon name="download" :size="14" />
          <span>Export</span>
        </button>
        <button
          v-if="auth.hasPermission('students.create')"
          @click="openImport"
          class="btn-secondary flex items-center gap-2 !px-3"
        >
          <SvgIcon name="upload" :size="14" />
          <span>Import</span>
        </button>
        <button
          v-if="auth.hasPermission('students.delete') && selectedIds.length > 0"
          @click="handleMassDelete"
          class="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
        >
          Hapus Terpilih ({{ selectedIds.length }})
        </button>
        <button
          v-if="auth.hasPermission('students.create')"
          @click="createStudent"
          class="btn-primary flex items-center gap-2"
        >
          <SvgIcon name="plus" :size="16" />
          <span>Tambah Santri</span>
        </button>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="glass-card p-4 mb-6 flex flex-wrap items-center gap-4">
      <div class="flex-1 min-w-[200px]">
        <input
          v-model="search"
          type="text"
          placeholder="Cari nama, NIS, atau wali..."
          class="input-field !py-2 !pl-10"
        />
      </div>
      <select v-model="filters.jenis_kelamin" class="input-field !py-2 !w-auto">
        <option value="">Semua Gender</option>
        <option value="Laki-laki">Laki-laki</option>
        <option value="Perempuan">Perempuan</option>
      </select>
      <select
        v-model="filters.status_periode"
        class="input-field !py-2 !w-auto"
      >
        <option value="">Semua Status</option>
        <option value="Baru">Baru</option>
        <option value="Pindahan">Pindahan</option>
        <option value="Lulus">Lulus</option>
      </select>
    </div>

    <!-- Data Table -->
    <div class="glass-card overflow-hidden animate-fade-in">
      <!-- Loading State -->
      <div v-if="loading" class="p-12 text-center text-gray-400">
        <div
          class="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"
        ></div>
        <p class="text-sm">Memuat data...</p>
      </div>

      <!-- Table -->
      <!-- Desktop Table -->
      <table v-else class="data-table hidden md:table">
        <thead>
          <tr>
            <th class="w-10 text-center">
              <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
            </th>
            <th @click="setSort('nisn')" class="cursor-pointer">
              NISN
              {{
                sort.field === "nisn" ? (sort.order === "asc" ? "↑" : "↓") : ""
              }}
            </th>
            <th @click="setSort('nama_lengkap')" class="cursor-pointer">
              Nama Lengkap
              {{
                sort.field === "nama_lengkap"
                  ? sort.order === "asc"
                    ? "↑"
                    : "↓"
                  : ""
              }}
            </th>
            <th>Gender</th>
            <th>Status</th>
            <th>Wali</th>
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in data" :key="student.id">
            <td class="text-center">
              <input type="checkbox" :value="student.id" v-model="selectedIds" />
            </td>
            <td class="font-mono text-xs">{{ student.nisn || "-" }}</td>
            <td class="font-medium text-gray-800">
              {{ student.nama_lengkap }}
            </td>
            <td>
              <span
                :class="
                  student.jenis_kelamin === 'Laki-laki'
                    ? 'badge-info'
                    : 'badge-warning'
                "
              >
                {{ student.jenis_kelamin }}
              </span>
            </td>
            <td>
              <span
                :class="
                  student.status_periode === 'Baru'
                    ? 'badge-success'
                    : student.status_periode === 'Lulus'
                      ? 'badge-info'
                      : 'badge-secondary'
                "
              >
                {{ student.status_periode || "Unknown" }}
              </span>
            </td>
            <td class="text-sm text-gray-500">
              {{ student.nama_ayah || "-" }}
            </td>
            <td class="text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="
                    $router.push({
                      name: 'student-detail',
                      params: { id: student.id },
                    })
                  "
                  class="text-gray-500 hover:text-primary transition text-sm px-2 py-1 rounded hover:bg-gray-100"
                  title="Lihat Detail"
                >
                  <SvgIcon name="eye" :size="16" />
                </button>
                <button
                  v-if="auth.hasPermission('students.edit')"
                  @click="editStudent(student)"
                  class="text-primary hover:text-primary-dark transition text-sm px-2 py-1 rounded hover:bg-primary-50"
                >
                  <SvgIcon name="edit" :size="16" />
                </button>
                <button
                  v-if="auth.hasPermission('students.delete')"
                  @click="confirmDelete(student)"
                  class="text-red-500 hover:text-red-700 transition text-sm px-2 py-1 rounded hover:bg-red-50"
                >
                  <SvgIcon name="trash" :size="16" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="data.length === 0">
            <td colspan="7" class="text-center py-8 text-gray-400">
              Tidak ada data ditemukan
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile Card View -->
      <div
        v-if="!loading && data.length > 0"
        class="grid grid-cols-1 gap-4 md:hidden p-4"
      >
        <div
          v-for="student in data"
          :key="student.id"
          class="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100"
        >
          <div class="flex items-start justify-between">
            <div>
              <h3
                class="text-lg font-semibold text-gray-800 tracking-tight break-words pr-2"
              >
                {{ student.nama_lengkap }}
              </h3>
              <p class="text-xs text-gray-500 font-mono mt-1">
                {{ student.nisn || "No NISN" }}
              </p>
            </div>
            <span
              :class="
                student.status_periode === 'Baru'
                  ? 'badge-success'
                  : 'badge-gray'
              "
            >
              {{ student.status_periode }}
            </span>
          </div>

          <div class="flex items-center justify-between text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <span
                :class="
                  student.jenis_kelamin === 'Laki-laki'
                    ? 'text-blue-600'
                    : 'text-pink-600'
                "
              >
                {{ student.jenis_kelamin }}
              </span>
            </div>
            <div>
              {{ student.nama_ayah || "-" }}
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              @click="
                $router.push({
                  name: 'student-detail',
                  params: { id: student.id },
                })
              "
              class="p-2 text-gray-500 hover:bg-gray-200 rounded"
            >
              <SvgIcon name="eye" :size="18" />
            </button>
            <button
              v-if="auth.hasPermission('students.edit')"
              @click="editStudent(student)"
              class="p-2 text-blue-600 hover:bg-blue-100 rounded"
            >
              <SvgIcon name="edit" :size="18" />
            </button>
            <button
              v-if="auth.hasPermission('students.delete')"
              @click="confirmDelete(student)"
              class="p-2 text-red-600 hover:bg-red-100 rounded"
            >
              <SvgIcon name="trash" :size="18" />
            </button>
          </div>
        </div>
      </div>
      <div
        v-else-if="!loading && data.length === 0"
        class="md:hidden text-center py-8 text-gray-400"
      >
        Tidak ada data
      </div>

      <!-- Pagination -->
      <div
        v-if="meta.totalPages > 1"
        class="flex items-center justify-between px-4 py-3 border-t border-gray-100"
      >
        <p class="text-sm text-gray-500">
          Menampilkan {{ (meta.page - 1) * meta.perPage + 1 }}–{{
            Math.min(meta.page * meta.perPage, meta.total)
          }}
          dari {{ meta.total }} santri
        </p>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 hidden sm:inline"
              >Per halaman:</span
            >
            <select
              v-model="meta.perPage"
              class="input-field !py-1 !text-sm !w-auto bg-white border-gray-300 rounded focus:ring-primary focus:border-primary"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
          <div class="flex items-center gap-1">
            <!-- Prev Button -->
            <button
              @click="setPage(meta.page - 1)"
              :disabled="meta.page === 1"
              class="px-2 py-1 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SvgIcon name="chevron-left" :size="16" />
            </button>

            <!-- Page Numbers -->
            <button
              v-for="(page, i) in visiblePages"
              :key="i"
              @click="typeof page === 'number' ? setPage(page) : null"
              :class="[
                'px-3 py-1 rounded text-sm transition',
                typeof page === 'number'
                  ? meta.page === page
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  : 'text-gray-400 cursor-default',
              ]"
              :disabled="typeof page !== 'number'"
            >
              {{ page }}
            </button>

            <!-- Next Button -->
            <button
              @click="setPage(meta.page + 1)"
              :disabled="meta.page === meta.totalPages"
              class="px-2 py-1 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SvgIcon name="chevron-right" :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Form Modal -->
    <StudentForm
      v-model="showForm"
      :student="selectedStudent"
      @saved="handleSaved"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-model:show="showDeleteModal"
      title="Hapus Santri"
      :message="`Apakah Anda yakin ingin menghapus data santri ${studentToDelete?.nama_lengkap}? Data yang dihapus tidak dapat dikembalikan.`"
      confirm-text="Hapus"
      cancel-text="Batal"
      type="danger"
      :loading="deleteLoading"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useTable } from "@/composables/useTable";
import api from "@/api";
import SvgIcon from "@/components/ui/SvgIcon.vue";
import StudentForm from "@/components/students/StudentForm.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import { useToastStore } from "@/stores/toast";

const auth = useAuthStore();
const router = useRouter();
const toast = useToastStore();

// Form state
const showForm = ref(false);
const selectedStudent = ref(null);
const showDeleteModal = ref(false);
const studentToDelete = ref(null);
const deleteLoading = ref(false);
const selectedIds = ref([]);
const importInput = ref(null);

// useTable — gives us search, filter, sort, pagination for free!
const {
  data,
  loading,
  meta,
  search,
  filters,
  sort,
  setPage,
  setSort,
  fetchData,
} = useTable("/students", {
  defaultSort: "nama_lengkap",
  initialFilters: { jenis_kelamin: "", status_periode: "" },
});

// Pagination Logic
const visiblePages = computed(() => {
  const { page, totalPages } = meta; // No .value needed for reactive object
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];
  if (page > 3) pages.push("...");

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (page < totalPages - 2) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
});

const isAllSelected = computed(() => {
  if (!data.value?.length) return false;
  return data.value.every((s) => selectedIds.value.includes(s.id));
});

watch(
  () => data.value,
  () => {
    selectedIds.value = [];
  },
);

function toggleSelectAll(e) {
  if (e.target.checked) {
    selectedIds.value = (data.value || []).map((s) => s.id);
  } else {
    selectedIds.value = [];
  }
}

function openImport() {
  importInput.value?.click();
}

async function handleImport(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const fd = new FormData();
  fd.append("file", file);
  try {
    const { data: res } = await api.post("/students/import", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success(`Import selesai. Berhasil: ${res.created}, dilewati: ${res.skipped}`);
    fetchData();
  } catch (err) {
    toast.error(err.response?.data?.message || "Gagal import data santri");
  } finally {
    e.target.value = "";
  }
}

async function downloadTemplate() {
  try {
    const res = await api.get("/students/template", { responseType: "blob" });
    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    toast.error(err.response?.data?.message || "Gagal unduh template");
  }
}

async function exportStudents() {
  try {
    const res = await api.get("/students/export/excel", { responseType: "blob" });
    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students-export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    toast.error(err.response?.data?.message || "Gagal export data");
  }
}

async function handleMassDelete() {
  if (!selectedIds.value.length) return;
  if (!window.confirm(`Hapus ${selectedIds.value.length} santri terpilih?`)) return;
  try {
    await api.post("/students/mass-delete", { ids: selectedIds.value });
    toast.success("Santri terpilih berhasil dihapus");
    selectedIds.value = [];
    fetchData();
  } catch (err) {
    toast.error(err.response?.data?.message || "Gagal hapus massal");
  }
}

function createStudent() {
  selectedStudent.value = null;
  showForm.value = true;
}

function editStudent(student) {
  selectedStudent.value = { ...student }; // Clone to avoid mutation
  showForm.value = true;
}

async function confirmDelete(student) {
  studentToDelete.value = student;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!studentToDelete.value) return;

  deleteLoading.value = true;
  try {
    await api.delete(`/students/${studentToDelete.value.id}`);
    toast.success(
      `Santri ${studentToDelete.value.nama_lengkap} berhasil dihapus`,
    );
    fetchData(); // Refresh list
    showDeleteModal.value = false;
  } catch (e) {
    console.error(e);
    toast.error("Gagal menghapus santri");
  } finally {
    deleteLoading.value = false;
    studentToDelete.value = null;
  }
}

function handleSaved(studentData) {
  const isCreate = !selectedStudent.value;
  fetchData(); // Refresh list

  // If created, navigate to detail
  if (isCreate && studentData?.id) {
    router.push({ name: "student-detail", params: { id: studentData.id } });
  }
}
</script>
