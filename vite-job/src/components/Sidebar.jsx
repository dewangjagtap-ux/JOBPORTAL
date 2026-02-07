import React from 'react'
import { Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function Sidebar({ role = 'student' }) {
  return (
    <div className="sidebar bg-white border-end">
      <Nav defaultActiveKey="/" className="flex-column p-3">
        <div className="sidebar-brand mb-3">Dashboard</div>
        {role === 'student' && (
          <>
            <Nav.Link as={Link} to="/student">Overview</Nav.Link>
            <Nav.Link as={Link} to="/student/jobs">Jobs</Nav.Link>
            <Nav.Link as={Link} to="/student/applied">Applied Jobs</Nav.Link>
            <Nav.Link as={Link} to="/student/profile">Profile</Nav.Link>
          </>
        )}
        {role === 'company' && (
          <>
            <Nav.Link as={Link} to="/company/dashboard">Overview</Nav.Link>
            <Nav.Link as={Link} to="/company/jobs">Jobs</Nav.Link>
            <Nav.Link as={Link} to="/company/applicants">Applicants</Nav.Link>
            <Nav.Link as={Link} to="/company/profile">Profile</Nav.Link>
          </>
        )}
        {role === 'admin' && (
          <>
            <Nav.Link as={Link} to="/admin">Overview</Nav.Link>
            <Nav.Link as={Link} to="/admin/companies">Companies</Nav.Link>
            <Nav.Link as={Link} to="/admin/students">Students</Nav.Link>
            <Nav.Link as={Link} to="/admin/jobs">Jobs</Nav.Link>
          </>
        )}
      </Nav>
    </div>
  )
}
