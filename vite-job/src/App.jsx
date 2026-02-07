import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import './index.css'

import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import DarkModeToggle from './components/DarkModeToggle'
import ResumeModal from './components/ResumeModal'
import Layout from './components/Layout'

import Login from './pages/auth/Login'
import StudentJobs from './pages/student/Jobs'
import AppliedJobs from './pages/student/AppliedJobs'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentProfile from './pages/student/Profile'

import CompanyDashboard from './pages/company/CompanyDashboard'
import PostJob from './pages/company/PostJob'
import CompanyJobs from './pages/company/CompanyJobs'
import Applicants from './pages/company/Applicants'
import CompanyProfile from './pages/company/Profile'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageCompanies from './pages/admin/ManageCompanies'
import ManageStudents from './pages/admin/ManageStudents'
import ManageJobs from './pages/admin/ManageJobs'

import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import RequireAuth from './components/RequireAuth'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Layout />}>
        {/* Default: send to login so RequireAuth can redirect appropriately */}
        <Route index element={<Navigate to="/login" replace />} />

        {/* Student routes (protected) */}
        <Route path="student" element={<RequireAuth allowedRoles={[ 'student' ]}><Outlet /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="jobs" element={<StudentJobs />} />
          <Route path="applied" element={<AppliedJobs />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Company routes (protected) */}
        <Route path="company" element={<RequireAuth allowedRoles={[ 'company' ]}><Outlet /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CompanyDashboard />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="jobs" element={<CompanyJobs />} />
          <Route path="profile" element={<CompanyProfile />} />
          <Route path="applicants" element={<Applicants />} />
        </Route>

        {/* Admin routes (protected for admin) */}
        <Route path="admin" element={<RequireAuth allowedRoles={[ 'admin' ]}><Outlet /></RequireAuth>}>
          <Route index element={<AdminDashboard />} />
          <Route path="companies" element={<ManageCompanies />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="jobs" element={<ManageJobs />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default function App() {
  const [modal, setModal] = React.useState({ show: false, url: null, filename: null })

  React.useEffect(() => {
    function onOpen(e) {
      const d = e?.detail || {}
      setModal({ show: true, url: d.url || null, filename: d.filename || null })
    }
    window.addEventListener('openResumeModal', onOpen)

    // initialize localStorage keys and migrate from old keys if needed
    try {
      // ensure top-level keys exist per schema
      if (!localStorage.getItem('jobs')) {
        const old = localStorage.getItem('cpp_jobs')
        if (old) localStorage.setItem('jobs', old)
        else localStorage.setItem('jobs', JSON.stringify([]))
      }
      if (!localStorage.getItem('applications')) {
        // migrate old per-student entries into a global list
        const apps = []
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('cpp_applications_')) {
              const raw = localStorage.getItem(key)
              try {
                const arr = JSON.parse(raw) || []
                arr.forEach(a => apps.push(a))
              } catch (e) {}
            }
          }
        } catch (e) {}
        localStorage.setItem('applications', JSON.stringify(apps))
      }
      if (!localStorage.getItem('students')) localStorage.setItem('students', JSON.stringify([]))
      if (!localStorage.getItem('companies')) {
        // try to migrate from companyProfile key if exists
        const raw = localStorage.getItem('companyProfile')
        if (raw) {
          try {
            const obj = JSON.parse(raw)
            const id = obj.id || Date.now()
            const company = { id, name: obj.companyName || obj.name || 'Company', hrName: obj.hrName || '', email: obj.email || '', phone: obj.phone || '', website: obj.website || '', description: obj.description || '' }
            localStorage.setItem('companies', JSON.stringify([company]))
          } catch (e) { localStorage.setItem('companies', JSON.stringify([])) }
        } else localStorage.setItem('companies', JSON.stringify([]))
      }
    } catch (e) {
      console.warn('storage init failed', e)
    }

    return () => window.removeEventListener('openResumeModal', onOpen)
  }, [])

  return (
    <AuthProvider>
      <ThemeProvider>
        <Navbar />
        <div className="app-container">
          <AppRoutes />
        </div>
        <ResumeModal show={modal.show} onHide={() => setModal({ show: false, url: null })} url={modal.url} filename={modal.filename} />
      </ThemeProvider>
    </AuthProvider>
  )
}
