import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    FaChartLine,
    FaCheck,
    FaClipboardCheck,
    FaEye,
    FaFlagCheckered,
    FaTimes,
    FaTrophy,
    FaUsers,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import AdminLayout from './AdminLayout';
import { adminApi } from '../../api/adminApi';

const pageShellClass = 'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';
const headingClass = 'flex items-center justify-between gap-[18px] max-[720px]:flex-col max-[720px]:items-stretch';
const panelClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_10px_30px_rgba(11,27,52,0.06)]';
const sectionHeadClass = 'flex min-h-[58px] items-center justify-between gap-[18px] border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] max-[720px]:flex-col max-[720px]:items-stretch';
const sectionActionClass = 'action-pill no-underline';
const tableHeadClass = 'border-b-2 border-[var(--admin-gold)] bg-[var(--admin-surface-strong)] px-[22px] py-4 text-left text-[0.68rem] font-bold uppercase tracking-wider text-[var(--admin-muted)]';
const tableCellClass = (isLast = false, align = 'left') => [
    isLast ? 'border-b-0' : 'border-b border-[var(--admin-border)]',
    align === 'right' ? 'text-right' : '',
    'px-[22px] py-4 align-middle text-[0.92rem] text-[var(--admin-ink)]',
].join(' ');
const rowHoverClass = 'transition-colors hover:bg-[var(--admin-surface-strong)]';
const statusClass = {
    pending: 'bg-[#faf2e0] text-[#8a6209]',
    active: 'bg-[#e8f7ee] text-[#16864f]',
    inactive: 'bg-[#f3e8e6] text-[#7f645f]',
    banned: 'bg-[#f3e1df] text-[#a4392f]',
    draft: 'bg-[#f3f4f6] text-[#374151]',
    openregistration: 'bg-[#e8f7ee] text-[#16864f]',
    closedregistration: 'bg-[#f3e1df] text-[#a4392f]',
    ongoing: 'bg-[#faf2e0] text-[#8a6209]',
    completed: 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]',
    cancelled: 'bg-[#f3f4f6] text-[#6b7280]',
};
const humanizeLabel = (value) => String(value || '').replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim();
const tournamentStatusBaseClass = 'inline-flex min-h-6 items-center rounded-full px-3 text-[0.68rem] font-bold uppercase tracking-wide';
const getTournamentStatusClass = (status) => `${tournamentStatusBaseClass} ${statusClass[statusKey(status)] || statusClass.draft}`;
const deadlineClass = {
    warning: 'text-[#b45309]',
    danger: 'text-[#a4392f]',
};
const avatarBaseClass = 'grid h-[42px] w-[42px] flex-none place-items-center overflow-hidden rounded-full text-[0.8rem] font-extrabold text-white';
const avatarClass = {
    default: 'bg-[linear-gradient(145deg,#16305c,#c8a24a)]',
    owner: 'bg-[linear-gradient(145deg,#5a2d1f,#c79043)]',
    jockey: 'bg-[linear-gradient(145deg,#0b1b34,#2f7d5c)]',
    referee: 'bg-[linear-gradient(145deg,#26323b,#9aa8af)]',
    spectator: 'bg-[linear-gradient(145deg,#674861,#d17664)]',
    admin: 'bg-[linear-gradient(145deg,#0b1b34,#c8a24a)]',
};

const statIconByTone = {
    users: FaUsers,
    tournaments: FaTrophy,
    registrations: FaClipboardCheck,
    results: FaFlagCheckered,
};

const statAccentByTone = {
    users: { bg: '#e7efff', ink: '#1f57c7' },
    tournaments: { bg: '#f3e6c2', ink: '#8a6a1f' },
    registrations: { bg: '#e6f7ed', ink: '#11734b' },
    results: { bg: '#f3e1df', ink: '#a4392f' },
};

const roleAvatarClass = (role = '') => {
    const key = role.toLowerCase().replace(/\s+/g, '-');

    if (key === 'horse-owner') {
        return avatarClass.owner;
    }

    return avatarClass[key] || avatarClass.default;
};

const statusKey = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');

const sortPendingFirst = (items, getStatus) => [...items].sort((current, next) => {
    const currentRank = statusKey(getStatus(current)) === 'pending' ? 0 : 1;
    const nextRank = statusKey(getStatus(next)) === 'pending' ? 0 : 1;

    return currentRank - nextRank;
});

