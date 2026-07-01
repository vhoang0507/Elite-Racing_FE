import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBell,
    FaCalendarAlt,
    FaCheckCircle,
    FaClock,
    FaInbox,
    FaUserTie,
} from "react-icons/fa";

import { ownerApi } from "../../../api/ownerApi";
import HorseOwnerLayout from "../HorseOwnerLayout";
import Toast, { useToast } from "../../shared/Toast";

const tabs = ["All", "Registrations", "Jockeys", "Tournaments"];
const emptySummary = {
    unread: 0,
    invitations: 0,
    upcomingRaces: 0,
};

const statusColorMap = {
    approved: { bg: "#dff7e9", color: "#118548" },
    confirmed: { bg: "#e3f2fd", color: "#1565c0" },
    returned: { bg: "#f5e1df", color: "#0b7f5a" },
    rejected: { bg: "#f5e1df", color: "#0b7f5a" },
    pending: { bg: "#fff3cd", color: "#856404" },
};

const iconByCategory = {
    Registrations: FaCheckCircle,
    Jockeys: FaUserTie,
    Tournaments: FaCalendarAlt,
};

function getStatusStyle(statusLabel) {
    return statusColorMap[String(statusLabel || "").toLowerCase()] || {
        bg: "#f3e8e6",
        color: "#64748b",
    };
}

function normalizeSummary(summary) {
    return {
        unread: Number(summary?.unread ?? 0),
        invitations: Number(summary?.invitations ?? 0),
        upcomingRaces: Number(summary?.upcomingRaces ?? 0),
    };
}

