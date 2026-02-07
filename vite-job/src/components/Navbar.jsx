import React from 'react'
import { Navbar as BNavbar, Container, Nav, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import DarkModeToggle from './DarkModeToggle'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <BNavbar bg="light" expand="lg" className="sticky-top shadow-sm">
      <Container fluid>
        <BNavbar.Brand as={Link} to="/">
          Campus Placement Portal
        </BNavbar.Brand>
        <div className="d-flex align-items-center">
          <DarkModeToggle />
          <BNavbar.Toggle />
        </div>
        <BNavbar.Collapse>
          <Nav className="ms-auto">
            {!user && (
              <Nav.Link as={Link} to="/login">
                Login
              </Nav.Link>
            )}
            {user && user.role === 'student' && (
              <>
                <Nav.Link as={Link} to="/student/jobs">Jobs</Nav.Link>
                <Nav.Link as={Link} to="/student/applied">Applied</Nav.Link>
                <Nav.Link as={Link} to="/student/profile">Profile</Nav.Link>
              </>
            )}
            {user && user.role === 'company' && (
              <>
                <Nav.Link as={Link} to="/company/jobs">Jobs</Nav.Link>
                <Nav.Link as={Link} to="/company/post-job">Post Job</Nav.Link>
                <Nav.Link as={Link} to="/company/applicants">Applicants</Nav.Link>
              </>
            )}
            {user && user.role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/companies">Companies</Nav.Link>
              </>
            )}
            {user && (
              <Button variant="outline-secondary" size="sm" onClick={handleLogout} className="ms-2">
                Logout
              </Button>
            )}
          </Nav>
        </BNavbar.Collapse>
      </Container>
    </BNavbar>
  )
}
