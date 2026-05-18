export function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

export function ok(data, headers) { return jsonResponse(data, 200, headers) }
export function created(data) { return jsonResponse(data, 201) }
export function noContent() { return new Response(null, { status: 204 }) }
export function badRequest(msg = 'Bad request') { return jsonResponse({ error: msg, code: 'BAD_REQUEST' }, 400) }
export function unauthorized(msg = 'Unauthorized') { return jsonResponse({ error: msg, code: 'UNAUTHORIZED' }, 401) }
export function notFound(msg = 'Not found') { return jsonResponse({ error: msg, code: 'NOT_FOUND' }, 404) }
export function tooManyRequests() { return jsonResponse({ error: 'Too many attempts. Try again later.', code: 'RATE_LIMITED' }, 429) }
export function serverError(msg = 'Internal server error') { return jsonResponse({ error: msg, code: 'SERVER_ERROR' }, 500) }

export function parseCookies(header) {
  if (!header) return {}
  return Object.fromEntries(
    header.split(';').map(c => {
      const idx = c.indexOf('=')
      return [c.slice(0, idx).trim(), c.slice(idx + 1).trim()]
    })
  )
}
