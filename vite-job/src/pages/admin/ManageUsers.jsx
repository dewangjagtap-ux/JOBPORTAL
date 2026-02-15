import React, { useEffect, useState } from 'react'
import { Table, Spinner, Alert, Button, Badge, Card } from 'react-bootstrap'
import adminService from '../../services/adminService'

export default function ManageUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => { fetchUsers() }, [])

    const fetchUsers = async () => {
        setLoading(true); setError(null)
        try {
            const data = await adminService.getUsers()
            setUsers(data || [])
        } catch (err) { setError(err?.message || 'Error fetching users') } finally { setLoading(false) }
    }

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return
        try {
            await adminService.deleteUser(userId)
            setUsers(prev => prev.filter(u => u._id !== userId))
        } catch (err) { alert(err?.message || 'Delete failed') }
    }

    return (
        <div>
            <h2 className="mb-4">Manage System Users</h2>
            {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && !error && (
                <Card className="shadow-sm">
                    <Card.Body>
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 && <tr><td colSpan={5} className="text-center text-muted">No users found</td></tr>}
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <Badge bg={u.role === 'admin' ? 'danger' : u.role === 'company' ? 'info' : 'secondary'}>
                                                {u.role.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            {u.role !== 'admin' && (
                                                <Button size="sm" variant="outline-danger" onClick={() => handleDelete(u._id)}>Delete</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}
        </div>
    )
}


