import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    FaCalendarCheck,
    FaCheck,
    FaChevronLeft,
    FaChevronRight,
    FaExclamationTriangle,
    FaEye,
    FaTimes,
    FaUsers,
} from 'react-icons/fa';

import {
    adminMockApi,
    adminMockTotals,
} from '../../api/adminMockApi';

import AdminLayout from './AdminLayout';

const formatClass = (value) => value.toLowerCase().replace(/\s+/g, '-');

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 py-9 max-[780px]:px-5';
const selectClass = 'h-8 min-w-[86px] cursor-pointer appearance-none border-0 bg-transparent bg-[url("data:image/svg+xml,%3Csvg_width=%2714%27_height=%2714%27_viewBox=%270_0_14_14%27_fill=%27none%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath_d=%27M3.5_5.25L7_8.75L10.5_5.25%27_stroke=%27%232b1d1b%27_stroke-width=%271.8%27_stroke-linecap=%27round%27_stroke-linejoin=%27round%27/%3E%3C/svg%3E")] bg-[length:14px_14px] bg-[right_2px_center] bg-no-repeat py-0 pl-0 pr-[26px] text-[0.8rem] font-bold text-[var(--admin-ink)] outline-0';

const summaryIconClass = {
    users: 'text-[#ff9a8d]',
    pending: 'text-[#8d6a0d]',
    reports: 'text-[var(--admin-primary)]',
};

const roleClass = {
    admin: 'border-[#b7cbff] bg-[#e7efff] text-[#1f57c7]',
    'horse-owner': 'border-[#a7dfbf] bg-[#e6f7ed] text-[#11734b]',
    jockey: 'border-[#ffc78f] bg-[#fff1df] text-[#c55b12]',
    referee: 'border-[#ffb9c3] bg-[#ffe9ed] text-[#c12e42]',
    spectator: 'border-[#ebb4ca] bg-[#fce8f0] text-[#874a62]',
};

const statusClass = {
    active: 'border-[#9fdcb9] bg-[#e8f7ee] text-[#16864f]',
    pending: 'border-[#efd06a] bg-[#fff7db] text-[#a17809]',
    suspended: 'border-[#e7a49a] bg-[#ffe8e4] text-[var(--admin-primary)]',
};

const badgeClass = 'inline-flex min-h-[22px] items-center rounded border px-2 text-[0.68rem] font-black uppercase';
const paginationButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border border-transparent bg-white font-extrabold text-[var(--admin-ink)] hover:border-[var(--admin-border)] hover:text-[var(--admin-primary)]';
const pageSize = 5;

