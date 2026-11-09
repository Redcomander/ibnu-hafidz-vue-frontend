import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { refreshSession } from './session'

// Create Axios instance configured for Go API
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true, // Send HttpOnly cookies for refresh token
})

// Request interceptor — attach access token from memory
api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }

  // Hindari data GET stale dari cache browser/proxy.
  if ((config.method || 'get').toLowerCase() === 'get') {
    config.headers['Cache-Control'] = 'no-cache'
    config.headers.Pragma = 'no-cache'
  }

  // Let browser set multipart boundary automatically for FormData.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

// Auth endpoints that should NEVER trigger the 401 retry logic
const AUTH_URLS = ['/auth/login', '/auth/refresh', '/auth/logout']

// Response interceptor — handle 401 with silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const requestUrl = originalRequest?.url || ''
    const requestId = error.response?.headers?.['x-request-id'] || error.response?.data?.request_id
    if (error.response?.status >= 500 && error.response?.data?.error !== 'maintenance' && requestId && !requestUrl.startsWith('/system-logs')) {
      globalThis.dispatchEvent(new CustomEvent('production-error', { detail: { requestId } }))
    }

    if (error.response?.status === 503 && error.response?.data?.error === 'maintenance') {
      const auth = useAuthStore()
      if (originalRequest && !originalRequest._maintenanceRetry && (auth.hasRole('admin') || auth.hasRole('super_admin'))) {
        originalRequest._maintenanceRetry = true
        try {
          const data = await refreshSession()
          auth.setAccessToken(data.access_token)
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`
          return api(originalRequest)
        } catch { /* Keep recovery login reachable if session renewal fails. */ }
      }
      globalThis.dispatchEvent(new CustomEvent('maintenance-required', { detail: error.response.data }))
      return Promise.reject(error)
    }

    // Skip retry for auth endpoints to prevent infinite loops
    const isAuthEndpoint = AUTH_URLS.some(url => requestUrl.includes(url))

    // If 401 on a non-auth endpoint and we haven't retried yet, attempt silent refresh
    // Handle both 401 (standard) and 400 with error==="unauthorized"
    // Some deployments/proxies convert 401 → 400 for security reasons
    const isUnauthorized =
      error.response?.status === 401 ||
      (error.response?.status === 400 && error.response?.data?.error === 'unauthorized')

    if (isUnauthorized && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      try {
        const data = await refreshSession()

        const auth = useAuthStore()

        // Store new access token in memory
        auth.setAccessToken(data.access_token)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed — clear state silently (don't call logout API)
        const auth = useAuthStore()
        auth.accessToken = null
        auth.user = null
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
