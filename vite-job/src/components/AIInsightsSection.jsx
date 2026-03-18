import React, { useEffect, useState } from 'react';
import { Row, Col, Card, ListGroup, Spinner, Alert } from 'react-bootstrap';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const AIInsightsSection = () => {
    const [trends, setTrends] = useState(null);
    const [students, setStudents] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAIData();
    }, []);

    const fetchAIData = async () => {
        try {
            setLoading(true);
            const [trendsRes, studentsRes, companiesRes, summaryRes] = await Promise.all([
                api.get('/admin/ai/placement-trends'),
                api.get('/admin/ai/student-predictions'),
                api.get('/admin/ai/company-predictions'),
                api.get('/admin/ai/summary')
            ]);
            
            setTrends(trendsRes.data);
            setStudents(studentsRes.data);
            setCompanies(companiesRes.data);
            setInsights(summaryRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching AI data:', err);
            setError('Failed to load AI Insights.');
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-4"><Spinner animation="border" /></div>;
    }

    if (error) {
        return <Alert variant="danger" className="mt-4">{error}</Alert>;
    }

    const chartData = {
        labels: trends?.labels || [],
        datasets: [
            {
                label: 'Placements (Accepted Applications)',
                data: trends?.data || [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Monthly Placement Trends' }
        }
    };

    return (
        <div className="mt-5 mb-5">
            <h3 className="mb-4 d-flex align-items-center">
                <span className="me-2">🤖</span> AI Insights & Predictions
            </h3>
            
            <Row className="g-4 mb-4">
                <Col md={12}>
                    <Card className="shadow-sm border-0 rounded-4 overflow-hidden mb-4" style={{ background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
                        <Card.Body className="p-4">
                            <h5 className="mb-4 fw-bold text-dark d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3 text-primary d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                    <i className="bi bi-robot fs-4"></i>
                                </div>
                                AI Generated Summary
                            </h5>
                            {insights.length > 0 ? (
                                <div className="d-flex flex-column gap-3">
                                    {insights.map((insight, index) => {
                                        const icons = [
                                            { icon: 'bi-graph-up-arrow', color: 'success' },
                                            { icon: 'bi-lightbulb-fill', color: 'warning' },
                                            { icon: 'bi-bullseye', color: 'danger' },
                                            { icon: 'bi-stars', color: 'info' }
                                        ];
                                        const iconObj = icons[index % icons.length];
                                        return (
                                            <div key={index} className="d-flex align-items-start bg-white p-3 rounded-4 shadow-sm border border-light transition-all hover-shadow">
                                                <div className={`text-${iconObj.color} bg-${iconObj.color} bg-opacity-10 p-2 rounded-circle me-3 d-flex align-items-center justify-content-center`} style={{ width: '40px', height: '40px' }}>
                                                    <i className={`bi ${iconObj.icon} fs-5`}></i>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1 fw-bold text-dark">Key Insight {index + 1}</h6>
                                                    <p className="mb-0 text-secondary" style={{ fontSize: '0.95rem' }}>{insight.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Alert variant="light" className="mb-0 border shadow-sm d-flex align-items-center text-muted">
                                    <i className="bi bi-info-circle fs-4 me-3 text-secondary"></i>
                                    No insights available at the moment.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col md={8}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">Placement Trend Analysis</h5>
                                {trends?.growth ? (
                                    <span className={`badge bg-${trends.growth > 0 ? 'success' : 'danger'}`}>
                                        {trends.growth > 0 ? '↗' : '↘'} {trends.growth}% Growth
                                    </span>
                                ) : null}
                            </div>
                            <div style={{ height: '300px' }}>
                                <Line data={chartData} options={chartOptions} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <h5 className="mb-3">Top 5 Hiring Predictions (Companies)</h5>
                            <ListGroup variant="flush">
                                {companies.map((company, index) => (
                                    <ListGroup.Item key={index} className="px-0 d-flex justify-content-between align-items-start border-0 border-bottom">
                                        <div>
                                            <div className="fw-bold">{company.companyName}</div>
                                            <small className="text-muted">Jobs: {company.jobsPosted} | Hired: {company.studentsHired}</small>
                                        </div>
                                        <span className="badge bg-primary rounded-pill">
                                            {company.hiringProbability}% Prob
                                        </span>
                                    </ListGroup.Item>
                                ))}
                                {companies.length === 0 && <Alert variant="info">Not enough data to predict.</Alert>}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                <Col md={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <h5 className="mb-3">Student Placement Prediction (Top 10 likely-to-be-placed)</h5>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Name</th>
                                            <th>Branch</th>
                                            <th>CGPA</th>
                                            <th>Skills</th>
                                            <th>Prediction Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student, index) => (
                                            <tr key={student.id}>
                                                <td>{student.name}</td>
                                                <td>{student.branch}</td>
                                                <td>{student.cgpa}</td>
                                                <td>{student.skills}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                                                            <div 
                                                                className={`progress-bar bg-${student.probability > 75 ? 'success' : student.probability > 50 ? 'warning' : 'danger'}`} 
                                                                role="progressbar" 
                                                                style={{ width: `${student.probability}%` }} 
                                                            />
                                                        </div>
                                                        <span className="small">{student.probability}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {students.length === 0 && <Alert variant="info" className="mt-3">No unplaced students found or not enough data.</Alert>}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AIInsightsSection;
