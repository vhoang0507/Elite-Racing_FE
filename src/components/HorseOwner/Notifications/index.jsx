import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBell,
    FaCalendarAlt,
    FaCheck,
    FaCheckCircle,
    FaEnvelopeOpenText,
    FaInfoCircle,
    FaUserTie,
} from "react-icons/fa";

import { ownerApi } from "../../../api/ownerApi";
import HorseOwnerLayout from "../HorseOwnerLayout";
import Toast from "../../shared/Toast";
import { useToast } from "../../shared/useToast";

const tabs = ["All", "Registrations", "Jockeys", "Tournaments"];
const emptySummary = {
    unread: 0,
    invitations: 0,
    upcomingRaces: 0,
};

const statusColorMap = {
    approved: { bg: "#e8f7ee", color: "#16864f" },
    confirmed: { bg: "#edf2fa", color: "#16305c" },
    returned: { bg: "#f3e1df", color: "#a4392f" },
    rejected: { bg: "#f3e1df", color: "#a4392f" },
    pending: { bg: "#faf2e0", color: "#8a6209" },
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

export default function Notifications() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("All");
    const [summary, setSummary] = useState(emptySummary);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);
    const [markingAll, setMarkingAll] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const { toast, showToast, hideToast } = useToast();

    const selectedNotification = useMemo(
        () => notifications.find((item) => item.notificationId === selectedId) ?? notifications[0] ?? null,
        [notifications, selectedId]
    );

    useEffect(() => {
        let isMounted = true;

        const loadNotifications = async () => {
            setIsLoading(true);

            try {
                const [summaryData, listData] = await Promise.all([
                    ownerApi.getNotificationSummary(),
                    ownerApi.getNotifications({ category: activeTab, pageSize: 50 }),
                ]);

                if (!isMounted) {
                    return;
                }

                const items = Array.isArray(listData?.items) ? listData.items : [];
                setSummary(normalizeSummary(summaryData));
                setNotifications(items);
                setSelectedId((current) => (
                    current && items.some((item) => item.notificationId === current)
                        ? current
                        : items[0]?.notificationId ?? null
                ));
            } catch (err) {
                if (!isMounted) {
                    return;
                }

                setSummary(emptySummary);
                setNotifications([]);
                showToast(err.message || "Failed to load notifications.", 'error');
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

    const handleSelect = async (notification) => {
        setSelectedId(notification.notificationId);

        if (notification.isRead) return;

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
            showToast(err.message || "Failed to update notification.", 'error');
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
                        Stay updated with tournaments, race schedules, and jockey responses.
                    </p>
                </div>

                <div className="mb-8 flex flex-wrap gap-5">
                    <div className="flex w-56 justify-between rounded-[8px] border border-[var(--admin-border)] bg-white p-5">
                        <div>
                            <p className="text-sm uppercase text-[var(--admin-muted)]">Unread</p>
                            <h3 className="mt-2 text-2xl font-bold text-[#a4392f]">{summary.unread}</h3>
                        </div>
                        <FaBell className="text-[#a4392f]" size={22} />
                    </div>

                    <div className="flex w-56 justify-between rounded-[8px] border border-[var(--admin-border)] bg-white p-5">
                        <div>
                            <p className="text-sm uppercase text-[var(--admin-muted)]">Invitations</p>
                            <h3 className="mt-2 text-2xl font-bold">{summary.invitations}</h3>
                        </div>
                        <FaUserTie className="text-[var(--admin-primary)]" size={22} />
                    </div>

                    <div className="flex w-56 justify-between rounded-[8px] border border-[var(--admin-border)] bg-white p-5">
                        <div>
                            <p className="text-sm uppercase text-[var(--admin-muted)]">Upcoming Races</p>
                            <h3 className="mt-2 text-2xl font-bold">{summary.upcomingRaces}</h3>
                        </div>
                        <FaCalendarAlt className="text-[var(--admin-primary)]" size={22} />
                    </div>

                    <div className="flex items-center gap-3 rounded-[8px] border border-[var(--admin-border)] bg-white p-4">
                        <select
                            value={activeTab}
                            onChange={(event) => setActiveTab(event.target.value)}
                            className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-2 font-semibold outline-none focus:border-[var(--admin-primary)]"
                        >
                            {tabs.map((tab) => (
                                <option key={tab} value={tab}>{tab}</option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            disabled={markingAll || summary.unread === 0}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-primary)] px-4 py-2 font-bold text-[var(--admin-primary)] transition-colors hover:bg-[var(--admin-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <FaCheck aria-hidden="true" />
                            {markingAll ? 'Updating...' : 'Mark All Read'}
                        </button>
                    </div>
                </div>

                <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
                    <div className="space-y-2">
                        {isLoading ? (
                            <div className="rounded-[8px] border border-[var(--admin-border)] bg-white p-5 text-[var(--admin-muted)]">
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="rounded-[8px] border border-[var(--admin-border)] bg-white p-5 text-[var(--admin-muted)]">
                                No notifications for this filter.
                            </div>
                        ) : (
                            notifications.map((item) => {
                                const tag = item.statusLabel || item.category;
                                const statusStyle = getStatusStyle(item.statusLabel);

                                return (
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

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            {tag && (
                                                <span className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                                    {tag}
                                                </span>
                                            )}
                                            {!item.isRead && (
                                                <span className="inline-block rounded-full bg-[#f3e1df] px-2.5 py-1 text-xs font-semibold text-[#a4392f]">
                                                    NEW
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="overflow-hidden rounded-[8px] border border-[var(--admin-border)] bg-white">
                            {selectedNotification ? (
                                <>
                                    <div className="flex items-center justify-between border-b p-4">
                                        <div className="flex items-center gap-2 rounded-full bg-[var(--admin-primary)] px-4 py-1 text-sm text-white">
                                            <FaEnvelopeOpenText />
                                            {selectedNotification.category || 'Owner Alert'}
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
        </HorseOwnerLayout>
    );
}
