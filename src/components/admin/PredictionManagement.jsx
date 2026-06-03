import {
    FaBan,
    FaCalendarAlt,
    FaChevronDown,
    FaEdit,
    FaRegChartBar,
    FaSearch,
    FaSortAmountDown,
    FaSquare,
    FaTrophy,
} from 'react-icons/fa';

import horseRacing from '../../assets/horse-racing.jpg';

import AdminLayout from './AdminLayout';

const summaryCards = [
    {
        label: 'Total Predictions',
        value: '12,580',
        icon: FaRegChartBar,
    },
    {
        label: 'Active Events',
        value: '14',
        icon: FaCalendarAlt,
    },
    {
        label: 'Most Predicted',
        value: 'Desert Thunder',
        icon: FaSquare,
    },
];

const predictions = [
    {
        tournament: 'Royal Ascot Classic',
        spectator: 'Royal Ascot Classic',
        horse: 'Desert Thunder',
        status: 'Publish',
        imagePosition: '26% center',
    },
    {
        tournament: 'Dubai World Cup',
        spectator: 'Dubai World Cup',
        horse: 'Silver Streak',
        status: 'Draft',
        imagePosition: '50% center',
    },
    {
        tournament: 'Kentucky Derby',
        spectator: 'Kentucky Derby',
        horse: 'Midnight Star',
        status: 'Draft',
        imagePosition: '76% center',
    },
];

const topPredicted = [
    {
        horse: 'Night Fury',
        count: '1,500 predictions',
        rank: '2',
        tone: 'silver',
        imagePosition: '18% center',
    },
    {
        horse: 'Desert Thunder',
        count: '2,500 predictions',
        rank: '1',
        tone: 'gold',
        imagePosition: '42% center',
    },
    {
        horse: 'Storm Chaser',
        count: '1,200 predictions',
        rank: '3',
        tone: 'bronze',
        imagePosition: '68% center',
    },
];

const formatClass = (value) => value.toLowerCase();

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 py-10 max-[820px]:px-5 max-[820px]:py-7';
const panelClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]';
const panelTitleClass = 'flex min-h-[58px] items-center border-b border-[var(--admin-border)] px-[22px]';
const selectFieldClass = 'flex h-[42px] items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[#80625d]';
const selectClass = 'h-full w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent text-[0.8rem] font-bold text-[#5f4b47] outline-0';
const statusClass = {
    publish: 'bg-[#e8f7ee] text-[#16864f] before:bg-[#16864f]',
    draft: 'bg-[#fff7db] text-[#a17809] before:bg-[#a17809]',
};
const rankClass = {
    gold: 'bg-[#ffd85a] text-[#7b5a05]',
    silver: 'bg-[#e7e9ee] text-[#5f697a]',
    bronze: 'bg-[#f3c29a] text-[#79430c]',
};

