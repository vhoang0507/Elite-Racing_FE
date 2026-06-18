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
    FaUserFriends,
} from 'react-icons/fa';

import { clearAuthSession, getAuthUser } from '../../utils/tokenStorage';

const navigation = [
    { key: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/owner/dashboard' },
    { key: 'my-horse', label: 'My Horse', icon: FaHorseHead, path: '/owner/my-horse' },
    { key: 'register-horse', label: 'Register Horse', icon: FaPlusCircle, path: '/owner/register-horse' },
    { key: 'registrations', label: 'My Registrations', icon: FaClipboardList, path: '/owner/registrations' },
    { key: 'jockey', label: 'Jockey Assignment', icon: FaUserFriends, path: '/owner/jockey' },
    { key: 'notifications', label: 'Notifications', icon: FaBell, path: '/owner/notifications' },
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
    '[--admin-radius:8px]',
    "grid h-screen min-h-screen grid-cols-[260px_minmax(0,1fr)] overflow-auto bg-[var(--admin-bg)] text-left font-['Segoe_UI',Arial,sans-serif] text-[var(--admin-ink)]",
    'max-[980px]:grid-cols-1',
].join(' ');

const iconButtonClasses = 'relative inline-flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-[#5b403c] transition-colors duration-200 hover:bg-[#f8e5e1]';

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
            <aside className="sticky top-0 flex min-h-screen flex-col gap-6 border-r border-[var(--admin-border)] bg-[#fff0ed] px-[18px] pb-5 pt-7 max-[980px]:static max-[980px]:min-h-0 max-[980px]:gap-4">
                <div className="text-[1.1rem] font-black text-[var(--admin-primary)]">
                    Elite Racing League
                </div>

                <div className="flex items-center gap-3 px-1.5 py-2">
                    <div className="grid h-[42px] w-[42px] flex-none place-items-center rounded-full bg-[linear-gradient(145deg,#650404,#c04733)] text-[0.8rem] font-extrabold text-white">
                        {initials}
                    </div>
                    <div>
                        <strong className="block text-[var(--admin-ink)]">{user?.fullName ?? 'Horse Owner'}</strong>
                        <span className="mt-0.5 block text-[0.72rem] font-extrabold text-[var(--admin-primary)]">
                            HORSE OWNER
                        </span>
                    </div>
                </div>

                <nav className="grid gap-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.key === activeKey;
                        return (
                            <Link
                                key={item.key}
                                to={item.path}
                                className={[
                                    'inline-flex min-h-[38px] w-full cursor-pointer items-center gap-[9px] rounded-md px-3 font-bold text-[#5c4642] no-underline transition-colors duration-200',
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
                    <button className="inline-flex min-h-[38px] cursor-pointer items-center gap-[9px] rounded-md border-0 bg-transparent px-0 font-bold text-[#5c4642] hover:text-[var(--admin-primary)]" type="button">
                        <FaQuestionCircle className="h-4 w-4" /> <span>Support</span>
                    </button>
                    <button className="inline-flex min-h-[38px] cursor-pointer items-center gap-[9px] rounded-md border-0 bg-transparent px-0 font-bold text-[#5c4642] hover:text-[var(--admin-primary)]" onClick={handleLogout} type="button">
                        <FaSignOutAlt className="h-4 w-4" /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="min-w-0 flex flex-col min-h-screen">
                <header className="sticky top-0 z-[4] flex h-16 items-center justify-between gap-5 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-11 max-[980px]:px-5">
                    <label className="flex h-10 w-[min(420px,100%)] items-center gap-2.5 rounded-full border border-[var(--admin-border)] bg-[#fffaf8] px-4 text-[var(--admin-muted)]">
                        <FaSearch />
                        <input className="h-full w-full min-w-0 border-0 bg-transparent p-0 text-[var(--admin-ink)] outline-0" placeholder="Search records, horses, races..." type="search" />
                    </label>
                    <div className="flex items-center gap-2">
                        <button className={iconButtonClasses} type="button">
                            <FaBell />
                            <span className="absolute right-2.5 top-[9px] h-2 w-2 rounded-full border-2 border-[var(--admin-surface)] bg-[var(--admin-primary)]" />
                        </button>
                        <button
                            className={`${iconButtonClasses} overflow-hidden rounded-full bg-[linear-gradient(145deg,#650404,#c04733)] text-[0.72rem] font-black text-white`}
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            type="button"
                        >
                            {initials}
                        </button>
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

export default HorseOwnerLayout;