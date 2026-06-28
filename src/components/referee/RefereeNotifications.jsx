import { useEffect, useMemo, useState } from 'react';
import {
    FaBell,
    FaExclamationTriangle,
    FaEnvelopeOpenText,
    FaInfoCircle,
} from 'react-icons/fa';

import { refereeApi } from '../../api/refereeApi';
import RefereeLayout from './RefereeLayout';

function formatDateTime(value) {
    if (!value) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function RefereeNotification() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const selectedNotification = useMemo(
        () => notifications.find((item) => item.notificationId === selectedId) ?? notifications[0] ?? null,
        [notifications, selectedId]
    );

    const filteredNotifications = useMemo(() => {
        if (filter === 'unread') return notifications.filter((item) => !item.isRead);
        if (filter === 'read') return notifications.filter((item) => item.isRead);
        return notifications;
    }, [notifications, filter]);

    const loadNotifications = async () => {
        setError('');
        const [notificationData, unreadData] = await Promise.all([
            refereeApi.getNotifications(),
            refereeApi.getUnreadCount().catch(() => ({ unreadCount: 0 })),
        ]);

        setNotifications(notificationData ?? []);
        setUnreadCount(unreadData?.unreadCount ?? 0);
        setSelectedId((current) => current ?? notificationData?.[0]?.notificationId ?? null);
    };

    useEffect(() => {
        let ignore = false;

        async function load() {
            setLoading(true);

            try {
                const [notificationData, unreadData] = await Promise.all([
                    refereeApi.getNotifications(),
                    refereeApi.getUnreadCount().catch(() => ({ unreadCount: 0 })),
                ]);

                if (ignore) return;

                setNotifications(notificationData ?? []);
                setUnreadCount(unreadData?.unreadCount ?? 0);
                setSelectedId(notificationData?.[0]?.notificationId ?? null);
            } catch (err) {
                if (!ignore) setError(err.message || 'Failed to load notifications.');
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        load();

        return () => {
            ignore = true;
        };
    }, []);

    const handleSelect = async (notification) => {
        setSelectedId(notification.notificationId);

        if (notification.isRead) return;

        try {
            await refereeApi.markNotificationAsRead(notification.notificationId);
            setNotifications((previous) => previous.map((item) => (
                item.notificationId === notification.notificationId
                    ? { ...item, isRead: true }
                    : item
            )));
            setUnreadCount((previous) => Math.max(0, previous - 1));
        } catch (err) {
            setError(err.message || 'Failed to mark notification as read.');
        }
    };

    const handleMarkAllRead = async () => {
        setSaving(true);
        setError('');

        try {
            await refereeApi.markAllNotificationsAsRead();
            await loadNotifications();
        } catch (err) {
            setError(err.message || 'Failed to mark all notifications as read.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <RefereeLayout
            activeKey="notifications"
            searchPlaceholder="Search notifications..."
        >
            <div className="min-h-screen bg-[#faf8f8] p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#0b7f5a]">
                        Referee Notifications
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Track race assignments, inspection updates, result submissions, and official race alerts.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-[8px] border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
                        {error}
                    </div>
                )}

                <div className="mb-8 flex flex-wrap gap-5">
                    <div className="flex w-56 justify-between rounded-[8px] border border-[#dce5ef] bg-white p-5">
                        <div>
                            <p className="text-sm uppercase text-gray-500">
                                Total Notifications
                            </p>

                            <h3 className="mt-2 text-2xl font-bold">
                                {notifications.length}
                            </h3>
                        </div>

                        <FaBell className="text-[#0b7f5a]" size={22} />
                    </div>

                    <div className="flex w-56 justify-between rounded-[8px] border border-[#dce5ef] bg-white p-5">
                        <div>
                            <p className="text-sm uppercase text-gray-500">
                                Unread Alerts
                            </p>

                            <h3 className="mt-2 text-2xl font-bold text-red-600">
                                {unreadCount}
                            </h3>
                        </div>

                        <FaExclamationTriangle className="text-red-500" size={22} />
                    </div>

                    <div className="flex items-center gap-3 rounded-[8px] border border-[#dce5ef] bg-white p-4">
                        <select
                            value={filter}
                            onChange={(event) => setFilter(event.target.value)}
                            className="rounded border border-[#dce5ef] px-3 py-2 font-semibold outline-none focus:border-[#0b7f5a]"
                        >
                            <option value="all">All</option>
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                        </select>

                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            disabled={saving || unreadCount === 0}
                            className="rounded-lg bg-[#0b7f5a] px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? 'Updating...' : 'Mark All Read'}
                        </button>
                    </div>
                </div>

                <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
                    <div className="space-y-2">
                        {loading ? (
                            <div className="rounded-[8px] border border-[#dce5ef] bg-white p-5 text-gray-500">
                                Loading notifications...
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="rounded-[8px] border border-[#dce5ef] bg-white p-5 text-gray-500">
                                No notifications for this filter.
                            </div>
                        ) : (
                            filteredNotifications.map((item) => (
                                <button
                                    type="button"
                                    key={item.notificationId}
                                    onClick={() => handleSelect(item)}
                                    className={`w-full cursor-pointer rounded-[8px] border border-[#dce5ef] bg-white p-4 text-left hover:bg-[#faf5f4] ${selectedNotification?.notificationId === item.notificationId ? 'ring-2 ring-[#0b7f5a]' : ''
                                        }`}
                                >
                                    <div className="flex justify-between gap-3">
                                        <h3 className="font-medium">
                                            {item.title}
                                        </h3>

                                        <span className="whitespace-nowrap text-sm text-gray-500">
                                            {formatDateTime(item.createdAt)}
                                        </span>
                                    </div>

                                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                                        {item.message}
                                    </p>

                                    {!item.isRead && (
                                        <span className="mt-3 inline-block rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                                            NEW
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="overflow-hidden rounded-[8px] border border-[#dce5ef] bg-white">
                            {selectedNotification ? (
                                <>
                                    <div className="flex items-center justify-between border-b p-4">
                                        <div className="flex items-center gap-2 rounded-full bg-[#f3a697] px-4 py-1 text-sm text-white">
                                            <FaEnvelopeOpenText />
                                            Referee Alert
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs uppercase text-gray-500">
                                                Time Received
                                            </p>

                                            <p className="font-medium">
                                                {formatDateTime(selectedNotification.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-6 leading-8 text-gray-700">
                                        <h2 className="mb-4 text-2xl font-bold text-[#2b1b1b]">
                                            {selectedNotification.title}
                                        </h2>

                                        <p>
                                            {selectedNotification.message}
                                        </p>
                                    </div>

                                    <div className="border-t p-4">
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleSelect(selectedNotification)}
                                                disabled={selectedNotification.isRead}
                                                className="rounded-lg bg-[#0b7f5a] px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Mark as Read
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-6 text-gray-500">
                                    Select a notification to view details.
                                </div>
                            )}
                        </div>

                        <div className="rounded-[8px] border border-[#dce5ef] bg-white p-5">
                            <h3 className="mb-5 flex items-center gap-2 font-semibold">
                                <FaInfoCircle className="text-[#0b7f5a]" />
                                Recent Referee Activity
                            </h3>

                            <div className="space-y-4">
                                {notifications.slice(0, 3).map((item) => (
                                    <div key={item.notificationId} className="flex gap-3">
                                        <div className={`mt-2 h-3 w-3 rounded-full ${item.isRead ? 'bg-gray-300' : 'bg-red-700'}`} />
                                        <div>
                                            <p>{item.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {formatDateTime(item.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {notifications.length === 0 && (
                                    <p className="text-sm text-gray-500">
                                        No recent notification activity.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RefereeLayout>
    );
}

export default RefereeNotification;
