import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  const [placementData, setPlacementData] = useState(null)
  const [placementLoading, setPlacementLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    refreshStats()
  }, [user])

  const calculateProfileCompletion = () => {
    if (!user) return setProfileCompletion(0)

    // Use optional fields for completion
    const keys = ['phone', 'resume', 'branch', 'college', 'skills', 'cgpa', 'about', 'photo']

    // Check localStorage profile for additional fields
    let profileData = {}
    try {
      const raw = localStorage.getItem(`cpp_profile_${user?._id}`)
      if (raw) profileData = JSON.parse(raw)
    } catch (e) { }

    let filled = 0
    keys.forEach(k => {
      // Check both user context and localStorage profile
      if (user[k] || profileData[k]) {
        if (k === 'skills' && Array.isArray(profileData[k]) && profileData[k].length === 0) return
        filled++
      }
    })

    const percent = Math.round((filled / keys.length) * 100)
    setProfileCompletion(percent)
  }

  const refreshStats = async () => {
    try {
      const jobs = await studentService.getJobs()
      setJobsCount(jobs.length)

      const apps = await studentService.getApplications()
      setAppliedCount(apps.length)
      setRecentApps(apps.slice(0, 5))

      if (user?.resume) {
        setResumeUploaded(true)
        setPreview(user.resume)
      }
    } catch (e) { console.error('Stats refresh failed', e) }
    calculateProfileCompletion()

    if (user?._id) {
      setPlacementLoading(true)
      try {
        const aiData = await studentService.getPlacementProbability(user._id)
        setPlacementData(aiData)
      } catch (e) { console.error('AI Data fetch failed', e) }
      finally { setPlacementLoading(false) }
    }
  }

  const handleUpload = async () => {
    if (!file) return setMsg({ type: 'danger', text: 'Choose a PDF file to upload' })
    if (file.type !== 'application/pdf') return setMsg({ type: 'danger', text: 'Only PDF allowed' })
    try {
      // For local-only preview until backend is fully ready for profile-level resumes
      const reader = new FileReader()
      reader.onload = () => {
        const dataURL = reader.result
        const resumeData = { name: file.name, dataURL }
        localStorage.setItem(`cpp_resume_${user?._id}`, JSON.stringify(resumeData))
        setPreview(dataURL)
        setResumeUploaded(true)
        setMsg({ type: 'success', text: 'Resume uploaded locally for this session' })
      }
      reader.readAsDataURL(file)
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

          <Card className="p-3 shadow-sm mb-3 border-left-primary">
            <Card.Body>
              <h5 className="mb-3">🎯 Placement Probability</h5>
              {placementLoading ? (
                <div className="text-muted">Calculating your placement probability...</div>
              ) : placementData ? (
                <div className="mt-3">
                  <div className="d-flex align-items-center mb-3">
                    <h2 className="mb-0 me-3 fw-bold text-primary">{placementData.probability}%</h2>
                    <span className={`badge ${placementData.level === 'High' ? 'bg-success' : placementData.level === 'Medium' ? 'bg-warning text-dark' : 'bg-danger'} fs-6`}>
                      {placementData.level} Chance
                    </span>
                  </div>
                  {placementData.suggestions && placementData.suggestions.length > 0 && (
                    <div className="bg-light p-3 rounded">
                      <h6 className="text-muted mb-2">Suggestions to improve:</h6>
                      <ul className="mb-0 text-muted small ps-3">
                        {placementData.suggestions.map((s, idx) => (
                          <li key={idx} className="mb-1">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted">Not enough data to calculate probability. Consider completing your profile.</div>
              )}
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
                        <tr key={a._id || idx}>
                          <td>{a.job?.title || 'N/A'}</td>
                          <td>{a.job?.companyName || 'N/A'}</td>
                          <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'}</td>
                          <td><span className={`badge bg-${a.status === 'Applied' ? 'secondary' : a.status === 'Accepted' ? 'success' : 'warning'}`}>{a.status}</span></td>
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
                    <Form.Control type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button size="sm" onClick={handleUpload}>Upload</Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => setPreview(null)}>Remove Preview</Button>
                    {preview && (
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => {
                          const url = (typeof preview === 'string' && !preview.startsWith('data:'))
                            ? `/${preview.replace(/\\/g, '/')}`
                            : preview;
                          window.dispatchEvent(new CustomEvent('openResumeModal', {
                            detail: { url, filename: `${user.name}_resume.pdf` }
                          }));
                        }}
                      >
                        Preview
                      </Button>
                    )}
                  </div>
                  {msg && <div className={`mt-2 text-${msg.type}`}>{msg.text}</div>}
                </>
              )}
            </Card.Body>
          </Card>

          <Card className="p-3 shadow-sm mt-3 border-left-info animate-fade-right">
            <Card.Body>
              <h5 className="mb-2 text-info">
                <i className="bi bi-robot me-2"></i>
                AI Interview Practice
              </h5>
              <p className="text-muted small mb-3">
                Upload your resume to generate personalized interview questions and practice via AI mock interviews.
              </p>
              <Button as={Link} to="/student/resume-ai" variant="outline-info" size="sm" className="w-100 fw-bold">
                Start AI Mock Interview
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
