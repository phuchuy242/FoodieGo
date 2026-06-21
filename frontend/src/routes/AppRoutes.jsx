import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Menu from '../pages/Menu'

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/menu"
        element={isAuthenticated ? <Menu /> : <Navigate to="/login" />}
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/menu" /> : <Navigate to="/login" />}
      />

      {/* 404 page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppRoutes
