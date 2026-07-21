import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaFlagCheckered, FaHorseHead, FaMapMarkerAlt, FaPlay, FaStopwatch, FaTrophy } from 'react-icons/fa';
import { spectatorApi } from '../../../api/spectatorApi';

const HORSE_COLORS = ['#ff5f57', '#3b82f6', '#22c55e', '#facc15', '#a855f7', '#f97316', '#ec4899', '#06b6d4'];
const TRACK_LABELS = ['Start', '1/4', 'Half', '3/4', 'Finish'];

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function seededValue(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function formatTime(ms) {
    if (!ms) return '0.00s';
    return `${(ms / 1000).toFixed(2)}s`;
}

function ordinal(rank) {
    const r = Number(rank || 0);
    if (r % 100 >= 11 && r % 100 <= 13) return `${r}th`;
    if (r % 10 === 1) return `${r}st`;
    if (r % 10 === 2) return `${r}nd`;
    if (r % 10 === 3) return `${r}rd`;
    return `${r}th`;
}

function buildRunnerProfile(runner, index) {
    const seedBase = Number(runner?.registrationId || 0) + Number(runner?.horseId || 0) + (index + 1) * 13;
    return {
        wavePhase: seededValue(seedBase + 11) * Math.PI * 2,
        waveFreq: 1.65 + seededValue(seedBase + 21) * 1.4,
        waveAmp: 0.018 + seededValue(seedBase + 31) * 0.03,
        earlyBoost: 0.6 + seededValue(seedBase + 41) * 0.8,
        lateKick: 0.6 + seededValue(seedBase + 51) * 1.0,
        drift: seededValue(seedBase + 61) * 0.01,
    };
}

function getProgressAt(elapsed, finishMs, profile) {
    if (elapsed <= 0 || finishMs <= 0) return 0;

    const raw = clamp(elapsed / finishMs, 0, 1);

    let base;
    if (raw < 0.18) {
        const t = raw / 0.18;
        base = 0.1 * Math.pow(t, 0.9) + profile.earlyBoost * 0.015 * Math.sin(t * Math.PI);
    } else if (raw < 0.45) {
        const t = (raw - 0.18) / 0.27;
        base = 0.1 + t * 0.28;
    } else if (raw < 0.74) {
        const t = (raw - 0.45) / 0.29;
        base = 0.38 + t * 0.27;
    } else {
        const t = (raw - 0.74) / 0.26;
        base = 0.65 + t * 0.35;
    }

    const wave = Math.sin(raw * profile.waveFreq * Math.PI * 2 + profile.wavePhase)
        * profile.waveAmp
        * (1 - raw * 0.55);
    const lateKick = raw > 0.62
        ? Math.pow((raw - 0.62) / 0.38, 1.55) * 0.055 * profile.lateKick
        : 0;
    const drift = profile.drift * Math.sin(raw * Math.PI * 4);

    const progress = base + wave + lateKick + drift;
    return raw >= 1 ? 1 : clamp(progress, 0, 0.985);
}

function buildTrackMarkers(distanceMeters) {
    const total = Number(distanceMeters || 0);
    if (!total) {
        return TRACK_LABELS.map((label, index) => ({ label, distance: '' , left: `${index * 25}%`}));
    }

    return TRACK_LABELS.map((label, index) => ({
        label,
        distance: `${Math.round((total * index) / 4)}m`,
        left: `${index * 25}%`,
    }));
}

function RaceHeader({ replay, racePhase, totalMs, liveOrder }) {
    const topThree = liveOrder.slice(0, 3);

    return (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="surface-card overflow-hidden">
                <div className="border-b border-[var(--admin-border)] bg-[linear-gradient(135deg,#0b4f4f_0%,#16696a_50%,#1c8a80_100%)] px-6 py-5 text-white">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="m-0 text-[2rem] font-black leading-tight">Race Replay</h1>
                            <p className="m-0 mt-2 text-[0.96rem] font-semibold text-white/85">
                                {replay.tournamentName} • {replay.raceName}
                            </p>
                        </div>
                        <span className="inline-flex min-h-10 items-center rounded-full border border-white/20 bg-white/10 px-4 text-[0.82rem] font-black uppercase tracking-[0.12em] text-white">
                            {racePhase === 'done' ? 'Official Replay' : racePhase === 'running' ? 'Race In Progress' : 'Ready To Replay'}
                        </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-[0.82rem] font-bold text-white/90">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                            <FaMapMarkerAlt aria-hidden="true" /> {replay.location || 'Racecourse'}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                            <FaFlagCheckered aria-hidden="true" /> {Number(replay.distanceMeters || 0).toLocaleString()}m straight track
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                            <FaStopwatch aria-hidden="true" /> Best finish: {formatTime(totalMs)}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                            <FaHorseHead aria-hidden="true" /> {replay.runners.length} runners
                        </span>
                    </div>
                </div>
            </div>

            <div className="surface-card p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="m-0 text-[1rem] font-black text-[var(--admin-ink)]">Live Running Order</h2>
                        <p className="m-0 mt-1 text-[0.78rem] font-semibold text-[var(--admin-muted)]">
                            Rankings update as the race progresses.
                        </p>
                    </div>
                    <span className="rounded-full bg-[var(--admin-surface-strong)] px-3 py-1 text-[0.72rem] font-black text-[var(--admin-primary)]">
                        {racePhase === 'done' ? 'Finished' : racePhase === 'running' ? 'Tracking' : 'Waiting'}
                    </span>
                </div>

                <div className="grid gap-2.5">
                    {topThree.map((runner) => (
                        <div key={runner.registrationId} className="flex items-center gap-3 rounded-[12px] border border-[var(--admin-border)] bg-[#fffaf8] px-3 py-3">
                            <span className="grid h-10 w-10 place-items-center rounded-full text-[0.8rem] font-black text-white" style={{ backgroundColor: runner.color }}>
                                {ordinal(runner.liveRank)}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="m-0 truncate text-[0.92rem] font-black text-[var(--admin-ink)]">{runner.horseName}</p>
                                <p className="m-0 mt-0.5 truncate text-[0.76rem] font-semibold text-[var(--admin-muted)]">
                                    Jockey: {runner.jockeyName || 'TBA'}
                                </p>
                            </div>
                            <span className="text-[0.82rem] font-black text-[var(--admin-primary)]">{formatTime(runner.finishTimeMs)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function RaceTrack({ replay, racePhase, elapsed, totalMs, runners }) {
    const markers = useMemo(() => buildTrackMarkers(replay.distanceMeters), [replay.distanceMeters]);
    const distanceLabel = `${Number(replay.distanceMeters || 0).toLocaleString()}m`;

    return (
        <div className="surface-card overflow-hidden">
            <div className="border-b border-[var(--admin-border)] bg-[#f8fbff] px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="m-0 text-[1.08rem] font-black text-[var(--admin-ink)]">Straight Track Replay</h2>
                        <p className="m-0 mt-1 text-[0.8rem] font-semibold text-[var(--admin-muted)]">
                            Official course distance: <strong className="text-[var(--admin-primary-dark)]">{distanceLabel}</strong>
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#edf8f4] px-3 py-1.5 text-[0.74rem] font-black text-[#106748]">
                            {racePhase === 'done' ? 'Race finished' : racePhase === 'running' ? 'Horses are sprinting' : 'Waiting for starter signal'}
                        </span>
                        <span className="rounded-full bg-[var(--admin-surface-strong)] px-3 py-1.5 text-[0.74rem] font-black text-[var(--admin-primary)]">
                            Elapsed: {formatTime(elapsed)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-5 py-5">
                <div className="relative overflow-hidden rounded-[24px] border border-[#17354d] bg-[radial-gradient(circle_at_center,#1d3144_0%,#111827_68%,#0b1220_100%)] px-6 py-8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(34,197,94,0.16)_0%,rgba(34,197,94,0.05)_12%,rgba(17,24,39,0)_13%)]" />
                    <div className="pointer-events-none absolute inset-x-5 bottom-0 h-8 rounded-t-full bg-[radial-gradient(circle_at_bottom,rgba(34,197,94,0.48),rgba(34,197,94,0))]" />

                    <div className="mb-5 grid grid-cols-[130px_minmax(0,1fr)_76px] items-end gap-4 max-[720px]:grid-cols-[100px_minmax(0,1fr)_56px]">
                        <div className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-white/75">Lane / Horse</div>
                        <div className="relative h-8">
                            {markers.map((marker, index) => (
                                <div key={`${marker.label}-${index}`} className="absolute bottom-0 -translate-x-1/2 text-center" style={{ left: marker.left }}>
                                    <div className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-white/80">{marker.label}</div>
                                    <div className="text-[0.62rem] font-semibold text-white/55">{marker.distance}</div>
                                </div>
                            ))}
                        </div>
                        <div className="text-right text-[0.72rem] font-black uppercase tracking-[0.18em] text-white/75">Finish</div>
                    </div>

                    <div className="relative grid gap-3">
                        {runners.map((runner, index) => {
                            const progressPct = clamp(runner.progress * 100, 0, 100);
                            const laneLabel = index + 1;

                            return (
                                <div key={runner.registrationId} className="grid grid-cols-[130px_minmax(0,1fr)_76px] items-center gap-4 max-[720px]:grid-cols-[100px_minmax(0,1fr)_56px]">
                                    <div className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm">
                                        <span className="grid h-8 w-8 place-items-center rounded-full text-[0.8rem] font-black text-white" style={{ backgroundColor: runner.color }}>
                                            {laneLabel}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="m-0 truncate text-[0.88rem] font-black text-white">{runner.horseName}</p>
                                            <p className="m-0 mt-0.5 truncate text-[0.68rem] font-semibold text-white/65">{runner.jockeyName || 'Jockey TBA'}</p>
                                        </div>
                                    </div>

                                    <div className="relative h-[58px] overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,185,129,0.15),rgba(15,23,42,0.05))]">
                                        <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-[linear-gradient(90deg,rgba(255,255,255,0.16),rgba(255,255,255,0.03))]" />
                                        {markers.map((marker, markerIndex) => (
                                            <div key={`${runner.registrationId}-${marker.label}-${markerIndex}`} className="absolute top-0 bottom-0 border-l border-dashed border-white/20" style={{ left: marker.left }} />
                                        ))}
                                        <div className="absolute inset-y-0 left-0 w-[2px] bg-white/60" />
                                        <div className="absolute inset-y-0 right-5 w-[12px] bg-[repeating-linear-gradient(180deg,#ffffff_0_6px,#111827_6px_12px)] shadow-[0_0_16px_rgba(255,255,255,0.35)]" />

                                        <div
                                            className="absolute top-1/2 flex -translate-y-1/2 items-center gap-2 transition-[left] duration-75 ease-linear"
                                            style={{ left: `calc(${progressPct}% * 0.92 + 1%)` }}
                                        >
                                            <div
                                                className="absolute left-2 top-1/2 h-4 w-10 -translate-y-1/2 rounded-full bg-white/20 blur-[10px]"
                                                style={{ opacity: racePhase === 'running' ? 0.95 : 0.5 }}
                                            />
                                            <div className="relative flex h-10 w-10 items-center justify-center rounded-full shadow-[0_8px_18px_rgba(0,0,0,0.35)]" style={{ backgroundColor: runner.color, animation: racePhase === 'running' ? 'horseFloat 360ms ease-in-out infinite' : 'none' }}>
                                                <FaHorseHead aria-hidden="true" className="text-white" />
                                            </div>
                                            <div className="rounded-full border border-white/10 bg-[#0b1220]/80 px-2.5 py-1 text-[0.66rem] font-black uppercase tracking-[0.08em] text-white shadow-[0_6px_18px_rgba(0,0,0,0.3)]">
                                                {runner.horseName}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="m-0 text-[0.82rem] font-black text-white">{runner.liveRank}</p>
                                        <p className="m-0 mt-0.5 text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-white/65">Rank</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <style>{`@keyframes horseFloat { 0%, 100% { transform: translateY(-50%) translateX(0); } 50% { transform: translateY(calc(-50% - 3px)) translateX(1px); } }`}</style>
                </div>
            </div>
        </div>
    );
}

function ResultsTable({ runners }) {
    return (
        <div className="surface-card overflow-hidden">
            <div className="section-bar">
                <h2 className="m-0 text-[1.05rem] font-black">Official Results</h2>
                <span className="text-[0.78rem] font-black text-[var(--admin-muted)]">Published placements</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                        <tr>
                            {['Rank', 'Horse', 'Jockey', 'Lane', 'Official Time', 'Owner'].map((heading) => (
                                <th key={heading} className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-4 text-left text-[0.7rem] font-black uppercase text-[#64748b]">
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {runners.map((runner) => (
                            <tr key={`result-${runner.registrationId}`} className="hover:bg-[#fffaf8]">
                                <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                    <span className="inline-flex min-h-8 items-center rounded-full px-3 text-[0.78rem] font-black text-white" style={{ backgroundColor: runner.color }}>
                                        {ordinal(runner.officialRank)}
                                    </span>
                                </td>
                                <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.88rem] font-black text-[var(--admin-ink)]">{runner.horseName}</td>
                                <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-muted)]">{runner.jockeyName || '—'}</td>
                                <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-muted)]">Lane {runner.lane}</td>
                                <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-black text-[var(--admin-primary)]">{formatTime(runner.finishTimeMs)}</td>
                                <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-muted)]">{runner.ownerName || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function RaceReplay() {
    const { raceId } = useParams();
    const navigate = useNavigate();
    const [replay, setReplay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [racePhase, setRacePhase] = useState('idle');
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');

        spectatorApi.getRaceReplay(raceId)
            .then((data) => {
                if (!cancelled) {
                    setReplay(data);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err.message || 'Unable to load race replay.');
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [raceId]);

    const preparedRunners = useMemo(() => {
        const source = Array.isArray(replay?.runners) ? replay.runners : [];
        return source
            .map((runner, index) => ({
                ...runner,
                officialRank: Number(runner.rank || index + 1),
                liveRank: Number(runner.rank || index + 1),
                finishTimeMs: Number(runner.finishTimeMs || 0),
                color: runner.color || HORSE_COLORS[index % HORSE_COLORS.length],
                lane: Number(runner.lane || index + 1),
                profile: buildRunnerProfile(runner, index),
                progress: racePhase === 'done' ? 1 : 0,
            }))
            .sort((a, b) => a.officialRank - b.officialRank);
    }, [replay, racePhase]);

    const totalMs = useMemo(() => {
        if (!preparedRunners.length) return 0;
        return Math.max(...preparedRunners.map((runner) => Number(runner.finishTimeMs || 0)), 0);
    }, [preparedRunners]);

    useEffect(() => {
        if (racePhase !== 'running') return undefined;

        const startedAt = performance.now();
        let rafId;

        const animate = (now) => {
            const nextElapsed = Math.max(0, now - startedAt);
            setElapsed(nextElapsed);

            if (nextElapsed >= totalMs) {
                setElapsed(totalMs);
                setRacePhase('done');
                return;
            }

            rafId = window.requestAnimationFrame(animate);
        };

        rafId = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(rafId);
    }, [racePhase, totalMs]);

    const runners = useMemo(() => {
        return preparedRunners
            .map((runner, index) => ({
                ...runner,
                progress: racePhase === 'done'
                    ? 1
                    : racePhase === 'running'
                        ? getProgressAt(elapsed, runner.finishTimeMs, runner.profile)
                        : 0,
            }))
            .sort((a, b) => {
                if (b.progress !== a.progress) return b.progress - a.progress;
                if (a.finishTimeMs !== b.finishTimeMs) return a.finishTimeMs - b.finishTimeMs;
                return a.officialRank - b.officialRank;
            })
            .map((runner, index) => ({
                ...runner,
                liveRank: index + 1,
            }));
    }, [preparedRunners, racePhase, elapsed]);

    const trackRunners = useMemo(() => {
        return [...runners].sort((a, b) => a.lane - b.lane);
    }, [runners]);

    const startReplay = () => {
        setElapsed(0);
        setRacePhase('running');
    };

    if (loading) {
        return <p className="m-0 font-semibold text-[var(--admin-muted)]">Loading replay...</p>;
    }

    if (error) {
        return <p className="m-0 font-semibold text-[#a4392f]">{error}</p>;
    }

    if (!replay) {
        return <p className="m-0 font-semibold text-[var(--admin-muted)]">No replay available.</p>;
    }

    return (
        <div className="grid gap-5">
            <div className="flex justify-center">
                <button
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2 text-[0.82rem] font-black text-[var(--admin-primary)] transition-colors hover:border-[var(--admin-gold)]"
                    onClick={() => navigate(-1)}
                    type="button"
                >
                    <FaArrowLeft aria-hidden="true" />
                    Back
                </button>
            </div>

            <RaceHeader replay={replay} racePhase={racePhase} totalMs={totalMs} liveOrder={runners} />
            <RaceTrack replay={replay} racePhase={racePhase} elapsed={elapsed} totalMs={totalMs} runners={trackRunners} />

            <div className="flex justify-center">
                <button
                    className="inline-flex min-h-11 items-center gap-3 rounded-full bg-[var(--admin-primary)] px-6 text-[0.9rem] font-black text-white shadow-[0_18px_32px_rgba(22,48,92,0.18)] transition-colors hover:bg-[var(--admin-primary-dark)]"
                    onClick={startReplay}
                    type="button"
                >
                    <FaPlay aria-hidden="true" />
                    {racePhase === 'done' ? 'Replay Again' : racePhase === 'running' ? 'Restart Replay' : 'Start Replay'}
                </button>
            </div>

            <ResultsTable runners={[...trackRunners].sort((a, b) => a.officialRank - b.officialRank)} />
        </div>
    );
}
