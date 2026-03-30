export function normalizePublicMediaUrl(path, fallback = '/welcome2.JPG') {
  if (!path) return fallback

  const value = String(path).trim()
  if (!value) return fallback

  if (/^https?:\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  if (value.startsWith('/')) return value

  return '/' + value.replace(/^\/+/, '')
}
