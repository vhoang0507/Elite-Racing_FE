import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { spectatorApi } from '../../../api/spectatorApi';

const LANE_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#a855f7', '#f97316'];
const TRACK_START = 21;
const TRACK_FINISH = 84;

function getLaneColor(lane) {
    return LANE_COLORS[(Math.max(Number(lane) || 1, 1) - 1) % LANE_COLORS.length];
}

function formatTime(ms) {
    const value = Number(ms) || 0;
    return `${(value / 1000).toFixed(2)}s`;
}

function formatFinishTime(runner) {
    const seconds = Number(runner.finishTimeSeconds);

    if (Number.isFinite(seconds)) {
        return `${seconds.toFixed(2)}s`;
    }

    return formatTime(runner.finishTimeMs);
}

function rankLabel(rank) {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `#${rank}`;
}

function getHorseEmojiFilter(color) {
    const normalized = String(color || '').toLowerCase();
    const filters = {
        '#ef4444': 'hue-rotate(325deg) saturate(1.8) brightness(1.08)',
        '#3b82f6': 'hue-rotate(185deg) saturate(1.8) brightness(1.12)',
        '#22c55e': 'hue-rotate(95deg) saturate(1.9) brightness(1.08)',
        '#facc15': 'hue-rotate(0deg) saturate(1.65) brightness(1.12)',
        '#a855f7': 'hue-rotate(245deg) saturate(1.75) brightness(1.15)',
        '#f97316': 'hue-rotate(20deg) saturate(1.85) brightness(1.06)',
    };

    return filters[normalized] || 'saturate(1.55) brightness(1.08)';
}

function getReplayDurationMs(runners, totalDurationMs) {
    const duration = Number(totalDurationMs);

    if (Number.isFinite(duration) && duration > 0) {
        return duration < 1000 ? duration * 1000 : duration;
    }

    const maxFinishMs = Math.max(...(runners || []).map((runner) => getRunnerDeclaredFinishMs(runner)), 0);
    return maxFinishMs > 0 ? maxFinishMs : 30000;
}

function getRunnerDeclaredFinishMs(runner) {
    const finishSeconds = Number(runner?.finishTimeSeconds);

    if (Number.isFinite(finishSeconds) && finishSeconds > 0) {
        return finishSeconds * 1000;
    }

    const finishMs = Number(runner?.finishTimeMs);

    if (!Number.isFinite(finishMs) || finishMs <= 0) {
        return 0;
    }

    return finishMs < 1000 ? finishMs * 1000 : finishMs;
}

function getRunnerRank(runner, fallbackRank) {
    const rank = Number(runner?.rank);
    return Number.isFinite(rank) && rank > 0 ? rank : fallbackRank;
}

function getRunnerFinishMs(runner, raceMs, runnerCount) {
    const finishMs = getRunnerDeclaredFinishMs(runner);

    if (finishMs > 0) {
        return finishMs;
    }

    const rank = getRunnerRank(runner, runnerCount);
    const spread = runnerCount > 1 ? (rank - 1) / (runnerCount - 1) : 0;
    return raceMs * (0.82 + spread * 0.18);
}

