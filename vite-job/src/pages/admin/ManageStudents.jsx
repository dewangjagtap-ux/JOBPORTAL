import React, { useEffect, useState } from 'react'
import { Table, Spinner, Alert } from 'react-bootstrap'
import adminService from '../../services/adminService'

export default function ManageStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchStudents() }, [])

  const fetchStudents = async () => {
    setLoading(true)
    setError(null)
    try {
      const users = await adminService.getUsers()
      const list = users.filter(u => u.role === 'student')
      setStudents(list)
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to fetch students')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 className="mb-3">Manage Students</h2>
      {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Table striped hover responsive>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined At</th></tr>
          </thead>
          <tbody>
            {students.length === 0 && <tr><td colSpan={4} className="text-center text-muted">No students registered yet</td></tr>}
            {students.map(s => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.phone || 'N/A'}</td>
                <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}
