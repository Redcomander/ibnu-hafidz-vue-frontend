<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <router-link
            to="/kamar"
            class="text-gray-500 hover:text-primary transition flex items-center gap-1 text-sm"
          >
            <SvgIcon name="chevron-left" :size="16" />
            Kembali
          </router-link>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Detail Kamar</h1>
      </div>

      <div class="flex gap-2">
        <button
          v-if="kamar && auth.hasPermission('kamar.edit')"
          @click="showForm = true"
          class="btn-secondary flex items-center gap-2"
        >
          <SvgIcon name="edit" :size="18" />
          Edit Kamar
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="kamar" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-1 space-y-6">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
            Informasi Kamar
          </h2>

          <div class="space-y-4">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500">Nama Kamar</p>
              <p class="text-lg font-semibold text-gray-900">{{ kamar.nama_kamar }}</p>
            </div>

            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500">Kapasitas</p>
              <span class="badge-primary mt-1 inline-flex">
                {{ kamar.kapasitas }} Orang
              </span>
            </div>

            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500">Wali Kamar</p>
              <div class="mt-2 flex items-center gap-3">
                <div
                  v-if="kamar.wali_kamar"
                  class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold"
                >
                  {{ getInitials(kamar.wali_kamar.name) }}
                </div>
                <p class="font-medium text-gray-900">
                  {{ kamar.wali_kamar?.name || "Belum ditentukan" }}
                </p>
              </div>
            </div>

            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500">Musyrif / Pendamping</p>
              <div v-if="kamar.secondary_walies?.length" class="mt-2 space-y-2">
                <div
                  v-for="wali in kamar.secondary_walies"
                  :key="wali.id"
                  class="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                >
                  <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                    {{ getInitials(wali.name) }}
                  </div>
                  <span class="text-sm text-gray-700">{{ wali.name }}</span>
                </div>
              </div>
              <p v-else class="mt-2 text-sm text-gray-500">Belum ada musyrif pendamping.</p>
            </div>

            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500">Keterangan</p>
              <p class="mt-2 text-sm text-gray-700 whitespace-pre-line">
                {{ kamar.keterangan || "Tidak ada keterangan." }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="xl:col-span-2 space-y-6">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between gap-3 border-b pb-2 mb-4">
            <h2 class="text-lg font-bold text-gray-800">
              Anggota Kamar ({{ kamar.students?.length || 0 }})
            </h2>
            <button
              v-if="auth.hasPermission('kamar.edit')"
              @click="showMembersModal = true"
              class="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
            >
              <SvgIcon name="users" :size="16" />
              Kelola Anggota
            </button>
          </div>

          <div
            v-if="!kamar.students || kamar.students.length === 0"
            class="text-center py-12 text-gray-500"
          >
            <SvgIcon name="users" :size="48" class="mx-auto mb-3 text-gray-300" />
            <p>Belum ada santri yang ditugaskan ke kamar ini.</p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
              v-for="student in kamar.students"
              :key="student.id"
              class="group relative rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-white transition"
            >
              <div class="flex items-center gap-3">
                <img
                  v-if="student.foto_santri"
                  :src="student.foto_santri"
                  alt="Foto santri"
                  class="w-12 h-12 rounded-full object-cover border border-white shadow-sm"
                />
                <div
                  v-else
                  class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-sm font-bold"
                >
                  {{ getInitials(student.nama_lengkap || student.name) }}
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-gray-800 truncate">
                    {{ student.nama_lengkap || student.name }}
                  </p>
                  <p class="text-xs text-gray-500">NISN: {{ student.nisn || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between gap-3 border-b pb-2 mb-4">
            <h2 class="text-lg font-bold text-gray-800">Attendance Session</h2>
            <button
              v-if="auth.hasPermission('kamar.edit')"
              @click="showCreateSession = !showCreateSession"
              class="btn-secondary text-sm"
            >
              {{ showCreateSession ? 'Tutup Form' : 'Buat Session' }}
            </button>
          </div>

          <div v-if="showCreateSession" class="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Session</label>
                <input v-model="sessionForm.name" class="input-field" placeholder="Contoh: Senin Pagi" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select v-model="sessionForm.session_type" class="input-field">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input v-model="sessionForm.week_start_date" type="date" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <input v-model="sessionForm.notes" class="input-field" placeholder="Opsional" />
              </div>
            </div>

            <div class="mt-4 flex justify-end">
              <button @click="createSession" class="btn-primary">Simpan Session</button>
            </div>
          </div>

          <div v-if="loadingSessions" class="text-sm text-gray-500 py-4">Memuat session...</div>
          <div v-else-if="sessions.length === 0" class="py-6 text-center text-gray-500">
            Belum ada session attendance untuk kamar ini.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="session in sessions"
              :key="session.id"
              class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <div>
                <p class="font-semibold text-gray-800">{{ session.name }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ session.session_type }} • {{ formatDate(session.week_start_date || session.created_at) }}
                </p>
              </div>
              <div class="text-sm text-gray-600">
                {{ session.records?.length || 0 }} record
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <KamarForm v-if="kamar" v-model="showForm" :kamar="kamar" @saved="fetchData" />
    <KamarMembersModal
      v-if="kamar"
      v-model:show="showMembersModal"
      :kamar="kamar"
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
import KamarForm from "@/components/kamar/KamarForm.vue";
import KamarMembersModal from "@/components/kamar/KamarMembersModal.vue";

const route = useRoute();
const auth = useAuthStore();
const toast = useToastStore();

const kamar = ref(null);
const sessions = ref([]);
const loading = ref(true);
const loadingSessions = ref(true);
const showForm = ref(false);
const showMembersModal = ref(false);
const showCreateSession = ref(false);

const sessionForm = ref({
  name: "",
  session_type: "daily",
  week_start_date: "",
  notes: "",
});

async function fetchData() {
  loading.value = true;
  try {
    const { data } = await api.get(`/kamar/${route.params.id}`);
    kamar.value = data;
    await fetchSessions();
  } catch (error) {
    console.error("Failed to fetch kamar detail", error);
    toast.error("Gagal memuat detail kamar");
  } finally {
    loading.value = false;
  }
}

async function fetchSessions() {
  loadingSessions.value = true;
  try {
    const { data } = await api.get(`/kamar/${route.params.id}/attendance/sessions`);
    sessions.value = data;
  } catch (error) {
    console.error("Failed to fetch kamar sessions", error);
    sessions.value = [];
  } finally {
    loadingSessions.value = false;
  }
}

async function createSession() {
  if (!sessionForm.value.name.trim()) {
    toast.error("Nama session wajib diisi");
    return;
  }

  try {
    await api.post(`/kamar/${route.params.id}/attendance/sessions`, {
      name: sessionForm.value.name,
      session_type: sessionForm.value.session_type,
      week_start_date: sessionForm.value.week_start_date || null,
      notes: sessionForm.value.notes || "",
    });
    toast.success("Session attendance berhasil dibuat");
    sessionForm.value = { name: "", session_type: "daily", week_start_date: "", notes: "" };
    showCreateSession.value = false;
    await fetchSessions();
  } catch (error) {
    console.error("Failed to create session", error);
    const message = error.response?.data?.message || "Gagal membuat session attendance";
    toast.error(message);
  }
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return value;
  }
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

onMounted(() => {
  fetchData();
});
</script>
