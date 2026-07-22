import { useState, useEffect, useMemo } from 'react';
import {
    FaBell,
    FaEnvelope,
    FaEnvelopeOpenText,
    FaExclamationTriangle,
    FaInfoCircle,
    FaCheck,
} from 'react-icons/fa';

import JockeyLayout from './JockeyLayout';
import { jockeyApi } from '../../api/jockeyApi';
import { resolveFileUrl } from '../../api/uploadApi';
import ImageLightbox from '../shared/ImageLightbox';
import Toast from '../shared/Toast';
import { useToast } from '../shared/useToast';

function HealthCertificateLink({ url }) {
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const resolvedUrl = resolveFileUrl(url);

    if (!url) {
        return <span className="text-[var(--admin-muted)]">Not uploaded</span>;
    }

    return (
        <>
            <button
                className="inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 font-bold text-[var(--admin-primary)] hover:underline"
                onClick={() => setLightboxSrc(resolvedUrl)}
                type="button"
            >
                <img alt="Health certificate" className="h-8 w-11 rounded border border-[var(--admin-border)] object-cover" src={resolvedUrl} />
                Open certificate
            </button>
            <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        </>
    );
}

function JockeyNotifications() {
    const [summary, setSummary] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');
    const [detailExtra, setDetailExtra] = useState(null);
    const [status, setStatus] = useState('All');
    const [date, setDate] = useState('');
    const [sort, setSort] = useState('Newest');
    const { toast, showToast, hideToast } = useToast();

    const selectedNotification = useMemo(() => {
        const base = notifications.find((item) => item.notificationId === selectedId) ?? notifications[0] ?? null;
        if (!base) return null;
        return detailExtra && detailExtra.notificationId === base.notificationId ? { ...base, ...detailExtra } : base;
    }, [notifications, selectedId, detailExtra]);

    const fetchNotifications = async () => {
        try {
            const data = await jockeyApi.getNotifications({
                status: status !== 'All' ? status : undefined,
                date: date || undefined,
                sort,
            });
            const items = data.items ?? [];
            setNotifications(items);
            setSelectedId((current) => (
                current && items.some((item) => item.notificationId === current)
                    ? current
                    : items[0]?.notificationId ?? null
            ));
        } catch (err) {
            setNotifications([]);
            showToast(err.message || 'Failed to load notifications.', 'error', 'Error');
        }
    };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [summaryData] = await Promise.all([
                    jockeyApi.getNotificationSummary().catch(() => null),
                ]);
                setSummary(summaryData);
                await fetchNotifications();
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, date, sort]);

    const handleMarkAllRead = async () => {
        const prevNotifs = notifications;
        const prevSummary = summary;
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setSummary(prev => prev ? { ...prev, unread: 0 } : prev);
        try {
            await jockeyApi.markAllNotificationsAsRead();
            showToast('All notifications marked as read.', 'success', 'Updated');
        } catch (err) {
            setNotifications(prevNotifs);
            setSummary(prevSummary);
            showToast(err.message || 'Failed to update. Please try again.', 'error', 'Error');
        }
    };

    const handleSelect = async (notif) => {
        setSelectedId(notif.notificationId);
        setDetailLoading(true);
        setDetailError('');

        try {
            const detail = await jockeyApi.getNotificationDetail(notif.notificationId);
            setDetailExtra({ notificationId: notif.notificationId, ...detail });
        } catch (err) {
            setDetailError(err.message || 'Failed to load notification detail');
        } finally {
            setDetailLoading(false);
        }

        if (!notif.isRead) {
            try {
                await jockeyApi.markNotificationAsRead(notif.notificationId);
                setNotifications(prev => prev.map(n =>
                    n.notificationId === notif.notificationId ? { ...n, isRead: true } : n
                ));
                setSummary(prev => prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : prev);
            } catch {
                // Ignore notification count refresh errors.
            }
        }
    };

    if (loading) return (
        <JockeyLayout activeKey="notifications">
            <p className="p-10 text-center font-semibold text-[var(--admin-muted)]">Loading...</p>
        </JockeyLayout>
    );

    return (
        <JockeyLayout activeKey="notifications">
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
                            <p className="text-sm uppercase text-[var(--admin-muted)]">Total Alerts</p>
                            <h3 className="mt-2 text-2xl font-bold">{summary?.totalAlerts ?? 0}</h3>
                        </div>
                        <FaBell className="text-[var(--admin-primary)]" size={22} />
                    </div>

                    <div className="flex w-56 justify-between rounded-[8px] border border-[var(--admin-border)] bg-white p-5">
                        <div>
                            <p className="text-sm uppercase text-[var(--admin-muted)]">Unread</p>
                            <h3 className="mt-2 text-2xl font-bold text-[#a4392f]">{summary?.unread ?? 0}</h3>
                        </div>
                        <FaExclamationTriangle className="text-[#a4392f]" size={22} />
                    </div>

                    <div className="flex w-56 justify-between rounded-[8px] border border-[var(--admin-border)] bg-white p-5">
                        <div>
                            <p className="text-sm uppercase text-[var(--admin-muted)]">Invitations</p>
                            <h3 className="mt-2 text-2xl font-bold">{summary?.invitations ?? 0}</h3>
                        </div>
                        <FaEnvelope className="text-[var(--admin-primary)]" size={22} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-[var(--admin-border)] bg-white p-4">
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-2 font-semibold outline-none focus:border-[var(--admin-primary)]"
                        >
                            <option value="All">Status: All</option>
                            <option value="Unread">Unread</option>
                            <option value="Read">Read</option>
                        </select>

                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-2 outline-none"
                        />

                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value)}
                            className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-2 font-semibold outline-none focus:border-[var(--admin-primary)]"
                        >
                            <option value="Newest">Newest</option>
                            <option value="Oldest">Oldest</option>
                        </select>

                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-primary)] px-4 py-2 font-bold text-[var(--admin-primary)] transition-colors hover:bg-[var(--admin-surface-strong)]"
                        >
                            <FaCheck aria-hidden="true" />
                            Mark All Read
                        </button>
                    </div>
                </div>

                <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
                    <div className="space-y-2">
                        {notifications.length === 0 ? (
                            <div className="rounded-[8px] border border-[var(--admin-border)] bg-white p-5 text-[var(--admin-muted)]">
                                No notifications for this filter.
                            </div>
                        ) : (
                            notifications.map((item) => (
                                <button
                                    type="button"
                                    key={item.notificationId}
                                    onClick={() => handleSelect(item)}
                                    className={`w-full cursor-pointer rounded-[8px] border border-[var(--admin-border)] bg-white p-4 text-left hover:bg-[#faf5f4] ${selectedNotification?.notificationId === item.notificationId ? 'ring-2 ring-[var(--admin-primary)]' : ''}`}
                                >
                                    <div className="flex justify-between gap-3">
                                        <h3 className="font-medium">{item.title}</h3>
                                        <span className="whitespace-nowrap text-sm text-[var(--admin-muted)]">
                                            {item.displayTime}
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
                                            Jockey Alert
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs uppercase text-[var(--admin-muted)]">Time Received</p>
                                            <p className="font-medium">{selectedNotification.displayTime}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 leading-8 text-[var(--admin-ink)]">
                                        <h2 className="mb-4 text-2xl font-bold text-[#2b1b1b]">
                                            {selectedNotification.title}
                                        </h2>

                                        {detailLoading && (
                                            <div className="mb-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-[0.82rem] font-bold text-[var(--admin-muted)]">
                                                Loading notification detail...
                                            </div>
                                        )}
                                        {detailError && (
                                            <div className="mb-4 rounded-[var(--admin-radius)] border border-[#d89288] bg-[#f3e1df] px-4 py-3 text-[0.82rem] font-bold text-[#a4392f]">
                                                {detailError}
                                            </div>
                                        )}

                                        <p>{selectedNotification.message}</p>

                                        {selectedNotification.raceDetail && (
                                            <div className="mt-5 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4 leading-normal">
                                                <div className="mb-2 text-[0.75rem] font-bold uppercase text-[var(--admin-muted)]">Race Detail</div>
                                                <div className="grid gap-2">
                                                    <strong>{selectedNotification.raceDetail.raceName}</strong>
                                                    <span>{selectedNotification.raceDetail.horseName} - {selectedNotification.raceDetail.ownerName}</span>
                                                    <span className="text-[var(--admin-muted)]">{selectedNotification.raceDetail.horseHealthStatus || '-'}</span>
                                                    <div>
                                                        <div className="mb-1 text-[0.75rem] font-bold uppercase text-[var(--admin-muted)]">Health Certificate</div>
                                                        <HealthCertificateLink url={selectedNotification.raceDetail.healthCertificateImageUrl} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
                                            <p className="text-sm text-[var(--admin-muted)]">{item.displayTime}</p>
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
        </JockeyLayout>
    );
}

export default JockeyNotifications;
