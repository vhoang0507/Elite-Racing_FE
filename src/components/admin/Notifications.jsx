import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
    FaBell,
    FaCheck,
    FaEnvelopeOpenText,
    FaExclamationTriangle,
    FaFlagCheckered,
    FaInfoCircle,
    FaTh,
    FaTrophy,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import { confirmAdminAction } from '../../utils/adminFeedback';
import Toast from '../shared/Toast';
import { useToast } from '../shared/useToast';

import AdminLayout from './AdminLayout';

const formatClass = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');

const tagClass = {
    registration: 'bg-[#ffe2a0] text-[#7a5604]',
    'race-result': 'bg-[#dedfff] text-[#3732a1]',
    report: 'bg-[#ffd3cd] text-[#9a1111]',
    prediction: 'bg-[#f2dcd7] text-[#805349]',
    pending: 'bg-[#fff7db] text-[#a17809]',
    active: 'bg-[#e8f7ee] text-[#16864f]',
    inactive: 'bg-[#f3e8e6] text-[#7f645f]',
    banned: 'bg-[#e8f7ef] text-[var(--admin-primary)]',
    critical: 'bg-[#b40d0d] text-white',
    'high-priority': 'bg-[#e1bd55] text-[#3f320a]',
    'medium-priority': 'bg-[#bfc2ff] text-[#27236f]',
    'low-priority': 'bg-[#ead0cb] text-[#7a5d58]',
};

const iconByTone = {
    registration: FaTh,
    race: FaFlagCheckered,
    urgent: FaExclamationTriangle,
    prediction: FaTrophy,
};

const detailValue = (value) => (
    value === undefined || value === null || value === '' ? '-' : value
);

const formatDateTime = (value) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const matchesQuery = (notification, query) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return true;
    }

    return [
        notification.title,
        notification.type,
        notification.priority,
        notification.message,
    ].some((value) => String(value).toLowerCase().includes(normalizedQuery));
};

