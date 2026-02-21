import api from './api';

const sendNotification = async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
};

const getNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

const markAsRead = async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
};

const deleteNotification = async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
};

const notificationService = {
    sendNotification,
    getNotifications,
    markAsRead,
    deleteNotification
};

export default notificationService;
