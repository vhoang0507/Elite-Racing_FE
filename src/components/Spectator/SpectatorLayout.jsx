import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaBell,
    FaChartLine,
    FaMedal,
    FaQuestionCircle,
    FaSearch,
    FaSignOutAlt,
    FaTrophy,
    FaBullseye,
    FaListOl,
} from 'react-icons/fa';

import { spectatorApi } from '../../api/spectatorApi';
import { clearAuthSession, getAuthUser } from '../../utils/tokenStorage';

const navigation = [
    { key: 'dashboard',    label: 'Dashboard',       icon: FaChartLine, path: '/spectator/dashboard' },
    { key: 'tournaments',  label: 'Tournaments',      icon: FaTrophy,    path: '/spectator/tournaments' },
    { key: 'leaderboard',  label: 'Leaderboard',      icon: FaListOl,    path: '/spectator/leaderboard' },
    { key: 'predictions',  label: 'Predictions',      icon: FaBullseye,  path: '/spectator/predictions' },
    { key: 'results',      label: 'Result & Reward',  icon: FaMedal,     path: '/spectator/results' },
    { key: 'notifications',label: 'Notifications',    icon: FaBell,      path: '/spectator/notifications' },
];

const shellClasses = [
    'role-shell',
].join(' ');

const iconButtonClasses = 'role-icon-button';

function SpectatorLayout({ activeKey, children }) {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const user = getAuthUser();
    const initials = user?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? 'SP';

    useEffect(() => {
        let ignore = false;
        spectatorApi.getSpectatorUnreadCount()
            .then((data) => { if (!ignore) setUnreadCount(data?.unreadCount ?? 0); })
            .catch(() => { if (!ignore) setUnreadCount(0); });
        return () => { ignore = true; };
    }, []);

    const handleLogout = () => {
        clearAuthSession();
        navigate('/login', { replace: true });
        window.location.replace('/login');
    };

    return (
        <div className={shellClasses}>
            {/* Sidebar */}
            <aside className="role-sidebar">
                <div className="role-brand">
                    <span className="role-brand-mark">ER</span>
                    <span>Elite Racing League</span>
                </div>

                <div className="role-profile-summary">
                    <div className="role-avatar">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <strong className="role-profile-name">{user?.fullName ?? 'Spectator'}</strong>
                        <span className="role-profile-role">
                            SPECTATOR
                        </span>
                    </div>
                </div>

                <nav className="role-nav">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.key === activeKey;
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
                    <button className="role-sidebar-action" type="button">
                        <FaQuestionCircle className="h-4 w-4" /> <span>Support</span>
                    </button>
                    <button className="role-sidebar-action" onClick={handleLogout} type="button">
                        <FaSignOutAlt className="h-4 w-4" /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="role-main">
                <header className="role-header">
                    <label className="role-search">
                        <FaSearch />
                        <input placeholder="Search records, horses, races..." type="search" />
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            className={iconButtonClasses}
                            type="button"
                            aria-label="Open notifications"
                            onClick={() => navigate('/spectator/notifications')}
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
                                className={`${iconButtonClasses} role-profile-button`}
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                type="button"
                            >
                                {initials}
                            </button>

                            {isProfileOpen && (
                                <section className="role-popover">
                                    <div className="flex items-center gap-3">
                                        <div className="role-avatar h-12 w-12 text-[0.9rem]">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <strong className="block truncate text-[var(--admin-ink)]">{user?.fullName ?? 'Spectator'}</strong>
                                            <span className="block truncate text-[0.72rem] text-[var(--admin-muted)]">{user?.email ?? 'No email loaded'}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="secondary-button min-h-9"
                                        onClick={() => setIsProfileOpen(false)}
                                        type="button"
                                    >
                                        Close
                                    </button>
                                </section>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1">{children}</div>

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

export default SpectatorLayout;
