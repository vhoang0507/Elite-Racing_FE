import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaBell,
    FaChartLine,
    FaClipboardCheck,
    FaCog,
    FaFlagCheckered,
    FaGavel,
    FaQuestionCircle,
    FaSearch,
    FaSignOutAlt,
} from 'react-icons/fa';

import { refereeApi } from '../../api/refereeApi';
import { clearAuthSession, getAuthUser } from '../../utils/tokenStorage';

const menuItems = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: FaChartLine,
        path: '/referee/dashboard',
    },
    {
        key: 'assigned-races',
        label: 'Assigned Races',
        icon: FaFlagCheckered,
        path: '/referee/races',
    },
    {
        key: 'pre-race',
        label: 'Pre-Race Inspection',
        icon: FaClipboardCheck,
        path: '/referee/races/pre-race',
    },
    {
        key: 'post-race',
        label: 'Post-Race',
        icon: FaGavel,
        path: '/referee/races/post-race',
    },
    {
        key: 'notifications',
        label: 'Notifications',
        icon: FaBell,
        path: '/referee/notifications',
    },
    {
        key: 'settings',
        label: 'Settings',
        icon: FaCog,
        path: '/referee/settings',
    },
];

const shellClasses = [
    'role-shell',
].join(' ');

const iconButtonClasses = [
    'role-icon-button',
].join(' ');

function readField(source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) {
    return source?.[camelKey] ?? source?.[pascalKey];
}

function getInitials(name) {
    return name
        ?.split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'RF';
}

function getStatusBadge(profile) {
    const nextStep = readField(profile, 'nextStep');
    const status = readField(profile, 'status');

    if (nextStep === 'WaitForActivation' || status === 'Pending') {
        return {
            bg: '#fff3cd',
            color: '#856404',
            label: 'Pending Review',
        };
    }

    if (nextStep === 'GoToDashboard' || status === 'Active') {
        return {
            bg: '#d4edda',
            color: '#155724',
            label: 'Approved',
        };
    }

    if (nextStep === 'AccountBlocked' || status === 'Banned') {
        return {
            bg: '#f8d7da',
            color: '#721c24',
            label: 'Blocked',
        };
    }

    if (nextStep === 'ContactSupport' || status === 'Inactive') {
        return {
            bg: '#f8d7da',
            color: '#721c24',
            label: 'Inactive',
        };
    }

    return null;
}

