import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaBell,
    FaCheck,
    FaExclamationTriangle,
    FaEnvelopeOpenText,
    FaInfoCircle,
    FaTrashAlt,
} from 'react-icons/fa';

import { refereeApi } from '../../api/refereeApi';
import RefereeLayout from './RefereeLayout';
import Toast from '../shared/Toast';
import { useToast } from '../shared/useToast';
import { confirmAdminAction } from '../../utils/adminFeedback';

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

const DISMISSED_NOTIFICATIONS_KEY = 'referee-dismissed-notification-ids';

const readDismissedNotificationIds = () => {
    try {
        const parsed = JSON.parse(window.localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
        return [];
    }
};

const saveDismissedNotificationIds = (ids) => {
    try {
        window.localStorage.setItem(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify(ids));
    } catch {
        // Ignore storage errors; the notification still disappears for this session.
    }
};

function RefereeNotification() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [dismissedIds, setDismissedIds] = useState(readDismissedNotificationIds);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedNotificationIds, setSelectedNotificationIds] = useState([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const dismissedIdSet = useMemo(() => new Set(dismissedIds), [dismissedIds]);
    const selectedNotificationIdSet = useMemo(() => new Set(selectedNotificationIds), [selectedNotificationIds]);

    const visibleNotifications = useMemo(
        () => notifications.filter((item) => !dismissedIdSet.has(String(item.notificationId))),
        [dismissedIdSet, notifications]
    );

    const selectedNotification = useMemo(
        () => visibleNotifications.find((item) => item.notificationId === selectedId) ?? visibleNotifications[0] ?? null,
        [selectedId, visibleNotifications]
    );

    const filteredNotifications = useMemo(() => {
        if (filter === 'unread') return visibleNotifications.filter((item) => !item.isRead);
        if (filter === 'read') return visibleNotifications.filter((item) => item.isRead);
        return visibleNotifications;
    }, [filter, visibleNotifications]);

    const visibleUnreadCount = visibleNotifications.filter((item) => !item.isRead).length;

    const loadNotifications = async () => {
        try {
            const [notificationData, unreadData] = await Promise.all([
                refereeApi.getNotifications(),
                refereeApi.getUnreadCount().catch(() => ({ unreadCount: 0 })),
            ]);

            setNotifications(notificationData ?? []);
            setUnreadCount(unreadData?.unreadCount ?? 0);
            setSelectedId((current) => current ?? notificationData?.[0]?.notificationId ?? null);
        } catch (err) {
            showToast(err.message || 'Failed to load notifications.', 'error');
        }
    };

    useEffect(() => {
        let ignore = false;

        async function load(isInitial = false) {
            if (isInitial) setLoading(true);

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
                if (!ignore && isInitial) showToast(err.message || 'Failed to load notifications.', 'error');
            } finally {
                if (!ignore && isInitial) setLoading(false);
            }
        }

        load(true);
        const refresh = () => load(false);
        const intervalId = window.setInterval(refresh, 15000);
        window.addEventListener('focus', refresh);

        return () => {
            ignore = true;
            window.clearInterval(intervalId);
            window.removeEventListener('focus', refresh);
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
            showToast(err.message || 'Failed to mark notification as read.', 'error');
        }
    };

    const toggleNotificationSelection = (notificationId) => {
        const id = String(notificationId);
        setSelectedNotificationIds((previous) => (
            previous.includes(id)
                ? previous.filter((item) => item !== id)
                : [...previous, id]
        ));
    };

    const handleToggleNotificationSelection = (event, notificationId) => {
        event.stopPropagation();
        toggleNotificationSelection(notificationId);
    };

    const handleToggleSelectionMode = () => {
        if (selectionMode) {
            setSelectedNotificationIds([]);
        }
        setSelectionMode(!selectionMode);
    };

    const handleNotificationKeyDown = (event, notification) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        if (selectionMode) {
            toggleNotificationSelection(notification.notificationId);
            return;
        }
        handleSelect(notification);
    };

    const handleDeleteNotification = async (event, notification) => {
        event.stopPropagation();
        if (deletingId) return;

        const confirmed = await confirmAdminAction({
            title: 'Delete notification',
            message: 'Remove this notification from your list?',
            confirmLabel: 'Delete',
        });

        if (!confirmed) return;

        const previousDismissedIds = dismissedIds;
        const nextDismissedIds = Array.from(new Set([...dismissedIds, String(notification.notificationId)]));
        const nextSelectedId = filteredNotifications.find((item) => item.notificationId !== notification.notificationId)?.notificationId ?? null;

        setDeletingId(notification.notificationId);
        setDismissedIds(nextDismissedIds);
        saveDismissedNotificationIds(nextDismissedIds);
        if (selectedNotification?.notificationId === notification.notificationId) {
            setSelectedId(nextSelectedId);
        }

        try {
            if (!notification.isRead) {
                await refereeApi.markNotificationAsRead(notification.notificationId);
                setUnreadCount((previous) => Math.max(0, previous - 1));
            }
            showToast('Notification deleted.', 'success', 'Deleted');
        } catch (err) {
            setDismissedIds(previousDismissedIds);
            saveDismissedNotificationIds(previousDismissedIds);
            if (selectedNotification?.notificationId === notification.notificationId) {
                setSelectedId(notification.notificationId);
            }
            showToast(err.message || 'Failed to delete notification.', 'error', 'Error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleBulkDeleteNotifications = async () => {
        if (bulkDeleting || selectedNotificationIds.length === 0) return;

        const targetIdSet = new Set(selectedNotificationIds);
        const targetNotifications = visibleNotifications.filter((item) => targetIdSet.has(String(item.notificationId)));
        if (targetNotifications.length === 0) return;

        const confirmed = await confirmAdminAction({
            title: 'Delete selected notifications',
            message: `Remove ${targetNotifications.length} selected notification${targetNotifications.length === 1 ? '' : 's'} from your list?`,
            confirmLabel: 'Delete Selected',
        });

        if (!confirmed) return;

        const previousDismissedIds = dismissedIds;
        const previousUnreadCount = unreadCount;
        const nextDismissedIds = Array.from(new Set([...dismissedIds, ...targetNotifications.map((item) => String(item.notificationId))]));
        const nextSelectedId = filteredNotifications.find((item) => !targetIdSet.has(String(item.notificationId)))?.notificationId ?? null;
        const unreadDeleted = targetNotifications.filter((item) => !item.isRead).length;

        setBulkDeleting(true);
        setDismissedIds(nextDismissedIds);
        saveDismissedNotificationIds(nextDismissedIds);
        setUnreadCount((previous) => Math.max(0, previous - unreadDeleted));
        if (selectedNotification && targetIdSet.has(String(selectedNotification.notificationId))) {
            setSelectedId(nextSelectedId);
        }

        try {
            await Promise.all(
                targetNotifications
                    .filter((item) => !item.isRead)
                    .map((item) => refereeApi.markNotificationAsRead(item.notificationId))
            );
            setSelectedNotificationIds([]);
            setSelectionMode(false);
            showToast('Selected notifications deleted.', 'success', 'Deleted');
        } catch (err) {
            setDismissedIds(previousDismissedIds);
            saveDismissedNotificationIds(previousDismissedIds);
            setUnreadCount(previousUnreadCount);
            if (selectedNotification && targetIdSet.has(String(selectedNotification.notificationId))) {
                setSelectedId(selectedNotification.notificationId);
            }
            showToast(err.message || 'Failed to delete selected notifications.', 'error', 'Error');
        } finally {
            setBulkDeleting(false);
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
        setSaving(true);

        try {
            await refereeApi.markAllNotificationsAsRead();
            await loadNotifications();
            showToast('All notifications marked as read.', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to mark all notifications as read.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <RefereeLayout
            activeKey="notifications"
            searchPlaceholder="Search notifications..."
        >
            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
            />
            <div className="min-h-screen bg-[#faf8f8] p-8">
                <div className="mb-8">
                    <h1 className="page-title">
                        Referee Notifications
                    </h1>

                    <p className="page-subtitle">
                        Track race assignments, inspection updates, result submissions, and official race alerts.
                    </p>
                </div>

                <div className="mb-8 flex flex-wrap gap-5">
                    <div className="flex w-56 justify-between rounded-[8px] border border-[var(--admin-border)] bg-white p-5">
                        <div>
                            <p className="text-sm uppercase text-[var(--admin-muted)]">
                                Total Notifications
                            </p>

                            <h3 className="mt-2 text-2xl font-bold">
                                {visibleNotifications.length}
                            </h3>
                        </div>

                        <FaBell className="text-[var(--admin-primary)]" size={22} />
                    </div>

                    <div className="flex w-56 justify-between rounded-[8px] border border-[var(--admin-border)] bg-white p-5">
                        <div>
                            <p className="text-sm uppercase text-[var(--admin-muted)]">
                                Unread Alerts
                            </p>

                            <h3 className="mt-2 text-2xl font-bold text-[#a4392f]">
                                {visibleUnreadCount}
                            </h3>
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
                            disabled={saving || visibleUnreadCount === 0}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-primary)] px-4 py-2 font-bold text-[var(--admin-primary)] transition-colors hover:bg-[var(--admin-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <FaCheck aria-hidden="true" />
                            {saving ? 'Updating...' : 'Mark All Read'}
                        </button>

                        <button
                            type="button"
                            onClick={handleToggleSelectionMode}
                            disabled={bulkDeleting}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-primary)] px-4 py-2 font-bold text-[var(--admin-primary)] transition-colors hover:bg-[var(--admin-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {selectionMode ? 'Cancel Selection' : 'Select Notifications'}
                        </button>

                        {selectionMode && (
                            <button
                                type="button"
                                onClick={handleBulkDeleteNotifications}
                                disabled={bulkDeleting || selectedNotificationIds.length === 0}
                                className="inline-flex items-center gap-2 rounded-full border border-[#a4392f] bg-[#a4392f] px-4 py-2 font-bold text-white transition-colors hover:bg-[#8f3129] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FaTrashAlt aria-hidden="true" />
                                {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedNotificationIds.length})`}
                            </button>
                        )}
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
                                <article
                                    key={item.notificationId}
                                    onClick={() => (selectionMode ? toggleNotificationSelection(item.notificationId) : handleSelect(item))}
                                    onKeyDown={(event) => handleNotificationKeyDown(event, item)}
                                    role="button"
                                    tabIndex={0}
                                    className={`w-full cursor-pointer rounded-[8px] border border-[var(--admin-border)] bg-white p-4 text-left hover:bg-[#faf5f4] ${selectionMode && selectedNotificationIdSet.has(String(item.notificationId)) ? 'ring-2 ring-[var(--admin-primary)]' : selectedNotification?.notificationId === item.notificationId ? 'ring-2 ring-[var(--admin-primary)]' : ''
                                        }`}
                                >
                                    <div className="flex justify-between gap-3">
                                        <h3 className="font-medium">
                                            {item.title}
                                        </h3>

                                        <span className="whitespace-nowrap text-sm text-[var(--admin-muted)]">
                                            {formatDateTime(item.createdAt)}
                                        </span>
                                    </div>

                                    <p className="mt-2 line-clamp-2 text-sm text-[var(--admin-muted)]">
                                        {item.message}
                                    </p>

                                    <div className="mt-3 flex items-end justify-between gap-3">
                                        <div>
                                            {!item.isRead && (
                                                <span className="inline-block rounded-full bg-[#f3e1df] px-2.5 py-1 text-xs font-semibold text-[#a4392f]">
                                                    NEW
                                                </span>
                                            )}
                                        </div>

                                        {selectionMode ? (
                                            <label
                                                aria-label={`Select notification ${item.title}`}
                                                title="Select notification"
                                                onClick={(event) => event.stopPropagation()}
                                                className="grid h-8 w-8 flex-none cursor-pointer place-items-center rounded-full border border-[var(--admin-primary)] bg-white"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedNotificationIdSet.has(String(item.notificationId))}
                                                    onChange={(event) => handleToggleNotificationSelection(event, item.notificationId)}
                                                    className="h-4 w-4 accent-[var(--admin-primary)]"
                                                />
                                            </label>
                                        ) : (
                                            <button
                                                type="button"
                                                aria-label={`Delete notification ${item.title}`}
                                                title="Delete notification"
                                                disabled={deletingId === item.notificationId}
                                                onClick={(event) => handleDeleteNotification(event, item)}
                                                className="grid h-8 w-8 flex-none place-items-center rounded-full border border-[#e3bcb7] bg-white text-[#a4392f] transition-colors hover:bg-[#f3e1df] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <FaTrashAlt aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                </article>
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
                                            Referee Alert
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs uppercase text-[var(--admin-muted)]">
                                                Time Received
                                            </p>

                                            <p className="font-medium">
                                                {formatDateTime(selectedNotification.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-6 leading-8 text-[var(--admin-ink)]">
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
                                Recent Referee Activity
                            </h3>

                            <div className="space-y-4">
                                {visibleNotifications.slice(0, 3).map((item) => (
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

                                {visibleNotifications.length === 0 && (
                                    <p className="text-sm text-[var(--admin-muted)]">
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
