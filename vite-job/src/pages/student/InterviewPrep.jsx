import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Form, Badge, Accordion } from 'react-bootstrap';
import studentService from '../../services/studentService';

export default function InterviewPrep() {
  const [questionsData, setQuestionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await studentService.getInterviewQuestions();
      setQuestionsData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching interview questions:', err);
      setError('Failed to load interview questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-muted">Loading your personalized interview prep material...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="mb-1">Interview Preparation AI</h2>
          <p className="text-muted mb-0">Master common interview patterns before the real deal</p>
        </div>
      </div>

      {questionsData.length === 0 ? (
        <Card className="shadow-sm border-0 p-5 text-center">
          <Card.Body>
            <h5 className="text-muted">No mock questions available right now.</h5>
          </Card.Body>
        </Card>
      ) : (
        <div className="row g-4">
          {questionsData.map((categoryObj, catIndex) => (
            <div key={catIndex} className="col-12">
              <Card className="shadow-sm border-0 mb-3 border-left-primary h-100">
                <Card.Body className="p-4">
                  <h4 className="fw-bold text-primary mb-4 border-bottom pb-2">
                    {categoryObj.category}
                  </h4>
                  <Accordion defaultActiveKey="0">
                    {categoryObj.questions.map((q, qIndex) => (
                      <Accordion.Item eventKey={`${catIndex}-${qIndex}`} key={qIndex} className="mb-3 border rounded shadow-sm">
                        <Accordion.Header>
                          <span className="fw-semibold ms-2" style={{ fontSize: '1.05rem' }}>{q.question}</span>
                        </Accordion.Header>
                        <Accordion.Body className="bg-light">
                          <h6 className="text-muted mb-3"><i className="bi bi-lightbulb text-warning me-2"></i>Mock Interview Tips:</h6>
                          <div className="ps-3 border-start border-3 border-success pt-1 pb-1">
                            <ul className="mb-0 text-dark">
                              {q.tips.map((tip, tIndex) => (
                                <li key={tIndex} className="mb-2" style={{ lineHeight: '1.6' }}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
