import {
    Link,
} from 'react-router-dom';

import {
    FaBolt,
    FaChevronLeft,
    FaChevronRight,
    FaFlagCheckered,
    FaHorseHead,
    FaTrophy,
} from 'react-icons/fa';

import AdminLayout from './AdminLayout';

const submissions = [
    {
        slug: 'dubai-sprint-cup',
        race: 'Dubai Sprint Cup',
        detail: 'G1 Thoroughbred Sprint - Meydan',
        status: 'Referee Confirmed',
        tone: 'blue',
        icon: FaFlagCheckered,
    },
    {
        slug: 'royal-turf-championship',
        race: 'Royal Turf Championship',
        detail: 'Elite Oaks - Ascot Grounds',
        status: 'Draft',
        tone: 'gray',
        icon: FaHorseHead,
    },
    {
        slug: 'golden-derby-finals',
        race: 'Golden Derby Finals',
        detail: 'Triple Crown Leg 3 - Churchill',
        status: 'Admin Approved',
        tone: 'green',
        icon: FaTrophy,
    },
    {
        slug: 'night-thunder-race',
        race: 'Night Thunder Race',
        detail: 'Invitational Steeplechase - Hong Kong',
        status: 'Published',
        tone: 'red',
        icon: FaBolt,
    },
    {
        slug: 'mountain-horse-cup',
        race: 'Mountain Horse Cup',
        detail: 'Endurance Series - Alpine Trail',
        status: 'Returned',
        tone: 'orange',
        icon: FaHorseHead,
    },
];

const formatClass = (value) => value.toLowerCase().replace(/\s+/g, '-');

const pageShellClass = [
    '[--validate-soft-panel:#fff4f1]',
    '[--validate-table-head:#fff7f5]',
    'grid min-h-[calc(100vh-64px)] content-start gap-8 px-[52px] py-14 max-[820px]:px-5 max-[820px]:py-8',
].join(' ');

const panelWidthClass = 'w-[min(100%,1090px)]';

const raceIconClass = {
    blue: 'bg-[#dfe4ff] text-[#1c33d0]',
    gray: 'bg-[#f4dcd6] text-[#816b66]',
    green: 'bg-[#ffe070] text-[#7c6108]',
    red: 'bg-[#ffd9d4] text-[#8b1515]',
    orange: 'bg-[#f3dad4] text-[#775049]',
};

const statusClass = {
    'referee-confirmed': 'border-[#9ab8ff] bg-[#e7f0ff] text-[#1747c2]',
    draft: 'border-[#ddd6d3] bg-[#f7f5f4] text-[#6f6360]',
    'admin-approved': 'border-[#a7dfbf] bg-[#e8f8ef] text-[#1a7d49]',
    published: 'border-[#da7772] bg-[#ffe8e5] text-[#9d1515]',
    returned: 'border-[#ffc68f] bg-[#fff0e2] text-[#c4671e]',
};

const pageButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[0.78rem] font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]';

