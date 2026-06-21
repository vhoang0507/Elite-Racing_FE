import { useEffect, useMemo, useState } from "react";
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

const tabs = ["All", "Registrations", "Jockeys", "Tournaments"];
const emptySummary = {
    unread: 0,
    invitations: 0,
    upcomingRaces: 0,
};

const statusColorMap = {
    approved: { bg: "#dff7e9", color: "#118548" },
    confirmed: { bg: "#e3f2fd", color: "#1565c0" },
    returned: { bg: "#f5e1df", color: "#860707" },
    rejected: { bg: "#f5e1df", color: "#860707" },
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
        color: "#765c58",
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
    const [activeTab, setActiveTab] = useState("All");
    const [summary, setSummary] = useState(emptySummary);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

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
        if (notification.isRead) {
            return;
        }

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
                                <span className="grid h-10 w-10 place-items-center rounded-md bg-[#fff1ef] text-[var(--admin-primary)]">
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
                            className={`cursor-pointer rounded-md border-0 px-4 py-2 text-[0.82rem] font-bold transition-colors ${activeTab === tab ? "bg-[var(--admin-primary)] text-white" : "bg-transparent text-[var(--admin-muted)] hover:bg-[#f8dfda]"}`}
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            type="button"
                        >
                            {tab}
                        </button>
                    ))}
                    <button
                        className="ml-auto cursor-pointer rounded-md border-0 bg-transparent px-3 py-2 text-[0.82rem] font-bold text-[var(--admin-primary)] hover:bg-[#f8dfda] max-[720px]:ml-0"
                        onClick={() => setReloadKey((current) => current + 1)}
                        type="button"
                    >
                        Refresh
                    </button>
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
                                <span className="grid h-10 w-10 flex-none place-items-center rounded-md bg-[#fff1ef] text-[var(--admin-primary)]">
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
        </HorseOwnerLayout>
    );
}
