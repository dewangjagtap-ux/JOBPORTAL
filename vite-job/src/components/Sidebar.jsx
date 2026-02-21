import React from 'react'
import { Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function Sidebar({ role = 'student' }) {
  return (
    <div className="sidebar animate-fade">
      <Nav defaultActiveKey="/" className="flex-column">
        <div className="sidebar-brand px-3 py-4 mb-3 border-bottom d-flex align-items-center gap-2">
          <div style={{ width: 8, height: 24, borderRadius: 4 }} className="bg-primary"></div>
          <span className="text-uppercase ls-wide fw-bold text-primary small">Placement Portal</span>
        </div>
        {role === 'student' && (
          <>
            <Nav.Link as={Link} to="/student/dashboard">Overview</Nav.Link>
            <Nav.Link as={Link} to="/student/jobs">Jobs</Nav.Link>
            <Nav.Link as={Link} to="/student/applied">Applied Jobs</Nav.Link>
            <Nav.Link as={Link} to="/student/resume">Resume Upload</Nav.Link>
            <Nav.Link as={Link} to="/student/profile">Profile</Nav.Link>
          </>
        )}
        {role === 'company' && (
          <>
            <Nav.Link as={Link} to="/company/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/company/post-job">Add Job</Nav.Link>
            <Nav.Link as={Link} to="/company/applicants">Applicants</Nav.Link>
            <Nav.Link as={Link} to="/company/profile">Company Profile</Nav.Link>
          </>
        )}
        {role === 'admin' && (
          <>
            <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/admin/users">Manage Users</Nav.Link>
            <Nav.Link as={Link} to="/admin/companies">Manage Companies</Nav.Link>
            <Nav.Link as={Link} to="/admin/students">Manage Students</Nav.Link>
            <Nav.Link as={Link} to="/admin/jobs">Manage Jobs</Nav.Link>
            <Nav.Link as={Link} to="/admin/reports">Reports</Nav.Link>
            <Nav.Link as={Link} to="/admin/profile">Admin Profile</Nav.Link>
          </>
        )}
      </Nav>
    </div>
  )
}
