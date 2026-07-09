import { useState, useEffect } from 'react';
import {
    Link,
    useNavigate,
} from 'react-router-dom';

import {
    FaBell,
    FaChartBar,
    FaChartLine,
    FaClipboardCheck,
    FaFlagCheckered,
    FaPlus,
    FaQuestionCircle,
    FaSearch,
    FaSignOutAlt,
    FaTools,
    FaTrophy,
    FaUsers,
} from 'react-icons/fa';

import { clearAuthSession, getAuthUser } from '../../utils/tokenStorage';
import { adminApi } from '../../api/adminApi';
import {
    ADMIN_CONFIRM_EVENT,
    ADMIN_SUCCESS_EVENT,
    ADMIN_SUCCESS_STORAGE_KEY,
} from '../../utils/adminFeedback';
import Toast, { useToast } from '../shared/Toast';

const navigation = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: FaChartLine,
        path: '/admin/dashboard',
    },
    {
        key: 'users',
        label: 'User Management',
        icon: FaUsers,
        path: '/admin/users',
    },
    {
        key: 'races',
        label: 'Tournament Management',
        icon: FaFlagCheckered,
        path: '/admin/races',
    },
    {
        key: 'registrations',
        label: 'Race Entry Approval',
        icon: FaClipboardCheck,
        path: '/admin/registrations',
    },
    {
        key: 'seasons',
        label: 'Season Management',
        icon: FaTrophy,
        path: '/admin/seasons',
    },
    {
        key: 'predictions',
        label: 'Prediction Management',
        icon: FaChartBar,
        path: '/admin/predictions',
    },
    {
        key: 'results',
        label: 'Validate Results',
        icon: FaClipboardCheck,
        path: '/admin/results',
    },
    {
        key: 'notifications',
        label: 'Notifications',
        icon: FaBell,
        path: '/admin/notifications',
    },
    {
        key: 'system-time',
        label: 'System Time',
        icon: FaTools,
        path: '/admin/system-time',
    },
];

const shellClasses = [
    'role-shell',
].join(' ');

const iconButtonClasses = [
    'role-icon-button',
].join(' ');

const confirmToneClass = {
    primary: 'bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-dark)]',
    danger: 'bg-[#b91c1c] hover:bg-[#991b1b]',
};

function readUserField(user, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) {
    return user?.[camelKey] ?? user?.[pascalKey];
}

function getInitials(name) {
    return name
        ?.split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'AD';
}

