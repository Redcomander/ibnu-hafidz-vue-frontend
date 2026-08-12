import api from '@/api'

export async function fetchTagihanList(params = {}) {
  const { data } = await api.get('/tagihan', { params })
  return data
}

export async function fetchTagihanSumberOptions(params = {}) {
  const { data } = await api.get('/tagihan/sumber/options', { params })
  return data
}

export async function fetchTagihanDetail(id) {
  const { data } = await api.get(`/tagihan/${id}`)
  return data
}

export async function updateTagihan(id, payload) {
  const { data } = await api.put(`/tagihan/${id}`, payload)
  return data
}

export async function deleteTagihan(id) {
  const { data } = await api.delete(`/tagihan/${id}`)
  return data
}

export async function bulkDeleteTagihan(ids = []) {
  const { data } = await api.post('/tagihan/bulk-delete', { ids })
  return data
}

export async function deleteTagihanSource(source) {
  const { data } = await api.delete(`/tagihan/sumber/${encodeURIComponent(source)}`)
  return data
}

export async function updateTagihanStatus(id, payload) {
  const { data } = await api.patch(`/tagihan/${id}/status`, payload)
  return data
}

export async function importTagihanExcel(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/tagihan/import/excel', form)
  return data
}

export async function downloadTagihanImportTemplateExcel() {
  const response = await api.get('/tagihan/import/excel/template', { responseType: 'blob' })
  return response
}

export async function exportTagihanExcel(params = {}) {
  const response = await api.get('/tagihan/export/excel', { params, responseType: 'blob' })
  return response
}

export async function fetchTagihanSummary() {
  const { data } = await api.get('/tagihan/dashboard/summary')
  return data
}
