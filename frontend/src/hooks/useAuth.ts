import { useState, useEffect } from 'react'
import API from '../services/api'

export interface UserSession {
  token: string
  refreshToken: string
  id: number
  email: string
  fullName: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const id = localStorage.getItem('userId')
    const email = localStorage.getItem('userEmail')
    const fullName = localStorage.getItem('userFullName')
    const role = localStorage.getItem('userRole')

    if (token && refreshToken && id && email && fullName && role) {
      setUser({
        token,
        refreshToken,
        id: Number(id),
        email,
        fullName,
        role,
      })
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: String) => {
    setLoading(true)
    try {
      const res = await API.post('/auth/login', { email, password })
      const data = res.data

      localStorage.setItem('accessToken', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('userId', String(data.id))
      localStorage.setItem('userEmail', data.email)
      localStorage.setItem('userFullName', data.fullName)
      localStorage.setItem('userRole', data.role)

      setUser(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const signup = async (form: any) => {
    setLoading(true)
    try {
      const res = await API.post('/auth/signup', form)
      return res.data
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    window.location.href = '/login'
  }

  const updatePreferences = async (preferences: any) => {
    const res = await API.put('/profile/preferences', preferences)
    return res.data
  }

  const getPreferences = async () => {
    const res = await API.get('/profile/preferences')
    return res.data
  }

  return {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
    updatePreferences,
    getPreferences,
  }
}
