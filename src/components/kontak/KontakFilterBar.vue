<template>
  <div class="glass-card p-3 md:p-4 space-y-3">
    <div class="flex flex-col lg:flex-row gap-2">
      <input
        :value="search"
        @input="$emit('update:search', $event.target.value)"
        type="text"
        placeholder="Cari nama, NIS, no WhatsApp, alamat..."
        class="input-field !py-2.5 w-full text-sm"
      />
      <button
        type="button"
        class="px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 lg:whitespace-nowrap"
        @click="$emit('reset')"
      >
        Reset Filter
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <select
        :value="status"
        @change="$emit('update:status', $event.target.value)"
        class="input-field !py-2.5 text-sm"
      >
        <option value="">Semua Status</option>
        <option value="baru">Baru</option>
        <option value="follow_up">Follow Up</option>
        <option value="prospek">Prospek</option>
        <option value="deal">Deal</option>
        <option value="tidak_aktif">Tidak Aktif</option>
      </select>

      <select
        :value="handlerId"
        @change="$emit('update:handlerId', $event.target.value)"
        class="input-field !py-2.5 text-sm"
      >
        <option value="">Semua Handler</option>
        <option v-for="user in handlers" :key="user.id" :value="String(user.id)">
          {{ user.name }}
        </option>
      </select>

      <SearchableSelect
        :model-value="sumberData"
        :options="sumberOptions"
        label-key="label"
        value-key="value"
        placeholder="Semua Sumber"
        @update:modelValue="$emit('update:sumberData', $event || '')"
      />
    </div>
  </div>
</template>

<script setup>
import SearchableSelect from '@/components/ui/SearchableSelect.vue'

defineProps({
  search: { type: String, default: '' },
  status: { type: String, default: '' },
  handlerId: { type: String, default: '' },
  sumberData: { type: String, default: '' },
  handlers: { type: Array, default: () => [] },
  sumberOptions: { type: Array, default: () => [] },
})

defineEmits(['update:search', 'update:status', 'update:handlerId', 'update:sumberData', 'reset'])
</script>
