import { createApp, h } from 'vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

export function confirmDialog({
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  type = 'danger',
  maxWidth = 'md',
  loading = false,
} = {}) {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const app = createApp({
      name: 'GlobalConfirmDialog',
      data() {
        return {
          show: true,
        }
      },
      methods: {
        close(value) {
          this.show = false
          resolve(value)
          setTimeout(() => {
            try {
              app.unmount()
            } catch (error) {
              console.warn('Failed to unmount confirm dialog', error)
            }
            if (container.parentNode) {
              container.parentNode.removeChild(container)
            }
          }, 180)
        },
      },
      render() {
        return h(ConfirmModal, {
          show: this.show,
          title,
          message,
          confirmText,
          cancelText,
          type,
          loading,
          maxWidth,
          'onUpdate:show': (value) => {
            if (!value) {
              this.close(false)
            }
          },
          onConfirm: () => this.close(true),
          onCancel: () => this.close(false),
        })
      },
    })

    app.mount(container)
  })
}

export function confirmDelete({
  title = 'Hapus data',
  message = 'Apakah Anda yakin ingin menghapus data ini?',
  confirmText = 'Hapus',
} = {}) {
  return confirmDialog({ title, message, confirmText, cancelText: 'Batal', type: 'danger' })
}
