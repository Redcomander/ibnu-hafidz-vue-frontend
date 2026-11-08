import test from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import { refreshSession } from '../src/api/session.js'

test('concurrent callers share one rotating refresh request; failures allow retry', async () => {
  const originalAdapter = axios.defaults.adapter
  let calls = 0
  let release
  axios.defaults.adapter = async (config) => {
    calls++
    assert.equal(config.url, '/api/auth/refresh')
    assert.equal(config.withCredentials, true)
    await new Promise(resolve => { release = resolve })
    return { data: { access_token: 'new-access' }, status: 200, config, headers: {} }
  }
  try {
    const first = refreshSession()
    const second = refreshSession()
    assert.equal(first, second)
    await new Promise(resolve => setTimeout(resolve, 0))
    assert.equal(calls, 1)
    release()
    assert.deepEqual(await first, { access_token: 'new-access' })
    assert.deepEqual(await second, { access_token: 'new-access' })

    axios.defaults.adapter = async () => { throw new Error('expired session') }
    await assert.rejects(refreshSession(), /expired session/)
    axios.defaults.adapter = async config => ({ data: { access_token: 'retry-access' }, status: 200, config, headers: {} })
    assert.deepEqual(await refreshSession(), { access_token: 'retry-access' })
  } finally {
    axios.defaults.adapter = originalAdapter
  }
})
