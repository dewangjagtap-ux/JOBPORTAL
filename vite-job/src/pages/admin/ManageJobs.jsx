import React, { useEffect, useState } from 'react'
import { Table, Spinner, Alert } from 'react-bootstrap'
import jobService from '../../services/jobService'

export default function ManageJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetch() }, [])

  const fetch = async () => {
    setLoading(true); setError(null)
    try {
      const data = await jobService.getJobs()
      setJobs(data || [])
    } catch (err) { setError(err?.message || 'Error') } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 className="mb-3">Manage Jobs</h2>
      {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Table hover responsive>
          <thead>
            <tr><th>Job</th><th>Company</th><th>Location</th></tr>
          </thead>
          <tbody>
            {jobs.length === 0 && <tr><td colSpan={3} className="text-center text-muted">No jobs</td></tr>}
            {jobs.map(j => (
              <tr key={j._id}>
                <td>{j.title}</td>
                <td>{j.companyName}</td>
                <td>{j.location}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}
