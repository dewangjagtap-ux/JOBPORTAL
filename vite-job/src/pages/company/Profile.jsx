import React, { useEffect, useState } from 'react'
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'

const STORAGE_KEY = 'companies'

export default function CompanyProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({ companyName: '', hrName: '', email: '', phone: '', website: '', description: '', address: '', logo: null })
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const list = raw ? JSON.parse(raw) : []
      const existing = list.find(c => Number(c.id) === Number(user?.id))
      if (existing) setProfile({ companyName: existing.name || '', hrName: existing.hrName || '', email: existing.email || '', phone: existing.phone || '', website: existing.website || '', description: existing.description || '', address: existing.address || '', logo: existing.logo || null })
      else if (user) setProfile(p => ({ ...p, email: user.email, companyName: user.name }))
    } catch (e) {}
  }, [user])

  const handleSave = (e) => {
    e.preventDefault()
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const list = raw ? JSON.parse(raw) : []
      const existingIndex = list.findIndex(c => Number(c.id) === Number(user?.id))
      const record = { id: user?.id || Date.now(), name: profile.companyName, hrName: profile.hrName, email: profile.email, phone: profile.phone, website: profile.website, description: profile.description, address: profile.address, logo: profile.logo }
      if (existingIndex >= 0) list[existingIndex] = record
      else list.push(record)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      setSuccess('Profile saved')
      setTimeout(() => setSuccess(null), 2500)
    } catch (e) { console.error(e) }
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
