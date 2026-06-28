import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaBell,
    FaChartLine,
    FaClipboardList,
    FaCog,
    FaHorseHead,
    FaPlusCircle,
    FaQuestionCircle,
    FaSearch,
    FaSignOutAlt,
    FaTrophy,
    FaUserFriends,
} from 'react-icons/fa';

import { clearAuthSession, getAuthUser } from '../../utils/tokenStorage';

const navigation = [
    { key: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/owner/dashboard' },
    { key: 'my-horse', label: 'My Horse', icon: FaHorseHead, path: '/owner/my-horse' },
    { key: 'register-horse', label: 'Register Horse', icon: FaPlusCircle, path: '/owner/register-horse' },
    { key: 'registrations', label: 'My Registrations', icon: FaClipboardList, path: '/owner/registrations' },
    { key: 'jockey', label: 'Jockey Assignment', icon: FaUserFriends, path: '/owner/jockey' },
    { key: 'rewards', label: 'Result & Reward', icon: FaTrophy, path: '/owner/rewards' },
    { key: 'notifications', label: 'Notifications', icon: FaBell, path: '/owner/notifications' },
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
                    <span className="role-brand-mark">ER</span>
                    <span>Elite Racing League</span>
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
                    <div className="flex items-center gap-3">
                        <button className={iconButtonClasses} type="button">
                            <FaBell />
                            <span className="absolute right-2.5 top-[9px] h-2 w-2 rounded-full border-2 border-[var(--admin-surface)] bg-[var(--admin-primary)]" />
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

export default HorseOwnerLayout;
