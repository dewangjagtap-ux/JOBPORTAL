import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Spinner } from 'react-bootstrap'
import jobService from '../../services/jobService'
import companyService from '../../services/companyService'
import { useAuth } from '../../context/AuthContext'

export default function CompanyDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [jobsCount, setJobsCount] = useState(0)
  const [applicantsCount, setApplicantsCount] = useState(0)
  const [newAppsLast7, setNewAppsLast7] = useState(0)

  useEffect(() => { fetchStats() }, [user])

  useEffect(() => { fetchStats() }, [user])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const data = await companyService.getStats();
      setJobsCount(data.totalJobs);
      setApplicantsCount(data.totalApplicants);
      setNewAppsLast7(data.newApplications);
    } catch (error) {
      console.error('Failed to fetch company stats', error);
    } finally { setLoading(false) }
  }

  return (
    <div>
      {!user && <div className="alert alert-info">Please sign in as a company to view the dashboard.</div>}
      <h2 className="mb-4">Overview</h2>
      {loading ? (
        <div className="text-center py-4"><Spinner animation="border" /></div>
      ) : (
        <Row className="g-3">
          <Col md={4}>
            <Card className="p-3 shadow-sm">
              <Card.Body>
                <h6 className="text-muted">Total Jobs Posted</h6>
                <h3>{jobsCount}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="p-3 shadow-sm">
              <Card.Body>
                <h6 className="text-muted">Total Applicants</h6>
                <h3>{applicantsCount}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="p-3 shadow-sm">
              <Card.Body>
                <h6 className="text-muted">New Applications (7d)</h6>
                <h3>{newAppsLast7}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}