function AdminLayout({
    activeKey,
    children,
    mainClassName = '',
    onSearchChange,
    searchValue,
    searchPlaceholder = 'Search records, horses, races...',
}) {
    const navigate = useNavigate();
    const authUser = getAuthUser();
    const accountName = readUserField(authUser, 'fullName') || 'Admin';
    const accountRole = readUserField(authUser, 'role') || 'Admin';
    const accountInitials = getInitials(accountName);
    const [unreadCount, setUnreadCount] = useState(0);
    const [confirmRequest, setConfirmRequest] = useState(null);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        adminApi.getAdminUnreadCount()
            .then((count) => setUnreadCount(count))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const queuedSuccess = window.sessionStorage.getItem(ADMIN_SUCCESS_STORAGE_KEY);

        if (!queuedSuccess) {
            return;
        }

        window.sessionStorage.removeItem(ADMIN_SUCCESS_STORAGE_KEY);

        try {
            const payload = JSON.parse(queuedSuccess);
            showToast(payload.message, payload.type || 'success', payload.title || 'Success');
        } catch {
            showToast(queuedSuccess, 'success', 'Success');
        }
    }, [showToast]);

    useEffect(() => {
        const handleConfirm = (event) => {
            const detail = event.detail || {};
            detail.handled = true;
            setConfirmRequest({
                title: detail.title || 'Confirm action',
                message: detail.message || 'Are you sure you want to continue?',
                confirmLabel: detail.confirmLabel || 'Confirm',
                cancelLabel: detail.cancelLabel || 'Cancel',
                tone: detail.tone || 'primary',
                resolve: detail.resolve,
            });
        };

        const handleSuccess = (event) => {
            const detail = event.detail || {};
            detail.handled = true;
            showToast(detail.message || 'Action completed successfully.', detail.type || 'success', detail.title || 'Success');
        };

        window.addEventListener(ADMIN_CONFIRM_EVENT, handleConfirm);
        window.addEventListener(ADMIN_SUCCESS_EVENT, handleSuccess);

        return () => {
            window.removeEventListener(ADMIN_CONFIRM_EVENT, handleConfirm);
            window.removeEventListener(ADMIN_SUCCESS_EVENT, handleSuccess);
        };
    }, [showToast]);

    const resolveConfirmRequest = (value) => {
        confirmRequest?.resolve?.(value);
        setConfirmRequest(null);
    };

    const handleLogout = () => {
        clearAuthSession();
        navigate('/login', { replace: true });
        window.location.replace('/login');
    };

    return (
        <div className={shellClasses}>
            <aside
                aria-label="Admin navigation"
                className="role-sidebar admin-sidebar"
            >
                <div className="role-brand">
                    <span className="role-brand-mark">
                        ER
                    </span>
                    <span>Elite Racing League</span>
                </div>

                <div className="role-profile-summary">
                    <div className="role-avatar">
                        {accountInitials}
                    </div>
                    <div className="min-w-0">
                        <strong className="role-profile-name">{accountName}</strong>
                        <span className="role-profile-role">
                            {accountRole.toUpperCase()}
                        </span>
                    </div>
                </div>

                <nav className="role-nav flex-1 max-[980px]:flex-none">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.key === activeKey;

                        return (
                            <Link
                                className={[
                                    'role-nav-item',
                                    isActive ? 'is-active' : '',
                                ].join(' ')}
                                key={item.key}
                                to={item.path}
                            >
                                <Icon aria-hidden="true" className="h-4 w-4 flex-none" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden" />

                <Link
                    className="primary-button w-full gap-[9px]"
                    to="/admin/tournaments/create"
                >
                    <FaPlus aria-hidden="true" />
                    <span>New tournament</span>
                </Link>

                <div className="role-sidebar-actions">
                    <button
                        className="role-sidebar-action"
                        type="button"
                    >
                        <FaQuestionCircle aria-hidden="true" className="h-4 w-4" />
                        <span>Support</span>
                    </button>
                    <button
                        className="role-sidebar-action"
                        onClick={handleLogout}
                        type="button"
                    >
                        <FaSignOutAlt aria-hidden="true" className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className={`role-main ${mainClassName}`}>
                <header className="role-header">
                    <label
                        aria-label="Search admin records"
                        className="role-search"
                    >
                        <FaSearch aria-hidden="true" />
                        <input
                            onChange={(event) => onSearchChange?.(event.target.value)}
                            placeholder={searchPlaceholder}
                            type="search"
                            {...(searchValue !== undefined ? { value: searchValue } : {})}
                        />
                    </label>

                    <div className="flex items-center gap-3 max-[720px]:justify-end">
                        <button aria-label="Notifications" className={`${iconButtonClasses} relative`} onClick={() => navigate('/admin/notifications')} type="button">
                            <FaBell aria-hidden="true" />
                            {unreadCount > 0 && (
                                <span className="absolute right-2.5 top-[9px] h-2 w-2 rounded-full border-2 border-[var(--admin-surface)] bg-[var(--admin-primary)]" />
                            )}
                        </button>
                        <div className="role-header-identity max-[520px]:hidden">
                            <span className="role-header-name">{accountName}</span>
                            <span className="role-header-role">{accountRole}</span>
                        </div>
                        <div className="relative">
                            <button
                                aria-label="Open admin profile"
                                className={`${iconButtonClasses} role-profile-button`}
                                onClick={() => navigate('/admin/profile')}
                                type="button"
                            >
                                {accountInitials}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1">
                    {children}
                </div>

                <footer className="role-footer">
                    <strong className="text-[var(--admin-primary)]">Elite Racing League</strong>
                    <div className="role-footer-links">
                        <span className="text-[var(--admin-muted)]">Terms of Service</span>
                        <span className="text-[var(--admin-muted)]">Privacy Policy</span>
                        <span className="text-[var(--admin-muted)]">Contact Support</span>
                        <span className="text-[var(--admin-muted)]">Racing Rules</span>
                    </div>
                </footer>
            </main>

            {confirmRequest && (
                <div
                    aria-modal="true"
                    className="fixed inset-0 z-[10000] grid place-items-center bg-[rgba(15,23,42,0.42)] px-5 py-8"
                    onClick={() => resolveConfirmRequest(false)}
                    role="dialog"
                >
                    <section
                        className="grid w-[min(440px,100%)] gap-5 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="grid gap-2">
                            <h2 className="m-0 text-[1.15rem] font-black text-[var(--admin-primary-dark)]">
                                {confirmRequest.title}
                            </h2>
                            <p className="m-0 text-[0.92rem] font-semibold leading-6 text-[var(--admin-muted)]">
                                {confirmRequest.message}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 max-[520px]:flex-col">
                            <button
                                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-4 font-black text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]"
                                onClick={() => resolveConfirmRequest(false)}
                                type="button"
                            >
                                {confirmRequest.cancelLabel}
                            </button>
                            <button
                                className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md px-4 font-black text-white ${confirmToneClass[confirmRequest.tone] || confirmToneClass.primary}`}
                                onClick={() => resolveConfirmRequest(true)}
                                type="button"
                            >
                                {confirmRequest.confirmLabel}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
                duration={3500}
            />
        </div>
    );
}

export default AdminLayout;
