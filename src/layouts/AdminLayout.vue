<template>
  <div :class="['min-h-screen', theme.isDark ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-slate-900']">
    <!-- Sidebar -->
    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'sidebar-shell fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 ease-out border-r',
        // Mobile: translate
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0',
        // Generic width (mobile)
        'w-64',
        // Desktop width
        collapsed ? 'md:w-20' : 'md:w-64',
      ]"
      style="background: var(--bg-sidebar)"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <img
          src="/logo_putih.png"
          alt="Logo"
          class="w-10 h-10 object-contain flex-shrink-0"
        />
        <transition name="fade">
          <span
            v-if="!collapsed"
            class="text-white text-sm font-semibold leading-tight font-sans tracking-wide"
          >
            Ibnu Hafidz
          </span>
        </transition>
      </div>

      <!-- Nav Items -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <template v-for="(item, index) in visibleNavItems" :key="index">
          <!-- Header -->
          <div v-if="item.type === 'header'" class="section-shell">
             <transition name="fade">
                <div v-if="!collapsed" class="section-header">
                  <span class="section-title">
                    {{ item.header }}
                  </span>
                  <button
                    type="button"
                    @click.stop="toggleSection(item.header)"
                    class="section-toggle"
                    :title="isSectionCollapsed(item.header) ? 'Expand section' : 'Collapse section'"
                  >
                    <SvgIcon :name="isSectionCollapsed(item.header) ? 'chevron-right' : 'chevron-down'" :size="14" />
                  </button>
                </div>
                <div v-else class="section-divider">
                  <span class="section-divider-line"></span>
                </div>
             </transition>
          </div>

          <!-- Link -->
          <template v-else-if="!isSectionCollapsed(item.sectionHeader)">
            <router-link
              :to="item.to"
              custom
              v-slot="{ isExactActive, navigate }"
            >
              <div
                @click="navigate"
                :class="[
                  'sidebar-nav-item',
                  { active: isNavActive(item, isExactActive) },
                ]"
                :title="collapsed ? item.label : ''"
              >
                <span class="nav-icon-wrap">
                  <SvgIcon :name="item.icon" :size="20" class="flex-shrink-0" />
                </span>
                <transition name="fade">
                  <span v-if="!collapsed" class="truncate nav-label">{{ item.label }}</span>
                </transition>
              </div>
            </router-link>
          </template>
        </template>
      </nav>

      <!-- Collapse toggle -->
      <!-- Collapse toggle (Desktop Only) -->
      <button
        @click="collapsed = !collapsed"
        class="sidebar-collapse-button hidden md:block text-white/50 hover:text-white transition-all text-center"
      >
        <SvgIcon
          :name="collapsed ? 'chevron-right' : 'chevron-left'"
          :size="18"
        />
      </button>

      <!-- User section -->
      <div class="user-panel border-t border-white/10 p-4">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-full overflow-hidden bg-secondary flex items-center justify-center text-primary-dark font-bold text-sm flex-shrink-0"
          >
            <img
              v-if="sidebarAvatarUrl"
              :src="sidebarAvatarUrl"
              alt="Avatar"
              class="w-full h-full object-cover"
              @error="avatarLoadFailed = true"
            />
            <span v-else>
              {{ auth.userName?.charAt(0)?.toUpperCase() || "U" }}
            </span>
          </div>
          <transition name="fade">
            <div v-if="!collapsed" class="flex-1 min-w-0">
              <p class="text-white text-sm font-medium truncate">
                {{ auth.userName }}
              </p>
              <p class="text-white/50 text-xs truncate">{{ auth.userEmail }}</p>
            </div>
          </transition>
        </div>
        <button
          v-if="!collapsed"
          @click="auth.logout()"
          class="mt-3 w-full text-sm text-white/60 hover:text-white py-1.5 rounded-lg hover:bg-white/10 transition flex items-center justify-center gap-2"
        >
          <SvgIcon name="logout" :size="16" />
          Keluar
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div
      id="main-content"
      :class="[
        'flex-1 transition-all duration-300 flex flex-col min-h-screen',
        collapsed ? 'md:ml-20' : 'md:ml-64',
        'ml-0',
      ]"
    >
      <!-- Top Bar -->
      <header
        :class="['sticky top-0 z-20 backdrop-blur-md border-b px-4 md:px-6 py-3 flex items-center justify-between', theme.isDark ? 'bg-slate-900/80 border-slate-700 text-slate-100' : 'bg-white/80 border-gray-200 text-slate-900']"
      >
        <!-- Mobile Search Overlay -->
        <div
          v-if="showMobileSearch"
          class="absolute inset-0 bg-white z-30 flex items-center px-4 gap-2 animate-fade-in"
        >
          <SvgIcon name="search" :size="20" class="text-gray-400" />
          <input
            type="text"
            placeholder="Cari..."
            class="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
            autofocus
          />
          <button @click="showMobileSearch = false" class="p-1 text-gray-500">
            <SvgIcon name="x" :size="20" />
          </button>
        </div>

        <div :class="['flex items-center gap-2 text-sm', theme.isDark ? 'text-slate-300' : 'text-gray-500']">
          <!-- Mobile Menu Toggle -->
          <button
            @click="isSidebarOpen = !isSidebarOpen"
            class="md:hidden mr-2 p-1 text-gray-600 hover:text-primary rounded hover:bg-gray-100"
          >
            <SvgIcon name="menu" :size="24" />
          </button>

          <router-link to="/dashboard" class="hover:text-primary transition"
            >Dashboard</router-link
          >
          <span v-if="$route.meta.title && $route.name !== 'dashboard'">/</span>
          <span
            v-if="$route.meta.title && $route.name !== 'dashboard'"
            class="text-gray-800 font-medium"
          >
            {{ $route.meta.title }}
          </span>
        </div>
        <div class="flex items-center gap-4">
          <div class="relative hidden md:block">
            <input
              type="text"
              placeholder="Cari..."
              class="input-field !py-2 !pl-10 !pr-4 w-64 text-sm"
            />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              ><SvgIcon name="search" :size="16"
            /></span>
          </div>
          <button
            @click="showMobileSearch = true"
            class="md:hidden text-gray-500 hover:text-primary transition"
          >
            <SvgIcon name="search" :size="20" />
          </button>
          <button
            @click="theme.toggleTheme()"
            class="p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            :title="theme.isDark ? 'Light mode' : 'Dark mode'"
          >
            <SvgIcon :name="theme.isDark ? 'sun' : 'moon'" :size="18" />
          </button>
          <div class="relative">
            <button
              @click.stop="showNotifications = !showNotifications"
              class="relative text-gray-500 hover:text-primary transition text-xl p-1"
            >
              <SvgIcon name="bell" :size="22" />
              <span
                v-if="notifStore.unreadCount > 0"
                class="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white"
              >
                {{ notifStore.unreadCount > 99 ? '99+' : notifStore.unreadCount }}
              </span>
            </button>
            
            <transition name="fade">
              <NotificationDropdown 
                v-if="showNotifications" 
                v-click-outside="() => showNotifications = false"
              />
            </transition>
          </div>
        </div>
      </header>


      <!-- Page Content -->
      <main class="p-4 md:p-6">
        <router-view v-slot="{ Component }">
          <transition name="page">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useThemeStore } from "@/stores/theme";
