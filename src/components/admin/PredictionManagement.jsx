import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    FaBan,
    FaCalendarAlt,
    FaChevronDown,
    FaRegChartBar,
    FaSearch,
    FaSortAmountDown,
    FaSquare,
    FaTrophy,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import horseRacing from '../../assets/horse-racing.jpg';

import AdminLayout from './AdminLayout';

const formatClass = (value) => String(value || '').toLowerCase();

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 py-10 max-[820px]:px-5 max-[820px]:py-7';
const panelClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]';
const panelTitleClass = 'flex min-h-[58px] items-center border-b border-[var(--admin-border)] px-[22px]';
const selectFieldClass = 'flex h-[42px] items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[#80625d]';
const selectClass = 'h-full w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent text-[0.8rem] font-bold text-[#5f4b47] outline-0';
const statusClass = {
    pending: 'bg-[#fff7db] text-[#a17809] before:bg-[#a17809]',
    active: 'bg-[#e8f7ee] text-[#16864f] before:bg-[#16864f]',
    inactive: 'bg-[#f3e8e6] text-[#7f645f] before:bg-[#7f645f]',
    banned: 'bg-[#ffe8e4] text-[var(--admin-primary)] before:bg-[var(--admin-primary)]',
};
const rankClass = {
    gold: 'bg-[#ffd85a] text-[#7b5a05]',
    silver: 'bg-[#e7e9ee] text-[#5f697a]',
    bronze: 'bg-[#f3c29a] text-[#79430c]',
};
const rankTone = ['gold', 'silver', 'bronze'];

const matchesQuery = (prediction, query) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return true;
    }

    return [
        prediction.tournament,
        prediction.spectator,
        prediction.horse,
        prediction.status,
        prediction.accuracy,
    ].some((value) => String(value).toLowerCase().includes(normalizedQuery));
};