function PredictionManagement() {
    return (
        <AdminLayout activeKey="predictions" mainClassName="prediction-management-main">
                <section className={pageShellClass}>
                    <div>
                        <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[820px]:text-[1.6rem]">
                            Prediction Management
                        </h1>
                    </div>

                    <section aria-label="Prediction summary" className="grid grid-cols-3 gap-7 max-[1180px]:grid-cols-1">
                        {summaryCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <article className="flex min-h-[132px] items-start justify-between rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-6 py-6 shadow-[0_14px_30px_rgba(91,26,19,0.05)]" key={card.label}>
                                    <div>
                                        <span className="block text-[0.76rem] font-black uppercase text-[#765c58]">{card.label}</span>
                                        <strong className="mt-3 block text-[2rem] leading-none text-[var(--admin-primary-dark)]">{card.value}</strong>
                                    </div>
                                    <Icon aria-hidden="true" className="h-7 w-7 text-[var(--admin-primary)]" />
                                </article>
                            );
                        })}
                    </section>

                    <section className="grid grid-cols-[minmax(220px,1fr)_190px_170px_170px_96px] gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[#fff4f1] p-4 max-[1180px]:grid-cols-2 max-[820px]:grid-cols-1">
                        <label className="flex h-[42px] items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[#80625d]">
                            <FaSearch aria-hidden="true" />
                            <input className="h-full w-full min-w-0 border-0 bg-transparent p-0 text-[0.8rem] text-[var(--admin-ink)] outline-0" placeholder="Search horse or tournament..." type="search" />
                        </label>

                        <label className={selectFieldClass}>
                            <select className={selectClass} defaultValue="all-tournaments">
                                <option value="all-tournaments">All Tournaments</option>
                                <option value="ascot">Royal Ascot Classic</option>
                                <option value="dubai">Dubai World Cup</option>
                                <option value="kentucky">Kentucky Derby</option>
                            </select>
                            <FaChevronDown aria-hidden="true" />
                        </label>

                        <label className={selectFieldClass}>
                            <select className={selectClass} defaultValue="all-status">
                                <option value="all-status">Status: All</option>
                                <option value="publish">Publish</option>
                                <option value="draft">Draft</option>
                            </select>
                            <FaChevronDown aria-hidden="true" />
                        </label>

                        <label className={selectFieldClass}>
                            <select className={selectClass} defaultValue="all-accuracy">
                                <option value="all-accuracy">Accuracy: Any</option>
                                <option value="high">High Accuracy</option>
                                <option value="medium">Medium Accuracy</option>
                            </select>
                            <FaChevronDown aria-hidden="true" />
                        </label>

                        <button className="inline-flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-md bg-[var(--admin-primary)] px-3 font-black text-white hover:bg-[var(--admin-primary-dark)]" type="button">
                            <FaSortAmountDown aria-hidden="true" />
                            <span>Sort</span>
                        </button>
                    </section>

                    <section className={panelClass}>
                        <div className={panelTitleClass}>
                            <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Active &amp; Recent Predictions</h2>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse max-[820px]:min-w-[760px]">
                                <thead>
                                    <tr>
                                        {['Tournament', 'Spectator', 'Predictions', 'Status', 'Actions'].map((heading) => (
                                            <th className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[18px] text-left text-[0.7rem] uppercase text-[#765c58]" key={heading}>
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {predictions.map((prediction) => (
                                        <tr key={`${prediction.tournament}-${prediction.horse}`}>
                                            <td className="border-b border-[var(--admin-border)] px-[22px] py-[18px] text-[0.9rem] font-bold text-[var(--admin-ink)]">{prediction.tournament}</td>
                                            <td className="border-b border-[var(--admin-border)] px-[22px] py-[18px] text-[0.9rem] font-bold text-[var(--admin-ink)]">{prediction.spectator}</td>
                                            <td className="border-b border-[var(--admin-border)] px-[22px] py-[18px] text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        alt=""
                                                        className="h-10 w-10 rounded-md object-cover"
                                                        src={horseRacing}
                                                        style={{ objectPosition: prediction.imagePosition }}
                                                    />
                                                    <span>{prediction.horse}</span>
                                                </div>
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-[22px] py-[18px] text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                <span className={`relative inline-flex min-h-6 items-center rounded px-2.5 pl-5 text-[0.68rem] font-black uppercase before:absolute before:left-2 before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${statusClass[formatClass(prediction.status)]}`}>
                                                    {prediction.status}
                                                </span>
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-[22px] py-[18px] text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                <div className="inline-flex items-center gap-3">
                                                    <button aria-label={`View analytics for ${prediction.horse}`} className="grid h-8 w-8 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" type="button">
                                                        <FaRegChartBar aria-hidden="true" />
                                                    </button>
                                                    <button aria-label={`Edit prediction for ${prediction.horse}`} className="grid h-8 w-8 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" type="button">
                                                        <FaEdit aria-hidden="true" />
                                                    </button>
                                                    <button aria-label={`Disable prediction for ${prediction.horse}`} className="grid h-8 w-8 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" type="button">
                                                        <FaBan aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex min-h-[62px] items-center justify-between gap-4 px-[22px] py-4 text-[0.82rem] font-bold text-[var(--admin-muted)]">
                            <span>Showing 1-10 of 124 predictions</span>

                            <div className="flex items-center gap-2">
                                <button aria-label="Previous page" className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]" type="button">&lt;</button>
                                <button aria-label="Next page" className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]" type="button">&gt;</button>
                            </div>
                        </div>
                    </section>

                    <section className={panelClass}>
                        <div className={panelTitleClass}>
                            <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Top Predicted</h2>
                        </div>

                        <div className="grid grid-cols-3 gap-5 p-5 max-[820px]:grid-cols-1">
                            {topPredicted.map((item) => (
                                <article className="relative grid justify-items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[#fffdfc] p-5 text-center" key={item.horse}>
                                    <img
                                        alt=""
                                        className="h-20 w-20 rounded-full object-cover"
                                        src={horseRacing}
                                        style={{ objectPosition: item.imagePosition }}
                                    />
                                    <strong className="text-[var(--admin-ink)]">{item.horse}</strong>
                                    <span className="text-[0.78rem] font-bold text-[var(--admin-muted)]">{item.count}</span>
                                    <small className={`absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full text-[0.72rem] font-black ${rankClass[item.tone]}`}>{item.rank}</small>
                                </article>
                            ))}
                        </div>

                        <button className="mx-auto mb-5 inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-md bg-[#ffe8e4] px-4 font-black text-[var(--admin-primary)] hover:bg-[#ffd8d2]" type="button">
                            <FaTrophy aria-hidden="true" />
                            <span>View All Participants</span>
                        </button>
                    </section>

                    <footer className="mt-16 flex items-center justify-between gap-6 text-[var(--admin-primary-dark)] max-[820px]:flex-col max-[820px]:items-stretch">
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

export default PredictionManagement;
