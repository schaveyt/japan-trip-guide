import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [whoAmI, setWhoAmIState] = useState(() => localStorage.getItem('whoAmI') || null)

  useEffect(() => {
    api.get('/api/auth/me')
      .then(data => setRole(data.role))
      .catch(() => setRole(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (code) => {
    await api.post('/api/auth/login', { code })
    const data = await api.get('/api/auth/me')
    setRole(data.role)
    return data.role
  }, [])

  const logout = useCallback(async () => {
    await api.post('/api/auth/logout', {})
    setRole(null)
    localStorage.removeItem('whoAmI')
    setWhoAmIState(null)
  }, [])

  const setName = useCallback((name) => {
    localStorage.setItem('whoAmI', name)
    setWhoAmIState(name)
  }, [])

  return (
    <AuthContext.Provider value={{ role, whoAmI, loading, login, logout, setName }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
