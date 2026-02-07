import React, { useEffect, useState } from 'react'
import { Table, Spinner, Alert } from 'react-bootstrap'
import studentService from '../../services/studentService'
import { useAuth } from '../../context/AuthContext'

export default function AppliedJobs() {
  const { user } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { if (user) fetchApps() }, [user])

  const fetchApps = async () => {
    setLoading(true); setError(null)
    try {
      const data = await studentService.getApplications(user?.id)
      setApps(data || [])
    } catch (err) {
      setError(err?.message || err)
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 className="mb-3">Applied Jobs</h2>
      {(!user) && <Alert variant="info">Sign in as a student to see your applications. You can mock login with any email.</Alert>}
      {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Job</th>
              <th>Company</th>
              <th>Date Applied</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 && (
              <tr><td colSpan={4} className="text-center text-muted">No applications found</td></tr>
            )}
            {apps.map((a, idx) => (
              <tr key={idx}>
                <td>{a.jobTitle}</td>
                <td>{a.companyName}</td>
                <td>{new Date(a.appliedAt).toLocaleDateString()}</td>
                <td><span className={`badge bg-${statusColor(a.status)}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}

function statusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'applied': return 'secondary'
    case 'shortlisted': return 'warning'
    case 'rejected': return 'danger'
    case 'selected': return 'success'
    default: return 'secondary'
  }
}
