import {
    Link,
    useParams,
} from 'react-router-dom';

import {
    FaChevronLeft,
    FaChevronRight,
    FaFilter,
    FaRedoAlt,
    FaStepBackward,
    FaStepForward,
} from 'react-icons/fa';

import horseRacing from '../../assets/horse-racing.jpg';

import AdminLayout from './AdminLayout';

const raceResultDetails = {
    'dubai-sprint-cup': {
        raceName: 'Dubai Sprint Cup',
        trackCondition: 'Fast & Dry',
        wind: 'Wind: 12km/h NW',
        winningTime: '01:42.35',
        recordTime: 'Record: 01:41.02',
        entrySummary: 'Showing 10 of 12 Entries',
        topPerformer: {
            horse: 'Desert Thunder',
            jockey: 'James Carter',
            owner: 'Al Maktoum Stables',
        },
        results: [
            {
                position: '1',
                horse: 'Desert Thunder',
                jockey: 'James Carter',
                finishTime: '01:42.35',
                score: '98',
                scoreTone: 'green',
                status: 'Referee Confirmed',
            },
            {
                position: '2',
                horse: 'Shadow Flame',
                jockey: 'Lucas Reed',
                finishTime: '01:44.12',
                score: '94',
                scoreTone: 'green',
                status: 'Referee Confirmed',
            },
            {
                position: '3',
                horse: 'Silver Arrow',
                jockey: 'Daniel Smith',
                finishTime: '01:45.77',
                score: '90',
                scoreTone: 'green',
                status: 'Referee Confirmed',
            },
            {
                position: '4',
                horse: 'Thunder Spirit',
                jockey: 'Ryan Cooper',
                finishTime: '01:47.21',
                score: '87',
                scoreTone: 'gold',
                status: 'Draft',
            },
            {
                position: '5',
                horse: 'Golden Blaze',
                jockey: 'Chris Walker',
                finishTime: '01:49.02',
                score: '82',
                scoreTone: 'gold',
                status: 'Referee Confirmed',
            },
        ],
    },
    'royal-turf-championship': {
        raceName: 'Royal Turf Championship',
        trackCondition: 'Soft Turf',
        wind: 'Wind: 8km/h W',
        winningTime: '02:08.74',
        recordTime: 'Record: 02:06.58',
        entrySummary: 'Showing 10 of 14 Entries',
        topPerformer: {
            horse: 'Emerald Crown',
            jockey: 'Amelia Brooks',
            owner: 'Ascot Regent Stable',
        },
        results: [
            {
                position: '1',
                horse: 'Emerald Crown',
                jockey: 'Amelia Brooks',
                finishTime: '02:08.74',
                score: '96',
                scoreTone: 'green',
                status: 'Referee Confirmed',
            },
            {
                position: '2',
                horse: 'Velvet March',
                jockey: 'Noah Hughes',
                finishTime: '02:10.03',
                score: '93',
                scoreTone: 'green',
                status: 'Draft',
            },
            {
                position: '3',
                horse: 'Royal Echo',
                jockey: 'Sophie Grant',
                finishTime: '02:11.45',
                score: '89',
                scoreTone: 'gold',
                status: 'Referee Confirmed',
            },
            {
                position: '4',
                horse: 'Turf Monarch',
                jockey: 'Henry Miles',
                finishTime: '02:12.18',
                score: '86',
                scoreTone: 'gold',
                status: 'Draft',
            },
            {
                position: '5',
                horse: 'Pearl Meadow',
                jockey: 'Clara Evans',
                finishTime: '02:13.22',
                score: '83',
                scoreTone: 'gold',
                status: 'Referee Confirmed',
            },
        ],
    },
    'golden-derby-finals': {
        raceName: 'Golden Derby Finals',
        trackCondition: 'Firm & Clear',
        wind: 'Wind: 5km/h SE',
        winningTime: '01:58.20',
        recordTime: 'Record: 01:57.44',
        entrySummary: 'Showing 10 of 16 Entries',
        topPerformer: {
            horse: 'Crown Ledger',
            jockey: 'Mateo Rivera',
            owner: 'Churchill Gold Syndicate',
        },
        results: [
            {
                position: '1',
                horse: 'Crown Ledger',
                jockey: 'Mateo Rivera',
                finishTime: '01:58.20',
                score: '97',
                scoreTone: 'green',
                status: 'Referee Confirmed',
            },
            {
                position: '2',
                horse: 'Derby Lantern',
                jockey: 'Ethan Shaw',
                finishTime: '01:59.01',
                score: '95',
                scoreTone: 'green',
                status: 'Referee Confirmed',
            },
            {
                position: '3',
                horse: 'Triple Verse',
                jockey: 'Mina Cole',
                finishTime: '02:00.38',
                score: '91',
                scoreTone: 'green',
                status: 'Referee Confirmed',
            },
            {
                position: '4',
                horse: 'Golden Rail',
                jockey: 'Oliver King',
                finishTime: '02:01.64',
                score: '88',
                scoreTone: 'gold',
                status: 'Draft',
            },
            {
                position: '5',
                horse: 'Blue Bourbon',
                jockey: 'Tara Blake',
                finishTime: '02:02.49',
                score: '84',
                scoreTone: 'gold',
                status: 'Referee Confirmed',
            },
        ],
    },
    'night-thunder-race': {
        raceName: 'Night Thunder Race',
        trackCondition: 'Wet Surface',
        wind: 'Wind: 15km/h E',
        winningTime: '02:18.66',
        recordTime: 'Record: 02:15.90',
        entrySummary: 'Showing 10 of 12 Entries',
        topPerformer: {
            horse: 'Storm Cipher',
            jockey: 'Kai Morgan',
            owner: 'Harbor Peak Racing',
        },
        results: [
            {
                position: '1',
                horse: 'Storm Cipher',
                jockey: 'Kai Morgan',
                finishTime: '02:18.66',
                score: '94',
                scoreTone: 'green',
                status: 'Referee Confirmed',
            },
            {
                position: '2',
                horse: 'Midnight Lance',
                jockey: 'Nora Wells',
                finishTime: '02:20.14',
                score: '92',
                scoreTone: 'green',
                status: 'Referee Confirmed',
            },
            {
                position: '3',
                horse: 'Rain Signal',
                jockey: 'Peter Sloan',
                finishTime: '02:21.06',
                score: '88',
                scoreTone: 'gold',
                status: 'Draft',
            },
            {
                position: '4',
                horse: 'Black Current',
                jockey: 'Ivy Chen',
                finishTime: '02:22.52',
                score: '85',
                scoreTone: 'gold',
                status: 'Referee Confirmed',
            },
            {
                position: '5',
                horse: 'Night Flare',
                jockey: 'Samir Patel',
                finishTime: '02:23.80',
                score: '81',
                scoreTone: 'gold',
                status: 'Draft',
            },
        ],
    },
    'mountain-horse-cup': {
        raceName: 'Mountain Horse Cup',
        trackCondition: 'Rocky Trail',
        wind: 'Wind: 18km/h N',
        winningTime: '03:12.94',
        recordTime: 'Record: 03:09.31',
        entrySummary: 'Showing 10 of 15 Entries',
        topPerformer: {
            horse: 'Alpine Valor',
            jockey: 'Greta Holm',
            owner: 'Summit Ridge Stables',
        },
        results: [
            {
                position: '1',
                horse: 'Alpine Valor',
                jockey: 'Greta Holm',
                finishTime: '03:12.94',
                score: '95',
                scoreTone: 'green',
                status: 'Referee Confirmed',
            },
            {
                position: '2',
                horse: 'Granite Path',
                jockey: 'Marco Bell',
                finishTime: '03:14.07',
                score: '91',
                scoreTone: 'green',
                status: 'Referee Confirmed',
            },
            {
                position: '3',
                horse: 'Snowline Echo',
                jockey: 'June Foster',
                finishTime: '03:15.62',
                score: '89',
                scoreTone: 'gold',
                status: 'Draft',
            },
            {
                position: '4',
                horse: 'Cedar Ridge',
                jockey: 'Liam Stone',
                finishTime: '03:17.33',
                score: '84',
                scoreTone: 'gold',
                status: 'Referee Confirmed',
            },
            {
                position: '5',
                horse: 'Highland Dust',
                jockey: 'Maya Lane',
                finishTime: '03:19.48',
                score: '80',
                scoreTone: 'gold',
                status: 'Draft',
            },
        ],
    },
};

