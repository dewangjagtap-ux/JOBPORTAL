import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import api from '../../services/api';
import adminService from '../../services/adminService';
import AIInsightsSection from '../../components/AIInsightsSection';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    jobsCount: 0,
    companiesCount: 0,
    studentsCount: 0,
  });

  const [aiInsights, setAiInsights] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats({
        jobsCount: data.totalJobs || 0,
        companiesCount: data.totalCompanies || 0,
        studentsCount: data.totalStudents || 0,
      });

      const insightsData = await adminService.getAIInsights();
      setAiInsights(insightsData);
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false, text: 'Top Student Skills' },
    },
  };

  const chartData = {
    labels: aiInsights?.topSkills?.map(s => s.skill) || [],
    datasets: [
      {
        label: 'Number of Students',
        data: aiInsights?.topSkills?.map(s => s.count) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div>
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Basic Stats Section */}
      <h4 className="mb-3 text-secondary">Overview</h4>
      <Row className="g-3 mb-5">
        <Col md={4}>
          <Card className="p-3 shadow-sm border-0">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Total Jobs</h6>
                <h3 className="mb-0">{stats.jobsCount}</h3>
              </div>
              <i className="bi bi-briefcase fs-1 text-primary"></i>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 shadow-sm border-0">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Total Companies</h6>
                <h3 className="mb-0">{stats.companiesCount}</h3>
              </div>
              <i className="bi bi-building fs-1 text-success"></i>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 shadow-sm border-0">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Total Students</h6>
                <h3 className="mb-0">{stats.studentsCount}</h3>
              </div>
              <i className="bi bi-mortarboard fs-1 text-info"></i>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Legacy AI Insights Section */}
      <div className="d-flex align-items-center mb-3">
        <h4 className="mb-0 text-secondary me-2">AI-Powered Insights Dashboard</h4>
        <i className="bi bi-magic text-warning fs-4"></i>
      </div>

      <Row className="g-3 mb-4">
        {/* Placement Rate */}
        <Col md={4}>
          <Card className="p-3 shadow-sm border-0 h-100 bg-light">
            <Card.Body>
              <h6 className="text-muted mb-2">
                <i className="bi bi-graph-up-arrow me-2 text-primary"></i>
                Placement Rate
              </h6>
              <h3 className="mb-1">{aiInsights?.placementRate || 0}%</h3>
              <small className="text-muted">Applications accepted vs total</small>
            </Card.Body>
          </Card>
        </Col>

        {/* Most Active Company */}
        <Col md={4}>
          <Card className="p-3 shadow-sm border-0 h-100 bg-light">
            <Card.Body>
              <h6 className="text-muted mb-2">
                <i className="bi bi-building-up me-2 text-success"></i>
                Most Active Company
              </h6>
              <h4 className="mb-1 text-truncate" title={aiInsights?.mostActiveCompany?.name || 'N/A'}>
                {aiInsights?.mostActiveCompany?.name || 'N/A'}
              </h4>
              <small className="text-muted">
                Posted {aiInsights?.mostActiveCompany?.count || 0} jobs
              </small>
            </Card.Body>
          </Card>
        </Col>

        {/* Most Applied Job */}
        <Col md={4}>
          <Card className="p-3 shadow-sm border-0 h-100 bg-light">
            <Card.Body>
              <h6 className="text-muted mb-2">
                <i className="bi bi-fire me-2 text-danger"></i>
                Most Applied Job
              </h6>
              <h5 className="mb-1 text-truncate" title={aiInsights?.mostAppliedJob?.title || 'N/A'}>
                {aiInsights?.mostAppliedJob?.title || 'N/A'}
              </h5>
              <small className="text-muted">
                {aiInsights?.mostAppliedJob?.count || 0} applications ({aiInsights?.mostAppliedJob?.companyName || 'N/A'})
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Skills Chart */}
      {aiInsights?.topSkills && aiInsights.topSkills.length > 0 && (
        <Card className="shadow-sm border-0 mb-4 p-2">
          <Card.Body>
            <h5 className="mb-4">
              <i className="bi bi-bar-chart-fill me-2 text-info"></i>
              Top Student Skills
            </h5>
            <div style={{ height: '300px' }}>
              <Bar options={chartOptions} data={chartData} />
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Deep Learning / Predictive AI Insights Section */}
      <AIInsightsSection />
    </div>
  );
}
