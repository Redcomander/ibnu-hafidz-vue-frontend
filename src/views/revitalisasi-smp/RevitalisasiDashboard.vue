<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-primary font-bold">Revitalisasi SMP</p>
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-slate-100">Ringkasan Proyek</h1>
      </div>
      <button
        type="button"
        class="btn-primary w-full md:w-auto"
        @click="$router.push('/dashboard/revitalisasi-smp/tukang')"
      >
        Kelola Tukang
      </button>
    </div>

    <div v-if="loading" class="glass-card p-6 rounded-2xl text-sm text-gray-500">Memuat ringkasan proyek...</div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div v-for="metric in metrics" :key="metric.label" class="glass-card p-4 rounded-2xl border border-gray-200/70 bg-gradient-to-br from-white to-slate-50 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">{{ metric.label }}</p>
            <span class="p-2 rounded-xl text-primary bg-primary/5 ring-1 ring-primary/10 dark:bg-primary/10 dark:ring-primary/20">
              <SvgIcon :name="metric.icon" :size="18" />
            </span>
          </div>
          <p class="text-2xl font-extrabold text-gray-900 dark:text-slate-100">{{ metric.value }}</p>
          <div class="mt-3 flex items-center justify-between text-[11px]">
            <span class="text-gray-500 dark:text-slate-400">{{ metric.caption }}</span>
            <span class="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">{{ metric.trend || 'Live' }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[1.45fr_0.95fr] gap-5">
        <div class="space-y-5">
          <div class="glass-card p-5 rounded-2xl dark:border-slate-700 dark:bg-slate-900/80">
            <div class="flex items-center justify-between mb-3">
              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-slate-400">Project pulse</p>
                <h2 class="text-lg font-bold text-gray-900 dark:text-slate-100">Ringkasan operasional</h2>
              </div>
              <span class="rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary dark:bg-primary/10 dark:text-primary-200">{{ summaryStatus }}</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div v-for="card in summaryCards" :key="card.label" class="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/80">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">{{ card.label }}</span>
                  <span class="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-slate-700 dark:text-slate-200">{{ card.badge }}</span>
                </div>
                <p class="mt-3 text-xl font-extrabold text-gray-900 dark:text-slate-100">{{ card.value }}</p>
                <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">{{ card.caption }}</p>
              </div>
            </div>
          </div>

          <div class="glass-card p-5 rounded-2xl dark:border-slate-700 dark:bg-slate-900/80">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-gray-900 dark:text-slate-100">Aktivitas Terbaru</h2>
              <span class="text-xs text-gray-500 dark:text-slate-400">{{ activities.length }} item</span>
            </div>
            <div class="space-y-3">
              <div v-for="item in activities" :key="item.id" class="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
                <div class="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary dark:bg-primary/10">
                  <SvgIcon :name="item.icon" :size="16" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-800 dark:text-slate-100">{{ item.title }}</p>
                  <p class="text-xs text-gray-500 mt-1 dark:text-slate-400">{{ item.detail }}</p>
                </div>
                <span class="text-[11px] text-gray-400 whitespace-nowrap dark:text-slate-500">{{ item.date }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-5">
          <div class="glass-card p-5 rounded-2xl dark:border-slate-700 dark:bg-slate-900/80">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-slate-400">Immediate follow-up</p>
                <h2 class="text-lg font-bold text-gray-900 dark:text-slate-100">Prioritas</h2>
              </div>
              <button type="button" class="btn-secondary !py-2 !px-3 !text-[11px]" @click="openPriorityModal">Kelola</button>
            </div>
            <div v-if="priorityItems.length" class="space-y-3">
              <div v-for="item in priorityItems" :key="item.id" class="rounded-xl border border-gray-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/80">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-semibold text-gray-800 dark:text-slate-100">{{ item.judul }}</span>
                  <span class="text-[10px] font-semibold px-2 py-1 rounded-full" :class="priorityTone(item.tingkat)">{{ priorityBadge(item.tingkat) }}</span>
                </div>
                <p class="mt-2 text-xs text-gray-600 dark:text-slate-300">{{ item.deskripsi || 'Belum ada keterangan tambahan.' }}</p>
              </div>
            </div>
            <div v-else class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
              Belum ada prioritas yang disimpan.
            </div>
          </div>

          <div class="glass-card p-5 rounded-2xl dark:border-slate-700 dark:bg-slate-900/80">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-gray-900 dark:text-slate-100">Progress Pembangunan</h2>
              <span class="text-xs text-gray-500 dark:text-slate-400">Area utama</span>
            </div>
            <div v-if="progressAreas.length" class="space-y-4">
              <div v-for="area in progressAreas" :key="area.name" class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-gray-700 dark:text-slate-200">{{ area.name }}</span>
                  <span class="font-bold text-primary dark:text-emerald-300">{{ area.progress }}%</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-slate-700">
                  <div class="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500" :style="{ width: area.progress + '%' }"></div>
                </div>
              </div>
            </div>
            <div v-else class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
              Belum ada data progress pembangunan.
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-if="showPriorityModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Prioritas proyek</p>
            <h2 class="text-xl font-extrabold text-gray-900 dark:text-slate-100">Kelola Prioritas</h2>
          </div>
          <button type="button" class="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-slate-800" @click="showPriorityModal = false">✕</button>
        </div>

        <div class="space-y-3">
          <div v-if="priorityItems.length">
            <div v-for="item in priorityItems" :key="item.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/80">
              <div class="flex items-start gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <input v-model="item.judul" class="input-field !py-2 !text-sm" />
                    <select v-model="item.tingkat" class="input-field !py-2 !text-sm w-28">
                      <option value="high">Tinggi</option>
                      <option value="medium">Sedang</option>
                      <option value="low">Rendah</option>
                    </select>
                  </div>
                  <textarea v-model="item.deskripsi" rows="2" class="input-field mt-2 !py-2 !text-sm" placeholder="Keterangan prioritas..." />
                </div>
                <button type="button" class="btn-danger !py-2 !px-3 !text-xs" @click="deletePriority(item.id)">Hapus</button>
              </div>
            </div>
          </div>
          <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/60">
            <p class="text-sm font-semibold text-gray-700 dark:text-slate-200">Belum ada prioritas</p>
            <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">Tambahkan prioritas baru di form di bawah ini.</p>
          </div>

          <div class="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <div class="grid grid-cols-1 md:grid-cols-[1.2fr_0.6fr] gap-3">
              <input v-model="newPriority.judul" type="text" class="input-field" placeholder="Judul prioritas baru" />
              <select v-model="newPriority.tingkat" class="input-field">
                <option value="high">Tinggi</option>
                <option value="medium">Sedang</option>
                <option value="low">Rendah</option>
              </select>
            </div>
            <textarea v-model="newPriority.deskripsi" rows="2" class="input-field mt-3" placeholder="Deskripsi singkat" />
            <div class="mt-3 flex justify-end gap-2">
              <button type="button" class="btn-secondary !py-2 !px-4 !text-sm" @click="showPriorityModal = false">Tutup</button>
              <button type="button" class="btn-primary !py-2 !px-4 !text-sm" @click="savePriorityChanges">Simpan perubahan</button>
              <button type="button" class="btn-primary !py-2 !px-4 !text-sm" @click="addPriority">Tambah prioritas</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import SvgIcon from '@/components/ui/SvgIcon.vue'
import {
  createRevitalisasiSmpPrioritas,
  deleteRevitalisasiSmpPrioritas,
  fetchRevitalisasiSmpAbsen,
  fetchRevitalisasiSmpMaterialDatang,
  fetchRevitalisasiSmpNotaMasuk,
  fetchRevitalisasiSmpNotaMaterial,
  fetchRevitalisasiSmpPrioritas,
  fetchRevitalisasiSmpProgres,
  fetchRevitalisasiSmpTukang,
  updateRevitalisasiSmpPrioritas,
} from '@/api/revitalisasiSmp'
import { confirmDelete } from '@/utils/confirmDialog'

const loading = ref(false)
const metrics = ref([
  { label: 'Tukang hadir', value: '0', icon: 'user-check', caption: 'Hari ini', trend: 'Live' },
  { label: 'Nota masuk', value: '0', icon: 'document-text', caption: 'Bulan ini', trend: 'Rp' },
  { label: 'Material datang', value: '0', icon: 'package', caption: 'Dalam 7 hari', trend: 'Aktif' },
  { label: 'Progress rata-rata', value: '0%', icon: 'trending-up', caption: 'Poin proyek', trend: 'Target' },
])

const summaryCards = ref([])
const priorityItems = ref([])
const summaryStatus = ref('Monitoring')
const activities = ref([])
const progressAreas = ref([])
const showPriorityModal = ref(false)
const newPriority = ref({ judul: '', deskripsi: '', tingkat: 'medium' })

function formatDisplayDate(value) {
  if (!value) return 'Baru'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function normalizeStatus(status) {
  const raw = String(status || '').toLowerCase()
  if (['hadir', 'datang', 'masuk'].includes(raw)) return 'hadir'
  if (['izin', 'surat izin', 'cuti'].includes(raw)) return 'izin'
  if (['sakit'].includes(raw)) return 'sakit'
  if (['alpha', 'alpa', 'tidak hadir'].includes(raw)) return 'alpha'
  return raw || 'alpha'
}

function priorityBadge(level) {
  const value = String(level || 'medium').toLowerCase()
  if (value === 'high') return 'Tinggi'
  if (value === 'low') return 'Rendah'
  return 'Sedang'
}

function priorityTone(level) {
  const value = String(level || 'medium').toLowerCase()
  if (value === 'high') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200'
  if (value === 'low') return 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200'
  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200'
}

function toDateOnly(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function relativeLabel(value) {
  if (!value) return 'Baru'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000)
  if (diffMinutes < 60) return `${Math.max(diffMinutes, 1)} menit lalu`
  if (diffMinutes < 1440) return `${Math.round(diffMinutes / 60)} jam lalu`
  return `${Math.round(diffMinutes / 1440)} hari lalu`
}

async function loadPrioritas() {
  try {
    const response = await fetchRevitalisasiSmpPrioritas()
    const list = Array.isArray(response?.data) ? response.data : []
    priorityItems.value = list.filter((item) => item.is_active !== false).sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
  } catch (error) {
    console.error(error)
    priorityItems.value = []
  }
}

async function addPriority() {
  const title = newPriority.value.judul?.trim()
  if (!title) {
    alert('Judul prioritas wajib diisi.')
    return
  }

  try {
    await createRevitalisasiSmpPrioritas({
      judul: title,
      deskripsi: newPriority.value.deskripsi?.trim() || '',
      tingkat: newPriority.value.tingkat || 'medium',
      urutan: priorityItems.value.length + 1,
      is_active: true,
    })
    newPriority.value = { judul: '', deskripsi: '', tingkat: 'medium' }
    await loadPrioritas()
  } catch (error) {
    console.error(error)
    alert('Gagal menambah prioritas.')
  }
}

async function savePriorityChanges() {
  const items = priorityItems.value.filter((item) => item && item.id && item.id !== 'auto-watch' && item.id !== 'auto-material')
  if (!items.length) {
    showPriorityModal.value = false
    return
  }

  try {
    for (const item of items) {
      const trimmedTitle = String(item.judul || '').trim()
      if (!trimmedTitle) {
        alert('Judul prioritas tidak boleh kosong.')
        return
      }
      await updateRevitalisasiSmpPrioritas(item.id, {
        judul: trimmedTitle,
        deskripsi: String(item.deskripsi || '').trim(),
        tingkat: item.tingkat || 'medium',
        urutan: item.urutan ?? 0,
        is_active: item.is_active !== false,
      })
    }
    showPriorityModal.value = false
    await loadPrioritas()
  } catch (error) {
    console.error(error)
    alert('Gagal menyimpan perubahan prioritas.')
  }
}

async function deletePriority(id) {
  if (!id) return

  const confirmed = await confirmDelete({
    title: 'Hapus prioritas?',
    message: 'Prioritas yang dihapus tidak bisa dikembalikan. Lanjutkan?',
    confirmText: 'Hapus',
  })

  if (!confirmed) return

  if (String(id).startsWith('auto-')) {
    priorityItems.value = priorityItems.value.filter((item) => String(item.id) !== String(id))
    return
  }

  try {
    await deleteRevitalisasiSmpPrioritas(id)
    await loadPrioritas()
  } catch (error) {
    console.error(error)
    alert('Gagal menghapus prioritas.')
  }
}

function openPriorityModal() {
  showPriorityModal.value = true
}

async function loadDashboard() {
  loading.value = true
  try {
    const [tukangRes, absenRes, notaRes, notaMasukRes, materialRes, progresRes] = await Promise.all([
      fetchRevitalisasiSmpTukang(),
      fetchRevitalisasiSmpAbsen(),
      fetchRevitalisasiSmpNotaMaterial(),
      fetchRevitalisasiSmpNotaMasuk(),
      fetchRevitalisasiSmpMaterialDatang(),
      fetchRevitalisasiSmpProgres(),
    ])

    const tukangList = Array.isArray(tukangRes?.data) ? tukangRes.data : []
    const absensi = Array.isArray(absenRes?.data) ? absenRes.data : []
    const notes = Array.isArray(notaRes?.data) ? notaRes.data : []
    const cashInNotes = Array.isArray(notaMasukRes?.data) ? notaMasukRes.data : []
    const materials = Array.isArray(materialRes?.data) ? materialRes.data : []
    const progressList = Array.isArray(progresRes?.data) ? progresRes.data : []

    const today = new Date()
    const todayStr = toDateOnly(today)
    const todayPresence = absensi.filter((item) => toDateOnly(item.tanggal || item.date) === todayStr)
    const hadirToday = todayPresence.filter((item) => normalizeStatus(item.status) === 'hadir').length

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const notaThisMonth = cashInNotes.filter((item) => {
      const d = new Date(item.tanggal)
      return !Number.isNaN(d.getTime()) && d >= monthStart
    }).length

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const materialRecent = materials.filter((item) => {
      const d = new Date(item.tanggal)
      return !Number.isNaN(d.getTime()) && d >= sevenDaysAgo
    }).length

    const avgProgress = progressList.length
      ? Math.round(progressList.reduce((sum, item) => sum + Number(item.persentase || 0), 0) / progressList.length)
      : 0

    const totalCashIn = cashInNotes.reduce((sum, item) => sum + Number(item.jumlah || 0), 0)
    const totalMaterialExpense = materials.reduce((sum, item) => sum + Number(item.total_pengeluaran || 0), 0)
    const totalWorkers = tukangList.length
    const lowProgressAreas = progressList.filter((item) => Number(item.persentase || 0) < 40).length

    metrics.value = [
      { label: 'Tukang hadir', value: String(hadirToday), icon: 'user-check', caption: `${totalWorkers} terdaftar`, trend: totalWorkers ? 'Aktif' : 'Kosong' },
      { label: 'Nota masuk', value: `Rp ${totalCashIn.toLocaleString('id-ID')}`, icon: 'document-text', caption: `${notaThisMonth} catatan bulan ini`, trend: 'Rp' },
      { label: 'Material datang', value: String(materialRecent), icon: 'package', caption: `${materials.length} total tercatat`, trend: 'Aktif' },
      { label: 'Progress rata-rata', value: `${avgProgress}%`, icon: 'trending-up', caption: `${progressList.length} update area`, trend: lowProgressAreas ? `${lowProgressAreas} area menunggu` : 'Stabil' },
    ]

    summaryCards.value = [
      { label: 'Kehadiran', value: `${hadirToday}/${Math.max(totalWorkers, 1)}`, badge: 'Hari ini', caption: totalWorkers ? 'Tukang aktif hari ini' : 'Belum ada data tukang', },
      { label: 'Cash flow', value: `Rp ${totalCashIn.toLocaleString('id-ID')}`, badge: 'Masuk', caption: 'Total uang masuk proyek', },
      { label: 'Pengeluaran', value: `Rp ${totalMaterialExpense.toLocaleString('id-ID')}`, badge: 'Material', caption: 'Biaya material tercatat', },
    ]

    summaryStatus.value = avgProgress >= 70 ? 'On track' : avgProgress >= 45 ? 'Cautious' : 'Needs attention'

    const timeline = [
      ...absensi.map((item) => ({
        id: `absen-${item.id}`,
        title: `Absen ${item.tukang?.name || 'Tukang'}`,
        detail: `${item.tukang?.name || 'Tukang'} • ${normalizeStatus(item.status)}`,
        date: item.tanggal || item.date,
        icon: 'user-check',
      })),
      ...cashInNotes.map((item) => ({
        id: `nota-masuk-${item.id}`,
        title: `Nota masuk: ${item.nomor_nota || 'Baru'}`,
        detail: `${item.sumber || 'Sumber'} • ${Number(item.jumlah || 0).toLocaleString('id-ID')}`,
        date: item.tanggal,
        icon: 'document-text',
      })),
      ...notes.map((item) => ({
        id: `nota-material-${item.id}`,
        title: `Nota material: ${item.nomor_nota || 'Baru'}`,
        detail: `${item.supplier || 'Supplier'} • Rp ${Number(item.total_nilai || 0).toLocaleString('id-ID')}`,
        date: item.tanggal,
        icon: 'document-text',
      })),
      ...materials.map((item) => ({
        id: `material-${item.id}`,
        title: `Material datang: ${item.nama_material || 'Material'}`,
        detail: `${item.supplier || 'Supplier'} • ${Number(item.jumlah || 0).toLocaleString('id-ID')} ${item.satuan || ''}`,
        date: item.tanggal,
        icon: 'package',
      })),
      ...progressList.map((item) => ({
        id: `progres-${item.id}`,
        title: `Progres ${item.nama_area || 'Area'}`,
        detail: `${item.persentase || 0}% • ${item.catatan || 'Update progres'}`,
        date: item.tanggal,
        icon: 'trending-up',
      })),
    ]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 6)
      .map((item) => ({
        ...item,
        date: relativeLabel(item.date),
      }))

    activities.value = timeline

    progressAreas.value = progressList
      .slice()
      .sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0))
      .slice(0, 4)
      .map((item) => ({
        name: item.nama_area || 'Area belum diisi',
        progress: Number(item.persentase || 0),
      }))
  } catch (error) {
    console.error(error)
    metrics.value = [
      { label: 'Tukang hadir', value: '0', icon: 'user-check', caption: 'Hari ini', trend: 'Live' },
      { label: 'Nota masuk', value: 'Rp 0', icon: 'document-text', caption: 'Bulan ini', trend: 'Rp' },
      { label: 'Material datang', value: '0', icon: 'package', caption: 'Dalam 7 hari', trend: 'Aktif' },
      { label: 'Progress rata-rata', value: '0%', icon: 'trending-up', caption: 'Poin proyek', trend: 'Target' },
    ]
    summaryCards.value = [
      { label: 'Kehadiran', value: '0/0', badge: 'Hari ini', caption: 'Belum ada data operasional.' },
      { label: 'Cash flow', value: 'Rp 0', badge: 'Masuk', caption: 'Belum ada data catatan masuk.' },
      { label: 'Pengeluaran', value: 'Rp 0', badge: 'Material', caption: 'Belum ada data material.' },
    ]
    summaryStatus.value = 'Monitoring'
    priorityItems.value = []
    activities.value = []
    progressAreas.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadPrioritas()
  await loadDashboard()
})
</script>
