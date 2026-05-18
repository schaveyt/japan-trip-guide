const MAX_DIMENSION = 2048
const JPEG_QUALITY = 0.85

export async function resizeAndEncodeImage(file) {
  // imageOrientation: 'from-image' applies EXIF rotation automatically,
  // preventing sideways portraits on iOS. Canvas re-encode also strips all EXIF
  // (including GPS coordinates) — intentional privacy behavior.
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    bitmap = await createImageBitmap(file)
  }

  let { width, height } = bitmap
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: JPEG_QUALITY })
  return { blob, width, height }
}
