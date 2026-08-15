import api from '@/api'

function normalizeWAResponse(data = {}) {
  if (!data || typeof data !== 'object') {
    return data
  }

  const normalized = { ...data }
  delete normalized.user_id
  if (!normalized.session_key && normalized.connected_number) {
    normalized.session_key = 'shared'
  }

  return normalized
}

export async function fetchWAStatus(signal) {
  const { data } = await api.get('/wa/status', signal ? { signal } : undefined)
  return normalizeWAResponse(data)
}

export async function fetchWAQRCode(signal) {
  const { data } = await api.get('/wa/qr', signal ? { signal } : undefined)
  return normalizeWAResponse(data)
}

export async function disconnectWA(signal) {
  const { data } = await api.post('/wa/disconnect', undefined, signal ? { signal } : undefined)
  return normalizeWAResponse(data)
}

export async function sendWAMessage(payload = {}, signal) {
  const { data } = await api.post('/wa/send', payload, signal ? { signal } : undefined)
  return normalizeWAResponse(data)
}
