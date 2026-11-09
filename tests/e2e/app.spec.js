import { test, expect } from '@playwright/test'

const user = {
  id: 7, name: 'Test Teacher', username: 'teacher', email: 'teacher@example.test',
  roles: [{ name: 'teacher', permissions: [{ name: 'dashboard.view' }] }],
}
const session = { access_token: 'test-access-token', user }

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173(?:\/|$))/, route => route.abort())
  await page.route('http://127.0.0.1:4173/api/**', route => route.fulfill({
    status: 401, json: { error: 'unauthorized' },
  }))
})

async function mockDashboard(page) {
  await page.route('**/api/dashboard/stats?*', route => route.fulfill({ json: {} }))
  await page.route('**/api/feature-flags/ramadhan', route => route.fulfill({ json: { is_enabled: false } }))
  await page.route('**/api/notifications?*', route => route.fulfill({ json: { data: [], unread_count: 0 } }))
  await page.route('**/api/notifications/stream/ticket', route => route.fulfill({ json: {} }))
  await page.route('**/api/sidebar-menu-settings*', route => route.fulfill({ json: { menu_settings: [] } }))
}

async function fillLogin(page) {
  await page.locator('input[autocomplete="username"]').fill('teacher')
  await page.locator('input[autocomplete="current-password"]').fill('test-password')
}

test('protected deep link redirects to login and preserves destination', async ({ page }) => {
  await page.goto('/dashboard/students')
  await expect(page).toHaveURL(/\/login\?redirect=/)
  expect(new URL(page.url()).searchParams.get('redirect')).toBe('/dashboard/students')
  await expect(page.getByRole('heading', { name: 'Selamat Datang' })).toBeVisible()
})

test('empty login is blocked by browser validation', async ({ page }) => {
  let attempts = 0
  await page.route('**/api/auth/login', route => { attempts++; return route.fulfill({ json: session }) })
  await page.goto('/login')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  expect(await page.locator('form').evaluate(form => form.checkValidity())).toBe(false)
  expect(attempts).toBe(0)
  await expect(page).toHaveURL(/\/login$/)
})

test('invalid credentials display the server message and allow retry', async ({ page }) => {
  await page.route('**/api/auth/login', route => route.fulfill({ status: 401, json: { message: 'Username atau password salah' } }))
  await page.goto('/login')
  await fillLogin(page)
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByText('Username atau password salah', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Masuk', exact: true })).toBeEnabled()
  await expect(page).toHaveURL(/\/login$/)
})

test('successful login submits credentials and opens the dashboard', async ({ page }) => {
  await mockDashboard(page)
  await page.route('**/api/auth/login', async route => {
    expect(route.request().postDataJSON()).toEqual({ username: 'teacher', password: 'test-password' })
    await route.fulfill({ json: session })
  })
  await page.goto('/login')
  await fillLogin(page)
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.locator('#main-content')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Selamat Datang, Test Teacher!' })).toBeVisible()
})

test('refresh restores session and denies a page without permission', async ({ page }) => {
  await mockDashboard(page)
  await page.route('**/api/auth/refresh', route => route.fulfill({ json: session }))
  await page.goto('/dashboard/students')
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.locator('#main-content')).toBeVisible()
  await page.reload()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.locator('#main-content')).toBeVisible()
})

test('an expired access token refreshes and retries the failed request', async ({ page }) => {
  await mockDashboard(page)
  let refreshes = 0
  const headers = []
  await page.route('**/api/auth/refresh', route => {
    refreshes++
    return route.fulfill({ json: { ...session, access_token: `access-${refreshes}` } })
  })
  await page.route('**/api/dashboard/stats?*', route => {
    headers.push(route.request().headers().authorization)
    return headers.length === 1
      ? route.fulfill({ status: 401, json: { error: 'unauthorized' } })
      : route.fulfill({ json: {} })
  })
  await page.goto('/dashboard')
  await expect.poll(() => headers.length).toBe(2)
  expect(headers).toEqual(['Bearer access-1', 'Bearer access-2'])
  expect(refreshes).toBe(2)
  await expect(page.getByRole('heading', { name: 'Selamat Datang, Test Teacher!' })).toBeVisible()
  await expect(page.getByText('Gagal memuat statistik. Silakan coba lagi.', { exact: true })).toHaveCount(0)
})

test('unknown URL displays the 404 page', async ({ page }) => {
  await page.goto('/this-page-does-not-exist')
  await expect(page.getByRole('heading', { name: '404', exact: true })).toBeVisible()
  await expect(page.getByText('Halaman tidak ditemukan', { exact: true })).toBeVisible()
})

test('article search sends the query and renders matching and empty results', async ({ page }) => {
  await page.route('**/api/public/articles?*', route => {
    const search = new URL(route.request().url()).searchParams.get('search')
    return route.fulfill({ json: { data: {
      articles: search === 'missing' ? [] : [{ id: 1, slug: 'tahfidz', title: 'Program Tahfidz', content: '<p>Belajar Al Quran</p>' }],
      total_pages: 1,
    } } })
  })
  await page.goto('/all-article')
  await expect(page.getByRole('heading', { name: 'Program Tahfidz' })).toBeVisible()
  const response = page.waitForResponse(r => new URL(r.url()).searchParams.get('search') === 'missing')
  await page.getByPlaceholder('Cari artikel...').fill('missing')
  await response
  await expect(page.getByRole('heading', { name: 'Tidak Ada Artikel' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Program Tahfidz' })).toHaveCount(0)
})
