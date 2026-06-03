import {
    FaCalendarCheck,
    FaEllipsisV,
    FaExclamationTriangle,
    FaHorseHead,
    FaSearch,
    FaTrashAlt,
} from 'react-icons/fa';

import horseRacing from '../../assets/horse-racing.jpg';

import AdminLayout from './AdminLayout';

const horseStats = [
    {
        label: 'Total Horses',
        value: '248',
        icon: FaHorseHead,
        tone: 'total',
    },
    {
        label: 'Pending Approval',
        value: '18',
        icon: FaCalendarCheck,
        tone: 'pending',
    },
    {
        label: 'Reported Horses',
        value: '07',
        icon: FaExclamationTriangle,
        tone: 'reported',
    },
];

const horses = [
    {
        name: 'Midnight Star',
        breed: 'Thoroughbred',
        ageWeight: '5 yrs / 520 kg',
        owner: 'Michael Carter',
        approval: 'Approved',
    },
    {
        name: 'Gold Rush',
        breed: 'Arabian',
        ageWeight: '3 yrs / 500 kg',
        owner: 'Emma Wilson',
        approval: 'Pending',
    },
    {
        name: 'Silver Ghost',
        breed: 'Thoroughbred',
        ageWeight: '4 yrs / 530 kg',
        owner: 'Emma Wilson',
        approval: 'Rejected',
    },
    {
        name: 'Prairie Rose',
        breed: 'Quarter Horse',
        ageWeight: '5 yrs / 540 kg',
        owner: 'Emma Wilson',
        approval: 'Approved',
    },
];

const reports = [
    {
        horse: 'Desert Thunder (H-102)',
        reporter: 'Referee Johnathan Vance',
        severity: 'High Severity',
        reason: 'Potential health discrepancy in pre-race logs. Significant weight variation detected since registration. Requires immediate veterinary verification.',
    },
    {
        horse: 'Silver Comet (H-115)',
        reporter: 'Steward Sarah Jenkins',
        severity: 'Medium Severity',
        reason: "Inconsistent microchip scan during morning exercise. Identification needs re-authentication before tomorrow's qualification round.",
    },
];

const formatClass = (value) => value.toLowerCase().replace(/\s+/g, '-');

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 py-10 max-[860px]:px-5 max-[860px]:py-7';

const summaryClass = {
    total: {
        icon: 'bg-[#ffe8e4] text-[var(--admin-primary)]',
        border: 'before:bg-[var(--admin-primary)]',
    },
    pending: {
        icon: 'bg-[#fff3ce] text-[#8a6209]',
        border: 'before:bg-[#d49a15]',
    },
    reported: {
        icon: 'bg-[#ffe3df] text-[#d71920]',
        border: 'before:bg-[#d71920]',
    },
};

const approvalClass = {
    approved: 'border-[#a7dfbf] bg-[#e8f7ee] text-[#16864f]',
    pending: 'border-[#efd06a] bg-[#fff7db] text-[#a17809]',
    rejected: 'border-[#e7a49a] bg-[#ffe8e4] text-[var(--admin-primary)]',
};

const severityClass = {
    high: 'border-[#e8897d] bg-[#ffe8e4] text-[var(--admin-primary)]',
    medium: 'border-[#e2cd79] bg-[#fff5d3] text-[#8a6209]',
};

const selectClass = 'h-[38px] min-w-[142px] cursor-pointer rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.78rem] font-bold text-[#5f4b47] outline-0';
const pageButtonClass = 'min-h-[34px] cursor-pointer rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]';