function NotificationDetailModal({ notification, onClose, onNavigate }) {
    const Icon = iconByCategory[notification.category] || FaBell;
    const statusStyle = getStatusStyle(notification.statusLabel);
    const tag = notification.statusLabel || notification.category;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 200,
                backgroundColor: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: '#fff', borderRadius: '14px',
                    boxShadow: '0 24px 70px rgba(0,0,0,0.28)',
                    width: '100%', maxWidth: '480px', overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px', borderBottom: '1px solid #eee' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: '10px', backgroundColor: '#e8f7ef', color: '#0b7f5a', flexShrink: 0 }}>
                        <Icon />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{notification.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <FaClock style={{ color: '#64748b', fontSize: '11px' }} />
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{notification.displayTime}</span>
                            {tag && (
                                <span style={{ borderRadius: '999px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                    {tag}
                                </span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ border: '1px solid #dce5ef', borderRadius: 8, background: '#fff8f6', color: '#0b7f5a', fontSize: 16, fontWeight: 800, cursor: 'pointer', width: 32, height: 32 }}>✕</button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{notification.message}</p>
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    {notification.actionUrl && (
                        <button
                            onClick={() => onNavigate(notification.actionUrl)}
                            style={{ backgroundColor: '#0b7f5a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
                        >
                            View Details →
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #dce5ef', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Notifications() {
    const [activeTab, setActiveTab] = useState("All");
    const [summary, setSummary] = useState(emptySummary);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [markingAll, setMarkingAll] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const { toast, showToast, hideToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const loadNotifications = async () => {
            setIsLoading(true);
            setError("");

            try {
                const [summaryData, listData] = await Promise.all([
                    ownerApi.getNotificationSummary(),
                    ownerApi.getNotifications({ category: activeTab, pageSize: 50 }),
                ]);

                if (!isMounted) {
                    return;
                }

                setSummary(normalizeSummary(summaryData));
                setNotifications(Array.isArray(listData?.items) ? listData.items : []);
            } catch (err) {
                if (!isMounted) {
                    return;
                }

                setSummary(emptySummary);
                setNotifications([]);
                setError(err.message || "Failed to load notifications.");
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadNotifications();

        return () => {
            isMounted = false;
        };
    }, [activeTab, reloadKey]);

    const statCards = useMemo(() => [
        {
            label: "UNREAD",
            value: summary.unread,
            icon: FaInbox,
        },
        {
            label: "INVITATIONS",
            value: summary.invitations,
            icon: FaUserTie,
        },
        {
            label: "UPCOMING RACES",
            value: summary.upcomingRaces,
            icon: FaCalendarAlt,
        },
    ], [summary]);

    const handleNotificationClick = async (notification) => {
        // Mark as read if unread
        if (!notification.isRead) {
            try {
                await ownerApi.markNotificationAsRead(notification.notificationId);
                setNotifications((current) => current.map((item) => (
                    item.notificationId === notification.notificationId
                        ? { ...item, isRead: true }
                        : item
                )));
                setSummary((current) => ({
                    ...current,
                    unread: Math.max(0, current.unread - 1),
                }));
            } catch (err) {
                setError(err.message || "Failed to update notification.");
            }
        }

        // Show detail modal
        setSelectedNotification(notification);
    };

    const handleMarkAllRead = async () => {
        if (markingAll) return;
        setMarkingAll(true);
        try {
            await ownerApi.markAllNotificationsAsRead();
            setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
            setSummary((current) => ({ ...current, unread: 0 }));
            showToast('All notifications marked as read.', 'success', 'Updated');
        } catch (err) {
            showToast(err.message || 'Failed to update. Please try again.', 'error', 'Error');
        } finally {
            setMarkingAll(false);
        }
    };

    return (
        <HorseOwnerLayout activeKey="notifications">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <div>
                    <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary-dark)]">Notifications</h2>
                    <p className="m-0 mt-1 text-[0.85rem] text-[var(--admin-muted)]">
                        Stay updated with tournaments, race schedules, jockey responses
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <div className="flex items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5" key={stat.label}>
                                <span className="grid h-10 w-10 place-items-center rounded-md bg-[#e8f7ef] text-[var(--admin-primary)]">
                                    <Icon aria-hidden="true" />
                                </span>
                                <div>
                                    <small className="text-[0.7rem] font-bold uppercase text-[var(--admin-muted)]">{stat.label}</small>
                                    <h3 className="m-0 text-[1.5rem] text-[var(--admin-ink)]">{stat.value}</h3>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center gap-1 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1 max-[720px]:flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            className={`cursor-pointer rounded-md border-0 px-4 py-2 text-[0.82rem] font-bold transition-colors ${activeTab === tab ? "bg-[var(--admin-primary)] text-white" : "bg-transparent text-[var(--admin-muted)] hover:bg-[#e8f7ef]"}`}
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            type="button"
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="ml-auto flex items-center gap-2 max-[720px]:ml-0">
                        <button
                            className="cursor-pointer rounded-md border border-[var(--admin-primary)] bg-transparent px-3 py-2 text-[0.82rem] font-bold text-[var(--admin-primary)] hover:bg-[#e8f7ef] disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={handleMarkAllRead}
                            disabled={markingAll || summary.unread === 0}
                            type="button"
                        >
                            {markingAll ? 'Updating...' : 'Mark all read'}
                        </button>
                        <button
                            className="cursor-pointer rounded-md border-0 bg-transparent px-3 py-2 text-[0.82rem] font-bold text-[var(--admin-primary)] hover:bg-[#e8f7ef]"
                            onClick={() => setReloadKey((current) => current + 1)}
                            type="button"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-[var(--admin-radius)] border border-[#f0b4b4] bg-[#fff3f3] px-4 py-3 text-[0.85rem] font-semibold text-[var(--admin-primary)]">
                        {error}
                    </div>
                )}

                <div className="grid gap-3">
                    {isLoading ? (
                        <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 text-center text-[0.9rem] font-semibold text-[var(--admin-muted)]">
                            Loading notifications...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 text-center text-[0.9rem] font-semibold text-[var(--admin-muted)]">
                            No notifications
                        </div>
                    ) : notifications.map((notification) => {
                        const Icon = iconByCategory[notification.category] || FaBell;
                        const tag = notification.statusLabel || notification.category;
                        const statusStyle = getStatusStyle(notification.statusLabel);

                        return (
                            <button
                                className={`flex cursor-pointer items-start gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 text-left transition-colors hover:bg-[#fff8f6] ${notification.isRead ? "opacity-80" : ""}`}
                                key={notification.notificationId}
                                onClick={() => handleNotificationClick(notification)}
                                type="button"
                            >
                                <span className="grid h-10 w-10 flex-none place-items-center rounded-md bg-[#e8f7ef] text-[var(--admin-primary)]">
                                    <Icon aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="m-0 text-[0.9rem] font-bold text-[var(--admin-ink)]">{notification.title}</p>
                                        {!notification.isRead && <span className="h-2 w-2 flex-none rounded-full bg-[var(--admin-primary)]" />}
                                    </div>
                                    <p className="m-0 mt-1 break-words text-[0.82rem] text-[var(--admin-muted)]">{notification.message}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1 text-[0.72rem] text-[var(--admin-muted)]">
                                            <FaClock aria-hidden="true" />
                                            {notification.displayTime}
                                        </span>
                                        {tag && (
                                            <span className="rounded-full px-2 py-0.5 text-[0.68rem] font-bold" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                                {tag}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {selectedNotification && (
                <NotificationDetailModal
                    notification={selectedNotification}
                    onClose={() => setSelectedNotification(null)}
                    onNavigate={(url) => { setSelectedNotification(null); navigate(url); }}
                />
            )}

            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
                duration={3500}
            />
        </HorseOwnerLayout>
    );
}
