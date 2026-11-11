import { test, expect } from '@playwright/test'
const release = { id: 1, version_name: '1.2.0', version_code: 12, file_size: 3, status: 'draft', created_by: 1, uploader: { name: 'Super Admin' }, changelog: 'Perbaikan', sha256: 'a'.repeat(64), signer_sha256: 'b'.repeat(64), package_name: 'id.ponpes.ibnuhafidz.absensi' }
async function setup(page, role = 'super_admin') {
 await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173(?:\/|$))/, route => route.abort())
 await page.route('http://127.0.0.1:4173/api/**', route => route.fulfill({ json: {} }))
 await page.route('**/api/auth/refresh', route => route.fulfill({ json: { access_token: 'test', user: { id: 1, name: 'Super Admin', roles: [{ name: role, permissions: [{ name: 'dashboard.view' }] }] } } }))
 await page.route('**/api/maintenance', route => route.fulfill({ json: { enabled: false, can_bypass: true } }))
 await page.route('**/api/admin/app/releases?*', route => route.fulfill({ json: { data: [release], total: 1, policy: { current_release_id: null, highest_version_code: 0, minimum_supported_version_code: 0 }, upload_ready: true, max_file_size: 100000 } }))
}
test('super admin sees release page and explicitly confirms mandatory policy', async ({ page }) => {
 await setup(page); let publishes = 0
 await page.route('**/api/admin/app/releases/1/publish', route => { publishes++; expect(route.request().postDataJSON()).toEqual({ minimum_supported_version_code: 10 }); return route.fulfill({ json: { message: 'Rilis dipublikasikan' } }) })
 await page.goto('/dashboard/mobile-app/releases')
 await expect(page.getByRole('heading', { name: 'Rilis Aplikasi Mobile' })).toBeVisible()
 await page.getByRole('button', { name: 'Publikasikan', exact: true }).click()
 expect(publishes).toBe(0)
 await page.getByRole('spinbutton', { name: 'Build minimum yang didukung' }).fill('10')
 await expect(page.getByText('Pengguna dengan build di bawah 10 WAJIB memperbarui aplikasi.')).toBeVisible()
 await page.getByRole('button', { name: 'Konfirmasi publikasi' }).click()
 await expect.poll(() => publishes).toBe(1)
})
test('teacher cannot open release management', async ({ page }) => {
 await setup(page, 'teacher'); await page.goto('/dashboard/mobile-app/releases')
 await expect(page).toHaveURL(/\/dashboard$/)
 await expect(page.getByRole('heading', { name: 'Rilis Aplikasi Mobile' })).toHaveCount(0)
})
test('APK upload remains draft and malformed file is rejected in the browser', async ({ page }) => {
 await setup(page); let uploads = 0
 await page.route('**/api/admin/app/releases', route => { uploads++; expect(route.request().method()).toBe('POST'); expect(route.request().headers()['content-type']).toContain('multipart/form-data'); return route.fulfill({ status: 201, json: release }) })
 await page.goto('/dashboard/mobile-app/releases')
 await page.getByLabel('Berkas APK').setInputFiles({ name: 'wrong.txt', mimeType: 'text/plain', buffer: Buffer.from('bad') })
 await expect(page.getByRole('button', { name: 'Unggah sebagai draft' })).toBeDisabled(); expect(uploads).toBe(0)
 await page.getByLabel('Berkas APK').setInputFiles({ name: 'app.apk', mimeType: 'application/vnd.android.package-archive', buffer: Buffer.from('apk') })
 await page.getByRole('button', { name: 'Unggah sebagai draft' }).click()
 await expect.poll(() => uploads).toBe(1)
 await expect(page.getByText('APK tervalidasi dan disimpan sebagai draft. Belum dipublikasikan.')).toBeVisible()
})
