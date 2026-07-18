import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt,
    FaCheckCircle,
    FaHorseHead,
    FaMapMarkerAlt,
    FaPlay,
    FaTimes,
    FaTrophy,
} from 'react-icons/fa';
import { spectatorApi } from '../../../api/spectatorApi';
import { resolveFileUrl } from '../../../api/uploadApi';
import { formatCurrency } from '../../../utils/currency';
import Toast from '../../shared/Toast';
import { useToast } from '../../shared/useToast';

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_BADGE = {
    OpenRegistration: { bg: '#e8f7ee', color: '#16864f', label: 'Open' },
    Scheduled:        { bg: '#edf2fa', color: '#16305c', label: 'Scheduled' },
    Ongoing:          { bg: '#faf2e0', color: '#8a6209', label: 'Ongoing' },
    Completed:        { bg: '#efe8d6', color: '#6b6456', label: 'Completed' },
};

function getStatusStyle(status) {
    return STATUS_BADGE[status] ?? { bg: '#edf2fa', color: '#16305c', label: status };
}

const RACE_CLOSED_FOR_PREDICTION = ['Ongoing', 'Finished', 'ResultPending', 'Published', 'Cancelled'];

function canPredict(tournament) {
    if (!tournament) return false;
    if (typeof tournament.canPredict === 'boolean') return tournament.canPredict;
    if (tournament.status === 'Completed' || tournament.status === 'Cancelled') return false;
    const raceStatus = tournament.race?.status;
    if (!raceStatus) return false;
    return !RACE_CLOSED_FOR_PREDICTION.includes(raceStatus);
}

function getPredictionUnavailableReason(tournament) {
    return tournament?.predictionUnavailableReason || 'Prediction period has ended';
}

function getHorseImageUrl(horse) {
    const imageUrl = horse?.imageUrl ?? horse?.ImageUrl;
    return imageUrl ? resolveFileUrl(imageUrl) : '';
}

function canWatchReplay(tournament) {
    return tournament?.status === 'Completed'
        && tournament.race?.status === 'Published'
        && !!tournament.race?.raceId;
}

// ─── Predict Modal ────────────────────────────────────────────────────────────

