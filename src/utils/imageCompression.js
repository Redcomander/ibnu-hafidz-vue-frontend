function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Gagal memuat gambar'))
    image.src = url
  })
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      mimeType,
      quality,
    )
  })
}

export async function compressImageFile(file, options = {}) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file
  }

  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.8,
    maxSizeMB = 2,
  } = options

  const sourceUrl = URL.createObjectURL(file)

  try {
    const image = await loadImageFromUrl(sourceUrl)
    const originalWidth = image.naturalWidth || image.width
    const originalHeight = image.naturalHeight || image.height

    let targetWidth = originalWidth
    let targetHeight = originalHeight
    const scale = Math.min(1, maxWidth / originalWidth, maxHeight / originalHeight)

    if (scale < 1) {
      targetWidth = Math.max(1, Math.round(originalWidth * scale))
      targetHeight = Math.max(1, Math.round(originalHeight * scale))
    }

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight

    const context = canvas.getContext('2d')
    if (!context) {
      return file
    }

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, targetWidth, targetHeight)
    context.drawImage(image, 0, 0, targetWidth, targetHeight)

    const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    let outputQuality = quality
    let blob = await canvasToBlob(canvas, mimeType, outputQuality)

    if (!blob) {
      return file
    }

    let attempt = 0
    while (blob.size > maxSizeMB * 1024 * 1024 && attempt < 5) {
      outputQuality = Math.max(0.3, Number((outputQuality * 0.75).toFixed(2)))
      blob = await canvasToBlob(canvas, mimeType, outputQuality)
      attempt += 1
    }

    const extension = mimeType === 'image/png' ? 'png' : 'jpg'
    const safeName = (file.name || 'upload').replace(/\.[^/.]+$/, '') || 'upload'

    return new File([blob], `${safeName}.${extension}`, {
      type: mimeType,
      lastModified: Date.now(),
    })
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}

export function formatFileSize(bytes = 0) {
  if (!bytes) return '0 KB'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const size = bytes / 1024 ** index
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}
