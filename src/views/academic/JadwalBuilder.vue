<template>
  <div class="space-y-6 bg-slate-100 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Builder</p>
        <h1 class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Jadwal Builder</h1>
      </div>

      <div class="flex items-center gap-2 text-sm">
        <button
          type="button"
          @click="refreshSchedules"
          class="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>
    </div>

    <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_20px_45px_rgba(2,6,23,0.55)] dark:ring-slate-700/80">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in typeOptions"
            :key="option.value"
            type="button"
            @click="selectedType = option.value"
            :class="[
              'rounded-xl px-4 py-2 text-sm font-semibold transition',
              selectedType === option.value
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            ]"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">Hari</label>
            <select v-model="selectedDay" class="input-field w-full">
              <option v-for="day in dayNames" :key="day" :value="day">{{ day }}</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">Tanggal</label>
            <input :value="selectedDate" type="date" class="input-field w-full" disabled />
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">Preset Sesi</label>
            <select v-model="selectedSessionPreset" class="input-field w-full">
              <option value="4">4 sesi</option>
              <option value="2">2 sesi</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">Mode</label>
            <div class="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              {{ selectedType === 'formal' ? 'Formal' : selectedType === 'ramadhan' ? 'Ramadhan' : 'Diniyyah' }}
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40">
          <div class="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Total slot</div>
          <div class="mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-100">{{ totalScheduleCount }}</div>
        </div>
        <div class="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 shadow-sm dark:border-amber-800 dark:bg-amber-950/40">
          <div class="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Kosong</div>
          <div class="mt-1 text-lg font-bold text-amber-900 dark:text-amber-100">{{ emptySlotCount }}</div>
        </div>
        <div class="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 shadow-sm dark:border-red-800 dark:bg-red-950/40">
          <div class="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-700 dark:text-red-300">Bentrok</div>
          <div class="mt-1 text-lg font-bold text-red-900 dark:text-red-100">{{ conflictCount }}</div>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_20px_50px_rgba(2,6,23,0.5)] dark:ring-slate-700/80">
      <div class="overflow-x-auto">
        <table class="min-w-[900px] border-collapse text-left">
          <thead class="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <tr>
              <th class="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-100 px-3 py-3 text-xs font-semibold uppercase tracking-[0.15em] dark:border-slate-700 dark:bg-slate-800">
                Jam
              </th>
              <th
                v-for="kelas in classList"
                :key="kelas.id"
                class="border-b border-r border-slate-200 px-3 py-3 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                {{ formatKelasLabel(kelas) }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="slot in timeSlots" :key="slot" v-if="shouldRenderTimeRow(slot)" class="align-top">
              <th class="sticky left-0 z-10 border-r border-b border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {{ getSessionRowLabel(slot) }}
              </th>

              <template v-for="kelas in classList" :key="`${kelas.id}-${slot}`">
                <td
                  v-if="shouldRenderCell(kelas.id, slot)"
                  :rowspan="getCellRowspan(kelas.id, slot)"
                  class="border-b border-r border-slate-200 p-2 align-middle dark:border-slate-700"
                >
                  <button
                    type="button"
                    @click="openEditor(kelas.id, slot)"
                    class="flex h-full min-h-[84px] w-full items-center justify-center rounded-2xl border p-2 text-center transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-600 dark:hover:bg-slate-800/80"
                    :class="getCellClasses(kelas.id, slot)"
                  >
                    <div class="flex w-full flex-col items-center justify-center text-center">
                      <template v-if="getCellEntry(kelas.id, slot)">
                        <span
                          class="text-[10px] font-semibold uppercase tracking-[0.2em]"
                          :class="isCellConflict(kelas.id, slot) ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'"
                        >
                          {{ isCellConflict(kelas.id, slot) ? 'Bentrok' : getCellModeBadge(getCellEntry(kelas.id, slot)) }}
                        </span>
                        <span class="mt-2 text-sm font-bold leading-snug text-slate-800 dark:text-slate-100">{{ getCellShortLabel(getCellEntry(kelas.id, slot)) }}</span>
                        <span class="mt-1 text-[11px] text-slate-500 dark:text-slate-300">{{ getCellTeacherName(getCellEntry(kelas.id, slot)) }}</span>
                      </template>
                      <template v-else>
                        <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Kosong</span>
                        <span class="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-300">Assign jadwal</span>
                        <span class="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Klik untuk pilih guru & mapel</span>
                      </template>
                    </div>
                  </button>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="!classList.length" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
      Memuat daftar kelas...
    </div>

    <Modal :show="editorOpen" title="Assign Jadwal" max-width="lg" @close="editorOpen = false">
      <div v-if="editor.classId" class="space-y-5">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Slot</div>
          <div class="mt-1 text-base font-bold text-slate-800">
            {{ formatKelasLabel(getKelasById(editor.classId)) }} · {{ editor.startTime }} - {{ editor.endTime }}
          </div>
        </div>

        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Mapel & Guru</label>
          <SearchableSelect
            v-model="editor.assignmentId"
            :options="assignmentOptions"
            :placeholder="assignmentOptions.length ? 'Pilih mapel dan guru...' : 'Belum ada assignment untuk kelas ini'"
            :disabled="!assignmentOptions.length"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Session</label>
          <select v-model="editor.sessionKey" class="input-field w-full">
            <option v-for="session in sessionOptions" :key="session.value" :value="session.value">
              {{ session.label }}
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            v-if="editor.scheduleId"
            type="button"
            @click="deleteCurrentSchedule"
            class="btn-delete"
          >
            Hapus Slot
          </button>
          <button type="button" @click="editorOpen = false" class="btn-secondary">
            Batal
          </button>
          <button type="button" @click="saveEditor" :disabled="!editor.assignmentId || saving" class="btn-primary">
            {{ saving ? 'Menyimpan...' : editor.scheduleId ? 'Update Jadwal' : 'Simpan Jadwal' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import api from '@/api'
import { useScheduleStore } from '@/stores/schedule'
import { useLessonTeacherStore } from '@/stores/lessonTeacher'
import { useToastStore } from '@/stores/toast'
import Modal from '@/components/ui/Modal.vue'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'

const scheduleStore = useScheduleStore()
const lessonTeacherStore = useLessonTeacherStore()
const toast = useToastStore()

const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad']
const typeOptions = [
  { label: 'Formal', value: 'formal' },
  { label: 'Ramadhan', value: 'ramadhan' },
  { label: 'Diniyyah', value: 'diniyyah' },
]
const sessionPatterns = {
  '4': [
    { start_time: '08:00', end_time: '08:45' },
    { start_time: '08:45', end_time: '09:30' },
    { start_time: '10:00', end_time: '10:45' },
    { start_time: '10:45', end_time: '11:30' },
  ],
  '2': [
    { start_time: '08:00', end_time: '09:30' },
    { start_time: '10:00', end_time: '11:30' },
  ],
}
const selectedSessionPreset = ref('4')
const timeSlots = computed(() => sessionPatterns[selectedSessionPreset.value].map((entry) => entry.start_time))

const sessionOptions = computed(() => {
  const pattern = sessionPatterns[selectedSessionPreset.value] || []
  const options = []

  if (selectedSessionPreset.value === '4') {
    options.push({
      value: '08:00-09:30',
      label: 'Sesi 1-2 • 08:00 - 09:30',
      startTime: '08:00',
      endTime: '09:30',
    })
    options.push({
      value: '10:00-11:30',
      label: 'Sesi 3-4 • 10:00 - 11:30',
      startTime: '10:00',
      endTime: '11:30',
    })
  }

  pattern.forEach((entry, index) => {
    options.push({
      value: `${entry.start_time}-${entry.end_time}`,
      label: getSessionOptionLabel(index, entry.start_time, entry.end_time),
      startTime: entry.start_time,
      endTime: entry.end_time,
    })
  })

  return options
})

const classList = ref([])
const assignmentsByClass = ref({})
const selectedType = ref('formal')
const selectedDay = ref(getCurrentDayName())
const selectedDate = ref(getDateForDayName(getCurrentDayName()))
const editorOpen = ref(false)
const saving = ref(false)
const editor = ref({
  classId: null,
  assignmentId: null,
  scheduleId: null,
  sessionKey: '',
  startTime: '07:00',
  endTime: '08:00',
})

watch(selectedDay, () => {
  selectedDate.value = getDateForDayName(selectedDay.value)
  refreshSchedules()
})

watch(selectedSessionPreset, () => {
  const firstSession = sessionPatterns[selectedSessionPreset.value]?.[0]
  if (!firstSession) return

  if (editorOpen.value && editor.value.sessionKey) {
    const match = sessionOptions.value.find((option) => option.value === editor.value.sessionKey)
    if (!match) {
      editor.value.sessionKey = sessionOptions.value[0]?.value || ''
      editor.value.startTime = firstSession.start_time
      editor.value.endTime = firstSession.end_time
    } else {
      editor.value.startTime = match.startTime
      editor.value.endTime = match.endTime
    }
  }
})

watch(selectedType, async () => {
  await loadAssignmentsForAllClasses()
  await refreshSchedules()
})

const scheduleLookup = computed(() => {
  const map = new Map()
  for (const schedule of scheduleStore.schedules || []) {
    const classId = schedule.assignment?.kelas?.id || schedule.assignment?.kelas_id || null
    const startTime = schedule.start_time ? schedule.start_time.slice(0, 5) : ''
    if (!classId || !startTime) continue

    if (selectedSessionPreset.value === '4') {
      const activeSlots = sessionPatterns['4'].filter((slot) =>
        timeRangeOverlap(startTime, schedule.end_time ? schedule.end_time.slice(0, 5) : startTime, slot.start_time, slot.end_time)
      )

      for (const slot of activeSlots) {
        map.set(`${classId}-${slot.start_time}`, schedule)
      }

      if (!activeSlots.length) {
        map.set(`${classId}-${startTime}`, schedule)
      }

      continue
    }

    map.set(`${classId}-${startTime}`, schedule)
  }
  return map
})

const totalScheduleCount = computed(() => classList.value.length * (timeSlots.value?.length || 0))
const emptySlotCount = computed(() => {
  const occupiedCells = scheduleLookup.value.size
  return Math.max(0, totalScheduleCount.value - occupiedCells)
})

const conflictMap = computed(() => {
  const map = new Map()
  const entries = scheduleStore.schedules || []

  for (let i = 0; i < entries.length; i++) {
    const left = entries[i]
    const leftTeacher = left.assignment?.teacher?.id || left.assignment?.user?.id || null
    const leftStart = left.start_time ? left.start_time.slice(0, 5) : null
    const leftEnd = left.end_time ? left.end_time.slice(0, 5) : null
    if (!leftTeacher || !leftStart || !leftEnd) continue

    for (let j = i + 1; j < entries.length; j++) {
      const right = entries[j]
      const rightTeacher = right.assignment?.teacher?.id || right.assignment?.user?.id || null
      const rightStart = right.start_time ? right.start_time.slice(0, 5) : null
      const rightEnd = right.end_time ? right.end_time.slice(0, 5) : null
      if (!rightTeacher || !rightStart || !rightEnd) continue
      if (String(leftTeacher) !== String(rightTeacher)) continue
      if (left.day !== right.day || left.day !== selectedDay.value) continue
      if (timeRangeOverlap(leftStart, leftEnd, rightStart, rightEnd)) {
        map.set(left.id, true)
        map.set(right.id, true)
      }
    }
  }

  return map
})

const conflictCount = computed(() => conflictMap.value.size)

const assignmentOptions = computed(() => {
  if (!editor.value.classId) return []
  return (assignmentsByClass.value[editor.value.classId] || []).map((assignment) => ({
    id: assignment.id,
    name: `${assignment.lesson?.name || assignment.diniyyah_lesson?.name || 'Mapel'} — ${assignment.teacher?.name || assignment.user?.name || 'Guru belum diatur'}`,
  }))
})

function getSessionEndTime(startTime) {
  const match = sessionPatterns[selectedSessionPreset.value].find((entry) => entry.start_time === startTime)
  return match ? match.end_time : startTime
}

function getSessionOptionLabel(index, startTime, endTime) {
  if (selectedSessionPreset.value === '4' && startTime === '08:00' && endTime === '08:45') return 'Sesi 1 • 08:00 - 08:45'
  if (selectedSessionPreset.value === '4' && startTime === '08:45' && endTime === '09:30') return 'Sesi 2 • 08:45 - 09:30'
  if (selectedSessionPreset.value === '4' && startTime === '10:00' && endTime === '10:45') return 'Sesi 3 • 10:00 - 10:45'
  if (selectedSessionPreset.value === '4' && startTime === '10:45' && endTime === '11:30') return 'Sesi 4 • 10:45 - 11:30'

  return `Sesi ${index + 1} • ${startTime} - ${endTime}`
}

function getSessionRowLabel(startTime) {
  if (selectedSessionPreset.value !== '4') {
    return `${startTime} - ${getSessionEndTime(startTime)}`
  }

  if (startTime === '08:00') {
    const hasMerged = classList.value.some((kelas) => isMergedSessionEntry(getCellEntry(kelas.id, '08:00')))
    if (hasMerged) return '08:00 - 09:30'
  }

  if (startTime === '10:00') {
    const hasMerged = classList.value.some((kelas) => isMergedSessionEntry(getCellEntry(kelas.id, '10:00')))
    if (hasMerged) return '10:00 - 11:30'
  }

  return `${startTime} - ${getSessionEndTime(startTime)}`
}

function shouldRenderTimeRow(slot) {
  if (selectedSessionPreset.value !== '4') return true
  const mergedEntryAtFirstSlot = classList.value.some((kelas) => isMergedSessionEntry(getCellEntry(kelas.id, '08:00')))
  const mergedEntryAtThirdSlot = classList.value.some((kelas) => isMergedSessionEntry(getCellEntry(kelas.id, '10:00')))

  if (slot === '08:45') return !mergedEntryAtFirstSlot
  if (slot === '10:45') return !mergedEntryAtThirdSlot
  return true
}

function getSessionOptionByKey(sessionKey) {
  return sessionOptions.value.find((session) => session.value === sessionKey) || sessionOptions.value[0] || null
}

function getAvailableEndTimes(startTime) {
  const match = sessionPatterns[selectedSessionPreset.value].find((entry) => entry.start_time === startTime)
  return match ? [match.end_time] : []
}

function getCurrentDayName() {
  return dayNames[(dayjs().day() + 6) % 7]
}

function getDateForDayName(dayName) {
  const targetIndex = dayNames.indexOf(dayName)
  if (targetIndex === -1) return dayjs().format('YYYY-MM-DD')

  const currentIndex = (dayjs().day() + 6) % 7
  const diff = (targetIndex - currentIndex + 7) % 7
  return dayjs().add(diff, 'day').format('YYYY-MM-DD')
}

function getKelasGradeOrder(kelas) {
  const raw = `${kelas?.nama || ''} ${kelas?.tingkat || ''}`.trim().toLowerCase()
  const gradeMap = {
    '7': 7,
    'vii': 7,
    '8': 8,
    'viii': 8,
    '9': 9,
    'ix': 9,
    '10': 10,
    'x': 10,
    '11': 11,
    'xi': 11,
    '12': 12,
    'xii': 12,
  }

  const match = raw.match(/(?:kelas\s*|kls\s*)?(\d+|vii|viii|ix|x|xi|xii)/i)
  if (!match) return Number.MAX_SAFE_INTEGER

  const key = match[1].toLowerCase()
  return gradeMap[key] ?? Number.MAX_SAFE_INTEGER
}

function sortKelasList(items = []) {
  return [...items].sort((a, b) => {
    const gradeA = getKelasGradeOrder(a)
    const gradeB = getKelasGradeOrder(b)

    if (gradeA !== gradeB) return gradeA - gradeB

    const sectionA = String(a?.tingkat || '').trim().toLowerCase()
    const sectionB = String(b?.tingkat || '').trim().toLowerCase()

    if (sectionA !== sectionB) return sectionA.localeCompare(sectionB, 'id', { numeric: true })

    return String(a?.nama || '').localeCompare(String(b?.nama || ''), 'id', { numeric: true })
  })
}

function formatKelasLabel(kelas) {
  if (!kelas) return ''
  return `${kelas.nama || ''} ${kelas.tingkat || ''}`.trim()
}

function getKelasById(classId) {
  return classList.value.find((kelas) => String(kelas.id) === String(classId)) || null
}

function getCellEntry(classId, startTime) {
  return scheduleLookup.value.get(`${classId}-${startTime}`) || null
}

function getCellModeBadge(schedule) {
  const start = schedule.start_time ? schedule.start_time.slice(0, 5) : ''
  const end = schedule.end_time ? schedule.end_time.slice(0, 5) : ''
  if (start === '08:00' && end === '09:30') return 'Merge'
  if (start === '10:00' && end === '11:30') return 'Merge'
  return 'Ready'
}

function getCellShortLabel(schedule) {
  const lessonName = schedule.assignment?.lesson?.name || schedule.assignment?.diniyyah_lesson?.name || 'Mapel'
  const trimmedLessonName = lessonName.trim()

  if (isMergedSessionEntry(schedule)) {
    return trimmedLessonName.length > 18 ? `${trimmedLessonName.slice(0, 18)}...` : trimmedLessonName
  }

  const short = lessonName.split(' ').slice(0, 2).join(' ')
  if (selectedSessionPreset.value === '4') {
    const start = schedule.start_time ? schedule.start_time.slice(0, 5) : ''
    const end = schedule.end_time ? schedule.end_time.slice(0, 5) : ''
    if (start === '08:00' && end === '09:30') return 'Sesi 1-2'
    if (start === '10:00' && end === '11:30') return 'Sesi 3-4'
  }
  return short.length > 12 ? `${short.slice(0, 12)}...` : short
}

function getCellTeacherName(schedule) {
  return schedule.assignment?.teacher?.name || schedule.assignment?.user?.name || 'Guru belum diatur'
}

function isMergedSessionEntry(entry) {
  if (!entry) return false
  const start = entry.start_time ? entry.start_time.slice(0, 5) : ''
  const end = entry.end_time ? entry.end_time.slice(0, 5) : ''
  return (start === '08:00' && end === '09:30') || (start === '10:00' && end === '11:30')
}

function shouldRenderCell(classId, slot) {
  if (selectedSessionPreset.value !== '4') return true

  if (slot === '08:45') {
    const mergedEntry = getCellEntry(classId, '08:00')
    return !isMergedSessionEntry(mergedEntry)
  }

  if (slot === '10:45') {
    const mergedEntry = getCellEntry(classId, '10:00')
    return !isMergedSessionEntry(mergedEntry)
  }

  return true
}

function getCellRowspan(classId, slot) {
  if (selectedSessionPreset.value !== '4') return 1
  const entry = getCellEntry(classId, slot)
  if (isMergedSessionEntry(entry) && (slot === '08:00' || slot === '10:00')) return 2
  return 1
}

function getCellClasses(classId, startTime) {
  const entry = getCellEntry(classId, startTime)
  if (!entry) return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80'
  if (isCellConflict(classId, startTime)) return 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-950/40'
  const merged = isMergedSessionEntry(entry)
  return merged
    ? 'border-violet-300 bg-violet-50 shadow-md shadow-violet-100 dark:border-violet-700 dark:bg-violet-950/40 dark:shadow-violet-900/20'
    : 'border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40'
}

function isCellConflict(classId, startTime) {
  const entry = getCellEntry(classId, startTime)
  if (!entry) return false
  return !!conflictMap.value.get(entry.id)
}

function timeRangeOverlap(startA, endA, startB, endB) {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA)
}

function timeToMinutes(value) {
  if (!value || !value.includes(':')) return 0
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

function nextSlotTime(startTime) {
  const match = sessionPatterns[selectedSessionPreset.value].find((entry) => entry.start_time === startTime)
  return match ? match.end_time : startTime
}

async function fetchClasses() {
  try {
    const response = await api.get('/kelas', { params: { per_page: 200 } })
    const rawList = response.data?.data || response.data || []
    classList.value = sortKelasList(rawList)
  } catch (error) {
    console.error('Failed to fetch kelas:', error)
    classList.value = []
  }
}

async function fetchAssignmentsForClass(classId) {
  if (!classId) return

  try {
    await lessonTeacherStore.fetchAssignments(classId, selectedType.value)
    assignmentsByClass.value[classId] = [...(lessonTeacherStore.assignments || [])]
  } catch (error) {
    console.error('Failed to fetch assignments for class:', error)
    assignmentsByClass.value[classId] = []
  }
}

async function loadAssignmentsForAllClasses() {
  if (!classList.value.length) return
  await Promise.all(classList.value.map((kelas) => fetchAssignmentsForClass(kelas.id)))
}

async function refreshSchedules() {
  try {
    await scheduleStore.fetchSchedules({
      type: selectedType.value,
      day: selectedDay.value,
      date: selectedDate.value,
    })
  } catch (error) {
    toast.error('Gagal memuat jadwal builder')
  }
}

async function openEditor(classId, startTime) {
  const existingEntry = getCellEntry(classId, startTime)
  const assignmentList = assignmentsByClass.value[classId] || []

  if (!assignmentList.length) {
    await fetchAssignmentsForClass(classId)
  }

  const sessionMatch = sessionOptions.value.find((option) => option.startTime === (existingEntry?.start_time || startTime).slice(0, 5) && option.endTime === (existingEntry?.end_time || nextSlotTime(startTime)).slice(0, 5))

  editor.value = {
    classId,
    assignmentId: existingEntry?.assignment?.id || existingEntry?.lesson_teacher_id || null,
    scheduleId: existingEntry?.id || null,
    sessionKey: sessionMatch?.value || sessionOptions.value[0]?.value || '',
    startTime: existingEntry?.start_time ? existingEntry.start_time.slice(0, 5) : startTime,
    endTime: existingEntry?.end_time ? existingEntry.end_time.slice(0, 5) : nextSlotTime(startTime),
  }

  editorOpen.value = true
}

async function saveEditor() {
  if (!editor.value.classId || !editor.value.assignmentId) {
    toast.error('Pilih mapel dan guru terlebih dahulu')
    return
  }

  saving.value = true

  try {
    const selectedSession = getSessionOptionByKey(editor.value.sessionKey)
    const payload = {
      type: selectedType.value,
      assignment_id: Number(editor.value.assignmentId),
      day: selectedDay.value,
      start_time: selectedSession?.startTime || editor.value.startTime,
      end_time: selectedSession?.endTime || editor.value.endTime,
    }

    if (editor.value.scheduleId) {
      await scheduleStore.updateSchedule(editor.value.scheduleId, payload)
      toast.success('Jadwal berhasil diperbarui')
    } else {
      await scheduleStore.createSchedule(payload)
      toast.success('Jadwal berhasil disimpan')
    }

    editorOpen.value = false
    await refreshSchedules()
  } catch (error) {
    toast.error(error?.response?.data?.error || 'Gagal menyimpan jadwal')
  } finally {
    saving.value = false
  }
}

async function deleteCurrentSchedule() {
  if (!editor.value.scheduleId) return

  try {
    await scheduleStore.deleteSchedule(editor.value.scheduleId, selectedType.value)
    toast.success('Slot jadwal berhasil dihapus')
    editorOpen.value = false
    await refreshSchedules()
  } catch (error) {
    toast.error(error?.response?.data?.error || 'Gagal menghapus slot jadwal')
  }
}

onMounted(async () => {
  await fetchClasses()
  await loadAssignmentsForAllClasses()
  await refreshSchedules()
})
</script>

<style scoped>
.input-field {
  border: 1px solid rgb(203 213 225);
  border-radius: 0.75rem;
  background: #fff;
  padding: 0.7rem 0.85rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.dark .input-field {
  background: rgb(15 23 42);
  border-color: rgb(51 65 85);
  color: rgb(226 232 240);
}

.input-field:focus {
  border-color: rgb(16 185 129);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  padding: 0.7rem 1.1rem;
  font-weight: 600;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-primary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: 1px solid rgb(203 213 225);
  background: white;
  color: rgb(51 65 85);
  padding: 0.7rem 1.1rem;
  font-weight: 600;
}

.dark .btn-secondary {
  background: rgb(15 23 42);
  border-color: rgb(51 65 85);
  color: rgb(226 232 240);
}

.btn-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: 1px solid rgb(254 202 202);
  background: rgb(254 242 242);
  color: rgb(153 27 27);
  padding: 0.7rem 1.1rem;
  font-weight: 600;
}

.dark .btn-delete {
  background: rgba(127, 29, 29, 0.2);
  border-color: rgba(248, 113, 113, 0.55);
  color: rgb(254, 202, 202);
}
</style>

