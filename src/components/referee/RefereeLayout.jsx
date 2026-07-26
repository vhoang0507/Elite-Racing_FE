import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaBell,
    FaChartLine,
    FaClipboardCheck,
    FaCog,
    FaFlagCheckered,
    FaGavel,
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
        section: 'Overview',
    },
    {
        key: 'assigned-races',
        label: 'Assigned Races',
        icon: FaFlagCheckered,
        path: '/referee/races',
        section: 'Officiating',
    },
    {
        key: 'pre-race',
        label: 'Pre-Race Inspection',
        icon: FaClipboardCheck,
        path: '/referee/races/pre-race',
        section: 'Officiating',
    },
    {
        key: 'post-race',
        label: 'Post-Race',
        icon: FaGavel,
        path: '/referee/races/post-race',
        section: 'Officiating',
    },
    {
        key: 'notifications',
        label: 'Notifications',
        icon: FaBell,
        path: '/referee/notifications',
        section: 'Account',
    },
    {
        key: 'settings',
        label: 'Settings',
        icon: FaCog,
        path: '/referee/settings',
        section: 'Account',
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
            bg: '#faf2e0',
            color: '#8a6209',
            label: 'Pending Review',
        };
    }

    if (nextStep === 'GoToDashboard' || status === 'Active') {
        return {
            bg: '#e8f7ee',
            color: '#16864f',
            label: 'Approved',
        };
    }

    if (nextStep === 'AccountBlocked' || status === 'Banned') {
        return {
            bg: '#f3e1df',
            color: '#a4392f',
            label: 'Blocked',
        };
    }

    if (nextStep === 'ContactSupport' || status === 'Inactive') {
        return {
            bg: '#f3e1df',
            color: '#a4392f',
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

        const refreshUnreadCount = () => {
            refereeApi.getUnreadCount()
                .then((data) => {
                    if (!ignore) setUnreadCount(data?.unreadCount ?? 0);
                })
                .catch(() => {
                    if (!ignore) setUnreadCount(0);
                });
        };

        refreshUnreadCount();
        const intervalId = window.setInterval(refreshUnreadCount, 15000);
        window.addEventListener('focus', refreshUnreadCount);

        return () => {
            ignore = true;
            window.clearInterval(intervalId);
            window.removeEventListener('focus', refreshUnreadCount);
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
                    <img
                        src="/elite-racing-league-logo.png"
                        alt="Elite Racing League"
                        className="h-16 w-auto object-contain"
                    />
                </div>

                <div className="role-profile-summary">
                    <div className="role-avatar">
                        {initials}
                    </div>

                    <div className="min-w-0">
                        <strong className="block truncate text-white">
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
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeKey === item.key;
                        const showSectionLabel = item.section && item.section !== menuItems[index - 1]?.section;

                        return (
                            <div key={item.key} className="contents">
                                {showSectionLabel && (
                                    <div className="role-nav-section-label">{item.section}</div>
                                )}
                                <Link
                                    to={item.path}
                                    className={[
                                        'role-nav-item',
                                        isActive ? 'is-active' : '',
                                    ].join(' ')}
                                >
                                    <Icon className="h-4 w-4 flex-none" />
                                    <span>{item.label}</span>
                                </Link>
                            </div>
                        );
                    })}
                </nav>

                <div className="flex-1 max-[980px]:hidden" />

                <div className="role-sidebar-actions">
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

                    <div className="flex items-center gap-3 max-[720px]:justify-end">
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

                        <div className="role-header-identity max-[520px]:hidden">
                            <span className="role-header-name">{fullName}</span>
                            <span className="role-header-role">Race Referee</span>
                        </div>

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
                                            <span className="mt-1 inline-flex rounded-full bg-[var(--admin-surface-strong)] px-2.5 py-1 text-[0.66rem] font-black text-[var(--admin-primary)]">
                                                RACE REFEREE
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-[0.84rem]">
                                        <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                            <span className="text-[0.66rem] font-black uppercase text-[#64748b]">
                                                Email
                                            </span>
                                            <strong className="break-words text-[var(--admin-ink)]">
                                                {email}
                                            </strong>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[#64748b]">
                                                    Referee ID
                                                </span>
                                                <strong>{userId ? `RF-${String(userId).padStart(5, '0')}` : 'N/A'}</strong>
                                            </div>
                                            <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[#64748b]">
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
                    <img
                        src="/elite-racing-league-logo.png"
                        alt="Elite Racing League"
                        className="h-14 w-auto object-contain"
                    />
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
