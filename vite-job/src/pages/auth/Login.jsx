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
    <Container fluid className="p-0" style={{ minHeight: '80vh' }}>
      <div className="row g-0" style={{ minHeight: '80vh' }}>
        {/* Left hero area */}
        <div className="col-md-7 d-none d-md-flex align-items-center justify-content-center" 
             style={{
               backgroundImage: "url('https://img.freepik.com/premium-photo/graduation-caps-thrown-air-success-graduates-universityconcept-education-congratulation-graduates-university_43157-4479.jpg?semt=ais_hybrid&w=740&q=80')",
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               minHeight: '80vh'
             }}>
          <div className="text-white px-4" style={{ maxWidth: 560 }}>
            <h1 className="display-5 fw-bold">Your Future Starts Here</h1>
            <p className="lead mt-3">Find placements, internships and opportunities from top companies. Build your resume, apply with one click, and track your applications — all in one portal.</p>
          </div>
        </div>

        {/* Right login panel */}
        <div className="col-12 col-md-5 d-flex align-items-center justify-content-center">
          <div className="w-100 p-4" style={{ maxWidth: 520 }}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h3 className="mb-1">Sign in</h3>
                    <small className="text-muted">Sign in to continue to Campus Placement Portal</small>
                  </div>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <Form.Label className="d-block small text-uppercase text-muted">Sign in as</Form.Label>
                    <ToggleButtonGroup type="radio" name="role" value={role} onChange={(val) => setRole(val)}>
                      <ToggleButton id="role-student" value={'student'} variant={role === 'student' ? 'primary' : 'outline-primary'} className="me-2">Student</ToggleButton>
                      <ToggleButton id="role-company" value={'company'} variant={role === 'company' ? 'primary' : 'outline-secondary'}>Company</ToggleButton>
                    </ToggleButtonGroup>
                  </div>

                  <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label className="small">Email</Form.Label>
                    <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" required />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="loginPassword">
                    <Form.Label className="small">Password</Form.Label>
                    <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="rememberMe" />
                      <label className="form-check-label small text-muted" htmlFor="rememberMe">Remember me</label>
                    </div>
                    <a href="#" className="small">Forgot password?</a>
                  </div>

                  <div className="d-grid mb-2">
                    <Button type="submit" disabled={loading} size="lg">{loading ? 'Signing in...' : 'Sign in'}</Button>
                  </div>

                  <div className="text-center">
                    <small className="text-muted">Don't have an account? <a href="/auth/register">Create one</a></small>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  )
}
