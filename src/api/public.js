import api from '@/api'

export async function fetchPublicHome() {
  const { data } = await api.get('/public/home')
  return data?.data || {}
}

export async function fetchPublicProfile() {
  const { data } = await api.get('/public/profile')
  return data?.data || {}
}

export async function fetchPublicPrestasi(params = {}) {
  const { data } = await api.get('/public/prestasi', { params })
  return data?.data || {}
}

export async function fetchPublicGalleryPhoto(params = {}) {
  const { data } = await api.get('/public/gallery/photo', { params })
  return data?.data || {}
}

export async function fetchPublicGalleryVideo(params = {}) {
  const { data } = await api.get('/public/gallery/video', { params })
  return data?.data || {}
}
export async function fetchPublicArticles(params = {}) {
  const { data } = await api.get('/public/articles', { params })
  return data?.data || {}
}

export async function fetchPublicArticleDetail(slug) {
  const { data } = await api.get(`/public/articles/${slug}`)
  return data?.data || {}
}

export async function fetchPublicArticleComments(slug) {
  const { data } = await api.get(`/public/articles/${slug}/comments`)
  return data?.data || []
}

export async function createPublicArticleComment(slug, payload) {
  const { data } = await api.post(`/public/articles/${slug}/comments`, payload)
  return data?.data || {}
}

export async function replyPublicComment(commentId, payload) {
  const { data } = await api.post(`/public/comments/${commentId}/reply`, payload)
  return data?.data || {}
}

export async function likePublicComment(commentId) {
  const { data } = await api.post(`/public/comments/${commentId}/like`)
  return data?.data || {}
}
