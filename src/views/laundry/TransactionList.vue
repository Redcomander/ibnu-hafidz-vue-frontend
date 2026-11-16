<template>
  <div class="laundry-page tx-page">
    <header class="tx-hero">
      <div><span class="tx-eyebrow">OPERASIONAL / LAUNDRY</span><h1>Transaksi Laundry</h1><p>Setiap setoran tercatat. Pantau proses, vendor, dan petugas dalam satu tempat.</p></div>
      <button v-if="auth.hasPermission('laundry_accounts.create')" @click="createTransaction" class="tx-add"><SvgIcon name="plus" :size="18" /><span>Tambah Transaksi</span></button>
    </header>

    <section class="tx-summary" aria-label="Ringkasan transaksi halaman ini">
      <div><span>Hasil pencarian</span><strong>{{ loading ? '—' : meta.total.toLocaleString('id-ID') }}</strong><small>transaksi sesuai filter</small></div>
      <div><span>Berat halaman ini</span><strong>{{ loading ? '—' : formatNumber(pageSummary.weight) }} <em>kg</em></strong><small>dari {{ data.length }} transaksi yang tampil</small></div>
      <div><span>Masih diproses</span><strong>{{ loading ? '—' : pageSummary.pending }}</strong><small>transaksi pada halaman ini</small></div>
      <div class="tx-review-metric"><span>Perlu diperiksa</span><strong>{{ loading ? '—' : pageSummary.similar }}</strong><small>baris dengan transaksi serupa</small></div>
    </section>

    <section class="tx-filters" aria-label="Filter transaksi laundry">
      <div class="tx-section-head"><div><h2>Temukan transaksi</h2><p>Gabungkan vendor, status, dan periode pencatatan.</p></div><button type="button" class="tx-reset" @click="resetFilters">Reset filter</button></div>
      <div class="tx-filter-grid">
        <label class="tx-search"><span>Pencarian</span><input v-model="search" type="search" placeholder="Cari nama, nomor laundry, atau catatan..." class="input-field" /></label>
        <div><label for="transaction-vendor-filter">Vendor transaksi</label><select id="transaction-vendor-filter" v-model="filters.vendor_id" :disabled="vendorsLoading" class="input-field"><option value="">{{ vendorsLoading ? 'Memuat vendor…' : 'Semua vendor' }}</option><option v-for="vendor in vendors" :key="vendor.id" :value="String(vendor.id)">{{ vendor.name }} ({{ vendor.gender_type }})</option></select><button v-if="vendorsError" type="button" class="tx-load-error" @click="loadVendors">Gagal memuat vendor. Coba lagi</button></div>
        <label><span>Status transaksi</span><select v-model="filters.status" class="input-field"><option value="">Semua status</option><option value="pending">Sedang dicuci</option><option value="picked_up">Sudah diambil</option></select></label>
        <label><span>Dari tanggal</span><input type="date" v-model="filters.date_from" class="input-field" /></label>
        <label><span>Sampai tanggal</span><input type="date" v-model="filters.date_to" class="input-field" /></label>
      </div>
    </section>

    <aside class="tx-review-note"><SvgIcon name="alert-triangle" :size="18" /><p><strong>Penanda transaksi serupa.</strong> Sorotan kuning berarti akun atau pemilik yang sama memiliki beberapa transaksi pada tanggal yang sama, termasuk di halaman/vendor lain. Periksa kembali sebelum mengambil tindakan.</p></aside>
    <section class="tx-ledger">
      <div class="tx-section-head tx-ledger-head"><div><span class="tx-eyebrow">RIWAYAT SETORAN</span><h2>Daftar transaksi <span class="tx-count">{{ meta.total }}</span></h2></div><div class="tx-scroll-controls"><span>Geser untuk melihat semua kolom</span><button type="button" aria-label="Geser tabel ke kiri" :disabled="!canScrollLeft" @click="scrollTable(-1)"><SvgIcon name="chevron-left" :size="18" /></button><button type="button" aria-label="Geser tabel ke kanan" :disabled="!canScrollRight" @click="scrollTable(1)"><SvgIcon name="chevron-right" :size="18" /></button></div></div>
      <div v-if="loading" class="p-12 text-center text-gray-400">
        <div class="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm">Memuat data transaksi...</p>
      </div>

      <div v-else>
        <div ref="tableViewport" class="tx-table-scroll" role="region" aria-label="Tabel transaksi laundry, dapat digulir horizontal" tabindex="0" @scroll="updateScroll"><table class="data-table tx-table"><caption class="sr-only">Riwayat transaksi laundry beserta vendor, penginput, dan penanda transaksi serupa.</caption>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Nomor Laundry & Pemilik</th>
              <th>Vendor</th>
              <th class="text-right">Berat (Kg)</th>
              <th class="text-right">Tagihan Total</th>
              <th class="text-center">Status</th>
              <th>Diinput oleh</th>
              <th>Catatan</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data" :key="item.id" :class="{ 'laundry-similar': item.same_day_count > 1 }">
              <td class="font-medium text-gray-800">
                {{ formatDate(item.tanggal) }}
              </td>
              <td>
                <div class="font-medium text-blue-700">{{ item.account?.nomor_laundry }}</div>
                <span v-if="item.same_day_count > 1" class="laundry-similar-badge">{{ item.same_day_count }} transaksi pada tanggal yang sama</span>
                <div class="tx-owner">
                  {{ item.account?.student?.nama_lengkap || item.account?.user?.name || 'Unknown' }}
                </div>
              </td>
              <td class="text-sm text-gray-600">
                {{ item.vendor?.name || item.account?.vendor?.name || '-' }}
              </td>
              <td class="text-right font-medium">
                {{ formatNumber(item.berat_kg) }} Kg
              </td>
              <td class="text-right font-medium text-gray-800">
                {{ formatRupiah(item.total_harga) }}
                <div class="text-[10px] text-gray-400">@{{ formatRupiah(item.harga_per_kg) }}/Kg</div>
              </td>
              <td class="text-center">
                <span
                  :class="[
                    'px-2 py-1 text-[11px] font-bold rounded uppercase tracking-wider',
                    item.status === 'picked_up'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700',
                  ]"
                >
                  {{ item.status === 'picked_up' ? "Selesai" : "Proses" }}
                </span>
                <div v-if="item.status === 'picked_up'" class="text-[10px] mt-1 text-gray-400">
                  {{ formatDateTime(item.picked_up_at) }}
                </div>
              </td>
              <td class="text-sm text-gray-600">{{ item.input_by?.name || 'Belum tercatat' }}</td>
              <td class="tx-note-cell">
                {{ item.catatan || "-" }}
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="auth.hasPermission('laundry_accounts.edit')"
                    @click="editTransaction(item)"
                    class="text-indigo-600 hover:text-indigo-800 transition text-sm px-2 py-1 rounded hover:bg-indigo-50"
                    title="Edit Transaksi"
                  >
                    <SvgIcon name="edit" :size="16" />
                  </button>
                  <button
                    v-if="item.status === 'pending' && auth.hasPermission('laundry_accounts.edit')"
                    @click="markPickedUp(item)"
                    class="text-green-600 hover:text-green-800 transition text-sm px-2 py-1 rounded hover:bg-green-50"
                    title="Tandai Diambil"
                  >
                    <SvgIcon name="check-circle" :size="16" />
                  </button>
                  <button
                    v-if="auth.hasPermission('laundry_accounts.delete')"
                    @click="confirmDelete(item)"
                    class="text-red-500 hover:text-red-700 transition text-sm px-2 py-1 rounded hover:bg-red-50"
                    title="Hapus Transaksi"
                  >
                    <SvgIcon name="trash" :size="16" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="data.length === 0">
              <td colspan="9" class="text-center py-8 text-gray-400">
                Tidak ada transaksi laundry ditemukan.
              </td>
            </tr>
          </tbody>
        </table></div>

        <!-- Mobile View -->
        <div class="tx-mobile-list">
          <div
            v-for="item in data"
            :key="item.id"
            :class="{ 'laundry-similar': item.same_day_count > 1 }"
            class="tx-mobile-card"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <span class="text-xs text-gray-500 font-medium">{{ formatDate(item.tanggal) }}</span>
                <h3 class="font-bold text-blue-700 mt-1">{{ item.account?.nomor_laundry }}</h3>
                <span v-if="item.same_day_count > 1" class="laundry-similar-badge">{{ item.same_day_count }} transaksi pada tanggal yang sama</span>
                <p class="tx-owner">
                  {{ item.account?.student?.nama_lengkap || item.account?.user?.name || 'Unknown' }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  Vendor: {{ item.vendor?.name || item.account?.vendor?.name || '-' }}
                </p>
              </div>
              <span
                :class="[
                  'px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider',
                  item.status === 'picked_up' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700',
                ]"
              >
                {{ item.status === 'picked_up' ? "Selesai" : "Proses" }}
              </span>
            </div>
            
            <div class="flex justify-between items-center bg-gray-50 rounded-lg p-3 my-3">
              <div>
                <p class="text-[10px] text-gray-500 uppercase font-semibold">Berat</p>
                <p class="font-bold text-gray-800">{{ formatNumber(item.berat_kg) }} Kg</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-gray-500 uppercase font-semibold">Total Tagihan</p>
                <p class="font-bold text-gray-800">{{ formatRupiah(item.total_harga) }}</p>
              </div>
            </div>

            <p class="text-xs text-gray-600 mb-3">Diinput oleh: <strong>{{ item.input_by?.name || 'Belum tercatat' }}</strong></p>
            <div v-if="item.catatan" class="mb-3 text-sm text-gray-600 bg-orange-50/50 p-2 rounded">
              <span class="font-medium text-gray-700 block text-xs mb-1">Catatan:</span>
              {{ item.catatan }}
            </div>
            
            <div v-if="item.status === 'picked_up'" class="text-xs text-gray-400 mb-3 flex items-center gap-1">
              <SvgIcon name="check-circle" :size="12" class="text-green-500" />
              Diambil pada: {{ formatDateTime(item.picked_up_at) }}
            </div>

            <div class="tx-card-actions">
              <button
                v-if="auth.hasPermission('laundry_accounts.edit')"
                @click="editTransaction(item)"
                class="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded transition text-xs font-medium"
              >
                <SvgIcon name="edit" :size="14" />
                <span>Edit</span>
              </button>
              <button
                v-if="item.status === 'pending' && auth.hasPermission('laundry_accounts.edit')"
                @click="markPickedUp(item)"
                class="flex items-center gap-1 text-green-600 hover:text-green-800 bg-green-50 px-3 py-1.5 rounded transition text-xs font-medium"
              >
                <SvgIcon name="check-circle" :size="14" />
                <span>Tandai Diambil</span>
              </button>
              <button
                v-if="auth.hasPermission('laundry_accounts.delete')"
                @click="confirmDelete(item)"
                class="flex items-center justify-center p-1.5 text-red-500 hover:bg-red-50 rounded bg-gray-50 transition"
                title="Hapus"
              >
                <SvgIcon name="trash" :size="14" />
              </button>
            </div>
          </div>
          <div
            v-if="data.length === 0"
            class="text-center py-8 text-gray-400 col-span-full border border-dashed border-gray-200 rounded-xl"
          >
            Tidak ada transaksi laundry ditemukan.
          </div>
        </div>
      </div>

      <div
        v-if="meta.totalPages > 1"
        class="tx-pagination"
      >
        <p class="text-sm text-gray-500">
          Halaman {{ meta.page }} dari {{ meta.totalPages }}
        </p>
        <div class="flex items-center gap-2">
          <button
            aria-label="Halaman transaksi sebelumnya" @click="setPage(meta.page - 1)"
            :disabled="meta.page === 1"
            class="p-1 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            <SvgIcon name="chevron-left" :size="20" />
          </button>
          <button
            aria-label="Halaman transaksi berikutnya" @click="setPage(meta.page + 1)"
            :disabled="meta.page === meta.totalPages"
            class="p-1 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            <SvgIcon name="chevron-right" :size="20" />
          </button>
        </div>
      </div>
    </section>

    <!-- Forms/Modals -->
    <TransactionForm v-model="showForm" :transaction="selectedTransaction" @saved="handleSaved" />
    
    <ConfirmModal panel-class="laundry-dialog"
      v-model:show="showDeleteModal"
      title="Hapus Transaksi"
      :message="`Menghapus transaksi ini akan mengurangi total berat (sebesar ${transactionToDelete?.berat_kg} Kg) pada akun laundry terkait. Lanjutkan?`"
      confirm-text="Hapus Permanen"
      cancel-text="Batal"
      type="danger"
      :loading="deleteLoading"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import './transactions.css';