import { useRoute } from "vue-router";
import SvgIcon from "@/components/ui/SvgIcon.vue";
import NotificationDropdown from "@/components/ui/NotificationDropdown.vue";
import { fetchSidebarMenuSettings } from "@/api/sidebarMenuSettings";

const auth = useAuthStore();
const notifStore = useNotificationStore();
const theme = useThemeStore();
const route = useRoute();
const collapsed = ref(false);
const isSidebarOpen = ref(false);
const showMobileSearch = ref(false);
const showNotifications = ref(false);
const avatarLoadFailed = ref(false);
const sidebarMenuSettings = ref({});
const collapsedSections = ref({});

function getSidebarCollapseStorageKey() {
  const userKey = auth.user?.id ?? auth.user?.username ?? auth.user?.email ?? auth.userName ?? 'guest'
  return `sidebar-collapsed-sections:${String(userKey)}`
}

function loadCollapsedSections() {
  try {
    const key = getSidebarCollapseStorageKey()
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveCollapsedSections() {
  try {
    const key = getSidebarCollapseStorageKey()
    localStorage.setItem(key, JSON.stringify(collapsedSections.value))
  } catch {
    // ignore storage errors
  }
}

watch(
  () => auth.user?.id ?? auth.user?.username ?? auth.user?.email ?? auth.userName,
  () => {
    collapsedSections.value = loadCollapsedSections()
  },
  { immediate: true }
)

const sidebarAvatarUrl = computed(() => {
  if (avatarLoadFailed.value) return '';
  const raw = auth.user?.foto_guru;
  if (!raw) return '';

  const value = String(raw);
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  const normalized = value.replace(/^\/+/, '');
  return normalized.startsWith('uploads/') ? `/${normalized}` : `/uploads/${normalized}`;
});

onUnmounted(() => {
  notifStore.disconnectSSE();
  window.removeEventListener('sidebar-menu-settings-updated', reloadSidebarMenuSettings)
});

watch(
  () => auth.isAuthenticated,
  (isAuthed) => {
    if (isAuthed) {
      notifStore.initialize();
    } else {
      notifStore.disconnectSSE();
    }
  },
  { immediate: true }
);

watch(
  () => auth.accessToken,
  (newToken, oldToken) => {
    if (!newToken || newToken === oldToken) return;
    notifStore.disconnectSSE();
    notifStore.initialize();
  }
);

watch(
  () => auth.user?.foto_guru,
  () => {
    avatarLoadFailed.value = false;
  }
);

watch(
  () => auth.isAuthenticated,
  (isAuthed) => {
    if (!isAuthed) {
      sidebarMenuSettings.value = {};
      return;
    }
    reloadSidebarMenuSettings();
  },
  { immediate: true },
);

watch(
  () => auth.user?.roles,
  () => {
    if (auth.isAuthenticated) {
      reloadSidebarMenuSettings();
    }
  },
  { deep: true },
);

// Close sidebar on route change (mobile)
watch(
  () => route.fullPath,
  () => {
    isSidebarOpen.value = false;
  },
);

const hasRole = (roleName) => auth.userRoles?.some((role) => role.name === roleName)

const navItems = [
  { header: 'Main' },
  {
    to: "/dashboard",
    icon: "dashboard",
    label: "Dashboard",
    permission: "dashboard.view",
    exact: true,
  },
  
  { header: 'Data Master' },
  {
    to: "/dashboard/students",
    icon: "students",
    label: "Santri",
    permission: "students.view",
    menuKey: 'students',
  },
  {
    to: "/dashboard/alumni",
    icon: "students",
    label: "Alumni",
    permission: "students.view",
    menuKey: 'alumni',
  },
  {
    to: "/dashboard/users",
    icon: "users",
    label: "Pengajar",
    permission: "users.view",
    exact: true,
    menuKey: 'teachers',
  },
  {
    to: "/dashboard/users/activity-logs",
    icon: "clock",
    label: "Log Aktivitas",
    permission: "users.view",
  },
  {
    to: "/dashboard/kelas",
    icon: "bookmark",
    label: "Kelas",
    permission: "kelas.view",
    menuKey: 'kelas',
  },
  {
    to: "/dashboard/kamar",
    icon: "room",
    label: "Data Kamar",
    permission: "kamar.view",
    menuKey: 'kamar',
  },

  { header: 'Akademik' },
  {
    to: "/dashboard/lessons",
    icon: "book",
    label: "Pelajaran Formal",
    permission: "lessons.view",
    activeOn: ["/dashboard/lessons"],
    menuKey: 'lessons',
  },
  {
    to: "/dashboard/diniyyah-lesson",
    icon: "book",
    label: "Pelajaran Diniyyah",
    permission: "diniyyah_lesson.view",
    menuKey: 'diniyyah_lesson',
  },
  {
    to: "/dashboard/jadwal-formal",
    icon: "clock",
    label: "Jadwal Formal",
    permission: null,
    activeOn: ["/dashboard/jadwal-formal"],
    activeExcept: ["/dashboard/jadwal-ramadhan"],
    menuKey: 'jadwal_formal',
  },
  {
    to: "/dashboard/jadwal-ramadhan",
    icon: "clock",
    label: "Jadwal Formal Ramadhan",
    permission: null,
    activeOn: ["/dashboard/jadwal-ramadhan"],
    menuKey: 'jadwal_formal_ramadhan',
  },
  {
    to: "/dashboard/jadwal-diniyyah",
    icon: "clock",
    label: "Jadwal Diniyyah",
    permission: null,
    activeOn: ["/dashboard/jadwal-diniyyah"],
    menuKey: 'jadwal_diniyyah',
  },

  { header: 'Kesantrian' },
  {
    to: "/dashboard/absensi/statistik",
    icon: "attendance",
    label: "Riwayat Absensi Formal",
    permission: "absensi.view",
    activeOn: ["/dashboard/absensi/statistik"],
    menuKey: 'absensi_formal_history',
  },
  {
    to: "/dashboard/jurnal-mengajar",
    icon: "book",
    label: "Jurnal Mengajar",
    permission: "absensi.view",
    activeOn: ["/dashboard/jurnal-mengajar"],
    menuKey: 'jurnal_mengajar',
  },
  {
    to: "/dashboard/absensi-ramadhan/statistik",
    icon: "attendance",
    label: "Absensi Formal Ramadhan",
    permission: "absensi.view",
    activeOn: ["/dashboard/absensi-ramadhan"],
    menuKey: 'absensi_formal_ramadhan',
  },
  {
    to: "/dashboard/absensi-diniyyah/statistik",
    icon: "attendance",
    label: "Riwayat Absensi Diniyyah",
    permission: "absensi_diniyyah.view",
    activeOn: ["/dashboard/absensi-diniyyah/statistik"],
    menuKey: 'absensi_diniyyah_history',
  },
  {
    to: "/dashboard/absensi/guru",
    icon: "users",
    label: "Rekapan Guru Formal",
    permission: "absensi.view",
    exact: true,
  },
  {
    to: "/dashboard/absensi-ramadhan/guru",
    icon: "users",
    label: "Rekapan Guru Ramadhan",
    permission: "absensi.view",
    exact: true,
  },
  {
    to: "/dashboard/absensi-diniyyah/guru",
    icon: "users",
    label: "Rekapan Guru Diniyyah",
    permission: "absensi_diniyyah.view",
    exact: true,
  },
  { header: 'Halaqoh' },
  {
    to: "/dashboard/halaqoh-assignments",
    icon: "halaqoh",
    label: "Halaqoh",
    permission: null,
    menuKey: 'halaqoh',
  },
  {
    to: "/dashboard/halaqoh/statistik/santri",
    icon: "attendance",
    label: "Riwayat Absensi Halaqoh",
    permission: "halaqoh.view",
    menuKey: 'halaqoh_history',
  },
  {
    to: "/dashboard/halaqoh/statistik/guru",
    icon: "users",
    label: "Rekapan Halaqoh Guru",
    permission: "halaqoh.view",
  },
  {
    to: "/dashboard/halaqoh/validasi",
    icon: "check-circle",
    label: "Validasi Halaqoh",
    roles: ['super_admin', 'admin'],
  },
  { header: 'Ekstra & Lainnya' },
  {
    to: "/dashboard/absensi-ekstra",
    icon: "check-circle",
    label: "Absensi Ekstra",
    permission: "absensi_ekstra.view_all",
    menuKey: 'absensi_ekstra',
  },
  {
    to: "/dashboard/arrivals",
    icon: "attendance",
    label: "Absen Kedatangan",
    permission: "dashboard.view",
    menuKey: 'student_arrival',
  },
  { header: 'Revitalisasi SMA' },
  {
    to: "/dashboard/revitalisasi",
    icon: "construction",
    label: "Ringkasan Proyek",
    roles: ['super_admin', 'admin'],
    menuKey: 'revitalisasi_sma',
    exact: true,
    activeOn: ['/dashboard/revitalisasi'],
  },
  {
    to: "/dashboard/revitalisasi/tukang",
    icon: "users",
    label: "Data Tukang",
    roles: ['super_admin', 'admin'],
    menuKey: 'revitalisasi_tukang',
    activeOn: ['/dashboard/revitalisasi/tukang'],
  },
  {
    to: "/dashboard/revitalisasi/absen-tukang",
    icon: "attendance",
    label: "Absen Tukang",
    roles: ['super_admin', 'admin'],
    menuKey: 'revitalisasi_absen_tukang',
    activeOn: ['/dashboard/revitalisasi/absen-tukang'],
  },
  {
    to: "/dashboard/revitalisasi/nota-material",
    icon: "document",
    label: "Nota Material",
    roles: ['super_admin', 'admin'],
    menuKey: 'revitalisasi_nota_material',
    activeOn: ['/dashboard/revitalisasi/nota-material'],
  },
  {
    to: "/dashboard/revitalisasi/nota-masuk",
    icon: "document-text",
    label: "Nota Masuk",
    roles: ['super_admin', 'admin'],
    menuKey: 'revitalisasi_nota_masuk',
    activeOn: ['/dashboard/revitalisasi/nota-masuk'],
  },
  {
    to: "/dashboard/revitalisasi/material-datang",
    icon: "package",
    label: "Material Datang",
    roles: ['super_admin', 'admin'],
    menuKey: 'revitalisasi_material_datang',
    activeOn: ['/dashboard/revitalisasi/material-datang'],
  },
  {
    to: "/dashboard/revitalisasi/progres-pembangunan",
    icon: "trending-up",
    label: "Progres Pembangunan",
    roles: ['super_admin', 'admin'],
    menuKey: 'revitalisasi_progres',
    activeOn: ['/dashboard/revitalisasi/progres-pembangunan'],
  },
  { header: 'Prestasi & OCR' },
  {
    to: "/dashboard/prestasi",
    icon: "trophy",
    label: "Prestasi",
    permission: "prestasi.view",
    menuKey: 'prestasi',
  },
  {
    to: "/dashboard/ocr",
    icon: "document",
    label: "Scanner Lembar Jawab",
    permission: "dashboard.view",
    activeOn: ["/dashboard/ocr"],
    activeExcept: ["/dashboard/ocr/results"],
    menuKey: 'ocr_scanner',
  },
  {
    to: "/dashboard/ocr/results",
    icon: "document",
    label: "Hasil OCR",
    permission: "dashboard.view",
    activeOn: ["/dashboard/ocr/results"],
    menuKey: 'ocr_results',
  },

  { header: 'Laundry & Sarpras' },
  {
    to: "/dashboard/laundry/accounts",
    icon: "users",
    label: "Manajemen Akun Laundry",
    permission: "laundry_accounts.view",
    activeOn: ["/dashboard/laundry/accounts"],
    menuKey: 'laundry_accounts',
  },
  {
    to: "/dashboard/laundry/vendors",
    icon: "users",
    label: "Vendor Laundry",
    permission: "laundry_accounts.view",
    activeOn: ["/dashboard/laundry/vendors"],
    menuKey: 'laundry_vendors',
  },
  {
    to: "/dashboard/laundry/accounts",
    icon: "users",
    label: "Manajemen Akun",
    permission: "laundry_accounts.view",
    hiddenInSidebar: true,
  },
  {
    to: "/dashboard/laundry/transactions",
    icon: "laundry",
    label: "Transaksi Laundry",
    permission: "laundry_accounts.view",
    menuKey: 'laundry_transactions',
  },
  {
    to: "/dashboard/laundry/pickups",
    icon: "check-circle",
    label: "Pengambilan Laundry",
    permission: "laundry_accounts.view",
  },
  {
    to: "/dashboard/kontak",
    icon: "database",
    label: "Database Kontak & Tagihan",
    permission: "kontak.view",
    menuKey: 'kontak_database',
    activeOn: ["/dashboard/kontak", "/dashboard/tagihan"],
    activeExcept: ["/dashboard/kontak/import-excel", "/dashboard/kontak/template"],
  },
  {
    to: "/dashboard/kontak/import-excel",
    icon: "document",
    label: "Import Excel",
    permission: "kontak.import",
    menuKey: 'kontak_import',
    activeOn: ["/dashboard/kontak/import-excel", "/dashboard/tagihan/import-excel"],
  },
  {
    to: "/dashboard/kontak/template",
    icon: "article",
    label: "Template WA",
    permission: "template_pesan.view",
    menuKey: 'kontak_template',
    activeOn: ["/dashboard/kontak/template"],
  },

  { header: 'Konten & Galeri' },
  {
    to: "/dashboard/articles",
    icon: "article",
    label: "Berita",
    permission: "content.view",
    menuKey: 'content',
  },
  {
    to: "/dashboard/galeri",
    icon: "gallery",
    label: "Galeri",
    permission: "gallery.view",
    menuKey: 'gallery',
  },

  { header: 'Sistem' },
  {
    to: "/dashboard/roles",
    icon: "roles",
    label: "Roles & Permissions",
    permission: "roles.view",
  },
  {
    to: "/dashboard/settings",
    icon: "settings",
    label: "Pengaturan",
    permission: null,
  },
  {
    to: "/dashboard/sidebar-menu-settings",
    icon: "settings",
    label: "Pengaturan Sidebar",
    permission: null,
    roles: ['super_admin'],
    activeOn: ["/dashboard/sidebar-menu-settings"],
  },
];

async function reloadSidebarMenuSettings() {
  try {
    const items = await fetchSidebarMenuSettings()
    sidebarMenuSettings.value = items.reduce((acc, item) => {
      acc[item.key] = item.is_active !== false
      return acc
    }, {})
  } catch {
    sidebarMenuSettings.value = {}
  }
}

function canViewNavItem(item) {
  if (item.hiddenInSidebar) return false
  if (item.permission && !auth.hasPermission(item.permission)) return false
  if (item.roles && !item.roles.some((roleName) => hasRole(roleName))) return false
  if (item.menuKey && sidebarMenuSettings.value[item.menuKey] === false) return false
  return true
}

const visibleNavItems = computed(() => {
  const grouped = []
  let currentHeader = null

  navItems.forEach((item) => {
    if (item.header) {
      currentHeader = item.header
      grouped.push({ type: 'header', header: item.header })
      return
    }

    if (!canViewNavItem(item)) {
      return
    }

    grouped.push({
      ...item,
      type: 'nav',
      sectionHeader: currentHeader,
    })
  })

  return grouped
})

function isSectionCollapsed(header) {
  if (!header) return false
  return !!collapsedSections.value[header]
}

function toggleSection(header) {
  if (!header) return
  collapsedSections.value = {
    ...collapsedSections.value,
    [header]: !collapsedSections.value[header],
  }
  saveCollapsedSections()
}

function isNavActive(item, isExactActive) {
  if (item.to === '/dashboard') return isExactActive
  if (item.activeExcept && item.activeExcept.some((path) => route.path.startsWith(path))) {
    return false
  }
  if (item.exact) {
    return route.path === item.to
  }
  if (item.activeOn) {
    return item.activeOn.some((p) => route.path.startsWith(p))
  }
  return route.path.startsWith(item.to)
}

onMounted(() => {
	window.addEventListener('sidebar-menu-settings-updated', reloadSidebarMenuSettings)
})
</script>

<style scoped>
.sidebar-shell {
  border-color: rgba(148, 163, 184, 0.12);
  box-shadow: 18px 0 40px rgba(2, 6, 23, 0.52), inset -1px 0 0 rgba(255, 255, 255, 0.04);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(15, 23, 42, 0.88) 100%);
}

nav {
  padding-top: 0.75rem;
}

.section-shell {
  padding: 0.2rem 0.5rem 0.3rem;
  margin-top: 0.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 0.8rem 0.45rem;
  border-radius: 0.95rem;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.62));
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 6px 14px rgba(2, 6, 23, 0.22);
  backdrop-filter: blur(6px);
}

