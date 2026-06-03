import {
    FaBolt,
    FaCheckCircle,
    FaClipboardList,
    FaEdit,
    FaEye,
    FaFilter,
    FaMapMarkerAlt,
    FaSortAmountDown,
    FaTrashAlt,
} from 'react-icons/fa';

import horseRacing from '../../assets/horse-racing.jpg';

import AdminLayout from './AdminLayout';

const stats = [
    {
        label: 'Total Tournaments',
        value: '24',
        marker: 'YTD',
        tone: 'total',
        icon: FaClipboardList,
    },
    {
        label: 'Active Tournaments',
        value: '8',
        marker: 'Live',
        tone: 'active',
        icon: FaBolt,
    },
    {
        label: 'Draft Tournaments',
        value: '5',
        marker: 'Pending',
        tone: 'draft',
        icon: FaEdit,
    },
    {
        label: 'Completed Tournaments',
        value: '11',
        marker: 'History',
        tone: 'completed',
        icon: FaCheckCircle,
    },
];

const tournaments = [
    {
        name: 'Dubai Sprint Cup',
        timeline: ['12 Jun - 14', 'Jun', '2026'],
        location: 'Dubai',
        maxHorses: '10',
        prize: '$120,000',
        status: 'Active',
        imagePosition: '20% center',
    },
    {
        name: 'Royal Turf Championship',
        timeline: ['20 Jul - 22', 'Jul', '2026'],
        location: 'London',
        maxHorses: '12',
        prize: '$200,000',
        status: 'Draft',
        imagePosition: '45% center',
    },
    {
        name: 'Golden Derby',
        timeline: ['05 Aug -', '06 Aug', '2026'],
        location: 'Texas',
        maxHorses: '8',
        prize: '$90,000',
        status: 'Completed',
        imagePosition: '62% center',
    },
    {
        name: 'Mountain Horse Cup',
        timeline: ['18 Sep - 19', 'Sep', '2026'],
        location: 'Colorado',
        maxHorses: '10',
        prize: '$150,000',
        status: 'Cancelled',
        imagePosition: '80% center',
    },
];

const formatClass = (value) => value.toLowerCase();

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 pb-7 pt-11 max-[820px]:px-5 max-[820px]:py-7';

const statClass = {
    total: {
        accent: 'before:bg-[var(--admin-primary)]',
        soft: 'bg-[#fff1ef]',
        ink: 'text-[var(--admin-primary)]',
    },
    active: {
        accent: 'before:bg-[#23cb74]',
        soft: 'bg-[#e8fff2]',
        ink: 'text-[#119b54]',
    },
    draft: {
        accent: 'before:bg-[#9b7771]',
        soft: 'bg-[#f7eeee]',
        ink: 'text-[#7d615c]',
    },
    completed: {
        accent: 'before:bg-[#2657d8]',
        soft: 'bg-[#eef3ff]',
        ink: 'text-[#2657d8]',
    },
};

const statusClass = {
    active: 'border-[#afe2c4] bg-[#dff7e9] text-[#118548]',
    draft: 'border-[#dbc3bf] bg-[#f3e8e6] text-[#7f645f]',
    completed: 'border-[#dbaaa5] bg-[#f5e1df] text-[var(--admin-primary-dark)]',
    cancelled: 'border-[#f5b8bf] bg-[#ffe5e7] text-[#c3222c]',
};

const filterSelectClass = 'h-full w-full min-w-0 cursor-pointer border-0 bg-transparent p-0 text-[0.8rem] font-extrabold text-[#5b403c] outline-0';
const paginationButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]';