function getStableSeed(value) {
    const text = String(value || 'race-replay');
    let hash = 2166136261;

    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

function getRunnerStableKey(runner, fallbackIndex) {
    return [
        runner?.horseId,
        runner?.horseName,
        runner?.ownerName,
    ].filter(Boolean).join('|') || String(fallbackIndex);
}

function getStableReplayLaneRunners(runners, tournamentKey) {
    const tournamentSeed = tournamentKey || 'race-replay';
    const stableOrder = runners
        .map((runner, index) => ({
            index,
            runner,
            seed: getStableSeed(`${tournamentSeed}|${getRunnerStableKey(runner, index)}`),
        }))
        .sort((a, b) => (
            a.seed - b.seed
            || String(a.runner?.horseName || '').localeCompare(String(b.runner?.horseName || ''))
            || a.index - b.index
        ));

    return stableOrder.map(({ runner }, index) => {
        const replayLane = index + 1;

        return {
            ...runner,
            replayColor: getLaneColor(replayLane),
            replayLane,
        };
    });
}

function HorseSilhouette({ color }) {
    return (
        <span
            aria-hidden="true"
            style={{
                display: 'block',
                width: 62,
                height: 42,
                fontSize: 38,
                lineHeight: '42px',
                textAlign: 'center',
                transform: 'scaleX(-1)',
                transformOrigin: 'center',
                filter: getHorseEmojiFilter(color),
                WebkitTextStroke: '1px rgba(0,0,0,0.1)',
                textShadow: `0 3px 5px rgba(0,0,0,0.4), 0 0 8px ${color}55`,
            }}
        >
            🐎
        </span>
    );
}

function ResultHorseIcon({ color }) {
    return (
        <span
            aria-hidden="true"
            style={{
                display: 'block',
                width: 44,
                height: 30,
                fontSize: 28,
                lineHeight: '30px',
                textAlign: 'center',
                transform: 'scaleX(-1)',
                filter: getHorseEmojiFilter(color),
                textShadow: `0 2px 4px rgba(0,0,0,0.25), 0 0 6px ${color}55`,
            }}
        >
            🐎
        </span>
    );
}

function RaceTrack({ runners, phase, raceMs, replayKey }) {
    const laneCount = runners.length;
    const lanes = Array.from({ length: laneCount }, (_, index) => index + 1);
    const laneTopStart = 23;
    const laneTopEnd = 78;
    const laneGap = laneCount > 1 ? (laneTopEnd - laneTopStart) / (laneCount - 1) : 0;
    const runnerByLane = new Map(
        runners.map((runner, index) => [Number(runner.replayLane || runner.lane || index + 1), runner])
    );

    return (
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
            <div
                style={{
                    position: 'relative',
                    minWidth: 820,
                    aspectRatio: '16 / 7',
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: `
                        radial-gradient(circle at 5% 90%, rgba(28,83,37,0.95) 0 34px, transparent 36px),
                        radial-gradient(circle at 95% 10%, rgba(31,91,41,0.95) 0 42px, transparent 44px),
                        linear-gradient(135deg, #123d1d 0%, #2f6b36 48%, #12361a 100%)
                    `,
                    boxShadow: 'inset 0 0 60px rgba(0,0,0,0.28)',
                    padding: 16,
                }}
            >
                <style>
                    {`
                        @keyframes spectatorRaceHorseRun {
                            from {
                                left: 0%;
                            }
                            to {
                                left: 100%;
                            }
                        }
                    `}
                </style>
                <div
                    style={{
                        position: 'absolute',
                        inset: '4% 4%',
                        borderRadius: 999,
                        background: '#20282d',
                        border: '4px solid rgba(255,255,255,0.9)',
                        boxShadow: 'inset 0 0 0 6px rgba(255,255,255,0.18), inset 0 0 42px rgba(0,0,0,0.55)',
                    }}
                />
                <div style={{ position: 'absolute', inset: '10% 7%', borderRadius: 999, border: '2px solid rgba(255,255,255,0.78)' }} />
                <div style={{ position: 'absolute', inset: '17% 12%', borderRadius: 999, border: '2px solid rgba(255,255,255,0.72)' }} />
                <div style={{ position: 'absolute', inset: '27% 28%', borderRadius: 999, background: '#172027', opacity: 0.94 }} />

                <div
                    style={{
                        position: 'absolute',
                        top: '15%',
                        bottom: '15%',
                        left: `${TRACK_START}%`,
                        borderLeft: '2px dashed rgba(255,255,255,0.72)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: '28%',
                        left: `${TRACK_START - 1.2}%`,
                        writingMode: 'vertical-rl',
                        textOrientation: 'upright',
                        color: '#ffffff',
                        fontSize: 14,
                        fontWeight: 900,
                        letterSpacing: 1,
                    }}
                >
                    START
                </div>

                <div
                    style={{
                        position: 'absolute',
                        top: '17%',
                        bottom: '17%',
                        left: `${TRACK_FINISH}%`,
                        width: 18,
                        backgroundImage: 'repeating-conic-gradient(#ffffff 0% 25%, #111827 0% 50%)',
                        backgroundSize: '10px 10px',
                        border: '1px solid rgba(255,255,255,0.55)',
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.25)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: '33%',
                        left: `${TRACK_FINISH + 4.4}%`,
                        writingMode: 'vertical-rl',
                        textOrientation: 'upright',
                        color: '#ffffff',
                        fontSize: 16,
                        fontWeight: 900,
                        letterSpacing: 1,
                    }}
                >
                    FINISH
                </div>

                {lanes.map((lane) => {
                    const runner = runnerByLane.get(lane);
                    const top = laneCount > 1 ? laneTopStart + (lane - 1) * laneGap : 50;
                    const color = runner?.replayColor || runner?.color || getLaneColor(lane);
                    const finishMs = getRunnerFinishMs(runner, raceMs, runners.length);

                    return (
                        <div key={lane}>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: `${top}%`,
                                    left: '16%',
                                    width: 30,
                                    height: 30,
                                    transform: 'translate(-50%, -50%)',
                                    borderRadius: '50%',
                                    background: color,
                                    color: '#fff',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontSize: 14,
                                    fontWeight: 900,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.38), inset 0 0 0 2px rgba(255,255,255,0.25)',
                                }}
                            >
                                {lane}
                            </div>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: `${top}%`,
                                    left: `${TRACK_START}%`,
                                    right: '15%',
                                    borderTop: '2px dashed rgba(255,255,255,0.66)',
                                }}
                            />
                            {runner && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: `${top}%`,
                                        left: `${TRACK_START}%`,
                                        width: `${TRACK_FINISH - TRACK_START - 4}%`,
                                        height: 46,
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                    }}
                                >
                                    <div
                                        key={`${runner.resultId || runner.horseName || lane}-${replayKey}`}
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: phase === 'done' ? '100%' : '0%',
                                            transform: 'translate(-50%, -50%)',
                                            animation: phase === 'running'
                                                ? `spectatorRaceHorseRun ${finishMs}ms linear forwards`
                                                : 'none',
                                            animationDelay: '0ms',
                                        }}
                                    >
                                        <HorseSilhouette color={color} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

            </div>
        </div>
    );
}

