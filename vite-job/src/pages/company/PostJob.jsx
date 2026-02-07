import React, { useState } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import jobService from '../../services/jobService'

export default function PostJob() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null); setSuccess(null)
    try {
      await jobService.postJob({ title, description, location })
      setSuccess('Job posted successfully')
      setTitle(''); setDescription(''); setLocation('')
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
          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control value={location} onChange={e => setLocation(e.target.value)} />
          </Form.Group>
          <div className="d-grid">
            <Button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Job'}</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}
