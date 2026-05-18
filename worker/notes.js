import { ok, created, noContent, badRequest, unauthorized, notFound } from './util.js'
import { getSession } from './auth.js'

export async function handleNotes(req, env, url) {
  const session = await getSession(req, env)
  const pathParts = url.pathname.split('/').filter(Boolean) // ['api', 'notes', ':id'?]
  const noteId = pathParts[2]

  if (req.method === 'GET') {
    if (!session) return unauthorized()
    const entityType = url.searchParams.get('entity_type')
    const entityId = url.searchParams.get('entity_id')
    if (!entityType || !entityId) return badRequest('entity_type and entity_id required')
    const publishClause = session.role === 'traveler' ? '' : 'AND published = 1'
    const { results } = await env.DB.prepare(
      `SELECT * FROM notes WHERE entity_type = ? AND entity_id = ? ${publishClause} ORDER BY created_at ASC`
    ).bind(entityType, entityId).all()
    return ok({ notes: results })
  }

  if (req.method === 'POST') {
    if (!session || session.role !== 'traveler') return unauthorized()
    let body
    try { body = await req.json() } catch { return badRequest('Invalid JSON') }
    const { entity_type, entity_id, body: text, published } = body
    if (!entity_type || !entity_id || !text?.trim()) return badRequest('entity_type, entity_id, body required')
    if (text.length > 4000) return badRequest('Note too long (max 4000 chars)')
    const author = req.headers.get('X-Author') || 'traveler'
    const now = Math.floor(Date.now() / 1000)
    const id = crypto.randomUUID()
    await env.DB.prepare(
      'INSERT INTO notes (id, entity_type, entity_id, body, author, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, entity_type, entity_id, text.trim(), author, published ? 1 : 0, now, now).run()
    return created({ id, entity_type, entity_id, body: text.trim(), author, published: published ? 1 : 0, created_at: now, updated_at: now })
  }

  if (req.method === 'PATCH') {
    if (!session || session.role !== 'traveler') return unauthorized()
    if (!noteId) return badRequest('Note ID required')
    let body
    try { body = await req.json() } catch { return badRequest('Invalid JSON') }
    const existing = await env.DB.prepare('SELECT * FROM notes WHERE id = ?').bind(noteId).first()
    if (!existing) return notFound('Note not found')
    const newBody = body.body !== undefined ? body.body.trim() : existing.body
    const newPublished = body.published !== undefined ? (body.published ? 1 : 0) : existing.published
    const now = Math.floor(Date.now() / 1000)
    await env.DB.prepare('UPDATE notes SET body = ?, published = ?, updated_at = ? WHERE id = ?')
      .bind(newBody, newPublished, now, noteId).run()
    return ok({ ...existing, body: newBody, published: newPublished, updated_at: now })
  }

  if (req.method === 'DELETE') {
    if (!session || session.role !== 'traveler') return unauthorized()
    if (!noteId) return badRequest('Note ID required')
    const existing = await env.DB.prepare('SELECT id FROM notes WHERE id = ?').bind(noteId).first()
    if (!existing) return notFound('Note not found')
    await env.DB.prepare('DELETE FROM notes WHERE id = ?').bind(noteId).run()
    return noContent()
  }

  return new Response('Method not allowed', { status: 405 })
}
