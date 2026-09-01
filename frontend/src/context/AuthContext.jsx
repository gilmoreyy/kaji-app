import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch, getToken, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [tutor, setTutor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    apiFetch('/auth/me')
      .then(setTutor)
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(identifier, kata_sandi) {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { identifier, kata_sandi } })
    setToken(data.token)
    setTutor(data.tutor)
  }

  async function register(nama, username, email, kata_sandi) {
    const data = await apiFetch('/auth/register', { method: 'POST', body: { nama, username, email, kata_sandi } })
    setToken(data.token)
    setTutor(data.tutor)
  }

  function logout() {
    setToken(null)
    setTutor(null)
  }

  async function refreshTutor() {
    const data = await apiFetch('/auth/me')
    setTutor(data)
    return data
  }

  return (
    <AuthContext.Provider value={{ tutor, loading, login, register, logout, refreshTutor }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
