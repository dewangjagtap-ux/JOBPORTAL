import React, { useState } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import jobService from '../../services/jobService'

export default function PostJob() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const [salary, setSalary] = useState('')
  const [jobType, setJobType] = useState('Full-time')
  const [skills, setSkills] = useState('')
  const [maxApplicants, setMaxApplicants] = useState(0)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null); setSuccess(null)
    try {
      await jobService.postJob({
        title,
        description,
        location,
        salary,
        jobType,
        maxApplicants: parseInt(maxApplicants) || 0,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean)
      })
      setSuccess('Job posted successfully')
      setTimeout(() => navigate('/company/jobs'), 1500)
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally { setLoading(false) }
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h3 className="mb-3">Post a Job</h3>
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Job Title</Form.Label>
            <Form.Control value={title} onChange={e => setTitle(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={6} value={description} onChange={e => setDescription(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Salary Range</Form.Label>
            <Form.Control value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 10 LPA" />
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
            <Form.Label>Skills Required (comma separated)</Form.Label>
            <Form.Control value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node.js, MongoDB" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Location</Form.Label>
            <Form.Control value={location} onChange={e => setLocation(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Applicant Limit (0 for no limit)</Form.Label>
            <Form.Control type="number" value={maxApplicants} onChange={e => setMaxApplicants(e.target.value)} />
          </Form.Group>
          <div className="d-grid">
            <Button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Job'}</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}
