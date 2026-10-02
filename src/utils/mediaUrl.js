export function normalizePublicMediaUrl(path, fallback = '/welcome2.JPG') {
  if (!path) return fallback

  const value = String(path).trim()
  if (!value) return fallback

  if (/^https?:\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  const normalized = value.replace(/\\/g, '/').replace(/^\.+\//, '').replace(/^\/+/, '')

  if (!normalized) return fallback

  if (normalized.startsWith('uploads/')) return `/${normalized}`
  if (normalized.startsWith('avatars/')) return `/uploads/${normalized}`
  if (normalized.startsWith('gallery/')) return `/uploads/${normalized}`
  if (normalized.startsWith('files/')) return `/uploads/${normalized}`

  return `/uploads/${normalized}`
}
