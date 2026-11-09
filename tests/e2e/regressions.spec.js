import { test, expect } from '@playwright/test'

for (const name of ['article-html', 'diniyyah-schedule', 'halaqoh-membership', 'halaqoh-request-design', 'badal-mobile']) {
  test(`${name} browser regression`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173(?:\/|$))/, route => route.abort())
    // A forgotten mock must never reach the real backend.
    await page.route('http://127.0.0.1:4173/api/**', route => route.fulfill({ status: 401, json: { error: 'unauthorized' } }))
    await page.goto(`/tests/${name}.browser.html`)
    await expect(page.locator('#result')).toContainText('PASS', { timeout: 20000 })
    await expect(page).toHaveTitle('PASS')
    expect(errors).toEqual([])
  })
}
