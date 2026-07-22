import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaBell,
    FaCheck,
    FaEnvelopeOpenText,
    FaExclamationTriangle,
    FaInfoCircle,
} from 'react-icons/fa';
import { spectatorApi } from '../../../api/spectatorApi';
import Toast from '../../shared/Toast';
import { useToast } from '../../shared/useToast';

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

export default function SpectatorNotifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [filter, setFilter] = useState('all');
    const { toast, showToast, hideToast } = useToast();

    const filteredNotifications = useMemo(() => {
        if (filter === 'unread') return notifications.filter((item) => !item.isRead);
        if (filter === 'read') return notifications.filter((item) => item.isRead);
        return notifications;
    }, [notifications, filter]);

    const selectedNotification = useMemo(
        () => filteredNotifications.find((item) => item.notificationId === selectedId) ?? filteredNotifications[0] ?? null,
        [filteredNotifications, selectedId]
    );

    useEffect(() => {
        let ignore = false;

        const loadNotifications = async (isInitial = false) => {
            if (isInitial) setLoading(true);

            try {
                const data = await spectatorApi.getSpectatorNotifications();
                if (!ignore) {
                    const items = Array.isArray(data) ? data : [];
                    setNotifications(items);
                    if (isInitial) setSelectedId(items[0]?.notificationId ?? null);
                }
            } catch (err) {
                if (!ignore && isInitial) {
                    setNotifications([]);
                    showToast(err.message || 'Failed to load notifications.', 'error', 'Error');
                }
            } finally {
                if (!ignore && isInitial) setLoading(false);
            }
        };

        loadNotifications(true);
        const refresh = () => loadNotifications(false);
        const intervalId = window.setInterval(refresh, 15000);
        window.addEventListener('focus', refresh);

        return () => {
            ignore = true;
            window.clearInterval(intervalId);
            window.removeEventListener('focus', refresh);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelect = async (notification) => {
        setSelectedId(notification.notificationId);

        if (notification.isRead) return;

        try {
            await spectatorApi.markSpectatorNotificationAsRead(notification.notificationId);
            setNotifications(prev => prev.map(n => n.notificationId === notification.notificationId ? { ...n, isRead: true } : n));
        } catch (err) {
            showToast(err.message || 'Failed to update notification.', 'error', 'Error');
        }
    };

    const handleOpenAction = async () => {
        if (!selectedNotification?.actionUrl) return;

        if (!selectedNotification.isRead) {
            await handleSelect(selectedNotification);
        }

        navigate(selectedNotification.actionUrl);
    };

    const handleMarkAllRead = async () => {
        if (markingAll) return;
        setMarkingAll(true);
        try {
            await spectatorApi.markAllSpectatorNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            showToast('All notifications marked as read.', 'success', 'Updated');
        } catch (err) {
            showToast(err.message || 'Failed to update. Please try again.', 'error', 'Error');
        } finally {
            setMarkingAll(false);
        }
    };

    const unread = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen">
            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
                duration={3500}
            />

            <div className="mb-8">
                <h1 className="page-title">Notifications</h1>
                <p className="page-subtitle">
                    Stay updated with live races, prediction events, tournament news, and exclusive spectator rewards.
                </p>
            </div>

            <div className="mb-8 flex flex-wrap gap-5">
                <div className="flex w-56 justify-between rounded-[8px] border border-[var(--admin-border)] bg-white p-5">
                    <div>
                        <p className="text-sm uppercase text-[var(--admin-muted)]">Total Alerts</p>
                        <h3 className="mt-2 text-2xl font-bold">{notifications.length}</h3>
                    </div>
                    <FaBell className="text-[var(--admin-primary)]" size={22} />
                </div>

                <div className="flex w-56 justify-between rounded-[8px] border border-[var(--admin-border)] bg-white p-5">
                    <div>
                        <p className="text-sm uppercase text-[var(--admin-muted)]">Unread</p>
                        <h3 className="mt-2 text-2xl font-bold text-[#a4392f]">{unread}</h3>
                    </div>
                    <FaExclamationTriangle className="text-[#a4392f]" size={22} />
                </div>

                <div className="flex items-center gap-3 rounded-[8px] border border-[var(--admin-border)] bg-white p-4">
                    <select
                        value={filter}
                        onChange={(event) => setFilter(event.target.value)}
                        className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-2 font-semibold outline-none focus:border-[var(--admin-primary)]"
                    >
                        <option value="all">All</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                    </select>

                    <button
                        type="button"
                        onClick={handleMarkAllRead}
                        disabled={markingAll || unread === 0}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-primary)] px-4 py-2 font-bold text-[var(--admin-primary)] transition-colors hover:bg-[var(--admin-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FaCheck aria-hidden="true" />
                        {markingAll ? 'Updating...' : 'Mark All Read'}
                    </button>
                </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
                <div className="space-y-2">
                    {loading ? (
                        <div className="rounded-[8px] border border-[var(--admin-border)] bg-white p-5 text-[var(--admin-muted)]">
                            Loading notifications...
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="rounded-[8px] border border-[var(--admin-border)] bg-white p-5 text-[var(--admin-muted)]">
                            No notifications for this filter.
                        </div>
                    ) : (
                        filteredNotifications.map((item) => (
                            <button
                                type="button"
                                key={item.notificationId}
                                onClick={() => handleSelect(item)}
                                className={`w-full cursor-pointer rounded-[8px] border border-[var(--admin-border)] bg-white p-4 text-left hover:bg-[#faf5f4] ${selectedNotification?.notificationId === item.notificationId ? 'ring-2 ring-[var(--admin-primary)]' : ''}`}
                            >
                                <div className="flex justify-between gap-3">
                                    <h3 className="font-medium">{item.title}</h3>
                                    <span className="whitespace-nowrap text-sm text-[var(--admin-muted)]">
                                        {formatDateTime(item.createdAt)}
                                    </span>
                                </div>

                                <p className="mt-2 line-clamp-2 text-sm text-[var(--admin-muted)]">
                                    {item.message}
                                </p>

                                {!item.isRead && (
                                    <span className="mt-3 inline-block rounded-full bg-[#f3e1df] px-2.5 py-1 text-xs font-semibold text-[#a4392f]">
                                        NEW
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>

                <div className="space-y-4">
                    <div className="overflow-hidden rounded-[8px] border border-[var(--admin-border)] bg-white">
                        {selectedNotification ? (
                            <>
                                <div className="flex items-center justify-between border-b p-4">
                                    <div className="flex items-center gap-2 rounded-full bg-[var(--admin-primary)] px-4 py-1 text-sm text-white">
                                        <FaEnvelopeOpenText />
                                        Spectator Alert
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs uppercase text-[var(--admin-muted)]">Time Received</p>
                                        <p className="font-medium">{formatDateTime(selectedNotification.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="p-6 leading-8 text-[var(--admin-ink)]">
                                    <h2 className="mb-4 text-2xl font-bold text-[#2b1b1b]">
                                        {selectedNotification.title}
                                    </h2>

                                    <p>{selectedNotification.message}</p>
                                </div>

                                <div className="border-t p-4">
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(selectedNotification)}
                                            disabled={selectedNotification.isRead}
                                            className="rounded-full bg-[var(--admin-primary)] px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            Mark as Read
                                        </button>
                                        {selectedNotification.actionUrl && (
                                            <button
                                                type="button"
                                                onClick={handleOpenAction}
                                                className="rounded-full border border-[var(--admin-primary)] bg-white px-5 py-2 font-bold text-[var(--admin-primary)]"
                                            >
                                                Open Related Page
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-6 text-[var(--admin-muted)]">
                                Select a notification to view details.
                            </div>
                        )}
                    </div>

                    <div className="rounded-[8px] border border-[var(--admin-border)] bg-white p-5">
                        <h3 className="mb-5 flex items-center gap-2 font-semibold">
                            <FaInfoCircle className="text-[var(--admin-primary)]" />
                            Recent Activity
                        </h3>

                        <div className="space-y-4">
                            {notifications.slice(0, 3).map((item) => (
                                <div key={item.notificationId} className="flex gap-3">
                                    <div className={`mt-2 h-3 w-3 rounded-full ${item.isRead ? 'bg-[var(--admin-border)]' : 'bg-[#a4392f]'}`} />
                                    <div>
                                        <p>{item.title}</p>
                                        <p className="text-sm text-[var(--admin-muted)]">
                                            {formatDateTime(item.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {notifications.length === 0 && (
                                <p className="text-sm text-[var(--admin-muted)]">
                                    No recent notification activity.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
