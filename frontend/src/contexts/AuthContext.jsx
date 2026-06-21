import React, { createContext, useContext, useState, useEffect } from 'react'
import axiosClient from '../api/axiosClient'

// Create Auth Context
const AuthContext = createContext()

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const response = await axiosClient.get('/users/me/')
          setUser(response.data)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Failed to fetch user:', error)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          setIsAuthenticated(false)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username, password) => {
    try {
      const response = await axiosClient.post('/auth/login/', {
        username,
        password,
      })
      const { access, refresh, user: userData } = response.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      setUser(userData)
      setIsAuthenticated(true)
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: error.response?.data?.detail || 'Login failed' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axiosClient.post('/auth/register/', userData)
      return { success: true, user: response.data.user }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: error.response?.data || 'Registration failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use Auth Context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
