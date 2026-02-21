import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import notificationService from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

export default function BadgeCount() {
    const [count, setCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchCount();
            // Optional: Set up interval for "real-time" feel
            const interval = setInterval(fetchCount, 30000); // every 30 seconds
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchCount = async () => {
        try {
            const notifications = await notificationService.getNotifications();
            const userIdString = user?._id?.toString() || user?.id?.toString();

            // Only count notifications where user is not in readBy
            const unreadCount = notifications.filter(n => {
                const isRead = n.readBy.some(read => (read.user?._id || read.user)?.toString() === userIdString);

                // For unread count, we only care about notifications that are "received" by the user
                // according to the refined getNotifications logic, it already only returns what user should see.
                // But we should filter out those SENT by the user if we only want to show unread for RECEIVED ones.
                const senderIdString = n.sender?._id?.toString() || n.sender?.toString();
                const isSentByMe = senderIdString === userIdString;

                return !isRead && !isSentByMe;
            }).length;

            setCount(unreadCount);
        } catch (error) {
            console.error('Failed to fetch notification count:', error);
        }
    };

    if (count === 0) return null;

    return (
        <Badge
            pill
            bg="danger"
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.6rem' }}
        >
            {count > 99 ? '99+' : count}
        </Badge>
    );
}
