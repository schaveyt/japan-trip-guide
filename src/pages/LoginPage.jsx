import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import itinerary from '../data/itinerary.json'

const { trip } = itinerary

export default function LoginPage() {
  const { login, setName } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [step, setStep] = useState('code') // 'code' | 'name'
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    if (!code.trim() || loading) return
    setError(null)
    setLoading(true)
    try {
      const role = await login(code.trim())
      if (role === 'traveler') {
        setStep('name')
      } else {
        navigate('/today')
      }
    } catch (e) {
      if (e.status === 429) setError('Too many attempts. Wait a few minutes and try again.')
      else setError('Wrong code. Check with Todd or Jack.')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  const handleNameSelect = (name) => {
    setName(name)
    navigate('/today')
  }

  return (
    <div className="bg-paper min-h-screen font-body flex flex-col items-center justify-center px-6">
      {step === 'code' ? (
        <div className="w-full max-w-xs">
          <p className="text-xs uppercase tracking-widest text-muted mb-2 text-center">
            May 2026
          </p>
          <h1 className="font-display text-3xl font-bold text-ink text-center mb-1">
            Japan Trip
          </h1>
          <p className="text-muted text-sm text-center mb-10">
            {trip.route.join(' → ')}
          </p>
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted block mb-2">
                Access code
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Enter code…"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full text-ink bg-transparent border border-ink/20 px-4 py-3 focus:outline-none focus:border-ink/60 text-lg tracking-wider placeholder:text-muted/40"
              />
            </div>
            {error && <p className="text-torii text-sm">{error}</p>}
            <button
              type="submit"
              disabled={!code.trim() || loading}
              className="w-full py-3 border border-ink/20 text-ink text-sm uppercase tracking-wider hover:border-ink/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Checking…' : 'Enter'}
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full max-w-xs text-center">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">Welcome, traveler</p>
          <h1 className="font-display text-2xl font-bold text-ink mb-2">Who are you?</h1>
          <p className="text-muted text-sm mb-8">This is stored on your device only.</p>
          <div className="space-y-3">
            {trip.travelers.map(name => (
              <button
                key={name}
                onClick={() => handleNameSelect(name.toLowerCase())}
                className="w-full py-4 border border-ink/20 text-ink font-display text-xl hover:border-ink/60 hover:bg-ink/5 transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