function RaceManagement() {
    return (
        <AdminLayout activeKey="races" mainClassName="race-management-main">
                <section className={pageShellClass}>
                    <div>
                        <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[820px]:text-[1.6rem]">
                            Race Management
                        </h1>
                        <p className="mt-2 text-[0.92rem] font-semibold text-[var(--admin-muted)]">
                            Create and manage horse racing tournaments and race conditions.
                        </p>
                    </div>

                    <section aria-label="Tournament summary" className="grid grid-cols-4 gap-7 max-[1280px]:grid-cols-2 max-[820px]:grid-cols-1">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            const tone = statClass[stat.tone];

                            return (
                                <article
                                    className={`relative grid min-h-[136px] content-start gap-3 overflow-hidden rounded-[var(--admin-radius)] bg-[var(--admin-surface)] px-[22px] py-5 shadow-[0_14px_32px_rgba(81,31,22,0.07)] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[5px] before:content-[''] ${tone.accent}`}
                                    key={stat.label}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span className={`grid h-[34px] w-[34px] place-items-center rounded-lg ${tone.soft} ${tone.ink}`}>
                                            <Icon aria-hidden="true" />
                                        </span>
                                        <small className={`text-[0.66rem] font-black ${tone.ink}`}>{stat.marker}</small>
                                    </div>
                                    <span className="text-[0.82rem] font-extrabold text-[#6e5550]">{stat.label}</span>
                                    <strong className="text-[2rem] leading-none text-[var(--admin-ink)]">{stat.value}</strong>
                                </article>
                            );
                        })}
                    </section>

                    <section className="overflow-hidden rounded-[var(--admin-radius)] bg-[var(--admin-surface)] shadow-[0_14px_32px_rgba(81,31,22,0.07)]">
                        <div className="flex min-h-[76px] items-center justify-between gap-[18px] border-b border-[var(--admin-border)] px-[22px] py-[18px] max-[1280px]:flex-col max-[1280px]:items-stretch">
                            <h2 className="m-0 text-[1.1rem] text-[var(--admin-ink)]">All Tournaments</h2>

                            <div className="flex items-center justify-end gap-2.5 max-[1280px]:justify-start max-[820px]:flex-col max-[820px]:items-stretch">
                                <label className="flex h-[38px] w-[180px] items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-2.5 text-[#8a6b66] max-[820px]:w-full">
                                    <FaFilter aria-hidden="true" />
                                    <select className={filterSelectClass} defaultValue="all">
                                        <option value="all">Status: All</option>
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </label>

                                <label className="flex h-[38px] w-[180px] items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-2.5 text-[#8a6b66] max-[820px]:w-full">
                                    <FaSortAmountDown aria-hidden="true" />
                                    <select className={filterSelectClass} defaultValue="newest">
                                        <option value="newest">Sort: Newest First</option>
                                        <option value="oldest">Sort: Oldest First</option>
                                        <option value="prize">Sort: Prize Pool</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse max-[820px]:min-w-[980px]">
                                <thead>
                                    <tr>
                                        {['Tournament Name', 'Timeline', 'Location', 'Max Horses', 'Prize Pool', 'Status', 'Actions'].map((heading) => (
                                            <th className="whitespace-nowrap border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[18px] text-left text-[0.68rem] uppercase tracking-normal text-[#8b6e68]" key={heading}>
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tournaments.map((tournament) => (
                                        <tr key={tournament.name}>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <div className="flex min-w-[230px] items-center gap-3.5">
                                                    <img
                                                        alt=""
                                                        className="h-12 w-12 flex-none rounded-md object-cover"
                                                        src={horseRacing}
                                                        style={{ objectPosition: tournament.imagePosition }}
                                                    />
                                                    <strong className="max-w-[180px] whitespace-normal leading-[1.15] text-[var(--admin-ink)]">{tournament.name}</strong>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <div className="grid leading-[1.15]">
                                                    {tournament.timeline.map((line, index) => (
                                                        <span className={index === tournament.timeline.length - 1 ? 'mt-0.5 text-[0.7rem] font-extrabold text-[#9a817c]' : ''} key={line}>{line}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FaMapMarkerAlt aria-hidden="true" className="text-[var(--admin-primary)]" />
                                                    {tournament.location}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">{tournament.maxHorses}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <strong className="text-[0.95rem] text-[var(--admin-primary-dark)]">{tournament.prize}</strong>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <span className={`inline-flex min-h-6 items-center rounded border px-2.5 text-[0.68rem] font-black uppercase ${statusClass[formatClass(tournament.status)]}`}>
                                                    {tournament.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <div className="inline-flex items-center gap-3.5">
                                                    <button aria-label={`View ${tournament.name}`} className="grid h-7 w-7 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" type="button">
                                                        <FaEye aria-hidden="true" />
                                                    </button>
                                                    <button aria-label={`Edit ${tournament.name}`} className="grid h-7 w-7 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" type="button">
                                                        <FaEdit aria-hidden="true" />
                                                    </button>
                                                    <button aria-label={`Delete ${tournament.name}`} className="grid h-7 w-7 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" type="button">
                                                        <FaTrashAlt aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex min-h-[68px] items-center justify-between gap-[18px] px-[22px] py-4 text-[0.82rem] font-bold text-[var(--admin-muted)] max-[820px]:flex-col max-[820px]:items-stretch">
                            <span>Showing 1 - 4 of 24 tournaments</span>

                            <div className="flex items-center gap-2 max-[820px]:flex-wrap">
                                <button aria-label="Previous page" className={paginationButtonClass} type="button">&lt;</button>
                                <button className={`${paginationButtonClass} border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary)]`} type="button">1</button>
                                <button className={paginationButtonClass} type="button">2</button>
                                <button className={paginationButtonClass} type="button">3</button>
                                <button aria-label="Next page" className={paginationButtonClass} type="button">&gt;</button>
                            </div>
                        </div>
                    </section>

                    <footer className="mt-[132px] flex items-center justify-between gap-6 text-[var(--admin-primary-dark)] max-[820px]:mt-12 max-[820px]:flex-col max-[820px]:items-stretch">
                        <strong className="text-base font-black">Elite Racing League</strong>
                        <nav aria-label="Footer links" className="flex flex-wrap justify-end gap-7 max-[820px]:justify-start">
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

export default RaceManagement;