function RefereeLayout({
    children,
    activeKey,
    mainClassName = '',
    searchPlaceholder = 'Search...',
    searchValue,
    onSearchChange,
}) {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(() => getAuthUser());
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let ignore = false;

        async function loadProfile() {
            try {
                const data = await refereeApi.getRefereeProfile();
                if (ignore) return;

                setProfile(data);

                const nextStep = readField(data, 'nextStep');

                if (nextStep === 'VerifyEmail') {
                    navigate('/verify-email', { replace: true });
                } else if (nextStep === 'AccountBlocked' || nextStep === 'ContactSupport') {
                    clearAuthSession();
                    navigate('/login', { replace: true });
                    window.location.replace('/login');
                }
            } catch (err) {
                if (!ignore && err.status === 401) {
                    clearAuthSession();
                    navigate('/login', { replace: true });
                }
            }
        }

        loadProfile();

        return () => {
            ignore = true;
        };
    }, [navigate]);

    useEffect(() => {
        let ignore = false;

        refereeApi.getUnreadCount()
            .then((data) => {
                if (!ignore) setUnreadCount(data?.unreadCount ?? 0);
            })
            .catch(() => {
                if (!ignore) setUnreadCount(0);
            });

        return () => {
            ignore = true;
        };
    }, []);

    const fullName = readField(profile, 'fullName') || 'Race Referee';
    const email = readField(profile, 'email') || 'No email loaded';
    const status = readField(profile, 'status') || 'N/A';
    const userId = readField(profile, 'userId') || readField(profile, 'id');

    const initials = useMemo(() => getInitials(fullName), [fullName]);
    const badge = getStatusBadge(profile);

    const handleLogout = () => {
        clearAuthSession();
        navigate('/login', { replace: true });
        window.location.replace('/login');
    };

    return (
        <div className={shellClasses}>
            <aside className="role-sidebar">
                <div className="role-brand">
                    <span className="role-brand-mark">
                        ER
                    </span>
                    <span>Elite Racing League</span>
                </div>

                <div className="role-profile-summary">
                    <div className="role-avatar">
                        {initials}
                    </div>

                    <div className="min-w-0">
                        <strong className="block truncate text-[var(--admin-ink)]">
                            {fullName}
                        </strong>
                        <span className="role-profile-role">
                            RACE REFEREE
                        </span>
                        {badge && (
                            <span
                                className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[0.64rem] font-black"
                                style={{ backgroundColor: badge.bg, color: badge.color }}
                            >
                                {badge.label}
                            </span>
                        )}
                    </div>
                </div>

                <nav className="role-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeKey === item.key;

                        return (
                            <Link
                                key={item.key}
                                to={item.path}
                                className={[
                                    'role-nav-item',
                                    isActive ? 'is-active' : '',
                                ].join(' ')}
                            >
                                <Icon className="h-4 w-4 flex-none" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex-1 max-[980px]:hidden" />

                <div className="role-sidebar-actions">
                    <button
                        type="button"
                        className="role-sidebar-action"
                    >
                        <FaQuestionCircle className="h-4 w-4" />
                        <span>Support</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="role-sidebar-action"
                    >
                        <FaSignOutAlt className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className={`role-main ${mainClassName}`}>
                <header className="role-header">
                    <label className="role-search">
                        <FaSearch />
                        <input
                            onChange={(event) => onSearchChange?.(event.target.value)}
                            placeholder={searchPlaceholder}
                            type="search"
                            {...(searchValue !== undefined ? { value: searchValue } : {})}
                        />
                    </label>

                    <div className="flex items-center gap-2 max-[720px]:justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/referee/notifications')}
                            className={iconButtonClasses}
                            aria-label="Open notifications"
                        >
                            <FaBell />
                            {unreadCount > 0 && (
                                <span className="absolute right-1.5 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--admin-primary)] px-1 text-[10px] font-black text-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsProfileOpen((current) => !current)}
                                className={`${iconButtonClasses} role-profile-button`}
                                aria-expanded={isProfileOpen}
                                aria-label="Open account profile"
                            >
                                {initials}
                            </button>

                            {isProfileOpen && (
                                <section className="role-popover">
                                    <div className="flex items-center gap-3">
                                        <div className="role-avatar h-14 w-14 text-[0.95rem]">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <strong className="block truncate text-[1.05rem] text-[var(--admin-ink)]">
                                                {fullName}
                                            </strong>
                                            <span className="mt-1 inline-flex rounded-full bg-[#ffe8e4] px-2.5 py-1 text-[0.66rem] font-black text-[var(--admin-primary)]">
                                                RACE REFEREE
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-[0.84rem]">
                                        <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                            <span className="text-[0.66rem] font-black uppercase text-[#765c58]">
                                                Email
                                            </span>
                                            <strong className="break-words text-[var(--admin-ink)]">
                                                {email}
                                            </strong>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[#765c58]">
                                                    Referee ID
                                                </span>
                                                <strong>{userId ? `RF-${String(userId).padStart(5, '0')}` : 'N/A'}</strong>
                                            </div>
                                            <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[#765c58]">
                                                    Status
                                                </span>
                                                <strong style={{ color: badge?.color ?? '#0aa15f' }}>
                                                    {badge?.label ?? status}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate('/referee/settings');
                                            }}
                                            className="secondary-button min-h-9"
                                        >
                                            Settings
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="secondary-button min-h-9"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1">
                    {children}
                </div>

                <footer className="role-footer">
                    <strong className="text-[var(--admin-primary)]">Elite Racing League</strong>
                    <div className="role-footer-links">
                        <a href="#" className="text-[var(--admin-muted)] no-underline hover:text-[var(--admin-primary)]">Terms of Service</a>
                        <a href="#" className="text-[var(--admin-muted)] no-underline hover:text-[var(--admin-primary)]">Privacy Policy</a>
                        <a href="#" className="text-[var(--admin-muted)] no-underline hover:text-[var(--admin-primary)]">Contact Support</a>
                        <a href="#" className="text-[var(--admin-muted)] no-underline hover:text-[var(--admin-primary)]">Racing Rules</a>
                    </div>
                </footer>
            </main>
        </div>
    );
}

export default RefereeLayout;
