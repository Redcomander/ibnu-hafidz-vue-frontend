import { test, expect } from '@playwright/test'
async function setup(page) {
 await page.context().route('**/api/laundry/export/**', route => route.fulfill({ contentType: 'text/plain', body: 'export fixture' }))
 await page.route('http://127.0.0.1:4173/api/**', route => route.fulfill({ json: {} }))
 await page.route('**/api/auth/refresh', route => route.fulfill({ json: { access_token: 'test', user: { id: 1, name: 'Admin', roles: [{ name: 'super_admin', permissions: [{ name: 'dashboard.view' }, { name: 'laundry_accounts.view' }, { name: 'laundry_accounts.create' }, { name: 'laundry_accounts.delete' }] }] } } }))
 await page.route('**/api/maintenance', route => route.fulfill({ json: { enabled: false } }))
 await page.route('**/api/laundry/vendors?*', route => {
  const pageNumber = new URL(route.request().url()).searchParams.get('page')
  return route.fulfill({ json: { data: pageNumber === '2' ? [{ id: 2, name: 'Vendor B', gender_type: 'banat' }] : [{ id: 1, name: 'Vendor A', gender_type: 'banin' }], total_pages: 2 } })
 })
 await page.route('**/api/laundry/accounts?*', route => {
  const vendor = new URL(route.request().url()).searchParams.get('vendor_id')
  return route.fulfill({ json: { data: [{ id: vendor === '2' ? 2 : 1, nomor_laundry: vendor === '2' ? 'B-001' : 'A-001', owner_name: 'Ahmad', owner_type: 'Siswa', vendor: { name: vendor === '2' ? 'Vendor B' : 'Vendor A', gender_type: 'banin' }, monthly_weight: 2, monthly_exceeded: false }], total: 41, total_pages: 3 } })
 })
}
test('vendor filter loads all pages, resets pagination, and follows exports', async ({ page }) => {
 await setup(page)
 await page.goto('/dashboard/laundry/accounts')
 const filter = page.getByLabel('Vendor laundry', { exact: true })
 await expect(filter.locator('option')).toHaveCount(3)
 await page.getByRole('button', { name: 'Halaman berikutnya', exact: true }).click()
 await expect(page.getByText('Halaman 2 dari 3')).toBeVisible()
 const requested = page.waitForRequest(request => {
  const url = new URL(request.url()); return url.pathname === '/api/laundry/accounts' && url.searchParams.get('vendor_id') === '2' && url.searchParams.get('page') === '1'
 })
 await filter.selectOption('2')
 await requested
 await expect(page.getByText('B-001', { exact: true }).filter({ visible: true })).toBeVisible()
 const popup = page.waitForEvent('popup')
 await page.getByRole('button', { name: 'Print PDF', exact: true }).click()
 const exportPage = await popup
 await expect.poll(() => exportPage.url()).toContain('vendor_id=2')
 await exportPage.close()
 await filter.selectOption('')
 await expect(page.getByText('A-001', { exact: true }).filter({ visible: true })).toBeVisible()
})
test('laundry surfaces and teleported account form follow app dark mode', async ({ page }) => {
 await setup(page)
 await page.addInitScript(() => localStorage.setItem('theme', 'dark'))
 await page.goto('/dashboard/laundry/accounts')
 await expect(page.getByRole('heading', { name: 'Manajemen Akun Laundry' })).toHaveCSS('color', 'rgb(241, 245, 249)')
 await expect(page.locator('.laundry-page')).toHaveCSS('background-color', 'rgb(11, 17, 32)')
 await expect(page.getByLabel('Vendor laundry', { exact: true })).toHaveCSS('color-scheme', 'dark')
 await page.getByRole('button', { name: 'Tambah Akun', exact: true }).click()
 await expect(page.locator('.laundry-dialog')).toBeVisible()
 await expect(page.locator('.laundry-dialog')).toHaveCSS('background-color', 'rgb(17, 24, 39)')
 await page.screenshot({ path: test.info().outputPath('laundry-dark-modal.png'), fullPage: true })
 await page.keyboard.press('Escape')
 await page.getByRole('button', { name: 'Aktifkan tema terang' }).click()
 await expect(page.locator('.laundry-page')).not.toHaveCSS('background-color', 'rgb(11, 17, 32)')
})

test('other laundry pages follow the same dark theme', async ({ page }) => {
 await setup(page)
 await page.addInitScript(() => localStorage.setItem('theme', 'dark'))
 for (const [path, title] of [['vendors', 'Vendor Laundry'], ['transactions', 'Transaksi Laundry'], ['pickups', 'Pengambilan Laundry'], ['accounts/trash', 'Tong Sampah Akun Laundry']]) {
  await page.goto(`/dashboard/laundry/${path}`)
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
  await expect(page.locator('.laundry-page')).toHaveCSS('background-color', 'rgb(11, 17, 32)')
 }
})
