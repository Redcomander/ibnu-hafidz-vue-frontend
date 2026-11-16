import { test, expect } from '@playwright/test'
async function setup(page) {
 await page.context().route('**/api/laundry/export/**', route => route.fulfill({ contentType: 'text/plain', body: 'export fixture' }))
 await page.route('http://127.0.0.1:4173/api/**', route => route.fulfill({ json: {} }))
 await page.route('**/api/auth/refresh', route => route.fulfill({ json: { access_token: 'test', user: { id: 1, name: 'Admin', roles: [{ name: 'super_admin', permissions: [{ name: 'dashboard.view' }, { name: 'laundry_accounts.view' }, { name: 'laundry_accounts.create' }, { name: 'laundry_accounts.delete' }, { name: 'laundry_accounts.edit' }] }] } } }))
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

test('transaction vendor filter keeps similarity counts and input names on desktop and mobile', async ({ page }) => {
 await setup(page)
 await page.route('**/api/laundry/transactions?*', route => {
  const vendor = new URL(route.request().url()).searchParams.get('vendor_id')
  return route.fulfill({ json: { total: 2, total_pages: 1, data: [
   { id: 1, tanggal: '2026-11-16', berat_kg: 2, status: 'pending', account: { nomor_laundry: vendor === '2' ? 'B-002' : 'A-002', student: { nama_lengkap: 'Ahmad' } }, same_day_count: 3, input_by: { id: 9, name: 'Petugas input' } },
   { id: 2, tanggal: '2026-11-17', berat_kg: 1, status: 'pending', account: { nomor_laundry: 'A-003', student: { nama_lengkap: 'Ahmad lain' } }, same_day_count: 1, input_by: null },
  ] } })
 })
 await page.goto('/dashboard/laundry/transactions')
 await expect(page.getByText('Petugas input', { exact: true }).filter({ visible: true })).toBeVisible()
 await expect(page.getByText('Belum tercatat', { exact: false }).filter({ visible: true })).toBeVisible()
 await expect(page.locator('.laundry-similar').filter({ visible: true })).toHaveCount(1)
 await expect(page.getByText('3 transaksi pada tanggal yang sama', { exact: true }).filter({ visible: true })).toBeVisible()
 await page.getByLabel('Vendor transaksi', { exact: true }).selectOption('2')
 await expect(page.getByText('B-002', { exact: true }).filter({ visible: true })).toBeVisible()
 await page.getByRole('button', { name: 'Tambah Transaksi', exact: true }).click()
 await expect(page.locator('.laundry-dialog')).toBeVisible()
 await page.keyboard.press('Escape')
 await page.locator('.laundry-page button[title="Hapus Transaksi"], .laundry-page button[title="Hapus"]').filter({ visible: true }).first().click()
 await expect(page.getByRole('dialog')).toContainText('Hapus Transaksi')
 await expect(page.locator('.laundry-dialog')).toBeVisible()
})

test('statistics, bulk create and shared transfer dialogs have dark surfaces', async ({ page }) => {
 await setup(page)
 await page.addInitScript(() => localStorage.setItem('theme', 'dark'))
 await page.route('**/api/laundry/vendors/statistics?*', route => route.fulfill({ json: { grand_total_kg: 10, grand_total_rupiah: 50000, vendors: [] } }))
 await page.goto('/dashboard/laundry/accounts')
 await page.getByRole('button', { name: 'Bulk Create', exact: true }).click()
 await expect(page.locator('.laundry-dialog')).toHaveCSS('background-color', 'rgb(17, 24, 39)')
 await page.keyboard.press('Escape')
 await page.goto('/dashboard/laundry/vendors')
 await page.getByRole('button', { name: 'Statistik Global', exact: true }).click()
 await expect(page.locator('.laundry-dialog div.bg-green-50')).toHaveCSS('background-color', 'rgb(18, 62, 48)')
 await expect(page.locator('.laundry-dialog div.bg-blue-50')).toHaveCSS('background-color', 'rgb(25, 44, 69)')
 await page.keyboard.press('Escape')
 await page.getByRole('button', { name: 'Gabung Vendor', exact: true }).click()
 await expect(page.locator('.laundry-dialog')).toHaveCSS('background-color', 'rgb(17, 24, 39)')
 await page.keyboard.press('Escape')
 await page.getByRole('button', { name: 'Transfer Akun Acak', exact: true }).click()
 await expect(page.locator('.laundry-dialog')).toHaveCSS('background-color', 'rgb(17, 24, 39)')
 await expect(page.getByRole('dialog')).toHaveCSS('opacity', '1')
 await page.screenshot({ path: test.info().outputPath('laundry-transfer-dark.png'), fullPage: true })
 await page.keyboard.press('Escape')
})
