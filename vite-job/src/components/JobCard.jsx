import React, { useState, useRef } from 'react'
import { Card, Button, Badge, Form } from 'react-bootstrap'
import studentService from '../services/studentService'
import { useAuth } from '../context/AuthContext'

export default function JobCard({ job, isApplied, onApplied }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const fileInputRef = useRef(null)

  const handleApplyClick = async () => {
    // If student already has a resume in profile, apply directly
    if (user && user.resume) {
      setLoading(true)
      setError(null)
      try {
        const res = await studentService.applyJob(job._id || job.id)
        if (res) {
          onApplied && onApplied(job._id || job.id)
          setSuccess('Applied successfully using your profile resume!')
          setTimeout(() => setSuccess(null), 3500)
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    } else {
      // Otherwise trigger file upload
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!user || user.role !== 'student') return
    setLoading(true)
    setError(null)

    try {
      const res = await studentService.applyJob(job._id || job.id, file)
      if (res) {
        onApplied && onApplied(job._id || job.id)
        setSuccess('Application submitted successfully')
        setTimeout(() => setSuccess(null), 3500)
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
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
              isApplied ? (
                <Badge bg="success">Applied</Badge>
              ) : (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <Button size="sm" onClick={handleApplyClick} disabled={loading}>
                    {loading ? 'Uploading...' : 'Apply'}
                  </Button>
                </>
              )
            ) : (
              null
            )}
          </div>
        </div>
        {error && <div className="text-danger small mt-2">{error}</div>}
        {success && <div className="mt-2"><div className="alert alert-success py-1 px-2 small mb-0">{success}</div></div>}
      </Card.Body>
    </Card>
  )
}
