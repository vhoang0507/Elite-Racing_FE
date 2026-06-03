import {
    FaCalendarAlt,
    FaCheck,
    FaClipboardCheck,
    FaEllipsisV,
    FaFlagCheckered,
    FaTimes,
    FaTrophy,
    FaUsers,
} from 'react-icons/fa';

import AdminLayout from './AdminLayout';

const stats = [
    {
        label: 'Total Users',
        value: '12,450',
        trend: '+8.4%',
        icon: FaUsers,
    },
    {
        label: 'Active Tournaments',
        value: '8',
        trend: '3 today',
        icon: FaTrophy,
    },
    {
        label: 'Pending Registrations',
        value: '142',
        trend: '24 urgent',
        icon: FaClipboardCheck,
    },
    {
        label: 'Pending Results',
        value: '36',
        trend: '6 disputed',
        icon: FaFlagCheckered,
    },
];

const tournaments = [
    {
        name: 'Royal Ascot Derby',
        class: 'Class 1 Flat',
        date: 'Jun 18, 2026',
        entries: '24/30',
        status: 'Published',
    },
    {
        name: 'Dubai World Cup',
        class: 'Group 1 Flat',
        date: 'Mar 30, 2026',
        entries: '12/20',
        status: 'Open',
    },
    {
        name: 'Kentucky Derby Prep',
        class: 'Grade II Stakes',
        date: 'Apr 15, 2026',
        entries: '0/40',
        status: 'Draft',
    },
    {
        name: 'Melbourne Cup Qualifier',
        class: 'Handicap',
        date: 'Nov 05, 2026',
        entries: '18/24',
        status: 'Published',
    },
];

const approvals = [
    {
        name: 'Julian Mercer',
        role: 'Horse Owner',
        request: 'New horse registration',
        progress: 85,
        avatar: 'JM',
    },
    {
        name: 'Clara Schmidt',
        role: 'Jockey',
        request: 'License renewal',
        progress: 40,
        avatar: 'CS',
    },
    {
        name: 'Minh Tran',
        role: 'Referee',
        request: 'Race assignment access',
        progress: 68,
        avatar: 'MT',
    },
];

const users = [
    {
        name: 'Mark Vance',
        role: 'Jockey',
        avatar: 'MV',
        className: 'jockey',
    },
    {
        name: 'Elena Rossi',
        role: 'Horse Owner',
        avatar: 'ER',
        className: 'owner',
    },
    {
        name: 'James Thorne',
        role: 'Admin',
        avatar: 'JT',
        className: 'admin',
    },
    {
        name: 'Sarah Chen',
        role: 'Referee',
        avatar: 'SC',
        className: 'referee',
    },
    {
        name: 'Robert King',
        role: 'Spectator',
        avatar: 'RK',
        className: 'spectator',
    },
];

const pageShellClass = 'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';
const headingClass = 'flex items-center justify-between gap-[18px] max-[720px]:flex-col max-[720px]:items-stretch';
const quietButtonClass = 'inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-[9px] rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3.5 font-extrabold text-[var(--admin-primary)] transition-colors duration-200 hover:bg-[#fff0ed]';
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
    published: 'border-[#e8b6ad] bg-[#fbe5e1] text-[var(--admin-primary-dark)]',
    open: 'border-[#e2cd79] bg-[#f7efcf] text-[#6a520d]',
    draft: 'border-[#e0beb2] bg-[#f2ded7] text-[#7b4c42]',
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

