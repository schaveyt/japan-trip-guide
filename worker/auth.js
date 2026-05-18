import { parseCookies } from './util.js'

const COOKIE_NAME = 'session'
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX = 5
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000

// In-memory rate limit — resets on cold start, which is acceptable.
// Goal: slow brute force, not defeat distributed attackers.
const rateLimitMap = new Map()

export function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

const enc = new TextEncoder()

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  )
}

async function hmacSign(payload, secret) {
  const key = await importHmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hmacVerify(payload, sig, secret) {
  const expected = await hmacSign(payload, secret)
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  return diff === 0
}

// Constant-time passcode comparison via HMAC-of-HMAC trick
export async function timingSafeEqual(a, b) {
  const key = await importHmacKey('compare-key')
  const [sa, sb] = await Promise.all([
    crypto.subtle.sign('HMAC', key, enc.encode(a)),
    crypto.subtle.sign('HMAC', key, enc.encode(b)),
  ])
  const aa = new Uint8Array(sa), ab = new Uint8Array(sb)
  let diff = 0
  for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ ab[i]
  return diff === 0
}

export async function issueSession(role, signingKey, isSecure) {
  const payload = JSON.stringify({ role, exp: Date.now() + SESSION_TTL_MS })
  const b64 = btoa(payload)
  const sig = await hmacSign(b64, signingKey)
  const token = `${b64}.${sig}`
  return [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${90 * 24 * 60 * 60}`,
    ...(isSecure ? ['Secure'] : []),
  ].join('; ')
}

export async function getSession(req, env) {
  const cookies = parseCookies(req.headers.get('Cookie'))
  const token = cookies[COOKIE_NAME]
  if (!token) return null
  const dotIdx = token.lastIndexOf('.')
  if (dotIdx === -1) return null
  const b64 = token.slice(0, dotIdx)
  const sig = token.slice(dotIdx + 1)
  const valid = await hmacVerify(b64, sig, env.SESSION_SIGNING_KEY)
  if (!valid) return null
  try {
    const payload = JSON.parse(atob(b64))
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function clearSessionCookie(isSecure) {
  return [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    ...(isSecure ? ['Secure'] : []),
  ].join('; ')
}