const matchesQuery = (values, query) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return true;
    }

    return values.some((value) => String(value).toLowerCase().includes(normalizedQuery));
};

function AdminDashboard() {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState({
        stats: [],
        tournaments: [],
        approvals: [],
        users: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const todayLabel = useMemo(() => new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date()), []);

    useEffect(() => {
        let isMounted = true;

        adminApi.getDashboard().then((payload) => {
            if (isMounted) {
                setDashboard(payload);
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const visibleTournaments = useMemo(() => sortPendingFirst(dashboard.tournaments.filter((tournament) => statusKey(tournament.status) !== 'cancelled' && matchesQuery([
        tournament.name,
        tournament.description,
        tournament.city,
        tournament.status,
    ], query)), (tournament) => tournament.status), [dashboard.tournaments, query]);

    const visibleUsers = useMemo(() => sortPendingFirst(dashboard.users.filter((user) => matchesQuery([
        user.name,
        user.role,
        user.email,
    ], query)), (user) => user.status), [dashboard.users, query]);

    const handleViewAllTournaments = () => {
        navigate('/admin/races');
    };

    const handleViewAllUsers = () => {
        navigate('/admin/users');
    };

    return (
        <AdminLayout
            activeKey="dashboard"
            onSearchChange={setQuery}
            searchPlaceholder="Search users, horses, races..."
            searchValue={query}
        >
                <section className={pageShellClass}>
                    <div className="visual-banner flex items-center justify-between gap-6 px-8 py-7 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-3">
                        <div className="relative z-[1]">
                            <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#c8a24a]">
                                Admin Console
                            </span>
                            <h1 className="m-0 mt-1.5 text-[1.9rem] leading-[1.15] max-[720px]:text-[1.5rem]">
                                Welcome back, Admin
                            </h1>
                            <p className="mb-0 mt-1.5 font-semibold text-[rgba(246,236,210,0.78)]">
                                Today is {todayLabel}. Here's what's happening across Elite Racing League.
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <p className="m-0 font-bold text-[var(--admin-muted)]">Loading...</p>
                    ) : null}

                    <section aria-label="Summary statistics" className="grid grid-cols-4 gap-5 max-[1280px]:grid-cols-2 max-[720px]:grid-cols-1">
                        {dashboard.stats.map((stat) => {
                            const Icon = statIconByTone[stat.tone] || FaChartLine;
                            const accent = statAccentByTone[stat.tone] || statAccentByTone.users;

                            return (
                                <article className="grid min-h-[140px] content-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[22px] shadow-[0_10px_26px_rgba(11,27,52,0.06)] transition-shadow hover:shadow-[0_14px_32px_rgba(11,27,52,0.12)]" key={stat.label}>
                                    <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: accent.bg, color: accent.ink }}>
                                        <Icon aria-hidden="true" />
                                    </div>
                                    <span className="text-[0.82rem] font-semibold text-[var(--admin-muted)]">{stat.label}</span>
                                    <strong className="text-[2rem] leading-[1.1] text-[var(--admin-ink)]">{stat.value}</strong>
                                    <small className="font-bold text-[var(--admin-muted)]">{stat.trend}</small>
                                </article>
                            );
                        })}
                    </section>

                    <section className="grid grid-cols-1 items-start gap-7">
                        <div className={panelClass}>
                            <div className={sectionHeadClass}>
                                <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Manage Tournaments</h2>
                                <button className={sectionActionClass} onClick={handleViewAllTournaments} type="button">View all</button>
                            </div>

                            <div className="w-full overflow-x-auto">
                                <table className="w-full border-collapse max-[720px]:min-w-[720px]">
                                    <thead>
                                        <tr>
                                            <th className={tableHeadClass}>Tournament name</th>
                                            <th className={tableHeadClass}>Race Date</th>
                                            <th className={tableHeadClass}>Registration Deadline</th>
                                            <th className={tableHeadClass}>Entries</th>
                                            <th className={tableHeadClass}>Status</th>
                                            <th className={`${tableHeadClass} text-right`}>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleTournaments.map((tournament, index) => {
                                            const isLast = index === visibleTournaments.length - 1;
                                            const deadlineWarning = adminApi.formatters.getTournamentDeadlineWarning(tournament);

                                            return (
                                            <tr className={rowHoverClass} key={tournament.name}>
                                                <td className={tableCellClass(isLast)}>
                                                    <strong className="block">{tournament.name}</strong>
                                                    <span className="mt-1 block text-[0.82rem] text-[var(--admin-muted)]">{tournament.description}</span>
                                                </td>
                                                <td className={tableCellClass(isLast)}>{adminApi.formatters.toDateLabel(tournament.endDate)}</td>
                                                <td className={tableCellClass(isLast)}>
                                                    <span className="block">{adminApi.formatters.toDateLabel(tournament.startDate)}</span>
                                                    {deadlineWarning && (
                                                        <small className={`mt-1 block text-[0.72rem] font-black ${deadlineClass[deadlineWarning.type] || deadlineClass.warning}`}>
                                                            {deadlineWarning.text}
                                                        </small>
                                                    )}
                                                </td>
                                                <td className={tableCellClass(isLast)}>{tournament.registeredHorses}/{tournament.maxHorses}</td>
                                                <td className={tableCellClass(isLast)}>
                                                    <span className={getTournamentStatusClass(tournament.status)}>
                                                        {adminApi.formatters.formatTournamentStatus(tournament.status)}
                                                    </span>
                                                </td>
                                                <td className={tableCellClass(isLast, 'right')}>
                                                    <button aria-label={`View details for ${tournament.name}`} className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-transparent text-[var(--admin-muted)] hover:bg-[#f3e6c2] hover:text-[var(--admin-primary)]" onClick={() => setSelectedTournament(tournament)} type="button">
                                                        <FaEye aria-hidden="true" />
                                                    </button>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {selectedTournament && (
                        <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8" onClick={() => setSelectedTournament(null)} role="presentation">
                            <section
                                aria-label={`Details for ${selectedTournament.name}`}
                                className="grid w-[min(560px,100%)] gap-5 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_20px_48px_rgba(45,32,32,0.22)]"
                                onClick={(event) => event.stopPropagation()}
                                role="dialog"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="m-0 text-[1.35rem] leading-[1.15] text-[var(--admin-primary-dark)]">{selectedTournament.name}</h2>
                                        <span className="mt-2 inline-flex text-[0.8rem] font-black text-[var(--admin-muted)]">{selectedTournament.description || 'No description'}</span>
                                    </div>
                                    <button aria-label="Close tournament details" className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={() => setSelectedTournament(null)} type="button">
                                        <FaTimes aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-[0.9rem] max-[560px]:grid-cols-1">
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#64748b]">Race Date</span>
                                        <strong className="text-[var(--admin-ink)]">{adminApi.formatters.toDateLabel(selectedTournament.endDate) || '-'}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#64748b]">Registration Deadline</span>
                                        <strong>{adminApi.formatters.toDateLabel(selectedTournament.startDate) || '-'}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#64748b]">Entries</span>
                                        <strong>{selectedTournament.registeredHorses}/{selectedTournament.maxHorses}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#64748b]">Status</span>
                                        <strong className="text-[var(--admin-primary)]">{adminApi.formatters.formatTournamentStatus(selectedTournament.status)}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#64748b]">Location</span>
                                        <strong>{selectedTournament.location || selectedTournament.city || '-'}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#64748b]">Prize Pool</span>
                                        <strong>{adminApi.formatters.toMoney(selectedTournament.prizePool)}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#64748b]">Referee</span>
                                        <strong>{selectedTournament.referee || 'Unassigned'}</strong>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    <section className="grid grid-cols-1 gap-7">
                        <div className={panelClass}>
                            <div className={sectionHeadClass}>
                                <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Users</h2>
                                <button className={sectionActionClass} onClick={handleViewAllUsers} type="button">View all</button>
                            </div>

                            <div className="w-full overflow-x-auto">
                                <table className="w-full border-collapse max-[720px]:min-w-[820px]">
                                    <thead>
                                        <tr>
                                            <th className={tableHeadClass}>Full name</th>
                                            <th className={tableHeadClass}>Email</th>
                                            <th className={tableHeadClass}>Role</th>
                                            <th className={tableHeadClass}>Status</th>
                                            <th className={tableHeadClass}>Verified</th>
                                            <th className={`${tableHeadClass} text-right`}>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleUsers.map((user, index) => {
                                            const isLast = index === visibleUsers.length - 1;
                                            const status = statusKey(user.status);

                                            return (
                                                <tr className={rowHoverClass} key={user.id || user.email || user.name}>
                                                    <td className={tableCellClass(isLast)}>
                                                        <div className="flex min-w-[220px] items-center gap-3">
                                                            <div className={`${avatarBaseClass} h-10 w-10 ${roleAvatarClass(user.role)}`}>
                                                                {user.avatar}
                                                            </div>
                                                            <div>
                                                                <strong className="block">{user.name}</strong>
                                                                <span className="mt-1 block text-[0.82rem] text-[var(--admin-muted)]">{user.id}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={`${tableCellClass(isLast)} text-[var(--admin-muted)]`}>{user.email}</td>
                                                    <td className={tableCellClass(isLast)}>{humanizeLabel(user.role)}</td>
                                                    <td className={tableCellClass(isLast)}>
                                                        <span className={`inline-flex min-h-6 items-center rounded-full px-3 text-[0.68rem] font-bold uppercase tracking-wide ${statusClass[status] || statusClass.pending}`}>
                                                            {humanizeLabel(user.status)}
                                                        </span>
                                                    </td>
                                                    <td className={tableCellClass(isLast)}>
                                                        <span className={`inline-grid h-6 w-6 place-items-center rounded-full ${user.verified ? 'bg-[#e6f7ed] text-[#16864f]' : 'bg-[#f3e1df] text-[#a4392f]'}`}>
                                                            {user.verified ? <FaCheck aria-hidden="true" className="h-3 w-3" /> : <FaTimes aria-hidden="true" className="h-3 w-3" />}
                                                        </span>
                                                    </td>
                                                    <td className={tableCellClass(isLast, 'right')}>
                                                        <button aria-label={`View details for ${user.name}`} className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-transparent text-[var(--admin-muted)] hover:bg-[#f3e6c2] hover:text-[var(--admin-primary)]" onClick={() => setSelectedUser(user)} type="button">
                                                            <FaEye aria-hidden="true" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {selectedUser && (
                        <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8" onClick={() => setSelectedUser(null)} role="presentation">
                            <section
                                aria-label={`Details for ${selectedUser.name}`}
                                className="grid w-[min(520px,100%)] gap-5 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_20px_48px_rgba(45,32,32,0.22)]"
                                onClick={(event) => event.stopPropagation()}
                                role="dialog"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`${avatarBaseClass} h-14 w-14 ${roleAvatarClass(selectedUser.role)}`}>
                                            {selectedUser.avatar}
                                        </div>
                                        <div>
                                            <h2 className="m-0 text-[1.35rem] leading-[1.15] text-[var(--admin-primary-dark)]">{selectedUser.name}</h2>
                                            <span className="mt-2 inline-flex text-[0.8rem] font-black text-[var(--admin-muted)]">{selectedUser.id}</span>
                                        </div>
                                    </div>
                                    <button aria-label="Close user details" className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={() => setSelectedUser(null)} type="button">
                                        <FaTimes aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-[0.9rem] max-[560px]:grid-cols-1">
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#64748b]">Email</span>
                                        <strong className="break-words text-[var(--admin-ink)]">{selectedUser.email}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#64748b]">Role</span>
                                        <strong>{humanizeLabel(selectedUser.role)}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#64748b]">Status</span>
                                        <strong className={statusKey(selectedUser.status) === 'active' ? 'text-[#16864f]' : 'text-[var(--admin-primary)]'}>{humanizeLabel(selectedUser.status)}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#64748b]">Verified</span>
                                        <strong className={selectedUser.verified ? 'text-[#0aa15f]' : 'text-[#d71920]'}>
                                            {selectedUser.verified ? 'Verified' : 'Not verified'}
                                        </strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#64748b]">Created At</span>
                                        <strong>{adminApi.formatters.toDateLabel(selectedUser.createdAt)}</strong>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                </section>
        </AdminLayout>
    );
}

export default AdminDashboard;
