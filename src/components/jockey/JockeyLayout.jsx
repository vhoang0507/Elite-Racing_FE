import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaBell,
    FaCalendarAlt,
    FaChartLine,
    FaCog,
    FaEnvelope,
    FaHorseHead,
    FaLock,
    FaSearch,
    FaSignOutAlt,
    FaTrophy,
} from 'react-icons/fa';

import { clearAuthSession } from '../../utils/tokenStorage';
import { jockeyApi } from '../../api/jockeyApi';

const navigation = [
    { key: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/jockey/dashboard', section: 'Overview' },
    { key: 'invitations', label: 'Pending Invitations', icon: FaEnvelope, path: '/jockey/invitations', section: 'Racing' },
    { key: 'accepted', label: 'Accepted Races', icon: FaHorseHead, path: '/jockey/accepted', section: 'Racing' },
    { key: 'schedule', label: 'Calendar', icon: FaCalendarAlt, path: '/jockey/schedule', section: 'Racing' },
    { key: 'rewards', label: 'Result & Reward', icon: FaTrophy, path: '/jockey/rewards', section: 'Racing' },
    { key: 'notifications', label: 'Notifications', icon: FaBell, path: '/jockey/notifications', section: 'Account' },
    { key: 'settings', label: 'Settings', icon: FaCog, path: '/jockey/settings', section: 'Account' },
];

const shellClasses = [
    'role-shell',
].join(' ');

const iconButtonClasses = [
    'role-icon-button',
].join(' ');

// Only Settings is accessible before the jockey profile is activated
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
    const [lockedAlert, setLockedAlert] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        jockeyApi.getNotificationSummary()
            .then(data => setUnreadCount(data?.unread ?? 0))
            .catch(() => {});

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

    // Disable nav until profile is activated
    const isSettingsOnly = SETTINGS_ONLY_STEPS.includes(profile?.nextStep);

    const statusBadge = () => {
        if (!profile) return null;
        const { nextStep } = profile;
        if (nextStep === 'WaitForActivation') return { label: 'Pending Review', color: '#8a6209', bg: '#faf2e0' };
        if (nextStep === 'GoToDashboard') return { label: 'Approved', color: '#16864f', bg: '#e8f7ee' };
        if (nextStep === 'AccountBlocked') return { label: 'Rejected', color: '#a4392f', bg: '#f3e1df' };
        return null;
    };

    const badge = statusBadge();

    return (
        <div className={shellClasses}>
            {/* Sidebar */}
            <aside className="role-sidebar">
                <div className="role-brand">
                    <img
                        src="/admin-sidebar-logo.png"
                        alt="Elite Racing League"
                        className="h-10 w-10 flex-none object-contain"
                    />
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
                            <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '10px', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' }}>
                                {badge.label}
                            </span>
                        )}
                    </div>
                </div>

                <nav className="role-nav">
                    {navigation.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = item.key === activeKey;
                        const isDisabled = isSettingsOnly && item.key !== 'settings';
                        const showSectionLabel = item.section && item.section !== navigation[index - 1]?.section;

                        if (isDisabled) {
                            return (
                                <div key={item.key} className="contents">
                                    {showSectionLabel && (
                                        <div className="role-nav-section-label">{item.section}</div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setLockedAlert(true)}
                                        className="role-nav-item is-disabled"
                                        style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}
                                    >
                                        <Icon className="h-4 w-4 flex-none" />
                                        <span>{item.label}</span>
                                        <FaLock style={{ marginLeft: 'auto', fontSize: '10px' }} />
                                    </button>
                                </div>
                            );
                        }

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

                    <div className="flex items-center gap-3">
                        <button
                            className={iconButtonClasses}
                            type="button"
                            onClick={() => navigate('/jockey/notifications')}
                        >
                            <FaBell />
                            {unreadCount > 0 && (
                                <span className="absolute right-2.5 top-[9px] h-2 w-2 rounded-full border-2 border-[var(--admin-surface)] bg-[var(--admin-primary)]" />
                            )}
                        </button>
                        <div className="role-header-identity max-[520px]:hidden">
                            <span className="role-header-name">{profile?.fullName ?? 'Jockey'}</span>
                            <span className="role-header-role">Jockey</span>
                        </div>
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
                                            <span className="mt-1 inline-flex rounded-full bg-[#e8f7ef] px-2.5 py-1 text-[0.66rem] font-black text-[var(--admin-primary)]">
                                                JOCKEY
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-[0.84rem]">
                                        <div className="grid gap-1 rounded-[var(--admin-radius)] bg-[var(--admin-surface-strong)] p-3">
                                            <span className="text-[0.66rem] font-black uppercase text-[var(--admin-muted)]">Email</span>
                                            <strong className="break-words text-[var(--admin-ink)]">{profile?.email}</strong>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="grid gap-1 rounded-[var(--admin-radius)] bg-[var(--admin-surface-strong)] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[var(--admin-muted)]">Jockey Code</span>
                                                <strong>{profile?.jockeyCode}</strong>
                                            </div>
                                            <div className="grid gap-1 rounded-[var(--admin-radius)] bg-[var(--admin-surface-strong)] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[var(--admin-muted)]">Status</span>
                                                <strong style={{ color: badge?.color ?? '#16864f' }}>{badge?.label ?? profile?.status}</strong>
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

                {/* Locked page alert */}
                {lockedAlert && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 100,
                        backgroundColor: 'rgba(45,32,32,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                    }}>
                        <div style={{
                            backgroundColor: '#fff', borderRadius: '14px', padding: '36px 32px',
                            maxWidth: '420px', width: '100%', textAlign: 'center',
                            boxShadow: '0 24px 60px rgba(10,25,48,0.3)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                                <span style={{ display: 'grid', placeItems: 'center', width: 64, height: 64, borderRadius: '999px', backgroundColor: 'var(--admin-surface-strong)', color: 'var(--admin-primary)', fontSize: '1.8rem' }}>
                                    <FaLock />
                                </span>
                            </div>
                            <h3 style={{ margin: '0 0 10px', fontSize: '1.3rem', color: '#0a1930' }}>
                                Access Restricted
                            </h3>
                            <p style={{ margin: '0 0 8px', fontSize: '0.95rem', color: '#555', lineHeight: 1.6 }}>
                                {profile?.nextStep === 'WaitForActivation'
                                    ? 'Your profile is currently under admin review. Please wait for approval before accessing this page.'
                                    : 'You need to complete your jockey profile before accessing this page.'}
                            </p>
                            <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: '#999' }}>
                                {profile?.nextStep === 'WaitForActivation'
                                    ? 'You will be notified once your account has been activated.'
                                    : 'Go to Settings to fill in your details and submit your profile for admin review.'}
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setLockedAlert(false)}
                                    style={{
                                        padding: '10px 22px', borderRadius: '999px',
                                        border: '1px solid var(--admin-border)', backgroundColor: '#fff',
                                        color: '#555', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                                    }}
                                >
                                    Close
                                </button>
                                {profile?.nextStep !== 'WaitForActivation' && (
                                    <button
                                        onClick={() => { setLockedAlert(false); navigate('/jockey/settings'); }}
                                        style={{
                                            padding: '10px 22px', borderRadius: '999px',
                                            border: 'none', backgroundColor: 'var(--admin-primary)',
                                            color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                                        }}
                                    >
                                        Go to Settings
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <footer className="role-footer">
                    <img
                        src="/admin-sidebar-logo.png"
                        alt="Elite Racing League"
                        className="h-16 w-auto object-contain"
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

export default JockeyLayout;
