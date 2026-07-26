import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaBell,
    FaChartLine,
    FaClipboardList,
    FaCog,
    FaHorseHead,
    FaPlusCircle,
    FaSignOutAlt,
    FaTrophy,
    FaUserFriends,
} from 'react-icons/fa';

import { clearAuthSession, getAuthUser } from '../../utils/tokenStorage';

const navigation = [
    { key: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/owner/dashboard', section: 'Overview' },
    { key: 'my-horse', label: 'My Horse', icon: FaHorseHead, path: '/owner/my-horse', section: 'Stable' },
    { key: 'register-horse', label: 'Register Horse', icon: FaPlusCircle, path: '/owner/register-horse', section: 'Stable' },
    { key: 'registrations', label: 'My Registrations', icon: FaClipboardList, path: '/owner/registrations', section: 'Racing' },
    { key: 'jockey', label: 'Jockey Assignment', icon: FaUserFriends, path: '/owner/jockey', section: 'Racing' },
    { key: 'rewards', label: 'Result & Reward', icon: FaTrophy, path: '/owner/rewards', section: 'Racing' },
    { key: 'notifications', label: 'Notifications', icon: FaBell, path: '/owner/notifications', section: 'Account' },
    { key: 'settings', label: 'Settings', icon: FaCog, path: '/owner/settings', section: 'Account' },
];

const shellClasses = [
    'role-shell',
].join(' ');

const iconButtonClasses = 'role-icon-button';

function HorseOwnerLayout({ activeKey, children }) {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const user = getAuthUser();
    const initials = user?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? 'HO';

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
                        <strong className="role-profile-name">{user?.fullName ?? 'Horse Owner'}</strong>
                        <span className="role-profile-role">
                            HORSE OWNER
                        </span>
                    </div>
                </div>

                <nav className="role-nav">
                    {navigation.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = item.key === activeKey;
                        const showSectionLabel = item.section && item.section !== navigation[index - 1]?.section;
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
                    <button className="role-sidebar-action" onClick={handleLogout} type="button">
                        <FaSignOutAlt className="h-4 w-4" /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="role-main">
                <header className="role-header">
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        <button
                            aria-label="Notifications"
                            className={iconButtonClasses}
                            onClick={() => navigate('/owner/notifications')}
                            type="button"
                        >
                            <FaBell />
                        </button>
                        <div className="role-header-identity max-[520px]:hidden">
                            <span className="role-header-name">{user?.fullName ?? 'Horse Owner'}</span>
                            <span className="role-header-role">Horse Owner</span>
                        </div>
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
                                            <strong className="block truncate text-[var(--admin-ink)]">{user?.fullName ?? 'Horse Owner'}</strong>
                                            <span className="mt-1 block truncate text-[0.76rem] text-[var(--admin-muted)]">{user?.email ?? 'No email loaded'}</span>
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
                    <img
                        src="/elite-racing-league-logo.png"
                        alt="Elite Racing League"
                        className="h-14 w-auto object-contain"
                    />
                    <div className="role-footer-links">
                        <span className="text-[var(--admin-muted)]">Terms of Service</span>
                        <span className="text-[var(--admin-muted)]">Privacy Policy</span>
                        <span className="text-[var(--admin-muted)]">Contact Support</span>
                        <span className="text-[var(--admin-muted)]">Racing Rules</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}

export default HorseOwnerLayout;
