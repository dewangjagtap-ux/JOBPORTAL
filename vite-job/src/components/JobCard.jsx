import React, { useState, useRef } from 'react'
import { Card, Button, Badge, Form, Modal, Row, Col } from 'react-bootstrap'
import studentService from '../services/studentService'
import { useAuth } from '../context/AuthContext'

export default function JobCard({ job, isApplied, onApplied }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const fileInputRef = useRef(null)

  const isLimitReached = job.maxApplicants > 0 && job.applicantCount >= job.maxApplicants

  const handleApplyClick = async () => {
    if (isLimitReached) return
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
    <>
      <Card className="job-card h-100 shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <Card.Title className="mb-1 fw-bold">{job.title}</Card.Title>
              <Card.Subtitle className="text-muted">{job.companyName}</Card.Subtitle>
            </div>
            <div>
              <Badge bg="info" className="text-uppercase px-2 py-1" style={{ fontSize: '0.75rem' }}>
                {job.jobType || 'Full-time'}
              </Badge>
            </div>
          </div>

          <div className="mt-2 d-flex gap-2">
            <Badge bg="light" text="dark" className="border">
              Applicants: {job.applicantCount || 0} {job.maxApplicants > 0 ? `/ ${job.maxApplicants}` : ''}
            </Badge>
            {job.deadline && (
              <Badge bg="light" text="danger" className="border">
                Apply by: {new Date(job.deadline).toLocaleDateString()}
              </Badge>
            )}
          </div>

          <Card.Text className="mt-3 text-truncate-3 text-secondary" style={{ fontSize: '0.9rem' }}>
            {job.description}
          </Card.Text>

          <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
            <div className="text-muted small">
              <i className="bi bi-geo-alt me-1"></i>{job.location || 'Remote'}
            </div>
            <div className="d-flex gap-2">
              <Button size="sm" variant="outline-primary" onClick={() => setShowDetails(true)}>
                Details
              </Button>
              {user && user.role === 'student' && (
                isApplied ? (
                  <Badge bg="success" className="d-flex align-items-center">Applied</Badge>
                ) : (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    <Button
                      size="sm"
                      onClick={handleApplyClick}
                      disabled={loading || isLimitReached}
                      variant={isLimitReached ? "secondary" : "primary"}
                    >
                      {loading ? 'Uploading...' : isLimitReached ? 'Full' : 'Apply'}
                    </Button>
                  </>
                )
              )}
            </div>
          </div>
          {error && <div className="text-danger small mt-2">{error}</div>}
          {success && <div className="mt-2"><div className="alert alert-success py-1 px-2 small mb-0">{success}</div></div>}
        </Card.Body>
      </Card>

      <Modal show={showDetails} onHide={() => setShowDetails(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{job.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6 className="text-primary mb-1">{job.companyName}</h6>
            <p className="text-muted mb-0">{job.location || 'Remote'} • {job.jobType || 'Full-time'}</p>
          </div>

          <div className="mb-4">
            <h5 className="fw-bold">Job Description</h5>
            <div style={{ whiteSpace: 'pre-line' }}>{job.description}</div>
          </div>

          <Row className="mb-4">
            <Col sm={6}>
              <h6 className="fw-bold">Salary</h6>
              <p>{job.salary || 'Not specified'}</p>
            </Col>
            <Col sm={6}>
              <h6 className="fw-bold">Experience Required</h6>
              <p>{job.experience || 'Not specified'}</p>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col sm={6}>
              <h6 className="fw-bold">Application Status</h6>
              <p>
                {job.applicantCount || 0} applicants
                {job.maxApplicants > 0 ? ` (Limit: ${job.maxApplicants})` : ''}
              </p>
            </Col>
            {job.deadline && (
              <Col sm={6}>
                <h6 className="fw-bold">Last Date to Apply</h6>
                <p className="text-danger fw-bold">{new Date(job.deadline).toLocaleDateString()}</p>
              </Col>
            )}
          </Row>

          {job.skills && job.skills.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-bold">Required Skills</h6>
              <div className="d-flex flex-wrap gap-2">
                {job.skills.map((s, i) => <Badge key={i} bg="light" text="dark" className="border">{s}</Badge>)}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>Close</Button>
          {!isApplied && user?.role === 'student' && (
            <Button
              variant={isLimitReached ? "secondary" : "primary"}
              disabled={loading || isLimitReached}
              onClick={() => { setShowDetails(false); handleApplyClick(); }}
            >
              {isLimitReached ? 'Limit Reached' : 'Apply Now'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  )
}