const matchesQuery = (user, query) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return true;
    }

    return [
        user.id,
        user.name,
        user.email,
        user.role,
        user.status,
    ].some((value) => String(value).toLowerCase().includes(normalizedQuery));
};

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        let isMounted = true;

        adminMockApi.getUsers().then((payload) => {
            if (isMounted) {
                setUsers(payload);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const summaryCards = useMemo(() => [
        {
            label: 'Total Users',
            value: (adminMockTotals.users + users.length).toLocaleString('en-US'),
            detail: 'All registered accounts',
            icon: FaUsers,
            tone: 'users',
        },
        {
            label: 'Pending Approval',
            value: String(users.filter((user) => user.status === 'Pending').length).padStart(2, '0'),
            detail: 'Awaiting verification',
            icon: FaCalendarCheck,
            tone: 'pending',
        },
        {
            label: 'Reports Today',
            value: String(users.filter((user) => user.status === 'Suspended').length).padStart(2, '0'),
            detail: 'Requires attention',
            icon: FaExclamationTriangle,
            tone: 'reports',
        },
    ], [users]);

    const filteredUsers = useMemo(() => users.filter((user) => (
        matchesQuery(user, query)
        && (roleFilter === 'all' || formatClass(user.role) === roleFilter)
        && (statusFilter === 'all' || formatClass(user.status) === statusFilter)
    )), [query, roleFilter, statusFilter, users]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
    const firstShown = filteredUsers.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastShown = Math.min(page * pageSize, filteredUsers.length);

    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
        setPage(1);
    };

    const handleQueryChange = (value) => {
        setQuery(value);
        setPage(1);
    };

    return (
        <AdminLayout
            activeKey="users"
            mainClassName="user-management-main"
            onSearchChange={handleQueryChange}
            searchPlaceholder="Search users by name, role, email..."
            searchValue={query}
        >
                <section className={pageShellClass}>
                    <div className="flex items-center justify-between gap-5 max-[1180px]:flex-col max-[1180px]:items-stretch">
                        <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)]">
                            User Management
                        </h1>

                        <div className="flex items-center justify-end gap-2 max-[1180px]:justify-start max-[780px]:flex-col max-[780px]:items-stretch">
                            <label className="inline-flex h-[38px] items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.8rem] font-black text-[var(--admin-ink)] max-[780px]:w-full">
                                <span>Role:</span>
                                <select className={selectClass} onChange={handleFilterChange(setRoleFilter)} value={roleFilter}>
                                    <option value="all">All</option>
                                    <option value="admin">Admin</option>
                                    <option value="horse-owner">Horse Owner</option>
                                    <option value="jockey">Jockey</option>
                                    <option value="referee">Referee</option>
                                    <option value="spectator">Spectator</option>
                                </select>
                            </label>

                            <label className="inline-flex h-[38px] items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.8rem] font-black text-[var(--admin-ink)] max-[780px]:w-full">
                                <span>Status:</span>
                                <select className={selectClass} onChange={handleFilterChange(setStatusFilter)} value={statusFilter}>
                                    <option value="all">All</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </label>

                            <button className="h-[38px] min-w-[92px] cursor-pointer rounded-md border-0 bg-[var(--admin-primary)] font-black text-white hover:bg-[var(--admin-primary-dark)] max-[780px]:w-full" onClick={() => setPage(1)} type="button">Search</button>
                        </div>
                    </div>

                    <section aria-label="User management summary" className="grid grid-cols-3 gap-7 max-[1180px]:grid-cols-1">
                        {summaryCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <article className="flex min-h-[150px] items-start justify-between gap-5 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-7 py-[26px]" key={card.label}>
                                    <div>
                                        <span className="block text-[0.74rem] font-black uppercase tracking-normal text-[#765c58]">{card.label}</span>
                                        <strong className="mt-2 block text-5xl leading-none text-[var(--admin-primary-dark)]">{card.value}</strong>
                                        <small className={`mt-[18px] block text-[0.74rem] font-black ${card.tone === 'reports' ? 'text-[var(--admin-primary)]' : 'text-inherit'}`}>
                                            {card.detail}
                                        </small>
                                    </div>
                                    <Icon aria-hidden="true" className={`h-7 w-7 flex-none ${summaryIconClass[card.tone]}`} />
                                </article>
                            );
                        })}
                    </section>

                    <section className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse max-[780px]:min-w-[920px]">
                                <thead>
                                    <tr>
                                        {['User ID', 'Full Name', 'Email', 'Role', 'Status', 'Verified', 'Created At', 'Details'].map((heading) => (
                                            <th className="whitespace-nowrap border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-[18px] text-left text-[0.72rem] uppercase text-[#765c58]" key={heading}>
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">{user.id}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">
                                                <strong>{user.name}</strong>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">{user.email}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">
                                                <span className={`${badgeClass} ${roleClass[formatClass(user.role)]}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">
                                                <span className={`${badgeClass} ${statusClass[formatClass(user.status)]}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">
                                                <span className={`inline-grid h-[22px] w-[22px] place-items-center rounded-full ${user.verified ? 'text-[#0aa15f]' : 'text-[#d71920]'}`}>
                                                    {user.verified ? <FaCheck /> : <FaTimes />}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">{adminMockApi.formatters.toDateLabel(user.createdAt)}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">
                                                <button aria-label={`View details for ${user.name}`} className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border-0 bg-transparent text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]" onClick={() => setSelectedUser(user)} type="button">
                                                    <FaEye aria-hidden="true" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between gap-[18px] px-5 py-3.5 text-[0.82rem] font-bold text-[var(--admin-ink)] max-[780px]:flex-col max-[780px]:items-stretch">
                            <span>Showing {firstShown} - {lastShown} of {filteredUsers.length} entries</span>

                            <div className="flex items-center gap-2 max-[780px]:flex-wrap">
                                <label className="flex items-center gap-2">
                                    <span>Jump to:</span>
                                    <input className="h-[34px] w-12 rounded-md border border-[var(--admin-border)] px-2.5 text-center outline-0" inputMode="numeric" max={totalPages} min="1" onChange={(event) => setPage(Math.min(totalPages, Math.max(1, Number(event.target.value) || 1)))} value={page} />
                                </label>
                                <button aria-label="Previous page" className={paginationButtonClass} disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">
                                    <FaChevronLeft aria-hidden="true" />
                                </button>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                    <button
                                        className={`${paginationButtonClass} ${pageNumber === page ? 'bg-[var(--admin-primary)] text-white hover:text-white' : ''}`}
                                        key={pageNumber}
                                        onClick={() => setPage(pageNumber)}
                                        type="button"
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                                <button aria-label="Next page" className={paginationButtonClass} disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">
                                    <FaChevronRight aria-hidden="true" />
                                </button>
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
                                    <div>
                                        <h2 className="m-0 text-[1.35rem] leading-[1.15] text-[var(--admin-primary-dark)]">{selectedUser.name}</h2>
                                        <span className="mt-2 inline-flex text-[0.8rem] font-black text-[var(--admin-muted)]">{selectedUser.id}</span>
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
                                        <span className={`${badgeClass} w-fit ${roleClass[formatClass(selectedUser.role)]}`}>{selectedUser.role}</span>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#765c58]">Status</span>
                                        <span className={`${badgeClass} w-fit ${statusClass[formatClass(selectedUser.status)]}`}>{selectedUser.status}</span>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#765c58]">Verified</span>
                                        <strong className={selectedUser.verified ? 'text-[#0aa15f]' : 'text-[#d71920]'}>
                                            {selectedUser.verified ? 'Verified' : 'Not verified'}
                                        </strong>
                                    </div>
                                    <div className="grid gap-1 rounded-md bg-[#fff8f6] p-3">
                                        <span className="text-[0.7rem] font-black uppercase text-[#765c58]">Created At</span>
                                        <strong>{adminMockApi.formatters.toDateLabel(selectedUser.createdAt)}</strong>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    <footer className="mt-auto flex items-center justify-between gap-6 pt-[120px] text-[var(--admin-primary-dark)] max-[780px]:flex-col max-[780px]:items-stretch max-[780px]:pt-12">
                        <strong className="text-base font-black">Elite Racing League</strong>
                        <nav aria-label="Footer links" className="flex flex-wrap justify-end gap-7 max-[780px]:justify-start">
                            <a className="text-[0.76rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Terms of Service</a>
                            <a className="text-[0.76rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Privacy Policy</a>
                            <a className="text-[0.76rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Contact Support</a>
                            <a className="text-[0.76rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Racing Rules</a>
                        </nav>
                    </footer>
                </section>
        </AdminLayout>
    );
}

export default UserManagement;
