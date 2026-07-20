import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaBullseye,
    FaCheckCircle,
    FaCoins,
    FaHorseHead,
    FaPercent,
    FaTrophy,
} from 'react-icons/fa';
import { spectatorApi } from '../../../api/spectatorApi';

const FILTERS = [
    { key: 'all',       label: 'All' },
    { key: 'pending',   label: 'Pending' },
    { key: 'locked',    label: 'Locked' },
    { key: 'correct',   label: 'Correct' },
    { key: 'wrong',     label: 'Wrong' },
    { key: 'cancelled', label: 'Cancelled' },
];

function getOutcome(prediction) {
    const { isCorrect, status } = prediction;
    if (status === 'Cancelled') return 'cancelled';
    if (isCorrect === true)     return 'correct';
    if (isCorrect === false)    return 'wrong';
    if (status === 'Locked')    return 'locked';
    return 'pending';
}

function PredictionCard({ prediction }) {
    const { pointsAwarded, stakePoints, netPoints, seasonName, tournamentName, predictedHorseName, tournamentStatus } = prediction;
    const outcome = getOutcome(prediction);

    const accentColor = {
        correct:   '#16864f',
        wrong:     '#a4392f',
        locked:    '#16305c',
        cancelled: '#6b7280',
        pending:   '#8a6209',
    }[outcome];

    const badgeBg = {
        correct:   '#e8f7ee',
        wrong:     '#f3e1df',
        locked:    'var(--admin-surface-strong)',
        cancelled: '#f1f0ec',
        pending:   '#faf2e0',
    }[outcome];

    const badgeLabel = {
        correct:   `Correct  +${pointsAwarded ?? 0} pts`,
        wrong:     `Wrong  -${stakePoints ?? 0} pts`,
        locked:    'Locked – Awaiting Evaluation',
        cancelled: 'Cancelled · Stake Refunded',
        pending:   'Awaiting Result',
    }[outcome];

    return (
        <article className="surface-card" style={{ overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: 4, background: accentColor, flexShrink: 0 }} />
            <div style={{ flex: 1, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="stat-icon h-11 w-11 flex-shrink-0 bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                    <FaHorseHead aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {tournamentName ?? 'Tournament'}
                    </p>
                    <p style={{ margin: '3px 0 0', fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-ink)' }}>
                        {predictedHorseName}
                    </p>
                    {stakePoints != null && (
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                            Stake: {stakePoints} pts
                            {netPoints != null && outcome !== 'pending' && outcome !== 'locked' && (
                                <span style={{ marginLeft: 8, fontWeight: 700, color: netPoints >= 0 ? '#16864f' : '#a4392f' }}>
                                    Net: {netPoints >= 0 ? '+' : ''}{netPoints} pts
                                </span>
                            )}
                        </p>
                    )}
                    {(seasonName || tournamentStatus) && (
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                            {seasonName ? `Season: ${seasonName}` : ''}
                            {seasonName && tournamentStatus ? ' · ' : ''}
                            {tournamentStatus ? `Tournament: ${tournamentStatus}` : ''}
                        </p>
                    )}
                </div>
                <span className="rounded-full" style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', flexShrink: 0, background: badgeBg, color: accentColor }}>
                    {badgeLabel}
                </span>
            </div>
        </article>
    );
}

export default function Predictions() {
    const navigate = useNavigate();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        spectatorApi.getMyPredictions()
            .then(data => setPredictions(data ?? []))
            .catch(() => setPredictions([]))
            .finally(() => setLoading(false));
    }, []);

    const total     = predictions.length;
    const correct   = predictions.filter(p => p.isCorrect === true).length;
    const wrong     = predictions.filter(p => p.isCorrect === false).length;
    const cancelled = predictions.filter(p => p.status === 'Cancelled').length;
    const locked    = predictions.filter(p => p.status === 'Locked').length;
    const pending   = predictions.filter(p => p.status === 'Pending').length;
    const accuracy  = (correct + wrong) === 0 ? 0 : Math.round((correct / (correct + wrong)) * 100);
    // The backend already normalizes cancelled predictions to netPoints = 0.
    // Summing that field prevents refunded stakes from being counted as losses.
    const netTotal = predictions.reduce((sum, prediction) =>
        sum + (prediction.netPoints ?? 0), 0
    );

    const stats = [
        { label: 'Total',      value: total,           icon: FaBullseye,    tone: '' },
        { label: 'Correct',    value: correct,          icon: FaCheckCircle, tone: 'green' },
        { label: 'Accuracy',   value: `${accuracy}%`,   icon: FaPercent,     tone: 'blue' },
        { label: 'Net Points', value: `${netTotal >= 0 ? '+' : ''}${netTotal}`, icon: FaCoins, tone: netTotal >= 0 ? 'gold' : 'red', suffix: 'pts' },
    ];

    const counts = { all: total, pending, locked, correct, wrong, cancelled };

    const filtered = predictions.filter(p => {
        if (filter === 'pending')   return p.status === 'Pending';
        if (filter === 'locked')    return p.status === 'Locked';
        if (filter === 'correct')   return p.isCorrect === true;
        if (filter === 'wrong')     return p.isCorrect === false;
        if (filter === 'cancelled') return p.status === 'Cancelled';
        return true;
    });

    return (
        <div className="grid gap-7">
            <div>
                <h1 className="page-title">My Predictions</h1>
                <p className="page-subtitle">
                    Track all your tournament predictions and see your results here.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 max-[1000px]:grid-cols-2 max-[500px]:grid-cols-1">
                {stats.map(s => {
                    const Icon = s.icon;
                    return (
                        <article key={s.label} className="stat-card min-h-[110px]">
                            <div className={`stat-icon ${s.tone === 'green' ? 'bg-[#e8f7ee] text-[#16864f]' : s.tone === 'blue' ? 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]' : s.tone === 'gold' ? 'bg-[#faf2e0] text-[#8a6209]' : s.tone === 'red' ? 'bg-[#f3e1df] text-[#a4392f]' : ''}`}>
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

            {/* Empty state */}
            {!loading && total === 0 && (
                <div className="surface-card p-10 text-center">
                    <div className="stat-icon mx-auto mb-3 h-14 w-14 bg-[var(--admin-surface-strong)] text-[var(--admin-primary)] text-2xl">
                        <FaHorseHead aria-hidden="true" />
                    </div>
                    <h3 className="m-0 text-[1.1rem] font-bold">No predictions yet</h3>
                    <p className="m-0 mt-2 text-[0.9rem] text-[var(--admin-muted)]">
                        Go to Tournaments to browse events and make your first prediction!
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/spectator/tournaments')}
                        className="primary-button mt-5"
                    >
                        Browse Tournaments
                    </button>
                </div>
            )}

            {total > 0 && (
                <>
                    {/* How scoring works */}
                    <div className="soft-card flex items-start gap-3 p-4">
                        <div className="stat-icon h-9 w-9 bg-[#faf2e0] text-[#8a6209]">
                            <FaTrophy aria-hidden="true" />
                        </div>
                        <p className="m-0 text-[0.85rem] text-[var(--admin-muted)]">
                            Stakes change your wallet balance. Evaluated prediction payouts also build your season score. Cancelled tournaments refund the stake and count as net 0.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                            {FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    type="button"
                                    onClick={() => setFilter(f.key)}
                                    className="rounded-full"
                                    style={{
                                        padding: '6px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                        border: filter === f.key ? 'none' : '1px solid var(--admin-border)',
                                        background: filter === f.key ? 'var(--admin-primary)' : 'var(--admin-surface)',
                                        color: filter === f.key ? '#fff' : 'var(--admin-primary)',
                                    }}
                                >
                                    {f.label} ({counts[f.key] ?? 0})
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/spectator/tournaments')}
                            className="action-pill"
                        >
                            + Predict on More Tournaments
                        </button>
                    </div>

                    {/* Prediction cards */}
                    {loading ? (
                        <p className="m-0 text-center font-semibold text-[var(--admin-muted)]">Loading...</p>
                    ) : filtered.length === 0 ? (
                        <p className="m-0 rounded-[8px] border border-[var(--admin-border)] bg-white p-8 text-center text-[var(--admin-muted)]">
                            No {filter} predictions.
                        </p>
                    ) : (
                        <div className="grid gap-3">
                            {filtered.map(p => (
                                <PredictionCard key={p.predictionId} prediction={p} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
