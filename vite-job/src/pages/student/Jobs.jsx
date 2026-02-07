import React, { useEffect, useState } from 'react'
import { Row, Col, Spinner, Alert, Form, Toast, ToastContainer } from 'react-bootstrap'
import jobService from '../../services/jobService'
import JobCard from '../../components/JobCard'
import ApplicationModal from '../../components/ApplicationModal'
import { useAuth } from '../../context/AuthContext'

export default function StudentJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await jobService.getJobs()
      setJobs(data || [])
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const { user } = useAuth()

  const [showAppModal, setShowAppModal] = useState(false)
  const [appEmail, setAppEmail] = useState(null)
  const [showToast, setShowToast] = useState(false)

  const filtered = jobs.filter(j => j.title?.toLowerCase().includes(query.toLowerCase()) || j.companyName?.toLowerCase().includes(query.toLowerCase()))

  const handleApplied = (jobId) => {
    // refresh jobs list
    fetchJobs()
    // find job
    const job = jobs.find(j => Number(j.id) === Number(jobId))
    if (!job || !user) return
    const email = {
      to: user.email,
      subject: `Application Received - ${job.title}`,
      message: `Thank you for applying to ${job.title} at ${job.companyName}. We have received your application and will get back to you.`,
      sentAt: new Date().toISOString(),
      jobId: job.id,
    }
    try {
      const raw = localStorage.getItem('sentEmails')
      const arr = raw ? JSON.parse(raw) : []
      arr.unshift(email)
      localStorage.setItem('sentEmails', JSON.stringify(arr))
    } catch (e) {}
    setAppEmail(email)
    setShowAppModal(true)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Jobs</h2>
        <Form.Control style={{ maxWidth: 360 }} placeholder="Search jobs or companies" value={query} onChange={e => setQuery(e.target.value)} />
      </div>
      {loading && <div className="text-center py-5"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Row xs={1} md={2} lg={3} className="g-3">
          {filtered.map(job => (
            <Col key={job.id}>
              <JobCard job={job} onApplied={(id) => handleApplied(id)} />
            </Col>
          ))}
        </Row>
      )}
      <ApplicationModal show={showAppModal} onHide={() => setShowAppModal(false)} email={appEmail} />

      <ToastContainer position="top-end" className="p-3">
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={2000} autohide>
          <Toast.Header>
            <strong className="me-auto">Campus Portal</strong>
          </Toast.Header>
          <Toast.Body className="text-white">Confirmation email sent</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  )
}
