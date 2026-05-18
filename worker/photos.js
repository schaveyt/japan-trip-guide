import { ok, created, noContent, badRequest, unauthorized, notFound, serverError } from './util.js'
import { getSession } from './auth.js'

const MAX_FILE_BYTES = 8 * 1024 * 1024

export async function handlePhotos(req, env, url) {
  const session = await getSession(req, env)
  const pathParts = url.pathname.split('/').filter(Boolean)
  // pathParts: ['api', 'photos'] | ['api', 'photos', ':id'] | ['api', 'photos', ':id', 'bytes']
  const photoId = pathParts[2]
  const subResource = pathParts[3]

  // GET /api/photos?entity_type=&entity_id=
  if (req.method === 'GET' && !photoId) {
    if (!session) return unauthorized()
    const entityType = url.searchParams.get('entity_type')
    const entityId = url.searchParams.get('entity_id')
    if (!entityType || !entityId) return badRequest('entity_type and entity_id required')
    const publishClause = session.role === 'traveler' ? '' : 'AND published = 1'
    const { results } = await env.DB.prepare(
      `SELECT id, entity_type, entity_id, mime, width, height, bytes, caption, author, published, created_at
       FROM photos WHERE entity_type = ? AND entity_id = ? ${publishClause} ORDER BY created_at ASC`
    ).bind(entityType, entityId).all()
    return ok({ photos: results })
  }

  // GET /api/photos/:id/bytes
  if (req.method === 'GET' && photoId && subResource === 'bytes') {
    if (!session) return unauthorized()
    const row = await env.DB.prepare('SELECT r2_key, mime, published FROM photos WHERE id = ?').bind(photoId).first()
    if (!row) return notFound('Photo not found')
    if (session.role === 'guest' && !row.published) return unauthorized('Photo not published')
    const obj = await env.PHOTOS.get(row.r2_key)
    if (!obj) return notFound('Photo data missing')
    return new Response(obj.body, {
      headers: {
        'Content-Type': row.mime,
        'Cache-Control': 'private, max-age=86400',
      },
    })
  }

  // POST /api/photos (multipart upload)
  if (req.method === 'POST' && !photoId) {
    if (!session || session.role !== 'traveler') return unauthorized()
    let formData
    try { formData = await req.formData() } catch { return badRequest('Expected multipart/form-data') }
    const file = formData.get('file')
    if (!file || !(file instanceof File)) return badRequest('file required')
    if (file.type.startsWith('video/')) return badRequest('Video uploads not supported')
    if (file.size > MAX_FILE_BYTES) return badRequest('File too large (max 8MB)')
    const entityType = formData.get('entity_type')
    const entityId = formData.get('entity_id')
    const caption = formData.get('caption') || null
    const published = formData.get('published') === 'true' ? 1 : 0
    const author = req.headers.get('X-Author') || 'traveler'
    if (!entityType || !entityId) return badRequest('entity_type and entity_id required')
    const id = crypto.randomUUID()
    const r2Key = `photos/${id}.jpg`
    const arrayBuffer = await file.arrayBuffer()
    try {
      await env.PHOTOS.put(r2Key, arrayBuffer, { httpMetadata: { contentType: 'image/jpeg' } })
    } catch {
      return serverError('Failed to store photo')
    }
    const now = Math.floor(Date.now() / 1000)
    try {
      await env.DB.prepare(
        'INSERT INTO photos (id, entity_type, entity_id, r2_key, mime, bytes, caption, author, published, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, entityType, entityId, r2Key, 'image/jpeg', file.size, caption, author, published, now).run()
    } catch {
      await env.PHOTOS.delete(r2Key).catch(() => {})
      return serverError('Failed to save photo record')
    }
    return created({ id, entity_type: entityType, entity_id: entityId, mime: 'image/jpeg', bytes: file.size, caption, author, published, created_at: now })
  }

  // PATCH /api/photos/:id
  if (req.method === 'PATCH' && photoId && !subResource) {
    if (!session || session.role !== 'traveler') return unauthorized()
    let body
    try { body = await req.json() } catch { return badRequest('Invalid JSON') }
    const existing = await env.DB.prepare('SELECT * FROM photos WHERE id = ?').bind(photoId).first()
    if (!existing) return notFound('Photo not found')
    const newCaption = body.caption !== undefined ? body.caption : existing.caption
    const newPublished = body.published !== undefined ? (body.published ? 1 : 0) : existing.published
    await env.DB.prepare('UPDATE photos SET caption = ?, published = ? WHERE id = ?')
      .bind(newCaption, newPublished, photoId).run()
    return ok({ ...existing, caption: newCaption, published: newPublished })
  }

  // DELETE /api/photos/:id
  if (req.method === 'DELETE' && photoId && !subResource) {
    if (!session || session.role !== 'traveler') return unauthorized()
    const existing = await env.DB.prepare('SELECT r2_key FROM photos WHERE id = ?').bind(photoId).first()
    if (!existing) return notFound('Photo not found')
    await env.DB.prepare('DELETE FROM photos WHERE id = ?').bind(photoId).run()
    await env.PHOTOS.delete(existing.r2_key).catch(() => {})
    return noContent()
  }

  return new Response('Method not allowed', { status: 405 })
}
