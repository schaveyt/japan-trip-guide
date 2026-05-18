import { useState, useEffect } from 'react'
import { useAuth } from '../../auth/useAuth'
import { RequireRole } from '../../auth/RequireRole'
import { api } from '../../lib/api'

const draftKey = (entityType, entityId) => `note-draft-${entityType}-${entityId}`

export function NotesList({ entityType, entityId }) {
  const { role } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState(() => localStorage.getItem(draftKey(entityType, entityId)) || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => {
    if (!role) { setLoading(false); return }
    api.get(`/api/notes?entity_type=${encodeURIComponent(entityType)}&entity_id=${encodeURIComponent(entityId)}`)
      .then(data => setNotes(data.notes))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false))
  }, [role, entityType, entityId])

  const saveDraft = (val) => {
    setDraft(val)
    const key = draftKey(entityType, entityId)
    val ? localStorage.setItem(key, val) : localStorage.removeItem(key)
  }

  const submitNote = async () => {
    if (!draft.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const note = await api.post('/api/notes', {
        entity_type: entityType, entity_id: entityId,
        body: draft.trim(), published: false,
      })
      setNotes(prev => [...prev, note])
      saveDraft('')
    } catch {
      setError('Failed to save. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const togglePublish = async (note) => {
    try {
      const updated = await api.patch(`/api/notes/${note.id}`, { published: !note.published })
      setNotes(prev => prev.map(n => n.id === note.id ? updated : n))
    } catch { /* silent */ }
  }

  const deleteNote = async (id) => {
    try {
      await api.delete(`/api/notes/${id}`)
      setNotes(prev => prev.filter(n => n.id !== id))
    } catch { /* silent */ }
  }

  if (!role) return null

  return (
    <div className="mt-6">
      <h4 className="text-xs uppercase tracking-widest text-muted mb-3 border-b border-ink/10 pb-2">
        Notes {notes.length > 0 && <span className="text-ink/40">· {notes.length}</span>}
      </h4>

      {loading && <p className="text-muted text-xs">Loading…</p>}

      {!loading && notes.length === 0 && role === 'traveler' && (
        <p className="text-muted text-xs mb-3">No notes yet.</p>
      )}

      {notes.map(note => (
        <div key={note.id} className="py-3 border-b border-ink/10 last:border-0">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-ink text-sm leading-relaxed">{note.body}</p>
              <p className="text-muted text-xs mt-1 capitalize">{note.author}</p>
            </div>
            <RequireRole role="traveler">
              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                <button
                  onClick={() => togglePublish(note)}
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border transition-colors ${
                    note.published
                      ? 'border-torii text-torii'
                      : 'border-ink/20 text-muted hover:border-ink/40'
                  }`}
                >
                  {note.published ? 'Published' : 'Private'}
                </button>
                <button onClick={() => deleteNote(note.id)} className="text-muted hover:text-ink transition-colors text-sm leading-none">×</button>
              </div>
            </RequireRole>
          </div>
        </div>
      ))}

      <RequireRole role="traveler">
        <div className="mt-3">
          <textarea
            value={draft}
            onChange={e => saveDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitNote() }}
            placeholder={online ? 'Add a note… (⌘↩ to save)' : 'Offline — notes unavailable'}
            disabled={!online || submitting}
            rows={2}
            className="w-full text-sm text-ink bg-transparent border border-ink/20 px-3 py-2 resize-none focus:outline-none focus:border-ink/60 placeholder:text-muted/50 disabled:opacity-50"
          />
          {error && <p className="text-torii text-xs mt-1">{error}</p>}
          <div className="flex justify-end mt-1">
            <button
              onClick={submitNote}
              disabled={!draft.trim() || submitting || !online}
              className="text-xs uppercase tracking-wider px-3 py-1.5 border border-ink/20 text-ink hover:border-ink/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </RequireRole>
    </div>
  )
}
