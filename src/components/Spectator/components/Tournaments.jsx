import { useEffect, useState } from 'react';
import {
    FaCalendarAlt,
    FaCheckCircle,
    FaHorseHead,
    FaMapMarkerAlt,
    FaTimes,
    FaTrophy,
} from 'react-icons/fa';
import { spectatorApi } from '../../../api/spectatorApi';

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_BADGE = {
    OpenRegistration: { bg: '#d4edda', color: '#155724', label: 'Open' },
    Scheduled:        { bg: '#e3f2fd', color: '#1565c0', label: 'Scheduled' },
    Ongoing:          { bg: '#fff3cd', color: '#856404', label: 'Ongoing' },
    Completed:        { bg: '#f1f1f1', color: '#555',    label: 'Completed' },
};

function getStatusStyle(status) {
    return STATUS_BADGE[status] ?? { bg: '#f7efee', color: '#7d0000', label: status };
}

function canPredict(status) {
    return status === 'OpenRegistration' || status === 'Scheduled';
}

// ─── Predict Modal ────────────────────────────────────────────────────────────

function PredictModal({ tournament, onClose, onSuccess }) {
    const [horses, setHorses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        spectatorApi.getTournamentHorses(tournament.tournamentId)
            .then(setHorses)
            .catch(() => setHorses([]))
            .finally(() => setLoading(false));
    }, [tournament.tournamentId]);

    const handleSubmit = async () => {
        if (!selected) return;
        setSubmitting(true);
        setError('');
        try {
            await spectatorApi.createPrediction({
                tournamentId: tournament.tournamentId,
                predictedHorseId: selected.horseId,
            });
            onSuccess(tournament.tournamentId, selected);
        } catch (err) {
            setError(err.message || 'Failed to submit prediction. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(30,15,15,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ backgroundColor: '#fff', borderRadius: 14, width: '100%', maxWidth: 500, boxShadow: '0 32px 80px rgba(37,18,14,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                {/* Header */}
                <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #f0e8e6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
                    <div>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#7d0000', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tournament Prediction</p>
                        <h3 style={{ margin: '4px 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#2b1b1b', lineHeight: 1.3 }}>{tournament.tournamentName}</h3>
                        {tournament.location && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#999' }}>📍 {tournament.location}</p>}
                    </div>
                    <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 18, padding: '2px 4px', lineHeight: 1 }}>
                        <FaTimes />
                    </button>
                </div>

                {/* Instructions */}
                <div style={{ padding: '14px 24px 10px', background: '#fffaf8', borderBottom: '1px solid #f0e8e6', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.83rem', color: '#666', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span>ℹ️</span>
                        <span>Pick the horse you think will win this tournament. <strong>You can only predict once</strong> — choose carefully!</span>
                    </p>
                </div>

                {/* Horse list */}
                <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
                    {loading ? (
                        <p style={{ margin: 0, textAlign: 'center', color: '#999', padding: '30px 0', fontSize: '0.9rem' }}>Loading registered horses...</p>
                    ) : horses.length === 0 ? (
                        <p style={{ margin: 0, textAlign: 'center', color: '#bbb', padding: '30px 0', fontSize: '0.9rem' }}>
                            No horses registered for this tournament yet.
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gap: 8 }}>
                            {horses.map((h) => {
                                const isSel = selected?.horseId === h.horseId;
                                return (
                                    <button
                                        key={h.horseId}
                                        type="button"
                                        onClick={() => setSelected(h)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '11px 14px', borderRadius: 10, cursor: 'pointer',
                                            border: isSel ? '2px solid #7d0000' : '1px solid #edcfc9',
                                            background: isSel ? '#fff5f5' : '#fff',
                                            textAlign: 'left', width: '100%',
                                        }}
                                    >
                                        <span style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSel ? '#7d0000' : '#f1e2df', fontSize: 18 }}>
                                            🐴
                                        </span>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', color: '#2b1b1b' }}>{h.horseName}</p>
                                            {(h.ownerName || h.jockeyName) && (
                                                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#999' }}>
                                                    {[h.ownerName && `Owner: ${h.ownerName}`, h.jockeyName && `Jockey: ${h.jockeyName}`].filter(Boolean).join(' · ')}
                                                </p>
                                            )}
                                        </div>
                                        {isSel && <FaCheckCircle style={{ color: '#7d0000', flexShrink: 0, fontSize: 18 }} />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #f0e8e6', flexShrink: 0 }}>
                    {error && <p style={{ margin: '0 0 10px', fontSize: '0.83rem', color: '#721c24', background: '#f8d7da', padding: '9px 13px', borderRadius: 7 }}>{error}</p>}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 8, fontWeight: 600, border: '1px solid #edcfc9', background: '#fff', color: '#555', cursor: 'pointer', fontSize: '0.9rem' }}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!selected || submitting}
                            style={{
                                flex: 2, padding: '11px 0', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem',
                                border: 'none',
                                background: selected && !submitting ? '#7d0000' : '#ddd',
                                color: selected && !submitting ? '#fff' : '#999',
                                cursor: selected && !submitting ? 'pointer' : 'not-allowed',
                            }}
                        >
                            {submitting ? 'Submitting...' : selected ? `Confirm: ${selected.horseName}` : 'Select a Horse First'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Tournament card ──────────────────────────────────────────────────────────

function TournamentCard({ tournament, myPrediction, onPredict }) {
    const s = getStatusStyle(tournament.status);
    const hasPredicted = !!myPrediction || tournament.hasPredicted;
    const horseName = myPrediction?.predictedHorseName ?? tournament.myPrediction?.predictedHorseName;
    const isCorrect = myPrediction?.isCorrect;
    const pts = myPrediction?.pointsAwarded ?? 0;
    const open = canPredict(tournament.status);

    return (
        <article className="surface-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Status stripe */}
            <div style={{ height: 4, background: hasPredicted ? (isCorrect === true ? '#155724' : isCorrect === false ? '#721c24' : '#856404') : (open ? '#7d0000' : '#ccc') }} />

            <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Tournament info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#2b1b1b', lineHeight: 1.3 }}>
                            {tournament.tournamentName}
                        </h3>
                        <div style={{ marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: '0.8rem', color: '#999' }}>
                            {tournament.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaMapMarkerAlt /> {tournament.location}</span>}
                            {tournament.race?.raceDate && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaCalendarAlt /> {tournament.race.raceDate.slice(0, 10)}</span>}
                            {tournament.prizePool && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaTrophy /> ${Number(tournament.prizePool).toLocaleString()}</span>}
                        </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, flexShrink: 0, background: s.bg, color: s.color }}>
                        {s.label}
                    </span>
                </div>

                {/* Prediction section */}
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f5eeec' }}>
                    {hasPredicted ? (
                        // Already predicted
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: 22, flexShrink: 0 }}>🐴</span>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: '0.73rem', color: '#999', fontWeight: 600, textTransform: 'uppercase' }}>Your Pick</p>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', color: '#2b1b1b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {horseName ?? '—'}
                                    </p>
                                </div>
                            </div>
                            <span style={{
                                fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, flexShrink: 0,
                                background: isCorrect === true ? '#d4edda' : isCorrect === false ? '#f8d7da' : '#fff3cd',
                                color: isCorrect === true ? '#155724' : isCorrect === false ? '#721c24' : '#856404',
                            }}>
                                {isCorrect === true ? `✓ Correct  +${pts} pts` : isCorrect === false ? '✗ Wrong' : '⏳ Pending Result'}
                            </span>
                        </div>
                    ) : open ? (
                        // Can predict
                        <button
                            type="button"
                            onClick={() => onPredict(tournament)}
                            style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: '#7d0000', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                        >
                            <FaHorseHead /> Make Prediction
                        </button>
                    ) : (
                        // Closed, no prediction made
                        <p style={{ margin: 0, fontSize: '0.83rem', color: '#bbb', textAlign: 'center' }}>
                            Prediction period has ended
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

const FILTERS = [
    { key: 'all',       label: 'All' },
    { key: 'open',      label: 'Open for Prediction' },
    { key: 'predicted', label: 'Predicted' },
    { key: 'completed', label: 'Completed' },
];

export default function Tournaments() {
    const [tournaments, setTournaments] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [modal, setModal] = useState(null);

    useEffect(() => {
        Promise.all([
            spectatorApi.getSpectatorTournaments().catch(() => []),
            spectatorApi.getMyPredictions().catch(() => []),
        ]).then(([tours, preds]) => {
            setTournaments(tours ?? []);
            setPredictions(preds ?? []);
        }).finally(() => setLoading(false));
    }, []);

    const predMap = Object.fromEntries(predictions.map(p => [p.tournamentId, p]));

    const filtered = tournaments.filter(t => {
        if (filter === 'open') return canPredict(t.status) && !predMap[t.tournamentId];
        if (filter === 'predicted') return !!predMap[t.tournamentId];
        if (filter === 'completed') return t.status === 'Completed';
        return true;
    });

    const counts = {
        all: tournaments.length,
        open: tournaments.filter(t => canPredict(t.status) && !predMap[t.tournamentId]).length,
        predicted: Object.keys(predMap).length,
        completed: tournaments.filter(t => t.status === 'Completed').length,
    };

    const handlePredictSuccess = (tournamentId, horse) => {
        setModal(null);
        setPredictions(prev => [
            ...prev.filter(p => p.tournamentId !== tournamentId),
            { predictionId: Date.now(), tournamentId, predictedHorseId: horse.horseId, predictedHorseName: horse.horseName, isCorrect: null, pointsAwarded: 0 },
        ]);
    };

    return (
        <div className="grid gap-7">
            <div>
                <h1 className="page-title">Tournaments</h1>
                <p className="page-subtitle">
                    Browse all tournaments. Pick the horse you think will win — one prediction per tournament.
                </p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[500px]:grid-cols-1">
                {[
                    { label: 'Total Tournaments', value: counts.all,      bg: '', color: '' },
                    { label: 'Open for Prediction', value: counts.open,   bg: '#d4edda', color: '#155724' },
                    { label: 'You Predicted',       value: counts.predicted, bg: '#e3f2fd', color: '#1565c0' },
                    { label: 'Completed',           value: counts.completed, bg: '#f1f1f1', color: '#555' },
                ].map(s => (
                    <div key={s.label} className="surface-card p-4">
                        <p className="m-0 text-xs font-black uppercase text-[var(--admin-muted)]">{s.label}</p>
                        <p className="m-0 mt-1 text-[1.8rem] font-black" style={{ color: s.color || 'var(--admin-primary)' }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => setFilter(f.key)}
                        style={{
                            padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            border: filter === f.key ? 'none' : '1px solid #edcfc9',
                            background: filter === f.key ? '#7d0000' : '#fff8f6',
                            color: filter === f.key ? '#fff' : '#7d0000',
                        }}
                    >
                        {f.label} {counts[f.key] != null ? `(${counts[f.key]})` : ''}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <p className="m-0 text-center font-semibold text-[var(--admin-muted)]">Loading tournaments...</p>
            ) : filtered.length === 0 ? (
                <div className="surface-card p-10 text-center">
                    <p className="m-0 text-[var(--admin-muted)]">
                        {filter === 'open' ? 'No open tournaments right now. Check back soon!' : 'No tournaments found.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-5 max-[820px]:grid-cols-1">
                    {filtered.map(t => (
                        <TournamentCard
                            key={t.tournamentId}
                            tournament={t}
                            myPrediction={predMap[t.tournamentId]}
                            onPredict={setModal}
                        />
                    ))}
                </div>
            )}

            {modal && (
                <PredictModal
                    tournament={modal}
                    onClose={() => setModal(null)}
                    onSuccess={handlePredictSuccess}
                />
            )}
        </div>
    );
}
