import React, { useEffect, useState } from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import api from '../../services/api'

export default function AdminDashboard() {
  const [jobsCount, setJobsCount] = useState(0)
  const [companiesCount, setCompaniesCount] = useState(0)
  const [studentsCount, setStudentsCount] = useState(0)

  useEffect(() => { fetchCounts() }, [])

  const fetchCounts = async () => {
    try {
      const { data } = await api.get('/admin/stats')
      setJobsCount(data.totalJobs || 0)
      setCompaniesCount(data.totalCompanies || 0)
      setStudentsCount(data.totalStudents || 0)
    } catch (e) {
      console.error('Failed to fetch dashboard stats:', e)
    }
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
