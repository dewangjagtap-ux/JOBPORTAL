import React, { useState } from 'react'
import { Container, Card, Form, Button, Alert, Nav, Row, Col } from 'react-bootstrap'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import authService from '../../services/authService.js'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
    const location = useLocation()
    const initialRole = location.state?.role || 'student'
    const [role, setRole] = useState(initialRole) // 'student', 'company', or 'admin'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        description: '',
        website: '',
        phone: ''
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { login } = useAuth() // we might login automatically after register

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match')
        }
        setError(null)
        setLoading(true)

        try {
            // Prepare payload
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: role,
                phone: formData.phone
            }

            if (role === 'company') {
                payload.companyName = formData.companyName
                payload.description = formData.description
                payload.website = formData.website
            }

            const res = await authService.register(payload)
            if (res.user) {
                // Auto login or redirect to login?
                // authService.register already sets token if successful (based on my implementation)
                // Let's verify authService.register implementation
                // Yes, it does: setAuthToken(data.token); localStorage...

                // So we can assume logged in.
                // Update context? 
                // Context listens to storage, but better to call login from context?
                // Actually authService.register returns {user}, and setAuthToken.
                // We need to update React state in AuthContext.
                // AuthContext initializes from storage, but doesn't auto-update unless window event.
                // Better to reload or just navigate to dashboard and let Context check?
                // Let's force a reload or use a method from context if available.
                // I'll call a simple reload for now or navigate to login for safety.
                // Wait, AuthContext has `login` method but not `register`.
                // Let's just navigate to login with a message or assume strict login flow.

                // If I want auto-login, I should use `login` from context, but `register` was a direct service call.
                // Let's just redirect to login to be safe/simple, or dashboard if token is set.

                if (role === 'company') {
                    // Companies need approval
                    alert('Registration successful! Please wait for admin approval before logging in.')
                    navigate('/login')
                } else {
                    // For simple auto-login
                    // Trigger a storage event or just navigate?
                    // Context listens to storage event from *other tabs*.
                    // navigate('/student/dashboard') might failing if context isn't updated.
                    // Simplest: Redirect to login.
                    alert('Registration successful! Please login.')
                    navigate('/login')
                }
            }
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container fluid className="d-flex justify-content-center align-items-center py-5 animate-fade" style={{ minHeight: '90vh', background: 'var(--bg)' }}>
            <Card style={{ width: '100%', maxWidth: 540 }} className="shadow-lg border-0 border-top border-primary border-4 rounded-4 overflow-hidden">
                <Card.Body className="p-4 p-md-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-black text-primary mb-2">Create Account</h2>
                        <p className="text-muted small px-3">
                            {role === 'admin' ? 'Register as a Platform Administrator' : 'Join the most elite Campus Placement Portal today.'}
                        </p>
                    </div>

                    <Nav variant="pills" className="bg-light p-1 rounded-3 mb-4 d-flex">
                        <Nav.Item className="flex-fill">
                            <Nav.Link active={role === 'student'} onClick={() => setRole('student')} className="text-center border-0 py-2">Student</Nav.Link>
                        </Nav.Item>
                        <Nav.Item className="flex-fill">
                            <Nav.Link active={role === 'company'} onClick={() => setRole('company')} className="text-center border-0 py-2">Company</Nav.Link>
                        </Nav.Item>
                        <Nav.Item className="flex-fill">
                            <Nav.Link active={role === 'admin'} onClick={() => setRole('admin')} className="text-center border-0 py-2">Admin</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    {error && <Alert variant="danger" className="border-0 shadow-sm py-2 px-3 small">{error}</Alert>}

                    <Form onSubmit={handleSubmit} className="mt-2">
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-uppercase ls-wide opacity-75">Full Name</Form.Label>
                            <Form.Control required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" />
                        </Form.Group>

                        {role === 'company' && (
                            <div className="animate-fade">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-uppercase ls-wide opacity-75">Company Name</Form.Label>
                                    <Form.Control required name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Acme International" />
                                </Form.Group>
                                <Row className="g-3 mb-3">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-uppercase ls-wide opacity-75">Website / LinkedIn</Form.Label>
                                            <Form.Control name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-uppercase ls-wide opacity-75">Email Address</Form.Label>
                            <Form.Control required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@domain.com" />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-uppercase ls-wide opacity-75">Contact Number</Form.Label>
                            <Form.Control name="phone" value={formData.phone} onChange={handleChange} placeholder="+91..." />
                        </Form.Group>

                        <Row className="g-3 mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase ls-wide opacity-75">Password</Form.Label>
                                    <Form.Control required type="password" name="password" value={formData.password} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase ls-wide opacity-75">Confirm</Form.Label>
                                    <Form.Control required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-grid gap-3">
                            <Button className="py-3 fw-bold ls-wide" type="submit" disabled={loading} size="lg">
                                {loading ? 'Processing...' :
                                    role === 'company' ? 'Register Company' :
                                        role === 'admin' ? 'Register Administrator' : 'Get Started as Student'}
                            </Button>
                            <div className="text-center">
                                <span className="text-muted small">Already have an account? </span>
                                <Link to="/login" className="small fw-bold text-decoration-none">Sign in</Link>
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    )
}
