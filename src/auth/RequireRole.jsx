import { useAuth } from './AuthProvider'

const ROLE_ORDER = ['guest', 'traveler']

export function RequireRole({ role: requiredRole, children, fallback = null }) {
  const { role } = useAuth()
  const hasRole = ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(requiredRole)
  return hasRole ? children : fallback
}
