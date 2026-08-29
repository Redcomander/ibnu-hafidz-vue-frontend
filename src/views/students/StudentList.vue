<template>
  <div>
    <!-- Page Header -->
    <div
      :class="[
        'flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6',
        theme.isDark ? 'text-slate-100' : 'text-slate-900'
      ]"
    >
      <div>
        <h1 :class="['text-2xl font-bold tracking-tight', theme.isDark ? 'text-slate-100' : 'text-slate-900']">
          {{ isAlumniPage ? "Data Alumni" : "Data Santri" }}
        </h1>
        <p :class="['text-sm mt-1', theme.isDark ? 'text-slate-400' : 'text-gray-500']">
          {{
            isAlumniPage
              ? "Daftar santri yang telah lulus"
              : "Kelola data santri pondok pesantren"
          }}
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
          <span>{{ isAlumniPage ? "Tambah Alumni" : "Tambah Santri" }}</span>
        </button>
      </div>
    </div>

    <!-- Filters & Search -->
    <div
      :class="[
        'glass-card rounded-2xl border p-4 mb-6 shadow-sm backdrop-blur-sm',
        theme.isDark ? 'border-slate-700/80 bg-slate-900/80' : 'border-slate-200/70 bg-white/80'
      ]"
    >
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[220px]">
          <input
            v-model="search"
            type="text"
            placeholder="Cari nama, NIS, atau wali..."
            :class="[
              'input-field !py-2.5 !pl-10 w-full rounded-xl focus:border-primary/60 focus:ring-2 focus:ring-primary/10',
              theme.isDark
                ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-400'
                : 'border-slate-200 bg-slate-50/80 text-slate-900 placeholder-slate-500'
            ]"
          />
        </div>
        <select
          v-model="filters.jenis_kelamin"
          :class="[
            'input-field !py-2.5 !w-auto min-w-[150px] rounded-xl',
            theme.isDark
              ? 'border-slate-700 bg-slate-800 text-slate-100'
              : 'border-slate-200 bg-slate-50/80 text-slate-900'
          ]"
        >
          <option value="">Semua Gender</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
        <select
          v-model="filters.status_periode"
          :class="[
            'input-field !py-2.5 !w-auto min-w-[150px] rounded-xl',
            theme.isDark
              ? 'border-slate-700 bg-slate-800 text-slate-100'
              : 'border-slate-200 bg-slate-50/80 text-slate-900'
          ]"
        >
          <option :value="isAlumniPage ? 'Lulus' : ''">
            {{ isAlumniPage ? "Lulus" : "Semua Status" }}
          </option>
          <option value="Baru">Baru</option>
          <option value="Pindahan">Pindahan</option>
          <option value="Lulus">Lulus</option>
        </select>
        <select
          v-model="filters.kelas_status"
          :class="[
            'input-field !py-2.5 !w-auto min-w-[150px] rounded-xl',
            theme.isDark
              ? 'border-slate-700 bg-slate-800 text-slate-100'
              : 'border-slate-200 bg-slate-50/80 text-slate-900'
          ]"
        >
          <option value="">Semua Kelas</option>
          <option value="ada">Kelas Ada</option>
          <option value="kosong">Kelas Kosong</option>
        </select>
        <select
          v-model="filters.laundry_status"
          :class="[
            'input-field !py-2.5 !w-auto min-w-[150px] rounded-xl',
            theme.isDark
              ? 'border-slate-700 bg-slate-800 text-slate-100'
              : 'border-slate-200 bg-slate-50/80 text-slate-900'
          ]"
        >
          <option value="">Semua Laundry</option>
          <option value="ada">Laundry Ada</option>
          <option value="kosong">Laundry Kosong</option>
        </select>
        <select
          v-model="filters.halaqoh_status"
          :class="[
            'input-field !py-2.5 !w-auto min-w-[150px] rounded-xl',
            theme.isDark
              ? 'border-slate-700 bg-slate-800 text-slate-100'
              : 'border-slate-200 bg-slate-50/80 text-slate-900'
          ]"
        >
          <option value="">Semua Halaqoh</option>
          <option value="ada">Halaqoh Ada</option>
          <option value="kosong">Halaqoh Kosong</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div
      :class="[
        'glass-card overflow-hidden rounded-2xl border shadow-sm animate-fade-in',
        theme.isDark ? 'border-slate-700/80 bg-slate-900' : 'border-slate-200/70 bg-white'
      ]"
    >
      <!-- Loading State -->
      <div v-if="loading" class="p-12 text-center text-gray-400">
        <div
          class="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"
        ></div>
        <p class="text-sm">Memuat data...</p>
      </div>

      <!-- Desktop Table -->
      <div v-else class="overflow-x-auto">
        <table class="data-table min-w-[1200px] w-full">
          <thead>
            <tr :class="theme.isDark ? 'bg-slate-800/80' : 'bg-slate-50/90'">
              <th class="w-12 text-center px-3 py-3">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="rounded border-slate-300 text-primary focus:ring-primary/40" />
              </th>
              <th @click="setSort('nisn')" :class="['cursor-pointer px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em]', theme.isDark ? 'text-slate-300' : 'text-slate-500']">
                <div class="flex items-center gap-1">
                  <span>NISN</span>
                  <span>{{ sort.field === "nisn" ? (sort.order === "asc" ? "↑" : "↓") : "" }}</span>
                </div>
              </th>
              <th @click="setSort('nama_lengkap')" :class="['cursor-pointer px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em]', theme.isDark ? 'text-slate-300' : 'text-slate-500']">
                <div class="flex items-center gap-1">
                  <span>Nama Lengkap</span>
                  <span>{{ sort.field === "nama_lengkap" ? (sort.order === "asc" ? "↑" : "↓") : "" }}</span>
                </div>
              </th>
              <th :class="['px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em]', theme.isDark ? 'text-slate-300' : 'text-slate-500']">Gender</th>
              <th :class="['px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em]', theme.isDark ? 'text-slate-300' : 'text-slate-500']">Status</th>
              <th :class="['px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em]', theme.isDark ? 'text-slate-300' : 'text-slate-500']">Kelas</th>
              <th :class="['px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em]', theme.isDark ? 'text-slate-300' : 'text-slate-500']">Laundry</th>
              <th :class="['px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em]', theme.isDark ? 'text-slate-300' : 'text-slate-500']">Halaqoh</th>
              <th :class="['px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em]', theme.isDark ? 'text-slate-300' : 'text-slate-500']">Wali</th>
              <th :class="['px-3 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em]', theme.isDark ? 'text-slate-300' : 'text-slate-500']">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in data" :key="student.id" :class="['border-t transition-colors duration-200', theme.isDark ? 'border-slate-700/80 hover:bg-slate-800/70' : 'border-slate-200/80 hover:bg-slate-50/60']">
              <td class="px-3 py-3 text-center align-middle">
                <input type="checkbox" :value="student.id" v-model="selectedIds" class="rounded border-slate-300 text-primary focus:ring-primary/40" />
              </td>
              <td :class="['px-3 py-3 align-middle font-mono text-xs', theme.isDark ? 'text-slate-300' : 'text-slate-600']">{{ student.nisn || "-" }}</td>
              <td class="px-3 py-3 align-middle">
                <div class="max-w-[220px]">
                  <div :class="['font-semibold break-words leading-snug', theme.isDark ? 'text-slate-100' : 'text-slate-800']">
                    {{ student.nama_lengkap }}
                  </div>
                </div>
              </td>
              <td class="px-3 py-3 align-middle">
                <span :class="student.jenis_kelamin === 'Laki-laki' ? 'badge-info' : 'badge-warning'">
                  {{ student.jenis_kelamin }}
                </span>
              </td>
              <td class="px-3 py-3 align-middle">
                <span :class="student.status_periode === 'Baru' ? 'badge-success' : student.status_periode === 'Lulus' ? 'badge-info' : 'badge-secondary'">
                  {{ student.status_periode || "Unknown" }}
                </span>
              </td>
              <td class="px-3 py-3 align-middle">
                <span :class="student.kelas_status === 'Ada' ? 'badge-success' : 'badge-secondary'" class="max-w-[180px] inline-flex break-words text-left">
                  {{ student.kelas_label || 'Belum ada' }}
                </span>
              </td>
              <td class="px-3 py-3 align-middle">
                <span :class="student.laundry_status === 'Ada' ? 'badge-info' : 'badge-secondary'" class="max-w-[180px] inline-flex break-words text-left">
                  {{ student.laundry_vendor || 'Belum ada' }}
                </span>
              </td>
              <td class="px-3 py-3 align-middle">
                <span :class="student.halaqoh_status === 'Ada' ? 'badge-warning' : 'badge-secondary'" class="max-w-[180px] inline-flex break-words text-left">
                  {{ student.halaqoh_teacher || 'Belum ada' }}
                </span>
              </td>
              <td :class="['px-3 py-3 align-middle text-sm break-words', theme.isDark ? 'text-slate-400' : 'text-slate-500']">
                {{ student.nama_ayah || "-" }}
              </td>
              <td class="px-3 py-3 align-middle">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="
                      $router.push({
                        name: 'student-detail',
                        params: { id: student.id },
                      })
                    "
                    :class="['rounded-lg p-2 transition', theme.isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-slate-100' : 'text-slate-500 hover:bg-slate-100 hover:text-primary']"
                    title="Lihat Detail"
                  >
                    <SvgIcon name="eye" :size="16" />
                  </button>
                  <button
                    v-if="auth.hasPermission('students.edit')"
                    @click="editStudent(student)"
                    :class="['rounded-lg p-2 transition', theme.isDark ? 'text-sky-400 hover:bg-sky-500/10' : 'text-sky-600 hover:bg-sky-50']"
                    title="Edit"
                  >
                    <SvgIcon name="edit" :size="16" />
                  </button>
                  <button
                    v-if="auth.hasPermission('students.edit') && student.status_periode !== 'Lulus'"
                    @click="graduateStudent(student)"
                    :class="['rounded-lg p-2 transition', theme.isDark ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-50']"
                    title="Luluskan Siswa"
                  >
                    <SvgIcon name="check" :size="16" />
                  </button>
                  <button
                    v-if="auth.hasPermission('students.delete')"
                    @click="confirmDelete(student)"
                    :class="['rounded-lg p-2 transition', theme.isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50']"
                    title="Hapus"
                  >
                    <SvgIcon name="trash" :size="16" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="data.length === 0">
              <td colspan="10" class="px-4 py-10 text-center text-slate-400">
                Tidak ada data ditemukan
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div
        v-if="!loading && data.length > 0"
        :class="['grid grid-cols-1 gap-4 p-4 md:hidden', theme.isDark ? 'bg-slate-900' : 'bg-white']"
      >
        <div
          v-for="student in data"
          :key="student.id"
          :class="['rounded-2xl border p-4 shadow-sm', theme.isDark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-slate-50/80']"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <h3 :class="['text-base font-semibold break-words leading-snug', theme.isDark ? 'text-slate-100' : 'text-slate-800']">
                {{ student.nama_lengkap }}
              </h3>
              <p :class="['mt-1 text-xs font-mono', theme.isDark ? 'text-slate-400' : 'text-slate-500']">
                {{ student.nisn || "No NISN" }}
              </p>
            </div>
            <span :class="student.status_periode === 'Baru' ? 'badge-success' : 'badge-gray'">
              {{ student.status_periode }}
            </span>
          </div>

          <div :class="['mt-3 flex items-center justify-between text-sm', theme.isDark ? 'text-slate-300' : 'text-slate-600']">
            <span :class="student.jenis_kelamin === 'Laki-laki' ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400'">
              {{ student.jenis_kelamin }}
            </span>
            <span :class="['text-xs', theme.isDark ? 'text-slate-400' : 'text-slate-500']">{{ student.nama_ayah || "-" }}</span>
          </div>

          <div :class="['mt-4 space-y-2 text-xs', theme.isDark ? 'text-slate-300' : 'text-slate-600']">
            <div class="flex items-center justify-between gap-2">
              <span :class="theme.isDark ? 'text-slate-400' : 'text-slate-500'">Kelas</span>
              <span :class="student.kelas_status === 'Ada' ? 'badge-success' : 'badge-secondary'" class="max-w-[150px] text-left break-words">{{ student.kelas_label || 'Belum ada' }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span :class="theme.isDark ? 'text-slate-400' : 'text-slate-500'">Laundry</span>
              <span :class="student.laundry_status === 'Ada' ? 'badge-info' : 'badge-secondary'" class="max-w-[150px] text-left break-words">{{ student.laundry_vendor || 'Belum ada' }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span :class="theme.isDark ? 'text-slate-400' : 'text-slate-500'">Halaqoh</span>
              <span :class="student.halaqoh_status === 'Ada' ? 'badge-warning' : 'badge-secondary'" class="max-w-[150px] text-left break-words">{{ student.halaqoh_teacher || 'Belum ada' }}</span>
            </div>
          </div>

          <div :class="['mt-4 flex justify-end gap-2 border-t pt-3', theme.isDark ? 'border-slate-700' : 'border-slate-200']">
            <button
              @click="
                $router.push({
                  name: 'student-detail',
                  params: { id: student.id },
                })
              "
              :class="['rounded-lg p-2 transition', theme.isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-slate-100' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700']"
            >
              <SvgIcon name="eye" :size="18" />
            </button>
            <button
              v-if="auth.hasPermission('students.edit')"
              @click="editStudent(student)"
              :class="['rounded-lg p-2 transition', theme.isDark ? 'text-sky-400 hover:bg-sky-500/10' : 'text-sky-600 hover:bg-sky-100']"
            >
              <SvgIcon name="edit" :size="18" />
            </button>
            <button
              v-if="auth.hasPermission('students.edit') && student.status_periode !== 'Lulus'"
              @click="graduateStudent(student)"
              :class="['rounded-lg p-2 transition', theme.isDark ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-100']"
              title="Luluskan Siswa"
            >
              <SvgIcon name="check" :size="18" />
            </button>
            <button
              v-if="auth.hasPermission('students.delete')"
              @click="confirmDelete(student)"
              :class="['rounded-lg p-2 transition', theme.isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-100']"
            >
              <SvgIcon name="trash" :size="18" />
            </button>
          </div>
        </div>
      </div>
      <div
        v-else-if="!loading && data.length === 0"
        :class="['md:hidden px-4 py-8 text-center', theme.isDark ? 'text-slate-400' : 'text-slate-400']"
      >
        Tidak ada data
      </div>

      <!-- Pagination -->
      <div
        v-if="meta.totalPages > 1"
        :class="[
          'flex flex-col gap-3 border-t px-4 py-3 md:flex-row md:items-center md:justify-between',
          theme.isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-slate-50/60'
        ]"
      >
        <p :class="['text-sm', theme.isDark ? 'text-slate-300' : 'text-slate-500']">
          Menampilkan {{ (meta.page - 1) * meta.perPage + 1 }}–{{
            Math.min(meta.page * meta.perPage, meta.total)
          }}
          dari {{ meta.total }} santri
        </p>
        <div class="flex flex-wrap items-center gap-3 md:gap-4">
          <div class="flex items-center gap-2">
            <span :class="['text-sm hidden sm:inline', theme.isDark ? 'text-slate-300' : 'text-slate-500']">Per halaman:</span>
            <select
              v-model="meta.perPage"
              :class="[
                'input-field !py-1.5 !text-sm !w-auto rounded-lg focus:ring-primary focus:border-primary',
                theme.isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-900'
              ]"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="setPage(meta.page - 1)"
              :disabled="meta.page === 1"
              :class="[
                'rounded-lg px-2 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed',
                theme.isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'
              ]"
            >
              <SvgIcon name="chevron-left" :size="16" />
            </button>

            <button
              v-for="(page, i) in visiblePages"
              :key="i"
              @click="typeof page === 'number' ? setPage(page) : null"
              :class="[
                'rounded-lg px-3 py-1.5 text-sm transition min-w-[2.2rem]',
                typeof page === 'number'
                  ? meta.page === page
                    ? 'bg-primary text-white shadow-sm'
                    : theme.isDark
                      ? 'text-slate-200 hover:bg-slate-700'
                      : 'text-slate-600 hover:bg-slate-200'
                  : theme.isDark ? 'text-slate-500 cursor-default' : 'text-slate-400 cursor-default',
              ]"
              :disabled="typeof page !== 'number'"
            >
              {{ page }}
            </button>

            <button
              @click="setPage(meta.page + 1)"
              :disabled="meta.page === meta.totalPages"
              :class="[
                'rounded-lg px-2 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed',
                theme.isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'
              ]"
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
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useTable } from "@/composables/useTable";
import api from "@/api";
import SvgIcon from "@/components/ui/SvgIcon.vue";
import StudentForm from "@/components/students/StudentForm.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import { useToastStore } from "@/stores/toast";
import { useThemeStore } from "@/stores/theme";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const toast = useToastStore();
const theme = useThemeStore();

