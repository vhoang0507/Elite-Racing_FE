import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    FaBell,
    FaCalendarCheck,
    FaCheck,
    FaClock,
    FaExclamationTriangle,
    FaFlagCheckered,
    FaSearch,
    FaTh,
    FaTimes,
    FaTrophy,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import { confirmAdminAction } from '../../utils/adminFeedback';
import { getCompactPaginationItems } from '../../utils/pagination';
import Toast from '../shared/Toast';
import { useToast } from '../shared/useToast';

import AdminLayout from './AdminLayout';

const formatClass = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');

const pageShellClass = [
    '[--notifications-soft:#f8fbff]',
    '[--notifications-line:#dce5ef]',
    'grid min-h-[calc(100vh-64px)] content-start gap-[26px] px-[52px] py-11 max-[820px]:px-5 max-[820px]:py-8',
].join(' ');

const panelWidthClass = 'w-[min(100%,1110px)]';

const summaryIconClass = {
    total: 'bg-[#ffe5e2] text-[var(--admin-primary)]',
    action: 'bg-[#ffd15c] text-[#744f04]',
};

const notificationIconClass = {
    registration: 'bg-[#ffd66a] text-[#795602]',
    race: 'bg-[#e4e3ff] text-[#4d4cc3]',
    urgent: 'bg-[#ffd9d4] text-[#c51f1f]',
    prediction: 'bg-[#f2dcd7] text-[#965f56]',
};

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

const selectClass = 'h-full w-full min-w-0 cursor-pointer border-0 bg-transparent px-0 pr-6 text-[0.78rem] font-bold text-[#475569] outline-0';
const paginationButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-full border border-[var(--admin-border)] bg-white font-extrabold text-[var(--admin-primary-dark)] transition-colors hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary)] hover:text-white';
const pageSize = 4;

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

