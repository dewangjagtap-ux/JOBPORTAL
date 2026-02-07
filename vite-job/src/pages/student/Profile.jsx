import React, { useEffect, useState } from 'react'
import { Card, Form, Button, Row, Col, Alert, Badge } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'

// Student profile page — frontend-only. saves to localStorage under 'cpp_profile_<studentId>'
export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    branch: '',
    year: '',
    college: '',
    cgpa: '',
    skills: [],
    about: '',
    linkedin: '',
    github: '',
    photoDataURL: null,
    resumeName: null,
  })
  const [skillInput, setSkillInput] = useState('')
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (!user) return
    try {
      const raw = localStorage.getItem(`cpp_profile_${user.id}`)
      if (raw) setProfile(JSON.parse(raw))
      else setProfile(p => ({ ...p, fullName: user.name, email: user.email }))
    } catch (e) {}
  }, [user])

  const save = () => {
    if (!user) return setMsg({ type: 'danger', text: 'Sign in to save profile' })
    try {
      localStorage.setItem(`cpp_profile_${user.id}`, JSON.stringify(profile))
      setMsg({ type: 'success', text: 'Profile saved' })
      setTimeout(() => setMsg(null), 2500)
    } catch (e) { setMsg({ type: 'danger', text: 'Failed to save' }) }
  }

  const handlePhoto = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setProfile(p => ({ ...p, photoDataURL: reader.result }))
    reader.readAsDataURL(file)
  }

  const handleResume = (file) => {
    if (!file) return setMsg({ type: 'danger', text: 'No file selected' })
    if (file.type !== 'application/pdf') return setMsg({ type: 'danger', text: 'Only PDF allowed' })
    const reader = new FileReader()
    reader.onload = () => setProfile(p => ({ ...p, resumeName: file.name, resumeDataURL: reader.result }))
    reader.readAsDataURL(file)
  }

  const addSkill = () => {
    const raw = skillInput.trim()
    if (!raw) return
    // allow comma-separated skills
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean)
    const newSkills = [...profile.skills]
    parts.forEach(s => { if (!newSkills.includes(s)) newSkills.push(s) })
    setProfile(p => ({ ...p, skills: newSkills }))
    setSkillInput('')
  }

  const removeSkill = (s) => setProfile(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))

  return (
    <div>
      <h2 className="mb-3">Student Profile</h2>
      <Card className="shadow-sm">
        <Card.Body>
          {msg && <Alert variant={msg.type}>{msg.text}</Alert>}
          <Row>
            <Col md={4}>
              <div className="text-center">
                <div style={{ width: 160, height: 160, margin: '0 auto', overflow: 'hidden', borderRadius: 8, background: '#f1f3f5' }}>
                  {profile.photoDataURL ? <img src={profile.photoDataURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                    <div className="p-3 text-muted">No photo</div>
                  )}
                </div>
                <Form.Group className="mt-2">
                  <Form.Label className="small">Upload Photo</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={e => handlePhoto(e.target.files[0])} />
                </Form.Group>
                <hr />
                <Form.Group>
                  <Form.Label className="small">Upload Resume (PDF)</Form.Label>
                  <Form.Control type="file" accept="application/pdf" onChange={e => handleResume(e.target.files[0])} />
                  {profile.resumeName && <div className="mt-2"><Badge bg="secondary">{profile.resumeName}</Badge></div>}
                </Form.Group>
              </div>
            </Col>
            <Col md={8}>
              <Form>
                <Row>
                  <Col md={6} className="mb-2">
                    <Form.Label>Full name</Form.Label>
                    <Form.Control value={profile.fullName || ''} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} />
                  </Col>
                  <Col md={6} className="mb-2">
                    <Form.Label>Email</Form.Label>
                    <Form.Control value={user?.email || ''} readOnly />
                  </Col>
                </Row>
                <Row>
                  <Col md={4} className="mb-2">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control value={profile.phone || ''} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                  </Col>
                  <Col md={4} className="mb-2">
                    <Form.Label>Branch / Dept</Form.Label>
                    <Form.Control value={profile.branch || ''} onChange={e => setProfile(p => ({ ...p, branch: e.target.value }))} />
                  </Col>
                  <Col md={4} className="mb-2">
                    <Form.Label>Year</Form.Label>
                    <Form.Control value={profile.year || ''} onChange={e => setProfile(p => ({ ...p, year: e.target.value }))} />
                  </Col>
                </Row>
                <Row>
                  <Col md={6} className="mb-2">
                    <Form.Label>College</Form.Label>
                    <Form.Control value={profile.college || ''} onChange={e => setProfile(p => ({ ...p, college: e.target.value }))} />
                  </Col>
                  <Col md={3} className="mb-2">
                    <Form.Label>CGPA</Form.Label>
                    <Form.Control value={profile.cgpa || ''} onChange={e => setProfile(p => ({ ...p, cgpa: e.target.value }))} />
                  </Col>
                  <Col md={3} className="mb-2">
                    <Form.Label>LinkedIn</Form.Label>
                    <Form.Control value={profile.linkedin || ''} onChange={e => setProfile(p => ({ ...p, linkedin: e.target.value }))} />
                  </Col>
                </Row>

                <Form.Group className="mb-2">
                  <Form.Label>Skills</Form.Label>
                  <div className="d-flex gap-2 mb-2">
                    <Form.Control placeholder="Add a skill" value={skillInput} onChange={e => setSkillInput(e.target.value)} />
                    <Button onClick={addSkill}>Add</Button>
                  </div>
                  <div>
                    {profile.skills.map(s => (
                      <Badge key={s} bg="light" text="dark" className="me-2 mb-2" style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)}>{s} &times;</Badge>
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>About Me</Form.Label>
                  <Form.Control as="textarea" rows={4} value={profile.about || ''} onChange={e => setProfile(p => ({ ...p, about: e.target.value }))} />
                </Form.Group>

                <div className="d-flex gap-2 mt-3">
                  <Button onClick={save}>Save Profile</Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  )
}
