import React, { useEffect, useState } from 'react'
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import companyService from '../../services/companyService'

export default function CompanyProfile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({ companyName: '', hrName: '', email: '', phone: '', website: '', description: '', address: '', logo: null })
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

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
          logo: data.companyDetails?.logo || null
        })
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
        website: profile.website,
        description: profile.description,
        address: profile.address
      })
      if (data) {
        updateUser({ name: data.name, companyDetails: data.companyDetails })
        setSuccess('Profile saved successfully to database')
        setTimeout(() => setSuccess(null), 2500)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save profile')
    }
  }

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setProfile(p => ({ ...p, logo: reader.result }))
    reader.readAsDataURL(f)
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h3 className="mb-3">Company Profile</h3>
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSave}>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-2">
                <Form.Label>Company Name</Form.Label>
                <Form.Control value={profile.companyName} onChange={e => setProfile({ ...profile, companyName: e.target.value })} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>HR Name</Form.Label>
                <Form.Control value={profile.hrName} onChange={e => setProfile({ ...profile, hrName: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>HR Email</Form.Label>
                <Form.Control value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} type="email" />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Website</Form.Label>
                <Form.Control value={profile.website} onChange={e => setProfile({ ...profile, website: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Address</Form.Label>
                <Form.Control value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Company Description</Form.Label>
                <Form.Control as="textarea" rows={4} value={profile.description} onChange={e => setProfile({ ...profile, description: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <div style={{ width: 160, height: 160, margin: '0 auto 10px', borderRadius: 8, overflow: 'hidden', background: '#f5f5f5' }}>
                  {profile.logo ? <img src={profile.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="text-muted p-4">Logo preview</div>}
                </div>
                <Form.Group>
                  <Form.Label className="btn btn-outline-secondary btn-sm">Upload Logo<input type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} /></Form.Label>
                </Form.Group>
              </div>
            </Col>
          </Row>
          <div className="d-grid mt-3">
            <Button type="submit">Save Profile</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}
