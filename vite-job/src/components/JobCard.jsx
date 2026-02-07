import React, { useState } from 'react'
import { Card, Button, Badge } from 'react-bootstrap'
import jobService from '../services/jobService'
import { useAuth } from '../context/AuthContext'

export default function JobCard({ job, onApplied }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleApply = async () => {
    if (!user || user.role !== 'student') return
    setLoading(true)
    setError(null)
    try {
      const res = await jobService.apply(job.id, { studentId: user.id, name: user.name, email: user.email })
      if (res && res.ok) {
        onApplied && onApplied(job.id)
        // show local success feedback (toast-like)
        setSuccess('Application submitted successfully')
        setTimeout(() => setSuccess(null), 3500)
      } else {
        setError(res?.message || 'Unable to apply')
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="job-card h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Card.Title className="mb-1">{job.title}</Card.Title>
            <Card.Subtitle className="text-muted">{job.companyName}</Card.Subtitle>
          </div>
          <div>
            <Badge bg="info" className="text-uppercase">{job.type || 'Full-time'}</Badge>
          </div>
        </div>

        <Card.Text className="mt-3 text-truncate-3">{job.description}</Card.Text>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted small">{job.location || 'Remote'}</div>
          <div>
            {user && user.role === 'student' ? (
              (() => {
                const appliedLocal = (job.applicants || []).some(a => Number(a.studentId) === Number(user.id))
                const appsGlobal = JSON.parse(localStorage.getItem('applications') || '[]')
                const appliedGlobal = appsGlobal.some(a => Number(a.jobId) === Number(job.id) && Number(a.studentId) === Number(user.id))
                const applied = appliedLocal || appliedGlobal
                return applied ? (
                  <Badge bg="success">Applied</Badge>
                ) : (
                  <Button size="sm" onClick={handleApply} disabled={loading}>
                    {loading ? 'Applying...' : 'Apply'}
                  </Button>
                )
              })()
            ) : (
              <Button size="sm" variant="outline-primary">View</Button>
            )}
          </div>
        </div>
        {error && <div className="text-danger small mt-2">{error}</div>}
        {success && <div className="mt-2"><div className="alert alert-success py-1 px-2 small mb-0">{success}</div></div>}
      </Card.Body>
    </Card>
  )
}
