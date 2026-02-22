import React, { useEffect, useState } from 'react'
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import companyService from '../../services/companyService'

export default function CompanyProfile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({ companyName: '', hrName: '', email: '', phone: '', website: '', description: '', address: '', logo: null })
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [removeLogo, setRemoveLogo] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const data = await companyService.getProfile()
      if (data) {
        setProfile({
          companyName: data.companyDetails?.companyName || data.name || '',
          hrName: data.companyDetails?.hrName || '',
          email: data.email || '',
          phone: data.phone || '',
          website: data.companyDetails?.website || '',
          description: data.companyDetails?.description || '',
          address: data.companyDetails?.address || '',
          logo: data.companyDetails?.logo ? `/${data.companyDetails.logo.replace(/\\/g, '/')}` : null
        })
        setRemoveLogo(false)
      }
    } catch (err) {
      console.error('Fetch profile error:', err)
      // Fallback to minimal user info
      setProfile(p => ({ ...p, email: user.email, companyName: user.name }))
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const data = await companyService.updateProfile({
        name: profile.companyName,
        hrName: profile.hrName,
        phone: profile.phone,
        address: profile.address,
        logo: logoFile,
        removeLogo: removeLogo
      })
      if (data) {
        updateUser({ name: data.name, companyDetails: data.companyDetails })
        setSuccess('Profile updated successfully')
        setLogoFile(null)
        setRemoveLogo(false)
        setTimeout(() => setSuccess(null), 2500)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save profile')
    }
  }

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    setLogoFile(f)
    setRemoveLogo(false)
    const reader = new FileReader()
    reader.onload = () => setProfile(p => ({ ...p, logo: reader.result }))
    reader.readAsDataURL(f)
  }

  const handleRemoveLogo = () => {
    setProfile(p => ({ ...p, logo: null }))
    setLogoFile(null)
    setRemoveLogo(true)
  }

  return (
    <Card className="shadow-sm border-0 animate-fade">
      <Card.Body className="p-4">
        <h3 className="mb-4 fw-bold">Company Profile</h3>
        {success && <Alert variant="success" className="border-0 shadow-sm">{success}</Alert>}
        {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}
        <Form onSubmit={handleSave}>
          <Row>
            <Col md={4} className="text-center mb-4 mb-md-0">
              <div className="position-relative d-inline-block">
                <div style={{ width: 180, height: 180, borderRadius: '50%', overflow: 'hidden', background: '#f8f9fa', border: '4px solid #fff' }} className="shadow-sm mx-auto mb-3 d-flex align-items-center justify-content-center">
                  {profile.logo ? (
                    <img src={profile.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="text-muted flex-column">
                      <span className="fs-1">🏢</span>
                      <small className="d-block">No Logo</small>
                    </div>
                  )}
                </div>
                <div className="d-flex flex-column gap-2">
                  <Form.Group>
                    <Form.Label className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm w-100">
                      {profile.logo ? 'Change Logo' : 'Add Logo'}
                      <input type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
                    </Form.Label>
                  </Form.Group>
                  {profile.logo && (
                    <Button variant="outline-danger" size="sm" className="rounded-pill px-3 shadow-sm w-100" onClick={handleRemoveLogo}>
                      Remove Logo
                    </Button>
                  )}
                </div>
              </div>
            </Col>

            <Col md={8}>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Company Name</Form.Label>
                    <Form.Control value={profile.companyName} onChange={e => setProfile({ ...profile, companyName: e.target.value })} required placeholder="Company Name" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted text-uppercase">HR Name</Form.Label>
                    <Form.Control value={profile.hrName} onChange={e => setProfile({ ...profile, hrName: e.target.value })} placeholder="HR Contact Name" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted text-uppercase">HR Email</Form.Label>
                    <Form.Control value={profile.email} disabled type="email" />
                    <Form.Text className="text-muted">Email cannot be changed.</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Phone Number</Form.Label>
                    <Form.Control value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="Phone" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Website</Form.Label>
                    <Form.Control value={profile.website} onChange={e => setProfile({ ...profile, website: e.target.value })} placeholder="https://example.com" />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Address</Form.Label>
                    <Form.Control value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="Company Address" />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Company Description</Form.Label>
                    <Form.Control as="textarea" rows={4} value={profile.description} onChange={e => setProfile({ ...profile, description: e.target.value })} placeholder="Tell us about the company..." />
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
