import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt,
    FaCheckCircle,
    FaEdit,
    FaHorseHead,
    FaInfoCircle,
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

// ─── Horse detail modal ───────────────────────────────────────────────────────

function HorseDetailModal({ horse, onClose, onSelect }) {
    if (!horse) return null;

    const horseImageUrl = getHorseImageUrl(horse);
    const jockeyImageUrl = horse?.jockeyProfileImageUrl ? resolveFileUrl(horse.jockeyProfileImageUrl) : '';

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 260, backgroundColor: 'rgba(20,10,10,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}
            onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
        >
            <div style={{ width: '100%', maxWidth: 720, borderRadius: 18, overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 30px 80px rgba(20, 12, 12, 0.35)' }}>
                <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#16305c,#28539d)', color: '#fff', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 14, minWidth: 0 }}>
                        <div style={{ width: 78, height: 78, borderRadius: 14, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center' }}>
                            {horseImageUrl ? (
                                <img alt={horse.horseName || 'Horse'} src={horseImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: 34 }}>🐴</span>
                            )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9 }}>Race Entry Profile</p>
                            <h3 style={{ margin: '6px 0 0', fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.2 }}>{horse.horseName || 'Horse'}</h3>
                            <p style={{ margin: '8px 0 0', fontSize: '0.85rem', opacity: 0.92 }}>Owner: <strong>{horse.ownerName || '—'}</strong> · Jockey: <strong>{horse.jockeyName || '—'}</strong></p>
                            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                <span style={{ background: 'rgba(255,255,255,0.12)', padding: '6px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>Breed: {horse.breedName || '—'}</span>
                                <span style={{ background: 'rgba(255,255,255,0.12)', padding: '6px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>Status: {horse.status || horse.registrationStatus || 'Ready'}</span>
                            </div>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} style={{ background: 'rgba(255,255,255,0.14)', color: '#fff', border: 'none', width: 34, height: 34, borderRadius: 999, cursor: 'pointer', flexShrink: 0 }}>
                        <FaTimes />
                    </button>
                </div>

                <div style={{ padding: '22px 24px', display: 'grid', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
                        {[
                            ['Age', horse.age ?? horse.horseAge ?? '—'],
                            ['Height', horse.heightCm ? `${horse.heightCm} cm` : '—'],
                            ['Weight', horse.weightKg || horse.horseWeightKg ? `${horse.weightKg || horse.horseWeightKg} kg` : '—'],
                            ['Health', horse.healthStatus || horse.horseHealthStatus || '—'],
                        ].map(([label, value]) => (
                            <div key={label} style={{ border: '1px solid #e7edf5', borderRadius: 12, background: '#f8fbff', padding: '12px 14px' }}>
                                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>{label}</p>
                                <p style={{ margin: '8px 0 0', fontSize: '0.95rem', fontWeight: 800, color: '#2b1b1b' }}>{value}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div style={{ border: '1px solid #eadfce', borderRadius: 14, padding: 16, background: '#fffaf8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 52, height: 52, borderRadius: 999, overflow: 'hidden', background: '#edf2fa', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                    {jockeyImageUrl ? (
                                        <img alt={horse.jockeyName || 'Jockey'} src={jockeyImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: 22 }}>🏇</span>
                                    )}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Jockey</p>
                                    <h4 style={{ margin: '5px 0 0', fontSize: '1rem', fontWeight: 800, color: '#16305c' }}>{horse.jockeyName || 'No jockey assigned'}</h4>
                                </div>
                            </div>
                            <div style={{ marginTop: 14, display: 'grid', gap: 8, fontSize: '0.82rem', color: '#45556c' }}>
                                <span><strong>Experience:</strong> {horse?.jockey?.yearsOfExperience ?? '—'} years</span>
                                <span><strong>Weight:</strong> {horse?.jockey?.weightKg ? `${horse.jockey.weightKg} kg` : '—'}</span>
                                <span><strong>Health:</strong> {horse?.jockey?.healthStatus || '—'}</span>
                            </div>
                        </div>

                        <div style={{ border: '1px solid #eadfce', borderRadius: 14, padding: 16, background: '#fffaf8' }}>
                            <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Horse achievement</p>
                            <p style={{ margin: '10px 0 0', fontSize: '0.88rem', lineHeight: 1.6, color: '#3a4452' }}>
                                {horse.achievementSummary || horse?.horse?.achievementSummary || 'No achievement summary provided for this entry yet.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '0 24px 22px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onClose} style={{ padding: '11px 18px', borderRadius: 10, border: '1px solid #dce5ef', background: '#fff', color: '#555', fontWeight: 700, cursor: 'pointer' }}>Close</button>
                    <button type="button" onClick={onSelect} style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: '#16305c', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Select this horse</button>
                </div>
            </div>
        </div>
    );
}

function PredictModal({ tournament, prediction, onClose, onSuccess }) {
    const [horses, setHorses] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [selectedDetailHorse, setSelectedDetailHorse] = useState(null);
    const [stakePoints, setStakePoints] = useState(10);
    const [submitting, setSubmitting] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const isEditing = Boolean(prediction?.predictionId);
    const originalStakePoints = isEditing ? Number(prediction?.stakePoints ?? 0) : 0;

    useEffect(() => {
        Promise.all([
            spectatorApi.getTournamentHorses(tournament.tournamentId).catch(() => []),
            spectatorApi.getSpectatorWallet().catch(() => null),
        ]).then(([horseItems, walletData]) => {
            const normalizedHorses = horseItems ?? [];
            setHorses(normalizedHorses);
            setWallet(walletData);

            if (isEditing) {
                const currentHorse = normalizedHorses.find(
                    horse => horse.horseId === prediction.predictedHorseId,
                );
                setSelected(currentHorse ?? null);
                setStakePoints(Number(prediction.stakePoints ?? walletData?.minimumStakePoints ?? 10));
            } else if (walletData?.minimumStakePoints) {
                setStakePoints(walletData.minimumStakePoints);
            }
        }).finally(() => setLoading(false));
    }, [isEditing, prediction?.predictedHorseId, prediction?.stakePoints, tournament.tournamentId]);

    const minStake = wallet?.minimumStakePoints ?? 10;
    const availableForPrediction = (wallet?.bettingPoints ?? 9999) + originalStakePoints;
    const maxStake = Math.max(minStake, availableForPrediction);
    const remaining = wallet
        ? Math.max(0, wallet.bettingPoints + originalStakePoints - stakePoints)
        : null;
    const stakeValid = stakePoints >= minStake && stakePoints <= maxStake;

    const handleStakeChange = (e) => {
        const val = parseInt(e.target.value) || minStake;
        setStakePoints(Math.min(Math.max(minStake, val), maxStake));
    };

    const handleSubmit = async () => {
        if (!selected) return;
        if (!stakeValid) {
            showToast(`Stake must be between ${minStake} and ${maxStake} points.`, 'error');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                predictedHorseId: selected.horseId,
                stakePoints,
            };

            const result = isEditing
                ? await spectatorApi.updatePrediction(prediction.predictionId, payload)
                : await spectatorApi.createPrediction({
                    tournamentId: tournament.tournamentId,
                    ...payload,
                });

            onSuccess({
                ...result,
                tournamentId: tournament.tournamentId,
                predictionId: result?.predictionId ?? prediction?.predictionId,
                predictedHorseId: selected.horseId,
                predictedHorseName: selected.horseName,
                predictedHorseImageUrl: selected.imageUrl ?? selected.horseImageUrl ?? null,
                predictedOwnerName: selected.ownerName ?? null,
                predictedJockeyName: selected.jockeyName ?? null,
                stakePoints,
                status: result?.status ?? 'Pending',
                isCorrect: null,
                pointsAwarded: 0,
            });
        } catch (err) {
            showToast(
                err.message || (isEditing
                    ? 'Failed to update prediction. Please try again.'
                    : 'Failed to submit prediction. Please try again.'),
                'error',
            );
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
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: '#16305c', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{isEditing ? '✏️ Edit Tournament Prediction' : '🏆 Tournament Prediction'}</p>
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
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16305c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💰 Current Balance</span>
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
                        <span>
                            {isEditing
                                ? <>You may change the horse or stake before the prediction deadline. Your previous stake is reused automatically.</>
                                : <>Select a horse and set your stake. You can edit it before the prediction deadline.</>}
                        </span>
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
                                        onClick={() => { setSelected(h); setSelectedDetailHorse(h); }}
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
                                            <p style={{ margin: '6px 0 0', fontSize: '0.7rem', fontWeight: 700, color: '#16305c' }}>Tap card to view horse & jockey profile</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(event) => { event.stopPropagation(); setSelected(h); setSelectedDetailHorse(h); }}
                                            style={{ border: 'none', background: 'transparent', color: '#16305c', cursor: 'pointer', display: 'grid', placeItems: 'center', width: 30, height: 30, flexShrink: 0 }}
                                            title="View horse details"
                                        >
                                            <FaInfoCircle />
                                        </button>
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
                                <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: '#777' }}>
                                    {selected.ownerName ? `Owner: ${selected.ownerName}` : 'Owner: —'}
                                    {' · '}
                                    {selected.jockeyName ? `Jockey: ${selected.jockeyName}` : 'Jockey: —'}
                                </p>
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
                            {submitting
                                ? (isEditing ? 'Saving Changes...' : 'Submitting...')
                                : selected
                                    ? `${isEditing ? 'Save Changes' : 'Confirm'} — ${stakePoints} pts on ${selected.horseName}`
                                    : 'Select a Horse First'}
                        </button>
                    </div>
                </div>
            </div>
            <HorseDetailModal
                horse={selectedDetailHorse}
                onClose={() => setSelectedDetailHorse(null)}
                onSelect={() => {
                    if (selectedDetailHorse) {
                        setSelected(selectedDetailHorse);
                    }
                    setSelectedDetailHorse(null);
                }}
            />
        </div>
    );
}

// ─── Tournament card ──────────────────────────────────────────────────────────

function TournamentCard({ tournament, myPrediction, onPredict, onReplay }) {
    const s = getStatusStyle(tournament.status);
    const predictionData = myPrediction ?? tournament.myPrediction ?? null;
    const hasPredicted = Boolean(predictionData) || tournament.hasPredicted;
    const horseName = predictionData?.predictedHorseName;
    const ownerName = predictionData?.predictedOwnerName;
    const jockeyName = predictionData?.predictedJockeyName;
    const stakePoints = predictionData?.stakePoints ?? 0;
    const isCorrect = predictionData?.isCorrect;
    const predStatus = predictionData?.status ?? predictionData?.predictionStatus ?? null;
    const isLocked = predStatus === 'Locked';
    const pts = predictionData?.pointsAwarded ?? 0;
    const open = canPredict(tournament);
    const canEdit = Boolean(tournament.canEditPrediction) &&
        predStatus === 'Pending' &&
        Boolean(predictionData?.predictionId);
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
                                    <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: '#777', lineHeight: 1.45 }}>
                                        Owner: <strong>{ownerName ?? '—'}</strong>
                                        {' · '}
                                        Jockey: <strong>{jockeyName ?? '—'}</strong>
                                        {stakePoints > 0 && <> · Stake: <strong>{stakePoints.toLocaleString()} pts</strong></>}
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
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={() => onPredict(tournament, predictionData)}
                                    style={{
                                        width: '100%', padding: '9px 12px', borderRadius: 8,
                                        border: '1.5px solid #16305c', background: '#fff', color: '#16305c',
                                        fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                    }}
                                >
                                    <FaEdit /> Edit Prediction
                                </button>
                            )}
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

    // getMyPredictions returns history across all seasons. Only predictions that
    // belong to the tournaments currently displayed may affect this page's counters.
    const visibleTournamentIds = new Set(tournaments.map(t => t.tournamentId));
    const visiblePredictions = predictions.filter(p =>
        p.status !== 'Cancelled' && visibleTournamentIds.has(p.tournamentId)
    );
    const predMap = Object.fromEntries(visiblePredictions.map(p => [p.tournamentId, p]));

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

    const handlePredictSuccess = (updatedPrediction) => {
        setModal(null);
        setPredictions(prev => [
            ...prev.filter(p => p.tournamentId !== updatedPrediction.tournamentId),
            updatedPrediction,
        ]);
        setTournaments(prev => prev.map(tournament => {
            if (tournament.tournamentId !== updatedPrediction.tournamentId) return tournament;

            return {
                ...tournament,
                hasPredicted: true,
                canPredict: false,
                canEditPrediction: true,
                myPrediction: {
                    ...updatedPrediction,
                    predictionStatus: updatedPrediction.status,
                },
            };
        }));
    };

    return (
        <div className="grid gap-7">
            <div>
                <h1 className="page-title">Tournaments</h1>
                <p className="page-subtitle">
                    Browse tournaments, review Owner and Jockey information, and edit your pending prediction before the deadline.
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
                            onPredict={(tournament, prediction) => setModal({ tournament, prediction })}
                            onReplay={(raceId) => navigate(`/spectator/races/${raceId}/replay`)}
                        />
                    ))}
                </div>
            )}

            {modal && (
                <PredictModal
                    tournament={modal.tournament}
                    prediction={modal.prediction}
                    onClose={() => setModal(null)}
                    onSuccess={handlePredictSuccess}
                />
            )}
        </div>
    );
}
