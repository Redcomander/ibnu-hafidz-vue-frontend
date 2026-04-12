import api from '@/api'

export async function fetchSidebarMenuSettings() {
  const { data } = await api.get('/sidebar-menu-settings')
  return data?.menu_settings || []
}

export async function updateSidebarMenuSettings(settings) {
  const { data } = await api.put('/sidebar-menu-settings', { settings })
  return data || {}
}