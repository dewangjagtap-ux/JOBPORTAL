import React, { useEffect, useState } from 'react'
import { Card, Form, Button, Row, Col, Alert, Badge } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import studentService from '../../services/studentService'

// Student profile page — persistently saves to backend and synced to Auth state
export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(() => ({
    fullName: user?.name || '',
    phone: user?.phone || '',
    branch: user?.branch || '',
    year: user?.year || '',
    college: user?.college || '',
    cgpa: user?.cgpa || '',
    skills: user?.skills || [],
    about: user?.about || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    photoDataURL: user?.photo ? `/${user.photo.replace(/\\/g, '/')}` : null,
    photoFile: null,
    removePhoto: false,
    resumeName: user?.resume ? user.resume.split(/[\\/]/).pop() : null,
    resumeFile: null,
  }))
  const [skillInput, setSkillInput] = useState('')
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      try {
        const data = await studentService.getProfile()
        if (data) {
          setProfile({
            fullName: data.name || '',
            phone: data.phone || '',
            branch: data.branch || '',
            year: data.year || '',
            college: data.college || '',
            cgpa: data.cgpa || '',
            skills: data.skills || [],
            about: data.about || '',
            linkedin: data.linkedin || '',
            github: data.github || '',
            photoDataURL: data.photo ? `/${data.photo.replace(/\\/g, '/')}` : null,
            resumeName: data.resume ? data.resume.split(/[\\/]/).pop() : null,
          })
        }
      } catch (e) {
        setProfile(p => ({ ...p, fullName: user.name, email: user.email }))
      }
    }
    fetchProfile()
  }, [user])

  const save = async () => {
    if (!user) return setMsg({ type: 'danger', text: 'Sign in to save profile' })
    try {
      const updated = await studentService.updateProfile({
        name: profile.fullName,
        phone: profile.phone,
        branch: profile.branch,
        year: profile.year,
        college: profile.college,
        cgpa: profile.cgpa,
        skills: profile.skills,
        about: profile.about,
        linkedin: profile.linkedin,
        github: profile.github,
        photo: profile.photoFile,
        removePhoto: profile.removePhoto,
        resume: profile.resumeFile
      })

      if (updated) {
        updateUser(updated);
        setMsg({ type: 'success', text: 'Profile saved successfully' })
        setTimeout(() => setMsg(null), 2500)
      }
    } catch (e) {
      setMsg({ type: 'danger', text: e?.response?.data?.message || e?.message || 'Failed to save' })
    }
  }

  const handleResume = (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') return setMsg({ type: 'danger', text: 'Only PDF allowed' })
    setProfile(p => ({ ...p, resumeFile: file, resumeName: file.name }))
  }

  const handlePhoto = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setProfile(p => ({ ...p, photoFile: file, photoDataURL: reader.result, removePhoto: false }))
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setProfile(p => ({ ...p, photoDataURL: null, photoFile: null, removePhoto: true }))
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
      <Card className="shadow-sm border-0 animate-fade">
        <Card.Body className="p-4">
          <h3 className="mb-4 fw-bold">Student Profile</h3>
          {msg && <Alert variant={msg.type} className="border-0 shadow-sm">{msg.text}</Alert>}
          <Form>
            <Row>
              <Col md={4} className="text-center mb-4 mb-md-0">
                <div className="position-relative d-inline-block">
                  <div style={{ width: 180, height: 180, borderRadius: '50%', overflow: 'hidden', background: '#f8f9fa', border: '4px solid #fff' }} className="shadow-sm mx-auto mb-3 d-flex align-items-center justify-content-center">
                    {profile.photoDataURL ? <img src={profile.photoDataURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                      <div className="text-muted flex-column">
                        <span className="fs-1">👤</span>
                        <small className="d-block">No Photo</small>
                      </div>
                    )}
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <Form.Group>
                      <Form.Label className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm w-100">
                        {profile.photoDataURL ? 'Change Photo' : 'Add Photo'}
                        <input type="file" accept="image/*" onChange={e => handlePhoto(e.target.files[0])} style={{ display: 'none' }} />
                      </Form.Label>
                    </Form.Group>
                    {profile.photoDataURL && (
                      <Button variant="outline-danger" size="sm" className="rounded-pill px-3 shadow-sm w-100" onClick={handleRemovePhoto}>
                        Remove Photo
                      </Button>
                    )}
                  </div>
                </div>
                <hr className="my-4" />
                <div className="text-start">
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted text-uppercase">Resume (PDF)</Form.Label>
                    <Form.Control type="file" accept="application/pdf" onChange={e => handleResume(e.target.files[0])} size="sm" />
                    {profile.resumeName && <div className="mt-2 text-center"><Badge bg="secondary" className="rounded-pill px-3">{profile.resumeName}</Badge></div>}
                  </Form.Group>
                </div>
              </Col>
              <Col md={8}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Full Name</Form.Label>
                      <Form.Control value={profile.fullName || ''} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} placeholder="Enter full name" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Email Address</Form.Label>
                      <Form.Control value={user?.email || ''} readOnly disabled />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Phone</Form.Label>
                      <Form.Control value={profile.phone || ''} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Branch / Dept</Form.Label>
                      <Form.Control value={profile.branch || ''} onChange={e => setProfile(p => ({ ...p, branch: e.target.value }))} placeholder="e.g. CSE" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Year</Form.Label>
                      <Form.Control value={profile.year || ''} onChange={e => setProfile(p => ({ ...p, year: e.target.value }))} placeholder="e.g. 4th Year" />
                    </Form.Group>
                  </Col>
                  <Col md={9}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">College</Form.Label>
                      <Form.Control value={profile.college || ''} onChange={e => setProfile(p => ({ ...p, college: e.target.value }))} placeholder="College name" />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">CGPA</Form.Label>
                      <Form.Control value={profile.cgpa || ''} onChange={e => setProfile(p => ({ ...p, cgpa: e.target.value }))} placeholder="0.0" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">LinkedIn</Form.Label>
                      <Form.Control value={profile.linkedin || ''} onChange={e => setProfile(p => ({ ...p, linkedin: e.target.value }))} placeholder="URL" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">GitHub</Form.Label>
                      <Form.Control value={profile.github || ''} onChange={e => setProfile(p => ({ ...p, github: e.target.value }))} placeholder="URL" />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Skills</Form.Label>
                      <div className="d-flex gap-2 mb-3">
                        <Form.Control placeholder="Add a skill" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                        <Button variant="outline-primary" onClick={addSkill}>Add</Button>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {profile.skills.map(s => (
                          <Badge key={s} bg="light" text="dark" className="border py-2 px-3 rounded-pill" style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)}>
                            {s} <span className="ms-1 text-danger">&times;</span>
                          </Badge>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">About Me</Form.Label>
                      <Form.Control as="textarea" rows={4} value={profile.about || ''} onChange={e => setProfile(p => ({ ...p, about: e.target.value }))} placeholder="Tell us about yourself..." />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-4 pt-3 border-top text-end">
                  <Button onClick={save} className="px-5 rounded-pill shadow-sm py-2 fw-bold">
                    Save Profile
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
