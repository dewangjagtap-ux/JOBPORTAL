import React, { useEffect, useState } from 'react'
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import adminService from '../../services/adminService'

export default function AdminProfile() {
    const { user, updateUser } = useAuth()
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', designation: '', department: '', photo: null })
    const [success, setSuccess] = useState(null)
    const [error, setError] = useState(null)
    const [photoFile, setPhotoFile] = useState(null)
    const [removePhoto, setRemovePhoto] = useState(false)

    useEffect(() => {
        if (user) {
            fetchProfile()
        }
    }, [user])

    const fetchProfile = async () => {
        try {
            const data = await adminService.getProfile()
            if (data) {
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.adminDetails?.phone || '',
                    designation: data.adminDetails?.designation || '',
                    department: data.adminDetails?.department || '',
                    photo: data.adminDetails?.photo ? `/${data.adminDetails.photo.replace(/\\/g, '/')}` : null
                })
                setRemovePhoto(false)
            }
        } catch (err) {
            console.error('Fetch profile error:', err)
            setProfile(p => ({ ...p, email: user.email, name: user.name }))
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setError(null)
        try {
            const data = await adminService.updateProfile({
                name: profile.name,
                phone: profile.phone,
                designation: profile.designation,
                department: profile.department,
                photo: photoFile,
                removePhoto: removePhoto
            })
            if (data) {
                updateUser({ name: data.name, adminDetails: data.adminDetails })
                setSuccess('Profile updated successfully')
                setPhotoFile(null)
                setRemovePhoto(false)
                setTimeout(() => setSuccess(null), 2500)
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to save profile')
        }
    }

    const onFileChange = (e) => {
        const f = e.target.files && e.target.files[0]
        if (!f) return
        setPhotoFile(f)
        setRemovePhoto(false)
        const reader = new FileReader()
        reader.onload = () => setProfile(p => ({ ...p, photo: reader.result }))
        reader.readAsDataURL(f)
    }

    const handleRemovePhoto = () => {
        setProfile(p => ({ ...p, photo: null }))
        setPhotoFile(null)
        setRemovePhoto(true)
    }

    return (
        <Card className="shadow-sm border-0 animate-fade">
            <Card.Body className="p-4">
                <h3 className="mb-4 fw-bold">Admin Profile</h3>
                {success && <Alert variant="success" className="border-0 shadow-sm">{success}</Alert>}
                {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

                <Form onSubmit={handleSave}>
                    <Row>
                        <Col md={4} className="text-center mb-4 mb-md-0">
                            <div className="position-relative d-inline-block">
                                <div style={{ width: 180, height: 180, borderRadius: '50%', overflow: 'hidden', background: '#f8f9fa', border: '4px solid #fff' }} className="shadow-sm mx-auto mb-3 d-flex align-items-center justify-content-center">
                                    {profile.photo ? (
                                        <img src={profile.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div className="text-muted flex-column">
                                            <span className="fs-1">👤</span>
                                            <small className="d-block">No Photo</small>
                                        </div>
                                    )}
                                </div>
                                <div className="d-flex flex-column gap-2">
                                    <Form.Group>
                                        <Form.Label className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm w-100">
                                            {profile.photo ? 'Change Photo' : 'Add Photo'}
                                            <input type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
                                        </Form.Label>
                                    </Form.Group>
                                    {profile.photo && (
                                        <Button variant="outline-danger" size="sm" className="rounded-pill px-3 shadow-sm w-100" onClick={handleRemovePhoto}>
                                            Remove Photo
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Col>

                        <Col md={8}>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-muted text-uppercase">Full Name</Form.Label>
                                        <Form.Control
                                            value={profile.name}
                                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                                            required
                                            placeholder="Enter full name"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-muted text-uppercase">Email Address</Form.Label>
                                        <Form.Control value={profile.email} disabled type="email" />
                                        <Form.Text className="text-muted">Email cannot be changed.</Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-muted text-uppercase">Phone Number</Form.Label>
                                        <Form.Control
                                            value={profile.phone}
                                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                            placeholder="e.g. +1 123 456 7890"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-muted text-uppercase">Designation</Form.Label>
                                        <Form.Control
                                            value={profile.designation}
                                            onChange={e => setProfile({ ...profile, designation: e.target.value })}
                                            placeholder="e.g. Placement Officer"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-muted text-uppercase">Department</Form.Label>
                                        <Form.Control
                                            value={profile.department}
                                            onChange={e => setProfile({ ...profile, department: e.target.value })}
                                            placeholder="e.g. Training & Placements"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="mt-4 pt-3 border-top text-end">
                                <Button type="submit" className="px-5 rounded-pill shadow-sm py-2 fw-bold">
                                    Save Profile
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    )
}
