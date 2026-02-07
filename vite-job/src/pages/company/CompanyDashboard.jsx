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

  useEffect(() => {
    const h = (e) => {
      const k = e?.detail?.key
      if (!k || k === 'jobs' || k === 'applications') fetchStats()
    }
    window.addEventListener('localDataChanged', h)
    return () => window.removeEventListener('localDataChanged', h)
  }, [user])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const jobs = await jobService.getJobs()
      const companyId = user?.id
      // filter jobs posted by this company (by companyId)
      const myJobs = jobs.filter(j => !companyId || Number(j.companyId) === Number(companyId))
      setJobsCount(myJobs.length)

  // collect applicants from global applications list
  const apps = JSON.parse(localStorage.getItem('applications') || '[]')
  const companyApps = apps.filter(a => Number(a.companyId) === Number(companyId))
  setApplicantsCount(companyApps.length)

  // last 7 days
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recent = companyApps.filter(a => a.appliedAt && new Date(a.appliedAt).getTime() >= weekAgo)
  setNewAppsLast7(recent.length)
    } catch (e) {
      console.error(e)
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
