import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, ListGroup, Tab, Nav, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import adminService from '../services/adminService';
import { toast } from 'react-hot-toast';

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSendModal, setShowSendModal] = useState(false);
    const [recipients, setRecipients] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [filterDate, setFilterDate] = useState('');

    // Form states for sending
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        recipientType: 'all_students',
        recipientIds: [],
        type: 'announcement'
    });

    useEffect(() => {
        fetchNotifications();
        if (user.role === 'admin' || user.role === 'company') {
            fetchRecipients();
        }
    }, [user.role]);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecipients = async () => {
        try {
            if (user.role === 'admin') {
                const users = await adminService.getUsers();
                setRecipients(users);
            } else if (user.role === 'company') {
                // Companies can send to Students or Admin
                const users = await adminService.getUsers(); // Adjust if there's a specific student list service
                setRecipients(users);
            }
        } catch (error) {
            console.error('Failed to fetch recipients:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, readBy: [...n.readBy, { user: user._id }] } : n
            ));
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(notifications.filter(n => n._id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        try {
            await notificationService.sendNotification(formData);
            toast.success('Notification sent successfully');
            setShowSendModal(false);
            setFormData({
                title: '',
                message: '',
                recipientType: 'all_students',
                recipientIds: [],
                type: 'announcement'
            });
            fetchNotifications();
        } catch (error) {
            toast.error('Failed to send notification');
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filterType !== 'all' && n.type !== filterType) return false;
        if (filterDate) {
            const nDate = new Date(n.createdAt).toISOString().split('T')[0];
            if (nDate !== filterDate) return false;
        }
        return true;
    });

    const isRead = (notification) => {
        return notification.readBy.some(read => read.user._id === user._id || read.user === user._id);
    };

    const receivedNotifications = filteredNotifications.filter(n => n.sender._id !== user._id);
    const sentNotifications = filteredNotifications.filter(n => n.sender._id === user._id);

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Notifications</h2>
                {(user.role === 'admin' || user.role === 'company') && (
                    <Button variant="primary" onClick={() => setShowSendModal(true)}>
                        Send Notification
                    </Button>
                )}
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Tab.Container defaultActiveKey="received">
                        <div className="border-bottom px-3 py-2 bg-light d-flex justify-content-between align-items-center">
                            <Nav variant="pills" className="gap-2">
                                <Nav.Item>
                                    <Nav.Link eventKey="received" className="px-4 py-2">Received</Nav.Link>
                                </Nav.Item>
                                {(user.role === 'admin' || user.role === 'company') && (
                                    <Nav.Item>
                                        <Nav.Link eventKey="sent" className="px-4 py-2">Sent</Nav.Link>
                                    </Nav.Item>
                                )}
                            </Nav>

                            <div className="d-flex gap-3">
                                <Form.Select
                                    size="sm"
                                    style={{ width: '150px' }}
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="announcement">Announcement</option>
                                    <option value="application_update">Job Update</option>
                                    <option value="system">System</option>
                                </Form.Select>
                                <Form.Control
                                    type="date"
                                    size="sm"
                                    style={{ width: '150px' }}
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <Tab.Content>
                            <Tab.Pane eventKey="received">
                                {receivedNotifications.length === 0 ? (
                                    <div className="p-5 text-center text-muted">No notifications received</div>
                                ) : (
                                    <ListGroup variant="flush">
                                        {receivedNotifications.map(n => (
                                            <ListGroup.Item key={n._id} className={`p-4 border-bottom ${!isRead(n) ? 'bg-light-primary' : ''}`}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <h5 className="mb-0 fw-bold">{n.title}</h5>
                                                            <Badge bg={n.type === 'announcement' ? 'info' : 'warning'} className="text-uppercase small">
                                                                {n.type}
                                                            </Badge>
                                                            {!isRead(n) && <Badge bg="primary">New</Badge>}
                                                        </div>
                                                        <p className="text-secondary mb-2">{n.message}</p>
                                                        <small className="text-muted">
                                                            From: <span className="fw-semibold">{n.sender?.name}</span> ({n.senderRole}) • {new Date(n.createdAt).toLocaleString()}
                                                        </small>
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        {!isRead(n) && (
                                                            <Button variant="outline-primary" size="sm" onClick={() => handleMarkAsRead(n._id)}>
                                                                Mark as Read
                                                            </Button>
                                                        )}
                                                        {user.role !== 'student' && (
                                                            <Button variant="link" className="text-danger p-0 h-auto" onClick={() => handleDelete(n._id)}>
                                                                <i className="bi bi-trash"></i> Delete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Tab.Pane>
                            <Tab.Pane eventKey="sent">
                                {sentNotifications.length === 0 ? (
                                    <div className="p-5 text-center text-muted">No notifications sent</div>
                                ) : (
                                    <ListGroup variant="flush">
                                        {sentNotifications.map(n => (
                                            <ListGroup.Item key={n._id} className="p-4 border-bottom">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <h5 className="mb-0 fw-bold">{n.title}</h5>
                                                            <Badge bg="secondary" className="text-uppercase small">
                                                                {n.recipientType.replace('_', ' ')}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-secondary mb-2">{n.message}</p>
                                                        <small className="text-muted">
                                                            Sent on: {new Date(n.createdAt).toLocaleString()} • Read by: {n.readBy?.length || 0}
                                                        </small>
                                                    </div>
                                                    <Button variant="link" className="text-danger p-0 h-auto" onClick={() => handleDelete(n._id)}>
                                                        Delete
                                                    </Button>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Card.Body>
            </Card>

            {/* Send Modal */}
            <Modal show={showSendModal} onHide={() => setShowSendModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Send Notification</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSend}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Recipient Group</Form.Label>
                            <Form.Select
                                value={formData.recipientType}
                                onChange={(e) => setFormData({ ...formData, recipientType: e.target.value, recipientIds: [] })}
                            >
                                {user.role === 'admin' && (
                                    <>
                                        <option value="all_students">All Students</option>
                                        <option value="specific_students">Specific Students</option>
                                        <option value="all_companies">All Companies</option>
                                        <option value="specific_companies">Specific Companies</option>
                                        <option value="all_admins">All Admins</option>
                                    </>
                                )}
                                {user.role === 'company' && (
                                    <>
                                        <option value="all_students">All Students</option>
                                        <option value="specific_students">Specific Students</option>
                                        <option value="admin">Admin</option>
                                    </>
                                )}
                            </Form.Select>
                        </Form.Group>

                        {(formData.recipientType === 'specific_students' || formData.recipientType === 'specific_companies') && (
                            <Form.Group className="mb-3">
                                <Form.Label>Select Individuals</Form.Label>
                                <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {recipients
                                        .filter(r => (formData.recipientType === 'specific_students' ? r.role === 'student' : r.role === 'company'))
                                        .map(r => (
                                            <Form.Check
                                                key={r._id}
                                                type="checkbox"
                                                label={`${r.name} (${r.email})`}
                                                checked={formData.recipientIds.includes(r._id)}
                                                onChange={(e) => {
                                                    const ids = e.target.checked
                                                        ? [...formData.recipientIds, r._id]
                                                        : formData.recipientIds.filter(id => id !== r._id);
                                                    setFormData({ ...formData, recipientIds: ids });
                                                }}
                                            />
                                        ))
                                    }
                                </div>
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter notification title"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Message</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                required
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Enter notification message"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="announcement">Announcement</option>
                                <option value="application_update">Job Update</option>
                                <option value="system">System</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowSendModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Send Now</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

// Add these styles to index.css if not present
// .bg-light-primary { background-color: #f0f7ff !important; }
