import React, { useEffect, useState } from 'react'
import { Table, Spinner, Alert, Button } from 'react-bootstrap'
import companyService from '../../services/companyService'
import adminService from '../../services/adminService'

export default function ManageCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetch() }, [])

  const fetch = async () => {
    setLoading(true); setError(null)
    try {
      const data = await companyService.getCompanies()
      setCompanies(data || [])
    } catch (err) { setError(err?.message || 'Error') } finally { setLoading(false) }
  }

  const approve = async (companyId, approve = true) => {
    try {
      await adminService.approveCompany(companyId, approve)
      setCompanies(c => c.map(x => x.id === companyId ? { ...x, approved: approve } : x))
    } catch (err) { console.error(err) }
  }

  return (
    <div>
      <h2 className="mb-3">Manage Companies</h2>
      {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Table striped hover>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {companies.length === 0 && <tr><td colSpan={4} className="text-center text-muted">No companies</td></tr>}
            {companies.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.approved ? 'Approved' : 'Pending'}</td>
                <td>
                  <Button size="sm" variant="success" onClick={() => approve(c.id, true)} className="me-2">Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => approve(c.id, false)}>Reject</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}
