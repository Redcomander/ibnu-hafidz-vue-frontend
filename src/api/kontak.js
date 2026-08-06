import api from '@/api'

export async function fetchKontakList(params = {}) {
  const { data } = await api.get('/kontak', { params })
  return data
}

export async function fetchKontakDetail(id) {
  const { data } = await api.get(`/kontak/${id}`)
  return data
}

export async function updateKontak(id, payload) {
  const { data } = await api.put(`/kontak/${id}`, payload)
  return data
}

export async function deleteKontak(id) {
  const { data } = await api.delete(`/kontak/${id}`)
  return data
}

export async function bulkDeleteKontak(ids = []) {
  const { data } = await api.post('/kontak/bulk-delete', { ids })
  return data
}

export async function updateKontakStatus(id, payload) {
  const { data } = await api.patch(`/kontak/${id}/status`, payload)
  return data
}

export async function fetchWhatsAppLink(id, params = {}) {
  const { data } = await api.get(`/kontak/${id}/wa-link`, { params })
  return data
}

export async function fetchRiwayatKontak(kontakId) {
  const { data } = await api.get(`/riwayat/${kontakId}`)
  return data
}

export async function importKontakExcel(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/import/excel', form)
  return data
}

export async function downloadImportTemplateExcel() {
  const response = await api.get('/import/excel/template', {
    responseType: 'blob',
  })
  return response
}

export async function exportKontakExcel(params = {}) {
  const response = await api.get('/kontak/export/excel', {
    params,
    responseType: 'blob',
  })
  return response
}

export async function fetchTemplateList(params = {}) {
  const { data } = await api.get('/template', { params })
  return data
}

export async function createTemplate(payload) {
  const { data } = await api.post('/template', payload)
  return data
}

export async function updateTemplate(id, payload) {
  const { data } = await api.put(`/template/${id}`, payload)
  return data
}

export async function deleteTemplate(id) {
  const { data } = await api.delete(`/template/${id}`)
  return data
}

export async function fetchKontakSummary() {
  const { data } = await api.get('/dashboard/summary')
  return data
}
