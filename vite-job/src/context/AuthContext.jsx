import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser())

  useEffect(() => {
    // keep user in sync with localStorage if changed elsewhere
    const onStorage = (e) => {
      if (e.key === 'authUser') setUser(authService.getStoredUser())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = async (credentials) => {
    const data = await authService.login(credentials)
    setUser(data.user || null)
    return data
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext
