<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    @click.self="close"
  >
    <div
      class="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col h-[92vh] max-h-[92vh] sm:max-h-[90vh]"
    >
      <!-- Header -->
      <div
        class="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/70"
      >
        <div>
          <h3 class="text-lg font-bold text-gray-800 dark:text-slate-100">Kelola Anggota Kelas</h3>
          <p class="text-sm text-gray-500 dark:text-slate-400">
            {{ kelas?.nama }} - {{ kelas?.tingkat }}
          </p>
        </div>
        <button
          @click="close"
          class="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
        >
          <SvgIcon name="x" :size="20" />
        </button>
      </div>

      <!-- Body -->
      <div class="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
        <!-- Left: Add Member -->
        <div
          class="w-full md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-700 flex flex-col min-h-0"
        >
          <h4 class="font-semibold text-gray-700 dark:text-slate-200 mb-3">Tambah Santri</h4>

          <div class="relative mb-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama santri..."
              class="input-field !pl-10 h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              style="padding-left: 2.5rem !important"
            />
            <SvgIcon
              name="search"
              :size="16"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400"
            />
          </div>

          <div
            class="flex-1 min-h-0 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
          >
            <div v-if="isSearching" class="p-4 text-center text-gray-400 dark:text-slate-400">
              <div
                class="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2"
              ></div>
              Mencari...
            </div>
            <div
              v-else-if="searchResults.length === 0 && searchQuery"
              class="p-4 text-center text-gray-500 dark:text-slate-400 text-sm"
            >
              Tidak ditemukan santri dengan nama tersebut.
            </div>
            <div
              v-else-if="!searchQuery"
              class="p-4 text-center text-gray-400 dark:text-slate-500 text-sm"
            >
              Ketik nama santri untuk mencari.
            </div>
            <div v-else class="divide-y divide-gray-100 dark:divide-slate-700">
              <div
                v-for="student in searchResults"
                :key="student.id"
                class="p-3 hover:bg-gray-50 dark:hover:bg-slate-800/70 flex justify-between items-center"
              >
                <div>
                  <p class="font-medium text-gray-800 dark:text-slate-100 text-sm">
                    {{ student.nama_lengkap }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-slate-400">{{ student.nisn || "-" }}</p>
                </div>
                <button
                  @click="addStudent(student)"
                  :disabled="
                    processingId === student.id || isMember(student.id)
                  "
                  class="btn-sm btn-primary px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="isMember(student.id)">Terdaftar</span>
                  <span v-else>Tambah</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Current Members -->
        <div class="w-full md:w-1/2 p-4 flex flex-col min-h-0 bg-gray-50/30 dark:bg-slate-800/40">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-semibold text-gray-700 dark:text-slate-200">Daftar Anggota</h4>
            <span
              class="text-xs font-medium px-2 py-0.5 bg-primary-50 dark:bg-primary/20 text-primary rounded-full"
            >
              {{ filteredMembers.length }} / {{ currentMembers.length }} Santri
            </span>
          </div>

          <div class="relative mb-3">
            <input
              v-model="memberSearchQuery"
              type="text"
              placeholder="Cari anggota kelas..."
              class="input-field !pl-10 h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              style="padding-left: 2.5rem !important"
            />
            <SvgIcon
              name="search"
              :size="16"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400"
            />
          </div>

          <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div v-if="loadingMembers" class="p-8 text-center text-gray-400 dark:text-slate-400">
              <div
                class="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"
              ></div>
            </div>
            <div
              v-else-if="currentMembers.length === 0"
              class="p-8 text-center text-gray-400 dark:text-slate-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg"
            >
              <p class="text-sm">Belum ada anggota di kelas ini.</p>
            </div>
            <div
              v-else-if="filteredMembers.length === 0"
              class="p-8 text-center text-gray-400 dark:text-slate-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg"
            >
              <p class="text-sm">Tidak ada anggota yang cocok dengan pencarian.</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="student in filteredMembers"
                :key="student.id"
                class="bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm flex justify-between items-center group"
              >
                <div>
                  <p class="font-medium text-gray-800 dark:text-slate-100 text-sm">
                    {{ student.nama_lengkap }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-slate-400">{{ student.nisn || "-" }}</p>
                </div>
                <button
                  @click="removeStudent(student)"
                  :disabled="processingId === student.id"
                  class="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  title="Keluarkan"
                >
                  <SvgIcon name="x" :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import api from "@/api";
import { useToastStore } from "@/stores/toast";
import SvgIcon from "@/components/ui/SvgIcon.vue";

const props = defineProps({
  show: Boolean,
  kelas: Object,
});

const emit = defineEmits(["update:show", "updated"]);
const toast = useToastStore();

const searchQuery = ref("");
const searchResults = ref([]);
const isSearching = ref(false);
const currentMembers = ref([]);
const loadingMembers = ref(false);
const processingId = ref(null);
const memberSearchQuery = ref("");

const filteredMembers = computed(() => {
  const query = memberSearchQuery.value.trim().toLowerCase();
  if (!query) return currentMembers.value;
  return currentMembers.value.filter((student) => {
    const nama = (student?.nama_lengkap || "").toLowerCase();
    const nisn = (student?.nisn || "").toLowerCase();
    return nama.includes(query) || nisn.includes(query);
  });
});

// Debounce search manually since lodash might not be installed
let searchTimeout = null;
const performSearch = async (query) => {
  if (!query) {
    searchResults.value = [];
    return;
  }
  isSearching.value = true;
  try {
    const { data } = await api.get("/students", {
      params: { search: query, per_page: 5 },
    });
    searchResults.value = data.data;
  } catch (e) {
    console.error(e);
  } finally {
    isSearching.value = false;
  }
};

watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => performSearch(val), 300);
});

