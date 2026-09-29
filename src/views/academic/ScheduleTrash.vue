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

      <div class="flex items-center gap-3">
        <select v-model="selectedType" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <option value="formal">Formal</option>
          <option value="diniyyah">Diniyyah</option>
        </select>

        <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <label for="rows-per-page" class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Tampilkan</label>
          <select id="rows-per-page" v-model="rowsPerPage" class="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>
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

        <div v-else class="space-y-3 p-3">
          <div v-if="selectedIds.length" class="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-900/10">
            <span class="text-sm font-medium text-emerald-700 dark:text-emerald-300">{{ selectedIds.length }} dipilih</span>
            <button @click="confirmBulkRestore" class="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800">
              <SvgIcon name="refresh" :size="14" /> Restore massal
            </button>
            <button @click="confirmBulkForceDelete" class="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-slate-800">
              <SvgIcon name="trash" :size="14" /> Hapus permanen massal
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead class="bg-slate-50 dark:bg-slate-800/70">
                <tr>
                  <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                    <input
                      type="checkbox"
                      :checked="paginatedItems.length > 0 && paginatedItems.every((item) => selectedIds.includes(item.id))"
                      :indeterminate="selectedIds.length > 0 && !paginatedItems.every((item) => selectedIds.includes(item.id)) && paginatedItems.some((item) => selectedIds.includes(item.id))"
                      @change="toggleSelectAll"
                      class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
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
                <tr v-for="item in paginatedItems" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td class="px-3 py-3">
                    <input
                      type="checkbox"
                      :checked="selectedIds.includes(item.id)"
                      @change="toggleSelect(item.id)"
                      class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
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

          <div class="flex flex-col gap-3 border-t border-slate-200 px-3 py-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-sm text-slate-500 dark:text-slate-400">
              Menampilkan {{ paginatedItems.length ? (currentPage - 1) * rowsPerPage + 1 : 0 }}-{{ Math.min(currentPage * rowsPerPage, items.length) }} dari {{ items.length }} data
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Prev
              </button>

              <div class="flex items-center gap-1">
                <button
                  v-for="page in pageNumbers"
                  :key="page"
                  type="button"
                  @click="currentPage = page"
                  :class="[
                    'min-w-9 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition',
                    page === currentPage
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                  ]"
                >
                  {{ page }}
                </button>
              </div>

              <button
                type="button"
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
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
import { ref, watch, onMounted, computed } from 'vue';
import api from '@/api';
import SvgIcon from '@/components/ui/SvgIcon.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const items = ref([]);
const loading = ref(true);
const selectedType = ref('formal');
const selectedIds = ref([]);
const rowsPerPage = ref(10);
const currentPage = ref(1);

const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / rowsPerPage.value)));
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return items.value.slice(start, end);
});
const pageNumbers = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages.value, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let page = startPage; page <= endPage; page++) {
    pages.push(page);
  }

  return pages;
});

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
    selectedIds.value = selectedIds.value.filter((id) => items.value.some((item) => item.id === id));
  } catch (error) {
    console.error(error);
    toast.error('Gagal memuat data sampah jadwal');
  } finally {
    loading.value = false;
  }
}

function toggleSelect(id) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((itemId) => itemId !== id);
    return;
  }

  selectedIds.value = [...selectedIds.value, id];
}

function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedIds.value = [...new Set([...selectedIds.value, ...paginatedItems.value.map((item) => item.id)])];
    return;
  }

  selectedIds.value = selectedIds.value.filter((id) => !paginatedItems.value.some((item) => item.id === id));
}

function confirmBulkRestore() {
  const selectedItems = items.value.filter((item) => selectedIds.value.includes(item.id));
  if (!selectedItems.length) return;

  actionType.value = 'bulk_restore';
  selectedItem.value = null;
  confirmTitle.value = 'Restore Jadwal Terpilih';
  confirmMessage.value = `Apakah Anda yakin ingin mengembalikan ${selectedItems.length} jadwal yang dipilih?`;
  confirmBtnText.value = 'Restore Terpilih';
  confirmType.value = 'info';
  showConfirmModal.value = true;
}

function confirmBulkForceDelete() {
  const selectedItems = items.value.filter((item) => selectedIds.value.includes(item.id));
  if (!selectedItems.length) return;

  actionType.value = 'bulk_force_delete';
  selectedItem.value = null;
  confirmTitle.value = 'Hapus Permanen Jadwal Terpilih';
  confirmMessage.value = `Tindakan ini akan menghapus permanen ${selectedItems.length} jadwal yang dipilih. Apakah Anda yakin?`;
  confirmBtnText.value = 'Ya, Hapus Permanen';
  confirmType.value = 'danger';
  showConfirmModal.value = true;
}

onMounted(() => {
  fetchTrashed();
});

watch(selectedType, () => {
  currentPage.value = 1;
  fetchTrashed();
});

watch(rowsPerPage, () => {
  currentPage.value = 1;
});

watch(currentPage, () => {
  const lastPage = totalPages.value;
  if (currentPage.value > lastPage) {
    currentPage.value = lastPage;
  }
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
  actionLoading.value = true;
  try {
    if (actionType.value === 'bulk_restore') {
      const selectedItems = items.value.filter((item) => selectedIds.value.includes(item.id));
      for (const item of selectedItems) {
        await api.put(`/schedules/${item.id}/restore`, {}, { params: { type: selectedType.value } });
      }
      toast.success(`${selectedItems.length} jadwal berhasil dikembalikan`);
      selectedIds.value = [];
    } else if (actionType.value === 'bulk_force_delete') {
      const selectedItems = items.value.filter((item) => selectedIds.value.includes(item.id));
      for (const item of selectedItems) {
        await api.delete(`/schedules/${item.id}/force`, { params: { type: selectedType.value } });
      }
      toast.success(`${selectedItems.length} jadwal berhasil dihapus permanen`);
      selectedIds.value = [];
    } else if (selectedItem.value) {
      if (actionType.value === 'restore') {
        await api.put(`/schedules/${selectedItem.value.id}/restore`, {}, { params: { type: selectedType.value } });
        toast.success('Jadwal berhasil dikembalikan');
      } else if (actionType.value === 'force_delete') {
        await api.delete(`/schedules/${selectedItem.value.id}/force`, { params: { type: selectedType.value } });
        toast.success('Jadwal berhasil dihapus permanen');
      }
    }

    showConfirmModal.value = false;
    selectedItem.value = null;
    actionType.value = '';
    await fetchTrashed();
  } catch (error) {
    console.error(error);
    const isBulk = actionType.value === 'bulk_restore' || actionType.value === 'bulk_force_delete';
    toast.error(isBulk ? 'Gagal memproses jadwal terpilih' : (actionType.value === 'restore' ? 'Gagal mengembalikan jadwal' : 'Gagal menghapus permanen jadwal'));
  } finally {
    actionLoading.value = false;
  }
}
</script>
