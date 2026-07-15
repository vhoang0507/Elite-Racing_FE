import { useState, useEffect } from 'react';
import {
    FaBell,
    FaEnvelope,
    FaTrophy,
    FaCog,
    FaCheck,
    FaFilter,
} from 'react-icons/fa';

import JockeyLayout from './JockeyLayout';
import { jockeyApi } from '../../api/jockeyApi';
import { resolveFileUrl } from '../../api/uploadApi';
import ImageLightbox from '../shared/ImageLightbox';
import Toast from '../shared/Toast';
import { useToast } from '../shared/useToast';

const pageShellClass = 'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';
const panelClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]';

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
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');
    const [status, setStatus] = useState('All');
    const [date, setDate] = useState('');
    const [sort, setSort] = useState('Newest');
    const { toast, showToast, hideToast } = useToast();

    const fetchNotifications = async () => {
        try {
            const data = await jockeyApi.getNotifications({
                status: status !== 'All' ? status : undefined,
                date: date || undefined,
                sort,
            });
            setNotifications(data.items ?? []);
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
    }, [status, date, sort]);

    const handleMarkAllRead = async () => {
        // Optimistic update — update UI immediately
        const prevNotifs = notifications;
        const prevSummary = summary;
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setSummary(prev => prev ? { ...prev, unread: 0 } : prev);
        try {
            await jockeyApi.markAllNotificationsAsRead();
            showToast('All notifications marked as read.', 'success', 'Updated');
        } catch (err) {
            // Revert if API fails
            setNotifications(prevNotifs);
            setSummary(prevSummary);
            showToast(err.message || 'Failed to update. Please try again.', 'error', 'Error');
        }
    };

    const handleClickNotif = async (notif) => {
        setSelectedNotif(notif);
        setDetailLoading(true);
        setDetailError('');

        try {
            const detail = await jockeyApi.getNotificationDetail(notif.notificationId);
            setSelectedNotif({ ...notif, ...detail });
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
                setSelectedNotif(prev => (
                    prev?.notificationId === notif.notificationId ? { ...prev, isRead: true } : prev
                ));
                setSummary(prev => prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : prev);
            } catch {
                // Ignore notification count refresh errors.
            }
        }
    };

    if (loading) return (
        <JockeyLayout activeKey="notifications">
            <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</p>
        </JockeyLayout>
    );

    return (
        <JockeyLayout activeKey="notifications">
            <section className={pageShellClass}>
                <div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)]">Notifications</h1>
                    <p className="mt-1.5 font-[650] text-[var(--admin-muted)]">
                        Monitor system updates, approvals, reports, and important activities.
                    </p>
                </div>

                {/* Summary */}
                <section className="grid grid-cols-3 gap-5 max-[1080px]:grid-cols-1">
                    <article className={panelClass}>
                        <div className="flex items-center gap-4 p-6">
                            <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#f9e4df] text-[var(--admin-primary)]">
                                <FaBell />
                            </div>
                            <div>
                                <div className="text-[var(--admin-muted)]">Total Alerts</div>
                                <strong>{summary?.totalAlerts ?? 0}</strong>
                            </div>
                        </div>
                    </article>

                    <article className={panelClass}>
                        <div className="flex items-center gap-4 p-6">
                            <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#f9e4df] text-[var(--admin-primary)]">
                                <FaEnvelope />
                            </div>
                            <div>
                                <div className="text-[var(--admin-muted)]">Unread</div>
                                <strong className="text-[var(--admin-primary)]">{summary?.unread ?? 0}</strong>
                            </div>
                        </div>
                    </article>

                    <article className={panelClass}>
                        <div className="flex items-center gap-4 p-6">
                            <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#f6dd81] text-[#7b5d00]">
                                <FaEnvelope />
                            </div>
                            <div>
                                <div className="text-[var(--admin-muted)]">Invitations</div>
                                <strong>{summary?.invitations ?? 0}</strong>
                            </div>
                        </div>
                    </article>
                </section>

                {/* Filter */}
                <section className={`${panelClass} flex items-center justify-between gap-4 p-4 max-[720px]:flex-col`}>
                    <div className="flex gap-3 max-[720px]:w-full max-[720px]:flex-col">
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="rounded-md border border-[var(--admin-border)] bg-[#fff8f6] px-4 py-2 outline-none"
                        >
                            <option value="All">Status: All</option>
                            <option value="Unread">Unread</option>
                            <option value="Read">Read</option>
                        </select>

                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="rounded-md border border-[var(--admin-border)] bg-[#fff8f6] px-4 py-2 outline-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleMarkAllRead}
                            className="rounded-md border border-[var(--admin-primary)] px-4 py-2 font-bold text-[var(--admin-primary)]"
                        >
                            <FaCheck className="mr-2 inline" />
                            Mark All Read
                        </button>

                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value)}
                            className="rounded-md bg-[var(--admin-primary)] px-4 py-2 font-bold text-white outline-none"
                        >
                            <option value="Newest">Newest</option>
                            <option value="Oldest">Oldest</option>
                        </select>
                    </div>
                </section>

                {/* Main */}
                <section className="grid grid-cols-[minmax(0,1fr)_320px] gap-5 max-[1080px]:grid-cols-1">
                    {/* Notifications List */}
                    <div className="grid gap-4 content-start">
                        {notifications.length === 0 ? (
                            <p style={{ color: '#999', textAlign: 'center', padding: '24px' }}>No notifications</p>
                        ) : (
                            notifications.map((item) => (
                                <article
                                    key={item.notificationId}
                                    onClick={() => handleClickNotif(item)}
                                    className={`${panelClass} cursor-pointer ${!item.isRead ? 'border-l-4 border-l-[var(--admin-primary)]' : ''} ${selectedNotif?.notificationId === item.notificationId ? 'bg-[#fff8f6]' : ''}`}
                                >
                                    <div className="flex gap-4 p-5">
                                        <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f9e4df] text-[var(--admin-primary)]">
                                            <FaEnvelope />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <strong>{item.title}</strong>
                                                {!item.isRead && (
                                                    <span className="rounded bg-[#f9e4df] px-2 py-0.5 text-[0.7rem] font-bold text-[var(--admin-primary)] whitespace-nowrap">
                                                        Unread
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-2 text-[0.9rem] text-[var(--admin-muted)]">{item.message}</p>
                                            <div className="mt-3 text-[0.85rem] text-[var(--admin-muted)]">{item.displayTime}</div>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>

                    {/* Detail Panel */}
                    <aside className={panelClass}>
                        {selectedNotif ? (
                            <div className="p-5">
                                <h3 className="mb-4 text-lg font-bold">Notification Detail</h3>
                                {detailLoading && (
                                    <div className="mb-4 rounded-md border border-[var(--admin-border)] bg-[#fff8f6] px-4 py-3 text-[0.82rem] font-bold text-[var(--admin-muted)]">
                                        Loading notification detail...
                                    </div>
                                )}
                                {detailError && (
                                    <div className="mb-4 rounded-md border border-[#e7a49a] bg-[#e8f7ef] px-4 py-3 text-[0.82rem] font-bold text-[var(--admin-primary)]">
                                        {detailError}
                                    </div>
                                )}
                                <div className="grid gap-4 text-[0.9rem]">
                                    <div>
                                        <div className="text-[var(--admin-muted)] text-[0.75rem] font-bold uppercase mb-1">Title</div>
                                        <strong>{selectedNotif.title}</strong>
                                    </div>
                                    <div>
                                        <div className="text-[var(--admin-muted)] text-[0.75rem] font-bold uppercase mb-1">Message</div>
                                        <p className="text-[var(--admin-ink)]">{selectedNotif.message}</p>
                                    </div>
                                    <div>
                                        <div className="text-[var(--admin-muted)] text-[0.75rem] font-bold uppercase mb-1">Time</div>
                                        <span>{selectedNotif.displayTime}</span>
                                    </div>
                                    <div>
                                        <div className="text-[var(--admin-muted)] text-[0.75rem] font-bold uppercase mb-1">Status</div>
                                        <span className={`rounded px-2 py-0.5 text-[0.75rem] font-bold ${selectedNotif.isRead ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#f9e4df] text-[var(--admin-primary)]'}`}>
                                            {selectedNotif.isRead ? 'Read' : 'Unread'}
                                        </span>
                                    </div>
                                    {selectedNotif.raceDetail && (
                                        <div className="rounded-md border border-[var(--admin-border)] bg-[#fff8f6] p-4">
                                            <div className="text-[var(--admin-muted)] text-[0.75rem] font-bold uppercase mb-2">Race Detail</div>
                                            <div className="grid gap-2">
                                                <strong>{selectedNotif.raceDetail.raceName}</strong>
                                                <span>{selectedNotif.raceDetail.horseName} - {selectedNotif.raceDetail.ownerName}</span>
                                                <span className="text-[var(--admin-muted)]">{selectedNotif.raceDetail.horseHealthStatus || '-'}</span>
                                                <div>
                                                    <div className="text-[var(--admin-muted)] text-[0.75rem] font-bold uppercase mb-1">Health Certificate</div>
                                                    <HealthCertificateLink url={selectedNotif.raceDetail.healthCertificateImageUrl} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full min-h-[200px] items-center justify-center p-5">
                                <p className="text-center text-[var(--admin-muted)]">Click a notification to view details</p>
                            </div>
                        )}
                    </aside>
                </section>
            </section>

            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
                duration={3500}
            />
        </JockeyLayout>
    );
}

export default JockeyNotifications;
