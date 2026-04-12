import api from '@/api'

export async function searchPublicArrivalEntries(token, target, query, gender) {
  const { data } = await api.get(`/public/arrivals/${token}/search`, {
    params: { target, query, gender },
  })
  return data?.data || []
}

export async function submitPublicArrival(token, payload) {
  const { data } = await api.post(`/public/arrivals/${token}/submit`, payload)
  return data || {}
}

export async function fetchArrivalDashboard(date, gender = '') {
  const { data } = await api.get('/arrivals/dashboard', {
    params: { date, gender },
  })
  return data || {}
}

export async function updateArrivalDeadline(studentDeadlineAt) {
  const { data } = await api.post('/arrivals/deadline', {
    student_deadline_at: studentDeadlineAt || null,
  })
  return data || {}
}

export async function resetStudentArrivals() {
  const { data } = await api.post('/arrivals/reset-students')
  return data || {}
}
