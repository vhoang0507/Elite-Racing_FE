import { useEffect, useState } from 'react';
import { FaHorseHead, FaStar, FaUsers } from 'react-icons/fa';
import { spectatorApi } from '../../../api/spectatorApi';
import { getAuthUser } from '../../../utils/tokenStorage';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

function WinRateBar({ rate = 0 }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 80, height: 6, borderRadius: 99, background: '#dce5ef', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#0b7f5a', borderRadius: 99, width: `${Math.min(100, rate)}%` }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--admin-muted)' }}>{rate}%</span>
        </div>
    );
}

export default function Leaderboard() {
    const [horses, setHorses] = useState([]);
    const [predictors, setPredictors] = useState([]);
    const [season, setSeason] = useState(null);
    const [activeTab, setActiveTab] = useState('horses');
    const [loading, setLoading] = useState(true);

    const currentUser = getAuthUser();

    useEffect(() => {
        setLoading(true);
        Promise.all([
            spectatorApi.getHorseLeaderboard().catch(() => []),
            spectatorApi.getPredictorLeaderboard().catch(() => []),
            spectatorApi.getCurrentSeason().catch(() => null),
        ]).then(([h, p, s]) => {
            setHorses(h ?? []);
            setPredictors(p ?? []);
            setSeason(s);
        }).finally(() => setLoading(false));
    }, []);

    const tabs = [
        { key: 'horses',     label: 'Horse Rankings',  icon: FaHorseHead },
        { key: 'predictors', label: 'Top Predictors',  icon: FaUsers },
    ];

    return (
        <div className="grid gap-7">
            <div>
                <h1 className="page-title">Leaderboard</h1>
                <p className="page-subtitle">
                    Top performing horses this season and the most accurate predictors.
                </p>
            </div>

            {/* Season info */}
            {season && (
                <div className="surface-card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="stat-icon bg-[#fff3cd] text-[#856404]">
                                <FaStar aria-hidden="true" />
                            </div>
                            <div>
                                <p className="m-0 text-xs font-black uppercase text-[var(--admin-muted)]">Current Season</p>
                                <p className="m-0 font-bold text-[var(--admin-ink)]">
                                    {season.startDate?.slice(0, 10)} — {season.endDate?.slice(0, 10)}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-8 text-center">
                            <div>
                                <p className="m-0 text-[1.8rem] font-black text-[var(--admin-primary)]">{season.daysLeft ?? '—'}</p>
                                <p className="m-0 text-xs font-black uppercase text-[var(--admin-muted)]">Days Left</p>
                            </div>
                            <div>
                                <p className="m-0 text-[1.8rem] font-black text-[#1565c0]">{season.totalPredictors ?? '—'}</p>
                                <p className="m-0 text-xs font-black uppercase text-[var(--admin-muted)]">Predictors</p>
                            </div>
                            <div>
                                <p className="m-0 text-[1.8rem] font-black text-[#118548]">{season.totalPredictions ?? '—'}</p>
                                <p className="m-0 text-xs font-black uppercase text-[var(--admin-muted)]">Predictions</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 rounded-[8px] bg-[#fff8f6] px-4 py-3 text-[0.83rem] text-[var(--admin-muted)]">
                        🏆 Top predictors at season end receive exclusive reward prizes. Rankings reset each quarter.
                    </div>
                </div>
            )}

            {/* Tabs + table */}
            <div className="surface-card">
                <div className="section-bar">
                    <div className="flex gap-2">
                        {tabs.map(t => {
                            const Icon = t.icon;
                            return (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setActiveTab(t.key)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                        border: activeTab === t.key ? 'none' : '1px solid #dce5ef',
                                        background: activeTab === t.key ? '#0b7f5a' : '#fff8f6',
                                        color: activeTab === t.key ? '#fff' : '#0b7f5a',
                                    }}
                                >
                                    <Icon /> {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <p className="m-0 p-8 text-center font-semibold text-[var(--admin-muted)]">Loading rankings...</p>
                ) : activeTab === 'horses' ? (
                    horses.length === 0 ? (
                        <p className="m-0 p-8 text-center text-[var(--admin-muted)]">No horse data yet — waiting for BE endpoint.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="data-table min-w-[600px]">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Horse</th>
                                        <th>Owner</th>
                                        <th>Wins</th>
                                        <th>Races</th>
                                        <th>Win Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {horses.map(h => (
                                        <tr key={h.horseId ?? h.rank}>
                                            <td>
                                                <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>
                                                    {MEDAL[h.rank] ?? `#${h.rank}`}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#e8f7ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🐴</span>
                                                    <span style={{ fontWeight: 700 }}>{h.horseName}</span>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--admin-muted)' }}>{h.ownerName ?? '—'}</td>
                                            <td><span style={{ fontWeight: 900, color: '#0b7f5a' }}>{h.wins ?? 0}</span></td>
                                            <td style={{ color: 'var(--admin-muted)' }}>{h.totalRaces ?? 0}</td>
                                            <td><WinRateBar rate={h.winRate ?? 0} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    predictors.length === 0 ? (
                        <p className="m-0 p-8 text-center text-[var(--admin-muted)]">No predictor data yet — waiting for BE endpoint.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="data-table min-w-[540px]">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Spectator</th>
                                        <th>Points</th>
                                        <th>Correct</th>
                                        <th>Accuracy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {predictors.map((p, i) => {
                                        const isMe = currentUser?.fullName && p.spectatorName === currentUser.fullName;
                                        return (
                                            <tr key={i} style={{ background: isMe ? '#fff8f6' : '', fontWeight: isMe ? 700 : 'normal' }}>
                                                <td>
                                                    <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>
                                                        {MEDAL[p.rank] ?? `#${p.rank}`}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        {p.spectatorName}
                                                        {isMe && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: '#e8f7ef', color: '#0b7f5a' }}>You</span>}
                                                    </span>
                                                </td>
                                                <td><span style={{ fontWeight: 900, color: '#0b7f5a' }}>{p.points ?? 0} pts</span></td>
                                                <td style={{ color: '#118548', fontWeight: 700 }}>{p.correctPredictions ?? 0}</td>
                                                <td><WinRateBar rate={p.accuracy ?? 0} /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                <div className="border-t px-6 py-3 text-xs font-semibold text-[var(--admin-muted)]">
                    Rankings update after each race result is finalized by the referee.
                </div>
            </div>
        </div>
    );
}
