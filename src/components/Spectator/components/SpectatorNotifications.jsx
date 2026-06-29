import { useEffect, useState } from 'react';
import {
    FaBell,
    FaBullseye,
    FaCheckCircle,
} from 'react-icons/fa';
import { spectatorApi } from '../../../api/spectatorApi';
import Toast, { useToast } from '../../shared/Toast';

export default function SpectatorNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        spectatorApi.getSpectatorNotifications()
            .then(data => setNotifications(Array.isArray(data) ? data : []))
            .catch((err) => {
                setNotifications([]);
                showToast(err.message || 'Failed to load notifications.', 'error', 'Error');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await spectatorApi.markSpectatorNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
        } catch (err) {
            showToast(err.message || 'Failed to update notification.', 'error', 'Error');
        }
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

    if (loading) return <p className="m-0 text-center font-semibold text-[var(--admin-muted)]">Loading...</p>;

    const stats = [
        { label: "TOTAL ALERTS", value: notifications.length, icon: FaBell },
        { label: "UNREAD", value: unread, icon: FaBullseye },
        { label: "READ", value: notifications.length - unread, icon: FaCheckCircle },
    ];

    return (
        <div className="grid gap-7">
            <div className="flex items-start justify-between gap-4 max-[640px]:flex-col">
                <div>
                    <h2 className="page-title">Notifications</h2>
                    <p className="page-subtitle">
                        Stay updated with live races, prediction events, tournament news, and exclusive spectator rewards.
                    </p>
                </div>
                {unread > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={markingAll}
                        className="inline-flex min-h-[36px] cursor-pointer items-center rounded-md border border-[var(--admin-primary)] bg-transparent px-4 text-[0.82rem] font-bold text-[var(--admin-primary)] hover:bg-[#e8f7ef] disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                    >
                        {markingAll ? 'Updating...' : `Mark all read (${unread})`}
                    </button>
                )}
            </div>

            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
                duration={3500}
            />

            <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
                {stats.map((s) => {
                    const Icon = s.icon;

                    return (
                        <article key={s.label} className="stat-card min-h-[118px]">
                            <div className="stat-icon">
                                <Icon aria-hidden="true" />
                            </div>
                            <small className="stat-label">{s.label}</small>
                            <h3 className="stat-value text-[1.8rem]">{s.value}</h3>
                        </article>
                    );
                })}
            </div>

            <div className="grid gap-3">
                {notifications.length === 0 ? (
                    <p className="m-0 rounded-[8px] border border-[var(--admin-border)] bg-white p-10 text-center text-[var(--admin-muted)]">
                        No notifications.
                    </p>
                ) : (
                    notifications.map((n) => (
                        <article
                            key={n.notificationId}
                            className={`soft-card flex items-start gap-4 p-4 ${!n.isRead ? 'border-l-[3px] border-l-[var(--admin-primary)] bg-[#fff5f5]' : ''}`}
                        >
                            <div className="stat-icon h-10 w-10">
                                <FaBell aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <p className="m-0 font-bold text-[var(--admin-ink)]">{n.title}</p>
                                    <span className={`status-badge ${n.isRead ? 'bg-[#d4edda] text-[#155724]' : 'bg-[#fff3cd] text-[#856404]'}`}>
                                        {n.isRead ? 'Read' : 'Unread'}
                                    </span>
                                </div>
                                <p className="m-0 mt-2 text-[0.9rem] text-[var(--admin-muted)]">{n.message}</p>
                                <div className="mt-3 flex items-center justify-between gap-3 max-[640px]:flex-col max-[640px]:items-start">
                                    <span className="text-[0.76rem] text-[var(--admin-muted)]">
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </span>
                                    {!n.isRead && (
                                        <button
                                            onClick={() => handleMarkRead(n.notificationId)}
                                            className="primary-button min-h-8 px-3 text-[0.8rem]"
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
