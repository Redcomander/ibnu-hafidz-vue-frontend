import axios from 'axios'

let refreshPromise = null

// A rotating refresh token must not be submitted concurrently. Share requests
// within the tab, and use a same-origin Web Lock across tabs where supported.
export function refreshSession() {
  if (!refreshPromise) {
    const request = () => axios.post('/api/auth/refresh', null, { withCredentials: true })
    const locks = globalThis.navigator?.locks
    refreshPromise = Promise.resolve()
      .then(() => locks ? locks.request('ibnu-auth-refresh', request) : request())
      .then(({ data }) => data)
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}
