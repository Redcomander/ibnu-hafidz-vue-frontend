<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      </TransitionChild>

      <!-- Bottom-sheet on mobile, centered dialog on sm+ -->
      <div class="fixed inset-0 flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 overflow-y-auto">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
        >
          <DialogPanel
            class="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl text-left overflow-hidden"
          >
            <!-- Drag handle (mobile visual cue) -->
            <div class="flex justify-center pt-3 pb-1 sm:hidden">
              <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <div class="px-5 pb-6 pt-3 sm:p-6">
              <div class="flex items-center justify-between mb-5">
                <DialogTitle as="h3" class="text-lg font-bold text-gray-900">
                  Tambah Transaksi Laundry
                </DialogTitle>
                <button @click="closeModal" type="button" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition">
                  <SvgIcon name="x" :size="20" />
                </button>
              </div>

              <form @submit.prevent="saveTransaction" class="space-y-4">
                <div ref="accountPickerRef" class="relative">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Nomor Laundry / Pemilik *
                  </label>

                  <div class="relative">
                    <input
                      v-model="searchQuery"
                      type="text"
                      class="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                      :placeholder="selectedAccountDetails ? `${selectedAccountDetails.nomor_laundry} — ${selectedAccountDetails.owner_name}` : 'Cari nomor laundry atau nama...'"
                      autocomplete="off"
                      @focus="showAccountDropdown = true"
                      @input="showAccountDropdown = true"
                    />
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <SvgIcon name="search" :size="18" />
                    </div>
                  </div>

                  <div
                    v-if="showAccountDropdown && filteredAccounts.length > 0"
                    class="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto"
                  >
                    <button
                      v-for="account in filteredAccounts"
                      :key="account.id"
                      type="button"
                      @click="selectAccount(account)"
                      class="w-full px-4 py-3 text-left hover:bg-green-50 transition border-b border-gray-100 last:border-b-0"
                      :class="account.blocked ? 'bg-red-50/60' : ''"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <div class="flex items-center flex-wrap gap-1.5">
                            <span class="font-semibold text-gray-900">{{ account.nomor_laundry }}</span>
                            <span
                              v-if="account.owner_type === 'Siswa'"
                              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700"
                            >
                              Siswa
                            </span>
                            <span
                              v-if="account.owner_type === 'Guru'"
                              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700"
                            >
                              Guru
                            </span>
                            <span
                              v-if="account.blocked"
                              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700"
                            >
                              Diblokir
                            </span>
                          </div>
                          <div class="text-sm text-gray-600 mt-0.5 break-words">
                            {{ account.owner_name }}
                            <span class="text-gray-400">•</span>
                            {{ account.vendor?.name || 'Tanpa vendor' }}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div
                    v-if="showAccountDropdown && searchQuery && filteredAccounts.length === 0"
                    class="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-4 text-center text-gray-500"
                  >
                    Tidak ada hasil untuk {{ searchQuery }}
                  </div>
                </div>

                <!-- Selected account card — shows full name without truncation -->
                <div v-if="selectedAccountDetails" class="rounded-xl border px-4 py-3 transition-colors"
                  :class="selectedAccountDetails.blocked
                    ? 'bg-red-50 border-red-200'
                    : 'bg-indigo-50 border-indigo-100'"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-[11px] font-semibold uppercase tracking-wider"
                        :class="selectedAccountDetails.blocked ? 'text-red-400' : 'text-indigo-400'">
                        {{ selectedAccountDetails.nomor_laundry }}
                      </p>
                      <!-- Full name — wraps naturally, never truncated -->
                      <p class="text-base font-bold text-gray-900 mt-0.5 leading-snug break-words">
                        {{ selectedAccountDetails.owner_name }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">
                        {{ selectedAccountDetails.vendor?.name || '—' }}
                      </p>
                    </div>
                    <div class="shrink-0 text-right">
                      <span v-if="selectedAccountDetails.blocked"
                        class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wide">
                        Diblokir
                      </span>
                      <template v-else>
                        <p class="text-[10px] text-gray-400 uppercase tracking-wide">Sisa Kuota</p>
                        <p class="text-sm font-bold text-indigo-600">
                          {{ Math.max(0, 30 - parseFloat(selectedAccountDetails.monthly_weight || 0)).toFixed(2) }} Kg
                        </p>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Weight input -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Berat (Kg) *
                  </label>
                  <div class="relative">
                    <input
                      v-model.number="form.berat_kg"
                      type="number"
                      step="0.01"
                      min="0.1"
                      required
                      class="input-field !pr-10"
                      placeholder="Contoh: 2.5"
                    />
                    <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 pointer-events-none">
                      Kg
                    </span>
                  </div>
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    v-model="form.catatan"
                    rows="2"
                    class="input-field resize-none"
                    placeholder="Contoh: Sprei, Selimut..."
                  ></textarea>
                </div>

                <!-- Total price -->
                <div v-if="form.laundry_account_id && form.berat_kg > 0"
                  class="rounded-xl border-2 px-4 py-3 flex items-center justify-between transition-all duration-200"
                  :class="selectedAccountDetails?.blocked ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'"
                >
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Harga</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ form.berat_kg }} kg × Rp 5.000</p>
                  </div>
                  <p class="text-2xl font-bold tabular-nums"
                    :class="selectedAccountDetails?.blocked ? 'text-gray-400' : 'text-green-600'">
                    Rp {{ (form.berat_kg * 5000).toLocaleString('id-ID') }}
                  </p>
                </div>

                <!-- Quota exceeded warning -->
                <div v-if="accountStats && (accountStats.weekly.exceeded || accountStats.monthly.exceeded)"
                  class="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <SvgIcon name="warning" :size="18" class="text-red-500 shrink-0 mt-0.5" />
                  <p class="text-sm text-red-700 font-medium">
                    <span v-if="accountStats.monthly.exceeded">Kuota bulanan (30kg) terlampaui!</span>
                    <span v-else>Kuota mingguan (7.5kg) terlampaui!</span>
                    Akan dicatat sebagai tagihan tambahan.
                  </p>
                </div>

                <div class="flex gap-3 pt-2">
                  <button type="button" class="btn-secondary flex-1" @click="closeModal" :disabled="loading">
                    Batal
                  </button>
                  <button type="submit" class="btn-primary flex-1" :disabled="loading || (selectedAccountDetails && selectedAccountDetails.blocked)">
                    <span v-if="loading" class="flex items-center justify-center gap-2">
                      <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Menyimpan...
                    </span>
                    <span v-else>Simpan Transaksi</span>
                  </button>
                </div>
              </form>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import api from "@/api";
