import React, { useState } from 'react'
import { Container, Card, Form, Button, Alert, Nav, Row, Col } from 'react-bootstrap'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import authService from '../../services/authService.js'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
    const location = useLocation()
    const initialRole = location.state?.role || 'student'
    const [role, setRole] = useState(initialRole) // 'student' or 'company'
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
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '100%', maxWidth: 500 }} className="shadow-sm">
                <Card.Body>
                    <div className="text-center mb-4">
                        <h3>Create Account</h3>
                        <p className="text-muted">Join as a Student or Company</p>
                    </div>

                    <Nav variant="pills" className="justify-content-center mb-4">
                        <Nav.Item>
                            <Nav.Link active={role === 'student'} onClick={() => setRole('student')}>Student</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link active={role === 'company'} onClick={() => setRole('company')}>Company</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Contact Person Name</Form.Label>
                            <Form.Control required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" className="py-2" />
                        </Form.Group>

                        {role === 'company' && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Company Name</Form.Label>
                                    <Form.Control required name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Acme International" className="py-2" />
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Company Website</Form.Label>
                                            <Form.Control name="website" value={formData.website} onChange={handleChange} placeholder="https://acme.com" className="py-2" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Industry</Form.Label>
                                            <Form.Control name="description" value={formData.description} onChange={handleChange} placeholder="e.g. Tech, Finance" className="py-2" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Work Email Address</Form.Label>
                            <Form.Control required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@company.com" className="py-2" />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Phone Number</Form.Label>
                            <Form.Control name="phone" value={formData.phone} onChange={handleChange} placeholder="+91..." className="py-2" />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Set Password</Form.Label>
                            <Form.Control required type="password" name="password" value={formData.password} onChange={handleChange} className="py-2" />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold">Confirm Password</Form.Label>
                            <Form.Control required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="py-2" />
                        </Form.Group>

                        <Button className="w-100 py-3 shadow-sm" type="submit" disabled={loading} size="lg">
                            {loading ? 'Creating Account...' : role === 'company' ? 'Register Company' : 'Register as Student'}
                        </Button>
                    </Form>


                </Card.Body>
            </Card>
        </Container>
    )
}
