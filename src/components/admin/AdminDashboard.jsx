import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    FaChartLine,
    FaCheck,
    FaClipboardCheck,
    FaEllipsisV,
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
const panelClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]';
const sectionHeadClass = 'flex min-h-[58px] items-center justify-between gap-[18px] border-b border-[var(--admin-border)] px-[22px] max-[720px]:flex-col max-[720px]:items-stretch';
const sectionActionClass = 'rounded-full bg-[#ffe8e4] px-2.5 py-1.5 text-[0.72rem] font-black uppercase text-[var(--admin-primary)] transition-colors duration-200 hover:bg-[#ffd8d2]';
const tableHeadClass = 'border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[18px] text-left text-[0.7rem] uppercase text-[#765c58]';
const tableCellClass = (isLast = false, align = 'left') => [
    isLast ? 'border-b-0' : 'border-b border-[var(--admin-border)]',
    align === 'right' ? 'text-right' : '',
    'px-[22px] py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]',
].join(' ');
const statusClass = {
    pending: 'border-[#e2cd79] bg-[#f7efcf] text-[#6a520d]',
    active: 'border-[#afe2c4] bg-[#dff7e9] text-[#118548]',
    inactive: 'border-[#dbaaa5] bg-[#f5e1df] text-[var(--admin-primary-dark)]',
    banned: 'border-[#f5b8bf] bg-[#ffe5e7] text-[#c3222c]',
    draft: 'bg-[#f3f4f6] text-[#374151]',
    openregistration: 'bg-[#dcfce7] text-[#15803d]',
    closedregistration: 'bg-[#fee2e2] text-[#b91c1c]',
    ongoing: 'bg-[#dbeafe] text-[#1d4ed8]',
    completed: 'bg-[#ede9fe] text-[#6d28d9]',
    cancelled: 'bg-[#f3f4f6] text-[#6b7280]',
};
const tournamentStatusBaseClass = 'inline-flex min-h-6 items-center rounded-full px-2.5 text-[0.72rem] font-extrabold';
const getTournamentStatusClass = (status) => `${tournamentStatusBaseClass} ${statusClass[statusKey(status)] || statusClass.draft}`;
const deadlineClass = {
    warning: 'text-[#b45309]',
    danger: 'text-[#b91c1c]',
};
const avatarBaseClass = 'grid h-[42px] w-[42px] flex-none place-items-center overflow-hidden rounded-full text-[0.8rem] font-extrabold text-white';
const avatarClass = {
    default: 'bg-[linear-gradient(145deg,#1d3d42,#d2a35a)]',
    owner: 'bg-[linear-gradient(145deg,#5a2d1f,#c79043)]',
    jockey: 'bg-[linear-gradient(145deg,#1d546d,#5cb8a6)]',
    referee: 'bg-[linear-gradient(145deg,#26323b,#9aa8af)]',
    spectator: 'bg-[linear-gradient(145deg,#674861,#d17664)]',
    admin: 'bg-[linear-gradient(145deg,#650404,#c04733)]',
};

