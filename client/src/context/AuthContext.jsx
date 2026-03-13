import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'blog_token'
const USER_KEY = 'blog_user'

// Real MongoDB ObjectIds are 24 hex chars; reject placeholders like "USER_ID"
function isValidUserId(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed && isValidUserId(parsed.id)) {
          setUser(parsed)
        } else {
          localStorage.removeItem(USER_KEY)
          localStorage.removeItem(TOKEN_KEY)
        }
      } catch {
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem(TOKEN_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
