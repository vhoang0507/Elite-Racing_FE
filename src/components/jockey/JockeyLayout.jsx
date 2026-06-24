import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaBell,
    FaCalendarAlt,
    FaChartLine,
    FaCog,
    FaEnvelope,
    FaHorseHead,
    FaQuestionCircle,
    FaSearch,
    FaSignOutAlt,
} from 'react-icons/fa';

import { clearAuthSession } from '../../utils/tokenStorage';
import { jockeyApi } from '../../api/jockeyApi';

const navigation = [
    { key: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/jockey/dashboard' },
    { key: 'invitations', label: 'Pending Invitations', icon: FaEnvelope, path: '/jockey/invitations' },
    { key: 'accepted', label: 'Accepted Races', icon: FaHorseHead, path: '/jockey/accepted' },
    { key: 'schedule', label: 'Calendar', icon: FaCalendarAlt, path: '/jockey/schedule' },
    { key: 'notifications', label: 'Notifications', icon: FaBell, path: '/jockey/notifications' },
    { key: 'settings', label: 'Settings', icon: FaCog, path: '/jockey/settings' },
];

const shellClasses = [
    'role-shell',
].join(' ');

const iconButtonClasses = [
    'role-icon-button',
].join(' ');

// Pages chỉ Settings mới vào được khi chưa active
const SETTINGS_ONLY_STEPS = ['CompleteJockeyProfile', 'WaitForActivation'];

function JockeyLayout({
    activeKey,
    children,
    mainClassName = '',
    onSearchChange,
    searchValue,
    searchPlaceholder = 'Search records, horses, races...',
}) {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        jockeyApi.getJockeyProfile()
            .then(data => {
                setProfile(data);
                // Route guard
                const nextStep = data.nextStep;
                if (nextStep === 'VerifyEmail') {
                    navigate('/verify-email');
                } else if (nextStep === 'AccountBlocked' || nextStep === 'ContactSupport') {
                    clearAuthSession();
                    navigate('/login');
                } else if (SETTINGS_ONLY_STEPS.includes(nextStep) && activeKey !== 'settings') {
                    navigate('/jockey/settings');
                }
            })
            .catch(() => { });
    }, []);

    const handleLogout = () => {
        clearAuthSession();
        navigate('/login', { replace: true });
        window.location.replace('/login');
    };

    const initials = profile?.fullName
        ?.split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() ?? 'JK';

    // Disable nav khi chưa active
    const isSettingsOnly = SETTINGS_ONLY_STEPS.includes(profile?.nextStep);

    const statusBadge = () => {
        if (!profile) return null;
        const { nextStep } = profile;
        if (nextStep === 'WaitForActivation') return { label: 'Pending Review', color: '#856404', bg: '#fff3cd' };
        if (nextStep === 'GoToDashboard') return { label: 'Approved', color: '#155724', bg: '#d4edda' };
        if (nextStep === 'AccountBlocked') return { label: 'Rejected', color: '#721c24', bg: '#f8d7da' };
        return null;
    };

    const badge = statusBadge();

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
                        <strong className="role-profile-name">{profile?.fullName ?? '...'}</strong>
                        <span className="role-profile-role">
                            JOCKEY
                        </span>
                        {badge && (
                            <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                                {badge.label}
                            </span>
                        )}
                    </div>
                </div>

                <nav className="role-nav">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.key === activeKey;
                        const isDisabled = isSettingsOnly && item.key !== 'settings';

                        if (isDisabled) {
                            return (
                                <span
                                    key={item.key}
                                    className="role-nav-item is-disabled"
                                >
                                    <Icon className="h-4 w-4 flex-none" />
                                    <span>{item.label}</span>
                                </span>
                            );
                        }

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
                        <FaQuestionCircle className="h-4 w-4" />
                        <span>Support</span>
                    </button>
                    <button className="role-sidebar-action" onClick={handleLogout} type="button">
                        <FaSignOutAlt className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className={`role-main ${mainClassName}`}>
                <header className="role-header">
                    <label className="role-search">
                        <FaSearch />
                        <input
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            placeholder={searchPlaceholder}
                            type="search"
                            {...(searchValue !== undefined ? { value: searchValue } : {})}
                        />
                    </label>

                    <div className="flex items-center gap-2">
                        <button className={iconButtonClasses} type="button">
                            <FaBell />
                            <span className="absolute right-2.5 top-[9px] h-2 w-2 rounded-full border-2 border-[var(--admin-surface)] bg-[var(--admin-primary)]" />
                        </button>
                        <div className="relative">
                            <button
                                className={`${iconButtonClasses} role-profile-button`}
                                onClick={() => setIsProfileOpen(c => !c)}
                                type="button"
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
                                            <strong className="block truncate text-[1.05rem] text-[var(--admin-ink)]">{profile?.fullName}</strong>
                                            <span className="mt-1 inline-flex rounded-full bg-[#ffe8e4] px-2.5 py-1 text-[0.66rem] font-black text-[var(--admin-primary)]">
                                                JOCKEY
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-[0.84rem]">
                                        <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                            <span className="text-[0.66rem] font-black uppercase text-[#765c58]">Email</span>
                                            <strong className="break-words text-[var(--admin-ink)]">{profile?.email}</strong>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[#765c58]">Jockey Code</span>
                                                <strong>{profile?.jockeyCode}</strong>
                                            </div>
                                            <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[#765c58]">Status</span>
                                                <strong style={{ color: badge?.color ?? '#0aa15f' }}>{badge?.label ?? profile?.status}</strong>
                                            </div>
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

export default JockeyLayout;
