<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-3">
          <router-link to="/dashboard/jadwal-formal" class="text-slate-400 hover:text-slate-600 transition" title="Kembali">
            <SvgIcon name="arrow-left" :size="22" />
          </router-link>
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Tong Sampah Jadwal</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Jadwal yang telah dihapus secara soft-delete. Anda bisa mengembalikan atau menghapus permanen.</p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <select v-model="selectedType" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <option value="formal">Formal</option>
          <option value="diniyyah">Diniyyah</option>
        </select>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-900">
      <div v-if="loading" class="p-12 text-center text-slate-500 dark:text-slate-400">
        <div class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600"></div>
        <p class="text-sm">Memuat data sampah...</p>
      </div>

      <div v-else>
        <div v-if="items.length === 0" class="p-12 text-center text-slate-500 dark:text-slate-400">
          <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <SvgIcon name="trash" :size="22" />
          </div>
          <p class="text-base font-medium">Tempat sampah masih kosong.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead class="bg-slate-50 dark:bg-slate-800/70">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Jenis</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Pelajaran</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Kelas</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Guru</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Hari & Jam</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Dihapus Pada</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
              <tr v-for="item in items" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {{ item.type === 'ramadhan' ? 'Ramadhan' : (selectedType === 'diniyyah' ? 'Diniyyah' : 'Formal') }}
                </td>
                <td class="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                  {{ getLessonName(item) }}
                </td>
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                  {{ getClassName(item) }}
                </td>
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                  {{ getTeacherName(item) }}
                </td>
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                  {{ getDay(item) }} · {{ getTimeRange(item) }}
                </td>
                <td class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                  {{ formatDateTime(item.deleted_at) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="confirmRestore(item)" class="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
                      <SvgIcon name="refresh" :size="14" /> Restore
                    </button>
                    <button @click="confirmForceDelete(item)" class="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30">
                      <SvgIcon name="trash" :size="14" /> Hapus Permanen
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-model:show="showConfirmModal"
      :title="confirmTitle"
      :message="confirmMessage"
      :confirm-text="confirmBtnText"
      cancel-text="Batal"
      :type="confirmType"
      :loading="actionLoading"
      @confirm="handleConfirmAction"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '@/api';
import SvgIcon from '@/components/ui/SvgIcon.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const items = ref([]);
const loading = ref(true);
const selectedType = ref('formal');

const showConfirmModal = ref(false);
const actionType = ref('');
const selectedItem = ref(null);
const actionLoading = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmBtnText = ref('');
const confirmType = ref('danger');

async function fetchTrashed() {
  loading.value = true;
  try {
    const response = await api.get('/schedules/trashed', { params: { type: selectedType.value } });
    items.value = response.data || [];
  } catch (error) {
    console.error(error);
    toast.error('Gagal memuat data sampah jadwal');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchTrashed();
});

watch(selectedType, () => {
  fetchTrashed();
});

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getLessonName(item) {
  if (selectedType.value === 'diniyyah') return item.assignment?.diniyyah_lesson?.name || '-';
  return item.assignment?.lesson?.name || '-';
}

function getClassName(item) {
  const kelas = item.assignment?.kelas;
  if (!kelas) return '-';
  return `${kelas.nama || ''} ${kelas.tingkat || ''}`.trim();
}

function getTeacherName(item) {
  return item.assignment?.teacher?.name || '-';
}

function getDay(item) {
  return item.day || '-';
}

function getTimeRange(item) {
  if (!item.start_time || !item.end_time) return '-';
  return `${item.start_time.slice(0, 5)} - ${item.end_time.slice(0, 5)}`;
}

function confirmRestore(item) {
  actionType.value = 'restore';
  selectedItem.value = item;
  confirmTitle.value = 'Restore Jadwal';
  confirmMessage.value = `Apakah Anda yakin ingin mengembalikan jadwal ${getLessonName(item)} (${getClassName(item)})?`;
  confirmBtnText.value = 'Restore Jadwal';
  confirmType.value = 'info';
  showConfirmModal.value = true;
}

function confirmForceDelete(item) {
  actionType.value = 'force_delete';
  selectedItem.value = item;
  confirmTitle.value = 'Hapus Permanen Jadwal';
  confirmMessage.value = `Tindakan ini tidak dapat dibatalkan. Jadwal ${getLessonName(item)} (${getClassName(item)}) akan dihapus selamanya dari database. Apakah Anda yakin?`;
  confirmBtnText.value = 'Ya, Hapus Permanen';
  confirmType.value = 'danger';
  showConfirmModal.value = true;
}

async function handleConfirmAction() {
  if (!selectedItem.value) return;

  actionLoading.value = true;
  try {
    if (actionType.value === 'restore') {
      await api.put(`/schedules/${selectedItem.value.id}/restore`, {}, { params: { type: selectedType.value } });
      toast.success('Jadwal berhasil dikembalikan');
    } else if (actionType.value === 'force_delete') {
      await api.delete(`/schedules/${selectedItem.value.id}/force`, { params: { type: selectedType.value } });
      toast.success('Jadwal berhasil dihapus permanen');
    }

    showConfirmModal.value = false;
    selectedItem.value = null;
    await fetchTrashed();
  } catch (error) {
    console.error(error);
    toast.error(actionType.value === 'restore' ? 'Gagal mengembalikan jadwal' : 'Gagal menghapus permanen jadwal');
  } finally {
    actionLoading.value = false;
  }
}
</script>
