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
  const [jobType, setJobType] = useState('Full-time')
  const [lastDate, setLastDate] = useState('')
  const [maxApplicants, setMaxApplicants] = useState(0)
  const [posting, setPosting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingJobId, setEditingJobId] = useState(null)

  useEffect(() => { fetchJobs() }, [user])

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

  const resetForm = () => {
    setTitle(''); setLocation(''); setSalary(''); setExperience(''); setSkills(''); setDescription(''); setLastDate(''); setMaxApplicants(0); setJobType('Full-time'); setEditingJobId(null)
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
        jobType,
        deadline: lastDate,
        maxApplicants: parseInt(maxApplicants) || 0
      }

      if (editingJobId) {
        await jobService.updateJob(editingJobId, job)
      } else {
        await jobService.postJob(job)
      }

      resetForm()
      setShowModal(false)
      await fetchJobs()
    } catch (err) {
      console.error(err)
      setError(err?.message || err)
    } finally { setPosting(false) }
  }

  const handleEdit = (job) => {
    setEditingJobId(job._id)
    setTitle(job.title || '')
    setLocation(job.location || '')
    setSalary(job.salary || '')
    setExperience(job.experience || '')
    setSkills(Array.isArray(job.skills) ? job.skills.join(', ') : '')
    setDescription(job.description || '')
    setJobType(job.jobType || 'Full-time')
    setLastDate(job.deadline ? job.deadline.split('T')[0] : '')
    setMaxApplicants(job.maxApplicants || 0)
    setShowModal(true)
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
            <Button onClick={() => { resetForm(); setShowModal(true); }}>Add New Job</Button>
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
                        <td>{j.applicantCount || 0}</td>
                        <td>
                          <Button size="sm" variant="outline-primary" onClick={() => navigate('/company/applicants')}>Applicants</Button>{' '}
                          <Button size="sm" variant="outline-secondary" onClick={() => handleEdit(j)}>Edit</Button>{' '}
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

      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }}>
        <Modal.Header closeButton>
          <Modal.Title>{editingJobId ? 'Edit Job' : 'Add New Job'}</Modal.Title>
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
              <Form.Label>Job Type</Form.Label>
              <Form.Select value={jobType} onChange={e => setJobType(e.target.value)}>
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Last Date to Apply</Form.Label>
              <Form.Control type="date" value={lastDate} onChange={e => setLastDate(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Applicant Limit (0 for no limit)</Form.Label>
              <Form.Control type="number" value={maxApplicants} onChange={e => setMaxApplicants(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Job Description</Form.Label>
              <Form.Control as="textarea" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
            </Form.Group>
            <div className="d-grid">
              <Button type="submit" disabled={posting}>{posting ? 'Processing...' : (editingJobId ? 'Update Job' : 'Post Job')}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}
