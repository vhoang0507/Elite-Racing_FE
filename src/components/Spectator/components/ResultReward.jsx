import { useEffect, useState } from 'react';
import {
    FaBullseye,
    FaCoins,
    FaListOl,
    FaPercent,
} from 'react-icons/fa';
import { spectatorApi } from '../../../api/spectatorApi';

export default function ResultReward() {
    const [rewards, setRewards] = useState(null);
    const [season, setSeason] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            spectatorApi.getSpectatorRewards().catch(() => null),
            spectatorApi.getCurrentSeason().catch(() => null),
        ]).then(([r, s]) => {
            setRewards(r);
            setSeason(s);
        }).finally(() => setLoading(false));
    }, []);

    const bettingPoints = rewards?.bettingPoints ?? 0;
    const netPoints     = rewards?.netPoints ?? 0;
    const correct       = rewards?.correctPredictions ?? 0;
    const accuracy      = rewards?.predictionAccuracy ?? 0;
    const myRank        = rewards?.myRank ?? null;
    const history       = rewards?.pointHistory ?? [];

    // Progress: how far into season
    const seasonPct = season?.daysLeft != null && season?.totalDays
        ? Math.max(0, Math.min(100, Math.round((1 - season.daysLeft / season.totalDays) * 100)))
        : null;

    const stats = [
        { label: 'Wallet Balance',       value: bettingPoints, suffix: 'pts', icon: FaCoins,       tone: 'gold' },
        { label: 'Net Points',           value: `${netPoints >= 0 ? '+' : ''}${netPoints}`, suffix: 'pts', icon: FaCoins, tone: netPoints >= 0 ? 'green' : 'red' },
        { label: 'Prediction Accuracy',  value: `${accuracy}%`, icon: FaPercent, tone: 'blue' },
        { label: 'My Season Rank',       value: myRank ? `#${myRank}` : '—', icon: FaListOl, tone: '' },
    ];

    return (
        <div className="grid gap-7">
            <div>
                <h1 className="page-title">Results & Rewards</h1>
                <p className="page-subtitle">
                    Your prediction performance this season. Points are distributed to top predictors at season end.
                </p>
            </div>

            {loading ? (
                <p className="m-0 text-center font-semibold text-[var(--admin-muted)]">Loading...</p>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 max-[1000px]:grid-cols-2 max-[500px]:grid-cols-1">
                        {stats.map(s => {
                            const Icon = s.icon;
                            return (
                                <article key={s.label} className="stat-card min-h-[110px]">
                                    <div className={`stat-icon ${s.tone === 'gold' ? 'bg-[#fff3cd] text-[#856404]' : s.tone === 'green' ? 'bg-[#dff7e9] text-[#118548]' : s.tone === 'blue' ? 'bg-[#e3f2fd] text-[#1565c0]' : s.tone === 'red' ? 'bg-[#f8d7da] text-[#721c24]' : ''}`}>
                                        <Icon aria-hidden="true" />
                                    </div>
                                    <small className="stat-label">{s.label}</small>
                                    <h3 className="stat-value text-[1.7rem]">
                                        {s.value}{s.suffix && <span className="text-[0.8rem] font-semibold text-[var(--admin-muted)]"> {s.suffix}</span>}
                                    </h3>
                                </article>
                            );
                        })}
                    </div>

                    {/* Season progress + reward info */}
                    <div className="grid gap-5 xl:grid-cols-2">
                        {/* Season countdown */}
                        <div className="surface-card p-5">
                            <h2 className="m-0 mb-4 text-[1.05rem] font-bold">Season Progress</h2>
                            {season ? (
                                <>
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        <div>
                                            <p className="m-0 text-xs font-black uppercase text-[var(--admin-muted)]">Period</p>
                                            <p className="m-0 mt-1 font-bold">{season.startDate?.slice(0, 10)} — {season.endDate?.slice(0, 10)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="m-0 text-[2rem] font-black text-[var(--admin-primary)]">{season.daysLeft ?? '—'}</p>
                                            <p className="m-0 text-xs font-black uppercase text-[var(--admin-muted)]">Days Remaining</p>
                                        </div>
                                    </div>
                                    {seasonPct != null && (
                                        <div className="mt-5">
                                            <div className="mb-1 flex justify-between text-xs font-bold text-[var(--admin-muted)]">
                                                <span>Season elapsed</span>
                                                <span>{seasonPct}%</span>
                                            </div>
                                            <div className="h-2.5 overflow-hidden rounded-full bg-[#dce5ef]">
                                                <div className="h-full rounded-full bg-[var(--admin-primary)]" style={{ width: `${seasonPct}%` }} />
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-4 rounded-[8px] bg-[#fff8f6] p-3 text-[0.83rem] text-[var(--admin-muted)]">
                                        🏆 At season end, top predictors receive exclusive reward prizes. The season resets every 3 months.
                                    </div>
                                </>
                            ) : (
                                <p className="m-0 text-[var(--admin-muted)]">Season data not available yet.</p>
                            )}
                        </div>

                        {/* Reward catalog — placeholder pending BE */}
                        <div className="surface-card p-5">
                            <h2 className="m-0 mb-1 text-[1.05rem] font-bold">Reward Prizes</h2>
                            <p className="m-0 mb-4 text-[0.83rem] text-[var(--admin-muted)]">Prizes for top predictors at season end.</p>
                            <div className="grid gap-3">
                                {[
                                    { rank: '🥇 1st Place', prize: 'Grand Prize', desc: 'Details announced at season end.' },
                                    { rank: '🥈 2nd Place', prize: 'Runner-up Prize', desc: 'Details announced at season end.' },
                                    { rank: '🥉 3rd Place', prize: 'Third Place Prize', desc: 'Details announced at season end.' },
                                ].map(item => (
                                    <div key={item.rank} className="flex items-center gap-3 rounded-[8px] border border-[var(--admin-border)] bg-[#fffaf8] p-3">
                                        <span className="text-xl">{item.rank.slice(0, 2)}</span>
                                        <div className="min-w-0">
                                            <p className="m-0 font-bold text-[0.9rem]">{item.rank.slice(3)} — {item.prize}</p>
                                            <p className="m-0 text-xs text-[var(--admin-muted)]">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="m-0 mt-3 text-center text-xs text-[var(--admin-muted)]">
                                Prize catalog pending BE setup.
                            </p>
                        </div>
                    </div>

                    {/* Points history */}
                    <div className="surface-card">
                        <div className="section-bar">
                            <h2 className="m-0 text-[1.05rem] font-bold">Bet History</h2>
                            <span className="font-black" style={{ color: netPoints >= 0 ? '#155724' : '#721c24' }}>
                                Net: {netPoints >= 0 ? '+' : ''}{netPoints} pts
                            </span>
                        </div>
                        {history.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="m-0 text-[var(--admin-muted)]">No bets placed yet. Make predictions to see your history!</p>
                            </div>
                        ) : (
                            history.map((item, i) => {
                                const won = item.isCorrect === true;
                                const lost = item.isCorrect === false;
                                const pending = !won && !lost;
                                const net = item.netPoints ?? (won ? item.payoutPoints - item.stakePoints : -(item.stakePoints ?? 0));
                                return (
                                    <div key={i} className="flex items-center gap-3 border-b border-[var(--admin-border)] px-5 py-3 last:border-b-0">
                                        <span className="text-xl">{won ? '✅' : lost ? '❌' : '⏳'}</span>
                                        <div className="min-w-0 flex-1">
                                            <p className="m-0 font-bold text-[0.9rem]">{item.tournamentName ?? item.raceName ?? 'Tournament'}</p>
                                            <p className="m-0 text-xs text-[var(--admin-muted)]">
                                                Pick: {item.predictedHorseName ?? '—'}
                                                {item.actualWinnerHorseName && ` · Winner: ${item.actualWinnerHorseName}`}
                                                {item.stakePoints > 0 && ` · Stake: ${item.stakePoints} pts`}
                                            </p>
                                        </div>
                                        <span className="font-black" style={{ color: pending ? '#856404' : net >= 0 ? '#155724' : '#721c24' }}>
                                            {pending ? '—' : `${net >= 0 ? '+' : ''}${net} pts`}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
