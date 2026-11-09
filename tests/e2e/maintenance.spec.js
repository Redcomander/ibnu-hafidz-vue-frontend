import { test, expect } from '@playwright/test'

const message = 'Pembaruan sistem sampai pukul 15.00 WIB.'
test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173(?:\/|$))/, route => route.abort())
  await page.route('http://127.0.0.1:4173/api/**', route => route.fulfill({ status: 401, json: { error: 'unauthorized' } }))
})

async function status(page, state) {
  await page.route('**/api/maintenance', route => route.fulfill({ json: state }))
}

async function session(page, role) {
  const user = { id: 7, name: 'Test User', username: 'test', email: 'test@example.test', roles: [{ name: role, permissions: [{ name: 'dashboard.view' }] }] }
  await page.route('**/api/auth/refresh', route => route.fulfill({ json: { access_token: 'test-access', user } }))
  await page.route('**/api/dashboard/stats?*', route => route.fulfill({ json: {} }))
  await page.route('**/api/feature-flags/ramadhan', route => route.fulfill({ json: { is_enabled: false } }))
  await page.route('**/api/notifications?*', route => route.fulfill({ json: { data: [] } }))
  await page.route('**/api/notifications/stream/ticket', route => route.fulfill({ json: {} }))
  await page.route('**/api/sidebar-menu-settings', route => route.fulfill({ json: { menu_settings: [] } }))
  await page.route('**/api/profile/device-login-history*', route => route.fulfill({ json: { data: [] } }))
}

test('visitors see maintenance and retain access to administrator login', async ({ page }) => {
  await status(page, { enabled: true, scope: 'all', message, can_bypass: false })
  await page.goto('/all-article')
  await expect(page).toHaveURL(/\/maintenance\?redirect=/)
  await expect(page.getByRole('heading', { name: 'Sedang dalam pemeliharaan' })).toBeVisible()
  await expect(page.getByText(message, { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('link', { name: 'Login administrator' }).click()
  await expect(page.getByRole('heading', { name: 'Selamat Datang' })).toBeVisible()
})

test('retry returns to the original page after maintenance ends', async ({ page }) => {
  const state = { enabled: true, scope: 'all', message, can_bypass: false }
  await status(page, state)
  await page.route('**/api/public/articles?*', route => route.fulfill({ json: { data: { articles: [], total_pages: 1 } } }))
  await page.goto('/all-article')
  await expect(page.getByRole('button', { name: 'Coba lagi' })).toBeEnabled()
  state.enabled = false
  await page.getByRole('button', { name: 'Coba lagi' }).click()
  await expect(page).toHaveURL(/\/all-article$/)
  await expect(page.getByRole('heading', { name: 'Berita & Artikel' })).toBeVisible()
})

test('whole-app maintenance blocks staff navigation', async ({ page }) => {
  await session(page, 'teacher')
  await status(page, { enabled: true, scope: 'all', message, can_bypass: false })
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/maintenance\?redirect=/)
  await expect(page.getByRole('button', { name: 'Keluar dan login administrator' })).toBeVisible()
})

test('public-only maintenance leaves staff dashboard accessible', async ({ page }) => {
  await session(page, 'teacher')
  await status(page, { enabled: true, scope: 'public', message, can_bypass: false })
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Selamat Datang, Test User!' })).toBeVisible()
})

test('administrator can disable maintenance from settings', async ({ page }) => {
  await session(page, 'admin')
  const state = { enabled: true, scope: 'all', message, can_bypass: true }
  await page.route('**/api/maintenance', async route => {
    if (route.request().method() === 'PUT') {
      expect(route.request().headers().authorization).toBe('Bearer test-access')
      Object.assign(state, route.request().postDataJSON())
    }
    await route.fulfill({ json: state })
  })
  await page.goto('/dashboard/settings')
  const panel = page.getByRole('region', { name: 'Mode Pemeliharaan' })
  const toggle = panel.getByRole('checkbox', { name: 'Aktifkan mode pemeliharaan' })
  await expect(toggle).toBeEnabled()
  await expect(toggle).toBeChecked()
  await toggle.uncheck()
  await panel.getByRole('button', { name: 'Simpan pemeliharaan' }).click()
  await expect(panel.getByRole('status')).toHaveText('Mode pemeliharaan dinonaktifkan.')
  expect(state.enabled).toBe(false)
})

test('administrator renews a stale token before entering during maintenance', async ({ page }) => {
  await session(page, 'admin')
  let calls = 0
  await page.route('**/api/maintenance', route => route.fulfill({ json: {
    enabled: true, scope: 'all', message, can_bypass: ++calls > 1,
  } }))
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Selamat Datang, Test User!' })).toBeVisible()
  expect(calls).toBeGreaterThan(1)
})

test('failed save keeps the maintenance form available for retry', async ({ page }) => {
  await session(page, 'admin')
  await page.route('**/api/maintenance', route => route.request().method() === 'PUT'
    ? route.fulfill({ status: 500, json: { error: 'server_error' } })
    : route.fulfill({ json: { enabled: false, scope: 'all', message, can_bypass: true } }))
  await page.goto('/dashboard/settings')
  const panel = page.getByRole('region', { name: 'Mode Pemeliharaan' })
  await expect(panel.getByRole('checkbox')).toBeEnabled()
  await panel.getByRole('checkbox').check()
  await panel.getByRole('button', { name: 'Simpan pemeliharaan' }).click()
  await expect(panel.getByRole('alert')).toHaveText('Gagal menyimpan. Pengaturan belum diperbarui.')
  await expect(panel.getByRole('button', { name: 'Simpan pemeliharaan' })).toBeEnabled()
  await expect(panel.getByRole('status')).toHaveCount(0)
})

test('a maintenance API response redirects an already opened page', async ({ page }) => {
  await status(page, { enabled: false, scope: 'all', message, can_bypass: false })
  await page.route('**/api/public/articles?*', route => route.fulfill({ status: 503, json: { error: 'maintenance', message, scope: 'all' } }))
  // Keep subsequent checks active once the endpoint starts rejecting requests.
  let calls = 0
  await page.route('**/api/maintenance', route => route.fulfill({ json: { enabled: ++calls > 1, scope: 'all', message, can_bypass: false } }))
  await page.goto('/all-article')
  await expect(page).toHaveURL(/\/maintenance\?redirect=/)
  await expect(page.getByText(message, { exact: true })).toBeVisible()
})
