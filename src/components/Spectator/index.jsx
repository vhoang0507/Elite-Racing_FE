import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaBullseye,
    FaCalendarAlt,
    FaCheckCircle,
    FaCoins,
    FaListOl,
    FaMapMarkerAlt,
    FaTrophy,
} from 'react-icons/fa';
import SpectatorLayout from './SpectatorLayout';
import { spectatorApi } from '../../api/spectatorApi';

const MEDAL = { 0: '🥇', 1: '🥈', 2: '🥉' };

function SeasonBanner({ season }) {
    if (!season) return null;
    const pct = season.daysLeft != null && season.totalDays
        ? Math.max(0, Math.min(100, Math.round((1 - season.daysLeft / season.totalDays) * 100)))
        : null;

    return (
        <div className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="m-0 text-xs font-black uppercase text-[var(--admin-muted)]">Current Season</p>
                    <p className="m-0 mt-1 font-bold text-[var(--admin-ink)]">
                        {season.startDate?.slice(0, 10)} — {season.endDate?.slice(0, 10)}
                    </p>
                    <p className="m-0 mt-1 text-[0.82rem] text-[var(--admin-muted)]">
                        Season score resets to 0 each season. The new wallet opens with 1,000 points plus any earned carry bonus.
                    </p>
                </div>
                <div className="flex gap-6 text-center">
                    <div>
                        <p className="m-0 text-[2rem] font-black text-[var(--admin-primary)]">{season.daysLeft ?? '—'}</p>
                        <p className="m-0 text-xs font-black uppercase text-[var(--admin-muted)]">Days Left</p>
                    </div>
                    <div>
                        <p className="m-0 text-[2rem] font-black text-[#8a6209]">{season.totalPredictors ?? '—'}</p>
                        <p className="m-0 text-xs font-black uppercase text-[var(--admin-muted)]">Predictors</p>
                    </div>
                </div>
            </div>
            {pct != null && (
                <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs font-bold text-[var(--admin-muted)]">
                        <span>Season progress</span>
                        <span>{pct}% elapsed</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#dce5ef]">
                        <div className="h-full rounded-full bg-[var(--admin-primary)]" style={{ width: `${pct}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SpectatorDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [season, setSeason] = useState(null);
    const [predictors, setPredictors] = useState([]);
    const [openTournaments, setOpenTournaments] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            spectatorApi.getSpectatorDashboard().catch(() => null),
            spectatorApi.getSpectatorWallet().catch(() => null),
            spectatorApi.getCurrentSeason().catch(() => null),
            spectatorApi.getPredictorLeaderboard().catch(() => []),
            spectatorApi.getSpectatorTournaments().catch(() => []),
            spectatorApi.getMyPredictions().catch(() => []),
        ]).then(([dash, walletPayload, s, preds, tours, myPreds]) => {
            setData(dash);
            setWallet(walletPayload);
            setSeason(s);
            setPredictors((preds ?? []).slice(0, 5));

            const validPredictions = (myPreds ?? []).filter(p => p.status !== 'Cancelled');
            const predMap = Object.fromEntries(validPredictions.map(p => [p.tournamentId, p]));
            setOpenTournaments(
                (tours ?? [])
                    .filter(t => t.canPredict === true && !predMap[t.tournamentId])
                    .slice(0, 3)
            );
            setPredictions((myPreds ?? []).slice(0, 4));
        }).finally(() => setLoading(false));
    }, []);

    const hasActiveSeason = wallet?.hasActiveSeason ?? data?.hasActiveSeason ?? false;
    const bettingPoints = wallet?.bettingPoints ?? data?.bettingPoints ?? 0;
    const seasonScore = wallet?.seasonScore ?? data?.seasonScore ?? data?.rewardPoints ?? 0;

    const stats = [
        { label: 'Wallet Balance', value: bettingPoints, icon: FaCoins, tone: 'gold', suffix: 'pts' },
        { label: 'Season Score', value: seasonScore, icon: FaTrophy, tone: 'blue', suffix: 'pts' },
        { label: 'My Predictions', value: data?.predictionsSubmitted ?? 0, icon: FaBullseye, tone: 'blue' },
        { label: 'My Season Rank', value: data?.myRank ? `#${data.myRank}` : '—', icon: FaListOl, tone: '' },
    ];

    return (
        <SpectatorLayout activeKey="dashboard">
            <section className="page-shell">
                <div className="visual-banner flex flex-wrap items-end justify-between gap-6 px-7 py-6 max-[720px]:px-5">
                    <div className="relative z-[1] min-w-0">
                        <span className="text-[0.72rem] font-black uppercase tracking-[0.08em] text-[var(--racing-gold-bright)]">
                            Spectator Console
                        </span>
                        <h1 className="m-0 mt-1.5 text-[1.9rem] leading-[1.15] max-[720px]:text-[1.5rem]">
                            {bettingPoints.toLocaleString()} wallet pts · {seasonScore.toLocaleString()} season score
                        </h1>
                        <p className="m-0 mt-2 max-w-xl text-[0.92rem] text-[rgba(255,255,255,0.75)]">
                            {hasActiveSeason
                                ? `New-season wallet: ${(wallet?.baseOpeningPoints ?? 0).toLocaleString()} base + ${(wallet?.carriedBonusPoints ?? 0).toLocaleString()} bonus.`
                                : 'No active season. Your spendable wallet is 0 until the next season is activated.'}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <p className="m-0 font-semibold text-[var(--admin-muted)]">Loading...</p>
                ) : (
                    <>
                        <SeasonBanner season={season} />

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-5 max-[1050px]:grid-cols-2 max-[600px]:grid-cols-1">
                            {stats.map((s) => {
                                const Icon = s.icon;
                                return (
                                    <article key={s.label} className="stat-card">
                                        <div className={`stat-icon ${s.tone === 'blue' ? 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]' : s.tone === 'gold' ? 'bg-[#faf2e0] text-[#8a6209]' : ''}`}>
                                            <Icon aria-hidden="true" />
                                        </div>
                                        <small className="stat-label">{s.label}</small>
                                        <h2 className="stat-value">
                                            {s.value}{s.suffix && <span className="text-[0.85rem] font-semibold text-[var(--admin-muted)]"> {s.suffix}</span>}
                                        </h2>
                                    </article>
                                );
                            })}
                        </div>

                        {/* Call to action: open tournaments */}
                        {openTournaments.length > 0 && (
                            <div className="surface-card">
                                <div className="section-bar">
                                    <h2 className="m-0 flex items-center gap-2 text-[1.05rem] font-bold">
                                        <FaBullseye className="text-[var(--admin-primary)]" /> Tournaments Awaiting Your Prediction ({openTournaments.length})
                                    </h2>
                                    <button type="button" onClick={() => navigate('/spectator/tournaments')} className="action-pill">
                                        View All
                                    </button>
                                </div>
                                {openTournaments.map((t) => (
                                    <div key={t.tournamentId} className="flex items-center gap-4 border-b border-[var(--admin-border)] px-5 py-4 last:border-b-0">
                                        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)] text-lg">
                                            <FaTrophy />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="m-0 font-bold text-[var(--admin-ink)]">{t.tournamentName}</p>
                                            <p className="m-0 text-xs text-[var(--admin-muted)]">
                                                {t.location ?? ''}
                                                {t.race?.raceDate ? ` · ${t.race.raceDate.slice(0, 10)}` : ''}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/spectator/tournaments')}
                                            style={{ padding: '7px 16px', borderRadius: 999, border: 'none', background: '#16305c', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                        >
                                            Predict Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {openTournaments.length === 0 && (
                            <div className="soft-card flex items-center gap-4 p-5">
                                <FaCheckCircle className="text-[2rem] text-[#16864f]" />
                                <div>
                                    <p className="m-0 font-bold">You're all caught up!</p>
                                    <p className="m-0 text-[0.87rem] text-[var(--admin-muted)]">
                                        You've predicted on all open tournaments. Check the leaderboard to see your standing.
                                    </p>
                                </div>
                                <button type="button" onClick={() => navigate('/spectator/leaderboard')} className="secondary-button ml-auto whitespace-nowrap">
                                    View Leaderboard
                                </button>
                            </div>
                        )}

                        {/* Bottom row */}
                        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
                            {/* Recent predictions */}
                            <div className="surface-card">
                                <div className="section-bar">
                                    <h2 className="m-0 text-[1.05rem] font-bold">My Recent Predictions</h2>
                                    <button type="button" onClick={() => navigate('/spectator/predictions')} className="action-pill">
                                        All Predictions
                                    </button>
                                </div>
                                {predictions.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <p className="m-0 font-semibold text-[var(--admin-muted)]">No predictions yet.</p>
                                        <button type="button" onClick={() => navigate('/spectator/tournaments')} className="primary-button mt-4">
                                            Browse Tournaments
                                        </button>
                                    </div>
                                ) : (
                                    predictions.map((p) => (
                                        <div key={p.predictionId} className="flex items-center gap-3 border-b border-[var(--admin-border)] px-5 py-3 last:border-b-0">
                                            <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]"><FaTrophy className="text-sm" /></span>
                                            <div className="min-w-0 flex-1">
                                                <p className="m-0 font-bold text-[0.9rem]">{p.tournamentName ?? '—'}</p>
                                                <p className="m-0 text-xs text-[var(--admin-muted)]">Pick: {p.predictedHorseName}</p>
                                            </div>
                                            <span style={{
                                                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                                                backgroundColor: p.isCorrect === true ? '#e8f7ee' : p.isCorrect === false ? '#f3e1df' : '#faf2e0',
                                                color: p.isCorrect === true ? '#16864f' : p.isCorrect === false ? '#a4392f' : '#8a6209',
                                            }}>
                                                {p.status === 'Cancelled'
                                                    ? 'Cancelled · refunded'
                                                    : p.isCorrect === true
                                                        ? `+${p.pointsAwarded} pts`
                                                        : p.isCorrect === false
                                                            ? 'Wrong'
                                                            : 'Pending'}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Top predictors */}
                            <div className="surface-card">
                                <div className="section-bar">
                                    <h2 className="m-0 flex items-center gap-2 text-[1.05rem] font-bold">
                                        <FaListOl /> Season Top 5
                                    </h2>
                                    <button type="button" onClick={() => navigate('/spectator/leaderboard')} className="action-pill">
                                        Full
                                    </button>
                                </div>
                                {predictors.length === 0 ? (
                                    <p className="m-0 p-5 text-sm text-[var(--admin-muted)]">No data yet.</p>
                                ) : (
                                    predictors.map((p, i) => (
                                        <div key={i} className="flex items-center gap-3 border-b border-[var(--admin-border)] px-5 py-3 last:border-b-0">
                                            <span className="w-6 text-center text-lg">{MEDAL[i] ?? `#${i + 1}`}</span>
                                            <span className="flex-1 truncate font-bold text-[0.9rem]">{p.spectatorName}</span>
                                            <span className="font-black text-[var(--admin-primary)]">{p.points ?? 0} pts</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="surface-card p-6">
                            <h2 className="m-0 mb-5 text-[1.05rem] font-bold">How It Works</h2>
                            <div className="grid grid-cols-3 gap-5 max-[700px]:grid-cols-1">
                                {[
                                    { step: '1', icon: FaTrophy, title: 'Browse Tournaments', desc: 'Explore upcoming tournaments and view the registered horses.' },
                                    { step: '2', icon: FaBullseye, title: 'Make Your Prediction', desc: 'Pick the horse you think will win. One prediction per tournament.' },
                                    { step: '3', icon: FaCoins, title: 'Earn Points & Win', desc: 'Correct predictions earn points. Top predictors at season end win prizes.' },
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-3">
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#16305c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                                            {item.step}
                                        </div>
                                        <div>
                                            <p className="m-0 flex items-center gap-2 font-bold"><item.icon className="text-[var(--admin-primary)]" /> {item.title}</p>
                                            <p className="m-0 mt-1 text-[0.83rem] text-[var(--admin-muted)]">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </section>
        </SpectatorLayout>
    );
}
