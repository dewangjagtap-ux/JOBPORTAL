import React from 'react'
import { Container } from 'react-bootstrap'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

// Layout component: renders Sidebar when user role is available, and an Outlet for nested routes
export default function Layout() {
  const { user } = useAuth()
  const storedAuthRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
  const storedRole = storedAuthRaw ? (() => { try { return JSON.parse(storedAuthRaw).role } catch (e) { return null } })() : null
  const role = user?.role || storedRole

  return (
    <div className="d-flex">
      {role ? <Sidebar role={role} /> : null}
      <Container className="p-4">
        <Outlet />
      </Container>
    </div>
  )
}
