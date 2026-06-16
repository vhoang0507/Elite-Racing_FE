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
    '[--admin-bg:#fbf7f5]',
    '[--admin-surface:#fffefd]',
    '[--admin-surface-strong:#fff3ef]',
    '[--admin-border:#edcfc9]',
    '[--admin-primary:#860707]',
    '[--admin-primary-dark:#650404]',
    '[--admin-ink:#2d2020]',
    '[--admin-muted:#705f5b]',
    '[--admin-gold:#a77815]',
    '[--admin-green:#24715d]',
    '[--admin-blue:#286a8f]',
    '[--admin-coral:#bd4f3d]',
    '[--admin-radius:8px]',
    "grid h-screen min-h-screen grid-cols-[260px_minmax(0,1fr)] overflow-auto bg-[var(--admin-bg)] text-left font-['Segoe_UI',Arial,sans-serif] text-[var(--admin-ink)]",
    'max-[980px]:grid-cols-1',
].join(' ');

const iconButtonClasses = [
    'relative inline-flex h-[38px] w-[38px] cursor-pointer items-center justify-center gap-[9px] rounded-md border-0 bg-transparent text-[#5b403c] transition-colors duration-200',
    'hover:bg-[#f8e5e1]',
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
            <aside className="sticky top-0 flex min-h-screen flex-col gap-6 border-r border-[var(--admin-border)] bg-[#fff0ed] px-[18px] pb-5 pt-7 max-[980px]:static max-[980px]:min-h-0 max-[980px]:gap-4">
                <div className="flex items-center gap-2.5 text-[1.1rem] font-black text-[var(--admin-primary)]">
                    <span>Elite Racing League</span>
                </div>

                <div className="flex items-center gap-3 px-1.5 py-2">
                    <div className="grid h-[42px] w-[42px] flex-none place-items-center overflow-hidden rounded-full bg-[linear-gradient(145deg,#650404,#c04733)] text-[0.8rem] font-extrabold text-white">
                        {initials}
                    </div>
                    <div>
                        <strong className="block text-[var(--admin-ink)]">{profile?.fullName ?? '...'}</strong>
                        <span className="mt-0.5 block text-[0.72rem] font-extrabold text-[var(--admin-primary)]">
                            JOCKEY
                        </span>
                        {badge && (
                            <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                                {badge.label}
                            </span>
                        )}
                    </div>
                </div>

                <nav className="grid gap-2 max-[980px]:grid-cols-2 max-[720px]:grid-cols-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.key === activeKey;
                        const isDisabled = isSettingsOnly && item.key !== 'settings';

                        if (isDisabled) {
                            return (
                                <span
                                    key={item.key}
                                    className="inline-flex min-h-[38px] w-full cursor-not-allowed items-center justify-start gap-[9px] rounded-md px-3 font-bold text-[#ccc]"
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
                                    'inline-flex min-h-[38px] w-full cursor-pointer items-center justify-start gap-[9px] rounded-md px-3 font-bold text-[#5c4642] no-underline transition-colors duration-200',
                                    'hover:bg-[#f8dfda] hover:text-[var(--admin-primary)]',
                                    isActive ? 'bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary)] hover:text-white' : '',
                                ].join(' ')}
                            >
                                <Icon className="h-4 w-4 flex-none" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex-1 max-[980px]:hidden" />

                <div className="grid gap-2 border-t border-[var(--admin-border)] pt-4">
                    <button className="inline-flex min-h-[38px] cursor-pointer items-center justify-start gap-[9px] rounded-md border-0 bg-transparent px-0 font-bold text-[#5c4642] hover:bg-[#f8dfda] hover:text-[var(--admin-primary)]" type="button">
                        <FaQuestionCircle className="h-4 w-4" />
                        <span>Support</span>
                    </button>
                    <button className="inline-flex min-h-[38px] cursor-pointer items-center justify-start gap-[9px] rounded-md border-0 bg-transparent px-0 font-bold text-[#5c4642] hover:bg-[#f8dfda] hover:text-[var(--admin-primary)]" onClick={handleLogout} type="button">
                        <FaSignOutAlt className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className={`min-w-0 flex flex-col min-h-screen ${mainClassName}`}>
                <header className="sticky top-0 z-[4] flex h-16 items-center justify-between gap-5 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-11 max-[980px]:h-auto max-[980px]:px-5 max-[980px]:py-3 max-[720px]:flex-col">
                    <label className="flex h-10 w-[min(420px,100%)] items-center gap-2.5 rounded-full border border-[var(--admin-border)] bg-[#fffaf8] px-4 text-[var(--admin-muted)]">
                        <FaSearch />
                        <input
                            className="h-full w-full min-w-0 border-0 bg-transparent p-0 text-[var(--admin-ink)] outline-0"
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
                                className={`${iconButtonClasses} overflow-hidden rounded-full bg-[linear-gradient(145deg,#650404,#c04733)] text-[0.72rem] font-black text-white`}
                                onClick={() => setIsProfileOpen(c => !c)}
                                type="button"
                            >
                                {initials}
                            </button>

                            {isProfileOpen && (
                                <section className="absolute right-0 top-12 z-30 grid w-[min(340px,calc(100vw-40px))] gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-[0_18px_42px_rgba(45,32,32,0.18)]">
                                    <div className="flex items-center gap-3">
                                        <div className="grid h-14 w-14 flex-none place-items-center rounded-full bg-[linear-gradient(145deg,#650404,#c04733)] text-[0.95rem] font-black text-white">
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
                                        className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 font-black text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]"
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
                <footer className="flex items-center justify-between border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-11 py-5 text-[0.82rem] text-[var(--admin-muted)] max-[720px]:flex-col max-[720px]:gap-3 max-[720px]:px-5">
                    <strong className="text-[var(--admin-primary)]">Elite Racing League</strong>
                    <div className="flex flex-wrap gap-4">
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