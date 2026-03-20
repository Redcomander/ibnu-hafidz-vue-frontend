<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <router-link
            to="/kelas"
            class="text-gray-500 hover:text-primary transition flex items-center gap-1 text-sm"
          >
            <SvgIcon name="chevron-left" :size="16" />
            Kembali
          </router-link>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Detail Kelas</h1>
      </div>
      <div class="flex gap-2">
        <button
          v-if="kelas"
          @click="exportKelas('excel')"
          class="btn-secondary flex items-center gap-2"
        >
          <SvgIcon name="download" :size="16" />
          Export Excel
        </button>
        <button
          v-if="kelas"
          @click="exportKelas('pdf')"
          class="btn-secondary flex items-center gap-2"
        >
          <SvgIcon name="document" :size="16" />
          Export PDF
        </button>
        <button
          v-if="auth.hasPermission('kelas.edit')"
          @click="showForm = true"
          class="btn-secondary flex items-center gap-2"
        >
          <SvgIcon name="edit" :size="18" />
          Edit Kelas
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"
      ></div>
    </div>

    <div v-else-if="kelas" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Class Info Card -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
            Informasi Kelas
          </h2>

          <div class="space-y-4">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider">
                Nama Kelas
              </p>
              <p class="text-lg font-medium text-gray-900">{{ kelas.nama }}</p>
            </div>

            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider">
                Tingkat
              </p>
              <p class="text-lg font-medium text-gray-900">
                {{ kelas.tingkat }}
              </p>
            </div>

            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider">
                Wali Kelas (Formal)
              </p>
              <div class="mt-1 flex items-center gap-3">
                <div
                  v-if="kelas.wali_kelas"
                  class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold"
                >
                  {{ kelas.wali_kelas.name.charAt(0) }}
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ kelas.wali_kelas?.name || "Belum ditentukan" }}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider">
                Wali Kelas (Diniyyah)
              </p>
              <div class="mt-1 flex items-center gap-3">
                <div
                  v-if="kelas.wali_kelas_diniyyah"
                  class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold"
                >
                  {{ kelas.wali_kelas_diniyyah.name.charAt(0) }}
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ kelas.wali_kelas_diniyyah?.name || "Belum ditentukan" }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Students Grid -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex justify-between items-center mb-6 border-b pb-2">
            <h2 class="text-lg font-bold text-gray-800">
              Anggota Kelas ({{ kelas.students?.length || 0 }})
            </h2>
             <button
              v-if="auth.hasPermission('kelas.edit')"
              @click="showMembersModal = true"
              class="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
            >
              <SvgIcon name="users" :size="16" />
              Kelola Anggota
            </button>
          </div>

          <div
            v-if="!kelas.students || kelas.students.length === 0"
            class="text-center py-12 text-gray-500"
          >
            <SvgIcon
              name="users"
              :size="48"
              class="mx-auto mb-3 text-gray-300"
            />
            <p>Belum ada santri di kelas ini.</p>
          </div>

          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          >
            <div
              v-for="student in kelas.students"
              :key="student.id"
              class="group relative bg-gray-50 hover:bg-white border border-gray-100 hover:border-primary/30 p-4 rounded-xl transition-all duration-200 hover:shadow-md flex flex-col items-center text-center"
            >
              <!-- Photo/Avatar -->
              <div class="mb-3">
                <img
                  v-if="student.foto_santri"
                  :src="student.foto_santri"
                  alt="Student"
                  class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div
                  v-else
                  class="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-xl font-bold shadow-sm"
                >
                  {{ getInitials(student.nama_lengkap) }}
                </div>
              </div>

              <!-- Info -->
              <h3
                class="font-semibold text-gray-800 line-clamp-1 w-full"
                :title="student.nama_lengkap"
              >
                {{ student.nama_lengkap }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                NISN: {{ student.nisn || "-" }}
              </p>

              <!-- Quick Delete Action -->
              <button
                v-if="auth.hasPermission('kelas.edit')"
                @click="removeStudent(student)"
                class="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="Keluarkan dari kelas"
              >
                <SvgIcon name="x" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="kelas" class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold">Data Pelajaran</h2>
          <p class="text-sm text-gray-500">Lesson assignments formal & diniyyah untuk kelas ini.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="border border-gray-200 rounded-lg p-3">
          <div class="mb-2 flex items-center justify-between">
            <p class="font-semibold text-gray-800">Pelajaran Formal</p>
            <span class="text-xs text-gray-500">{{ formalAssignments.length }} ditemukkan</span>
          </div>
          <div v-if="loadingAssignments" class="text-sm text-gray-500">Memuat...</div>
          <div v-else-if="formalAssignments.length === 0" class="text-sm text-gray-500">Belum ada penugasan pelajaran formal.</div>
          <ul v-else class="space-y-2">
            <li v-for="item in formalAssignments" :key="item.id" class="p-2 border border-gray-100 rounded-md bg-gray-50">
              <div class="text-sm font-semibold text-gray-800">{{ item.lesson?.name || '-' }}</div>
              <div class="text-xs text-gray-600">Guru: {{ item.teacher?.name || '-' }}</div>
            </li>
          </ul>
        </div>

        <div class="border border-gray-200 rounded-lg p-3">
          <div class="mb-2 flex items-center justify-between">
            <p class="font-semibold text-gray-800">Pelajaran Diniyyah</p>
            <span class="text-xs text-gray-500">{{ diniyyahAssignments.length }} ditemukkan</span>
          </div>
          <div v-if="loadingAssignments" class="text-sm text-gray-500">Memuat...</div>
          <div v-else-if="diniyyahAssignments.length === 0" class="text-sm text-gray-500">Belum ada penugasan pelajaran diniyyah.</div>
          <ul v-else class="space-y-2">
            <li v-for="item in diniyyahAssignments" :key="item.id" class="p-2 border border-gray-100 rounded-md bg-gray-50">
              <div class="text-sm font-semibold text-gray-800">{{ item.diniyyah_lesson?.name || '-' }}</div>
              <div class="text-xs text-gray-600">Guru: {{ item.teacher?.name || '-' }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <KelasForm
      v-if="kelas"
      v-model="showForm"
      :kelas="kelas"
      @saved="fetchData"
    />
    <KelasMembersModal
      v-if="kelas"
      v-model:show="showMembersModal"
      :kelas="kelas"
      @updated="fetchData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/api";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import SvgIcon from "@/components/ui/SvgIcon.vue";
import KelasForm from "@/components/kelas/KelasForm.vue";
import KelasMembersModal from "@/components/kelas/KelasMembersModal.vue";

const route = useRoute();
const auth = useAuthStore();
const toast = useToastStore();

const kelas = ref(null);
const loading = ref(true);
const loadingAssignments = ref(true);
const formalAssignments = ref([]);
const diniyyahAssignments = ref([]);
const showForm = ref(false);
const showMembersModal = ref(false);

async function fetchAssignments() {
  loadingAssignments.value = true;
  try {
    const formal = await api.get(`/kelas/${route.params.id}/teachers`, { params: { type: 'formal' } });
    formalAssignments.value = formal.data;
  } catch (e) {
    console.error('Failed to fetch formal lesson assignments', e);
    formalAssignments.value = [];
  }
  try {
    const diniyyah = await api.get(`/kelas/${route.params.id}/teachers`, { params: { type: 'diniyyah' } });
    diniyyahAssignments.value = diniyyah.data;
  } catch (e) {
    console.error('Failed to fetch diniyyah lesson assignments', e);
    diniyyahAssignments.value = [];
  }
  loadingAssignments.value = false;
}

async function fetchData() {
  loading.value = true;
  try {
    const { data } = await api.get(`/kelas/${route.params.id}`);
    kelas.value = data;
    await fetchAssignments();
  } catch (e) {
    console.error("Failed to fetch kelas detail", e);
    toast.error("Gagal memuat detail kelas");
  } finally {
    loading.value = false;
  }
}

async function removeStudent(student) {
  if (!confirm(`Keluarkan ${student.nama_lengkap} dari kelas ini?`)) return;

  try {
    await api.delete(`/kelas/${kelas.value.id}/students/${student.id}`);
    toast.success(`${student.nama_lengkap} berhasil dikeluarkan`);
    fetchData();
  } catch (e) {
    console.error(e);
    toast.error("Gagal mengeluarkan santri");
  }
}

async function exportKelas(type) {
  if (!kelas.value?.id) return;
  try {
    const endpoint = type === 'excel' ? 'export-excel' : 'export-pdf';
    const fileExt = type === 'excel' ? 'csv' : 'txt';
    const res = await api.get(`/kelas/${kelas.value.id}/${endpoint}`, { responseType: 'blob' });
    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kelas-${kelas.value.nama || kelas.value.id}.${fileExt}`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    toast.error('Gagal export data kelas');
  }
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

onMounted(() => {
  fetchData();
});
</script>