const isAlumniPage = computed(() => route.name === "alumni");

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
  initialFilters: {
    jenis_kelamin: "",
    status_periode: isAlumniPage.value ? "Lulus" : "",
    kelas_status: "",
    laundry_status: "",
    halaqoh_status: "",
  },
});

watch(
  () => isAlumniPage.value,
  (alumniMode) => {
    filters.status_periode = alumniMode ? "Lulus" : "";
    selectedIds.value = [];
    fetchData();
  },
  { immediate: true },
);

// Pagination Logic
const visiblePages = computed(() => {
  const page = Number(meta.page) || 1;
  const totalPages = Number(meta.totalPages) || 1;

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  const windowSize = 2;

  pages.push(1);

  if (page > windowSize + 2) pages.push("...");

  const start = Math.max(2, page - windowSize);
  const end = Math.min(totalPages - 1, page + windowSize);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  if (page < totalPages - windowSize - 1) pages.push("...");
  pages.push(totalPages);

  return pages.filter((item, index, arr) => {
    if (typeof item === "string") return true;
    return index === 0 || item !== arr[index - 1];
  });
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
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students-export.xlsx";
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

async function graduateStudent(student) {
  if (!student?.id) return;
  if (!window.confirm(`Luluskan santri ${student.nama_lengkap}?`)) return;

  try {
    await api.put(`/students/${student.id}/graduate`);
    toast.success(`Santri ${student.nama_lengkap} berhasil diluluskan`);
    fetchData();
  } catch (e) {
    toast.error(e?.response?.data?.message || "Gagal meluluskan santri");
  }
}
</script>
