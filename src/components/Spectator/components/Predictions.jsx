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
    { key: 'all',     label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'correct', label: 'Correct' },
    { key: 'wrong',   label: 'Wrong' },
];

function PredictionCard({ prediction }) {
    const { isCorrect, pointsAwarded, tournamentName, predictedHorseName, tournamentStatus } = prediction;

    const outcome = isCorrect === true ? 'correct' : isCorrect === false ? 'wrong' : 'pending';
    const accentColor = outcome === 'correct' ? '#155724' : outcome === 'wrong' ? '#721c24' : '#856404';
    const badgeBg     = outcome === 'correct' ? '#d4edda' : outcome === 'wrong' ? '#f8d7da' : '#fff3cd';

    return (
        <article className="surface-card" style={{ overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: 4, background: accentColor, flexShrink: 0 }} />
            <div style={{ flex: 1, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>🐴</span>
                <div style={{ flex: 1, minWidth: 160 }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#0b7f5a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {tournamentName ?? 'Tournament'}
                    </p>
                    <p style={{ margin: '3px 0 0', fontWeight: 700, fontSize: '0.95rem', color: '#2b1b1b' }}>
                        {predictedHorseName}
                    </p>
                    {tournamentStatus && (
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#bbb' }}>
                            Tournament: {tournamentStatus}
                        </p>
                    )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, flexShrink: 0, background: badgeBg, color: accentColor }}>
                    {outcome === 'correct'
                        ? `✓ Correct  +${pointsAwarded ?? 0} pts`
                        : outcome === 'wrong'
                        ? '✗ Wrong'
                        : '⏳ Awaiting Result'}
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
    const pending   = predictions.filter(p => p.isCorrect == null).length;
    const accuracy  = total === 0 ? 0 : Math.round((correct / total) * 100);
    const totalPts  = predictions.reduce((s, p) => s + (p.pointsAwarded ?? 0), 0);

    const stats = [
        { label: 'Total',    value: total,       icon: FaBullseye,    tone: '' },
        { label: 'Correct',  value: correct,     icon: FaCheckCircle, tone: 'green' },
        { label: 'Accuracy', value: `${accuracy}%`, icon: FaPercent,  tone: 'blue' },
        { label: 'Pts Earned', value: `${totalPts}`, icon: FaCoins,   tone: 'gold', suffix: 'pts' },
    ];

    const counts = { all: total, pending, correct, wrong };

    const filtered = predictions.filter(p => {
        if (filter === 'pending') return p.isCorrect == null;
        if (filter === 'correct') return p.isCorrect === true;
        if (filter === 'wrong')   return p.isCorrect === false;
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
                            <div className={`stat-icon ${s.tone === 'green' ? 'bg-[#dff7e9] text-[#118548]' : s.tone === 'blue' ? 'bg-[#e3f2fd] text-[#1565c0]' : s.tone === 'gold' ? 'bg-[#fff3cd] text-[#856404]' : ''}`}>
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
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🐴</div>
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
                        <div className="stat-icon h-9 w-9 bg-[#fff3cd] text-[#856404]">
                            <FaTrophy aria-hidden="true" />
                        </div>
                        <p className="m-0 text-[0.85rem] text-[var(--admin-muted)]">
                            Each correct prediction earns you points. At the end of the season (every 3 months), top predictors receive exclusive rewards. Points reset each season.
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
                                    style={{
                                        padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                        border: filter === f.key ? 'none' : '1px solid #dce5ef',
                                        background: filter === f.key ? '#0b7f5a' : '#fff8f6',
                                        color: filter === f.key ? '#fff' : '#0b7f5a',
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
