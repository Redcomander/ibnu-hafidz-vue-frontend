<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 rounded-2xl p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-slate-100">
    <!-- Page Header -->
    <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 mb-6">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10"></div>
      <div class="relative p-6 sm:p-8">
        <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent tracking-tight">
              Manajemen Akun Laundry
            </h1>
            <p class="text-slate-600 dark:text-slate-300 text-sm mt-1">
              Kelola akun laundry dan pantau batas mingguan/bulanan seperti tampilan web lama.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
        <button
          v-if="auth.hasPermission('laundry_accounts.view')"
          @click="exportExceeded"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg transition"
        >
          <SvgIcon name="document-download" :size="16" />
          <span>Download Excel</span>
        </button>
        <button
          v-if="auth.hasPermission('laundry_accounts.view')"
          @click="exportAllAccountsPdf"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg transition"
        >
          <SvgIcon name="document-download" :size="16" />
          <span>Print PDF</span>
        </button>
        <button
          v-if="auth.hasPermission('laundry_accounts.create')"
          @click="openBulkCreateModal"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
        >
          <SvgIcon name="users" :size="16" />
          <span>Bulk Create</span>
        </button>
        <button
          v-if="auth.hasPermission('laundry_accounts.create')"
          @click="createAccount"
          class="btn-primary flex items-center gap-2"
        >
          <SvgIcon name="plus" :size="16" />
          <span>Tambah Akun</span>
        </button>
        <router-link
          v-if="auth.hasPermission('laundry_accounts.delete')"
          to="/admin/laundry/accounts/trash"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <SvgIcon name="trash" :size="16" />
          <span>Akun Terhapus</span>
        </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
      <div class="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-5 text-white">
        <div class="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-12 -mt-12"></div>
        <p class="text-blue-100 text-xs font-semibold uppercase tracking-wider">Batas Mingguan</p>
        <p class="text-4xl font-bold mt-1">7.5 <span class="text-xl text-blue-200">Kg</span></p>
        <p class="text-xs text-blue-100 mt-1">Per 7 hari terakhir</p>
      </div>
      <div class="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl p-5 text-white">
        <div class="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-12 -mt-12"></div>
        <p class="text-purple-100 text-xs font-semibold uppercase tracking-wider">Batas Bulanan</p>
        <p class="text-4xl font-bold mt-1">30 <span class="text-xl text-purple-200">Kg</span></p>
        <p class="text-xs text-purple-100 mt-1">Per bulan berjalan</p>
      </div>
      <div class="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl p-5 text-white">
        <div class="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-12 -mt-12"></div>
        <p class="text-amber-100 text-xs font-semibold uppercase tracking-wider">Harga Per Kg</p>
        <p class="text-4xl font-bold mt-1">Rp <span class="text-3xl">4.500</span></p>
        <p class="text-xs text-amber-100 mt-1">Untuk kelebihan batas</p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden mb-6">
      <div class="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Filter & Pencarian</h2>
      </div>
      <div class="p-4 sm:p-6 flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-[220px]">
        <input
          v-model="search"
          type="text"
          placeholder="Cari nomor laundry atau nama..."
          class="w-full pl-4 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition"
        />
      </div>
      <select v-model="filters.gender_type" class="px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition" @change="fetchData">
        <option value="all">Semua Kategori</option>
        <option value="banin">Banin</option>
        <option value="banat">Banat</option>
      </select>
      <div class="flex flex-wrap gap-2 items-center w-full sm:w-auto">
        <span class="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Periode Limit:</span>
        <input type="date" v-model="filters.date_from" @change="fetchData" class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
        <span class="text-slate-400 dark:text-slate-500">-</span>
        <input type="date" v-model="filters.date_to" @change="fetchData" class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
      </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden animate-fade-in">
      <div v-if="loading" class="p-12 text-center text-gray-400 dark:text-slate-400">
        <div class="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm">Memuat data akun...</p>
      </div>

      <div v-else>
        <table class="w-full hidden xl:table">
          <thead>
            <tr class="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-850 border-b border-slate-200 dark:border-slate-700">
              <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nomor</th>
              <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Pemilik</th>
              <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Vendor</th>
              <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Bulanan</th>
              <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Tagihan</th>
              <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Status</th>
              <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="item in data" :key="item.id" :class="{'bg-red-50/30 dark:bg-red-900/20 border-l-4 border-red-500': item.monthly_exceeded}" class="hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm">{{ item.nomor_laundry }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-gray-800 dark:text-slate-100">{{ item.owner_name }}</div>
                <div class="text-xs text-gray-500 dark:text-slate-400">{{ item.owner_type }}</div>
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-slate-300 font-medium">
                {{ item.vendor?.name || "-" }}
                <span :class="['ml-1 px-1.5 py-0.5 rounded text-[10px]', item.vendor?.gender_type === 'banin' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700']">
                  {{ item.vendor?.gender_type }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex flex-col items-center">
                  <span :class="['font-bold', item.monthly_exceeded ? 'text-red-600' : 'text-green-600']">
                    {{ formatNumber(item.monthly_weight) }} Kg
                  </span>
                  <div class="w-full max-w-[100px] bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                    <div 
                      class="h-1.5 rounded-full" 
                      :class="item.monthly_exceeded ? 'bg-red-500' : 'bg-green-500'" 
                      :style="`width: ${Math.min((item.monthly_weight / 30) * 100, 100)}%`"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span v-if="item.monthly_exceeded" class="text-red-600 font-bold text-sm bg-red-100 px-2 py-1 rounded">
                  {{ formatRupiah(item.debt_amount) }}
                </span>
                <span v-else class="text-gray-400 dark:text-slate-500 text-sm">-</span>
              </td>
              <td class="px-6 py-4 text-center">
                <button
                  @click="toggleBlock(item)"
                  :class="[
                    'px-3 py-1 text-xs font-medium rounded-full transition cursor-pointer border',
                    item.blocked
                      ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/60'
                      : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/60',
                  ]"
                  title="Klik untuk ubah status blokir"
                >
                  {{ item.blocked ? "Diblokir" : "Aktif" }}
                </button>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="auth.hasPermission('laundry_accounts.edit')"
                    @click="editAccount(item)"
                    class="text-primary dark:text-blue-300 hover:text-primary-dark transition text-sm px-2 py-1 rounded hover:bg-primary-50 dark:hover:bg-slate-800"
                  >
                    <SvgIcon name="edit" :size="16" />
                  </button>
                  <button
                    v-if="auth.hasPermission('laundry_accounts.delete')"
                    @click="confirmDelete(item)"
                    class="text-red-500 hover:text-red-700 transition text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <SvgIcon name="trash" :size="16" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="data.length === 0">
              <td colspan="7" class="text-center py-8 text-gray-400 dark:text-slate-500">
                Tidak ada data akun laundry.
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Mobile View -->
        <div class="grid grid-cols-1 gap-4 xl:hidden p-4">
          <div
            v-for="item in data"
            :key="item.id"
            class="bg-white dark:bg-slate-900 border text-sm border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative"
            :class="{'border-red-200 bg-red-50/20': item.monthly_exceeded}"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="font-bold text-gray-800 dark:text-slate-100">{{ item.nomor_laundry }}</h3>
                <p class="text-sm font-medium text-blue-700 dark:text-blue-300 mt-0.5">{{ item.owner_name }}</p>
                <div class="flex gap-1 items-center mt-1">
                  <span class="text-xs text-gray-500 dark:text-slate-400">{{ item.owner_type }}</span>
                  <span class="text-gray-300 dark:text-slate-600 px-1">•</span>
                  <span class="text-xs text-gray-600 dark:text-slate-300 font-medium tracking-tight">{{ item.vendor?.name || "-" }}</span>
                  <span :class="['ml-1 px-1.5 py-0.5 rounded text-[10px]', item.vendor?.gender_type === 'banin' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700']">
                    {{ item.vendor?.gender_type }}
                  </span>
                </div>
              </div>
              
              <button
                @click="toggleBlock(item)"
                :class="[
                  'px-2 py-1 text-[10px] font-bold rounded-full transition cursor-pointer shrink-0 uppercase',
                  item.blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
                ]"
              >
                {{ item.blocked ? "Diblokir" : "Aktif" }}
              </button>
            </div>
            
            <div class="my-3 bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
              <div class="flex justify-between items-center mb-1.5">
                <p class="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Berat Bulanan / Limit (30Kg)</p>
                <span :class="['font-bold text-sm', item.monthly_exceeded ? 'text-red-600' : 'text-green-600']">
                  {{ formatNumber(item.monthly_weight) }} Kg
                </span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                <div 
                  class="h-1.5 rounded-full" 
                  :class="item.monthly_exceeded ? 'bg-red-500' : 'bg-green-500'" 
                  :style="`width: ${Math.min((item.monthly_weight / 30) * 100, 100)}%`"
                ></div>
              </div>
            </div>

            <div v-if="item.monthly_exceeded" class="mb-3 flex justify-between items-center bg-red-50/50 p-2 rounded border border-red-100">
               <span class="text-xs font-semibold text-red-800">Tagihan Kelebihan:</span>
               <span class="text-sm font-bold text-red-600">{{ formatRupiah(item.debt_amount) }}</span>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-700 mt-2">
              <button
                v-if="auth.hasPermission('laundry_accounts.edit')"
                @click="editAccount(item)"
                class="flex items-center justify-center p-1.5 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 rounded transition"
                title="Edit"
              >
                <SvgIcon name="edit" :size="16" />
              </button>
              <button
                v-if="auth.hasPermission('laundry_accounts.delete')"
                @click="confirmDelete(item)"
                class="flex items-center justify-center p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded bg-gray-50 dark:bg-slate-800 transition"
                title="Hapus"
              >
                <SvgIcon name="trash" :size="16" />
              </button>
            </div>
          </div>
          <div
            v-if="data.length === 0"
            class="text-center py-8 text-gray-400 dark:text-slate-500 col-span-full border border-dashed border-gray-200 dark:border-slate-700 rounded-xl"
          >
            Tidak ada data akun laundry.
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div
        v-if="meta.totalPages > 1"
        class="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700"
      >
        <p class="text-sm text-gray-500 dark:text-slate-400">
          Halaman {{ meta.page }} dari {{ meta.totalPages }}
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="setPage(meta.page - 1)"
            :disabled="meta.page === 1"
            class="p-1 rounded text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <SvgIcon name="chevron-left" :size="20" />
          </button>
          <button
            @click="setPage(meta.page + 1)"
            :disabled="meta.page === meta.totalPages"
            class="p-1 rounded text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <SvgIcon name="chevron-right" :size="20" />
          </button>
        </div>
      </div>
    </div>

    <!-- Forms/Modals will go here -->
    <AccountForm v-model="showForm" :account="selectedAccount" @saved="handleSaved" />
    <AccountBulkCreateModal v-model:show="showBulkModal" @saved="handleSaved" />
    
    <ConfirmModal
      v-model:show="showDeleteModal"
      title="Hapus Akun Laundry"
      :message="`Menghapus akun laundry ${accountToDelete?.nomor_laundry} akan menghapus semua riwayat transaksi terkait. Apakah Anda yakin?`"
      confirm-text="Hapus Permanen"
      cancel-text="Batal"
      type="danger"
      :loading="deleteLoading"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTable } from "@/composables/useTable";
