import { useState, useCallback } from 'react'

const TOKEN_KEY = 'rg_admin_token'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

  const login = useCallback(async (password: string): Promise<boolean> => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (!res.ok) return false
    const { token } = await res.json()
    localStorage.setItem(TOKEN_KEY, token)
    setToken(token)
    return true
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  function authHeaders(): Record<string, string> {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  return { token, login, logout, authHeaders, isAuthenticated: !!token }
}
