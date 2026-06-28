import {
    useState,
} from 'react';

import {
    Link,
    useNavigate,
} from 'react-router-dom';

import {
    FaBell,
    FaChartBar,
    FaChartLine,
    FaClipboardCheck,
    FaFlagCheckered,
    FaPlus,
    FaQuestionCircle,
    FaSearch,
    FaSignOutAlt,
    FaTools,
    FaUsers,
} from 'react-icons/fa';

import { clearAuthSession, getAuthUser } from '../../utils/tokenStorage';

const navigation = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: FaChartLine,
        path: '/admin/dashboard',
    },
    {
        key: 'users',
        label: 'User Management',
        icon: FaUsers,
        path: '/admin/users',
    },
    {
        key: 'races',
        label: 'Race Management',
        icon: FaFlagCheckered,
        path: '/admin/races',
    },
    {
        key: 'registrations',
        label: 'Race Entry Approval',
        icon: FaClipboardCheck,
        path: '/admin/registrations',
    },
    {
        key: 'predictions',
        label: 'Prediction Management',
        icon: FaChartBar,
        path: '/admin/predictions',
    },
    {
        key: 'results',
        label: 'Validate Results',
        icon: FaClipboardCheck,
        path: '/admin/results',
    },
    {
        key: 'notifications',
        label: 'Notifications',
        icon: FaBell,
        path: '/admin/notifications',
    },
    {
        key: 'system-time',
        label: 'System Time',
        icon: FaTools,
        path: '/admin/system-time',
    },
];

const shellClasses = [
    'role-shell',
].join(' ');

const iconButtonClasses = [
    'role-icon-button',
].join(' ');

function readUserField(user, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) {
    return user?.[camelKey] ?? user?.[pascalKey];
}

function getInitials(name) {
    return name
        ?.split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'AD';
}

function AdminLayout({
    activeKey,
    children,
    mainClassName = '',
    onSearchChange,
    searchValue,
    searchPlaceholder = 'Search records, horses, races...',
}) {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const authUser = getAuthUser();
    const accountName = readUserField(authUser, 'fullName') || 'Admin';
    const accountRole = readUserField(authUser, 'role') || 'Admin';
    const accountEmail = readUserField(authUser, 'email') || 'No email loaded';
    const accountStatus = readUserField(authUser, 'status') || 'N/A';
    const accountId = readUserField(authUser, 'userId') || readUserField(authUser, 'id');
    const accountInitials = getInitials(accountName);

    const handleLogout = () => {
        clearAuthSession();
        navigate('/login', { replace: true });
        window.location.replace('/login');
    };

    return (
        <div className={shellClasses}>
            <aside
                aria-label="Admin navigation"
                className="role-sidebar admin-sidebar"
            >
                <div className="role-brand">
                    <span className="role-brand-mark">
                        ER
                    </span>
                    <span>Elite Racing League</span>
                </div>

                <div className="role-profile-summary">
                    <div className="role-avatar">
                        {accountInitials}
                    </div>
                    <div className="min-w-0">
                        <strong className="role-profile-name">{accountName}</strong>
                        <span className="role-profile-role">
                            {accountRole.toUpperCase()}
                        </span>
                    </div>
                </div>

                <nav className="role-nav flex-1 max-[980px]:flex-none">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.key === activeKey;

                        return (
                            <Link
                                className={[
                                    'role-nav-item',
                                    isActive ? 'is-active' : '',
                                ].join(' ')}
                                key={item.key}
                                to={item.path}
                            >
                                <Icon aria-hidden="true" className="h-4 w-4 flex-none" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden" />

                <Link
                    className="primary-button w-full gap-[9px]"
                    to="/admin/tournaments/create"
                >
                    <FaPlus aria-hidden="true" />
                    <span>New tournament</span>
                </Link>

                <div className="role-sidebar-actions">
                    <button
                        className="role-sidebar-action"
                        type="button"
                    >
                        <FaQuestionCircle aria-hidden="true" className="h-4 w-4" />
                        <span>Support</span>
                    </button>
                    <button
                        className="role-sidebar-action"
                        onClick={handleLogout}
                        type="button"
                    >
                        <FaSignOutAlt aria-hidden="true" className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className={`role-main ${mainClassName}`}>
                <header className="role-header">
                    <label
                        aria-label="Search admin records"
                        className="role-search"
                    >
                        <FaSearch aria-hidden="true" />
                        <input
                            onChange={(event) => onSearchChange?.(event.target.value)}
                            placeholder={searchPlaceholder}
                            type="search"
                            {...(searchValue !== undefined ? { value: searchValue } : {})}
                        />
                    </label>

                    <div className="flex items-center gap-2 max-[720px]:justify-end">
                        <button aria-label="Notifications" className={iconButtonClasses} onClick={() => navigate('/admin/notifications')} type="button">
                            <FaBell aria-hidden="true" />
                            <span className="absolute right-2.5 top-[9px] h-2 w-2 rounded-full border-2 border-[var(--admin-surface)] bg-[var(--admin-primary)]" />
                        </button>
                        <div className="relative">
                            <button
                                aria-expanded={isProfileOpen}
                                aria-label="Open account profile"
                                className={`${iconButtonClasses} role-profile-button`}
                                onClick={() => setIsProfileOpen((current) => !current)}
                                type="button"
                            >
                                {accountInitials}
                            </button>

                            {isProfileOpen && (
                                <section
                                    aria-label="Account profile"
                                    className="role-popover"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="role-avatar h-14 w-14 text-[0.95rem]">
                                            {accountInitials}
                                        </div>
                                        <div className="min-w-0">
                                            <strong className="block truncate text-[1.05rem] text-[var(--admin-ink)]">{accountName}</strong>
                                            <span className="mt-1 inline-flex rounded-full bg-[#ffe8e4] px-2.5 py-1 text-[0.66rem] font-black text-[var(--admin-primary)]">
                                                {accountRole.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-[0.84rem]">
                                        <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                            <span className="text-[0.66rem] font-black uppercase text-[#765c58]">Email</span>
                                            <strong className="break-words text-[var(--admin-ink)]">{accountEmail}</strong>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[#765c58]">Account ID</span>
                                                <strong>{accountId ? `AD-${String(accountId).padStart(5, '0')}` : 'N/A'}</strong>
                                            </div>
                                            <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                                <span className="text-[0.66rem] font-black uppercase text-[#765c58]">Status</span>
                                                <strong className="text-[#0aa15f]">{accountStatus}</strong>
                                            </div>
                                        </div>
                                        <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                            <span className="text-[0.66rem] font-black uppercase text-[#765c58]">Department</span>
                                            <strong>League Operations</strong>
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

export default AdminLayout;