function PredictModal({ tournament, onClose, onSuccess }) {
    const [horses, setHorses] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [stakePoints, setStakePoints] = useState(10);
    const [submitting, setSubmitting] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        Promise.all([
            spectatorApi.getTournamentHorses(tournament.tournamentId).catch(() => []),
            spectatorApi.getSpectatorWallet().catch(() => null),
        ]).then(([h, w]) => {
            setHorses(h ?? []);
            setWallet(w);
            if (w?.minimumStakePoints) setStakePoints(w.minimumStakePoints);
        }).finally(() => setLoading(false));
    }, [tournament.tournamentId]);

    const minStake = wallet?.minimumStakePoints ?? 10;
    const maxStake = wallet?.bettingPoints ?? 9999;
    const remaining = wallet ? Math.max(0, wallet.bettingPoints - stakePoints) : null;
    const stakeValid = stakePoints >= minStake && stakePoints <= maxStake;

    const handleStakeChange = (e) => {
        const val = parseInt(e.target.value) || minStake;
        setStakePoints(Math.min(Math.max(minStake, val), maxStake));
    };

    const handleSubmit = async () => {
        if (!selected) return;
        if (!stakeValid) { showToast(`Stake must be between ${minStake} and ${maxStake} points.`, 'error'); return; }
        setSubmitting(true);
        try {
            await spectatorApi.createPrediction({
                tournamentId: tournament.tournamentId,
                predictedHorseId: selected.horseId,
                stakePoints,
            });
            onSuccess(tournament.tournamentId, selected);
        } catch (err) {
            showToast(err.message || 'Failed to submit prediction. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const raceDate = tournament.race?.raceDate ? tournament.race.raceDate.slice(0, 10) : null;
    const raceStatus = tournament.race?.status ?? null;

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(20,10,10,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
            />
            <div style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 700, boxShadow: '0 32px 80px rgba(37,18,14,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>

                {/* ── Header ── */}
                <div style={{ padding: '22px 28px 18px', borderBottom: '1px solid #f0e8e6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0, background: '#fdfaf9' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, minWidth: 0 }}>
                        <img
                            src={tournament.imageUrl ? resolveFileUrl(tournament.imageUrl) : '/GoldenDerby.jpg'}
                            alt={tournament.tournamentName}
                            style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/GoldenDerby.jpg'; }}
                        />
                        <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: '#16305c', textTransform: 'uppercase', letterSpacing: '0.07em' }}>🏆 Tournament Prediction</p>
                            <h3 style={{ margin: '5px 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#2b1b1b', lineHeight: 1.3 }}>{tournament.tournamentName}</h3>
                            {/* Meta row */}
                            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: '0.78rem', color: '#888' }}>
                                {tournament.location && <span>📍 {tournament.location}</span>}
                                {raceDate && <span>📅 Race: {raceDate}</span>}
                                {tournament.prizePool > 0 && <span>🏅 Prize: {formatCurrency(tournament.prizePool)}</span>}
                                {raceStatus && (
                                    <span style={{ fontWeight: 700, color: raceStatus === 'Scheduled' ? '#1565c0' : '#856404' }}>
                                        ⚑ {raceStatus}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 18, padding: '2px 4px', lineHeight: 1, flexShrink: 0 }}>
                        <FaTimes />
                    </button>
                </div>

                {/* ── Wallet strip ── */}
                {wallet && (
                    <div style={{ padding: '12px 28px', background: '#f0faf5', borderBottom: '1px solid #d4edda', flexShrink: 0, display: 'flex', gap: 0, alignItems: 'stretch' }}>
                        <div style={{ flex: 1, borderRight: '1px solid #c3e6cb', paddingRight: 14, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16305c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💰 Balance</span>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#16305c' }}>{wallet.bettingPoints.toLocaleString()} pts</span>
                        </div>
                        <div style={{ flex: 1, paddingLeft: 14, borderRight: '1px solid #c3e6cb', paddingRight: 14, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min Stake</span>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#333' }}>{wallet.minimumStakePoints ?? 10} pts</span>
                        </div>
                        <div style={{ flex: 1, paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>After Stake</span>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: remaining < 0 ? '#a4392f' : '#333' }}>
                                {remaining !== null ? remaining.toLocaleString() : '—'} pts
                            </span>
                        </div>
                    </div>
                )}

                {/* ── Instruction bar ── */}
                <div style={{ padding: '10px 28px', background: '#fffdf8', borderBottom: '1px solid #f0e8e6', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#777', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span style={{ flexShrink: 0 }}>ℹ️</span>
                        <span>Select a horse and set your stake. <strong>You can only predict once</strong> per tournament — choose carefully!</span>
                    </p>
                </div>

                {/* ── Horse list ── */}
                <div style={{ padding: '16px 28px', overflowY: 'auto', flex: 1 }}>
                    {loading ? (
                        <p style={{ margin: 0, textAlign: 'center', color: '#999', padding: '30px 0', fontSize: '0.9rem' }}>Loading horses...</p>
                    ) : horses.length === 0 ? (
                        <p style={{ margin: 0, textAlign: 'center', color: '#bbb', padding: '30px 0', fontSize: '0.9rem' }}>
                            No horses registered for this tournament yet.
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                            {horses.map((h, idx) => {
                                const isSel = selected?.horseId === h.horseId;
                                const horseImageUrl = getHorseImageUrl(h);
                                return (
                                    <button
                                        key={h.horseId}
                                        type="button"
                                        onClick={() => setSelected(h)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                                            border: isSel ? '2px solid #16305c' : '1.5px solid #e8eef5',
                                            background: isSel ? '#f0fdf7' : '#fff',
                                            textAlign: 'left', width: '100%',
                                            transition: 'border-color 0.15s, background 0.15s',
                                        }}
                                    >
                                        {/* Lane number */}
                                        <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSel ? '#16305c' : '#f0f4f8', color: isSel ? '#fff' : '#888', fontWeight: 800, fontSize: '0.85rem' }}>
                                            {idx + 1}
                                        </div>
                                        {/* Horse image */}
                                        {horseImageUrl ? (
                                            <img
                                                alt={h.horseName || 'Horse'}
                                                src={horseImageUrl}
                                                style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: 22, flexShrink: 0 }}>🐴</span>
                                        )}
                                        {/* Info */}
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', color: '#2b1b1b' }}>{h.horseName}</p>
                                            <div style={{ marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: '2px 10px', fontSize: '0.73rem', color: '#999' }}>
                                                {h.ownerName && <span>👤 Owner: <strong style={{ color: '#555' }}>{h.ownerName}</strong></span>}
                                                {h.jockeyName && <span>🏇 Jockey: <strong style={{ color: '#555' }}>{h.jockeyName}</strong></span>}
                                            </div>
                                        </div>
                                        {isSel && <FaCheckCircle style={{ color: '#16305c', flexShrink: 0, fontSize: 17 }} />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div style={{ padding: '16px 28px 20px', borderTop: '1px solid #f0e8e6', flexShrink: 0, background: '#fdfaf9' }}>
                    {/* Stake row */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 10 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#555', marginBottom: 5 }}>
                                Stake Points
                                {wallet && <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 5 }}>({minStake}–{maxStake.toLocaleString()})</span>}
                            </label>
                            <input
                                type="number"
                                min={minStake}
                                max={maxStake}
                                value={stakePoints}
                                onChange={handleStakeChange}
                                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${!stakeValid && wallet ? '#dc3545' : '#dce5ef'}`, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                        {/* Quick-pick buttons */}
                        {wallet && (
                            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                                {[25, 50, 100].map(pct => {
                                    const val = Math.max(minStake, Math.floor(wallet.bettingPoints * pct / 100));
                                    if (val > wallet.bettingPoints) return null;
                                    return (
                                        <button key={pct} type="button" onClick={() => setStakePoints(val)}
                                            style={{ padding: '9px 10px', borderRadius: 8, border: '1.5px solid #dce5ef', background: '#fff', fontSize: '0.73rem', fontWeight: 700, color: '#16305c', cursor: 'pointer' }}>
                                            {pct}%
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Summary box when horse selected */}
                    {selected && (
                        <div style={{ marginBottom: 10, padding: '10px 14px', background: '#f0fdf7', border: '1.5px solid #c3e6cb', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: '#16305c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Bet</p>
                                <p style={{ margin: '1px 0 0', fontSize: '0.88rem', fontWeight: 800, color: '#2b1b1b' }}>🐴 {selected.horseName}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Staking</p>
                                <p style={{ margin: '1px 0 0', fontSize: '0.88rem', fontWeight: 800, color: '#16305c' }}>{stakePoints.toLocaleString()} pts</p>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 9, fontWeight: 600, border: '1.5px solid #dce5ef', background: '#fff', color: '#555', cursor: 'pointer', fontSize: '0.88rem' }}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!selected || submitting || !stakeValid}
                            style={{
                                flex: 2, padding: '11px 0', borderRadius: 9, fontWeight: 700, fontSize: '0.9rem',
                                border: 'none',
                                background: selected && !submitting && stakeValid ? '#16305c' : '#ddd',
                                color: selected && !submitting && stakeValid ? '#fff' : '#999',
                                cursor: selected && !submitting && stakeValid ? 'pointer' : 'not-allowed',
                            }}
                        >
                            {submitting ? 'Submitting...' : selected ? `Confirm — ${stakePoints} pts on ${selected.horseName}` : 'Select a Horse First'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Tournament card ──────────────────────────────────────────────────────────

function TournamentCard({ tournament, myPrediction, onPredict, onReplay }) {
    const s = getStatusStyle(tournament.status);
    const hasPredicted = !!myPrediction || tournament.hasPredicted;
    const horseName = myPrediction?.predictedHorseName ?? tournament.myPrediction?.predictedHorseName;
    const isCorrect = myPrediction?.isCorrect;
    const predStatus = myPrediction?.status ?? null;
    const isLocked = predStatus === 'Locked';
    const pts = myPrediction?.pointsAwarded ?? 0;
    const open = canPredict(tournament);
    const replayOpen = canWatchReplay(tournament);

    return (
        <article className="surface-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Status stripe */}
            <div style={{ height: 4, background: hasPredicted ? (isCorrect === true ? '#16864f' : isCorrect === false ? '#a4392f' : isLocked ? '#16305c' : '#8a6209') : (open ? '#16305c' : '#ccc') }} />

            {/* Tournament image */}
            <img
                src={tournament.imageUrl ? resolveFileUrl(tournament.imageUrl) : '/GoldenDerby.jpg'}
                alt={tournament.tournamentName}
                style={{ width: '100%', height: 120, objectFit: 'cover', flexShrink: 0 }}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/GoldenDerby.jpg'; }}
            />

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
                            {tournament.prizePool && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaTrophy /> {formatCurrency(tournament.prizePool)}</span>}
                        </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, flexShrink: 0, background: s.bg, color: s.color }}>
                        {s.label}
                    </span>
                </div>

                {/* Prediction section */}
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f5eeec', display: 'grid', gap: 10 }}>
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
                                fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, flexShrink: 0,
                                background: isCorrect === true ? '#e8f7ee' : isCorrect === false ? '#f3e1df' : isLocked ? '#edf2fa' : '#faf2e0',
                                color: isCorrect === true ? '#16864f' : isCorrect === false ? '#a4392f' : isLocked ? '#16305c' : '#8a6209',
                            }}>
                                {isCorrect === true ? `✓ Correct  +${pts} pts` : isCorrect === false ? '✗ Wrong' : isLocked ? 'Locked' : 'Pending Result'}
                            </span>
                        </div>
                    ) : open ? (
                        // Can predict
                        <button
                            type="button"
                            onClick={() => onPredict(tournament)}
                            style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: '#16305c', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                        >
                            <FaHorseHead /> Make Prediction
                        </button>
                    ) : !replayOpen ? (
                        <p style={{ margin: 0, fontSize: '0.83rem', color: '#bbb', textAlign: 'center' }}>
                            {getPredictionUnavailableReason(tournament)}
                        </p>
                    ) : null}

                    {replayOpen && (
                        <button
                            type="button"
                            onClick={() => onReplay(tournament.race.raceId)}
                            style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: '1px solid #16305c', background: '#fff', color: '#16305c', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                        >
                            <FaPlay /> Watch Official Replay
                        </button>
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
    const navigate = useNavigate();
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
        if (filter === 'open') return canPredict(t) && !predMap[t.tournamentId];
        if (filter === 'predicted') return !!predMap[t.tournamentId];
        if (filter === 'completed') return t.status === 'Completed';
        return true;
    });

    const counts = {
        all: tournaments.length,
        open: tournaments.filter(t => canPredict(t) && !predMap[t.tournamentId]).length,
        predicted: Object.keys(predMap).length,
        completed: tournaments.filter(t => t.status === 'Completed').length,
    };

    const handlePredictSuccess = (tournamentId, horse) => {
        setModal(null);
        setPredictions(prev => [
            ...prev.filter(p => p.tournamentId !== tournamentId),
            { predictionId: Date.now(), tournamentId, predictedHorseId: horse.horseId, predictedHorseName: horse.horseName, isCorrect: null, pointsAwarded: 0, status: 'Pending' },
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
                    { label: 'Open for Prediction', value: counts.open,   bg: '#e8f7ee', color: '#16864f' },
                    { label: 'You Predicted',       value: counts.predicted, bg: '#edf2fa', color: '#16305c' },
                    { label: 'Completed',           value: counts.completed, bg: '#efe8d6', color: '#6b6456' },
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
                            border: filter === f.key ? 'none' : '1px solid #dce5ef',
                            background: filter === f.key ? '#16305c' : '#fff8f6',
                            color: filter === f.key ? '#fff' : '#16305c',
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
                            onReplay={(raceId) => navigate(`/spectator/races/${raceId}/replay`)}
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
