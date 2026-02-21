import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, ListGroup, Tab, Nav, Modal, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import adminService from '../services/adminService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const NOTIFICATION_CATEGORIES = [
    { value: 'announcement', label: 'Announcement', color: 'info', icon: 'bi-megaphone' },
    { value: 'job_alert', label: 'Job Alert', color: 'primary', icon: 'bi-briefcase' },
    { value: 'approval', label: 'Approval', color: 'success', icon: 'bi-check-circle' },
    { value: 'reminder', label: 'Reminder', color: 'warning', icon: 'bi-bell' },
    { value: 'application_update', label: 'Job Update', color: 'secondary', icon: 'bi-info-circle' },
    { value: 'system', label: 'System', color: 'dark', icon: 'bi-cpu' },
];

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSendModal, setShowSendModal] = useState(false);
    const [recipients, setRecipients] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Form states for sending
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        recipientType: user?.role === 'admin' ? 'all_students' : 'all_students',
        recipientIds: [],
        type: 'announcement',
        sendEmail: false
    });

    useEffect(() => {
        fetchNotifications();
        if (user.role === 'admin' || user.role === 'company') {
            fetchRecipients();
        }
    }, [user.role]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            toast.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecipients = async () => {
        try {
            const users = await adminService.getUsers();
            setRecipients(users);
        } catch (error) {
            console.error('Failed to fetch recipients:', error);
        }
    };

    const handleToggleRead = async (id) => {
        try {
            const result = await notificationService.toggleRead(id);
            setNotifications(notifications.map(n => {
                if (n._id === id) {
                    const userIdString = user?._id?.toString() || user?.id?.toString();
                    let newReadBy = [...n.readBy];
                    if (result.isRead) {
                        newReadBy.push({ user: user._id, readAt: new Date() });
                    } else {
                        newReadBy = newReadBy.filter(r => (r.user?._id || r.user)?.toString() !== userIdString);
                    }
                    return { ...n, readBy: newReadBy };
                }
                return n;
            }));
            toast.success(result.isRead ? 'Marked as read' : 'Marked as unread');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) return;
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
                recipientType: user?.role === 'admin' ? 'all_students' : 'all_students',
                recipientIds: [],
                type: 'announcement',
                sendEmail: false
            });
            fetchNotifications();
        } catch (error) {
            toast.error('Failed to send notification');
        }
    };

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            const matchesType = filterType === 'all' || n.type === filterType;
            const matchesDate = !filterDate || new Date(n.createdAt).toISOString().split('T')[0] === filterDate;
            const matchesSearch = !searchTerm ||
                n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                n.message.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesType && matchesDate && matchesSearch;
        });
    }, [notifications, filterType, filterDate, searchTerm]);

    const isRead = (notification) => {
        const userIdString = user?._id?.toString() || user?.id?.toString();
        return notification.readBy.some(read => (read.user?._id || read.user)?.toString() === userIdString);
    };

    const receivedNotifications = filteredNotifications.filter(n => {
        const userIdString = user?._id?.toString() || user?.id?.toString();
        const senderIdString = n.sender?._id?.toString() || n.sender?.toString();
        const effectiveSenderRole = n.senderRole || n.sender?.role;

        // Sent by someone else OR specifically sent TO user (even if by self)
        const sentByMe = senderIdString === userIdString;

        if (user?.role === 'admin') {
            // Admins see anything sent to admins OR anything sent by other admins (oversight)
            const sentByOtherAdmin = effectiveSenderRole === 'admin' && !sentByMe;
            const sentToAdmin = n.recipientType === 'all_admins' || n.recipientType === 'admin' || n.recipients?.some(r => (r?._id || r)?.toString() === userIdString);
            return sentToAdmin || sentByOtherAdmin;
        }
        if (user?.role === 'company') {
            // Companies see anything sent to them OR anything sent by other companies (oversight)
            const sentByOtherCompany = effectiveSenderRole === 'company' && !sentByMe;
            const sentToCompany = n.recipientType === 'all_companies' || n.recipients?.some(r => (r?._id || r)?.toString() === userIdString);
            return sentToCompany || sentByOtherCompany;
        }
        // Students see only what is sent to them
        return true;
    });

    const sentNotifications = filteredNotifications.filter(n => {
        const userIdString = user?._id?.toString() || user?.id?.toString();
        const senderIdString = n.sender?._id?.toString() || n.sender?.toString();
        const effectiveSenderRole = n.senderRole || n.sender?.role;

        // Sent by self
        const sentByMe = senderIdString === userIdString;

        if (user?.role === 'admin') {
            // Show all admin notifications as "Sent" for visibility
            return effectiveSenderRole === 'admin';
        }
        if (user?.role === 'company') {
            // Show all company notifications as "Sent" for visibility
            return effectiveSenderRole === 'company';
        }
        return false;
    });

    const getCategoryDetails = (type) => {
        return NOTIFICATION_CATEGORIES.find(c => c.value === type) || NOTIFICATION_CATEGORIES[0];
    };

    if (loading && notifications.length === 0) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4 px-lg-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Notifications Hub</h2>
                    <p className="text-muted mb-0">Manage and view all your system alerts and messages.</p>
                </div>
                {(user.role === 'admin' || user.role === 'company') && (
                    <Button variant="primary" className="px-4 py-2 shadow-sm d-flex align-items-center gap-2" onClick={() => setShowSendModal(true)}>
                        <i className="bi bi-plus-circle"></i> Send New Notification
                    </Button>
                )}
            </div>

            <Row className="g-4">
                <Col lg={12}>
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <Tab.Container defaultActiveKey="received">
                            <Card.Header className="bg-white border-0 p-0">
                                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center border-bottom px-3 pt-3">
                                    <Nav variant="pills" className="gap-2 mb-3">
                                        <Nav.Item>
                                            <Nav.Link eventKey="received" className="rounded-pill px-4">
                                                Received
                                                <Badge bg="primary" pill className="ms-2">
                                                    {receivedNotifications.filter(n => !isRead(n)).length}
                                                </Badge>
                                            </Nav.Link>
                                        </Nav.Item>
                                        {(user.role === 'admin' || user.role === 'company') && (
                                            <Nav.Item>
                                                <Nav.Link eventKey="sent" className="rounded-pill px-4">Sent</Nav.Link>
                                            </Nav.Item>
                                        )}
                                    </Nav>

                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        <InputGroup size="sm" style={{ maxWidth: '250px' }}>
                                            <InputGroup.Text className="bg-white border-end-0">
                                                <i className="bi bi-search"></i>
                                            </InputGroup.Text>
                                            <Form.Control
                                                placeholder="Search notifications..."
                                                className="border-start-0 ps-0"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </InputGroup>
                                        <Form.Select
                                            size="sm"
                                            style={{ width: '150px' }}
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                        >
                                            <option value="all">All Categories</option>
                                            {NOTIFICATION_CATEGORIES.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
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
                            </Card.Header>

                            <Tab.Content>
                                <Tab.Pane eventKey="received">
                                    {receivedNotifications.length === 0 ? (
                                        <div className="p-5 text-center mt-4">
                                            <div className="display-1 text-light mb-3">
                                                <i className="bi bi-bell-slash"></i>
                                            </div>
                                            <h4 className="text-muted">No notifications found</h4>
                                            <p className="text-secondary">Try adjusting your filters or search terms.</p>
                                        </div>
                                    ) : (
                                        <ListGroup variant="flush">
                                            {receivedNotifications.map(n => {
                                                const cat = getCategoryDetails(n.type);
                                                const read = isRead(n);
                                                return (
                                                    <ListGroup.Item
                                                        key={n._id}
                                                        className={`p-4 border-bottom transition-all hover-bg-light ${!read ? 'bg-light-primary border-start border-primary border-4' : ''}`}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-start gap-3">
                                                            <div className="d-flex flex-shrink-0 align-items-center justify-content-center rounded-circle bg-light text-primary" style={{ width: '48px', height: '48px' }}>
                                                                <i className={`bi ${cat.icon} fs-4`}></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                                                    <h5 className={`mb-0 ${!read ? 'fw-bold' : 'text-dark'}`}>{n.title}</h5>
                                                                    <Badge bg={cat.color} className="text-uppercase small rounded-pill px-2" style={{ fontSize: '0.65rem' }}>
                                                                        {cat.label}
                                                                    </Badge>
                                                                    {!read && <Badge bg="primary" pill className="small">NEW</Badge>}
                                                                </div>
                                                                <p className="text-secondary mb-2 whitespace-pre-wrap">{n.message}</p>
                                                                <div className="d-flex flex-wrap gap-3 mt-2">
                                                                    <small className="text-muted d-flex align-items-center gap-1">
                                                                        <i className="bi bi-person-circle"></i>
                                                                        From: <span className="fw-semibold text-dark">{n.sender?.name || 'System'}</span>
                                                                        <span className="badge bg-light text-dark border ms-1">{n.senderRole || n.sender?.role}</span>
                                                                    </small>
                                                                    <small className="text-muted d-flex align-items-center gap-1">
                                                                        <i className="bi bi-calendar3"></i>
                                                                        {format(new Date(n.createdAt), 'MMM d, yyyy • h:mm a')}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex flex-column gap-2">
                                                                <Button
                                                                    variant={read ? 'outline-secondary' : 'outline-primary'}
                                                                    size="sm"
                                                                    className="rounded-pill px-3"
                                                                    onClick={() => handleToggleRead(n._id)}
                                                                >
                                                                    {read ? 'Mark Unread' : 'Mark Read'}
                                                                </Button>
                                                                {user.role === 'admin' && (
                                                                    <Button
                                                                        variant="link"
                                                                        className="text-danger p-0 mt-1 d-flex align-items-center justify-content-center gap-1 text-decoration-none small"
                                                                        onClick={() => handleDelete(n._id)}
                                                                    >
                                                                        <i className="bi bi-trash"></i> Delete
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </ListGroup.Item>
                                                );
                                            })}
                                        </ListGroup>
                                    )}
                                </Tab.Pane>
                                <Tab.Pane eventKey="sent">
                                    {sentNotifications.length === 0 ? (
                                        <div className="p-5 text-center mt-4">
                                            <div className="display-1 text-light mb-3">
                                                <i className="bi bi-send-x"></i>
                                            </div>
                                            <h4 className="text-muted">No sent notifications</h4>
                                        </div>
                                    ) : (
                                        <ListGroup variant="flush">
                                            {sentNotifications.map(n => {
                                                const cat = getCategoryDetails(n.type);
                                                return (
                                                    <ListGroup.Item key={n._id} className="p-4 border-bottom">
                                                        <div className="d-flex justify-content-between align-items-start gap-3">
                                                            <div className="d-flex flex-shrink-0 align-items-center justify-content-center rounded-circle bg-light text-secondary" style={{ width: '40px', height: '40px' }}>
                                                                <i className={`bi ${cat.icon} fs-5`}></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                                                    <h5 className="mb-0 fw-semibold">{n.title}</h5>
                                                                    <Badge bg="secondary" className="text-uppercase small rounded-pill px-2" style={{ fontSize: '0.65rem' }}>
                                                                        To: {n.recipientType.replace(/_/g, ' ')}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-secondary mb-2 small">{n.message}</p>
                                                                <div className="d-flex flex-wrap gap-3 mt-2">
                                                                    <small className="text-muted">
                                                                        <i className="bi bi-clock me-1"></i>
                                                                        Sent: {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                                                                    </small>
                                                                    <small className="text-muted">
                                                                        <i className="bi bi-eye me-1"></i>
                                                                        Read by: <span className="text-primary fw-bold">{n.readBy?.length || 0}</span> recipients
                                                                    </small>
                                                                    {n.sender?._id !== user._id && (
                                                                        <small className="text-muted italic">
                                                                            (Sent by: {n.sender?.name})
                                                                        </small>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="link"
                                                                className="text-danger p-0 text-decoration-none small d-flex align-items-center gap-1"
                                                                onClick={() => handleDelete(n._id)}
                                                            >
                                                                <i className="bi bi-trash"></i> Delete
                                                            </Button>
                                                        </div>
                                                    </ListGroup.Item>
                                                );
                                            })}
                                        </ListGroup>
                                    )}
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </Card>
                </Col>
            </Row>

            {/* Send Modal */}
            <Modal show={showSendModal} onHide={() => setShowSendModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                    <Modal.Title className="fw-bold">Send Notification</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSend}>
                    <Modal.Body className="px-4 py-3">
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-uppercase text-muted">Recipient Group</Form.Label>
                                    <Form.Select
                                        className="form-select-lg"
                                        value={formData.recipientType}
                                        onChange={(e) => setFormData({ ...formData, recipientType: e.target.value, recipientIds: [] })}
                                    >
                                        {user.role === 'admin' && (
                                            <>
                                                <option value="all_students">All Students</option>
                                                <option value="specific_students">Specific Students</option>
                                                <option value="all_companies">All Companies</option>
                                                <option value="specific_companies">Specific Companies</option>
                                                <option value="all_admins">Other Admins</option>
                                            </>
                                        )}
                                        {user.role === 'company' && (
                                            <>
                                                <option value="all_students">All Students</option>
                                                <option value="specific_students">Specific Students</option>
                                                <option value="admin">Admin Panel</option>
                                            </>
                                        )}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-uppercase text-muted">Category</Form.Label>
                                    <Form.Select
                                        className="form-select-lg"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        {NOTIFICATION_CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {(formData.recipientType === 'specific_students' || formData.recipientType === 'specific_companies') && (
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-uppercase text-muted">Select Individuals</Form.Label>
                                        <div className="border rounded-3 p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            <Row>
                                                {recipients
                                                    .filter(r => (formData.recipientType === 'specific_students' ? r.role === 'student' : r.role === 'company'))
                                                    .map(r => (
                                                        <Col sm={6} key={r._id} className="mb-2">
                                                            <Form.Check
                                                                type="checkbox"
                                                                id={`user-${r._id}`}
                                                                label={
                                                                    <div className="ms-1">
                                                                        <div className="fw-medium small">{r.name}</div>
                                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{r.email}</div>
                                                                    </div>
                                                                }
                                                                checked={formData.recipientIds.includes(r._id)}
                                                                onChange={(e) => {
                                                                    const ids = e.target.checked
                                                                        ? [...formData.recipientIds, r._id]
                                                                        : formData.recipientIds.filter(id => id !== r._id);
                                                                    setFormData({ ...formData, recipientIds: ids });
                                                                }}
                                                            />
                                                        </Col>
                                                    ))
                                                }
                                            </Row>
                                            {recipients.length === 0 && <div className="text-center text-muted py-2">No users found.</div>}
                                        </div>
                                    </Form.Group>
                                </Col>
                            )}

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-uppercase text-muted">Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        className="form-control-lg"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Schedule Update for Tomorrow"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-uppercase text-muted">Message Content</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        required
                                        className="bg-light"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Type your notification message here..."
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Check
                                    type="switch"
                                    id="email-toggle"
                                    label="Also send as Email notification"
                                    checked={formData.sendEmail}
                                    onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                                    className="fw-medium"
                                />
                                <small className="text-muted ms-4 d-block mt-1">Recipients will receive an email in addition to this platform alert.</small>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-0 px-4 pb-4 pt-0">
                        <Button variant="outline-secondary" className="px-4 py-2 rounded-pill" onClick={() => setShowSendModal(false)}>
                            Discard
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 rounded-pill shadow-sm">
                            <i className="bi bi-send-fill me-2"></i> Broadcast Notification
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}
