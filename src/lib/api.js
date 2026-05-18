async function request(method, path, body) {
  const opts = { method, credentials: 'same-origin', headers: {} }
  if (body !== undefined) {
    if (body instanceof FormData) {
      opts.body = body
    } else {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(body)
    }
  }
  const whoAmI = localStorage.getItem('whoAmI')
  if (whoAmI && (method === 'POST' || method === 'PATCH')) {
    opts.headers['X-Author'] = whoAmI
  }
  const res = await fetch(path, opts)
  if (res.status === 204) return null
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed', code: 'UNKNOWN' }))
    const e = new Error(err.error || 'Request failed')
    e.code = err.code
    e.status = res.status
    throw e
  }
  return res.json()
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
  upload: (path, form)  => request('POST',   path, form),
}
