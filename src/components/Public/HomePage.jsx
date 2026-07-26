import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaArrowLeft,
    FaArrowRight,
    FaBolt,
    FaCalendarAlt,
    FaChartLine,
    FaChevronLeft,
    FaChevronRight,
    FaClock,
    FaExclamationTriangle,
    FaFlagCheckered,
    FaHorse,
    FaMapMarkerAlt,
    FaMedal,
    FaMoneyBillWave,
    FaPause,
    FaPlay,
    FaRedo,
    FaStopwatch,
    FaTrophy,
    FaUsers,
    FaUserTie,
    FaVolumeMute,
    FaVolumeUp,
} from 'react-icons/fa';

import { leaderboardApi } from '../../api/leaderboardApi';
import { publicApi } from '../../api/publicApi';
import { resolveFileUrl } from '../../api/uploadApi';
import horseRacing from '../../assets/horse-racing.jpg';
import useServerCountdown from '../../hooks/useServerCountdown';
import { getAuthUser } from '../../utils/tokenStorage';
import PublicLayout from './PublicLayout';

const STATUS_STYLES = {
    Open: 'border-[#a7d7bd] bg-[#e8f6ee] text-[#236647]',
    Full: 'border-[#e6ca79] bg-[#fff5d6] text-[#86620b]',
    DeadlinePassed: 'border-[#e7bd8f] bg-[#fff0df] text-[#975119]',
    RaceStarted: 'border-[#9ab9dd] bg-[#e9f2ff] text-[#24598e]',
    RaceClosed: 'border-[#c9cbd1] bg-[#f0f1f3] text-[#5d626c]',
    Scheduled: 'border-[#9ab9dd] bg-[#e9f2ff] text-[#24598e]',
    AssignedReferee: 'border-[#9ab9dd] bg-[#e9f2ff] text-[#24598e]',
    RefereeReady: 'border-[#a7d7bd] bg-[#e8f6ee] text-[#236647]',
    Ongoing: 'border-[#9ab9dd] bg-[#e9f2ff] text-[#24598e]',
    Finished: 'border-[#c9cbd1] bg-[#f0f1f3] text-[#5d626c]',
    ResultPending: 'border-[#e7bd8f] bg-[#fff0df] text-[#975119]',
    Published: 'border-[#a7d7bd] bg-[#e8f6ee] text-[#236647]',
    Postponed: 'border-[#e7bd8f] bg-[#fff0df] text-[#975119]',
    TournamentClosed: 'border-[#c9cbd1] bg-[#f0f1f3] text-[#5d626c]',
    SeasonInactive: 'border-[#c9cbd1] bg-[#f0f1f3] text-[#5d626c]',
    NotConfigured: 'border-[#c9cbd1] bg-[#f0f1f3] text-[#5d626c]',
    Unavailable: 'border-[#c9cbd1] bg-[#f0f1f3] text-[#5d626c]',
    Cancelled: 'border-[#e2aaa5] bg-[#fde9e7] text-[#9d332b]',
};

const RANKING_TABS = [
    { key: 'jockeys', label: 'Top Jockeys' },
    { key: 'owners', label: 'Top Owners' },
    { key: 'spectators', label: 'Top Spectators' },
];

