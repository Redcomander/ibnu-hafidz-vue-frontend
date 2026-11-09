export function requestTypeLabel(type) {
  return ({ create: 'Penambahan santri', update: 'Perubahan daftar santri', delete_single: 'Penghapusan santri', delete_all: 'Penghapusan seluruh anggota' })[type] || 'Perubahan Halaqoh'
}

export function requestStatusLabel(status) {
  return ({ pending: 'Menunggu admin', approved: 'Disetujui', rejected: 'Ditolak' })[status] || 'Belum diketahui'
}

export function requestDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}
