import { test, expect } from '@playwright/test'
const release = { latest_version: '1.0.3', latest_version_code: 15, file_size: 59589635, changelog: 'Perbaikan halaqoh', download_url: 'https://ibnuhafidz.ponpes.id/api/app/download/15' }
test('public permanent page checks latest release again before download without login', async ({ page }) => {
 let requests = 0
 await page.route('**/api/app/version?*', route => { requests++; return route.fulfill({ json: requests === 1 ? release : { ...release, latest_version_code: 16, download_url: 'https://ibnuhafidz.ponpes.id/api/app/download/16' } }) })
 await page.route('https://ibnuhafidz.ponpes.id/api/app/download/16', route => route.fulfill({ contentType: 'text/plain', body: 'latest APK' }))
 await page.goto('/download-app')
 await expect(page.getByText('Versi 1.0.3', { exact: true })).toBeVisible()
 expect(await page.locator('main').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
 await page.getByRole('button', { name: 'Download APK Android' }).click()
 await expect(page).toHaveURL('https://ibnuhafidz.ponpes.id/api/app/download/16')
 expect(requests).toBe(2)
})
test('empty releases and network failure allow retry without a broken download', async ({ page }) => {
 await page.route('**/api/app/version?*', route => route.fulfill({ status: 503, body: 'unavailable' }))
 await page.goto('/download-app')
 await expect(page.getByRole('alert')).toContainText('Tidak dapat memeriksa rilis')
 await expect(page.getByRole('button', { name: 'Download APK Android' })).toHaveCount(0)
 await page.route('**/api/app/version?*', route => route.fulfill({ json: { latest_version_code: 0, download_url: '' } }))
 await page.getByRole('button', { name: 'Coba lagi' }).click()
 await expect(page.getByText('Belum ada aplikasi yang dipublikasikan. Silakan kembali nanti.')).toBeVisible()
 await page.reload()
 await expect(page.getByText('Belum ada aplikasi yang dipublikasikan. Silakan kembali nanti.')).toBeVisible()
})
