import api from '@/api'

const base = '/revitalisasi-smp'

export async function fetchRevitalisasiSmpTukang(params = {}) {
  const { data } = await api.get(`${base}/tukang`, { params })
  return data
}

export async function createRevitalisasiSmpTukang(payload) {
  const { data } = await api.post(`${base}/tukang`, payload)
  return data
}

export async function updateRevitalisasiSmpTukang(id, payload) {
  const { data } = await api.put(`${base}/tukang/${id}`, payload)
  return data
}

export async function deleteRevitalisasiSmpTukang(id) {
  const { data } = await api.delete(`${base}/tukang/${id}`)
  return data
}

export async function fetchRevitalisasiSmpAbsen(params = {}) {
  const { data } = await api.get(`${base}/absen-tukang`, { params })
  return data
}

export async function createRevitalisasiSmpAbsen(formData) {
  const { data } = await api.post(`${base}/absen-tukang`, formData)
  return data
}

export async function updateRevitalisasiSmpAbsen(id, formData) {
  const { data } = await api.put(`${base}/absen-tukang/${id}`, formData)
  return data
}

export async function deleteRevitalisasiSmpAbsen(id) {
  const { data } = await api.delete(`${base}/absen-tukang/${id}`)
  return data
}

export async function fetchRevitalisasiSmpNotaMaterial(params = {}) {
  const { data } = await api.get(`${base}/nota-material`, { params })
  return data
}

export async function createRevitalisasiSmpNotaMaterial(formData) {
  const { data } = await api.post(`${base}/nota-material`, formData)
  return data
}

export async function updateRevitalisasiSmpNotaMaterial(id, formData) {
  const { data } = await api.put(`${base}/nota-material/${id}`, formData)
  return data
}

export async function deleteRevitalisasiSmpNotaMaterial(id) {
  const { data } = await api.delete(`${base}/nota-material/${id}`)
  return data
}

export async function fetchRevitalisasiSmpNotaMasuk(params = {}) {
  const { data } = await api.get(`${base}/nota-masuk`, { params })
  return data
}

export async function createRevitalisasiSmpNotaMasuk(formData) {
  const { data } = await api.post(`${base}/nota-masuk`, formData)
  return data
}

export async function updateRevitalisasiSmpNotaMasuk(id, formData) {
  const { data } = await api.put(`${base}/nota-masuk/${id}`, formData)
  return data
}

export async function deleteRevitalisasiSmpNotaMasuk(id) {
  const { data } = await api.delete(`${base}/nota-masuk/${id}`)
  return data
}

export async function fetchRevitalisasiSmpMaterialDatang(params = {}) {
  const { data } = await api.get(`${base}/material-datang`, { params })
  return data
}

export async function createRevitalisasiSmpMaterialDatang(formData) {
  const { data } = await api.post(`${base}/material-datang`, formData)
  return data
}

export async function updateRevitalisasiSmpMaterialDatang(id, formData) {
  const { data } = await api.put(`${base}/material-datang/${id}`, formData)
  return data
}

export async function deleteRevitalisasiSmpMaterialDatang(id) {
  const { data } = await api.delete(`${base}/material-datang/${id}`)
  return data
}

export async function fetchRevitalisasiSmpProgres(params = {}) {
  const { data } = await api.get(`${base}/progres-pembangunan`, { params })
  return data
}

export async function createRevitalisasiSmpProgres(formData) {
  const { data } = await api.post(`${base}/progres-pembangunan`, formData)
  return data
}

export async function updateRevitalisasiSmpProgres(id, formData) {
  const { data } = await api.put(`${base}/progres-pembangunan/${id}`, formData)
  return data
}

export async function deleteRevitalisasiSmpProgres(id) {
  const { data } = await api.delete(`${base}/progres-pembangunan/${id}`)
  return data
}

export async function fetchRevitalisasiSmpPrioritas(params = {}) {
  const { data } = await api.get(`${base}/prioritas`, { params })
  return data
}

export async function createRevitalisasiSmpPrioritas(payload) {
  const { data } = await api.post(`${base}/prioritas`, payload)
  return data
}

export async function updateRevitalisasiSmpPrioritas(id, payload) {
  const { data } = await api.put(`${base}/prioritas/${id}`, payload)
  return data
}

export async function deleteRevitalisasiSmpPrioritas(id) {
  const { data } = await api.delete(`${base}/prioritas/${id}`)
  return data
}
