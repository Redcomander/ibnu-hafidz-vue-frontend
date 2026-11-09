import { test, expect } from '@playwright/test'

const id = 'a'.repeat(32)
const event = {
  id, request_id: id, created_at: '2026-11-09T12:00:00Z', method: 'POST', route: '/api/students',
  status: 500, severity: 'error', kind: 'http_5xx', duration_ms: 125, summary: 'Server request failed.',
  fingerprint: 'sample-group', handler: 'handlers.StudentHandler.Create', activity_log_id: 41,
  frames: ['handlers.StudentHandler.Create (student.go:42)'], resolved: false,
}

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173(?:\/|$))/, route => route.abort())
  await page.route('http://127.0.0.1:4173/api/**', route => route.fulfill({ status: 401, json: { error: 'unauthorized' } }))
  await page.route('**/api/maintenance', route => route.fulfill({ json: { enabled: false } }))
  await page.route('**/api/notifications?*', route => route.fulfill({ json: { data: [] } }))
  await page.route('**/api/notifications/stream/ticket', route => route.fulfill({ json: {} }))
  await page.route('**/api/sidebar-menu-settings', route => route.fulfill({ json: { menu_settings: [] } }))
  await page.route('**/api/dashboard/stats?*', route => route.fulfill({ json: {} }))
  await page.route('**/api/feature-flags/ramadhan', route => route.fulfill({ json: { is_enabled: false } }))
})

async function auth(page, role = 'super_admin') {
  await page.route('**/api/auth/refresh', route => route.fulfill({ json: {
    access_token: 'test-token', user: { id: 1, name: 'Operator', email: 'test@example.test',
      roles: [{ name: role, permissions: [{ name: 'dashboard.view' }, { name: 'users.view' }] }] },
  } }))
}

async function mockLogs(page) {
  const state = { event: { ...event }, settings: { debug_enabled: false, storage_healthy: true, max_events: 1000, retention_days: 7 } }
  await page.route('**/api/system-logs**', route => {
    const url = new URL(route.request().url())
    if (route.request().method() === 'PUT') {
      if (url.pathname.endsWith('/debug')) state.settings.debug_enabled = route.request().postDataJSON().enabled
      else state.event.resolved = route.request().postDataJSON().resolved
      return route.fulfill({ json: state.settings })
    }
    const matches = !url.searchParams.get('search') || url.searchParams.get('search') === id
    return route.fulfill({ json: { data: matches ? [state.event] : [], total: matches ? 1 : 0, total_pages: 1,
      summary: { errors: 1, warnings: 0, unresolved: state.event.resolved ? 0 : 1 }, settings: state.settings } })
  })
  return state
}

test('operator inspects diagnostics and manages debug and incident status', async ({ page }) => {
  await auth(page)
  const state = await mockLogs(page)
  await page.goto('/dashboard/request-logs')
  await expect(page.getByText('POST /api/students', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Detail kejadian' }).click()
  const dialog = page.getByRole('dialog', { name: 'Detail diagnostik' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText(id, { exact: true })).toBeVisible()
  await expect(dialog.getByText('handlers.StudentHandler.Create (student.go:42)', { exact: true })).toBeVisible()
  await dialog.getByRole('button', { name: 'Tutup', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await page.getByRole('button', { name: 'Aktifkan debug 15 menit' }).click()
  await expect(page.getByRole('button', { name: 'Matikan debug' })).toBeVisible()
  expect(state.settings.debug_enabled).toBe(true)
  await page.getByRole('button', { name: 'Tandai ditangani' }).click()
  await expect(page.getByRole('button', { name: 'Buka kembali' })).toBeVisible()
  expect(state.event.resolved).toBe(true)
  await page.getByRole('button', { name: 'Buka kembali' }).click()
  await expect(page.getByRole('button', { name: 'Tandai ditangani' })).toBeVisible()
})

test('filters search request IDs and display an empty state', async ({ page }) => {
  await auth(page); await mockLogs(page)
  await page.goto('/dashboard/request-logs')
  await expect(page.getByText('POST /api/students', { exact: true })).toBeVisible()
  await page.getByRole('textbox', { name: 'Cari diagnostik' }).fill('missing')
  await expect(page.getByText('Tidak ada kejadian yang cocok.', { exact: true })).toBeVisible()
  await page.getByRole('textbox', { name: 'Cari diagnostik' }).fill(id)
  await expect(page.getByText('POST /api/students', { exact: true })).toBeVisible()
})

test('ordinary administrators cannot open production diagnostics', async ({ page }) => {
  await auth(page, 'admin')
  let requests = 0
  await page.route('**/api/system-logs**', route => { requests++; return route.fulfill({ json: {} }) })
  await page.goto('/dashboard/request-logs')
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Selamat Datang, Operator!' })).toBeVisible()
  expect(requests).toBe(0)
})

test('failed debug update reports failure without claiming activation', async ({ page }) => {
  await auth(page); await mockLogs(page)
  await page.route('**/api/system-logs/debug', route => route.fulfill({ status: 503, json: { error: 'server_error' } }))
  await page.goto('/dashboard/request-logs')
  await page.getByRole('button', { name: 'Aktifkan debug 15 menit' }).click()
  await expect(page.getByRole('alert')).toContainText('Gagal mengubah mode debug.')
  await expect(page.getByRole('button', { name: 'Aktifkan debug 15 menit' })).toBeEnabled()
})

test('server failures show a request ID that users can report', async ({ page }) => {
  await page.route('**/api/auth/refresh', route => route.fulfill({ status: 401, json: {} }))
  await page.route('**/api/public/articles?*', route => route.fulfill({ status: 500, headers: { 'X-Request-ID': id }, json: { error: 'server_error', message: 'Internal Server Error' } }))
  await page.goto('/all-article')
  await expect(page.getByRole('alert')).toContainText(id)
  await page.getByRole('button', { name: 'Tutup laporan error' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
})
