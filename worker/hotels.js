import { getSession } from './auth.js'
import { jsonResponse } from './util.js'

export const HOTELS = [
  {
    id: 'hotel-fukuoka',
    name: 'Hilton Fukuoka Sea Hawk',
    city: 'Fukuoka',
    check_in: '2026-05-20',
    check_out: '2026-05-22',
    confirmation_number: '3448323711',
    location: {
      name: 'Hilton Fukuoka Sea Hawk',
      address: '2-2-3 Jigyohama, Chuo-ku, Fukuoka 810-8650',
      coordinates: [130.3466, 33.5886],
    },
  },
  {
    id: 'hotel-osaka',
    name: 'DoubleTree by Hilton Osaka Castle',
    city: 'Osaka',
    check_in: '2026-05-22',
    check_out: '2026-05-24',
    confirmation_number: '3458936154',
    location: {
      name: 'DoubleTree by Hilton Osaka Castle',
      address: '1-32 Shiromi, Chuo-ku, Osaka 540-0001',
      coordinates: [135.5227, 34.6858],
    },
  },
  {
    id: 'hotel-kyoto',
    name: 'DoubleTree by Hilton Kyoto Station',
    city: 'Kyoto',
    check_in: '2026-05-24',
    check_out: '2026-05-26',
    confirmation_number: '3460226783',
    location: {
      name: 'DoubleTree by Hilton Kyoto Station',
      address: '31-1 Nishi-Kujo Inokuma-cho, Minami-ku, Kyoto 601-8003',
      coordinates: [135.7464, 34.9820],
    },
  },
  {
    id: 'hotel-tokyo',
    name: 'DoubleTree by Hilton Tokyo Ariake',
    city: 'Tokyo',
    check_in: '2026-05-26',
    check_out: '2026-05-29',
    confirmation_number: '3461109109',
    location: {
      name: 'DoubleTree by Hilton Tokyo Ariake',
      address: '2-6-1 Ariake, Koto-ku, Tokyo 135-0063',
      coordinates: [139.7930, 35.6321],
    },
  },
]

export async function handleHotels(request, env) {
  const session = await getSession(request, env)
  if (!session) return jsonResponse({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  return jsonResponse(HOTELS)
}
