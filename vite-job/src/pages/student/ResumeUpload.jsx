import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';

export default function ResumeUpload() {
    const { user, updateUser } = useAuth();
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState(null);
    const [preview, setPreview] = useState(null);
    const [resumeName, setResumeName] = useState('');

    useEffect(() => {
        if (!user) return;
        try {
            // Check user object from context (most reliable)
            if (user && user.resume) {
                setPreview(user.resume);
                setResumeName('my_resume.pdf');
                return;
            }
            // Fallback to local
            const profileRaw = localStorage.getItem(`cpp_profile_${user?._id}`);
            if (profileRaw) {
                const p = JSON.parse(profileRaw);
                if (p.resumeDataURL) {
                    setPreview(p.resumeDataURL);
                    setResumeName(p.resumeName || 'my_resume.pdf');
                }
            } else {
                const raw = localStorage.getItem(`cpp_resume_${user?._id}`);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && parsed.dataURL) {
                        setPreview(parsed.dataURL);
                        setResumeName(parsed.name || 'my_resume.pdf');
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to load resume preview', e);
        }
    }, [user]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === 'application/pdf') {
            setFile(selected);
            setMsg(null);
        } else {
            setFile(null);
            setMsg({ type: 'danger', text: 'Please select a valid PDF file.' });
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMsg({ type: 'danger', text: 'No file selected.' });
            return;
        }

        try {
            const data = await studentService.updateProfile({ resume: file });
            if (data) {
                updateUser({ resume: data.resume });
                setPreview(data.resume); // Backend path
                setResumeName(file.name);
                setMsg({ type: 'success', text: 'Resume uploaded and saved to profile successfully!' });

                // Update local storage for compatibility/cache
                localStorage.setItem(`cpp_resume_${user?._id}`, JSON.stringify({ name: file.name, path: data.resume }));
            }
        } catch (err) {
            setMsg({ type: 'danger', text: err?.response?.data?.message || err.message });
        }
    };

    const openPreview = () => {
        if (preview) {
            // If it's a backend path (doesn't start with data:), format it
            const url = (typeof preview === 'string' && !preview.startsWith('data:'))
                ? `/${preview.replace(/\\/g, '/')}`
                : preview;

            window.dispatchEvent(new CustomEvent('openResumeModal', {
                detail: { url, filename: resumeName }
            }));
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Resume Management</h2>
            <Card className="shadow-sm">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <h5>Upload Your Resume</h5>
                            <p className="text-muted small">Only PDF files are accepted. Max size 5MB.</p>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                />
                            </Form.Group>
                            <Button onClick={handleUpload} disabled={!file} variant="primary">
                                Upload Resume
                            </Button>
                            {msg && <Alert variant={msg.type} className="mt-3">{msg.text}</Alert>}
                        </Col>
                        <Col md={6} className="border-start">
                            <h5>Current Resume</h5>
                            {preview ? (
                                <div className="mt-3">
                                    <div className="p-3 border rounded bg-light mb-3 d-flex align-items-center justify-content-between">
                                        <div>
                                            <strong>{resumeName}</strong>
                                            <div className="text-muted small">PDF Document</div>
                                        </div>
                                        <Button variant="outline-primary" size="sm" onClick={openPreview}>
                                            View / Preview
                                        </Button>
                                    </div>
                                    <p className="small text-muted">You can replace this resume by uploading a new one anytime. This resume will be used for all your job applications.</p>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <p>No resume uploaded yet.</p>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}
