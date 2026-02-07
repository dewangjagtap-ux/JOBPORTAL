import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Form, Alert } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import studentService from '../../services/studentService'
import ResumeModal from '../../components/ResumeModal'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [msg, setMsg] = useState(null)
  const [preview, setPreview] = useState(null)
  const [jobsCount, setJobsCount] = useState(0)
  const [appliedCount, setAppliedCount] = useState(0)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [recentApps, setRecentApps] = useState([])
  const [profileCompletion, setProfileCompletion] = useState(0)

  useEffect(() => {
    if (!user) return
    try {
      const raw = localStorage.getItem(`cpp_resume_${user.id}`)
      if (raw) {
        setPreview(JSON.parse(raw).dataURL)
      }
    } catch (e) {}
    refreshStats()
  }, [user])

  useEffect(() => {
    // recalc profile completion when mounted
    calculateProfileCompletion()
  }, [])

  const calculateProfileCompletion = () => {
    if (!user) return setProfileCompletion(0)
    try {
      const raw = localStorage.getItem(`cpp_profile_${user.id}`)
      const p = raw ? JSON.parse(raw) : {}
      const keys = ['fullName','phone','branch','year','college','cgpa','skills','resumeName']
      let filled = 0
      keys.forEach(k => {
        const v = p[k]
        if (Array.isArray(v)) { if (v.length) filled++ }
        else if (v) filled++
      })
      const percent = Math.round((filled / keys.length) * 100)
      setProfileCompletion(percent)
    } catch (e) { setProfileCompletion(0) }
  }

  const refreshStats = () => {
    try {
      const jobs = JSON.parse(localStorage.getItem('cpp_jobs') || '[]')
      setJobsCount(jobs.length)
      const apps = JSON.parse(localStorage.getItem(`cpp_applications_${user.id}`) || '[]')
      setAppliedCount(apps.length)
      setRecentApps(apps.slice(0,5))
      setResumeUploaded(!!localStorage.getItem(`cpp_resume_${user.id}`))
    } catch (e) {}
    calculateProfileCompletion()
  }

  const handleUpload = async () => {
    if (!file) return setMsg({ type: 'danger', text: 'Choose a PDF file to upload' })
    if (file.type !== 'application/pdf') return setMsg({ type: 'danger', text: 'Only PDF allowed' })
    try {
      await studentService.uploadResume(user.id, file)
      const raw = localStorage.getItem(`cpp_resume_${user.id}`)
      setPreview(JSON.parse(raw).dataURL)
      setMsg({ type: 'success', text: 'Resume uploaded' })
    } catch (e) { setMsg({ type: 'danger', text: e.message || 'Upload failed' }) }
  }
  return (
    <div>
      <h2 className="mb-4">Student Dashboard</h2>

      <Row className="g-3 mb-3">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Total Jobs Available</h6>
              <h3>{jobsCount}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Applied Jobs</h6>
              <h3>{appliedCount}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Resume Uploaded</h6>
              <h3>{resumeUploaded ? 'Yes' : 'No'}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={8}>
          <Card className="p-3 shadow-sm mb-3">
            <Card.Body>
              <h5>Profile Completion</h5>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="small text-muted">Complete your profile to increase chances</div>
                <div className="small">{profileCompletion}%</div>
              </div>
              <div className="progress" style={{ height: 12 }}>
                <div className="progress-bar" role="progressbar" style={{ width: `${profileCompletion}%` }} aria-valuenow={profileCompletion} aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </Card.Body>
          </Card>

          <Card className="p-3 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Recent Applications</h5>
              {recentApps.length === 0 ? (
                <div className="text-muted">You have not applied to any jobs yet.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Job</th>
                        <th>Company</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApps.map((a, idx) => (
                        <tr key={idx}>
                          <td>{a.jobTitle}</td>
                          <td>{a.companyName}</td>
                          <td>{new Date(a.appliedAt).toLocaleDateString()}</td>
                          <td><span className={`badge bg-${a.status === 'Applied' ? 'secondary' : a.status === 'Selected' ? 'success' : 'warning'}`}>{a.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <Card.Body>
              <h5>Quick Actions</h5>
              {!user && <Alert variant="info">Sign in to upload your resume (mock login).</Alert>}
              {user && (
                <>
                  <Form.Group className="mb-2">
                    <Form.Label>Upload Resume (PDF)</Form.Label>
                    <Form.Control type="file" accept="application/pdf" onChange={(e)=>setFile(e.target.files[0])} />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button size="sm" onClick={handleUpload}>Upload</Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => setPreview(null)}>Remove Preview</Button>
                    {preview && <Button size="sm" variant="link" onClick={() => window.dispatchEvent(new CustomEvent('openResumeModal', { detail: { url: preview, filename: `${user.name}_resume.pdf` } }))}>Preview</Button>}
                  </div>
                  {msg && <div className={`mt-2 text-${msg.type}`}>{msg.text}</div>}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
