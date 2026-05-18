import { handleNotes } from './notes.js'
import { handlePhotos } from './photos.js'
import { handleHotels } from './hotels.js'
import { getSession, issueSession, clearSessionCookie, timingSafeEqual, checkRateLimit } from './auth.js'
import { jsonResponse, badRequest, tooManyRequests, noContent } from './util.js'

async function handleApi(req, env, url) {
  const isSecure = url.protocol === 'https:'

  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    const ip = req.headers.get('cf-connecting-ip') || '0.0.0.0'
    if (checkRateLimit(ip)) return tooManyRequests()
    let body
    try { body = await req.json() } catch { return badRequest('Invalid JSON') }
    const { code } = body
    if (!code) return badRequest('code required')
    const isTraveler = await timingSafeEqual(String(code), env.TRAVELER_PASSCODE)
    const isGuest = !isTraveler && await timingSafeEqual(String(code), env.GUEST_SHARE_CODE)
    if (!isTraveler && !isGuest) {
      return jsonResponse({ error: 'Invalid code', code: 'INVALID_CODE' }, 401)
    }
    const cookie = await issueSession(isTraveler ? 'traveler' : 'guest', env.SESSION_SIGNING_KEY, isSecure)
    return new Response(null, { status: 204, headers: { 'Set-Cookie': cookie } })
  }

  if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
    const isSecure = url.protocol === 'https:'
    return new Response(null, { status: 204, headers: { 'Set-Cookie': clearSessionCookie(isSecure) } })
  }

  if (url.pathname === '/api/auth/me' && req.method === 'GET') {
    const session = await getSession(req, env)
    return jsonResponse({ role: session?.role ?? null })
  }

  if (url.pathname === '/api/hotels' && req.method === 'GET') {
    return handleHotels(req, env)
  }

  if (url.pathname === '/api/notes' || url.pathname.startsWith('/api/notes/')) {
    return handleNotes(req, env, url)
  }

  if (url.pathname === '/api/photos' || url.pathname.startsWith('/api/photos/')) {
    return handlePhotos(req, env, url)
  }

  return new Response('Not found', { status: 404 })
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    if (url.pathname.startsWith('/api/')) {
      return handleApi(req, env, url)
    }
    return env.ASSETS.fetch(req)
  },
}
