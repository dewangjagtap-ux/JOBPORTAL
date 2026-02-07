import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

// Simple client-side route guard using localStorage flags.
// Checks localStorage.isLoggedIn and localStorage.userRole.
export default function RequireAuth({ allowedRoles = [], children }) {
  // Read authUser key exactly per spec
  const raw = localStorage.getItem('authUser')
  const user = raw ? JSON.parse(raw) : null
  if (!user) return <Navigate to="/login" replace />

  const role = user.role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === 'student') return <Navigate to="/student/dashboard" replace />
    if (role === 'company') return <Navigate to="/company/dashboard" replace />
    return <Navigate to="/login" replace />
  }

  return children ? children : <Outlet />
}
