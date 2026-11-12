import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173(?:\/|$))/, route => route.abort())
  await page.route('http://127.0.0.1:4173/api/**', route => route.fulfill({ status: 401, json: {} }))
  await page.route('**/api/auth/refresh', route => route.fulfill({ json: {
    access_token: 'test-access', user: { id: 1, name: 'Teacher', roles: [{ name: 'teacher', permissions: [{ name: 'dashboard.view' }] }] },
  } }))
  await page.route('**/api/auth/logout', route => route.fulfill({ json: {} }))
  await page.route('**/api/maintenance', route => route.fulfill({ json: { enabled: false } }))
  await page.route('**/api/dashboard/stats?*', route => route.fulfill({ json: {} }))
  await page.route('**/api/feature-flags/ramadhan', route => route.fulfill({ json: { is_enabled: false } }))
  await page.route('**/api/sidebar-menu-settings', route => route.fulfill({ json: { menu_settings: [] } }))
  await page.addInitScript(() => {
    globalThis.__streams = []
    globalThis.EventSource = class {
      constructor(url) { this.url = url; this.closed = false; globalThis.__streams.push(this); queueMicrotask(() => this.onopen?.()) }
      close() { this.closed = true }
    }
  })
})

async function mockNotifications(page) {
  const state = { unread: 23, rows: Array.from({ length: 23 }, (_, i) => ({ id: 23 - i, title: `Notification ${23 - i}`, message: 'Message', is_read: false, created_at: '2026-11-09T12:00:00Z', action_url: '/dashboard' })) }
  await page.route('**/api/notifications?*', route => {
    const number = Number(new URL(route.request().url()).searchParams.get('page') || 1)
    return route.fulfill({ json: { data: state.rows.slice((number - 1) * 10, number * 10), unread_count: state.unread, total: state.rows.length, last_page: 3 } })
  })
  await page.route('**/api/notifications/stream/ticket', route => route.fulfill({ json: { ticket: 'one-time-ticket' } }))
  await page.route('**/api/notifications/*/read', route => {
    state.rows.forEach(row => { row.is_read = true }); state.unread = 0
    return route.fulfill({ json: { unread_count: 0 } })
  })
  return state
}

test('notification filters and search combine without changing unread counts', async ({ page }) => {
  const state = await mockNotifications(page)
  state.rows[0].is_read = true
  state.unread = 22
  await page.goto('/dashboard')
  const bell = page.getByRole('button', { name: 'Notifikasi', exact: true })
  await bell.click()
  const panel = page.getByRole('region', { name: 'Daftar notifikasi' })
  await expect(panel).toBeFocused()
  await panel.getByRole('group', { name: 'Filter notifikasi' }).getByRole('button', { name: /Belum dibaca/ }).click()
  await expect(panel.getByRole('button', { name: /Notification/ })).toHaveCount(9)
  await panel.getByRole('searchbox', { name: 'Cari notifikasi' }).fill('Notification 23')
  await expect(panel.getByText('Kabar tidak ditemukan')).toBeVisible()
  await panel.getByRole('button', { name: 'Semua', exact: true }).click()
  await expect(panel.getByRole('button', { name: /Notification 23/ })).toHaveCount(1)
  await expect(bell).toContainText('22')
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(bell).toBeFocused()
})

test('notification panel fits viewport and has an explicit close action', async ({ page }) => {
  await mockNotifications(page)
  await page.goto('/dashboard')
  await page.getByRole('button', { name: 'Notifikasi', exact: true }).click()
  const panel = page.getByRole('region', { name: 'Daftar notifikasi' })
  await expect(panel.getByRole('heading', { name: 'Pusat Notifikasi' })).toBeVisible()
  const box = await panel.boundingBox()
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width)
  expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize().height)
  await panel.getByRole('button', { name: 'Tutup notifikasi' }).click()
  await expect(panel).toHaveCount(0)
})

test('badge counts all unread notifications and older pages remain accessible', async ({ page }) => {
  await mockNotifications(page)
  await page.goto('/dashboard')
  const bell = page.getByRole('button', { name: 'Notifikasi', exact: true })
  await expect(bell).toContainText('23')
  await bell.click()
  const panel = page.getByRole('region', { name: 'Daftar notifikasi' })
  await expect(panel.getByRole('button', { name: /Notification/ })).toHaveCount(10)
  await panel.getByRole('button', { name: 'Lihat notifikasi sebelumnya' }).click()
  await expect(panel.getByRole('button', { name: /Notification/ })).toHaveCount(20)
  await panel.getByRole('button', { name: 'Tandai semua dibaca' }).click()
  await expect(bell.locator('span')).toHaveCount(0)
})

test('ticket failure reconnects rather than permanently stopping live updates', async ({ page }) => {
  await page.clock.install()
  await mockNotifications(page)
  let attempts = 0
  await page.route('**/api/notifications/stream/ticket', route => ++attempts === 1
    ? route.fulfill({ status: 500, json: { error: 'server_error' } })
    : route.fulfill({ json: { ticket: 'retry-ticket' } }))
  await page.goto('/dashboard')
  await expect.poll(() => attempts).toBe(1)
  await page.clock.fastForward(2500)
  await expect.poll(() => attempts).toBe(2)
  await expect.poll(() => page.evaluate(() => globalThis.__streams.length)).toBe(1)
})

test('polling recovers new notifications when streaming is unavailable', async ({ page }) => {
  await page.clock.install()
  await page.addInitScript(() => { globalThis.EventSource = undefined })
  const state = await mockNotifications(page)
  await page.goto('/dashboard')
  const bell = page.getByRole('button', { name: 'Notifikasi', exact: true })
  await expect(bell).toContainText('23')
  state.unread = 24
  state.rows.unshift({ id: 24, title: 'Approval received', is_read: false })
  await page.clock.fastForward(31000)
  await expect(bell).toContainText('24')
})

test('duplicate stream events do not duplicate notifications', async ({ page }) => {
  const state = await mockNotifications(page)
  await page.goto('/dashboard')
  await expect.poll(() => page.evaluate(() => globalThis.__streams.length)).toBe(1)
  const item = { id: 24, title: 'New decision', message: 'Approved', is_read: false, created_at: '2026-11-09T12:01:00Z' }
  state.rows.unshift(item); state.unread = 24
  await page.evaluate(item => {
    const source = globalThis.__streams[0]
    source.onmessage({ data: JSON.stringify(item) })
    source.onmessage({ data: JSON.stringify(item) })
  }, item)
  const bell = page.getByRole('button', { name: 'Notifikasi', exact: true })
  await expect(bell).toContainText('24')
  await bell.click()
  await expect(page.getByRole('region', { name: 'Daftar notifikasi' }).getByRole('button', { name: /New decision/ })).toHaveCount(1)
})

test('failed read update preserves unread state and exposes retry feedback', async ({ page }) => {
  await mockNotifications(page)
  await page.route('**/api/notifications/*/read', route => route.fulfill({ status: 500, json: { error: 'server_error' } }))
  await page.goto('/dashboard')
  const bell = page.getByRole('button', { name: 'Notifikasi', exact: true })
  await expect(bell).toContainText('23'); await bell.click()
  const panel = page.getByRole('region', { name: 'Daftar notifikasi' })
  await panel.getByRole('button', { name: 'Tandai semua dibaca' }).click()
  await expect(panel.getByRole('alert')).toContainText('Gagal menandai notifikasi.')
  await expect(bell).toContainText('23')
})

test('logout discards a pending stream connection and clears account data', async ({ page }) => {
  await mockNotifications(page)
  let release, requested = false
  await page.route('**/api/notifications/stream/ticket', async route => {
    requested = true
    await new Promise(resolve => { release = resolve })
    await route.fulfill({ json: { ticket: 'stale-ticket' } })
  })
  await page.goto('/dashboard')
  await expect.poll(() => requested).toBe(true)
  await page.evaluate(async () => {
    const { useAuthStore } = await import('/src/stores/auth.js')
    await useAuthStore().logout()
  })
  await expect(page).toHaveURL(/\/login$/)
  release()
  const count = await page.evaluate(async () => {
    const { useNotificationStore } = await import('/src/stores/notification.js')
    return { unread: useNotificationStore().unreadCount, records: useNotificationStore().notifications.length }
  })
  expect(count).toEqual({ unread: 0, records: 0 })
  await expect.poll(() => page.evaluate(() => globalThis.__streams.length)).toBe(0)
})
