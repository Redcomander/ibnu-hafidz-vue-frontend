<template>
  <aside v-if="lastRequestId" role="alert" class="fixed top-3 right-3 left-3 sm:left-auto z-[70] max-w-full sm:max-w-md rounded-xl border border-red-200 bg-white p-4 shadow-lg text-sm text-gray-800">
    <button class="float-right ml-3 text-gray-500" aria-label="Tutup laporan error" @click="lastRequestId = ''">Tutup</button>
    <p class="font-semibold">Terjadi gangguan server.</p>
    <p class="mt-1 break-all">ID laporan: <span class="font-mono select-text">{{ lastRequestId }}</span></p>
  </aside>
  <router-view v-slot="{ Component }">
    <transition name="page">
      <component :is="Component" />
    </transition>
  </router-view>

  <!-- Toast Notifications -->
  <Teleport to="body">
    <div
      v-if="toast.visible"
      :class="
        toast.type === 'success'
          ? 'toast-success'
          : toast.type === 'error'
            ? 'toast-error'
            : 'toast-info'
      "
    >
      <div class="flex items-center gap-3">
        <span class="text-lg">{{
          toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"
        }}</span>
        <p class="text-sm font-medium">{{ toast.message }}</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from "@/stores/toast";
import { storeToRefs } from "pinia";
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMaintenanceStore } from '@/stores/maintenance';

const router = useRouter();
const lastRequestId = ref('');
function showProductionError(event) { lastRequestId.value = event.detail.requestId; }
onMounted(() => globalThis.addEventListener('production-error', showProductionError));
onUnmounted(() => globalThis.removeEventListener('production-error', showProductionError));
const maintenance = useMaintenanceStore();
function showMaintenance(event) {
  maintenance.update({ ...event.detail, enabled: true });
  if (!['login', 'maintenance'].includes(router.currentRoute.value.name)) {
    router.replace({ name: 'maintenance', query: { redirect: router.currentRoute.value.fullPath } });
  }
}
onMounted(() => globalThis.addEventListener('maintenance-required', showMaintenance));
onUnmounted(() => globalThis.removeEventListener('maintenance-required', showMaintenance));

const toastStore = useToastStore();
const { toast } = storeToRefs(toastStore);
</script>