function PredictionManagement() {
    const [predictions, setPredictions] = useState([]);
    const [query, setQuery] = useState('');
    const [tournamentFilter, setTournamentFilter] = useState('all-tournaments');
    const [statusFilter, setStatusFilter] = useState('all-status');
    const [accuracyFilter, setAccuracyFilter] = useState('all-accuracy');
    const [sortBy, setSortBy] = useState('count');

    useEffect(() => {
        let isMounted = true;

        adminApi.getPredictions().then((payload) => {
            if (isMounted) {
                setPredictions(payload);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const tournaments = useMemo(() => Array.from(new Set(predictions.map((prediction) => prediction.tournament))), [predictions]);

    const summaryCards = useMemo(() => {
        const topPrediction = [...predictions].sort((current, next) => next.count - current.count)[0];
        const totalPredictions = predictions.reduce((total, prediction) => total + Number(prediction.count || 0), 0);
        const activeEvents = predictions.filter((prediction) => formatClass(prediction.status) === 'active').length;

        return [
            {
                label: 'Total Predictions',
                value: totalPredictions.toLocaleString('en-US'),
                icon: FaRegChartBar,
            },
            {
                label: 'Active Events',
                value: String(activeEvents),
                icon: FaCalendarAlt,
            },
            {
                label: 'Most Predicted',
                value: topPrediction?.horse || 'No data',
                icon: FaSquare,
            },
        ];
    }, [predictions]);

    const filteredPredictions = useMemo(() => {
        const filtered = predictions.filter((prediction) => (
            matchesQuery(prediction, query)
            && (tournamentFilter === 'all-tournaments' || prediction.tournament === tournamentFilter)
            && (statusFilter === 'all-status' || formatClass(prediction.status) === statusFilter)
            && (accuracyFilter === 'all-accuracy' || prediction.accuracy.toLowerCase().startsWith(accuracyFilter))
        ));

        return [...filtered].sort((current, next) => {
            if (sortBy === 'horse') {
                return current.horse.localeCompare(next.horse);
            }

            if (sortBy === 'tournament') {
                return current.tournament.localeCompare(next.tournament);
            }

            return next.count - current.count;
        });
    }, [accuracyFilter, predictions, query, sortBy, statusFilter, tournamentFilter]);

    const topPredicted = useMemo(() => [...predictions]
        .sort((current, next) => next.count - current.count)
        .slice(0, 3)
        .map((prediction, index) => ({
            ...prediction,
            rank: String(index + 1),
            tone: rankTone[index],
        })), [predictions]);

    const handleQueryChange = (value) => {
        setQuery(value);
    };

    const handleDisable = async (prediction) => {
        await adminApi.updatePredictionStatus(prediction.id, 'Inactive');
        setPredictions((current) => current.map((item) => (
            item.id === prediction.id
                ? {
                    ...item,
                    status: 'Inactive',
                }
                : item
        )));
    };

    return (
        <AdminLayout
            activeKey="predictions"
            mainClassName="prediction-management-main"
            onSearchChange={handleQueryChange}
            searchPlaceholder="Search predictions, horses, tournaments..."
            searchValue={query}
        >
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
                            <input className="h-full w-full min-w-0 border-0 bg-transparent p-0 text-[0.8rem] text-[var(--admin-ink)] outline-0" onChange={(event) => handleQueryChange(event.target.value)} placeholder="Search horse or tournament..." type="search" value={query} />
                        </label>

                        <label className={selectFieldClass}>
                            <select className={selectClass} onChange={(event) => setTournamentFilter(event.target.value)} value={tournamentFilter}>
                                <option value="all-tournaments">All Tournaments</option>
                                {tournaments.map((tournament) => (
                                    <option key={tournament} value={tournament}>{tournament}</option>
                                ))}
                            </select>
                            <FaChevronDown aria-hidden="true" />
                        </label>

                        <label className={selectFieldClass}>
                            <select className={selectClass} onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                                <option value="all-status">Status: All</option>
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="banned">Banned</option>
                            </select>
                            <FaChevronDown aria-hidden="true" />
                        </label>

                        <label className={selectFieldClass}>
                            <select className={selectClass} onChange={(event) => setAccuracyFilter(event.target.value)} value={accuracyFilter}>
                                <option value="all-accuracy">Accuracy: Any</option>
                                <option value="high">High Accuracy</option>
                                <option value="medium">Medium Accuracy</option>
                            </select>
                            <FaChevronDown aria-hidden="true" />
                        </label>

                        <button className="inline-flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-md bg-[var(--admin-primary)] px-3 font-black text-white hover:bg-[var(--admin-primary-dark)]" onClick={() => setSortBy((current) => (current === 'count' ? 'horse' : current === 'horse' ? 'tournament' : 'count'))} type="button">
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
                                    {filteredPredictions.map((prediction) => (
                                        <tr key={prediction.id}>
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
                                                    <button aria-label={`Disable prediction for ${prediction.horse}`} className="grid h-8 w-8 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" onClick={() => handleDisable(prediction)} type="button">
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
                            <span>Showing {filteredPredictions.length} of {predictions.length} predictions</span>

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
                                <article className="relative grid justify-items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[#fffdfc] p-5 text-center" key={item.id}>
                                    <img
                                        alt=""
                                        className="h-20 w-20 rounded-full object-cover"
                                        src={horseRacing}
                                        style={{ objectPosition: item.imagePosition }}
                                    />
                                    <strong className="text-[var(--admin-ink)]">{item.horse}</strong>
                                    <span className="text-[0.78rem] font-bold text-[var(--admin-muted)]">{item.count.toLocaleString('en-US')} predictions</span>
                                    <small className={`absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full text-[0.72rem] font-black ${rankClass[item.tone]}`}>{item.rank}</small>
                                </article>
                            ))}
                        </div>

                        <button className="mx-auto mb-5 inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-md bg-[#ffe8e4] px-4 font-black text-[var(--admin-primary)] hover:bg-[#ffd8d2]" type="button">
                            <FaTrophy aria-hidden="true" />
                            <span>View All Participants</span>
                        </button>
                    </section>
                </section>
        </AdminLayout>
    );
}

export default PredictionManagement;
