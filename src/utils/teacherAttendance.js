// Preserve historical records while presenting one name for teacher duty.
export function normalizeTeacherDutyStatus(status) {
  const value = String(status || '').trim()
  return ['dinas', 'dinas luar'].includes(value.toLowerCase()) ? 'Dinas' : value
}