const formatClass = (value) => value.toLowerCase().replace(/\s+/g, '-');

const pageShellClass = [
    '[--validate-soft-panel:#fff4f1]',
    'grid min-h-[calc(100vh-64px)] content-start gap-7 px-[52px] py-[54px] max-[820px]:px-5 max-[820px]:py-8',
].join(' ');

const panelWidthClass = 'w-[min(100%,1120px)]';

const positionClass = {
    1: 'bg-[#ffd85a] text-[#7b5a05]',
    2: 'bg-[#ffe3df] text-[#7a4740]',
    3: 'bg-[#ffe3df] text-[#7a4740]',
    4: 'bg-[#ffe3df] text-[#7a4740]',
    5: 'bg-[#ffe3df] text-[#7a4740]',
};

const scoreClass = {
    green: 'bg-[#c9f6d9] text-[#0d854d]',
    gold: 'bg-[#ffe88f] text-[#8b6707]',
};

const statusClass = {
    'referee-confirmed': 'border-[#d6a918] bg-[#ffd95e] text-[#8c6508]',
    draft: 'border-[#ddd6d3] bg-[#f5f4f3] text-[#6f6360]',
};

const pageButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[0.78rem] font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]';

function ValidateResultDetail() {
    const { resultId } = useParams();
    const detail = raceResultDetails[resultId] || raceResultDetails['dubai-sprint-cup'];

    return (
        <AdminLayout activeKey="results" mainClassName="validate-detail-main">
                <section className={pageShellClass}>
                    <h1 className="m-0 text-[1.9rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[820px]:text-[1.5rem]">
                        Race Result Details: {detail.raceName}
                    </h1>

                    <section
                        aria-label="Race result summary"
                        className={`${panelWidthClass} grid grid-cols-[minmax(0,250px)_minmax(0,250px)_minmax(340px,1fr)] gap-6 max-[1180px]:grid-cols-2 max-[820px]:grid-cols-1`}
                    >
                        <article className="grid min-h-[110px] content-center gap-[5px] overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-[18px]">
                            <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#704b46]">Track Conditions</span>
                            <strong className="text-[1.32rem] leading-[1.1] text-[var(--admin-primary)]">{detail.trackCondition}</strong>
                            <small className="text-[0.76rem] font-semibold text-[#5f4b47]">{detail.wind}</small>
                        </article>

                        <article className="grid min-h-[110px] content-center gap-[5px] overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-[18px]">
                            <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#704b46]">Winning Time</span>
                            <strong className="text-[1.32rem] leading-[1.1] text-[var(--admin-primary)]">{detail.winningTime}</strong>
                            <small className="text-[0.76rem] font-semibold text-[#5f4b47]">{detail.recordTime}</small>
                        </article>

                        <article className="relative flex min-h-[110px] items-center overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-primary)] px-[22px] py-[18px] text-white before:absolute before:inset-0 before:z-[1] before:bg-[linear-gradient(90deg,rgba(134,7,7,0.98)_0%,rgba(134,7,7,0.92)_45%,rgba(134,7,7,0.44)_100%)] before:content-[''] max-[1180px]:col-span-full max-[820px]:col-span-1">
                            <img alt="" className="absolute right-0 top-0 h-full w-[54%] object-cover object-[64%_center]" src={horseRacing} />
                            <div className="relative z-[2] grid max-w-[420px] gap-1">
                                <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#ffd8d3]">Top Performer</span>
                                <strong className="text-[1.35rem] leading-[1.05] text-white">{detail.topPerformer.horse}</strong>
                                <small className="text-[0.78rem] font-bold text-[#ffd8d3]">
                                    Jockey: {detail.topPerformer.jockey} | Owner: {detail.topPerformer.owner}
                                </small>
                            </div>
                        </article>
                    </section>

                    <section
                        aria-label="Race result entries"
                        className={`${panelWidthClass} overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]`}
                    >
                        <div className="flex min-h-[70px] items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-6 py-3.5 max-[820px]:flex-col max-[820px]:items-stretch">
                            <label className="inline-flex h-[38px] w-[285px] items-center gap-2.5 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[#765d58] max-[820px]:w-full">
                                <FaFilter aria-hidden="true" />
                                <select className="h-full w-full min-w-0 cursor-pointer border-0 bg-transparent p-0 pr-6 text-[0.78rem] font-bold text-[var(--admin-ink)] outline-0" defaultValue="all">
                                    <option value="all">All Statuses</option>
                                    <option value="confirmed">Referee Confirmed</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </label>

                            <button
                                aria-label="Refresh results"
                                className="grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[#765d58] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]"
                                type="button"
                            >
                                <FaRedoAlt aria-hidden="true" />
                            </button>

                            <span className="ml-auto text-[0.72rem] font-extrabold text-[#5f4b47] max-[820px]:ml-0">
                                {detail.entrySummary}
                            </span>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse max-[820px]:min-w-[920px]">
                                <thead>
                                    <tr>
                                        <th className="w-[150px] border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-[22px] py-5 pl-[62px] text-left text-[0.76rem] font-black uppercase leading-[1.1] tracking-normal text-[#7b625d] max-[820px]:pl-6">Position</th>
                                        <th className="w-[210px] border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-[22px] py-5 text-left text-[0.76rem] font-black uppercase leading-[1.1] tracking-normal text-[#7b625d]">Horse Name</th>
                                        <th className="border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-[22px] py-5 text-left text-[0.76rem] font-black uppercase leading-[1.1] tracking-normal text-[#7b625d]">Jockey Name</th>
                                        <th className="border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-[22px] py-5 text-left text-[0.76rem] font-black uppercase leading-[1.1] tracking-normal text-[#7b625d]">Finish Time</th>
                                        <th className="w-[150px] border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-[22px] py-5 text-center text-[0.76rem] font-black uppercase leading-[1.1] tracking-normal text-[#7b625d]">Score</th>
                                        <th className="w-[210px] border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-[22px] py-5 text-center text-[0.76rem] font-black uppercase leading-[1.1] tracking-normal text-[#7b625d]">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detail.results.map((result) => (
                                        <tr key={result.horse}>
                                            <td className="w-[150px] whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-5 pl-[62px] align-middle text-[0.78rem] font-bold text-[#6d5752] max-[820px]:pl-6">
                                                <span className={`inline-grid h-7 w-7 place-items-center rounded-full text-[0.72rem] font-black ${positionClass[result.position]}`}>
                                                    {result.position}
                                                </span>
                                            </td>
                                            <td className="w-[210px] whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-5 align-middle text-[0.78rem] font-bold text-[#6d5752]">
                                                <strong className="block max-w-[120px] whitespace-normal text-[0.88rem] leading-[1.05] text-[var(--admin-primary)]">
                                                    {result.horse}
                                                </strong>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-5 align-middle text-[0.78rem] font-bold text-[#6d5752]">{result.jockey}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-5 align-middle font-[Consolas,'Courier_New',monospace] text-[0.78rem] font-bold text-[#6d5752]">{result.finishTime}</td>
                                            <td className="w-[150px] whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-5 text-center align-middle text-[0.78rem] font-bold text-[#6d5752]">
                                                <span className={`inline-grid min-h-5 min-w-7 place-items-center rounded text-[0.66rem] font-black ${scoreClass[result.scoreTone]}`}>
                                                    {result.score}
                                                </span>
                                            </td>
                                            <td className="w-[210px] whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-5 text-center align-middle text-[0.78rem] font-bold text-[#6d5752]">
                                                <span className={`inline-flex min-h-8 max-w-[92px] items-center justify-center whitespace-normal rounded-full border px-[11px] text-[0.62rem] font-extrabold leading-[1.05] ${statusClass[formatClass(result.status)]}`}>
                                                    {result.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid min-h-[74px] grid-cols-[1fr_auto_1fr] items-center gap-[18px] bg-[#fffaf8] px-6 py-3.5 max-[820px]:grid-cols-1">
                            <div className="flex items-center gap-2 max-[820px]:justify-center">
                                <button aria-label="First page" className={pageButtonClass} type="button">
                                    <FaStepBackward aria-hidden="true" className="h-3 w-3" />
                                </button>
                                <button aria-label="Previous page" className={pageButtonClass} type="button">
                                    <FaChevronLeft aria-hidden="true" className="h-3 w-3" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 max-[820px]:justify-center">
                                <button className={`${pageButtonClass} border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary)]`} type="button">1</button>
                                <button className={pageButtonClass} type="button">2</button>
                                <button className={pageButtonClass} type="button">3</button>
                                <span className="font-black text-[#6f5b57]">...</span>
                                <button className={pageButtonClass} type="button">5</button>
                            </div>

                            <div className="flex items-center justify-end gap-2 max-[820px]:justify-center">
                                <button aria-label="Next page" className={pageButtonClass} type="button">
                                    <FaChevronRight aria-hidden="true" className="h-3 w-3" />
                                </button>
                                <button aria-label="Last page" className={pageButtonClass} type="button">
                                    <FaStepForward aria-hidden="true" className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className={`${panelWidthClass} -mt-5 flex justify-end gap-[18px] max-[820px]:mt-0 max-[820px]:flex-col max-[820px]:items-stretch`}>
                        <Link
                            className="inline-flex min-h-12 min-w-[108px] cursor-pointer items-center justify-center rounded-lg border-2 border-[var(--admin-primary)] bg-white text-[0.82rem] font-black text-[var(--admin-primary)] no-underline hover:bg-[#fff0ed]"
                            to="/admin/results"
                        >
                            Return
                        </Link>
                        <button
                            className="inline-flex min-h-12 min-w-[108px] cursor-pointer items-center justify-center rounded-lg border-2 border-[var(--admin-primary)] bg-[var(--admin-primary)] text-[0.82rem] font-black text-white hover:border-[var(--admin-primary-dark)] hover:bg-[var(--admin-primary-dark)]"
                            type="button"
                        >
                            Publish
                        </button>
                    </div>

                    <footer className={`${panelWidthClass} mt-[92px] flex items-center justify-between gap-6 text-[var(--admin-primary-dark)] max-[820px]:flex-col max-[820px]:items-stretch`}>
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

export default ValidateResultDetail;
