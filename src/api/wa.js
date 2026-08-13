import api from '@/api'

export async function fetchWAStatus(signal) {
  const { data } = await api.get('/wa/status', signal ? { signal } : undefined)
  return data
}

export async function fetchWAQRCode(signal) {
  const { data } = await api.get('/wa/qr', signal ? { signal } : undefined)
  return data
}

export async function disconnectWA(signal) {
  const { data } = await api.post('/wa/disconnect', undefined, signal ? { signal } : undefined)
  return data
}

export async function sendWAMessage(payload = {}, signal) {
  const { data } = await api.post('/wa/send', payload, signal ? { signal } : undefined)
  return data
}
