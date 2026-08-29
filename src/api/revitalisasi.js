import api from '@/api'

const base = '/revitalisasi'

export async function fetchRevitalisasiTukang(params = {}) {
  const { data } = await api.get(`${base}/tukang`, { params })
  return data
}

export async function createRevitalisasiTukang(payload) {
  const { data } = await api.post(`${base}/tukang`, payload)
  return data
}

export async function updateRevitalisasiTukang(id, payload) {
  const { data } = await api.put(`${base}/tukang/${id}`, payload)
  return data
}

export async function deleteRevitalisasiTukang(id) {
  const { data } = await api.delete(`${base}/tukang/${id}`)
  return data
}

export async function fetchRevitalisasiAbsen(params = {}) {
  const { data } = await api.get(`${base}/absen-tukang`, { params })
  return data
}

export async function createRevitalisasiAbsen(formData) {
  const { data } = await api.post(`${base}/absen-tukang`, formData)
  return data
}

export async function updateRevitalisasiAbsen(id, formData) {
  const { data } = await api.put(`${base}/absen-tukang/${id}`, formData)
  return data
}

export async function deleteRevitalisasiAbsen(id) {
  const { data } = await api.delete(`${base}/absen-tukang/${id}`)
  return data
}

export async function fetchRevitalisasiNotaMaterial(params = {}) {
  const { data } = await api.get(`${base}/nota-material`, { params })
  return data
}

export async function createRevitalisasiNotaMaterial(formData) {
  const { data } = await api.post(`${base}/nota-material`, formData)
  return data
}

export async function updateRevitalisasiNotaMaterial(id, formData) {
  const { data } = await api.put(`${base}/nota-material/${id}`, formData)
  return data
}

export async function deleteRevitalisasiNotaMaterial(id) {
  const { data } = await api.delete(`${base}/nota-material/${id}`)
  return data
}

export async function fetchRevitalisasiNotaMasuk(params = {}) {
  const { data } = await api.get(`${base}/nota-masuk`, { params })
  return data
}

export async function createRevitalisasiNotaMasuk(formData) {
  const { data } = await api.post(`${base}/nota-masuk`, formData)
  return data
}

export async function updateRevitalisasiNotaMasuk(id, formData) {
  const { data } = await api.put(`${base}/nota-masuk/${id}`, formData)
  return data
}

export async function deleteRevitalisasiNotaMasuk(id) {
  const { data } = await api.delete(`${base}/nota-masuk/${id}`)
  return data
}

export async function fetchRevitalisasiMaterialDatang(params = {}) {
  const { data } = await api.get(`${base}/material-datang`, { params })
  return data
}

export async function createRevitalisasiMaterialDatang(formData) {
  const { data } = await api.post(`${base}/material-datang`, formData)
  return data
}

export async function updateRevitalisasiMaterialDatang(id, formData) {
  const { data } = await api.put(`${base}/material-datang/${id}`, formData)
  return data
}

export async function deleteRevitalisasiMaterialDatang(id) {
  const { data } = await api.delete(`${base}/material-datang/${id}`)
  return data
}

export async function fetchRevitalisasiProgres(params = {}) {
  const { data } = await api.get(`${base}/progres-pembangunan`, { params })
  return data
}

export async function createRevitalisasiProgres(formData) {
  const { data } = await api.post(`${base}/progres-pembangunan`, formData)
  return data
}

export async function updateRevitalisasiProgres(id, formData) {
  const { data } = await api.put(`${base}/progres-pembangunan/${id}`, formData)
  return data
}

export async function deleteRevitalisasiProgres(id) {
  const { data } = await api.delete(`${base}/progres-pembangunan/${id}`)
  return data
}

export async function fetchRevitalisasiPrioritas(params = {}) {
  const { data } = await api.get(`${base}/prioritas`, { params })
  return data
}

export async function createRevitalisasiPrioritas(payload) {
  const { data } = await api.post(`${base}/prioritas`, payload)
  return data
}

export async function updateRevitalisasiPrioritas(id, payload) {
  const { data } = await api.put(`${base}/prioritas/${id}`, payload)
  return data
}

export async function deleteRevitalisasiPrioritas(id) {
  const { data } = await api.delete(`${base}/prioritas/${id}`)
  return data
}
