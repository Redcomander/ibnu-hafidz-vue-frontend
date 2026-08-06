<template>
  <span :class="badgeClass">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: '',
  },
})

const normalized = computed(() => String(props.status || '').toLowerCase().trim())

const label = computed(() => {
  if (!normalized.value) return 'Belum Diatur'
  if (normalized.value === 'baru') return 'Baru'
  if (normalized.value === 'follow_up') return 'Follow Up'
  if (normalized.value === 'prospek') return 'Prospek'
  if (normalized.value === 'deal') return 'Deal'
  if (normalized.value === 'tidak_aktif') return 'Tidak Aktif'
  return props.status
})

const badgeClass = computed(() => {
  if (normalized.value === 'baru') return 'px-2 py-1 text-xs rounded-full bg-sky-100 text-sky-700 font-medium'
  if (normalized.value === 'follow_up') return 'px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 font-medium'
  if (normalized.value === 'prospek') return 'px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium'
  if (normalized.value === 'deal') return 'px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium'
  if (normalized.value === 'tidak_aktif') return 'px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-700 font-medium'
  return 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 font-medium'
})
</script>