function ValidateResults() {
    return (
        <AdminLayout activeKey="results" mainClassName="validate-results-main">
                <section className={pageShellClass}>
                    <div className="max-w-[760px]">
                        <h1 className="m-0 text-[2rem] leading-[1.12] text-[var(--admin-primary-dark)] max-[820px]:text-[1.6rem]">
                            Validate Results
                        </h1>
                        <p className="mt-2 text-[0.95rem] font-semibold leading-[1.45] text-[var(--admin-muted)]">
                            Review referee-submitted race results before publishing to the public leaderboard and finalizing owner payouts.
                        </p>
                    </div>

                    <section
                        aria-label="Active submissions"
                        className={`${panelWidthClass} overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_16px_34px_rgba(100,36,28,0.06)]`}
                    >
                        <div className="flex min-h-[58px] items-center border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-6">
                            <h2 className="m-0 text-[1.04rem] font-black text-[var(--admin-ink)]">
                                Active Submissions
                            </h2>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse max-[820px]:min-w-[840px]">
                                <thead>
                                    <tr>
                                        <th className="border-b border-[var(--admin-border)] bg-[var(--validate-table-head)] px-6 py-[18px] pl-[78px] text-left text-[0.66rem] font-black uppercase tracking-normal text-[#7a5e59] max-[820px]:pl-6">
                                            Race Name
                                        </th>
                                        <th className="w-[260px] border-b border-[var(--admin-border)] bg-[var(--validate-table-head)] px-6 py-[18px] text-left text-[0.66rem] font-black uppercase tracking-normal text-[#7a5e59]">
                                            Status
                                        </th>
                                        <th className="w-60 border-b border-[var(--admin-border)] bg-[var(--validate-table-head)] px-6 py-[18px] text-center text-[0.66rem] font-black uppercase tracking-normal text-[#7a5e59]">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((submission) => {
                                        const Icon = submission.icon;

                                        return (
                                            <tr key={submission.race}>
                                                <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-6 py-[18px] pl-[78px] align-middle max-[820px]:pl-6">
                                                    <div className="flex min-w-80 items-center gap-4">
                                                        <span className={`grid h-9 w-9 flex-none place-items-center rounded-md ${raceIconClass[submission.tone]}`}>
                                                            <Icon aria-hidden="true" className="h-[17px] w-[17px]" />
                                                        </span>
                                                        <div>
                                                            <strong className="block text-[0.9rem] leading-[1.15] text-[var(--admin-ink)]">
                                                                {submission.race}
                                                            </strong>
                                                            <span className="mt-1 block text-[0.72rem] font-bold text-[#5f4b47]">
                                                                {submission.detail}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="w-[260px] whitespace-nowrap border-b border-[var(--admin-border)] px-6 py-[18px] align-middle">
                                                    <span className={`inline-flex min-h-6 items-center rounded-full border px-2.5 text-[0.66rem] font-extrabold ${statusClass[formatClass(submission.status)]}`}>
                                                        {submission.status}
                                                    </span>
                                                </td>
                                                <td className="w-60 whitespace-nowrap border-b border-[var(--admin-border)] px-6 py-[18px] text-center align-middle">
                                                    <Link
                                                        className="inline-flex min-h-[38px] min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--admin-gold)] bg-[#fffdf8] text-[0.82rem] font-extrabold text-[#7a570c] no-underline hover:bg-[var(--admin-gold)] hover:text-white"
                                                        to={`/admin/results/${submission.slug}`}
                                                    >
                                                        <span>View Details</span>
                                                        <FaChevronRight aria-hidden="true" className="h-3 w-3" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex min-h-16 items-center justify-between gap-[18px] px-6 py-3.5 text-[0.78rem] font-bold text-[var(--admin-muted)] max-[820px]:flex-col max-[820px]:items-stretch">
                            <span>Showing 1 to 5 of 24 results</span>

                            <div className="flex items-center gap-2 max-[820px]:flex-wrap">
                                <button aria-label="Previous page" className={pageButtonClass} type="button">
                                    <FaChevronLeft aria-hidden="true" className="h-2.5 w-2.5" />
                                </button>
                                <button className={`${pageButtonClass} border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary)]`} type="button">1</button>
                                <button className={pageButtonClass} type="button">2</button>
                                <button className={pageButtonClass} type="button">3</button>
                                <button aria-label="Next page" className={pageButtonClass} type="button">
                                    <FaChevronRight aria-hidden="true" className="h-2.5 w-2.5" />
                                </button>
                            </div>
                        </div>
                    </section>

                    <footer className={`${panelWidthClass} mt-24 flex items-center justify-between gap-6 text-[var(--admin-primary-dark)] max-[820px]:mt-12 max-[820px]:flex-col max-[820px]:items-stretch`}>
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

export default ValidateResults;
