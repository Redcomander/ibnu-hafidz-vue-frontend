<template>
  <main class="maintenance-page">
    <section class="maintenance-card" aria-labelledby="maintenance-title">
      <img src="/logo_putih.png" alt="Ibnu Hafidz" class="maintenance-logo" />
      <p class="maintenance-eyebrow">PONDOK PESANTREN TAHFIDZ IBNU HAFIDZ</p>
      <h1 id="maintenance-title">Sedang dalam pemeliharaan</h1>
      <p class="maintenance-message">{{ maintenance.message }}</p>
      <p v-if="error" role="alert" class="maintenance-error">{{ error }}</p>
      <div class="maintenance-actions">
        <button class="btn-primary" :disabled="checking" @click="checkStatus">{{ checking ? 'Memeriksa...' : 'Coba lagi' }}</button>
        <router-link v-if="!auth.isAuthenticated" :to="{ name: 'login' }">Login administrator</router-link>
        <button v-else class="maintenance-switch" @click="auth.logout()">Keluar dan login administrator</button>
      </div>
      <p class="maintenance-footnote">Terima kasih atas kesabaran Anda.</p>
    </section>
  </main>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useAuthStore } from '@/stores/auth'
const maintenance = useMaintenanceStore()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const checking = ref(false)
const error = ref('')
let timer
async function checkStatus() {
  if (checking.value) return
  checking.value = true
  error.value = ''
  try {
    await maintenance.refresh(auth.accessToken)
    if (maintenance.enabled && !maintenance.canBypass && (auth.hasRole('admin') || auth.hasRole('super_admin'))) {
      if (await auth.tryRefresh()) await maintenance.refresh(auth.accessToken)
    }
    if (!maintenance.enabled || maintenance.canBypass) {
      const destination = route.query.redirect
      const safe = typeof destination === 'string' && /^\/(?!\/)/.test(destination) && !destination.startsWith('/maintenance') && !destination.startsWith('/login')
      await router.replace(safe ? destination : maintenance.canBypass ? '/dashboard/settings' : '/')
    }
  } catch { error.value = 'Belum dapat memeriksa status. Silakan coba lagi.' }
  finally { checking.value = false }
}
onMounted(() => { checkStatus(); timer = setInterval(checkStatus, 30000) })
onUnmounted(() => clearInterval(timer))
</script>
<style scoped>
.maintenance-page { min-height: 100vh; display: grid; place-items: center; padding: 2rem 1rem; background: radial-gradient(ellipse at top left, #286b49, transparent 65%), #102f23; color: #f3f6ee; }
.maintenance-card { width: min(100%, 640px); padding: clamp(1.5rem, 6vw, 4rem); border: 1px solid #ffffff26; border-radius: 24px; background: #ffffff08; box-shadow: 0 24px 80px #0003; }
.maintenance-logo { width: 64px; height: 64px; object-fit: contain; margin-bottom: 2rem; }
.maintenance-eyebrow { font-size: 0.65rem; letter-spacing: 0.18em; color: #d4b967; line-height: 1.8; }
h1 { font-family: Georgia, serif; font-size: clamp(2rem, 7vw, 3.5rem); line-height: 1.12; margin: 1rem 0 1.5rem; }
.maintenance-message { color: #d0ddd3; line-height: 1.8; white-space: pre-wrap; overflow-wrap: anywhere; }
.maintenance-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; margin-top: 2rem; }
.maintenance-actions a { color: #e0cd91; font-size: 0.875rem; text-decoration: underline; text-underline-offset: 4px; }
.maintenance-switch { color: #e0cd91; font-size: 0.875rem; text-decoration: underline; text-underline-offset: 4px; }
.maintenance-footnote { margin-top: 3rem; font-size: 0.75rem; color: #9bb3a5; }
.maintenance-error { margin-top: 1rem; color: #ffccbc; font-size: 0.875rem; }
</style>
