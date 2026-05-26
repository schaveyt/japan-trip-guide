import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../auth/useAuth'
import { RequireRole } from '../../auth/RequireRole'
import { api } from '../../lib/api'
import { resizeAndEncodeImage } from '../../lib/imageResize'

export function PhotoGrid({ entityType, entityId }) {
  const { role } = useAuth()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [batch, setBatch] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [lightboxId, setLightboxId] = useState(null)
  const [online, setOnline] = useState(navigator.onLine)
  const inputRef = useRef(null)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => {
    if (!role) { setLoading(false); return }
    api.get(`/api/photos?entity_type=${encodeURIComponent(entityType)}&entity_id=${encodeURIComponent(entityId)}`)
      .then(data => setPhotos(data.photos))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false))
  }, [role, entityType, entityId])

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return
    setUploadError(null)
    let failed = 0
    setBatch({ current: 0, total: files.length, failed: 0 })
    for (let i = 0; i < files.length; i++) {
      setBatch(b => ({ ...b, current: i + 1 }))
      try {
        const { blob } = await resizeAndEncodeImage(files[i])
        const form = new FormData()
        form.append('file', blob, 'photo.jpg')
        form.append('entity_type', entityType)
        form.append('entity_id', entityId)
        form.append('published', 'false')
        const photo = await api.upload('/api/photos', form)
        setPhotos(prev => [...prev, photo])
      } catch {
        failed++
        setBatch(b => ({ ...b, failed }))
      }
    }
    if (failed > 0) setUploadError(`${failed} of ${files.length} failed — try those again`)
    setBatch(null)
  }

  const togglePublish = async (photo) => {
    try {
      const updated = await api.patch(`/api/photos/${photo.id}`, { published: !photo.published })
      setPhotos(prev => prev.map(p => p.id === photo.id ? updated : p))
    } catch { /* silent */ }
  }

  const deletePhoto = async (id) => {
    try {
      await api.delete(`/api/photos/${id}`)
      setPhotos(prev => prev.filter(p => p.id !== id))
      if (lightboxId === id) setLightboxId(null)
    } catch { /* silent */ }
  }

  if (!role) return null

  const lightboxPhoto = photos.find(p => p.id === lightboxId)

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3 border-b border-ink/10 pb-2">
        <h4 className="text-xs uppercase tracking-widest text-muted">
          Photos {photos.length > 0 && <span className="text-ink/40">· {photos.length}</span>}
        </h4>
        <RequireRole role="traveler">
          <button
            onClick={() => online && !batch && inputRef.current?.click()}
            disabled={!!batch || !online}
            className="text-xs uppercase tracking-wider text-link hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {batch ? `Uploading ${batch.current} of ${batch.total}…` : '+ Photo'}
          </button>
        </RequireRole>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

      {uploadError && <p className="text-torii text-xs mb-2">{uploadError}</p>}
      {!online && role === 'traveler' && <p className="text-muted text-xs mb-2">Offline — photo upload unavailable</p>}

      {!loading && photos.length > 0 && (
        <div className="grid grid-cols-3 gap-1">
          {photos.map(photo => (
            <div key={photo.id} className="relative aspect-square bg-ink/5 cursor-pointer" onClick={() => setLightboxId(photo.id)}>
              <img
                src={`/api/photos/${photo.id}/bytes`}
                alt={photo.caption || ''}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <RequireRole role="traveler">
                <div
                  className={`absolute bottom-0 inset-x-0 text-[9px] text-center py-0.5 ${
                    photo.published ? 'bg-torii/80 text-white' : 'bg-black/50 text-white/60'
                  }`}
                  onClick={e => { e.stopPropagation(); togglePublish(photo) }}
                >
                  {photo.published ? 'Published' : 'Private'}
                </div>
              </RequireRole>
            </div>
          ))}
        </div>
      )}

      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/92 flex flex-col items-center justify-center p-4" onClick={() => setLightboxId(null)}>
          <img
            src={`/api/photos/${lightboxPhoto.id}/bytes`}
            alt={lightboxPhoto.caption || ''}
            className="max-w-full max-h-[75vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
          {lightboxPhoto.caption && (
            <p className="text-white/80 text-sm mt-3 text-center max-w-sm">{lightboxPhoto.caption}</p>
          )}
          <div className="flex gap-3 mt-4" onClick={e => e.stopPropagation()}>
            <RequireRole role="traveler">
              <button
                onClick={() => togglePublish(lightboxPhoto)}
                className={`text-xs uppercase tracking-wider px-3 py-1.5 border ${
                  lightboxPhoto.published ? 'border-torii text-torii' : 'border-white/30 text-white/50 hover:border-white/60'
                }`}
              >
                {lightboxPhoto.published ? 'Published' : 'Publish'}
              </button>
              <button
                onClick={() => deletePhoto(lightboxPhoto.id)}
                className="text-xs uppercase tracking-wider px-3 py-1.5 border border-red-400/50 text-red-400"
              >
                Delete
              </button>
            </RequireRole>
            <button onClick={() => setLightboxId(null)} className="text-xs uppercase tracking-wider px-3 py-1.5 border border-white/20 text-white/50">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
