import React, { useState } from 'react'
import { Form, Button, Card, Alert, Container, ToggleButtonGroup, ToggleButton } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'
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
        else if (user.role === 'admin') navigate('/admin/companies')
        else navigate('/')
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fluid className="p-0 animate-fade" style={{ minHeight: '90vh' }}>
      <div className="row g-0" style={{ minHeight: '90vh' }}>
        {/* Left hero area with modern gradient overlay */}
        <div className="col-md-7 d-none d-md-flex align-items-center justify-content-center p-5 position-relative overflow-hidden"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2070')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '90vh'
          }}>
          <div className="position-absolute w-100 h-100 top-0 start-0" style={{ background: 'linear-gradient(225deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.9) 100%)' }}></div>
          <div className="text-white position-relative glass-effect p-5 rounded-4 border border-white border-opacity-10" style={{ maxWidth: 640 }}>
            <h1 className="display-4 fw-black mb-4 ls-tight">Your Career Path Starts <span className="text-info">Right Here.</span></h1>
            <p className="lead opacity-90 mb-0" style={{ fontSize: '1.25rem', lineHeight: '1.6' }}>
              The definitive <strong className="text-white">Campus Placement Portal</strong> for top-tier talent and recruiters.
              Refine your profile, discover elite opportunities, and accelerate your professional journey with precision-matched placements.
            </p>
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
                  <div className="mb-4">
                    <Form.Label className="d-block small text-uppercase text-muted fw-bold mb-3">I am a</Form.Label>
                    <div className="d-flex gap-2">
                      <Button
                        variant={role === 'student' ? 'primary' : 'outline-primary'}
                        className="flex-fill"
                        onClick={() => setRole('student')}
                      >
                        🎓 Student
                      </Button>
                      <Button
                        variant={role === 'company' ? 'primary' : 'outline-primary'}
                        className="flex-fill"
                        onClick={() => setRole('company')}
                      >
                        🏢 Recruiter
                      </Button>
                      <Button
                        variant={role === 'admin' ? 'primary' : 'outline-primary'}
                        className="flex-fill"
                        onClick={() => setRole('admin')}
                      >
                        🛡️ Admin
                      </Button>
                    </div>
                  </div>

                  <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label className="small fw-bold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === 'company' ? "hr@acme.com" : "you@college.edu"}
                      required
                      className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="loginPassword">
                    <Form.Label className="small fw-bold">Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="py-2"
                    />
                  </Form.Group>

                  <div className="d-grid mb-3">
                    <Button type="submit" disabled={loading} size="lg" className="py-3 shadow-sm btn-primary">
                      {loading ? 'Verifying...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                    </Button>
                  </div>

                  <div className="text-center">
                    <small className="text-muted">
                      {role === 'admin' ? (
                        <>Want to be an admin? <Link to="/register" state={{ role: 'admin' }} className="fw-bold">Register as Admin</Link></>
                      ) : (
                        <>Looking for talent? <Link to="/register" state={{ role: 'company' }} className="fw-bold">Register your company</Link></>
                      )}
                    </small>
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
