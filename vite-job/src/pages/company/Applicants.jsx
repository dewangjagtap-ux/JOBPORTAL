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
      // read global applications and filter by companyId
      const apps = JSON.parse(localStorage.getItem('applications') || '[]')
      const mine = apps.filter(a => Number(a.companyId) === Number(user?.id))
      setApps(mine || [])
    } catch (err) {
      setError(err?.message || err)
    } finally { setLoading(false) }
  }

  const updateStatus = async (jobId, studentId, status) => {
    try {
      await companyService.updateApplicationStatus(jobId, studentId, status)
      // update local state by re-fetching latest applications so it's consistent
      const apps = JSON.parse(localStorage.getItem('applications') || '[]')
      const mine = apps.filter(a => Number(a.companyId) === Number(user?.id))
      setApps(mine)
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
    } catch (e) {}
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
                  <tr key={idx}>
                    <td>{a.name}</td>
                    <td>{a.jobTitle}</td>
                    <td>{a.email}</td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant="light" size="sm">{a.status || 'Applied'}</Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => updateStatus(a.jobId, a.studentId, 'Shortlisted')}>Shortlist</Dropdown.Item>
                          <Dropdown.Item onClick={() => updateStatus(a.jobId, a.studentId, 'Rejected')}>Reject</Dropdown.Item>
                          <Dropdown.Item onClick={() => updateStatus(a.jobId, a.studentId, 'Selected')}>Select</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                    <td>
                      <Button size="sm" variant="link" onClick={() => {
                        // try to open stored resume for the student
                        const key = `cpp_resume_${a.studentId}`
                        const data = localStorage.getItem(key)
                        if (data) {
                          const obj = JSON.parse(data)
                          const w = window.open('about:blank')
                          if (w) w.document.write(`<iframe src="${obj.dataURL}" style="width:100%;height:100%"></iframe>`)
                        } else {
                          window.alert('Resume not available')
                        }
                      }}>Preview</Button>
                      {' '}
                      <Button size="sm" onClick={() => openEmail(a)}>Send Email</Button>
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
