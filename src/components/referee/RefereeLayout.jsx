import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaBell,
    FaChartLine,
    FaCog,
    FaFlagCheckered,
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
            <aside className="sticky top-0 flex min-h-screen flex-col gap-6 border-r border-[var(--admin-border)] bg-[#fff0ed] px-[18px] pb-5 pt-7 max-[980px]:static max-[980px]:min-h-0 max-[980px]:gap-4">
                <div className="flex items-center gap-2.5 text-[1.1rem] font-black text-[var(--admin-primary)]">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--admin-primary)] text-[0.78rem] font-black text-white">
                        ER
                    </span>
                    <span>Elite Racing League</span>
                </div>

                <div className="flex items-center gap-3 px-1.5 py-2">
                    <div className="grid h-[42px] w-[42px] flex-none place-items-center overflow-hidden rounded-full bg-[linear-gradient(145deg,#650404,#c04733)] text-[0.8rem] font-extrabold text-white">
                        {initials}
                    </div>

                    <div className="min-w-0">
                        <strong className="block truncate text-[var(--admin-ink)]">
                            {fullName}
                        </strong>
                        <span className="mt-0.5 block text-[0.72rem] font-extrabold text-[var(--admin-primary)]">
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

                <nav className="grid gap-2 max-[980px]:grid-cols-2 max-[720px]:grid-cols-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeKey === item.key;

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
                    <button
                        type="button"
                        className="inline-flex min-h-[38px] cursor-pointer items-center justify-start gap-[9px] rounded-md border-0 bg-transparent px-0 font-bold text-[#5c4642] transition-colors duration-200 hover:bg-[#f8dfda] hover:text-[var(--admin-primary)]"
                    >
                        <FaQuestionCircle className="h-4 w-4" />
                        <span>Support</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex min-h-[38px] cursor-pointer items-center justify-start gap-[9px] rounded-md border-0 bg-transparent px-0 font-bold text-[#5c4642] transition-colors duration-200 hover:bg-[#f8dfda] hover:text-[var(--admin-primary)]"
                    >
                        <FaSignOutAlt className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className={`min-w-0 flex min-h-screen flex-col ${mainClassName}`}>
                <header className="sticky top-0 z-[4] flex h-16 items-center justify-between gap-5 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-11 max-[980px]:h-auto max-[980px]:items-stretch max-[980px]:px-5 max-[980px]:py-3 max-[720px]:flex-col">
                    <label className="flex h-10 w-[min(420px,100%)] items-center gap-2.5 rounded-full border border-[var(--admin-border)] bg-[#fffaf8] px-4 text-[var(--admin-muted)]">
                        <FaSearch />
                        <input
                            className="h-full w-full min-w-0 border-0 bg-transparent p-0 text-[var(--admin-ink)] outline-0"
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
                                className={`${iconButtonClasses} overflow-hidden rounded-full bg-[linear-gradient(145deg,#650404,#c04733)] text-[0.72rem] font-black text-white hover:bg-[linear-gradient(145deg,#650404,#c04733)]`}
                                aria-expanded={isProfileOpen}
                                aria-label="Open account profile"
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
                                            className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 font-black text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]"
                                        >
                                            Settings
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 font-black text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]"
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

export default RefereeLayout;