const highlightMessage = (message, highlight) => {
    if (!highlight || !message.includes(highlight)) {
        return message;
    }

    const [before, after] = message.split(highlight);

    return (
        <>
            {before}
            <strong>{highlight}</strong>
            {after}
        </>
    );
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

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all-types');
    const [priorityFilter, setPriorityFilter] = useState('all-priority');
    const [page, setPage] = useState(1);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        let isMounted = true;

        adminApi.getNotifications().then((payload) => {
            if (isMounted) {
                setNotifications(payload);
            }
        }).catch(() => {});

        return () => {
            isMounted = false;
        };
    }, []);

    const summaryCards = useMemo(() => [
        {
            marker: 'System Total',
            value: notifications.length.toLocaleString('en-US'),
            label: 'Total Notifications',
            tone: 'total',
            icon: FaBell,
        },
        {
            marker: 'Unread',
            value: String(notifications.filter((notification) => !notification.isRead).length),
            label: 'Unread Notifications',
            tone: 'action',
            icon: FaCalendarCheck,
        },
    ], [notifications]);

    const filteredNotifications = useMemo(() => notifications.filter((notification) => {
        return (
            matchesQuery(notification, query)
            && (typeFilter === 'all-types' || formatClass(notification.type) === typeFilter)
            && (priorityFilter === 'all-priority' || formatClass(notification.priority) === priorityFilter)
        );
    }), [notifications, priorityFilter, query, typeFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / pageSize));
    const visibleNotifications = filteredNotifications.slice((page - 1) * pageSize, page * pageSize);
    const firstShown = filteredNotifications.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastShown = Math.min(page * pageSize, filteredNotifications.length);

    const handleQueryChange = (value) => {
        setQuery(value);
        setPage(1);
    };

    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
        setPage(1);
    };

    const handleOpenNotification = async (notification) => {
        const openedNotification = { ...notification, isRead: true, status: 'Read' };
        setSelectedNotification(openedNotification);

        if (notification.isRead) {
            return;
        }

        const prev = notifications;
        setNotifications((current) => current.map((item) => (
            item.id === notification.id ? { ...item, isRead: true, status: 'Read' } : item
        )));

        try {
            await adminApi.markNotificationRead(notification.id);
        } catch (err) {
            setNotifications(prev);
            setSelectedNotification(notification);
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

        const prev = notifications;
        setNotifications((current) => current.map((n) => ({ ...n, isRead: true, status: 'Read' })));
        try {
            await adminApi.markAllNotificationsRead();
            showToast('All notifications marked as read.', 'success', 'Updated');
        } catch (err) {
            setNotifications(prev);
            showToast(err.message || 'Failed to update. Please try again.', 'error', 'Error');
        }
    };

    const handleKeyDown = (event, notification) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOpenNotification(notification);
        }
    };

    return (
        <AdminLayout
            activeKey="notifications"
            mainClassName="notifications-main"
            onSearchChange={handleQueryChange}
            searchPlaceholder="Search notifications..."
            searchValue={query}
        >
                <section className={pageShellClass}>
                    <div>
                        <h1 className="page-title">
                            Notifications
                        </h1>
                        <p className="page-subtitle max-w-[520px] leading-[1.45]">
                            Monitor system updates, approvals, reports, and important activities.
                        </p>
                    </div>

                    <section
                        aria-label="Notifications summary"
                        className={`${panelWidthClass} grid grid-cols-2 gap-[26px] max-[820px]:grid-cols-1`}
                    >
                        {summaryCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <article
                                    className="grid min-h-[148px] content-start gap-2.5 rounded-[var(--admin-radius)] border border-[var(--notifications-line)] bg-[var(--admin-surface)] px-6 pb-5 pt-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)]"
                                    key={card.label}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <span className={`grid h-[38px] w-[38px] place-items-center rounded-full ${summaryIconClass[card.tone]}`}>
                                            <Icon aria-hidden="true" className="h-4 w-4" />
                                        </span>
                                        <small className="text-[0.58rem] font-black uppercase text-[#475569]">
                                            {card.marker}
                                        </small>
                                    </div>
                                    <strong className="text-[2rem] leading-none text-[var(--admin-primary-dark)]">
                                        {card.value}
                                    </strong>
                                    <span className="text-[0.82rem] font-bold text-[#475569]">{card.label}</span>
                                </article>
                            );
                        })}
                    </section>

                    <section
                        aria-label="Notification filters"
                        className={`${panelWidthClass} grid min-h-[62px] grid-cols-[minmax(240px,1fr)_180px_180px_auto] items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--notifications-line)] bg-[var(--notifications-soft)] px-[18px] py-3 max-[1180px]:grid-cols-2 max-[820px]:grid-cols-1`}
                    >
                        <label className="flex h-[38px] items-center gap-2.5 rounded-full border border-[var(--notifications-line)] bg-[var(--admin-surface)] px-3 text-[#826661] transition-colors hover:border-[var(--admin-gold)]">
                            <FaSearch aria-hidden="true" />
                            <input
                                className="h-full w-full min-w-0 border-0 bg-transparent p-0 text-[0.78rem] text-[var(--admin-ink)] outline-0"
                                onChange={(event) => handleQueryChange(event.target.value)}
                                placeholder="Search notifications..."
                                type="search"
                                value={query}
                            />
                        </label>

                        <label className="flex h-[38px] items-center rounded-full border border-[var(--notifications-line)] bg-[var(--admin-surface)] px-3 text-[#826661] transition-colors hover:border-[var(--admin-gold)]">
                            <select className={selectClass} onChange={handleFilterChange(setTypeFilter)} value={typeFilter}>
                                <option value="all-types">All Types</option>
                                <option value="registration">Registration</option>
                                <option value="race-result">Race Result</option>
                                <option value="report">Report</option>
                                <option value="prediction">Prediction</option>
                            </select>
                        </label>

                        <label className="flex h-[38px] items-center rounded-full border border-[var(--notifications-line)] bg-[var(--admin-surface)] px-3 text-[#826661] transition-colors hover:border-[var(--admin-gold)]">
                            <select className={selectClass} onChange={handleFilterChange(setPriorityFilter)} value={priorityFilter}>
                                <option value="all-priority">All Priority</option>
                                <option value="critical">Critical</option>
                                <option value="high-priority">High Priority</option>
                                <option value="medium-priority">Medium Priority</option>
                                <option value="low-priority">Low Priority</option>
                            </select>
                        </label>

                        <button
                            onClick={handleMarkAllRead}
                            type="button"
                            className="flex h-[38px] items-center gap-2 rounded-full border border-[var(--admin-primary)] px-4 text-[0.78rem] font-bold text-[var(--admin-primary)] transition-colors hover:bg-[var(--admin-primary)] hover:text-white"
                        >
                            <FaCheck aria-hidden="true" />
                            Mark All Read
                        </button>
                    </section>

                    <section aria-label="Notification list" className={`${panelWidthClass} grid gap-[18px]`}>
                        {visibleNotifications.length === 0 && (
                            <div className="grid justify-items-center gap-3 rounded-[var(--admin-radius)] border border-[var(--notifications-line)] bg-[var(--admin-surface)] px-6 py-14 text-center shadow-[0_14px_28px_rgba(15,23,42,0.04)]">
                                <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                                    <FaBell aria-hidden="true" className="h-5 w-5" />
                                </span>
                                <span className="font-bold text-[var(--admin-muted)]">No notifications for this filter.</span>
                            </div>
                        )}
                        {visibleNotifications.map((notification) => {
                            const Icon = iconByTone[notification.tone] || FaBell;

                            return (
                                <article
                                    className={[
                                        'relative grid min-h-[146px] cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-[18px] rounded-[var(--admin-radius)] border border-[var(--notifications-line)] bg-[var(--admin-surface)] px-[22px] py-[22px] shadow-[0_14px_28px_rgba(15,23,42,0.04)] max-[820px]:grid-cols-1',
                                        notification.tone === 'urgent' && !notification.isRead ? 'before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:rounded-full before:bg-[#e42121] before:content-[""]' : '',
                                        notification.isRead ? 'opacity-75' : '',
                                    ].join(' ')}
                                    key={notification.id}
                                    onClick={() => handleOpenNotification(notification)}
                                    onKeyDown={(event) => handleKeyDown(event, notification)}
                                    role="button"
                                    tabIndex="0"
                                >
                                    <span className={`grid h-[42px] w-[42px] place-items-center rounded-full ${notificationIconClass[notification.tone]}`}>
                                        <Icon aria-hidden="true" className="h-4 w-4" />
                                    </span>

                                    <div className="min-w-0">
                                        <div className="flex items-start justify-between gap-[18px] max-[820px]:flex-col">
                                            <h2 className="m-0 text-base leading-[1.2] text-[var(--admin-ink)]">
                                                {notification.title}
                                            </h2>
                                            <time className="inline-flex items-center gap-[5px] whitespace-nowrap text-[0.76rem] font-bold text-[#6f5a56]">
                                                <FaClock aria-hidden="true" className="h-[11px] w-[11px]" />
                                                <span>{notification.time}</span>
                                            </time>
                                        </div>

                                        <p className="mt-1.5 max-w-[680px] text-[0.82rem] font-semibold leading-[1.45] text-[#475569] [&_strong]:text-[var(--admin-primary)]">
                                            {highlightMessage(notification.message, notification.highlight)}
                                        </p>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {[notification.type, notification.priority].map((tag) => (
                                                <span
                                                    className={`inline-flex min-h-5 items-center rounded-full px-2 text-[0.58rem] font-black uppercase ${tagClass[formatClass(tag)] || tagClass.prediction}`}
                                                    key={tag}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <div className={`${panelWidthClass} flex min-h-[68px] items-center justify-between gap-[18px] px-[22px] py-4 text-[0.82rem] font-bold text-[var(--admin-muted)] max-[820px]:flex-col max-[820px]:items-stretch`}>
                        <span>Showing {firstShown} - {lastShown} of {filteredNotifications.length} entries</span>

                        <div className="flex items-center gap-2 max-[820px]:flex-wrap">
                            <button aria-label="Previous page" className={paginationButtonClass} disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">&lt;</button>
                            {getCompactPaginationItems(totalPages, page).map((pageItem) => (
                                typeof pageItem === 'number' ? (
                                    <button
                                        className={`${paginationButtonClass} ${pageItem === page ? 'border-[var(--admin-primary)] bg-[#e8f7ef] text-[#064e3b] hover:bg-[#d1fae5]' : ''}`}
                                        key={pageItem}
                                        onClick={() => setPage(pageItem)}
                                        type="button"
                                    >
                                        {pageItem}
                                    </button>
                                ) : (
                                    <span className={`${paginationButtonClass} cursor-default text-[var(--admin-muted)] hover:bg-[#fffdfc]`} key={pageItem}>...</span>
                                )
                            ))}
                            <button aria-label="Next page" className={paginationButtonClass} disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">&gt;</button>
                        </div>
                    </div>

                    {selectedNotification && (
                        <div className="fixed inset-0 z-40 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8" onClick={() => setSelectedNotification(null)} role="presentation">
                            <section
                                aria-label={`Notification detail for ${selectedNotification.title}`}
                                className="grid max-h-[calc(100vh-48px)] w-[min(760px,100%)] gap-5 overflow-y-auto rounded-[var(--admin-radius)] border border-[var(--notifications-line)] bg-[var(--admin-surface)] p-6 shadow-[0_20px_48px_rgba(45,32,32,0.22)]"
                                onClick={(event) => event.stopPropagation()}
                                role="dialog"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-start gap-4">
                                        {(() => {
                                            const Icon = iconByTone[selectedNotification.tone] || FaBell;

                                            return (
                                                <span className={`grid h-[46px] w-[46px] flex-none place-items-center rounded-full ${notificationIconClass[selectedNotification.tone] || notificationIconClass.registration}`}>
                                                    <Icon aria-hidden="true" className="h-4 w-4" />
                                                </span>
                                            );
                                        })()}
                                        <div className="min-w-0">
                                            <h2 className="m-0 text-[1.3rem] leading-[1.2] text-[var(--admin-primary-dark)]">
                                                {selectedNotification.title}
                                            </h2>
                                            <time className="mt-2 inline-flex items-center gap-[6px] text-[0.78rem] font-bold text-[#6f5a56]">
                                                <FaClock aria-hidden="true" className="h-[11px] w-[11px]" />
                                                <span>{detailValue(selectedNotification.time)}</span>
                                            </time>
                                        </div>
                                    </div>
                                    <button aria-label="Close notification detail" className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[var(--notifications-line)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={() => setSelectedNotification(null)} type="button">
                                        <FaTimes aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="rounded-md border border-[var(--notifications-line)] bg-[var(--notifications-soft)] px-4 py-4 text-[0.92rem] font-semibold leading-relaxed text-[#334155]">
                                    {selectedNotification.message}
                                </div>

                                <div className="grid grid-cols-2 gap-3 max-[680px]:grid-cols-1">
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.66rem] font-black uppercase text-[#64748b]">Notification ID</span>
                                        <strong className="break-words text-[0.88rem] text-[var(--admin-ink)]">{detailValue(selectedNotification.id)}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.66rem] font-black uppercase text-[#64748b]">Created At</span>
                                        <strong className="break-words text-[0.88rem] text-[var(--admin-ink)]">{formatDateTime(selectedNotification.createdAt)}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.66rem] font-black uppercase text-[#64748b]">Type</span>
                                        <strong className="break-words text-[0.88rem] text-[var(--admin-ink)]">{detailValue(selectedNotification.type)}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.66rem] font-black uppercase text-[#64748b]">Priority</span>
                                        <strong className="break-words text-[0.88rem] text-[var(--admin-ink)]">{detailValue(selectedNotification.priority)}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.66rem] font-black uppercase text-[#64748b]">Related Type</span>
                                        <strong className="break-words text-[0.88rem] text-[var(--admin-ink)]">{detailValue(selectedNotification.relatedType)}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.66rem] font-black uppercase text-[#64748b]">Related ID</span>
                                        <strong className="break-words text-[0.88rem] text-[var(--admin-ink)]">{detailValue(selectedNotification.relatedId)}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.66rem] font-black uppercase text-[#64748b]">Action Type</span>
                                        <strong className="break-words text-[0.88rem] text-[var(--admin-ink)]">{detailValue(selectedNotification.actionType)}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.66rem] font-black uppercase text-[#64748b]">Action Link</span>
                                        <strong className="break-words text-[0.88rem] text-[var(--admin-ink)]">{detailValue(selectedNotification.actionUrl)}</strong>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </section>
            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
                duration={3500}
            />
        </AdminLayout>
    );
}

export default Notifications;
