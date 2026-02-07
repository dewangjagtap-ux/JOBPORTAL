import React, { useEffect, useState } from 'react'
import { Table, Spinner, Alert } from 'react-bootstrap'

export default function ManageStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStudentsFromJobs() }, [])

  const fetchStudentsFromJobs = async () => {
    setLoading(true)
    try {
      const jobs = JSON.parse(localStorage.getItem('cpp_jobs') || '[]')
      const map = new Map()
      jobs.forEach(j => (j.applicants || []).forEach(a => map.set(a.studentId, a)))
      const list = Array.from(map.values())
      setStudents(list)
    } catch (e) {
      setStudents([])
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 className="mb-3">Manage Students</h2>
      {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}
      {!loading && (
        <Table striped hover>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Applied Jobs</th></tr>
          </thead>
          <tbody>
            {students.length === 0 && <tr><td colSpan={3} className="text-center text-muted">No students</td></tr>}
            {students.map(s => (
              <tr key={s.studentId}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>1</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}
