import React, { useEffect, useState } from 'react'
import { Table, Spinner, Alert, Dropdown, Button, Modal, Form } from 'react-bootstrap'
import companyService from '../../services/companyService'
import { useAuth } from '../../context/AuthContext'

export default function Applicants() {
  const { user } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { if (user) fetch() }, [user])

  const fetch = async () => {
    setLoading(true); setError(null)
    try {
      const data = await companyService.getApplicants()
      setApps(data || [])
    } catch (err) {
      setError(err?.message || err)
    } finally { setLoading(false) }
  }

  const updateStatus = async (applicationId, status) => {
    try {
      await companyService.updateApplicationStatus(applicationId, status)
      await fetch()
    } catch (e) {
      console.error(e)
      setError('Unable to update status')
    }
  }

  useEffect(() => {
    const h = (e) => {
      const k = e?.detail?.key
      if (!k || k === 'applications' || k === 'jobs') fetch()
    }
    window.addEventListener('localDataChanged', h)
    return () => window.removeEventListener('localDataChanged', h)
  }, [user])

  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [emailMessage, setEmailMessage] = useState('')

  const openEmail = (app) => {
    setSelectedApplicant(app)
    setEmailMessage(`Hello ${app.name},\n\nWe would like to update you about your application for ${app.jobTitle}.`)
    setShowEmailModal(true)
  }

  const sendEmail = () => {
    try {
      const raw = localStorage.getItem('sentEmails')
      const arr = raw ? JSON.parse(raw) : []
      arr.unshift({ to: selectedApplicant.email, subject: `Update: ${selectedApplicant.jobTitle}`, message: emailMessage, sentAt: new Date().toISOString() })
      localStorage.setItem('sentEmails', JSON.stringify(arr))
    } catch (e) { }
    setShowEmailModal(false)
    alert(`Email sent to ${selectedApplicant.email}`)
  }

  return (
    <div>
      <h2 className="mb-3">Applicants</h2>
      {!user && <Alert variant="info">Please sign in as a company to view applicants. Use an email containing 'company' to mock a company account.</Alert>}
      {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Table responsive hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Job</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted">No applicants yet</td></tr>
            )}
            {apps.map((a, idx) => (
              <tr key={a._id || idx}>
                <td>{a.student?.name || 'N/A'}</td>
                <td>{a.job?.title || 'N/A'}</td>
                <td>{a.student?.email || 'N/A'}</td>
                <td>
                  <Dropdown>
                    <Dropdown.Toggle variant="light" size="sm">{a.status || 'Applied'}</Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => updateStatus(a._id, 'Shortlisted')}>Shortlist</Dropdown.Item>
                      <Dropdown.Item onClick={() => updateStatus(a._id, 'Rejected')}>Reject</Dropdown.Item>
                      <Dropdown.Item onClick={() => updateStatus(a._id, 'Accepted')}>Accept</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
                <td>
                  <Button size="sm" variant="link" onClick={() => {
                    if (a.resume) {
                      // Construct the full URL if it's a relative path on the backend
                      const url = a.resume.startsWith('http') ? a.resume : `http://localhost:5000/${a.resume.replace(/\\/g, '/')}`;
                      window.open(url, '_blank');
                    } else {
                      window.alert('Resume not available')
                    }
                  }}>Preview</Button>
                  {' '}
                  <Button size="sm" onClick={() => openEmail({
                    name: a.student?.name,
                    email: a.student?.email,
                    jobTitle: a.job?.title
                  })}>Send Email</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {/* Email modal */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Send Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplicant && (
            <div>
              <p>To: <strong>{selectedApplicant.email}</strong></p>
              <Form.Group className="mb-2">
                <Form.Label>Message</Form.Label>
                <Form.Control as="textarea" rows={6} value={emailMessage} onChange={e => setEmailMessage(e.target.value)} />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={sendEmail}>Send</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
