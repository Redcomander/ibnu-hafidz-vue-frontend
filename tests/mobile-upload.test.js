import test from 'node:test'
import assert from 'node:assert/strict'
import { APK_UPLOAD_TIMEOUT_MS, uploadDuration, uploadFailure } from '../src/views/mobile-app/upload-feedback.js'

test('slow upload timeout identifies application deadline without claiming internet is offline', () => {
 const result = uploadFailure({ code: 'ECONNABORTED' }, { elapsedMs: APK_UPLOAD_TIMEOUT_MS, progress: 70 })
 assert.match(result.title, /Batas waktu/)
 assert.match(result.detail, /30:00.*70%.*Timeout aplikasi/)
 assert.match(result.advice, /Muat ulang riwayat/)
 assert.equal(uploadDuration(61000), '1:01')
})
test('hosting HTML errors explain status rather than displaying HTML or a generic connection message', () => {
 for (const status of [408, 502, 504, 524]) {
  const result = uploadFailure({ response: { status, data: '<html>Gateway timeout</html>' } })
  assert.match(result.title, /Hosting/)
  assert.match(result.detail, new RegExp(`HTTP ${status}`))
  assert.doesNotMatch(result.message, /<html>/)
 }
 assert.match(uploadFailure({ response: { status: 403, data: '<html>Denied</html>' } }).message, /Imunify360/)
 assert.match(uploadFailure({ response: { status: 413, data: '' } }).message, /ukuran request/)
})
test('backend validation and request IDs survive error reporting without exposing arbitrary response HTML', () => {
 const result = uploadFailure({ response: { status: 422, headers: { 'x-request-id': 'abc-123' }, data: { message: 'Sertifikat tidak cocok' } } })
 assert.equal(result.message, 'Sertifikat tidak cocok')
 assert.match(result.detail, /abc-123/)
 assert.doesNotMatch(result.advice, /mungkin sudah/)
 assert.doesNotMatch(uploadFailure({ response: { status: 500, headers: { 'x-request-id': '<html>' } } }).detail, /<html>/)
})
test('cancel and lost responses advise checking server state before manual retry', () => {
 assert.match(uploadFailure({ code: 'ERR_CANCELED' }).title, /dibatalkan/)
 const result = uploadFailure({ code: 'ERR_NETWORK' })
 assert.match(result.message, /proxy/)
 assert.match(result.detail, /Tanpa respons HTTP/)
 assert.match(result.advice, /pastikan build belum tersimpan/)
})