function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all-types');
    const [priorityFilter, setPriorityFilter] = useState('all-priority');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const selectedNotification = useMemo(
        () => notifications.find((item) => item.id === selectedId) ?? notifications[0] ?? null,
        [notifications, selectedId]
    );

    const filteredNotifications = useMemo(() => notifications.filter((notification) => (
        matchesQuery(notification, query)
        && (typeFilter === 'all-types' || formatClass(notification.type) === typeFilter)
        && (priorityFilter === 'all-priority' || formatClass(notification.priority) === priorityFilter)
    )), [notifications, priorityFilter, query, typeFilter]);

    useEffect(() => {
        let isMounted = true;

        const refreshNotifications = async (isInitial = false) => {
            if (isInitial) setLoading(true);

            try {
                const payload = await adminApi.getNotifications();

                if (isMounted) {
                    setNotifications(payload ?? []);
                    if (isInitial) {
                        setSelectedId(payload?.[0]?.id ?? null);
                    }
                }
            } catch (err) {
                if (isMounted && isInitial) {
                    showToast(err.message || 'Failed to load notifications.', 'error');
                }
            } finally {
                if (isMounted && isInitial) setLoading(false);
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refreshNotifications(false);
            }
        };

        refreshNotifications(true);
        const intervalId = window.setInterval(() => refreshNotifications(false), 10000);

        window.addEventListener('focus', () => refreshNotifications(false));
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const unreadCount = notifications.filter((notification) => !notification.isRead).length;

    const handleQueryChange = (value) => {
        setQuery(value);
    };

    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
    };

    const handleSelect = async (notification) => {
        setSelectedId(notification.id);

        if (notification.isRead) {
            return;
        }

        const prev = notifications;
        setNotifications((current) => current.map((item) => (
            item.id === notification.id ? { ...item, isRead: true, status: 'Read' } : item
        )));

        try {
            await adminApi.markNotificationRead(notification.id);
            window.dispatchEvent(new Event('admin-notifications-changed'));
        } catch (err) {
            setNotifications(prev);
            showToast(err.message || 'Failed to mark as read.', 'error', 'Error');
        }
    };

    const handleMarkAllRead = async () => {
        const confirmed = await confirmAdminAction({
            title: 'Mark all notifications as read',
            message: 'Are you sure you want to mark all notifications as read?',
            confirmLabel: 'Mark All Read',
        });

        if (!confirmed) {
            return;
        }

        setSaving(true);
        const prev = notifications;
        setNotifications((current) => current.map((n) => ({ ...n, isRead: true, status: 'Read' })));

        try {
            await adminApi.markAllNotificationsRead();
            window.dispatchEvent(new Event('admin-notifications-changed'));
            showToast('All notifications marked as read.', 'success', 'Updated');
        } catch (err) {
            setNotifications(prev);
            showToast(err.message || 'Failed to update. Please try again.', 'error', 'Error');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenAction = () => {
        const actionUrl = selectedNotification?.actionUrl;

        if (!actionUrl) {
            return;
        }

        navigate(actionUrl);
    };

    return (
        <AdminLayout
            activeKey="notifications"
            mainClassName="notifications-main"
            onSearchChange={handleQueryChange}
            searchPlaceholder="Search notifications..."
            searchValue={query}
        >
            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
                duration={3500}
            />

            <div className="min-h-screen bg-[#faf8f8] p-8">
                <div className="mb-8">
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-subtitle">
                        Monitor system updates, approvals, reports, and important activities.
                    </p>
                </div>

                <div className="mb-8 flex flex-wrap gap-5">
                    <div className="flex w-56 justify-between rounded-[8px] border border-[var(--admin-border)] bg-white p-5">
                        <div>
                            <p className="text-sm uppercase text-[var(--admin-muted)]">Total Notifications</p>
                            <h3 className="mt-2 text-2xl font-bold">{notifications.length}</h3>
                        </div>
                        <FaBell className="text-[var(--admin-primary)]" size={22} />
                    </div>

                    <div className="flex w-56 justify-between rounded-[8px] border border-[var(--admin-border)] bg-white p-5">
                        <div>
                            <p className="text-sm uppercase text-[var(--admin-muted)]">Unread Notifications</p>
                            <h3 className="mt-2 text-2xl font-bold text-[#a4392f]">{unreadCount}</h3>
                        </div>
                        <FaExclamationTriangle className="text-[#a4392f]" size={22} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-[var(--admin-border)] bg-white p-4">
                        <select
                            value={typeFilter}
                            onChange={handleFilterChange(setTypeFilter)}
                            className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-2 font-semibold outline-none focus:border-[var(--admin-primary)]"
                        >
                            <option value="all-types">All Types</option>
                            <option value="registration">Registration</option>
                            <option value="race-result">Race Result</option>
                            <option value="report">Report</option>
                            <option value="prediction">Prediction</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={handleFilterChange(setPriorityFilter)}
                            className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-2 font-semibold outline-none focus:border-[var(--admin-primary)]"
                        >
                            <option value="all-priority">All Priority</option>
                            <option value="critical">Critical</option>
                            <option value="high-priority">High Priority</option>
                            <option value="medium-priority">Medium Priority</option>
                            <option value="low-priority">Low Priority</option>
                        </select>

                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            disabled={saving || unreadCount === 0}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-primary)] px-4 py-2 font-bold text-[var(--admin-primary)] transition-colors hover:bg-[var(--admin-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <FaCheck aria-hidden="true" />
                            {saving ? 'Updating...' : 'Mark All Read'}
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
                            filteredNotifications.map((notification) => (
                                <button
                                    type="button"
                                    key={notification.id}
                                    onClick={() => handleSelect(notification)}
                                    className={`w-full cursor-pointer rounded-[8px] border border-[var(--admin-border)] bg-white p-4 text-left hover:bg-[#faf5f4] ${selectedNotification?.id === notification.id ? 'ring-2 ring-[var(--admin-primary)]' : ''}`}
                                >
                                    <div className="flex justify-between gap-3">
                                        <h3 className="font-medium">{notification.title}</h3>
                                        <span className="whitespace-nowrap text-sm text-[var(--admin-muted)]">
                                            {notification.time}
                                        </span>
                                    </div>

                                    <p className="mt-2 line-clamp-2 text-sm text-[var(--admin-muted)]">
                                        {notification.message}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        {[notification.type, notification.priority].filter(Boolean).map((tag) => (
                                            <span
                                                className={`inline-flex min-h-5 items-center rounded-full px-2 text-[0.58rem] font-black uppercase ${tagClass[formatClass(tag)] || tagClass.prediction}`}
                                                key={tag}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {!notification.isRead && (
                                            <span className="inline-block rounded-full bg-[#f3e1df] px-2.5 py-1 text-xs font-semibold text-[#a4392f]">
                                                NEW
                                            </span>
                                        )}
                                    </div>
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
                                            Admin Alert
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs uppercase text-[var(--admin-muted)]">Time Received</p>
                                            <p className="font-medium">{detailValue(selectedNotification.time)}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 leading-8 text-[var(--admin-ink)]">
                                        <h2 className="mb-4 text-2xl font-bold text-[#2b1b1b]">
                                            {selectedNotification.title}
                                        </h2>

                                        <p>{selectedNotification.message}</p>

                                        <div className="mt-5 grid grid-cols-2 gap-3 max-[680px]:grid-cols-1">
                                            <div className="grid gap-1 rounded-md bg-[var(--admin-surface-strong)] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[var(--admin-muted)]">Notification ID</span>
                                                <strong className="break-words text-[0.88rem]">{detailValue(selectedNotification.id)}</strong>
                                            </div>
                                            <div className="grid gap-1 rounded-md bg-[var(--admin-surface-strong)] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[var(--admin-muted)]">Created At</span>
                                                <strong className="break-words text-[0.88rem]">{formatDateTime(selectedNotification.createdAt)}</strong>
                                            </div>
                                            <div className="grid gap-1 rounded-md bg-[var(--admin-surface-strong)] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[var(--admin-muted)]">Type</span>
                                                <strong className="break-words text-[0.88rem]">{detailValue(selectedNotification.type)}</strong>
                                            </div>
                                            <div className="grid gap-1 rounded-md bg-[var(--admin-surface-strong)] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[var(--admin-muted)]">Priority</span>
                                                <strong className="break-words text-[0.88rem]">{detailValue(selectedNotification.priority)}</strong>
                                            </div>
                                        </div>
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
                                                    {selectedNotification.type === 'registration' ? 'Review Registration' : 'Open Related Page'}
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
                                {notifications.slice(0, 3).map((item) => {
                                    const Icon = iconByTone[item.tone] || FaBell;

                                    return (
                                        <div key={item.id} className="flex gap-3">
                                            <div className={`mt-2 h-3 w-3 rounded-full ${item.isRead ? 'bg-[var(--admin-border)]' : 'bg-[#a4392f]'}`} />
                                            <div>
                                                <p className="flex items-center gap-2">
                                                    <Icon aria-hidden="true" className="text-[var(--admin-muted)]" />
                                                    {item.title}
                                                </p>
                                                <p className="text-sm text-[var(--admin-muted)]">{item.time}</p>
                                            </div>
                                        </div>
                                    );
                                })}

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
        </AdminLayout>
    );
}

export default Notifications;
