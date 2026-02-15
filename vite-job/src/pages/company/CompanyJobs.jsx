import React, { useEffect, useState } from 'react'
import { Row, Col, Spinner, Alert, Card, Form, Button, Table, Modal } from 'react-bootstrap'
import jobService from '../../services/jobService'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function CompanyJobs() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // modal & form state
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [salary, setSalary] = useState('')
  const [experience, setExperience] = useState('')
  const [skills, setSkills] = useState('')
  const [description, setDescription] = useState('')
  const [lastDate, setLastDate] = useState('')
  const [posting, setPosting] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchJobs() }, [user])

  useEffect(() => {
    const h = (e) => {
      const k = e?.detail?.key
      if (!k || k === 'jobs' || k === 'applications') fetchJobs()
    }
    window.addEventListener('localDataChanged', h)
    return () => window.removeEventListener('localDataChanged', h)
  }, [user])

  const fetchJobs = async () => {
    if (!user?._id && !user?.id) return
    setLoading(true); setError(null)
    try {
      const data = await jobService.getJobs(user._id || user.id)
      setJobs(data || [])
    } catch (err) {
      setError(err?.message || err)
    } finally { setLoading(false) }
  }

  const handlePost = async (e) => {
    e.preventDefault()
    setPosting(true)
    try {
      const job = {
        title,
        location,
        salary,
        experience,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        description,
        lastDate,
        companyId: user?.id,
        companyName: user?.name
      }
      await jobService.postJob(job)
      // clear form and close modal
      setTitle(''); setLocation(''); setSalary(''); setExperience(''); setSkills(''); setDescription(''); setLastDate('')
      setShowModal(false)
      await fetchJobs()
    } catch (err) {
      console.error(err)
      setError(err?.message || err)
    } finally { setPosting(false) }
  }

  const handleDelete = async (jobId) => {
    if (!confirm('Delete this job?')) return
    try {
      await jobService.deleteJob(jobId)
      await fetchJobs()
    } catch (e) { console.error(e); setError('Unable to delete job') }
  }

  return (
    <div>
      {!user && <div className="alert alert-info">Please sign in as a company to manage jobs.</div>}
      <h2 className="mb-3">Jobs</h2>
      <Row>
        <Col md={12} className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div />
            <Button onClick={() => setShowModal(true)}>Add Job</Button>
          </div>
        </Col>

        <Col md={12}>
          <Card className="p-3 shadow-sm mb-3">
            <Card.Body>
              <h5>Manage Jobs</h5>
              {loading ? <div className="text-center py-3"><Spinner animation="border" /></div> : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Applicants</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.length === 0 && (
                      <tr><td colSpan={4} className="text-center text-muted">No jobs posted yet</td></tr>
                    )}
                    {jobs.map(j => (
                      <tr key={j._id}>
                        <td>{j.title}</td>
                        <td className="text-muted small">{j.location}</td>
                        <td>{(JSON.parse(localStorage.getItem('applications') || '[]').filter(a => String(a.jobId) === String(j._id))).length}</td>
                        <td>
                          <Button size="sm" variant="outline-primary" onClick={() => navigate('/company/applicants')}>View Applicants</Button>{' '}
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(j._id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handlePost}>
            <Form.Group className="mb-2">
              <Form.Label>Job Title</Form.Label>
              <Form.Control value={title} onChange={e => setTitle(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Location</Form.Label>
              <Form.Control value={location} onChange={e => setLocation(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Salary</Form.Label>
              <Form.Control value={salary} onChange={e => setSalary(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Experience Required</Form.Label>
              <Form.Control value={experience} onChange={e => setExperience(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Skills Required (comma separated)</Form.Label>
              <Form.Control value={skills} onChange={e => setSkills(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Last Date to Apply</Form.Label>
              <Form.Control type="date" value={lastDate} onChange={e => setLastDate(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Job Description</Form.Label>
              <Form.Control as="textarea" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
            </Form.Group>
            <div className="d-grid">
              <Button type="submit" disabled={posting}>{posting ? 'Posting...' : 'Post Job'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}
