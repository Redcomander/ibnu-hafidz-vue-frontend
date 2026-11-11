import { test, expect } from '@playwright/test'

async function setup(page, role, capabilities = {}) {
  await page.route('http://127.0.0.1:4173/api/**', route => route.fulfill({ json: {} }))
  await page.route('**/api/auth/refresh', route => route.fulfill({ json: {
    access_token: 'test', user: { id: 4, name: 'Petugas', roles: [{ name: role, permissions: [{ name: 'dashboard.view' }] }] },
  } }))
  await page.route('**/api/maintenance', route => route.fulfill({ json: { enabled: false } }))
  await page.route('**/api/halaqoh/assignments*', route => route.fulfill({ json: {
    groups: [{ teacher_id: 1, teacher_name: 'Guru Halaqoh', assignments: [{ id: 1, student: { id: 1, nama_lengkap: 'Santri' } }] }],
    access_infos: [{ teacher_id: 1, can_access_attendance: true, can_manage: false, ...capabilities }],
    current_user_id: 4, substitute_infos: [], badges: [], session_times: {},
  } }))
  await page.goto('/dashboard/halaqoh-assignments')
}

test('tim presensi sees attendance and substitute actions without membership editing', async ({ page }) => {
  await setup(page, 'tim_presensi', { can_submit_teacher_attendance: true, can_assign_substitute: true })
  await expect(page.getByRole('button', { name: 'Absen Guru', exact: true })).toBeVisible()
  await expect(page.locator('button[title="Guru Pengganti"]')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Edit Penugasan', exact: true })).toHaveCount(0)
})

test('tim presensi actions remain available with an older backend response', async ({ page }) => {
  await setup(page, 'tim_presensi')
  await expect(page.getByRole('button', { name: 'Absen Guru', exact: true })).toBeVisible()
  await expect(page.locator('button[title="Guru Pengganti"]')).toBeVisible()
})

test('ordinary teacher cannot access attendance management actions', async ({ page }) => {
  await setup(page, 'guru', { can_submit_teacher_attendance: false, can_assign_substitute: false })
  await expect(page.getByText('Guru Halaqoh', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Absen Guru', exact: true })).toHaveCount(0)
  await expect(page.locator('button[title="Guru Pengganti"]')).toHaveCount(0)
})
