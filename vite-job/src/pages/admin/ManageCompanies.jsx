import React, { useEffect, useState } from 'react'
import { Table, Spinner, Alert, Button, Badge } from 'react-bootstrap'
import companyService from '../../services/companyService'
import adminService from '../../services/adminService'

export default function ManageCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => { fetch() }, [])

  const fetch = async () => {
    setLoading(true); setError(null); setSuccess(null)
    try {
      const data = await adminService.getCompanies()
      setCompanies(data || [])
    } catch (err) { setError(err?.message || 'Error') } finally { setLoading(false) }
  }

  const approve = async (companyId, approve = true) => {
    try {
      await adminService.approveCompany(companyId, approve)
      setSuccess(`Company ${approve ? 'approved' : 'rejected'} successfully`)
      setCompanies(prev => prev.map(c => c._id === companyId || c.id === companyId ? { ...c, isApproved: approve } : c))
      // Refresh list to be sure
      fetch()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Approval failed')
      console.error(err)
    }
  }

  return (
    <div>
      <h2 className="mb-3">Manage Companies</h2>
      {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
      {!loading && !error && (
        <Table striped hover>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {companies.length === 0 && <tr><td colSpan={4} className="text-center text-muted">No companies</td></tr>}
            {companies.map(c => (
              <tr key={c._id || c.id}>
                <td className="align-middle">{c.name}</td>
                <td className="align-middle">{c.email}</td>
                <td className="align-middle">
                  <Badge bg={c.isApproved ? 'success' : 'warning'} className="px-3 py-2">
                    {c.isApproved ? 'Approved' : 'Pending Approval'}
                  </Badge>
                </td>
                <td className="align-middle">
                  {!c.isApproved && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => approve(c._id || c.id, true)}
                      className="shadow-sm"
                    >
                      Approve Company
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}
