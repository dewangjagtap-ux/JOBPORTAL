import React from 'react'
import { Navbar as BNavbar, Container, Nav, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <BNavbar expand="lg" className="sticky-top shadow-sm py-3 mb-0">
      <Container>
        <BNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <span className="fs-4 fw-bold text-gradient">Campus Placement Portal</span>
        </BNavbar.Brand>
        <BNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
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
