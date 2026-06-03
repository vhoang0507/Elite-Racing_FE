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

import AdminLayout from './AdminLayout';

const summaryCards = [
    {
        label: 'Total Users',
        value: '1,284',
        detail: 'All registered accounts',
        icon: FaUsers,
        tone: 'users',
    },
    {
        label: 'Pending Approval',
        value: '42',
        detail: 'Awaiting verification',
        icon: FaCalendarCheck,
        tone: 'pending',
    },
    {
        label: 'Reports Today',
        value: '08',
        detail: 'Requires attention',
        icon: FaExclamationTriangle,
        tone: 'reports',
    },
];

const managedUsers = [
    {
        id: 'AD0001',
        name: 'Julianne Abbott',
        email: 'j.abbott@regalracing.com',
        role: 'Admin',
        status: 'Active',
        verified: true,
        createdAt: 'Oct 12, 2023',
    },
    {
        id: 'HO0002',
        name: 'Beatrix Montgo',
        email: 'monty.stable@icloud.com',
        role: 'Horse Owner',
        status: 'Active',
        verified: true,
        createdAt: 'Nov 05, 2023',
    },
    {
        id: 'JO0006',
        name: 'Deniel Chen',
        email: 'd.chen@jockeyclub.org',
        role: 'Jockey',
        status: 'Pending',
        verified: false,
        createdAt: 'Jan 14, 2024',
    },
    {
        id: 'RE5502',
        name: 'Marcus Crawford',
        email: 'm.crawford@official.league',
        role: 'Referee',
        status: 'Active',
        verified: true,
        createdAt: 'Dec 22, 2023',
    },
    {
        id: 'SP0108',
        name: 'Lena Howard',
        email: 'l.howard@racefan.net',
        role: 'Spectator',
        status: 'Suspended',
        verified: false,
        createdAt: 'Feb 08, 2024',
    },
];

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

function UserManagement() {
    return (
        <AdminLayout activeKey="users" mainClassName="user-management-main">
                <section className={pageShellClass}>
                    <div className="flex items-center justify-between gap-5 max-[1180px]:flex-col max-[1180px]:items-stretch">
                        <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)]">
                            User Management
                        </h1>

                        <div className="flex items-center justify-end gap-2 max-[1180px]:justify-start max-[780px]:flex-col max-[780px]:items-stretch">
                            <label className="inline-flex h-[38px] items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.8rem] font-black text-[var(--admin-ink)] max-[780px]:w-full">
                                <span>Role:</span>
                                <select className={selectClass} defaultValue="all">
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
                                <select className={selectClass} defaultValue="all">
                                    <option value="all">All</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </label>

                            <button className="h-[38px] min-w-[92px] cursor-pointer rounded-md border-0 bg-[var(--admin-primary)] font-black text-white hover:bg-[var(--admin-primary-dark)] max-[780px]:w-full" type="button">Search</button>
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
                                    {managedUsers.map((user) => (
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
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">{user.createdAt}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">
                                                <button aria-label={`View details for ${user.name}`} className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border-0 bg-transparent text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]" type="button">
                                                    <FaEye aria-hidden="true" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between gap-[18px] px-5 py-3.5 text-[0.82rem] font-bold text-[var(--admin-ink)] max-[780px]:flex-col max-[780px]:items-stretch">
                            <span>Showing 1 - 5 of 1,284 entries</span>

                            <div className="flex items-center gap-2 max-[780px]:flex-wrap">
                                <label className="flex items-center gap-2">
                                    <span>Jump to:</span>
                                    <input className="h-[34px] w-12 rounded-md border border-[var(--admin-border)] px-2.5 text-center outline-0" defaultValue="1" inputMode="numeric" />
                                </label>
                                <button aria-label="Previous page" className={paginationButtonClass} type="button">
                                    <FaChevronLeft aria-hidden="true" />
                                </button>
                                <button className={`${paginationButtonClass} bg-[var(--admin-primary)] text-white hover:text-white`} type="button">1</button>
                                <button className={paginationButtonClass} type="button">2</button>
                                <button className={paginationButtonClass} type="button">3</button>
                                <span>...</span>
                                <button className={paginationButtonClass} type="button">257</button>
                                <button aria-label="Next page" className={paginationButtonClass} type="button">
                                    <FaChevronRight aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </section>

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
