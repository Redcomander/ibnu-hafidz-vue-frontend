<template>
  <div ref="container" class="relative">
    <button
      type="button"
      @click="toggle"
      class="input-field flex w-full items-center justify-between gap-2 text-left cursor-pointer select-none min-h-[52px]"
      :class="[
        disabled ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500' : '',
        isOpen ? 'ring-2 ring-green-100 border-green-500 dark:ring-emerald-900/40 dark:border-emerald-500' : 'border-gray-200 dark:border-slate-700'
      ]"
      :disabled="disabled"
    >
      <span v-if="selectedOption" class="text-gray-800 dark:text-slate-100 text-sm leading-tight break-words line-clamp-2">
        {{ getPrimaryLabel(selectedOption) }}
      </span>
      <span v-else class="text-gray-400 dark:text-slate-400 text-sm leading-tight break-words line-clamp-2">{{ placeholder }}</span>
      <SvgIcon
        name="chevron-down"
        :size="16"
        class="text-gray-400 dark:text-slate-400 transition-transform duration-200 shrink-0"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Teleport to="body">
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          ref="dropdownRef"
          :style="dropdownStyle"
          class="fixed z-[9999] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden"
          @click.stop
        >
          <div class="p-2.5 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              class="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-lg border-2 border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-green-100 dark:focus:ring-emerald-900/40 focus:border-green-500 dark:focus:border-emerald-500 transition placeholder-gray-400 dark:placeholder-slate-400 outline-none"
              placeholder="Cari..."
              @click.stop
            />
          </div>

          <div class="overflow-y-auto flex-1 custom-scrollbar" :style="listStyle">
            <button
              v-for="option in filteredOptions"
              :key="getValue(option)"
              type="button"
              @click="select(option)"
              class="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-slate-800/80 flex items-start justify-between gap-3 group transition-colors border-b border-gray-100 dark:border-slate-800 last:border-b-0"
              :class="{ 'bg-green-50 dark:bg-emerald-900/25': isSameValue(getValue(option), modelValue) }"
            >
              <div class="min-w-0">
                <div class="text-sm font-semibold text-gray-900 dark:text-slate-100 break-words leading-snug">
                  {{ getPrimaryLabel(option) }}
                </div>
                <div v-if="getSecondaryLabel(option)" class="text-xs text-gray-500 dark:text-slate-400 break-words mt-0.5">
                  {{ getSecondaryLabel(option) }}
                </div>
              </div>
              <SvgIcon
                v-if="isSameValue(getValue(option), modelValue)"
                name="check"
                :size="16"
                class="text-green-600 dark:text-emerald-400 shrink-0 mt-0.5"
              />
            </button>

            <div v-if="filteredOptions.length === 0" class="p-4 text-center text-xs text-gray-400 dark:text-slate-500">
              Tidak ada data ditemukan
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import SvgIcon from '@/components/ui/SvgIcon.vue'

const props = defineProps({
  modelValue: [String, Number, null],
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Pilih...',
  },
  labelKey: {
    type: String,
    default: 'name',
  },
  valueKey: {
    type: String,
    default: 'id',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  searchDebounce: {
    type: Number,
    default: 250,
  },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const container = ref(null)
const dropdownRef = ref(null)
const searchInput = ref(null)
const dropdownStyle = ref({})
const listStyle = ref({ maxHeight: '240px' })
let searchDebounceTimer = null

function getLabel(opt) {
  if (!opt) return ''
  return opt[props.labelKey] || ''
}

function getPrimaryLabel(opt) {
  if (!opt) return ''
  const nomor = String(opt.nomor_laundry || '').trim()
  const owner = String(opt.owner_name || opt.nama || '').trim()
  if (nomor && owner) return `${nomor} - ${owner}`
  if (nomor) return nomor
  return getLabel(opt)
}

function getSecondaryLabel(opt) {
  if (!opt) return ''
  const vendor = String(opt.vendor?.name || opt.vendor || '').trim()
  const tipe = String(opt.owner_type || opt.type || '').trim()
  if (vendor && tipe) return `${vendor} • ${tipe}`
  if (vendor) return vendor
  if (tipe) return tipe
  return ''
}

function getValue(opt) {
  if (!opt) return null
  return opt[props.valueKey]
}

function isSameValue(optionValue, modelValue) {
  return String(optionValue ?? '') === String(modelValue ?? '')
}

const selectedOption = computed(() => props.options.find((opt) => isSameValue(getValue(opt), props.modelValue)))

const filteredOptions = computed(() => {
  if (!debouncedSearchQuery.value) return props.options
  const query = debouncedSearchQuery.value.toLowerCase()
  return props.options.filter((opt) => {
    const allText = [
      getLabel(opt),
      getPrimaryLabel(opt),
      getSecondaryLabel(opt),
      opt?.nomor_laundry,
      opt?.owner_name,
      opt?.nama,
      opt?.vendor?.name,
      opt?.vendor,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return allText.includes(query)
  })
})

function updatePosition() {
  if (!container.value) return

  const rect = container.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const spaceBelow = viewportHeight - rect.bottom - 12
  const spaceAbove = rect.top - 12
  const openUpward = spaceBelow < 260 && spaceAbove > spaceBelow
  const maxHeight = Math.max(160, Math.min(260, openUpward ? spaceAbove - 8 : spaceBelow - 8))

  dropdownStyle.value = {
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    ...(openUpward
      ? { bottom: `${viewportHeight - rect.top + 4}px` }
      : { top: `${rect.bottom + 4}px` }),
  }

  listStyle.value = {
    maxHeight: `${maxHeight}px`,
  }
}

function open() {
  if (props.disabled) return
  isOpen.value = true
  searchQuery.value = ''
  debouncedSearchQuery.value = ''
  updatePosition()
  nextTick(() => searchInput.value?.focus())
}

function close() {
  isOpen.value = false
}

function toggle() {
  if (isOpen.value) {
    close()
    return
  }
  open()
}

function select(option) {
  emit('update:modelValue', getValue(option))
  close()
}

function handleWindowClick(event) {
  if (!isOpen.value) return
  const clickedTrigger = container.value?.contains(event.target)
  const clickedDropdown = dropdownRef.value?.contains(event.target)
  if (!clickedTrigger && !clickedDropdown) {
    close()
  }
}

function handleViewportChange() {
  if (!isOpen.value) return
  updatePosition()
}

watch(() => props.disabled, (disabled) => {
  if (disabled) close()
})

watch(searchQuery, (value) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = setTimeout(() => {
    debouncedSearchQuery.value = value
  }, props.searchDebounce)
})

watch(() => props.options, () => {
  if (isOpen.value) {
    nextTick(updatePosition)
  }
})

onMounted(() => {
  window.addEventListener('click', handleWindowClick)
  window.addEventListener('resize', handleViewportChange)
  window.addEventListener('scroll', handleViewportChange, true)
})

onUnmounted(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  window.removeEventListener('click', handleWindowClick)
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', handleViewportChange, true)
})
</script>
