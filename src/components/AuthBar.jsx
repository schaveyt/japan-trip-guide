import { Link } from 'react-router'
import { useAuth } from '../auth/AuthProvider'

export default function AuthBar() {
  const { role, whoAmI, logout, loading } = useAuth()

  if (loading) return null

  return (
    <div className="bg-paper border-b border-ink/10 px-5 py-2 flex items-center justify-between">
      {role ? (
        <>
          <p className="text-xs text-muted">
            {role === 'traveler' ? (
              <>
                <span className="font-medium text-ink capitalize">{whoAmI || 'Traveler'}</span>
                <span className="mx-1.5">·</span>
                <span className="text-torii uppercase tracking-wider">Traveler</span>
              </>
            ) : (
              <span className="text-muted uppercase tracking-wider">Guest</span>
            )}
          </p>
          <button
            onClick={logout}
            className="text-xs uppercase tracking-wider text-muted hover:text-ink transition-colors"
          >
            Sign out
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-muted uppercase tracking-wider">Not signed in</p>
          <Link
            to="/login"
            className="text-xs uppercase tracking-wider text-link hover:text-ink transition-colors"
          >
            Sign in →
          </Link>
        </>
      )}
    </div>
  )
}