import api from "@/api";
import SvgIcon from "@/components/ui/SvgIcon.vue";
import AccountForm from "@/components/laundry/AccountForm.vue";
import AccountBulkCreateModal from "@/components/laundry/AccountBulkCreateModal.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import { useToastStore } from "@/stores/toast";

const auth = useAuthStore();
const toast = useToastStore();

const showForm = ref(false);
const selectedAccount = ref(null);
const showBulkModal = ref(false);

const showDeleteModal = ref(false);
const accountToDelete = ref(null);
const deleteLoading = ref(false);

// Initialize dates to current month
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

const { data, loading, meta, search, filters, fetchData, setPage } =
  useTable("/laundry/accounts", {
    defaultSort: "monthly_weight",
    defaultOrder: "desc",
    initialFilters: { 
      gender_type: "all",
      date_from: firstDay,
      date_to: lastDay
    },
  });

function formatNumber(num) {
  if (!num) return "0";
  return parseFloat(num).toFixed(2);
}

function formatRupiah(amount) {
  if (!amount) return "Rp 0";
  return "Rp " + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function createAccount() {
  selectedAccount.value = null;
  showForm.value = true;
}

function editAccount(account) {
  selectedAccount.value = { ...account };
  showForm.value = true;
}

function openBulkCreateModal() {
  showBulkModal.value = true;
}

async function toggleBlock(account) {
  try {
    const response = await api.put(`/laundry/accounts/${account.id}/toggle-block`);
    toast.success(response.data.blocked ? "Akun berhasil diblokir" : "Akun berhasil diaktifkan");
    fetchData();
  } catch(e) {
    toast.error("Gagal mengubah status blokir");
  }
}

function confirmDelete(account) {
  accountToDelete.value = account;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!accountToDelete.value) return;

  deleteLoading.value = true;
  try {
    await api.delete(`/laundry/accounts/${accountToDelete.value.id}`);
    toast.success(`Akun laundry ${accountToDelete.value.nomor_laundry} berhasil dihapus`);
    fetchData();
    showDeleteModal.value = false;
  } catch (e) {
    console.error(e);
    toast.error("Gagal menghapus akun");
  } finally {
    deleteLoading.value = false;
    accountToDelete.value = null;
  }
}

function exportExceeded() {
  const token = auth.accessToken;
  const queryParams = new URLSearchParams();
  
  if (filters.gender_type && filters.gender_type !== 'all') {
    queryParams.append('gender_type', filters.gender_type);
  }
  if (filters.date_from) {
    queryParams.append('date_from', filters.date_from);
  }
  if (filters.date_to) {
    queryParams.append('date_to', filters.date_to);
  }
  if (search.value) {
    queryParams.append('search', search.value);
  }
  if (token) {
    queryParams.append('token', token);
  }
  
  const url = `${api.defaults.baseURL || 'http://localhost:8080/api'}/laundry/export/accounts/exceeded/excel?${queryParams.toString()}`;
  
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportAllAccountsPdf() {
  const token = auth.accessToken;
  const queryParams = new URLSearchParams();
  
  if (filters.gender_type && filters.gender_type !== 'all') {
    queryParams.append('gender_type', filters.gender_type);
  }
  if (token) {
    queryParams.append('token', token);
  }
  
  const url = `${api.defaults.baseURL || 'http://localhost:8080/api'}/laundry/export/accounts/all/pdf?${queryParams.toString()}`;
  
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function handleSaved() {
  fetchData();
}
</script>