export default function RaceReplay() {
    const { raceId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [phase, setPhase] = useState('idle');
    const [elapsed, setElapsed] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [replayKey, setReplayKey] = useState(0);

    const rafRef = useRef(null);
    const startRef = useRef(null);
    const resultTimerRef = useRef(null);

    useEffect(() => {
        spectatorApi.getRaceReplay(Number(raceId))
            .then((payload) => setData(payload))
            .catch((err) => setError(err?.message || 'Failed to load replay.'))
            .finally(() => setLoading(false));
    }, [raceId]);

    useEffect(() => () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    }, []);

    const startReplay = useCallback(() => {
        if (!data) return;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (resultTimerRef.current) clearTimeout(resultTimerRef.current);

        const raceMs = getReplayDurationMs(data.runners || [], data.totalDurationMs);

        setElapsed(0);
        setShowResults(false);
        setReplayKey((currentKey) => currentKey + 1);
        setPhase('running');
        startRef.current = performance.now();

        const animate = (now) => {
            const ms = now - startRef.current;
            setElapsed(ms);

            if (ms < raceMs) {
                rafRef.current = requestAnimationFrame(animate);
                return;
            }

            setElapsed(raceMs);
            setPhase('done');
            resultTimerRef.current = setTimeout(() => setShowResults(true), 600);
        };

        rafRef.current = requestAnimationFrame(animate);
    }, [data]);

    if (loading) {
        return (
            <div className="grid gap-7">
                <p className="m-0 py-20 text-center font-semibold text-[var(--admin-muted)]">Loading replay...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="grid gap-7">
                <button type="button" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#0b7f5a', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                    Back
                </button>
                <div className="surface-card p-10 text-center">
                    <p style={{ margin: 0, fontSize: 40 }}>Race replay</p>
                    <h3 style={{ margin: '10px 0 6px', fontSize: '1.1rem', fontWeight: 800, color: '#2b1b1b' }}>Replay Unavailable</h3>
                    <p style={{ margin: 0, color: '#999', fontSize: '0.88rem' }}>{error}</p>
                    <p style={{ margin: '8px 0 0', color: '#bbb', fontSize: '0.8rem' }}>Replay is only available after admin approves all race results.</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const tournamentKey = [data.tournamentId, data.tournamentName].filter(Boolean).join('|')
        || [raceId, data.raceId, data.raceName].filter(Boolean).join('|');
    const replayRunners = getStableReplayLaneRunners(data.runners || [], tournamentKey);
    const sortedRunners = [...replayRunners].sort((a, b) => (
        (a.replayLane || a.lane || a.rank) - (b.replayLane || b.lane || b.rank)
    ));
    const totalMs = getReplayDurationMs(sortedRunners, data.totalDurationMs);

    return (
        <div className="grid gap-6">
            <button type="button" onClick={() => navigate(-1)}
                style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#0b7f5a', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                Back
            </button>

            <div>
                <h1 className="page-title">Race Replay</h1>
                <p className="page-subtitle">{data.tournamentName} - {data.raceName} - {data.distanceMeters}m</p>
            </div>

            <div className="surface-card" style={{ padding: 0, overflow: 'hidden' }}>
                {sortedRunners.length === 0 ? (
                    <p className="m-0 py-20 text-center font-semibold text-[var(--admin-muted)]">No runners are available for this replay.</p>
                ) : (
                    <RaceTrack
                        runners={sortedRunners}
                        phase={phase}
                        raceMs={totalMs}
                        replayKey={replayKey}
                    />
                )}

                <div style={{ padding: '18px 24px 24px', display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
                    {(phase === 'idle' || phase === 'done') && (
                        <button
                            type="button"
                            onClick={startReplay}
                            disabled={sortedRunners.length === 0}
                            style={{
                                padding: '11px 30px',
                                borderRadius: 9,
                                border: 'none',
                                background: '#0b7f5a',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                cursor: sortedRunners.length === 0 ? 'not-allowed' : 'pointer',
                                opacity: sortedRunners.length === 0 ? 0.55 : 1,
                            }}
                        >
                            {phase === 'done' ? 'Replay Again' : 'Start Replay'}
                        </button>
                    )}
                    {phase === 'running' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 180, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min((elapsed / totalMs) * 100, 100)}%`, background: '#0b7f5a', transition: 'width 0.1s linear' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                                {formatTime(Math.min(elapsed, totalMs))} / {formatTime(totalMs)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {showResults && (
                <div className="surface-card" style={{ padding: '22px 28px' }}>
                    <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: '#2b1b1b' }}>Official Results</h2>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {[...sortedRunners]
                            .sort((a, b) => a.rank - b.rank)
                            .map((runner) => (
                                <div key={runner.resultId} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '12px 16px',
                                    borderRadius: 10,
                                    background: runner.rank === 1 ? '#fffbea' : runner.rank === 2 ? '#f8faff' : runner.rank === 3 ? '#fff8f4' : '#fafafa',
                                    border: `1.5px solid ${runner.rank === 1 ? '#f59e0b' : runner.rank === 2 ? '#93c5fd' : runner.rank === 3 ? '#fca5a5' : '#eee'}`,
                                }}>
                                    <span style={{ flexShrink: 0, width: 38, textAlign: 'center', fontWeight: 900, color: runner.replayColor || getLaneColor(runner.replayLane || runner.lane) }}>{rankLabel(runner.rank)}</span>
                                    <ResultHorseIcon color={runner.replayColor || runner.color || getLaneColor(runner.replayLane || runner.lane)} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.92rem', color: '#2b1b1b' }}>{runner.horseName}</p>
                                        <p style={{ margin: '1px 0 0', fontSize: '0.73rem', color: '#999' }}>
                                            {[runner.jockeyName, runner.ownerName].filter(Boolean).join(' - ')}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p style={{ margin: 0, fontWeight: 900, fontSize: '0.88rem', color: '#2b1b1b' }}>{formatFinishTime(runner)}</p>
                                        <p style={{ margin: '1px 0 0', fontSize: '0.7rem', color: '#999' }}>Lane {runner.replayLane || runner.lane}</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
