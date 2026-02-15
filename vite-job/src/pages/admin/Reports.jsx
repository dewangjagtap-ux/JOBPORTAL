import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Spinner } from 'react-bootstrap';
import api from '../../services/api';

export default function Reports() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Need to implement this endpoint on backend
                const { data } = await api.get('/admin/stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch platform stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Platform Reports & Analytics</h2>

            <Row className="g-3 mb-4">
                <Col md={3}>
                    <Card className="text-center shadow-sm">
                        <Card.Body>
                            <h6 className="text-muted">Total Students</h6>
                            <h3>{stats?.totalStudents || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm">
                        <Card.Body>
                            <h6 className="text-muted">Total Companies</h6>
                            <h3>{stats?.totalCompanies || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm">
                        <Card.Body>
                            <h6 className="text-muted">Total Jobs</h6>
                            <h3>{stats?.totalJobs || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm">
                        <Card.Body>
                            <h6 className="text-muted">Total Applications</h6>
                            <h3>{stats?.totalApplications || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white fw-bold">Recent Platform Activity</Card.Header>
                        <Card.Body>
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Activity</th>
                                        <th>Count</th>
                                        <th>Trend (7d)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>New Job Postings</td>
                                        <td>{stats?.recentJobs || 0}</td>
                                        <td><Badge bg="success">Trending Up</Badge></td>
                                    </tr>
                                    <tr>
                                        <td>New Student Signups</td>
                                        <td>{stats?.recentStudents || 0}</td>
                                        <td><Badge bg="info">Stable</Badge></td>
                                    </tr>
                                    <tr>
                                        <td>Total Placements</td>
                                        <td>{stats?.placements || 0}</td>
                                        <td><Badge bg="success">High</Badge></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