import { useToastStore } from "@/stores/toast";
import SvgIcon from "@/components/ui/SvgIcon.vue";

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue", "saved"]);
const toast = useToastStore();
const loading = ref(false);

const form = ref({
  laundry_account_id: "",
  berat_kg: "",
  catatan: "",
});

const accounts = ref([]);
const accountStats = ref(null);
const searchQuery = ref("");
const showAccountDropdown = ref(false);
const accountPickerRef = ref(null);

const selectedAccountDetails = computed(() => {
  if (!form.value.laundry_account_id) return null;
  return accounts.value.find(a => a.id === form.value.laundry_account_id);
});

const filteredAccounts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return accounts.value;
  return accounts.value.filter((a) => {
    const nomor = (a.nomor_laundry || "").toLowerCase();
    const owner = (a.owner_name || "").toLowerCase();
    const vendor = (a.vendor?.name || "").toLowerCase();
    return nomor.includes(q) || owner.includes(q) || vendor.includes(q);
  });
});

function selectAccount(account) {
  form.value.laundry_account_id = account.id;
  searchQuery.value = "";
  showAccountDropdown.value = false;
}

function handleOutsideClick(event) {
  if (!showAccountDropdown.value) return;
  if (!accountPickerRef.value) return;
  if (!accountPickerRef.value.contains(event.target)) {
    showAccountDropdown.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick);
});

watch(() => form.value.laundry_account_id, async (newId) => {
  accountStats.value = null;
  if (newId) {
    try {
      const res = await api.get("/laundry/transactions/stats", { params: { account_id: newId } });
      accountStats.value = res.data;
    } catch (e) {
      console.error("Failed fetching stats", e);
    }
  }
});

async function fetchAccounts() {
  try {
    const res = await api.get("/laundry/accounts", { params: { per_page: 5000 } });
    const acctsData = res.data?.data || res.data || [];
    accounts.value = acctsData.map(a => ({
      ...a,
      owner_type: a.student ? "Siswa" : (a.user ? "Guru" : "Lainnya")
    }));
  } catch (e) {
    console.error("Failed fetching accounts", e);
  }
}

function resetForm() {
  form.value = {
    laundry_account_id: "",
    berat_kg: "",
    catatan: "",
  };
  searchQuery.value = "";
  showAccountDropdown.value = false;
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      if (!accounts.value.length) fetchAccounts();
      resetForm();
    }
  }
);

function closeModal() {
  emit("update:modelValue", false);
}

async function saveTransaction() {
  if (!form.value.laundry_account_id || !form.value.berat_kg) return;

  loading.value = true;
  try {
    const payload = {
      laundry_account_id: form.value.laundry_account_id,
      berat_kg: parseFloat(form.value.berat_kg),
      catatan: form.value.catatan,
      tanggal: new Date().toISOString().split('T')[0], // Defaults to today
      harga_per_kg: 5000 // Can be fetched from settings later, hardcode for now based on Laravel
    };
    await api.post("/laundry/transactions", payload);
    toast.success("Transaksi berhasil ditambahkan");
    emit("saved");
    closeModal();
  } catch (err) {
    console.error(err);
    if (err.response?.data?.error) {
      toast.error(err.response.data.message || "Gagal menyimpan transaksi");
    } else {
      toast.error("Terjadi kesalahan server");
    }
  } finally {
    loading.value = false;
  }
}
</script>
