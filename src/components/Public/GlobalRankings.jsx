import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaSearch, FaTrophy, FaUserTie } from 'react-icons/fa';
import PublicLayout from './PublicLayout';
import horseRacing from '../../assets/horse-racing.jpg';
import { leaderboardApi } from '../../api/leaderboardApi';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

function WinRateBar({ rate = 0 }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 64, height: 5, borderRadius: 99, background: '#efd7d2', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#c0392b', borderRadius: 99, width: `${Math.min(100, rate)}%` }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>{rate}%</span>
        </div>
    );
}

export default function GlobalRankings() {
    const [owners, setOwners] = useState([]);
    const [jockeys, setJockeys] = useState([]);
    const [activeTab, setActiveTab] = useState('owners');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            leaderboardApi.getOwnerLeaderboard({ limit: 10 }).catch(() => []),
            leaderboardApi.getJockeyLeaderboard({ limit: 10 }).catch(() => []),
        ]).then(([o, j]) => {
            setOwners(o ?? []);
            setJockeys(j ?? []);
        }).finally(() => setLoading(false));
    }, []);

    return (
        <PublicLayout showSearch={false}>
            <section className="relative min-h-[390px] overflow-hidden">
                <img
                    src={horseRacing}
                    alt="Elite racing horses"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />

                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 mx-auto flex min-h-[390px] max-w-5xl flex-col items-center justify-center px-6 text-center text-white">
                    <h1 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">
                        Elite Racing Horses
                    </h1>

                    <p className="mt-3 text-lg text-white/90">
                        Discover world-class race horses competing across global tournaments.
                    </p>

                    <div className="relative mt-8 w-full max-w-2xl">
                        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--racing-muted)]" />
                        <input
                            className="h-14 w-full rounded-[8px] border border-white/30 bg-white px-5 pl-12 text-[var(--racing-ink)] shadow-[0_15px_38px_rgba(0,0,0,0.16)] outline-none"
                            placeholder="Search by name, breed, or ID..."
                        />
                    </div>

                    <div className="mt-7 grid w-full max-w-xl grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                            ['1,840', 'Total Horses'],
                            ['920', 'Active Racers'],
                            ['45', 'Champions'],
                            ['68 km/h', 'Avg Speed'],
                        ].map(([value, label]) => (
                            <div
                                key={label}
                                className="rounded-[8px] bg-black/55 px-4 py-4 backdrop-blur"
                            >
                                <strong className="block text-2xl font-black">
                                    {value}
                                </strong>
                                <span className="text-xs uppercase text-white/80">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-8 md:px-11">
                <div className="mb-8 flex flex-col gap-3 rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] p-3 md:flex-row md:items-center">
                    {['Breed', 'Age', 'Performance', 'Status', 'Distance', 'Region'].map((label) => (
                        <select
                            key={label}
                            className="h-11 rounded-[8px] border border-[var(--racing-border)] bg-white px-4 outline-none"
                        >
                            <option>{label}</option>
                        </select>
                    ))}

                    <div className="flex-1" />

                    <select className="h-11 rounded-[8px] border border-[var(--racing-border)] bg-white px-4 outline-none">
                        <option>Highest Ranked</option>
                    </select>
                </div>

                <article className="grid overflow-hidden rounded-[12px] bg-[#fffaf8] shadow-[0_18px_45px_rgba(70,32,26,0.10)] lg:grid-cols-[1fr_1fr]">
                    <div className="relative min-h-[360px]">
                        <img
                            src="/Horse2.jpg"
                            alt="Thunderstrike"
                            className="absolute inset-0 h-full w-full object-cover"
                        />

                        <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded bg-[#f7d84a] px-3 py-2 text-xs font-black uppercase">
                            <FaTrophy /> #1 Global Rank
                        </span>
                    </div>

                    <div className="p-7 md:p-9">
                        <div className="flex gap-2">
                            <span className="rounded border border-[#efbbb5] bg-[#fff0ee] px-2 py-1 text-xs font-bold text-[#9b3a32]">
                                Thoroughbred
                            </span>

                            <span className="rounded border border-[#efbbb5] bg-[#fff0ee] px-2 py-1 text-xs font-bold text-[#9b3a32]">
                                5yo
                            </span>
                        </div>

                        <h2 className="mt-4 text-4xl font-black tracking-[-0.04em]">
                            Thunderstrike
                        </h2>

                        <p className="mt-3 max-w-md leading-7 text-[var(--racing-muted)]">
                            The reigning champion across three continents. Known for an explosive finishing kick and unparalleled stamina in classic distance races.
                        </p>

                        <div className="mt-8 grid grid-cols-2 gap-8">
                            <div>
                                <span className="text-xs font-bold uppercase text-[var(--racing-muted)]">
                                    Locations
                                </span>
                                <strong className="block text-2xl">UK</strong>
                            </div>

                            <div>
                                <span className="text-xs font-bold uppercase text-[var(--racing-muted)]">
                                    Earnings
                                </span>
                                <strong className="block text-2xl">$12.4M</strong>
                            </div>
                        </div>

                        <Link
                            to="/login"
                            className="mt-12 inline-flex rounded-[6px] bg-[var(--racing-primary)] px-6 py-3 text-sm font-black text-white no-underline hover:bg-[var(--racing-primary-dark)]"
                        >
                            View Full Profile
                        </Link>
                    </div>
                </article>

                <div className="mt-10 overflow-hidden rounded-[12px] border border-[var(--racing-border)] bg-[#fffaf8] shadow-[0_16px_40px_rgba(70,32,26,0.07)]">
                    <div className="flex items-center justify-between px-5 py-4">
                        <h2 className="m-0 text-xl font-black">Global Rankings</h2>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('owners')}
                                className={`flex items-center gap-2 rounded px-4 py-2 text-xs font-black ${activeTab === 'owners' ? 'bg-[var(--racing-primary)] text-white' : 'border border-[var(--racing-border)] text-[var(--racing-muted)]'}`}
                            >
                                <FaTrophy /> Top Owners
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('jockeys')}
                                className={`flex items-center gap-2 rounded px-4 py-2 text-xs font-black ${activeTab === 'jockeys' ? 'bg-[var(--racing-primary)] text-white' : 'border border-[var(--racing-border)] text-[var(--racing-muted)]'}`}
                            >
                                <FaUserTie /> Top Jockeys
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <p className="px-5 py-8 text-center text-sm text-[var(--racing-muted)]">Loading rankings...</p>
                        ) : activeTab === 'owners' ? (
                            owners.length === 0 ? (
                                <p className="px-5 py-8 text-center text-sm text-[var(--racing-muted)]">No owner data yet.</p>
                            ) : (
                                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                                    <thead className="bg-[#fff0ee] text-xs uppercase tracking-wide text-[var(--racing-muted)]">
                                        <tr>
                                            {['Rank', 'Owner', 'Wins', 'Races', 'Top 3', 'Win Rate', 'Best Time'].map((h) => (
                                                <th key={h} className="px-5 py-4">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {owners.map((o) => (
                                            <tr key={o.ownerId ?? o.rank} className="border-t border-[#f1dcd8]">
                                                <td className="px-5 py-4 text-xl font-black">{MEDAL[o.rank] ?? `#${o.rank}`}</td>
                                                <td className="px-5 py-4 font-black text-[var(--racing-primary)]">{o.ownerName}</td>
                                                <td className="px-5 py-4 font-black text-[#c0392b]">{o.wins ?? 0}</td>
                                                <td className="px-5 py-4 text-[var(--racing-muted)]">{o.totalRaces ?? 0}</td>
                                                <td className="px-5 py-4 font-bold text-[#1565c0]">{o.top3Finishes ?? 0}</td>
                                                <td className="px-5 py-4"><WinRateBar rate={o.winRate ?? 0} /></td>
                                                <td className="px-5 py-4 font-mono text-[var(--racing-muted)]">{o.bestFinishTimeSeconds != null ? `${o.bestFinishTimeSeconds}s` : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        ) : (
                            jockeys.length === 0 ? (
                                <p className="px-5 py-8 text-center text-sm text-[var(--racing-muted)]">No jockey data yet.</p>
                            ) : (
                                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                                    <thead className="bg-[#fff0ee] text-xs uppercase tracking-wide text-[var(--racing-muted)]">
                                        <tr>
                                            {['Rank', 'Jockey', 'Wins', 'Races', 'Top 3', 'Win Rate', 'Best Time'].map((h) => (
                                                <th key={h} className="px-5 py-4">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jockeys.map((j) => (
                                            <tr key={j.jockeyId ?? j.rank} className="border-t border-[#f1dcd8]">
                                                <td className="px-5 py-4 text-xl font-black">{MEDAL[j.rank] ?? `#${j.rank}`}</td>
                                                <td className="px-5 py-4 font-black text-[var(--racing-primary)]">{j.jockeyName}</td>
                                                <td className="px-5 py-4 font-black text-[#c0392b]">{j.wins ?? 0}</td>
                                                <td className="px-5 py-4 text-[var(--racing-muted)]">{j.totalRaces ?? 0}</td>
                                                <td className="px-5 py-4 font-bold text-[#1565c0]">{j.top3Finishes ?? 0}</td>
                                                <td className="px-5 py-4"><WinRateBar rate={j.winRate ?? 0} /></td>
                                                <td className="px-5 py-4 font-mono text-[var(--racing-muted)]">{j.bestFinishTimeSeconds != null ? `${j.bestFinishTimeSeconds}s` : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}