const statIconByTone = {
    users: FaUsers,
    tournaments: FaTrophy,
    registrations: FaClipboardCheck,
    results: FaFlagCheckered,
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

    const visibleApprovals = useMemo(() => dashboard.approvals.filter((approval) => matchesQuery([
        approval.name,
        approval.role,
        approval.request,
    ], query)), [dashboard.approvals, query]);

    const visibleUsers = useMemo(() => sortPendingFirst(dashboard.users.filter((user) => matchesQuery([
        user.name,
        user.role,
        user.email,
    ], query)), (user) => user.status), [dashboard.users, query]);

    const refreshDashboard = async () => {
        setDashboard(await adminApi.getDashboard());
    };

    const handleViewAllTournaments = () => {
        navigate('/admin/races');
    };

    const handleViewAllUsers = () => {
        navigate('/admin/users');
    };

    const handleApproval = async (approval, nextStatus) => {
        if (approval.source === 'user' && approval.role === 'Jockey') {
            if (nextStatus === 'Active' || nextStatus === 'Approved') {
                await adminApi.approveVerification(approval.id);
            } else {
                await adminApi.rejectVerification(approval.id);
            }
        } else if (approval.source === 'user') {
            await adminApi.updateUserStatus(approval.id, nextStatus);
        } else {
            await adminApi.updateHorseApproval(approval.id, nextStatus);
        }

        await refreshDashboard();
    };

    return (
        <AdminLayout
            activeKey="dashboard"
            onSearchChange={setQuery}
            searchPlaceholder="Search users, horses, races..."
            searchValue={query}
        >
                <section className={pageShellClass}>
                    <div className={headingClass}>
                        <div>
                            <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[720px]:text-[1.6rem]">
                                Dashboard Overview
                            </h1>
                            <p className="mb-0 mt-1.5 font-[650] text-[var(--admin-muted)]">
                                Today: {todayLabel}
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <p className="m-0 font-bold text-[var(--admin-muted)]">Loading mock data...</p>
                    ) : null}

                    <section aria-label="Summary statistics" className="grid grid-cols-4 gap-5 max-[1280px]:grid-cols-2 max-[720px]:grid-cols-1">
                        {dashboard.stats.map((stat) => {
                            const Icon = statIconByTone[stat.tone] || FaChartLine;

                            return (
                                <article className="grid min-h-[140px] content-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[22px]" key={stat.label}>
                                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#ffe8e4] text-[var(--admin-primary)]">
                                        <Icon aria-hidden="true" />
                                    </div>
                                    <span className="text-[var(--admin-muted)]">{stat.label}</span>
                                    <strong className="text-[2rem] leading-[1.1] text-[var(--admin-ink)]">{stat.value}</strong>
                                    <small className="font-extrabold text-[var(--admin-muted)]">{stat.trend}</small>
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
                                            <th className={`${tableHeadClass} text-right`}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleTournaments.map((tournament, index) => {
                                            const isLast = index === visibleTournaments.length - 1;
                                            const deadlineWarning = adminApi.formatters.getTournamentDeadlineWarning(tournament);

                                            return (
                                            <tr key={tournament.name}>
                                                <td className={tableCellClass(isLast)}>
                                                    <strong className="block">{tournament.name}</strong>
                                                    <span className="mt-1 block text-[var(--admin-muted)]">{tournament.description}</span>
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
                                                    <button aria-label={`Actions for ${tournament.name}`} className="inline-grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md bg-transparent text-[var(--admin-muted)] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" type="button">
                                                        <FaEllipsisV aria-hidden="true" />
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
                                            <th className={`${tableHeadClass} text-right`}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleUsers.map((user, index) => {
                                            const isLast = index === visibleUsers.length - 1;
                                            const status = statusKey(user.status);

                                            return (
                                                <tr key={user.id || user.email || user.name}>
                                                    <td className={tableCellClass(isLast)}>
                                                        <div className="flex min-w-[220px] items-center gap-3">
                                                            <div className={`${avatarBaseClass} h-10 w-10 ${roleAvatarClass(user.role)}`}>
                                                                {user.avatar}
                                                            </div>
                                                            <div>
                                                                <strong className="block">{user.name}</strong>
                                                                <span className="mt-1 block text-[var(--admin-muted)]">{user.id}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={tableCellClass(isLast)}>{user.email}</td>
                                                    <td className={tableCellClass(isLast)}>{user.role}</td>
                                                    <td className={tableCellClass(isLast)}>
                                                        <span className={`inline-flex min-h-6 items-center rounded-[5px] border px-2 text-[0.74rem] font-extrabold ${statusClass[status] || statusClass.pending}`}>
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className={tableCellClass(isLast)}>
                                                        <span className={`inline-grid h-[22px] w-[22px] place-items-center rounded-full ${user.verified ? 'text-[#0aa15f]' : 'text-[#d71920]'}`}>
                                                            {user.verified ? <FaCheck aria-hidden="true" /> : <FaTimes aria-hidden="true" />}
                                                        </span>
                                                    </td>
                                                    <td className={tableCellClass(isLast, 'right')}>
                                                        <button className="min-h-6 cursor-pointer rounded-full bg-[#ffe8e4] px-[9px] text-[0.68rem] font-[850] text-[var(--admin-primary)]" onClick={() => setSelectedUser(user)} type="button">Details</button>
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
                                    <button aria-label="Close user details" className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]" onClick={() => setSelectedUser(null)} type="button">
                                        <FaTimes aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-[0.9rem] max-[560px]:grid-cols-1">
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#765c58]">Email</span>
                                        <strong className="break-words text-[var(--admin-ink)]">{selectedUser.email}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#765c58]">Role</span>
                                        <strong>{selectedUser.role}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#765c58]">Status</span>
                                        <strong className={statusKey(selectedUser.status) === 'active' ? 'text-[#0aa15f]' : 'text-[var(--admin-primary)]'}>{selectedUser.status}</strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#765c58]">Verified</span>
                                        <strong className={selectedUser.verified ? 'text-[#0aa15f]' : 'text-[#d71920]'}>
                                            {selectedUser.verified ? 'Verified' : 'Not verified'}
                                        </strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#765c58]">Created At</span>
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
