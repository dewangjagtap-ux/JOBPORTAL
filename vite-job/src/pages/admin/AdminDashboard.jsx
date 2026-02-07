import React, { useEffect, useState } from 'react'
import { Row, Col, Card } from 'react-bootstrap'

export default function AdminDashboard() {
  const [jobsCount, setJobsCount] = useState(0)
  const [companiesCount, setCompaniesCount] = useState(0)
  const [studentsCount, setStudentsCount] = useState(0)

  useEffect(() => { fetchCounts() }, [])

  const fetchCounts = async () => {
    try {
      const jobs = JSON.parse(localStorage.getItem('cpp_jobs') || '[]')
      const companies = JSON.parse(localStorage.getItem('cpp_companies') || '[]')
      const map = new Map()
      jobs.forEach(j => (j.applicants || []).forEach(a => map.set(a.studentId, a)))
      setJobsCount(jobs.length)
      setCompaniesCount(companies.length)
      setStudentsCount(map.size)
    } catch (e) { /* ignore for small dashboard */ }
  }

  return (
    <div>
      <h2 className="mb-4">Admin Dashboard</h2>
      <Row className="g-3">
        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Jobs</h6>
              <h3>{jobsCount}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Companies</h6>
              <h3>{companiesCount}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Students</h6>
              <h3>{studentsCount}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