import { useLaundryVendors } from '@/composables/useLaundryVendors';
import { useAuthStore } from "@/stores/auth";
import { useTable } from "@/composables/useTable";
import api from "@/api";
import SvgIcon from "@/components/ui/SvgIcon.vue";
import TransactionForm from "@/components/laundry/TransactionForm.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import { useToastStore } from "@/stores/toast";

const auth = useAuthStore();
const toast = useToastStore();
const { vendors, vendorsLoading, vendorsError, loadVendors } = useLaundryVendors();

const showForm = ref(false);
const selectedTransaction = ref(null);
const showDeleteModal = ref(false);
const transactionToDelete = ref(null);
const deleteLoading = ref(false);

const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

const { data, loading, meta, search, filters, fetchData, setPage } =
  useTable("/laundry/transactions", {
    defaultSort: "created_at",
    defaultOrder: "desc",
    initialFilters: {
      vendor_id: "",
      status: "",
      date_from: firstDay,
      date_to: lastDay,
    },
  });

const tableViewport = ref(null), canScrollLeft = ref(false), canScrollRight = ref(false);
const pageSummary = computed(() => data.value.reduce((summary, row) => {
  summary.weight += Number(row.berat_kg) || 0;
  summary.pending += row.status === 'pending' ? 1 : 0;
  summary.similar += Number(row.same_day_count) > 1 ? 1 : 0;
  return summary;
}, { weight: 0, pending: 0, similar: 0 }));
function updateScroll() {
  const element = tableViewport.value;
  canScrollLeft.value = !!element && element.scrollLeft > 1;
  canScrollRight.value = !!element && element.scrollWidth - element.clientWidth - element.scrollLeft > 1;
}
watch(tableViewport, (element, _, onCleanup) => {
  if (!element) { updateScroll(); return; }
  const observer = new ResizeObserver(updateScroll);
  observer.observe(element);
  updateScroll();
  onCleanup(() => observer.disconnect());
}, { flush: 'post' });
function scrollTable(direction) {
  const element = tableViewport.value;
  element?.scrollBy({ left: direction * Math.max(280, element.clientWidth * .7), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
function resetFilters() {
  search.value = '';
  Object.assign(filters, { vendor_id: '', status: '', date_from: firstDay, date_to: lastDay });
}
function formatNumber(num) {
  if (!num) return "0";
  return parseFloat(num).toFixed(2);
}

function formatRupiah(amount) {
  if (!amount) return "Rp 0";
  return "Rp " + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return dateStr.split('T')[0];
}

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
}

function createTransaction() {
  selectedTransaction.value = null;
  showForm.value = true;
}

function editTransaction(transaction) {
  selectedTransaction.value = { ...transaction };
  showForm.value = true;
}

async function markPickedUp(transaction) {
  try {
    await api.put(`/laundry/transactions/${transaction.id}/pickup`);
    toast.success("Berhasil ditandai sudah diambil");
    fetchData();
  } catch (e) {
    if (e.response?.data?.message) {
      toast.error(e.response.data.message);
    } else {
      toast.error("Gagal update status pengambilan.");
    }
  }
}

function confirmDelete(transaction) {
  transactionToDelete.value = transaction;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!transactionToDelete.value) return;

  deleteLoading.value = true;
  try {
    await api.delete(`/laundry/transactions/${transactionToDelete.value.id}`);
    toast.success(`Transaksi berhasil dihapus`);
    fetchData();
    showDeleteModal.value = false;
  } catch (e) {
    console.error(e);
    toast.error("Gagal menghapus transaksi");
  } finally {
    deleteLoading.value = false;
    transactionToDelete.value = null;
  }
}

function handleSaved() {
  selectedTransaction.value = null;
  fetchData();
}
</script>
