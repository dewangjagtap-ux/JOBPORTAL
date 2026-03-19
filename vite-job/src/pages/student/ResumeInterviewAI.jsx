import React, { useState } from 'react';
import { Card, Button, Spinner, Form, Badge, Accordion, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';

export default function ResumeInterviewAI() {
  const { user } = useAuth();
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Extracted, 3: Questions
  
  const [extractedData, setExtractedData] = useState(null);
  const [questionsData, setQuestionsData] = useState(null);
  
  // Mock Interview State
  const [mockActive, setMockActive] = useState(false);
  const [mockQuestion, setMockQuestion] = useState(null);
  const [mockAnswer, setMockAnswer] = useState('');
  const [mockFeedback, setMockFeedback] = useState(null);
  const [mockEvalLoading, setMockEvalLoading] = useState(false);

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      setError('Please select a PDF resume first.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await studentService.uploadResumeForAI(file);
      if (response && response.extractedData) {
        setExtractedData(response.extractedData);
        setStep(2);
      } else {
        setError('Failed to extract data from resume.');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Error analyzing resume. Make sure GEMINI_API_KEY is in backend .env');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await studentService.getResumeQuestions(user._id, extractedData);
      if (response && response.resume_questions) {
        setQuestionsData(response);
        setStep(3);
      } else {
        setError('Failed to generate questions.');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Error generating questions.');
    } finally {
      setLoading(false);
    }
  };

  const startMockInterview = (questionText) => {
    setMockActive(true);
    setMockQuestion(questionText);
    setMockAnswer('');
    setMockFeedback(null);
  };

  const submitMockAnswer = async () => {
    if (!mockAnswer.trim()) {
      setError('Please type an answer first.');
      return;
    }
    setError(null);
    setMockEvalLoading(true);
    try {
      const response = await studentService.evaluateMockAnswer(mockQuestion, mockAnswer);
      setMockFeedback(response);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Error evaluating answer.');
    } finally {
      setMockEvalLoading(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="mb-4">
        <h2 className="mb-1 text-primary"><i className="bi bi-mic-fill me-2"></i>Resume-Based Interview AI</h2>
        <p className="text-muted">Upload your resume to generate personalized interview questions and practice via AI mock interviews.</p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <Card className="shadow-sm border-0 border-left-primary mb-4 p-3">
          <Card.Body>
            <h5 className="mb-3">1. Upload Resume for Analysis</h5>
            <Form.Group className="mb-3">
              <Form.Label>Select Resume (PDF Document)</Form.Label>
              <Form.Control 
                type="file" 
                accept="application/pdf" 
                onChange={(e) => setFile(e.target.files[0])} 
              />
            </Form.Group>
            <Button 
              variant="primary" 
              onClick={handleUploadAndAnalyze} 
              disabled={loading || !file}
            >
              {loading ? <><Spinner size="sm" className="me-2" />Analyzing...</> : 'Analyze Resume'}
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* STEP 2: EXTRACTED DATA */}
      {step >= 2 && extractedData && (
        <Card className="shadow-sm border-0 border-left-success mb-4 p-3 animate-fade">
          <Card.Body>
            <h5 className="mb-3 text-success">2. Extracted Data</h5>
            <Row className="g-3">
              <Col md={6}>
                <div className="mb-2"><strong>Target Domain:</strong> {extractedData.domain || 'N/A'}</div>
                <div className="mb-2"><strong>CGPA:</strong> {extractedData.cgpa || 'N/A'}</div>
              </Col>
              <Col md={6}>
                <div className="mb-2"><strong>Skills:</strong></div>
                <div className="d-flex flex-wrap gap-1 mb-2">
                  {extractedData.skills?.map((skill, idx) => (
                    <Badge bg="secondary" key={idx}>{skill}</Badge>
                  ))}
                </div>
                <div className="mb-2"><strong>Projects:</strong></div>
                <ul className="mb-0 ps-3">
                  {extractedData.projects?.map((proj, idx) => (
                    <li key={idx} className="small">{proj}</li>
                  ))}
                </ul>
              </Col>
            </Row>
            {step === 2 && (
              <div className="mt-4">
                <Button 
                  variant="success" 
                  onClick={handleGenerateQuestions} 
                  disabled={loading}
                >
                  {loading ? <><Spinner size="sm" className="me-2" />Generating...</> : 'Generate Personalized Questions'}
                </Button>
                <Button variant="outline-secondary" className="ms-2" onClick={() => setStep(1)}>Start Over</Button>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* STEP 3 & MOCK INTERVIEW: GENERATED QUESTIONS */}
      {step >= 3 && questionsData && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3 animate-fade">
            <h4 className="mb-0">3. Your Personalized Questions</h4>
            <Button variant="outline-primary" size="sm" onClick={() => setStep(1)}>Start Over</Button>
          </div>

          <Row className="g-4 animate-fade">
            <Col lg={mockActive ? 6 : 12}>
              <Accordion defaultActiveKey="0">
                {/* Resume Questions */}
                <Accordion.Item eventKey="0" className="mb-3 border rounded shadow-sm">
                  <Accordion.Header><strong className="text-primary">Resume Project Questions</strong></Accordion.Header>
                  <Accordion.Body className="bg-light">
                    <ul className="list-group list-group-flush rounded">
                      {questionsData.resume_questions?.map((q, idx) => (
                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                          <span>{q}</span>
                          <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={() => startMockInterview(q)}>Practice</Button>
                        </li>
                      ))}
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
                
                {/* Technical Questions */}
                <Accordion.Item eventKey="1" className="mb-3 border rounded shadow-sm">
                  <Accordion.Header><strong className="text-success">Technical / Skill Questions</strong></Accordion.Header>
                  <Accordion.Body className="bg-light">
                    <ul className="list-group list-group-flush rounded">
                      {questionsData.technical_questions?.map((q, idx) => (
                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                          <span>{q}</span>
                          <Button size="sm" variant="outline-success" className="rounded-pill" onClick={() => startMockInterview(q)}>Practice</Button>
                        </li>
                      ))}
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>

                {/* HR Questions */}
                <Accordion.Item eventKey="2" className="mb-3 border rounded shadow-sm">
                  <Accordion.Header><strong className="text-warning text-dark">Common HR Questions</strong></Accordion.Header>
                  <Accordion.Body className="bg-light">
                    <ul className="list-group list-group-flush rounded">
                      {questionsData.hr_questions?.map((q, idx) => (
                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                          <span>{q}</span>
                          <Button size="sm" variant="outline-warning" className="rounded-pill text-dark" onClick={() => startMockInterview(q)}>Practice</Button>
                        </li>
                      ))}
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>

            {/* MOCK INTERVIEW PANEL */}
            {mockActive && (
              <Col lg={6} className="animate-fade-right">
                <Card className="shadow border-0 border-top-primary h-100">
                  <Card.Body className="p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3 border-bottom pb-2">
                      <h5 className="mb-0 text-primary">Mock Interview Mode</h5>
                      <Button variant="close" onClick={() => setMockActive(false)}></Button>
                    </div>

                    <div className="mb-4">
                      <strong className="text-muted d-block mb-2">Question:</strong>
                      <div className="p-3 bg-light rounded lead fs-6">
                        {mockQuestion}
                      </div>
                    </div>

                    <Form.Group className="mb-4 flex-grow-1 d-flex flex-column">
                      <strong className="text-muted d-block mb-2">Your Answer:</strong>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        className="flex-grow-1"
                        placeholder="Type your detailed answer here..."
                        value={mockAnswer}
                        onChange={(e) => setMockAnswer(e.target.value)}
                        disabled={!!mockFeedback || mockEvalLoading}
                      />
                    </Form.Group>

                    {!mockFeedback ? (
                      <div className="text-end mt-auto">
                        <Button 
                          variant="primary" 
                          className="px-4"
                          onClick={submitMockAnswer}
                          disabled={mockEvalLoading || !mockAnswer.trim()}
                        >
                          {mockEvalLoading ? <><Spinner size="sm" className="me-2"/>Evaluating...</> : 'Submit Answer'}
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-auto animate-fade">
                        <div className={`p-3 rounded border ${mockFeedback.score >= 7 ? 'border-success bg-success text-white bg-opacity-10 text-dark' : 'border-warning bg-warning bg-opacity-10 text-dark'}`}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 fw-bold">AI Evaluation Score:</h6>
                            <Badge bg={mockFeedback.score >= 7 ? 'success' : 'warning'} className="fs-6 px-3 py-2 text-dark">
                              {mockFeedback.score} / 10
                            </Badge>
                          </div>
                          <hr className="my-2 opacity-25" />
                          <p className="mb-0 small" style={{ lineHeight: '1.6' }}>
                            <strong>Feedback:</strong> <br/>
                            {mockFeedback.feedback}
                          </p>
                        </div>
                        <div className="text-end mt-3">
                          <Button variant="outline-primary" size="sm" onClick={() => {
                            setMockAnswer('');
                            setMockFeedback(null);
                          }}>Try Again</Button>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </>
      )}
    </div>
  );
}