function HorseManagement() {
    return (
        <AdminLayout activeKey="horses" mainClassName="horse-management-main">
                <section className={pageShellClass}>
                    <div>
                        <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[860px]:text-[1.6rem]">
                            Horse Management
                        </h1>
                        <p className="mt-2 text-[0.92rem] font-semibold text-[var(--admin-muted)]">
                            Manage horse records, registration approvals, and referee reports.
                        </p>
                    </div>

                    <section aria-label="Horse management summary" className="grid grid-cols-3 gap-7 max-[1180px]:grid-cols-1">
                        {horseStats.map((stat) => {
                            const Icon = stat.icon;
                            const tone = summaryClass[stat.tone];

                            return (
                                <article className={`relative flex min-h-[138px] items-start justify-between overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-6 py-6 shadow-[0_14px_30px_rgba(91,26,19,0.05)] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:content-[''] ${tone.border}`} key={stat.label}>
                                    <div>
                                        <span className="block text-[0.78rem] font-black uppercase text-[#765c58]">{stat.label}</span>
                                        <strong className="mt-3 block text-[2.4rem] leading-none text-[var(--admin-primary-dark)]">{stat.value}</strong>
                                    </div>
                                    <span className={`grid h-10 w-10 place-items-center rounded-lg ${tone.icon}`}>
                                        <Icon aria-hidden="true" />
                                    </span>
                                </article>
                            );
                        })}
                    </section>

                    <section className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--admin-border)] bg-[#fff4f1] px-5 py-4">
                            <label className="flex h-[38px] min-w-[220px] flex-1 items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[#826661]">
                                <FaSearch aria-hidden="true" />
                                <input className="h-full w-full min-w-0 border-0 bg-transparent p-0 text-[0.78rem] text-[var(--admin-ink)] outline-0" placeholder="Search horses..." type="search" />
                            </label>

                            <select className={selectClass} defaultValue="all-breeds">
                                <option value="all-breeds">All Breeds</option>
                                <option value="thoroughbred">Thoroughbred</option>
                                <option value="arabian">Arabian</option>
                                <option value="quarter-horse">Quarter Horse</option>
                            </select>

                            <select className={selectClass} defaultValue="health">
                                <option value="health">Health Status</option>
                                <option value="cleared">Cleared</option>
                                <option value="review">Needs Review</option>
                            </select>

                            <select className={selectClass} defaultValue="registration">
                                <option value="registration">Reg Status</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            <select className={selectClass} defaultValue="report">
                                <option value="report">Report Status</option>
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>

                            <select className={selectClass} defaultValue="newest">
                                <option value="newest">Sort by: Newest</option>
                                <option value="oldest">Sort by: Oldest</option>
                            </select>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse max-[860px]:min-w-[820px]">
                                <thead>
                                    <tr>
                                        {['Horse & Breed', 'Age/Weight', 'Owner', 'Approval', 'Details'].map((heading) => (
                                            <th className="whitespace-nowrap border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[18px] text-left text-[0.72rem] uppercase text-[#765c58]" key={heading}>
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {horses.map((horse, index) => (
                                        <tr key={horse.name}>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                <div className="flex min-w-[220px] items-center gap-3">
                                                    <img
                                                        alt=""
                                                        className="h-11 w-11 flex-none rounded-md object-cover"
                                                        src={horseRacing}
                                                        style={{ objectPosition: `${35 + index * 15}% center` }}
                                                    />
                                                    <div>
                                                        <strong className="block text-[var(--admin-ink)]">{horse.name}</strong>
                                                        <span className="mt-1 block text-[0.74rem] font-bold text-[var(--admin-muted)]">{horse.breed}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">{horse.ageWeight}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">{horse.owner}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                <span className={`inline-flex min-h-6 items-center rounded border px-2.5 text-[0.68rem] font-black uppercase ${approvalClass[formatClass(horse.approval)]}`}>
                                                    {horse.approval}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                <button aria-label={`Open details for ${horse.name}`} className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md bg-transparent text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]" type="button">
                                                    <FaEllipsisV aria-hidden="true" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex min-h-[62px] items-center justify-between gap-[18px] px-5 py-3.5 text-[0.82rem] font-bold text-[var(--admin-muted)] max-[860px]:flex-col max-[860px]:items-stretch">
                            <span>Showing 2 of 248 horses</span>
                            <div className="flex items-center gap-2">
                                <button className={pageButtonClass} type="button">Previous</button>
                                <button className={`${pageButtonClass} bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary)]`} type="button">1</button>
                                <button className={pageButtonClass} type="button">2</button>
                                <button className={pageButtonClass} type="button">Next</button>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-5">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="m-0 inline-flex items-center gap-2 text-[1.15rem] text-[var(--admin-primary-dark)]">
                                <FaExclamationTriangle aria-hidden="true" />
                                <span>Reported Horses Requiring Review</span>
                            </h2>
                            <button className="cursor-pointer rounded-full bg-[#ffe8e4] px-3 py-1.5 text-[0.72rem] font-black uppercase text-[var(--admin-primary)] hover:bg-[#ffd8d2]" type="button">View all</button>
                        </div>

                        <div className="grid grid-cols-2 gap-5 max-[1180px]:grid-cols-1">
                            {reports.map((report) => (
                                <article className="grid gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-[0_14px_30px_rgba(91,26,19,0.05)]" key={report.horse}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="m-0 text-base text-[var(--admin-ink)]">{report.horse}</h3>
                                            <span className="mt-1 block text-[0.78rem] font-bold text-[var(--admin-muted)]">Reported by: {report.reporter}</span>
                                        </div>
                                        <strong className={`rounded border px-2.5 py-1 text-[0.66rem] font-black uppercase ${severityClass[report.severity.toLowerCase().split(' ')[0]]}`}>
                                            {report.severity}
                                        </strong>
                                    </div>

                                    <div className="rounded-md bg-[#fff8f6] p-4">
                                        <span className="text-[0.68rem] font-black uppercase text-[#765c58]">Reason for report</span>
                                        <p className="mt-2 text-[0.84rem] font-semibold leading-[1.5] text-[#5f4b47]">{report.reason}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button className="min-h-[36px] cursor-pointer rounded-md bg-[var(--admin-primary)] px-3 font-black text-white hover:bg-[var(--admin-primary-dark)]" type="button">Review Report</button>
                                        <button className="min-h-[36px] cursor-pointer rounded-md border border-[#d89288] bg-white px-3 font-black text-[var(--admin-primary)] hover:bg-[#fff0ed]" type="button">Suspend Temporarily</button>
                                        <button aria-label={`Delete report for ${report.horse}`} className="grid h-9 w-9 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" type="button">
                                            <FaTrashAlt aria-hidden="true" />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <footer className="mt-16 flex items-center justify-between gap-6 text-[var(--admin-primary-dark)] max-[860px]:flex-col max-[860px]:items-stretch">
                        <strong className="text-base font-black">Elite Racing League</strong>
                        <nav aria-label="Footer links" className="flex flex-wrap justify-end gap-7 max-[860px]:justify-start">
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

export default HorseManagement;
