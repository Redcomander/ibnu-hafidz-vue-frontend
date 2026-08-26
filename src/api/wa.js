import api from '@/api'

function normalizeWAAccountType(value = 'shared') {
  const normalized = String(value || 'shared').trim().toLowerCase()
  if (normalized === 'personal') return 'personal'
  if (normalized === 'business' || normalized === 'bussiness') return 'business'
  return 'shared'
}

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

export async function fetchWAStatus(signal, accountType = 'shared') {
  const params = {
    account_type: normalizeWAAccountType(accountType),
  }
  const { data } = await api.get('/wa/status', signal ? { signal, params } : { params })
  return normalizeWAResponse(data)
}

export async function fetchWAQRCode(signal, accountType = 'shared') {
  const params = {
    account_type: normalizeWAAccountType(accountType),
  }
  const { data } = await api.get('/wa/qr', signal ? { signal, params } : { params })
  return normalizeWAResponse(data)
}

export async function disconnectWA(signal, accountType = 'shared') {
  const params = {
    account_type: normalizeWAAccountType(accountType),
  }
  const { data } = await api.post('/wa/disconnect', undefined, signal ? { signal, params } : { params })
  return normalizeWAResponse(data)
}

export async function sendWAMessage(payload = {}, signal) {
  const safePayload = {
    ...payload,
    account_type: normalizeWAAccountType(payload.account_type || 'shared'),
  }
  const { data } = await api.post('/wa/send', safePayload, signal ? { signal } : undefined)
  return normalizeWAResponse(data)
}
