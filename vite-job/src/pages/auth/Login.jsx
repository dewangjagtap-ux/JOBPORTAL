import React, { useState } from 'react'
import { Form, Button, Card, Alert, Container, ToggleButtonGroup, ToggleButton } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('student')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // Create the authUser object and persist per spec, using authService to keep AuthContext in sync
      const res = await login({ email, password, role })
      const user = res?.user
      if (user) {
        // redirect to role-specific dashboard
        if (user.role === 'student') navigate('/student/dashboard')
        else if (user.role === 'company') navigate('/company/dashboard')
        else navigate('/')
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-5">
      <Card className="mx-auto shadow" style={{ maxWidth: 480 }}>
        <Card.Body>
          <h3 className="mb-3">Sign in</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Form.Label className="d-block">Sign in as</Form.Label>
              <ToggleButtonGroup type="radio" name="role" value={role} onChange={(val) => setRole(val)}>
                <ToggleButton id="role-student" value={'student'} variant="outline-primary">Student</ToggleButton>
                <ToggleButton id="role-company" value={'company'} variant="outline-secondary">Company</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>
            <div className="d-grid">
              <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}