// Fetch members when modal opens or kelas changes
watch(
  () => props.show,
  (val) => {
    if (val && props.kelas) {
      fetchMembers();
      searchQuery.value = "";
      memberSearchQuery.value = "";
      searchResults.value = [];
    }
  },
);

async function fetchMembers() {
  if (!props.kelas) return;
  loadingMembers.value = true;
  try {
    // Fetch fresh kelas data to get students
    const { data } = await api.get(`/kelas/${props.kelas.id}`);
    // Assuming backend returns students in the kelas object (Preloaded)
    currentMembers.value = data.students || [];
  } catch (e) {
    console.error("Failed to fetch members", e);
    toast.error("Gagal memuat daftar anggota");
  } finally {
    loadingMembers.value = false;
  }
}

function isMember(studentId) {
  return currentMembers.value.some((m) => m.id === studentId);
}

async function addStudent(student) {
  if (processingId.value) return;
  processingId.value = student.id;
  try {
    await api.post(`/kelas/${props.kelas.id}/students`, {
      student_id: student.id,
    });
    toast.success(`${student.nama_lengkap} berhasil ditambahkan`);
    await fetchMembers();
    emit("updated"); // Signal parent to refresh list if needed
  } catch (e) {
    console.error(e);
    toast.error("Gagal menambahkan santri");
  } finally {
    processingId.value = null;
  }
}

async function removeStudent(student) {
  if (!confirm(`Keluarkan ${student.nama_lengkap} dari kelas ini?`)) return;

  if (processingId.value) return;
  processingId.value = student.id;
  try {
    await api.delete(`/kelas/${props.kelas.id}/students/${student.id}`);
    toast.success(`${student.nama_lengkap} berhasil dikeluarkan`);
    await fetchMembers();
    emit("updated");
  } catch (e) {
    console.error(e);
    toast.error("Gagal mengeluarkan santri");
  } finally {
    processingId.value = null;
  }
}

function close() {
  emit("update:show", false);
}
</script>