function AdminDashboard() {
    return (
        <AdminLayout activeKey="dashboard" searchPlaceholder="Search users, horses, races...">
                <section className={pageShellClass}>
                    <div className={headingClass}>
                        <div>
                            <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[720px]:text-[1.6rem]">
                                Dashboard Overview
                            </h1>
                            <p className="mb-0 mt-1.5 font-[650] text-[var(--admin-muted)]">
                                Today: June 2, 2026
                            </p>
                        </div>
                        <button className={quietButtonClass} type="button">
                            <FaCalendarAlt aria-hidden="true" />
                            <span>June report</span>
                        </button>
                    </div>

                    <section aria-label="Summary statistics" className="grid grid-cols-4 gap-5 max-[1280px]:grid-cols-2 max-[720px]:grid-cols-1">
                        {stats.map((stat) => {
                            const Icon = stat.icon;

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

                    <section className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-7 max-[1280px]:grid-cols-1">
                        <div className={panelClass}>
                            <div className={sectionHeadClass}>
                                <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Manage Tournaments</h2>
                                <button className={sectionActionClass} type="button">View all</button>
                            </div>

                            <div className="w-full overflow-x-auto">
                                <table className="w-full border-collapse max-[720px]:min-w-[720px]">
                                    <thead>
                                        <tr>
                                            <th className={tableHeadClass}>Tournament name</th>
                                            <th className={tableHeadClass}>Date</th>
                                            <th className={tableHeadClass}>Entries</th>
                                            <th className={tableHeadClass}>Status</th>
                                            <th className={`${tableHeadClass} text-right`}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tournaments.map((tournament, index) => {
                                            const isLast = index === tournaments.length - 1;

                                            return (
                                            <tr key={tournament.name}>
                                                <td className={tableCellClass(isLast)}>
                                                    <strong className="block">{tournament.name}</strong>
                                                    <span className="mt-1 block text-[var(--admin-muted)]">{tournament.class}</span>
                                                </td>
                                                <td className={tableCellClass(isLast)}>{tournament.date}</td>
                                                <td className={tableCellClass(isLast)}>{tournament.entries}</td>
                                                <td className={tableCellClass(isLast)}>
                                                    <span className={`inline-flex min-h-6 items-center rounded-[5px] border px-2 text-[0.74rem] font-extrabold ${statusClass[tournament.status.toLowerCase()]}`}>
                                                        {tournament.status}
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

                        <aside className={`${panelClass} self-stretch`}>
                            <div className={sectionHeadClass}>
                                <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Approval Queue</h2>
                                <span className={sectionActionClass}>8 New</span>
                            </div>

                            <div className="grid gap-3.5 p-[18px]">
                                {approvals.map((approval) => (
                                    <article className="grid gap-3 rounded-lg border border-[var(--admin-border)] bg-[#fffdfc] p-3.5" key={approval.name}>
                                        <div className="flex items-center gap-3">
                                            <div className={`${avatarBaseClass} ${avatarClass.default}`}>{approval.avatar}</div>
                                            <div>
                                                <strong className="block text-[var(--admin-ink)]">{approval.name}</strong>
                                                <span className="block text-[0.72rem] font-black uppercase leading-[1.25] text-[var(--admin-primary)]">{approval.role}</span>
                                                <small className="block leading-[1.25] text-[var(--admin-muted)]">{approval.request}</small>
                                            </div>
                                        </div>

                                        <div className="flex justify-between gap-3 text-[0.72rem] font-extrabold text-[var(--admin-muted)]">
                                            <span>Verification</span>
                                            <strong>{approval.progress}%</strong>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-[#f2ded7]">
                                            <span
                                                className="block h-full rounded-[inherit] bg-[linear-gradient(90deg,var(--admin-primary),var(--admin-gold))]"
                                                style={{ width: `${approval.progress}%` }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button className="inline-flex min-h-[34px] cursor-pointer items-center justify-center gap-[7px] rounded-md bg-[var(--admin-primary)] text-[0.78rem] font-[850] text-white" type="button">
                                                <FaCheck aria-hidden="true" />
                                                <span>Approve</span>
                                            </button>
                                            <button className="inline-flex min-h-[34px] cursor-pointer items-center justify-center gap-[7px] rounded-md border border-[#d89288] bg-white text-[0.78rem] font-[850] text-[var(--admin-primary)]" type="button">
                                                <FaTimes aria-hidden="true" />
                                                <span>Reject</span>
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </aside>
                    </section>

                    <section className="grid grid-cols-1 gap-7">
                        <div className={panelClass}>
                            <div className={sectionHeadClass}>
                                <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Users</h2>
                                <button className={sectionActionClass} type="button">View all</button>
                            </div>

                            <div className="grid grid-cols-5 gap-3.5 overflow-x-auto p-[18px] [grid-template-columns:repeat(5,minmax(118px,1fr))]">
                                {users.map((user) => (
                                    <article className="grid min-w-[118px] justify-items-center gap-[7px] rounded-lg border border-[var(--admin-border)] bg-[#fffdfc] px-2.5 py-4 text-center" key={user.name}>
                                        <div className={`${avatarBaseClass} ${avatarClass[user.className]}`}>
                                            {user.avatar}
                                        </div>
                                        <strong className="block text-[0.9rem] text-[var(--admin-ink)]">{user.name}</strong>
                                        <span className="text-[0.78rem] font-bold text-[var(--admin-muted)]">{user.role}</span>
                                        <button className="min-h-6 cursor-pointer rounded-full bg-[#ffe8e4] px-[9px] text-[0.68rem] font-[850] text-[var(--admin-primary)]" type="button">Details</button>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                </section>
        </AdminLayout>
    );
}

export default AdminDashboard;
