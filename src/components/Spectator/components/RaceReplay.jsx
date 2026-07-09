import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { spectatorApi } from '../../../api/spectatorApi';

// ── Medal helpers ─────────────────────────────────────────────────────────────
const MEDALS = ['🥇', '🥈', '🥉'];
function medal(rank) { return MEDALS[rank - 1] ?? `#${rank}`; }

function formatTime(ms) {
    const s = (ms / 1000).toFixed(2);
    return `${s}s`;
}

// ── Single lane ───────────────────────────────────────────────────────────────
function Lane({ runner, progress, finished }) {
    const pct = Math.min(progress * 100, 100);
    // Horse stops at 96% while running, jumps to finish line at 100%
    const horsePct = finished ? 96 : Math.min(pct, 94);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            {/* Lane number */}
            <div style={{
                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                background: runner.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 800,
            }}>
                {runner.lane}
            </div>

            {/* Track */}
            <div style={{ flex: 1, position: 'relative', height: 44, background: '#f5f0eb', borderRadius: 8, overflow: 'hidden', border: '1px solid #e8ddd5' }}>
                {/* Progress fill */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, height: '100%',
                    width: `${pct}%`,
                    background: `${runner.color}22`,
                    transition: 'width 0.1s linear',
                }} />

                {/* Finish line */}
                <div style={{
                    position: 'absolute', top: 0, right: '4%', height: '100%',
                    width: 2, background: '#dc2626', opacity: 0.5,
                }} />

                {/* Horse emoji */}
                <div style={{
                    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                    left: `calc(${horsePct}% - 16px)`,
                    fontSize: 22,
                    transition: finished ? 'left 0.3s ease-out' : 'left 0.1s linear',
                    filter: finished ? 'none' : 'none',
                }}>
                    🐴
                </div>

                {/* Rank badge when finished */}
                {finished && (
                    <div style={{
                        position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                        fontSize: '1.1rem',
                    }}>
                        {medal(runner.rank)}
                    </div>
                )}
            </div>

            {/* Horse name + time */}
            <div style={{ width: 130, flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#2b1b1b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {runner.horseName}
                </p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: finished ? runner.color : '#bbb', fontWeight: finished ? 700 : 400 }}>
                    {finished ? formatTime(runner.finishTimeMs) : runner.jockeyName ?? ''}
                </p>
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RaceReplay() {
    const { raceId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Animation state
    const [phase, setPhase] = useState('idle'); // idle | countdown | running | done
    const [countdown, setCountdown] = useState(3);
    const [elapsed, setElapsed] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const rafRef = useRef(null);
    const startRef = useRef(null);

    useEffect(() => {
        spectatorApi.getRaceReplay(Number(raceId))
            .then(d => setData(d))
            .catch(e => setError(e?.message || 'Failed to load replay.'))
            .finally(() => setLoading(false));
    }, [raceId]);

    // Cleanup on unmount
    useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

    const startCountdown = useCallback(() => {
        if (!data) return;
        setPhase('countdown');
        setElapsed(0);
        setShowResults(false);
        setCountdown(3);

        let c = 3;
        const tick = () => {
            c -= 1;
            if (c > 0) {
                setCountdown(c);
                setTimeout(tick, 1000);
            } else {
                setCountdown(0);
                startRace();
            }
        };
        setTimeout(tick, 1000);
    }, [data]); // eslint-disable-line

    const startRace = useCallback(() => {
        setPhase('running');
        startRef.current = performance.now();

        const animate = (now) => {
            const ms = now - startRef.current;
            setElapsed(ms);
            if (ms < data.totalDurationMs) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                setElapsed(data.totalDurationMs);
                setPhase('done');
                setTimeout(() => setShowResults(true), 600);
            }
        };
        rafRef.current = requestAnimationFrame(animate);
    }, [data]);

    if (loading) return (
        <div className="grid gap-7">
            <p className="m-0 text-center font-semibold text-[var(--admin-muted)] py-20">Loading replay...</p>
        </div>
    );

    if (error) return (
        <div className="grid gap-7">
            <button type="button" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#0b7f5a', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                ← Back
            </button>
            <div className="surface-card p-10 text-center">
                <p style={{ fontSize: 40 }}>🏁</p>
                <h3 style={{ margin: '10px 0 6px', fontSize: '1.1rem', fontWeight: 800, color: '#2b1b1b' }}>Replay Unavailable</h3>
                <p style={{ margin: 0, color: '#999', fontSize: '0.88rem' }}>{error}</p>
                <p style={{ margin: '8px 0 0', color: '#bbb', fontSize: '0.8rem' }}>Replay is only available after admin approves all race results.</p>
            </div>
        </div>
    );

    if (!data) return null;

    const sortedRunners = [...data.runners].sort((a, b) => a.lane - b.lane);
    const totalMs = data.totalDurationMs;

    return (
        <div className="grid gap-6">
            {/* Back */}
            <button type="button" onClick={() => navigate(-1)}
                style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#0b7f5a', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                ← Back
            </button>

            {/* Header */}
            <div>
                <h1 className="page-title">🏁 Race Replay</h1>
                <p className="page-subtitle">{data.tournamentName} · {data.raceName} · {data.distanceMeters}m</p>
            </div>

            {/* Track area */}
            <div className="surface-card" style={{ padding: '24px 28px' }}>
                {/* Phase overlay: countdown */}
                {phase === 'countdown' && (
                    <div style={{
                        textAlign: 'center', padding: '20px 0 10px',
                        fontSize: '4rem', fontWeight: 900, color: '#0b7f5a',
                        lineHeight: 1,
                    }}>
                        {countdown > 0 ? countdown : 'GO! 🏇'}
                    </div>
                )}

                {/* Lanes */}
                <div style={{ marginTop: phase === 'countdown' ? 16 : 0 }}>
                    {sortedRunners.map(runner => {
                        const progress = phase === 'idle' ? 0
                            : phase === 'countdown' ? 0
                            : elapsed / runner.finishTimeMs;
                        const finished = elapsed >= runner.finishTimeMs;
                        return (
                            <Lane
                                key={runner.resultId}
                                runner={runner}
                                progress={progress}
                                finished={finished && phase !== 'idle' && phase !== 'countdown'}
                            />
                        );
                    })}
                </div>

                {/* Controls */}
                <div style={{ marginTop: 20, display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
                    {(phase === 'idle' || phase === 'done') && (
                        <button
                            type="button"
                            onClick={startCountdown}
                            style={{
                                padding: '10px 28px', borderRadius: 9, border: 'none',
                                background: '#0b7f5a', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                            }}
                        >
                            {phase === 'done' ? '🔁 Replay Again' : '▶ Start Replay'}
                        </button>
                    )}
                    {phase === 'running' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 180, height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(elapsed / totalMs * 100, 100)}%`, background: '#0b7f5a', transition: 'width 0.1s linear' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#999', fontWeight: 600 }}>
                                {formatTime(Math.min(elapsed, totalMs))} / {formatTime(totalMs)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Final Results */}
            {showResults && (
                <div className="surface-card" style={{ padding: '22px 28px' }}>
                    <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: '#2b1b1b' }}>🏆 Official Results</h2>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {[...data.runners]
                            .sort((a, b) => a.rank - b.rank)
                            .map(r => (
                                <div key={r.resultId} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 16px', borderRadius: 10,
                                    background: r.rank === 1 ? '#fffbea' : r.rank === 2 ? '#f8faff' : r.rank === 3 ? '#fff8f4' : '#fafafa',
                                    border: `1.5px solid ${r.rank === 1 ? '#f59e0b' : r.rank === 2 ? '#93c5fd' : r.rank === 3 ? '#fca5a5' : '#eee'}`,
                                }}>
                                    <span style={{ fontSize: '1.4rem', flexShrink: 0, width: 32, textAlign: 'center' }}>{medal(r.rank)}</span>
                                    <div style={{
                                        width: 10, height: 10, borderRadius: '50%', background: r.color, flexShrink: 0,
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', color: '#2b1b1b' }}>{r.horseName}</p>
                                        <p style={{ margin: '1px 0 0', fontSize: '0.73rem', color: '#999' }}>
                                            {r.jockeyName ? `🏇 ${r.jockeyName}` : ''}
                                            {r.ownerName ? ` · 👤 ${r.ownerName}` : ''}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.88rem', color: '#2b1b1b' }}>{r.finishTimeSeconds}s</p>
                                        <p style={{ margin: '1px 0 0', fontSize: '0.7rem', color: '#bbb' }}>Lane {r.lane}</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
