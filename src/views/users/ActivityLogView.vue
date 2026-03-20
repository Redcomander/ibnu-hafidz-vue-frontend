<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-primary-dark tracking-tight">Log Aktivitas</h1>
        <p class="text-sm text-gray-500 mt-1">Riwayat aktivitas pengguna berdasarkan request API.</p>
      </div>
      <button @click="fetchLogs" class="btn-secondary px-4 py-2">Refresh</button>
    </div>

    <div class="glass-card p-4 rounded-xl border border-gray-100 flex flex-wrap gap-3">
      <input v-model="filters.search" class="input-field !py-2 min-w-[220px]" placeholder="Cari path/method..." />
      <select v-model="filters.method" class="input-field !py-2 !w-auto min-w-[130px]">
        <option value="">Semua Method</option>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="PATCH">PATCH</option>
        <option value="DELETE">DELETE</option>
      </select>
      <input v-model="filters.user_name" class="input-field !py-2 !w-auto min-w-[180px]" placeholder="Nama Pengguna" />
    </div>

    <div class="glass-card overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">Memuat log aktivitas...</div>
      <table v-else class="data-table hidden md:table">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Pengguna</th>
            <th>Method</th>
            <th>Path</th>
            <th>Status</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in logs" :key="item.id">
            <td class="text-gray-700">{{ formatDate(item.created_at) }}</td>
            <td class="font-medium">{{ item.user?.name || ('User #' + item.user_id) }}</td>
            <td>
              <span class="badge" :class="methodClass(item.method)">{{ item.method }}</span>
            </td>
            <td class="font-mono text-xs text-gray-600">{{ item.path }}</td>
            <td>
              <span class="badge" :class="item.status_code >= 400 ? 'badge-danger' : 'badge-success'">
                {{ item.status_code }}
              </span>
            </td>
            <td class="text-gray-500">{{ item.ip_address || '-' }}</td>
          </tr>
          <tr v-if="logs.length === 0">
            <td colspan="6" class="text-center py-8 text-gray-400">Belum ada data log.</td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading" class="md:hidden p-4 space-y-3">
        <div v-for="item in logs" :key="item.id" class="border border-gray-100 rounded-lg p-3 bg-gray-50/50 space-y-1">
          <div class="text-xs text-gray-500">{{ formatDate(item.created_at) }}</div>
          <div class="font-medium">{{ item.user?.name || ('User #' + item.user_id) }} · {{ item.method }} {{ item.path }}</div>
          <div class="text-xs text-gray-500">Status {{ item.status_code }} · IP {{ item.ip_address || '-' }}</div>
        </div>
        <div v-if="logs.length === 0" class="text-center text-gray-400 py-6">Belum ada data log.</div>
      </div>

      <div v-if="meta.total_pages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <p class="text-sm text-gray-500">Halaman {{ meta.page }} dari {{ meta.total_pages }}</p>
        <div class="flex gap-2">
          <button @click="setPage(meta.page - 1)" :disabled="meta.page <= 1" class="px-3 py-1 rounded border border-gray-200 disabled:opacity-50">Prev</button>
          <button @click="setPage(meta.page + 1)" :disabled="meta.page >= meta.total_pages" class="px-3 py-1 rounded border border-gray-200 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import api from '@/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const loading = ref(false);
const isFetching = ref(false);
const logs = ref([]);
const meta = reactive({ page: 1, per_page: 20, total_pages: 1, total: 0 });
const filters = reactive({ search: '', method: '', user_name: '' });
let filterDebounceTimer;
let autoRefreshTimer;
const AUTO_REFRESH_MS = 15000;

function methodClass(method) {
  if (method === 'GET') return 'badge-info';
  if (method === 'POST') return 'badge-success';
  if (method === 'PUT' || method === 'PATCH') return 'badge-warning';
  if (method === 'DELETE') return 'badge-danger';
  return '';
}

function formatDate(v) {
  if (!v) return '-';
  return new Date(v).toLocaleString('id-ID');
}

async function fetchLogs({ silent = false } = {}) {
  if (isFetching.value) return;
  isFetching.value = true;
  if (!silent) loading.value = true;
  try {
    const { data } = await api.get('/activity-logs', {
      params: {
        page: meta.page,
        per_page: meta.per_page,
        search: filters.search || undefined,
        method: filters.method || undefined,
        user_name: filters.user_name || undefined,
      },
    });

    logs.value = data.data || [];
    meta.page = data.page || 1;
    meta.per_page = data.per_page || 20;
    meta.total_pages = data.total_pages || 1;
    meta.total = data.total || 0;
  } catch (e) {
    toast.error(e.response?.data?.message || 'Gagal memuat log aktivitas');
  } finally {
    isFetching.value = false;
    if (!silent) loading.value = false;
  }
}

function setPage(page) {
  if (page < 1 || page > meta.total_pages) return;
  meta.page = page;
  fetchLogs();
}

function stopAutoRefresh() {
  clearInterval(autoRefreshTimer);
  autoRefreshTimer = null;
}

function startAutoRefresh() {
  stopAutoRefresh();
  if (document.hidden) return;
  autoRefreshTimer = setInterval(() => {
    fetchLogs({ silent: true });
  }, AUTO_REFRESH_MS);
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopAutoRefresh();
    return;
  }
  fetchLogs({ silent: true });
  startAutoRefresh();
}

watch(
  () => [filters.search, filters.method, filters.user_name],
  () => {
    clearTimeout(filterDebounceTimer);
    filterDebounceTimer = setTimeout(() => {
      meta.page = 1;
      fetchLogs();
    }, 350);
  },
);

onUnmounted(() => {
  clearTimeout(filterDebounceTimer);
  stopAutoRefresh();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

onMounted(() => {
  fetchLogs();
  startAutoRefresh();
  document.addEventListener('visibilitychange', handleVisibilityChange);
});
</script>
