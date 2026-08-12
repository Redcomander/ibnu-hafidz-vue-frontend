import api from '@/api'

export async function fetchWAStatus() {
  const { data } = await api.get('/wa/status')
  return data
}

export async function fetchWAQRCode() {
  const { data } = await api.get('/wa/qr')
  return data
}

export async function sendWAMessage(payload = {}) {
  const { data } = await api.post('/wa/send', payload)
  return data
}