.section-title {
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.92);
}

.section-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 0.7rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.52);
  color: rgba(255, 255, 255, 0.72);
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.section-toggle:hover {
  background: rgba(59, 130, 246, 0.18);
  color: rgba(255, 255, 255, 1);
  border-color: rgba(96, 165, 250, 0.42);
  transform: translateY(-1px);
}

.section-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0.3rem 0.8rem 0.25rem;
}

.section-divider-line {
  display: block;
  width: 100%;
  height: 1px;
  border-radius: 999px;
  background: linear-gradient(to right, rgba(148, 163, 184, 0.04), rgba(148, 163, 184, 0.28), rgba(148, 163, 184, 0.04));
}

.sidebar-nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.75rem 0.8rem;
  border-radius: 0.95rem;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(15, 23, 42, 0.28);
  border: 1px solid rgba(148, 163, 184, 0.08);
  transition: all 0.22s ease;
  cursor: pointer;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.sidebar-nav-item::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(168, 85, 247, 0.08));
  opacity: 0;
  transition: opacity 0.22s ease;
}

.sidebar-nav-item:hover {
  transform: translateX(2px);
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(30, 41, 59, 0.62);
  box-shadow: 0 12px 22px rgba(2, 6, 23, 0.18);
}

.sidebar-nav-item:hover::before,
.sidebar-nav-item.active::before {
  opacity: 1;
}

.sidebar-nav-item.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.22), rgba(168, 85, 247, 0.15));
  border-color: rgba(96, 165, 250, 0.42);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 28px rgba(37, 99, 235, 0.18);
}

.nav-icon-wrap {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.75rem;
  background: rgba(15, 23, 42, 0.52);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
}

.sidebar-nav-item.active .nav-icon-wrap {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.25), rgba(147, 197, 253, 0.12));
  border-color: rgba(147, 197, 253, 0.46);
}

.nav-label {
  position: relative;
  z-index: 1;
  font-size: 0.88rem;
  font-weight: 650;
  letter-spacing: 0.01em;
  color: rgba(255, 255, 255, 0.94);
}

.user-panel {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0.45));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.sidebar-collapse-button {
  width: calc(100% - 1rem);
  margin: 0.35rem auto 0.25rem;
  padding: 0.7rem 0.5rem;
  border-radius: 0.8rem;
  background: rgba(15, 23, 42, 0.38);
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.sidebar-collapse-button:hover {
  background: rgba(59, 130, 246, 0.16);
  border-color: rgba(96, 165, 250, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  #main-content {
    margin-left: 0 !important;
  }
}
</style>