function readField(item, key) {
    const pascalKey = key[0].toUpperCase() + key.slice(1);
    return item?.[key] ?? item?.[pascalKey];
}

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(String(value).includes('T') ? value : `${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatDateTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function formatMoney(value) {
    if (value === null || value === undefined || value === '') return '-';

    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
        style: 'currency',
        currency: 'USD',
    }).format(Number(value || 0));
}

function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '-';
    return new Intl.NumberFormat('en-US').format(Number(value || 0));
}

function formatStatus(value) {
    if (!value) return 'Unavailable';
    return String(value).replace(/([a-z])([A-Z])/g, '$1 $2');
}

function resolveImage(value) {
    if (!value || value === horseRacing) return horseRacing;
    return resolveFileUrl(value);
}

function normalizeTournament(item) {
    const race = readField(item, 'race') || {};
    const tournamentId = readField(item, 'tournamentId');

    return {
        id: tournamentId,
        title: readField(item, 'tournamentName') || 'Tournament',
        seasonName: readField(item, 'seasonName') || '-',
        location: readField(race, 'location') || readField(item, 'location') || '-',
        image: resolveImage(readField(item, 'imageUrl')),
        tournamentStatus: readField(item, 'status') || '-',
        raceStatus: readField(race, 'status') || '-',
        raceId: readField(race, 'raceId'),
        raceName: readField(race, 'raceName') || 'Upcoming Race',
        raceDate: readField(race, 'raceDate'),
        distanceMeters: readField(race, 'distanceMeters'),
        prizePool: readField(item, 'prizePool'),
        maxHorses: Number(readField(item, 'maxHorses') ?? readField(race, 'maxHorses') ?? 0),
        reservedHorseCount: Number(readField(item, 'reservedHorseCount') ?? readField(race, 'reservedHorseCount') ?? readField(item, 'registeredHorseCount') ?? 0),
        confirmedHorseCount: Number(readField(item, 'confirmedHorseCount') ?? readField(race, 'confirmedHorseCount') ?? 0),
        readyHorseCount: Number(readField(item, 'readyHorseCount') ?? readField(race, 'readyHorseCount') ?? 0),
        availableSlots: Number(readField(item, 'availableSlots') ?? readField(race, 'availableSlots') ?? 0),
        registrationState: readField(item, 'registrationState') || readField(race, 'registrationState'),
        predictionState: readField(item, 'predictionState') || readField(race, 'predictionState'),
        replayAvailable: Boolean(readField(item, 'replayAvailable') ?? readField(race, 'replayAvailable')),
        link: Number(tournamentId) ? `/public/tournaments/${tournamentId}` : '/explore-tournaments',
    };
}

function StatusBadge({ label, value }) {
    const style = STATUS_STYLES[value] || 'border-[#c9cbd1] bg-[#f0f1f3] text-[#5d626c]';

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-[0.08em] ${style}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {label ? `${label}: ` : ''}{formatStatus(value)}
        </span>
    );
}

function CapacityBar({ maxHorses, reservedHorseCount, compact = false }) {
    const normalizedMax = Math.max(0, Number(maxHorses || 0));
    const normalizedReserved = Math.max(0, Number(reservedHorseCount || 0));
    const percentage = normalizedMax > 0
        ? Math.min(100, (normalizedReserved / normalizedMax) * 100)
        : 0;

    return (
        <div className={compact ? 'mt-4' : 'mt-6 w-full max-w-xl'}>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black">
                <span>{normalizedMax > 0 ? `${normalizedReserved} / ${normalizedMax} slots reserved` : 'Capacity not configured'}</span>
                {normalizedMax > 0 && <span>{Math.max(0, normalizedMax - normalizedReserved)} available</span>}
            </div>
            <div className={`h-2 overflow-hidden rounded-full ${compact ? 'bg-[#e5ded0]' : 'bg-white/25'}`}>
                <div
                    className="h-full rounded-full bg-[var(--racing-gold-bright)] transition-[width] duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function SectionHeading({ eyebrow, title, description, action }) {
    return (
        <div className="mb-8 flex flex-col gap-4 border-b border-[var(--racing-border)] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
                {eyebrow && (
                    <p className="mb-2 mt-0 text-xs font-black uppercase tracking-[0.18em] text-[var(--racing-gold)]">
                        {eyebrow}
                    </p>
                )}
                <h2 className="m-0 text-3xl font-black tracking-[-0.03em] md:text-4xl">{title}</h2>
                {description && <p className="mb-0 mt-2 text-sm text-[var(--racing-muted)]">{description}</p>}
            </div>
            {action}
        </div>
    );
}

function TournamentCard({ tournament, onWatchReplay }) {
    return (
        <article className="group min-w-[86%] snap-start overflow-hidden rounded-[12px] border border-[var(--racing-border)] bg-white shadow-[0_16px_38px_rgba(11,27,52,0.08)] sm:min-w-[48%] lg:min-w-[32%]">
            <div className="relative h-56 overflow-hidden">
                <img
                    src={tournament.image}
                    alt={tournament.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07152b]/90 via-transparent to-transparent" />
                {tournament.replayAvailable && (
                    <button
                        type="button"
                        onClick={() => onWatchReplay(tournament.raceId)}
                        className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#0b1b34]/85 px-3 py-2 text-[0.68rem] font-black uppercase tracking-wide text-white backdrop-blur"
                    >
                        <FaPlay className="text-[#ead38d]" /> Replay
                    </button>
                )}
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="m-0 text-xs font-black uppercase tracking-[0.12em] text-[#ead38d]">{tournament.seasonName}</p>
                    <h3 className="mb-0 mt-1 text-xl font-black">{tournament.title}</h3>
                </div>
            </div>

            <div className="p-5">
                <div className="flex flex-wrap gap-2">
                    <StatusBadge label="Race" value={tournament.raceStatus} />
                    <StatusBadge value={tournament.registrationState} />
                    <StatusBadge value={tournament.predictionState} />
                </div>

                <div className="mt-5 grid gap-2 text-sm text-[var(--racing-muted)]">
                    <span><FaCalendarAlt className="mr-2 inline text-[var(--racing-gold)]" />{formatDateTime(tournament.raceDate)}</span>
                    <span><FaMapMarkerAlt className="mr-2 inline text-[var(--racing-gold)]" />{tournament.location}</span>
                    <span><FaFlagCheckered className="mr-2 inline text-[var(--racing-gold)]" />{tournament.distanceMeters ? `${formatNumber(tournament.distanceMeters)}m` : '-'}</span>
                    <span><FaMoneyBillWave className="mr-2 inline text-[var(--racing-gold)]" />{formatMoney(tournament.prizePool)}</span>
                </div>

                <div className="text-[var(--racing-ink)]">
                    <CapacityBar
                        compact
                        maxHorses={tournament.maxHorses}
                        reservedHorseCount={tournament.reservedHorseCount}
                    />
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--racing-border)] pt-4">
                    <span className="text-xs font-bold text-[var(--racing-muted)]">
                        {tournament.maxHorses > 0
                            ? `${tournament.confirmedHorseCount} confirmed · ${tournament.readyHorseCount} ready`
                            : `${tournament.reservedHorseCount} registered`}
                    </span>
                    <Link to={tournament.link} className="inline-flex items-center gap-2 text-xs font-black uppercase text-[var(--racing-primary)] no-underline">
                        View <FaArrowRight />
                    </Link>
                </div>
            </div>
        </article>
    );
}

function PodiumCard({ row }) {
    if (!row) return null;

    const position = Number(readField(row, 'position') || 0);
    const isWinner = position === 1;
    const medalTone = position === 1
        ? 'bg-[#f2cf62] text-[#5f4300]'
        : position === 2
            ? 'bg-[#d9dde5] text-[#4d5563]'
            : 'bg-[#d9a06c] text-[#633615]';

    return (
        <article className={`relative overflow-hidden rounded-[16px] border bg-white text-center shadow-[0_20px_48px_rgba(11,27,52,0.1)] ${isWinner ? 'border-[#d6b34e] md:-translate-y-8' : 'border-[var(--racing-border)]'}`}>
            {isWinner && <div className="absolute inset-x-0 top-0 h-1 bg-[var(--racing-gold)]" />}
            <div className="relative mx-auto mt-7 h-28 w-28">
                <img
                    src={resolveImage(readField(row, 'horseImageUrl'))}
                    alt={readField(row, 'horseName') || 'Race horse'}
                    className="h-full w-full rounded-full border-4 border-[#f3e6c2] object-cover shadow-lg"
                />
                <span className={`absolute -right-2 -top-2 grid h-10 w-10 place-items-center rounded-full text-sm font-black shadow-md ${medalTone}`}>
                    {position}
                </span>
            </div>

            <div className="px-6 pb-7 pt-5">
                <FaTrophy className={`mx-auto mb-3 text-2xl ${isWinner ? 'text-[var(--racing-gold)]' : 'text-[var(--racing-muted)]'}`} />
                <p className="m-0 text-xs font-black uppercase tracking-[0.16em] text-[var(--racing-muted)]">
                    {position === 1 ? 'Champion' : position === 2 ? 'Runner-up' : 'Third Place'}
                </p>
                <h3 className="mb-0 mt-2 text-xl font-black">{readField(row, 'horseName') || '-'}</h3>
                <p className="mb-0 mt-3 text-sm text-[var(--racing-muted)]">Jockey: <strong>{readField(row, 'jockeyName') || '-'}</strong></p>
                <p className="mb-0 mt-1 text-sm text-[var(--racing-muted)]">Owner: <strong>{readField(row, 'ownerName') || '-'}</strong></p>
                <p className="mb-0 mt-4 font-mono text-xl font-black text-[var(--racing-primary)]">
                    {readField(row, 'finishTimeSeconds') != null ? `${readField(row, 'finishTimeSeconds')}s` : '-'}
                </p>
            </div>
        </article>
    );
}

const HOME_REPLAY_COLORS = ['#e93d3d', '#f2c12e', '#21ad63', '#2775df', '#9a4ad7', '#ef7b22', '#222831', '#e9538f'];
const HOME_REPLAY_JOCKEY_COLORS = ['#ffe923', '#f8fafc', '#2bd778', '#42a5ff', '#ff4fa3', '#ff9a35', '#fff16b', '#7be9ff'];
const HOME_REPLAY_FINISH_PROGRESS = 1;
const HOME_REPLAY_AFTER_FINISH_PROGRESS = 1.03;
const HOME_REPLAY_CURVE_SAMPLES = 300;

function clampReplayValue(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function hashReplayNumber(value) {
    const text = String(value ?? 'runner');
    let hash = 2166136261;

    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

function seededReplayValue(seed, offset = 0) {
    const value = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453;
    return value - Math.floor(value);
}

function smoothReplayStep(edge0, edge1, value) {
    const normalized = clampReplayValue((value - edge0) / Math.max(edge1 - edge0, 0.00001), 0, 1);
    return normalized * normalized * (3 - 2 * normalized);
}

function normalizeReplayOutcome(value) {
    const status = String(value || 'Finished').trim();
    const normalized = status.toUpperCase().replaceAll(' ', '');

    if (normalized === 'DIDNOTSTART') return 'DNS';
    if (normalized === 'DIDNOTFINISH') return 'DNF';
    if (normalized === 'DISQUALIFIED') return 'DSQ';
    if (normalized === 'WITHDRAWN') return 'Withdrawn';
    if (['DNS', 'DNF', 'DSQ'].includes(normalized)) return normalized;
    return 'Finished';
}

function isNormalReplayFinisher(runner) {
    return normalizeReplayOutcome(runner.outcomeStatus) === 'Finished';
}

function canReplayRunnerUseTrack(runner) {
    return !['DNS', 'Withdrawn'].includes(normalizeReplayOutcome(runner.outcomeStatus));
}

function buildReplayCurve(seed) {
    const values = [0];
    let cumulative = 0;
    const early = 0.75 + seededReplayValue(seed, 1) * 0.55;
    const middle = 0.72 + seededReplayValue(seed, 2) * 0.62;
    const late = 0.78 + seededReplayValue(seed, 3) * 0.72;
    const kick = 0.75 + seededReplayValue(seed, 4) * 0.85;
    const phaseA = seededReplayValue(seed, 5) * Math.PI * 2;
    const phaseB = seededReplayValue(seed, 6) * Math.PI * 2;

    for (let index = 1; index <= HOME_REPLAY_CURVE_SAMPLES; index += 1) {
        const progress = index / HOME_REPLAY_CURVE_SAMPLES;
        const launch = 0.42 + smoothReplayStep(0, 0.12, progress) * 0.82;
        const earlySurge = Math.exp(-Math.pow((progress - (0.22 + seededReplayValue(seed, 7) * 0.09)) / 0.115, 2)) * early;
        const middleSurge = Math.exp(-Math.pow((progress - (0.48 + seededReplayValue(seed, 8) * 0.08)) / 0.13, 2)) * middle;
        const lateSurge = Math.exp(-Math.pow((progress - (0.69 + seededReplayValue(seed, 9) * 0.08)) / 0.11, 2)) * late;
        const finalKick = smoothReplayStep(0.72, 1, progress) * kick;
        const cadence = 0.12 * Math.sin(progress * Math.PI * 5.2 + phaseA)
            + 0.08 * Math.sin(progress * Math.PI * 8.4 + phaseB);
        const speed = Math.max(0.2, launch + earlySurge * 0.4 + middleSurge * 0.35 + lateSurge * 0.3 + finalKick * 0.55 + cadence);

        cumulative += speed;
        values.push(cumulative);
    }

    const total = values[values.length - 1] || 1;
    return values.map((value) => value / total);
}

function sampleReplayCurve(curve, progress) {
    const normalized = clampReplayValue(progress, 0, 1);
    const exact = normalized * (curve.length - 1);
    const lower = Math.floor(exact);
    const upper = Math.min(curve.length - 1, lower + 1);
    const fraction = exact - lower;
    return curve[lower] + (curve[upper] - curve[lower]) * fraction;
}

function getReplayVisualFinishTimes(runners) {
    const finished = runners.filter((runner) => ['Finished', 'DSQ'].includes(normalizeReplayOutcome(runner.outcomeStatus)));
    const sorted = [...finished].sort((first, second) => {
        const firstRank = Number(first.rank || Number.MAX_SAFE_INTEGER);
        const secondRank = Number(second.rank || Number.MAX_SAFE_INTEGER);
        if (firstRank !== secondRank) return firstRank - secondRank;
        return Number(first.finishTimeMs || Number.MAX_SAFE_INTEGER) - Number(second.finishTimeMs || Number.MAX_SAFE_INTEGER);
    });
    const timingByKey = new Map();

    sorted.forEach((runner, index) => {
        timingByKey.set(runner.registrationId || runner.resultId || runner.horseName, 10800 + index * 280);
    });

    return runners.map((runner, index) => {
        const outcome = normalizeReplayOutcome(runner.outcomeStatus);
        const key = runner.registrationId || runner.resultId || runner.horseName;
        if (outcome === 'DNS' || outcome === 'Withdrawn') return 0;
        if (outcome === 'DNF') return 6500 + seededReplayValue(hashReplayNumber(key), 20) * 2600;
        return timingByKey.get(key) || 10800 + index * 280;
    });
}

function buildReplayRunnerProfile(runner, index, visualFinishMs) {
    const seed = hashReplayNumber(`${runner.registrationId || runner.resultId || index}-${runner.horseName || ''}`);
    const outcomeStatus = normalizeReplayOutcome(runner.outcomeStatus);

    return {
        ...runner,
        outcomeStatus,
        color: runner.color || HOME_REPLAY_COLORS[index % HOME_REPLAY_COLORS.length],
        jockeyColor: HOME_REPLAY_JOCKEY_COLORS[index % HOME_REPLAY_JOCKEY_COLORS.length],
        officialRank: Number(runner.rank || 0),
        lane: Number(runner.lane || index + 1),
        visualFinishMs,
        seed,
        curve: buildReplayCurve(seed),
        dnfStopProgress: outcomeStatus === 'DNF'
            ? 0.48 + seededReplayValue(seed, 22) * 0.34
            : null,
        bodyTone: seededReplayValue(seed, 30),
    };
}

function getReplayRunnerProgress(elapsed, runner) {
    const outcome = normalizeReplayOutcome(runner.outcomeStatus);
    if (outcome === 'DNS' || outcome === 'Withdrawn' || elapsed <= 0) return 0;

    if (outcome === 'DNF') {
        const normalized = clampReplayValue(elapsed / Math.max(runner.visualFinishMs, 1), 0, 1);
        const travel = sampleReplayCurve(runner.curve, normalized) * runner.dnfStopProgress;
        return normalized >= 1 ? runner.dnfStopProgress : travel;
    }

    const normalized = clampReplayValue(elapsed / Math.max(runner.visualFinishMs, 1), 0, 1);
    const toFinish = sampleReplayCurve(runner.curve, normalized) * HOME_REPLAY_FINISH_PROGRESS;
    if (elapsed <= runner.visualFinishMs) return toFinish;

    const afterFinish = clampReplayValue((elapsed - runner.visualFinishMs) / 1500, 0, 1);
    return HOME_REPLAY_FINISH_PROGRESS + afterFinish * (HOME_REPLAY_AFTER_FINISH_PROGRESS - HOME_REPLAY_FINISH_PROGRESS);
}

function replayRunnerIsMoving(elapsed, runner, phase) {
    if (phase !== 'running') return false;
    const outcome = normalizeReplayOutcome(runner.outcomeStatus);
    if (outcome === 'DNS' || outcome === 'Withdrawn') return false;
    if (outcome === 'DNF' && elapsed >= runner.visualFinishMs) return false;
    return elapsed < runner.visualFinishMs + 1500;
}

function replayResultIsVisible(runner, phase) {
    if (phase === 'done') return true;
    const outcome = normalizeReplayOutcome(runner.outcomeStatus);
    if (outcome === 'Finished' || outcome === 'DSQ') {
        return Number(runner.progress || 0) >= HOME_REPLAY_FINISH_PROGRESS;
    }
    if (outcome === 'DNF') {
        return runner.dnfStopProgress > 0
            && Number(runner.progress || 0) >= runner.dnfStopProgress - 0.001;
    }
    return false;
}

function formatReplayTime(milliseconds) {
    const value = Number(milliseconds);
    return Number.isFinite(value) && value > 0 ? `${(value / 1000).toFixed(2)}s` : '-';
}

function replayOrdinal(rank) {
    const value = Number(rank || 0);
    if (!value) return '-';
    if (value % 100 >= 11 && value % 100 <= 13) return `${value}th`;
    if (value % 10 === 1) return `${value}st`;
    if (value % 10 === 2) return `${value}nd`;
    if (value % 10 === 3) return `${value}rd`;
    return `${value}th`;
}

function HomeCinematicReplay({ onClose, replay }) {
    const [phase, setPhase] = useState('idle');
    const [countdown, setCountdown] = useState(3);
    const [elapsed, setElapsed] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const animationRef = useRef(null);
    const startedAtRef = useRef(0);
    const elapsedBeforePauseRef = useRef(0);
    const audioContextRef = useRef(null);

    const runners = useMemo(() => {
        const payload = readField(replay, 'runners');
        const source = Array.isArray(payload)
            ? payload.map((runner) => ({
                registrationId: readField(runner, 'registrationId'),
                resultId: readField(runner, 'resultId'),
                horseId: readField(runner, 'horseId'),
                horseName: readField(runner, 'horseName'),
                horseImageUrl: readField(runner, 'horseImageUrl'),
                ownerName: readField(runner, 'ownerName'),
                jockeyId: readField(runner, 'jockeyId'),
                jockeyName: readField(runner, 'jockeyName'),
                rank: readField(runner, 'rank'),
                finishTimeSeconds: readField(runner, 'finishTimeSeconds'),
                finishTimeMs: readField(runner, 'finishTimeMs'),
                outcomeStatus: readField(runner, 'outcomeStatus'),
                note: readField(runner, 'note'),
                lane: readField(runner, 'lane'),
                color: readField(runner, 'color'),
            }))
            : [];
        const visualTimes = getReplayVisualFinishTimes(source);
        return source.map((runner, index) => buildReplayRunnerProfile(runner, index, visualTimes[index]));
    }, [replay]);

    const visualRaceMs = useMemo(() => {
        const finishTimes = runners.map((runner) => runner.visualFinishMs).filter((value) => value > 0);
        return finishTimes.length ? Math.max(...finishTimes) + 1500 : 12000;
    }, [runners]);

    const playTone = useCallback((frequency, duration = 0.12, volume = 0.08) => {
        if (!soundEnabled) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioContextRef.current) audioContextRef.current = new AudioContextClass();

        const context = audioContextRef.current;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + duration);
    }, [soundEnabled]);

    useEffect(() => () => {
        if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
        if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    }, []);

    useEffect(() => {
        if (phase !== 'countdown') return undefined;

        playTone(countdown > 0 ? 560 : 920, countdown > 0 ? 0.1 : 0.22, countdown > 0 ? 0.07 : 0.1);
        const timer = window.setTimeout(() => {
            if (countdown > 1) {
                setCountdown((value) => value - 1);
                return;
            }
            if (countdown === 1) {
                setCountdown(0);
                return;
            }

            elapsedBeforePauseRef.current = 0;
            startedAtRef.current = performance.now();
            setElapsed(0);
            setPhase('running');
        }, countdown === 0 ? 520 : 650);

        return () => window.clearTimeout(timer);
    }, [countdown, phase, playTone]);

    useEffect(() => {
        if (phase !== 'running') return undefined;

        const animate = (now) => {
            const nextElapsed = elapsedBeforePauseRef.current + (now - startedAtRef.current);
            if (nextElapsed >= visualRaceMs) {
                setElapsed(visualRaceMs);
                elapsedBeforePauseRef.current = visualRaceMs;
                setPhase('done');
                playTone(1040, 0.35, 0.11);
                return;
            }

            setElapsed(nextElapsed);
            animationRef.current = window.requestAnimationFrame(animate);
        };

        animationRef.current = window.requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
        };
    }, [phase, playTone, visualRaceMs]);

    const currentRunners = useMemo(() => runners.map((runner) => ({
        ...runner,
        progress: getReplayRunnerProgress(elapsed, runner),
    })), [elapsed, runners]);

    const startReplay = () => {
        if (phase === 'paused') {
            startedAtRef.current = performance.now();
            setPhase('running');
            return;
        }

        elapsedBeforePauseRef.current = 0;
        setElapsed(0);
        setCountdown(3);
        setPhase('countdown');
    };

    const pauseReplay = () => {
        elapsedBeforePauseRef.current = elapsed;
        setPhase('paused');
    };

    const onTrackRunners = currentRunners
        .filter((runner) => canReplayRunnerUseTrack(runner))
        .sort((first, second) => second.progress - first.progress || (first.officialRank || 999) - (second.officialRank || 999));
    const offTrackRunners = currentRunners.filter((runner) => !canReplayRunnerUseTrack(runner));
    const runningOrder = [...onTrackRunners, ...offTrackRunners];
    const laneOrder = [...currentRunners].sort((first, second) => first.lane - second.lane);
    const leaderProgress = onTrackRunners[0]?.progress || 0;
    const distanceMeters = Number(readField(replay, 'distanceMeters') || 0);
    const distanceCovered = Math.round(distanceMeters * clampReplayValue(leaderProgress, 0, 1));
    const winner = [...currentRunners]
        .filter((runner) => isNormalReplayFinisher(runner))
        .sort((first, second) => (first.officialRank || 999) - (second.officialRank || 999))[0];
    const visibleResults = [...currentRunners]
        .filter((runner) => replayResultIsVisible(runner, phase))
        .sort((first, second) => {
            const firstFinished = isNormalReplayFinisher(first);
            const secondFinished = isNormalReplayFinisher(second);
            if (firstFinished !== secondFinished) return firstFinished ? -1 : 1;
            return (first.officialRank || 999) - (second.officialRank || 999);
        });

    return (
        <div className="home-cinematic-shell">
            <style>{`
                .home-cinematic-shell{overflow:hidden;border:6px solid #8a5a2a;border-radius:14px;background:#2f6b2f;box-shadow:0 22px 55px rgba(15,23,42,.28),inset 0 0 0 3px #d8a23a}
                .home-cinematic-stage{position:relative;height:clamp(360px,calc(100dvh - 310px),680px);min-height:360px;overflow:hidden;background:#3f8a3f}
                .home-cinematic-field{position:absolute;inset:0;background:repeating-linear-gradient(180deg,#4c9a4c 0 40px,#458f45 40px 80px);transform:translate3d(calc(var(--bg-shift) * -0.15px),0,0);background-size:160px 80px}
                .home-cinematic-border{position:absolute;left:0;right:0;height:9%;z-index:6;background:linear-gradient(180deg,#d9b877,#c49a55);box-shadow:inset 0 0 0 3px rgba(255,255,255,.25)}
                .home-cinematic-border.top{top:0;border-bottom:4px solid #8a5a2a}.home-cinematic-border.bottom{bottom:0;border-top:4px solid #8a5a2a}
                .home-cinematic-trees{position:absolute;left:0;right:0;z-index:7;display:flex;align-items:center;justify-content:space-around}.home-cinematic-trees.top{top:1%}.home-cinematic-trees.bottom{bottom:1%}
                .home-cinematic-tree{position:relative;width:26px;height:30px}.home-cinematic-tree:before{position:absolute;bottom:0;left:50%;width:6px;height:12px;border-radius:1px;background:#7a4a24;content:'';transform:translateX(-50%)}.home-cinematic-tree:after{position:absolute;bottom:9px;left:50%;width:26px;height:26px;border:2px solid #245e2c;border-radius:50%;background:#2f7d3a;content:'';transform:translateX(-50%)}
                .home-cinematic-post{position:absolute;top:9%;bottom:9%;z-index:8;width:6px;border:1px solid rgba(0,0,0,.25);background:repeating-linear-gradient(180deg,#fff 0 10px,#c0272d 10px 20px);transform:translateX(-50%)}.home-cinematic-post.start{left:5.5%}.home-cinematic-post.finish{left:82%}
                .home-cinematic-post:before{position:absolute;top:-26px;left:50%;border:1px solid #d8a23a;border-radius:5px;background:#4a1010;color:#f7d45c;padding:4px 8px;font-size:10px;font-weight:900;letter-spacing:.1em;transform:translateX(-50%)}.home-cinematic-post.start:before{content:'START'}.home-cinematic-post.finish:before{content:'FINISH'}
                .home-cinematic-lanes{position:absolute;top:9%;right:0;bottom:9%;left:0;z-index:15;display:grid}.home-cinematic-lane{position:relative;min-height:0}
                .home-cinematic-horse{position:absolute;top:50%;left:0;z-index:20;width:clamp(64px,6.6vw,100px);aspect-ratio:1.25/1;transform:translate(-50%,-50%) rotate(-4deg);will-change:left}
                .home-cinematic-horse-icon{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 6px 3px rgba(44,22,12,.35))}.home-cinematic-horse.running .home-cinematic-horse-icon{animation:home-horse-bounce 260ms ease-in-out infinite}@keyframes home-horse-bounce{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-6%) rotate(-3deg)}}
                .home-cinematic-speed{position:absolute;top:38%;right:100%;width:60px;height:34%;opacity:0}.home-cinematic-speed span{position:absolute;right:0;height:2.5px;border-radius:2px;background:rgba(255,255,255,.55)}.home-cinematic-speed span:nth-child(1){top:8%;width:70%}.home-cinematic-speed span:nth-child(2){top:46%;width:100%}.home-cinematic-speed span:nth-child(3){top:82%;width:55%}.home-cinematic-horse.running .home-cinematic-speed{opacity:1;animation:home-speed-flicker 260ms ease-in-out infinite}@keyframes home-speed-flicker{0%,100%{opacity:.35}50%{opacity:.85}}
                .home-cinematic-rider{position:absolute;top:20%;left:33%;z-index:2;width:16%;aspect-ratio:.8;border:2px solid #1f2937;border-radius:50% 50% 35% 35%;box-shadow:0 2px 4px rgba(0,0,0,.3)}.home-cinematic-arm{position:absolute;top:20%;left:100%;width:60%;height:16%;border:2px solid #1f2937;border-radius:4px;background:inherit;transform:rotate(-25deg);transform-origin:0 50%}.home-cinematic-leg{position:absolute;top:85%;left:15%;width:60%;height:45%;border:2px solid #1f2937;border-radius:0 0 40% 40%;background:#2b2b2b}
                .home-cinematic-head{position:absolute;top:2%;left:38%;z-index:3;width:13%;aspect-ratio:1;border:2px solid #1f2937;border-radius:50%;background:#dcae86}.home-cinematic-cap{position:absolute;top:-30%;left:-15%;width:130%;height:70%;border:2px solid #1f2937;border-bottom:0;border-radius:50% 50% 0 0}.home-cinematic-badge{position:absolute;top:-8%;left:58%;z-index:4;display:grid;width:26%;min-width:18px;aspect-ratio:1;place-items:center;border:2px solid #1f2937;border-radius:50%;color:#fff;font-size:.6rem;font-weight:900}
                .home-cinematic-dust{position:absolute;bottom:6%;left:4%;width:94px;height:32px;opacity:0}.home-cinematic-dust:before,.home-cinematic-dust:after{position:absolute;border-radius:50%;background:rgba(224,173,117,.62);content:'';filter:blur(3px)}.home-cinematic-dust:before{bottom:0;left:0;width:64px;height:21px}.home-cinematic-dust:after{bottom:8px;left:31px;width:38px;height:17px}.home-cinematic-horse.running .home-cinematic-dust{opacity:1;animation:home-dust-puff 500ms ease-out infinite}@keyframes home-dust-puff{0%{transform:translateX(23px) scale(.55);opacity:.18}55%{opacity:.65}100%{transform:translateX(-42px) scale(1.3);opacity:0}}
                .home-cinematic-issue{position:absolute;top:-39px;left:50%;z-index:5;display:flex;align-items:center;gap:5px;border:2px solid #fff;border-radius:999px;background:#a91f27;color:#fff;padding:4px 9px;font-size:.65rem;font-weight:950;transform:translateX(-50%)}.home-cinematic-issue.dns,.home-cinematic-issue.withdrawn{background:#6b7280}
                .home-cinematic-order{position:absolute;top:64px;right:14px;z-index:38;width:min(180px,32vw);overflow:hidden;border:2px solid #d8a23a;border-radius:10px;background:rgba(74,16,16,.92);box-shadow:0 6px 0 rgba(0,0,0,.25)}.home-cinematic-order h4{margin:0;background:#7a1f1f;color:#f7d45c;padding:7px 10px;text-align:center;font-size:.62rem;font-weight:950;letter-spacing:.1em;text-transform:uppercase}.home-cinematic-order-row{display:flex;align-items:center;gap:7px;border-top:1px solid rgba(255,255,255,.08);padding:5px 9px;color:#fff;font-size:.68rem;font-weight:800}.home-cinematic-order-row strong{width:16px;color:#f7d45c;text-align:center}.home-cinematic-order-row i{width:9px;height:9px;border-radius:50%}.home-cinematic-order-row span{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
                .home-cinematic-countdown{position:absolute;inset:0;z-index:60;display:grid;place-items:center;background:rgba(9,24,41,.23);backdrop-filter:blur(1px)}.home-cinematic-countdown strong{display:grid;width:126px;height:126px;place-items:center;border:7px solid rgba(255,255,255,.92);border-radius:50%;background:linear-gradient(145deg,#d91f26,#8e0f16);color:#fff;font-size:4rem;box-shadow:0 16px 40px rgba(0,0,0,.34);animation:home-countdown-pop 620ms ease both}@keyframes home-countdown-pop{0%{transform:scale(.45);opacity:0}45%{transform:scale(1.12);opacity:1}100%{transform:scale(1);opacity:1}}
                .home-cinematic-winner{position:absolute;top:24%;left:50%;z-index:62;border:4px solid #f5c542;border-radius:18px;background:linear-gradient(135deg,rgba(74,16,16,.97),rgba(122,31,31,.97));color:#fff;padding:16px 24px;text-align:center;box-shadow:0 18px 44px rgba(0,0,0,.34);animation:home-winner-pop 700ms cubic-bezier(.2,.9,.2,1.25) both}@keyframes home-winner-pop{from{transform:translate(-50%,-50%) scale(.5);opacity:0}to{transform:translate(-50%,-50%) scale(1);opacity:1}}
                .home-cinematic-controls{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;border-top:3px solid #d8a23a;background:linear-gradient(180deg,#5c1616,#320c0c);padding:12px 18px}.home-cinematic-chip,.home-cinematic-action{display:inline-flex;align-items:center;gap:8px;border:2px solid #d8a23a;border-radius:8px;background:linear-gradient(180deg,#6b1a1a,#3a0d0d);color:#fff;padding:8px 14px;font-weight:900;box-shadow:0 4px 0 rgba(0,0,0,.28)}.home-cinematic-action{min-height:44px;cursor:pointer;padding:10px 20px;text-transform:uppercase}.home-cinematic-action.start{border-color:#ffe58a;background:linear-gradient(180deg,#d63c2f,#9e1816)}
                .home-cinematic-ranks{display:grid;grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:9px;border-top:4px solid #d8a23a;background:linear-gradient(180deg,#7a1f1f,#3d0e0e);padding:14px 16px}.home-cinematic-rank{text-align:center}.home-cinematic-rank b{display:grid;width:54px;height:48px;margin:5px auto;place-items:center;border:3px solid rgba(255,255,255,.7);border-radius:5px;color:#fff;font-size:1.5rem}.home-cinematic-rank span{display:block;overflow:hidden;color:#f7d45c;font-size:.68rem;font-weight:900;text-overflow:ellipsis;text-transform:uppercase;white-space:nowrap}
                @media(max-width:800px){.home-cinematic-stage{height:clamp(360px,calc(100dvh - 290px),540px)}.home-cinematic-order{display:none}}
            `}</style>

            <div className="home-cinematic-stage" style={{ '--bg-shift': clampReplayValue(leaderProgress, 0, 1) * 780 }}>
                <div className="home-cinematic-field" />
                <div className="home-cinematic-border top" />
                <div className="home-cinematic-border bottom" />
                <div className="home-cinematic-trees top">{Array.from({ length: 10 }).map((_, index) => <i className="home-cinematic-tree" key={`top-tree-${index}`} />)}</div>
                <div className="home-cinematic-trees bottom">{Array.from({ length: 10 }).map((_, index) => <i className="home-cinematic-tree" key={`bottom-tree-${index}`} />)}</div>
                <div className="home-cinematic-post start" />
                <div className="home-cinematic-post finish" />

                <div className="absolute left-4 top-4 z-40 flex items-center gap-2">
                    <button aria-label="Back" className="grid h-11 w-11 place-items-center rounded-[8px] border-2 border-[#d8a23a] bg-[linear-gradient(180deg,#7a1f1f,#4a1010)] text-white shadow-[0_4px_0_rgba(0,0,0,.28)]" onClick={onClose} type="button"><FaArrowLeft /></button>
                    <div className="rounded-[8px] border-2 border-[#d8a23a] bg-[linear-gradient(180deg,#7a1f1f,#4a1010)] px-4 py-2 text-white shadow-[0_4px_0_rgba(0,0,0,.28)]">
                        <p className="m-0 text-[.68rem] font-black uppercase tracking-[.12em] text-white/70">Official race replay</p>
                        <p className="m-0 mt-1 text-[.88rem] font-black">{readField(replay, 'raceName')}</p>
                    </div>
                </div>

                <button aria-label={soundEnabled ? 'Mute replay sound' : 'Enable replay sound'} className="absolute right-4 top-4 z-40 grid h-12 w-12 place-items-center rounded-[8px] border-2 border-[#d8a23a] bg-[linear-gradient(180deg,#7a1f1f,#4a1010)] text-xl text-white" onClick={() => setSoundEnabled((value) => !value)} type="button">
                    {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                </button>

                <div className="absolute left-1/2 top-4 z-40 w-[min(520px,44vw)] -translate-x-1/2 rounded-[10px] border-2 border-[#d8a23a] bg-[rgba(74,16,16,.93)] px-4 py-3 text-white max-[760px]:top-[76px] max-[760px]:w-[88%]">
                    <div className="flex items-center justify-between gap-3 text-[.75rem] font-black uppercase">
                        <span>{distanceCovered.toLocaleString()}m</span>
                        <span>{readField(replay, 'tournamentName')}</span>
                        <span>{distanceMeters.toLocaleString()}m</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full border border-white/30 bg-[#031b33]">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#f6c543,#ffef8a)]" style={{ width: `${clampReplayValue(leaderProgress, 0, 1) * 100}%` }} />
                    </div>
                </div>

                <div className="home-cinematic-order">
                    <h4>Running Order</h4>
                    {runningOrder.map((runner, index) => (
                        <div className="home-cinematic-order-row" key={`order-${readField(runner, 'registrationId') || runner.lane}`}>
                            <strong>{['DNS', 'Withdrawn'].includes(runner.outcomeStatus) ? '-' : index + 1}</strong>
                            <i style={{ backgroundColor: runner.color }} />
                            <span>{readField(runner, 'horseName')}</span>
                        </div>
                    ))}
                </div>

                <div className="home-cinematic-lanes" style={{ gridTemplateRows: `repeat(${Math.max(laneOrder.length, 1)}, 1fr)` }}>
                    {laneOrder.map((runner) => {
                        const running = replayRunnerIsMoving(elapsed, runner, phase);
                        const horseColor = runner.bodyTone > 0.72
                            ? '#3d3d3d'
                            : runner.bodyTone > 0.46
                                ? '#8a5a34'
                                : runner.bodyTone > 0.22
                                    ? '#c58a4e'
                                    : '#e8e4da';

                        return (
                            <div className="home-cinematic-lane" key={readField(runner, 'registrationId') || runner.lane}>
                                <div className={`home-cinematic-horse ${running ? 'running' : ''}`} style={{ left: `${5.5 + clampReplayValue(runner.progress, 0, HOME_REPLAY_AFTER_FINISH_PROGRESS) * 76.5}%` }}>
                                    <div className="home-cinematic-speed"><span /><span /><span /></div>
                                    <div className="home-cinematic-dust" />
                                    <FaHorse className="home-cinematic-horse-icon" style={{ color: horseColor }} />
                                    <span className="home-cinematic-rider" style={{ backgroundColor: runner.jockeyColor }}>
                                        <span className="home-cinematic-arm" />
                                        <span className="home-cinematic-leg" />
                                    </span>
                                    <span className="home-cinematic-head">
                                        <span className="home-cinematic-cap" style={{ backgroundColor: runner.color }} />
                                    </span>
                                    <span className="home-cinematic-badge" style={{ backgroundColor: runner.color }}>{runner.lane}</span>
                                    {runner.outcomeStatus !== 'Finished' && (
                                        <span className={`home-cinematic-issue ${runner.outcomeStatus.toLowerCase()}`}>
                                            <FaExclamationTriangle />
                                            {runner.outcomeStatus}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {phase === 'countdown' && <div className="home-cinematic-countdown"><strong key={countdown}>{countdown || 'GO!'}</strong></div>}
                {phase === 'done' && winner && (
                    <div className="home-cinematic-winner">
                        <div className="text-[.72rem] font-black uppercase tracking-[.18em] text-[#f5c542]">Winner</div>
                        <div className="mt-1 text-[1.45rem] font-black">{readField(winner, 'horseName')}</div>
                        <div className="mt-1 text-[.78rem] font-bold text-white/75">Jockey: {readField(winner, 'jockeyName') || '-'} · {formatReplayTime(readField(winner, 'finishTimeMs'))}</div>
                    </div>
                )}
            </div>

            <div className="home-cinematic-controls">
                <div className="home-cinematic-chip"><FaStopwatch /><span>{formatReplayTime(Math.min(elapsed, visualRaceMs))}</span></div>
                <span className="text-[.7rem] font-black uppercase tracking-[.12em] text-white/65">
                    {phase === 'countdown' ? 'Get ready…' : phase === 'running' ? 'Live' : phase === 'paused' ? 'Paused' : phase === 'done' ? 'Race finished' : 'Ready to start'}
                </span>
                {phase === 'running' ? (
                    <button className="home-cinematic-action" onClick={pauseReplay} type="button"><FaPause /> Pause</button>
                ) : (
                    <button className="home-cinematic-action start" onClick={startReplay} type="button">
                        {phase === 'done' ? <FaRedo /> : <FaPlay />}
                        {phase === 'done' ? 'Replay again' : phase === 'paused' ? 'Resume race' : 'Start replay'}
                    </button>
                )}
            </div>

            <div className="home-cinematic-ranks">
                {visibleResults.length === 0 ? (
                    <div className="col-span-full py-6 text-center text-xs font-black uppercase tracking-[.12em] text-white/70">Awaiting finishers</div>
                ) : visibleResults.map((runner) => (
                    <div className="home-cinematic-rank" key={`rank-${readField(runner, 'registrationId') || runner.lane}`}>
                        <span>{runner.outcomeStatus === 'Finished' ? replayOrdinal(runner.officialRank) : runner.outcomeStatus}</span>
                        <b style={{ backgroundColor: runner.color }}>{runner.lane}</b>
                        <span>{readField(runner, 'horseName')}</span>
                    </div>
                ))}
            </div>

            <section className="border-t border-[var(--racing-border)] bg-[#f6f3ea] p-5">
                <h3 className="m-0 text-lg font-black text-[var(--racing-ink)]">Official Finish Order</h3>
                <p className="mb-4 mt-1 text-xs font-semibold text-[var(--racing-muted)]">Official positions, outcome status and finish time.</p>
                {visibleResults.length === 0 ? (
                    <div className="rounded-[10px] border border-[var(--racing-border)] bg-white p-6 text-center text-sm font-bold text-[var(--racing-muted)]">Awaiting finishers.</div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {visibleResults.map((runner) => (
                            <article className="flex items-center gap-3 rounded-[10px] border border-[var(--racing-border)] bg-white p-3" key={`official-${readField(runner, 'registrationId') || runner.lane}`}>
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] font-black text-white" style={{ backgroundColor: runner.color }}>{runner.lane}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="m-0 text-[.68rem] font-black uppercase text-[var(--racing-primary)]">{runner.outcomeStatus === 'Finished' ? `${replayOrdinal(runner.officialRank)} place` : runner.outcomeStatus}</p>
                                    <strong className="mt-1 block truncate">{readField(runner, 'horseName')}</strong>
                                    <span className="mt-1 block truncate text-xs text-[var(--racing-muted)]">{readField(runner, 'jockeyName') || 'No jockey'}</span>
                                </div>
                                <strong className="text-xs text-[var(--racing-primary)]">{['Finished', 'DSQ'].includes(runner.outcomeStatus) ? formatReplayTime(readField(runner, 'finishTimeMs')) : '-'}</strong>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function HomeReplayModal({ raceId, onClose }) {
    const [replay, setReplay] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        publicApi.getPublicRaceReplay(raceId)
            .then((payload) => {
                if (isMounted) {
                    setReplay(payload);
                    setError('');
                }
            })
            .catch((requestError) => {
                if (isMounted) {
                    setError(requestError.message || 'Unable to load the official replay.');
                }
            });

        return () => {
            isMounted = false;
        };
    }, [raceId]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const runnersPayload = readField(replay, 'runners');
    const runners = Array.isArray(runnersPayload) ? runnersPayload : [];

    return (
        <div
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#020817]/80 p-3 backdrop-blur-sm"
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-label="Official race replay"
                className="my-3 w-full max-w-[1500px] overflow-hidden rounded-[16px] border border-[#d8bd6f]/45 bg-[#f6f3ea] shadow-[0_30px_100px_rgba(0,0,0,.45)]"
            >
                <div className="p-2 md:p-3">
                    {!replay && !error && (
                        <div className="grid min-h-64 place-items-center rounded-[12px] border border-[var(--racing-border)] bg-white text-sm font-bold text-[var(--racing-muted)]">
                            Loading official replay...
                        </div>
                    )}

                    {error && (
                        <div className="rounded-[12px] border border-[#e2aaa5] bg-[#fde9e7] px-6 py-12 text-center">
                            <p className="m-0 font-bold text-[#9d332b]">{error}</p>
                            <p className="mb-0 mt-2 text-sm text-[#7b514d]">The replay is temporarily unavailable. Please try again later.</p>
                        </div>
                    )}

                    {replay && runners.length === 0 && (
                        <div className="rounded-[12px] border border-[var(--racing-border)] bg-white px-6 py-12 text-center text-sm font-bold text-[var(--racing-muted)]">
                            No official runners are available for this replay.
                        </div>
                    )}

                    {replay && runners.length > 0 && (
                        <HomeCinematicReplay onClose={onClose} replay={replay} />
                    )}

                </div>
            </section>
        </div>
    );
}

function RankingList({ activeTab, items }) {
    if (!items.length) {
        return (
            <div className="rounded-[12px] border border-dashed border-[var(--racing-border)] px-6 py-12 text-center text-sm font-bold text-[var(--racing-muted)]">
                No ranking data is available for the active season yet.
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            {items.map((item, index) => {
                const rank = Number(readField(item, 'rank') || index + 1);
                const name = activeTab === 'owners'
                    ? readField(item, 'ownerName')
                    : activeTab === 'jockeys'
                        ? readField(item, 'jockeyName')
                        : readField(item, 'displayName');
                const primaryMetric = activeTab === 'spectators'
                    ? `${formatNumber(readField(item, 'rewardPoints'))} pts`
                    : `${formatNumber(readField(item, 'wins'))} wins`;
                const secondaryMetric = activeTab === 'spectators'
                    ? `${formatNumber(readField(item, 'correctPredictions'))} correct · ${readField(item, 'accuracyPercentage') ?? 0}% accuracy`
                    : `${formatNumber(readField(item, 'totalRaces'))} races · ${readField(item, 'winRate') ?? 0}% win rate`;

                return (
                    <article key={`${activeTab}-${readField(item, `${activeTab.slice(0, -1)}Id`) || rank}`} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 rounded-[10px] border border-[var(--racing-border)] bg-white px-4 py-3">
                        <span className={`grid h-10 w-10 place-items-center rounded-full font-black ${rank <= 3 ? 'bg-[var(--racing-gold-soft)] text-[#73560c]' : 'bg-[#edf1f6] text-[var(--racing-muted)]'}`}>
                            {rank}
                        </span>
                        <div className="min-w-0">
                            <strong className="block truncate">{name || 'Anonymous competitor'}</strong>
                            <span className="mt-1 block text-xs text-[var(--racing-muted)]">{secondaryMetric}</span>
                        </div>
                        <strong className="text-right text-sm text-[var(--racing-primary)]">{primaryMetric}</strong>
                    </article>
                );
            })}
        </div>
    );
}

export default function HomePage() {
    const [homeData, setHomeData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [requestVersion, setRequestVersion] = useState(0);
    const [activeTournamentIndex, setActiveTournamentIndex] = useState(0);
    const [activeRankingTab, setActiveRankingTab] = useState('jockeys');
    const [rankings, setRankings] = useState({
        jockeys: [],
        owners: [],
        spectators: [],
    });
    const [rankingsLoading, setRankingsLoading] = useState(true);
    const [rankingsError, setRankingsError] = useState('');
    const [replayRaceId, setReplayRaceId] = useState(null);
    const tournamentTrackRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        async function loadHomepage() {
            try {
                const payload = await publicApi.getPublicHome(6);
                if (!isMounted) return;

                setHomeData(payload);
                setLoadError('');
                setIsLoading(false);
                setActiveTournamentIndex(0);

                const season = readField(payload, 'currentSeason');
                const seasonId = readField(season, 'seasonId');

                if (!seasonId) {
                    setRankings({ jockeys: [], owners: [], spectators: [] });
                    setRankingsLoading(false);
                    return;
                }

                const rankingResults = await Promise.allSettled([
                    leaderboardApi.getJockeyLeaderboard({ seasonId, limit: 5 }),
                    leaderboardApi.getOwnerLeaderboard({ seasonId, limit: 5 }),
                    publicApi.getPublicSpectatorLeaderboard({ seasonId, limit: 5 }),
                ]);

                if (!isMounted) return;

                const valueOrEmpty = (result) => (
                    result.status === 'fulfilled' && Array.isArray(result.value)
                        ? result.value
                        : []
                );

                setRankings({
                    jockeys: valueOrEmpty(rankingResults[0]),
                    owners: valueOrEmpty(rankingResults[1]),
                    spectators: valueOrEmpty(rankingResults[2]),
                });
                setRankingsError(
                    rankingResults.some((result) => result.status === 'rejected')
                        ? 'Some leaderboard data could not be loaded.'
                        : '',
                );
                setRankingsLoading(false);
            } catch (error) {
                if (!isMounted) return;
                setHomeData(null);
                setLoadError(error.message || 'Unable to load homepage data.');
                setIsLoading(false);
                setRankingsLoading(false);
            }
        }

        loadHomepage();

        return () => {
            isMounted = false;
        };
    }, [requestVersion]);

    const tournaments = useMemo(() => {
        const payload = readField(homeData, 'upcomingTournaments');
        const items = Array.isArray(payload) ? payload : [];
        return items.map(normalizeTournament);
    }, [homeData]);

    useEffect(() => {
        if (tournaments.length <= 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            setActiveTournamentIndex((currentIndex) => (
                (currentIndex + 1) % tournaments.length
            ));
        }, 3000);

        return () => window.clearInterval(intervalId);
    }, [tournaments.length]);

    const safeTournamentIndex = tournaments.length > 0
        ? activeTournamentIndex % tournaments.length
        : 0;

    useEffect(() => {
        const track = tournamentTrackRef.current;
        const activeCard = track?.children?.[safeTournamentIndex];
        if (!track || !activeCard) return;

        track.scrollTo({
            left: activeCard.offsetLeft - track.offsetLeft,
            behavior: 'smooth',
        });
    }, [safeTournamentIndex]);

    const handleRetry = () => {
        setHomeData(null);
        setLoadError('');
        setIsLoading(true);
        setRankingsLoading(true);
        setRankingsError('');
        setRankings({ jockeys: [], owners: [], spectators: [] });
        setRequestVersion((version) => version + 1);
    };

    const handleWatchReplay = (raceId) => {
        if (Number(raceId)) {
            setReplayRaceId(Number(raceId));
        }
    };

    const currentSeason = readField(homeData, 'currentSeason');
    const apiFeaturedRace = readField(homeData, 'featuredRace');
    const featuredRace = useMemo(() => {
        if (apiFeaturedRace) return apiFeaturedRace;

        const fallback = tournaments[0];
        if (!fallback) return null;

        return {
            tournamentId: fallback.id,
            tournamentName: fallback.title,
            tournamentImageUrl: fallback.image,
            prizePool: fallback.prizePool,
            seasonName: fallback.seasonName,
            raceId: fallback.raceId,
            raceName: fallback.raceName,
            raceDate: fallback.raceDate,
            location: fallback.location,
            distanceMeters: fallback.distanceMeters,
            maxHorses: fallback.maxHorses,
            reservedHorseCount: fallback.reservedHorseCount,
            confirmedHorseCount: fallback.confirmedHorseCount,
            readyHorseCount: fallback.readyHorseCount,
            availableSlots: fallback.availableSlots,
            tournamentStatus: fallback.tournamentStatus,
            raceStatus: fallback.raceStatus,
            registrationState: fallback.registrationState,
            predictionState: fallback.predictionState,
            replayAvailable: fallback.replayAvailable,
        };
    }, [apiFeaturedRace, tournaments]);
    const serverClock = readField(homeData, 'serverClock');
    const statistics = readField(homeData, 'statistics');
    const latestResult = readField(homeData, 'latestResult');
    const standings = readField(latestResult, 'standings');
    const leaderboardRows = Array.isArray(standings) ? standings : [];
    const podiumRows = [leaderboardRows[1], leaderboardRows[0], leaderboardRows[2]].filter(Boolean);

    const featuredRaceDate = readField(featuredRace, 'raceDate');
    const countdown = useServerCountdown(serverClock, featuredRaceDate);
    const featuredRaceId = readField(featuredRace, 'raceId');
    const featuredTournamentId = readField(featuredRace, 'tournamentId');
    const featureDetailLink = Number(featuredRaceId)
        ? `/public/races/${featuredRaceId}`
        : Number(featuredTournamentId)
            ? `/public/tournaments/${featuredTournamentId}`
            : '/explore-tournaments';

    const registrationState = readField(featuredRace, 'registrationState');
    const predictionState = readField(featuredRace, 'predictionState');
    const featuredReplayAvailable = Boolean(readField(featuredRace, 'replayAvailable'));
    const currentUser = getAuthUser();
    const currentRole = readField(currentUser, 'role');
    const canOpenPrediction = !currentRole || currentRole === 'Spectator';
    const predictionLink = currentRole === 'Spectator' ? '/spectator/tournaments' : '/login';

    const stats = [
        { label: 'Active Tournaments', value: readField(statistics, 'activeTournaments'), icon: FaCalendarAlt },
        { label: 'Active Horses', value: readField(statistics, 'activeHorses'), icon: FaHorse },
        { label: 'Active Jockeys', value: readField(statistics, 'activeJockeys'), icon: FaUserTie },
        { label: 'Published Races', value: readField(statistics, 'publishedRaces'), icon: FaFlagCheckered },
        { label: 'Total Predictions', value: readField(statistics, 'totalPredictions'), icon: FaChartLine },
        { label: 'Total Spectators', value: readField(statistics, 'totalSpectators'), icon: FaUsers },
    ];

    const howItWorks = [
        ['01', 'Owner registers horse', 'Owners select an open race and submit an eligible horse.'],
        ['02', 'Jockey joins the entry', 'A qualified jockey accepts the invitation and prepares for race day.'],
        ['03', 'Referee manages race', 'Officials inspect participants and control the race lifecycle.'],
        ['04', 'Admin publishes result', 'Verified placements become the official public result.'],
        ['05', 'Spectators earn rewards', 'Predictions are evaluated and season scores are updated.'],
    ];

    return (
        <PublicLayout showSearch={false}>
            <section className="relative min-h-[700px] overflow-hidden bg-[#07152b]">
                <img
                    src={resolveImage(readField(featuredRace, 'tournamentImageUrl'))}
                    alt={readField(featuredRace, 'tournamentName') || 'Elite horse racing'}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,16,34,.94)_0%,rgba(5,16,34,.76)_45%,rgba(5,16,34,.32)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#07152b]/80" />

                <div className="relative z-10 mx-auto flex min-h-[700px] max-w-7xl items-center px-6 py-16 md:px-11">
                    <div className="max-w-3xl text-white">
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-[#e8d38e]/60 bg-[#0b1b34]/75 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#ead38d] backdrop-blur">
                                {readField(featuredRace, 'seasonName') || readField(currentSeason, 'seasonName') || 'Elite Racing League'}
                            </span>
                            {readField(featuredRace, 'tournamentStatus') && (
                                <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] backdrop-blur">
                                    {formatStatus(readField(featuredRace, 'tournamentStatus'))}
                                </span>
                            )}
                        </div>

                        {featuredRace ? (
                            <>
                                <p className="mb-0 mt-8 text-sm font-black uppercase tracking-[0.2em] text-[#ead38d]">
                                    Next official race
                                </p>
                                <h1 className="mb-0 mt-3 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.04em] drop-shadow-lg md:text-6xl">
                                    {readField(featuredRace, 'tournamentName')}
                                </h1>
                                <p className="mb-0 mt-4 text-xl font-bold text-white/90">
                                    {readField(featuredRace, 'raceName')}
                                </p>

                                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/85">
                                    <span><FaCalendarAlt className="mr-2 inline text-[#ead38d]" />{formatDateTime(featuredRaceDate)}</span>
                                    <span><FaMapMarkerAlt className="mr-2 inline text-[#ead38d]" />{readField(featuredRace, 'location') || '-'}</span>
                                    <span><FaFlagCheckered className="mr-2 inline text-[#ead38d]" />{readField(featuredRace, 'distanceMeters') ? `${formatNumber(readField(featuredRace, 'distanceMeters'))}m` : '-'}</span>
                                    <span><FaMoneyBillWave className="mr-2 inline text-[#ead38d]" />{formatMoney(readField(featuredRace, 'prizePool'))}</span>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    <StatusBadge label="Race" value={readField(featuredRace, 'raceStatus')} />
                                    <StatusBadge label="Registration" value={registrationState} />
                                    <StatusBadge label="Prediction" value={predictionState} />
                                </div>

                                <div className="mt-7">
                                    <p className="mb-3 mt-0 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/70">
                                        <FaClock className="text-[#ead38d]" />
                                        {countdown.finished ? 'Race time reached' : 'Starts in'}
                                    </p>
                                    {countdown.available && !countdown.finished ? (
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                [countdown.days, 'Days'],
                                                [countdown.hours, 'Hours'],
                                                [countdown.minutes, 'Minutes'],
                                                [countdown.seconds, 'Seconds'],
                                            ].map(([value, label]) => (
                                                <div key={label} className="min-w-[76px] rounded-[10px] border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur">
                                                    <strong className="block font-mono text-2xl font-black">{value}</strong>
                                                    <span className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-white/65">{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="m-0 text-lg font-black text-[#ead38d]">
                                            {countdown.finished ? 'The scheduled start time has arrived.' : 'Schedule pending'}
                                        </p>
                                    )}
                                </div>

                                <CapacityBar
                                    maxHorses={readField(featuredRace, 'maxHorses')}
                                    reservedHorseCount={readField(featuredRace, 'reservedHorseCount')}
                                />
                                {Number(readField(featuredRace, 'maxHorses') || 0) > 0 && (
                                    <p className="mb-0 mt-3 text-xs font-semibold text-white/70">
                                        {formatNumber(readField(featuredRace, 'confirmedHorseCount'))} confirmed · {formatNumber(readField(featuredRace, 'readyHorseCount'))} ready · {formatNumber(readField(featuredRace, 'availableSlots'))} available
                                    </p>
                                )}

                                <div className="mt-8 flex flex-wrap gap-3">
                                    {featuredReplayAvailable && (
                                        <button
                                            type="button"
                                            onClick={() => handleWatchReplay(featuredRaceId)}
                                            className="inline-flex items-center gap-2 rounded-[7px] border-0 bg-[var(--racing-gold)] px-6 py-3.5 text-sm font-black text-[#0b1b34] shadow-[0_14px_30px_rgba(200,162,74,.24)] hover:bg-[var(--racing-gold-bright)]"
                                        >
                                            <FaPlay /> Watch Replay
                                        </button>
                                    )}
                                    <Link to={featureDetailLink} className={`inline-flex items-center gap-2 rounded-[7px] px-6 py-3.5 text-sm font-black no-underline ${featuredReplayAvailable ? 'border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20' : 'bg-[var(--racing-gold)] text-[#0b1b34] shadow-[0_14px_30px_rgba(200,162,74,.24)] hover:bg-[var(--racing-gold-bright)]'}`}>
                                        {registrationState === 'Open' ? 'View Participants' : 'View Race Detail'} <FaArrowRight />
                                    </Link>
                                    {predictionState === 'Open' && canOpenPrediction && (
                                        <Link to={predictionLink} className="inline-flex items-center gap-2 rounded-[7px] border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-black text-white no-underline backdrop-blur hover:bg-white/20">
                                            <FaBolt /> Make Prediction
                                        </Link>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <h1 className="mb-0 mt-8 text-4xl font-black md:text-6xl">Witness Elite Racing History Unfold</h1>
                                <p className="mb-0 mt-5 text-lg text-white/80">No upcoming race is scheduled yet. Explore official tournaments and published results.</p>
                                <Link to="/explore-tournaments" className="mt-8 inline-flex rounded-[7px] bg-[var(--racing-gold)] px-6 py-3.5 text-sm font-black text-[#0b1b34] no-underline">
                                    Explore Tournaments
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {featuredRace && (
                <section className="border-y border-[#244266] bg-[#0b1b34] px-6 text-white md:px-11">
                    <div className="mx-auto grid max-w-7xl divide-y divide-white/10 md:grid-cols-4 md:divide-x md:divide-y-0">
                        {[
                            ['Next Race', readField(featuredRace, 'raceName')],
                            ['Registration', Number(readField(featuredRace, 'maxHorses') || 0) > 0
                                ? `${formatNumber(readField(featuredRace, 'reservedHorseCount'))}/${formatNumber(readField(featuredRace, 'maxHorses'))} horses`
                                : `${formatNumber(readField(featuredRace, 'reservedHorseCount'))} registered`],
                            ['Predictions', formatStatus(predictionState)],
                            ['Prize Pool', formatMoney(readField(featuredRace, 'prizePool'))],
                        ].map(([label, value]) => (
                            <div key={label} className="px-5 py-5 first:pl-0 last:pr-0">
                                <span className="block text-[0.65rem] font-black uppercase tracking-[0.15em] text-[#d8bd6f]">{label}</span>
                                <strong className="mt-1 block truncate text-sm">{value || '-'}</strong>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="mx-auto max-w-7xl px-6 py-14 md:px-11">
                <SectionHeading
                    eyebrow="League at a glance"
                    title="Elite Racing in Numbers"
                    description="Live totals from the official racing system."
                />

                {isLoading ? (
                    <div className="rounded-[12px] border border-[var(--racing-border)] bg-white px-6 py-12 text-center text-sm font-bold text-[var(--racing-muted)]">
                        Loading league statistics...
                    </div>
                ) : loadError ? (
                    <div className="rounded-[12px] border border-[#e2aaa5] bg-[#fde9e7] px-6 py-8 text-center">
                        <p className="m-0 text-sm font-bold text-[#9d332b]">{loadError}</p>
                        <button type="button" onClick={handleRetry} className="mt-4 rounded-[6px] border-0 bg-[var(--racing-primary)] px-5 py-2.5 text-sm font-black text-white">
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {stats.map(({ label, value, icon }) => (
                            <article key={label} className="rounded-[12px] border border-[var(--racing-border)] bg-white p-5 shadow-[0_14px_35px_rgba(11,27,52,.06)]">
                                {createElement(icon, { className: 'text-xl text-[var(--racing-gold)]' })}
                                <strong className="mt-5 block text-3xl font-black tracking-[-0.04em] text-[var(--racing-primary)]">{formatNumber(value)}</strong>
                                <span className="mt-1 block text-[0.68rem] font-black uppercase tracking-[0.1em] text-[var(--racing-muted)]">{label}</span>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="border-y border-[var(--racing-border)] bg-[#efe8d6] px-6 py-16 md:px-11">
                <div className="mx-auto max-w-7xl">
                    <SectionHeading
                        eyebrow="Race calendar"
                        title="Upcoming Tournaments"
                        description="Follow the next official races, capacity and prediction status."
                        action={(
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    aria-label="Previous tournament"
                                    disabled={tournaments.length <= 1}
                                    onClick={() => setActiveTournamentIndex((safeTournamentIndex - 1 + tournaments.length) % tournaments.length)}
                                    className="grid h-10 w-10 place-items-center rounded-full border border-[var(--racing-border)] bg-white text-[var(--racing-primary)]"
                                >
                                    <FaChevronLeft />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Next tournament"
                                    disabled={tournaments.length <= 1}
                                    onClick={() => setActiveTournamentIndex((safeTournamentIndex + 1) % tournaments.length)}
                                    className="grid h-10 w-10 place-items-center rounded-full border border-[var(--racing-border)] bg-white text-[var(--racing-primary)]"
                                >
                                    <FaChevronRight />
                                </button>
                                <Link to="/explore-tournaments" className="ml-2 text-xs font-black uppercase tracking-wide text-[var(--racing-primary)] no-underline">
                                    View Calendar
                                </Link>
                            </div>
                        )}
                    />

                    {isLoading ? (
                        <div className="rounded-[12px] border border-[var(--racing-border)] bg-white px-6 py-14 text-center text-sm font-bold text-[var(--racing-muted)]">
                            Loading upcoming tournaments...
                        </div>
                    ) : tournaments.length > 0 ? (
                        <>
                            <div ref={tournamentTrackRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {tournaments.map((tournament) => (
                                    <TournamentCard
                                        key={tournament.id || tournament.title}
                                        tournament={tournament}
                                        onWatchReplay={handleWatchReplay}
                                    />
                                ))}
                            </div>
                            <div className="mt-3 flex justify-center gap-2">
                                {tournaments.map((tournament, index) => (
                                    <button
                                        key={`dot-${tournament.id || index}`}
                                        type="button"
                                        aria-label={`Show tournament ${index + 1}`}
                                        onClick={() => setActiveTournamentIndex(index)}
                                        className={`h-2.5 rounded-full border-0 p-0 ${index === safeTournamentIndex ? 'w-8 bg-[var(--racing-primary)]' : 'w-2.5 bg-[#c9baa0]'}`}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="rounded-[12px] border border-[var(--racing-border)] bg-white px-6 py-14 text-center text-sm font-bold text-[var(--racing-muted)]">
                            No upcoming tournaments are currently available.
                        </div>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-20 md:px-11">
                <SectionHeading
                    eyebrow="Official result"
                    title={readField(latestResult, 'raceName') || 'Latest Race Podium'}
                    description={latestResult
                        ? `${readField(latestResult, 'tournamentName')} · Published ${formatDate(readField(latestResult, 'publishedAt'))}`
                        : 'The latest top-three finishers will appear here after publication.'}
                    action={latestResult ? (
                        <div className="flex items-center gap-3">
                            {readField(latestResult, 'replayAvailable') && (
                                <button
                                    type="button"
                                    onClick={() => handleWatchReplay(readField(latestResult, 'raceId'))}
                                    className="inline-flex items-center gap-2 rounded-full border-0 bg-[#e8f6ee] px-4 py-2 text-xs font-black uppercase text-[#236647]"
                                >
                                    <FaPlay /> Watch Official Replay
                                </button>
                            )}
                            <Link to={`/public/races/${readField(latestResult, 'raceId')}`} className="inline-flex items-center gap-2 text-xs font-black uppercase text-[var(--racing-primary)] no-underline">
                                Race Detail <FaArrowRight />
                            </Link>
                        </div>
                    ) : null}
                />

                {isLoading ? (
                    <div className="rounded-[12px] border border-[var(--racing-border)] bg-white px-6 py-14 text-center text-sm font-bold text-[var(--racing-muted)]">
                        Loading recent results...
                    </div>
                ) : podiumRows.length > 0 ? (
                    <div className="grid items-end gap-5 pt-8 md:grid-cols-3">
                        {podiumRows.map((row) => (
                            <PodiumCard key={readField(row, 'horseId') || readField(row, 'position')} row={row} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[12px] border border-[var(--racing-border)] bg-white px-6 py-14 text-center text-sm font-bold text-[var(--racing-muted)]">
                        No published race results are currently available.
                    </div>
                )}
            </section>

            <section className="bg-[#0b1b34] px-6 py-16 text-white md:px-11">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col gap-5 border-b border-white/15 pb-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="mb-2 mt-0 text-xs font-black uppercase tracking-[0.18em] text-[#d8bd6f]">Active season leaders</p>
                            <h2 className="m-0 text-3xl font-black tracking-[-0.03em] md:text-4xl">Season Leaderboard</h2>
                            <p className="mb-0 mt-2 text-sm text-white/65">Official rankings for jockeys, owners and spectators.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {RANKING_TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveRankingTab(tab.key)}
                                    className={`rounded-full border px-4 py-2 text-xs font-black ${activeRankingTab === tab.key ? 'border-[#d8bd6f] bg-[#d8bd6f] text-[#0b1b34]' : 'border-white/20 bg-white/5 text-white'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[14px] bg-[#f6f3ea] p-4 text-[var(--racing-ink)] md:p-6">
                        {rankingsLoading ? (
                            <p className="m-0 py-12 text-center text-sm font-bold text-[var(--racing-muted)]">Loading season rankings...</p>
                        ) : (
                            <>
                                {rankingsError && <p className="mb-4 mt-0 text-center text-xs font-bold text-[#9d332b]">{rankingsError}</p>}
                                <RankingList activeTab={activeRankingTab} items={rankings[activeRankingTab] || []} />
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-16 md:px-11">
                <SectionHeading
                    eyebrow="From entry to reward"
                    title="How Elite Racing Works"
                    description="Every official race follows a transparent workflow across all league roles."
                />
                <div className="grid gap-4 md:grid-cols-5">
                    {howItWorks.map(([number, title, description], index) => (
                        <article key={number} className="relative rounded-[12px] border border-[var(--racing-border)] bg-white p-5 shadow-[0_14px_35px_rgba(11,27,52,.05)]">
                            <span className="text-3xl font-black text-[var(--racing-gold)]">{number}</span>
                            <h3 className="mb-0 mt-5 text-base font-black uppercase leading-6">{title}</h3>
                            <p className="mb-0 mt-3 text-sm leading-6 text-[var(--racing-muted)]">{description}</p>
                            {index < howItWorks.length - 1 && (
                                <FaArrowRight className="absolute -right-3 top-8 z-10 hidden text-[var(--racing-gold)] md:block" />
                            )}
                        </article>
                    ))}
                </div>
            </section>

            <section className="px-6 pb-16 md:px-11">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-[18px] bg-[linear-gradient(120deg,#0b1b34,#173c69)] px-7 py-12 text-white shadow-[0_24px_60px_rgba(11,27,52,.18)] md:px-12">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-[#d8bd6f]">Join the league</p>
                            <h2 className="mb-0 mt-3 text-3xl font-black md:text-4xl">Your place in race day starts here.</h2>
                            <p className="mb-0 mt-4 leading-7 text-white/70">Register as a horse owner, jockey or spectator and take part in the complete Elite Racing League experience.</p>
                        </div>
                        <Link to="/register" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[var(--racing-gold)] px-7 py-4 text-sm font-black text-[#0b1b34] no-underline hover:bg-[var(--racing-gold-bright)]">
                            Join Elite Racing <FaArrowRight />
                        </Link>
                    </div>
                    <div className="mt-8 grid gap-3 border-t border-white/15 pt-7 sm:grid-cols-3">
                        {[
                            [FaHorse, 'Horse Owner', 'Register and manage race horses.'],
                            [FaMedal, 'Jockey', 'Build your professional racing record.'],
                            [FaUsers, 'Spectator', 'Predict outcomes and earn rewards.'],
                        ].map(([icon, title, description]) => (
                            <div key={title} className="flex items-start gap-3 rounded-[10px] bg-white/5 p-4">
                                {createElement(icon, { className: 'mt-1 shrink-0 text-[#d8bd6f]' })}
                                <div>
                                    <strong className="block">{title}</strong>
                                    <span className="mt-1 block text-xs leading-5 text-white/65">{description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {replayRaceId && (
                <HomeReplayModal
                    key={replayRaceId}
                    raceId={replayRaceId}
                    onClose={() => setReplayRaceId(null)}
                />
            )}
        </PublicLayout>
    );
}
