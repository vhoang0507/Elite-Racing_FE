import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaArrowLeft,
    FaExclamationTriangle,
    FaFlagCheckered,
    FaHorse,
    FaPause,
    FaPlay,
    FaRedo,
    FaStopwatch,
    FaVolumeMute,
    FaVolumeUp,
} from 'react-icons/fa';

import { spectatorApi } from '../../../api/spectatorApi';

const RUNNER_COLORS = ['#e93d3d', '#f2c12e', '#21ad63', '#2775df', '#9a4ad7', '#ef7b22', '#222831', '#e9538f'];
const JOCKEY_COLORS = ['#ffe923', '#f8fafc', '#2bd778', '#42a5ff', '#ff4fa3', '#ff9a35', '#fff16b', '#7be9ff'];
const FINISH_PROGRESS = 1;
const AFTER_FINISH_PROGRESS = 1.03;
const CURVE_SAMPLES = 300;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function hashNumber(value) {
    const text = String(value ?? 'runner');
    let hash = 2166136261;

    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

function seeded(seed, offset = 0) {
    const x = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453;
    return x - Math.floor(x);
}

function smoothstep(edge0, edge1, value) {
    const t = clamp((value - edge0) / Math.max(edge1 - edge0, 0.00001), 0, 1);
    return t * t * (3 - 2 * t);
}

function formatTime(ms) {
    const value = Number(ms);
    return Number.isFinite(value) && value > 0 ? `${(value / 1000).toFixed(2)}s` : '—';
}

function ordinal(rank) {
    const number = Number(rank || 0);
    if (!number) return '—';
    if (number % 100 >= 11 && number % 100 <= 13) return `${number}th`;
    if (number % 10 === 1) return `${number}st`;
    if (number % 10 === 2) return `${number}nd`;
    if (number % 10 === 3) return `${number}rd`;
    return `${number}th`;
}

function normalizeOutcome(value) {
    const status = String(value || 'Finished').trim();
    const normalized = status.toUpperCase().replaceAll(' ', '');

    if (normalized === 'DIDNOTSTART') return 'DNS';
    if (normalized === 'DIDNOTFINISH') return 'DNF';
    if (normalized === 'DISQUALIFIED') return 'DSQ';
    if (normalized === 'WITHDRAWN') return 'Withdrawn';
    if (normalized === 'DNS' || normalized === 'DNF' || normalized === 'DSQ') return normalized;
    return 'Finished';
}

function isNormalFinisher(runner) {
    return normalizeOutcome(runner.outcomeStatus) === 'Finished';
}

function canRunOnTrack(runner) {
    return !['DNS', 'Withdrawn'].includes(normalizeOutcome(runner.outcomeStatus));
}

function getOutcomeLabel(runner) {
    const outcome = normalizeOutcome(runner.outcomeStatus);
    const labels = {
        DNS: 'Did not start',
        DNF: 'Did not finish',
        DSQ: 'Disqualified',
        Withdrawn: 'Withdrawn',
    };
    return labels[outcome] || 'Finished';
}

function buildMonotonicCurve(seed) {
    const values = [0];
    let cumulative = 0;
    const early = 0.75 + seeded(seed, 1) * 0.55;
    const middle = 0.72 + seeded(seed, 2) * 0.62;
    const late = 0.78 + seeded(seed, 3) * 0.72;
    const kick = 0.75 + seeded(seed, 4) * 0.85;
    const phaseA = seeded(seed, 5) * Math.PI * 2;
    const phaseB = seeded(seed, 6) * Math.PI * 2;

    for (let index = 1; index <= CURVE_SAMPLES; index += 1) {
        const t = index / CURVE_SAMPLES;
        const launch = 0.42 + smoothstep(0, 0.12, t) * 0.82;
        const earlySurge = Math.exp(-Math.pow((t - (0.22 + seeded(seed, 7) * 0.09)) / 0.115, 2)) * early;
        const middleSurge = Math.exp(-Math.pow((t - (0.48 + seeded(seed, 8) * 0.08)) / 0.13, 2)) * middle;
        const lateSurge = Math.exp(-Math.pow((t - (0.69 + seeded(seed, 9) * 0.08)) / 0.11, 2)) * late;
        const finalKick = smoothstep(0.72, 1, t) * kick;
        const cadence = 0.12 * Math.sin(t * Math.PI * 5.2 + phaseA)
            + 0.08 * Math.sin(t * Math.PI * 8.4 + phaseB);
        const speed = Math.max(0.2, launch + earlySurge * 0.4 + middleSurge * 0.35 + lateSurge * 0.3 + finalKick * 0.55 + cadence);

        cumulative += speed;
        values.push(cumulative);
    }

    const total = values[values.length - 1] || 1;
    return values.map((value) => value / total);
}

function sampleCurve(curve, t) {
    const normalized = clamp(t, 0, 1);
    const exact = normalized * (curve.length - 1);
    const lower = Math.floor(exact);
    const upper = Math.min(curve.length - 1, lower + 1);
    const fraction = exact - lower;
    return curve[lower] + (curve[upper] - curve[lower]) * fraction;
}

function getVisualFinishTimes(runners) {
    const finished = runners.filter((runner) => ['Finished', 'DSQ'].includes(normalizeOutcome(runner.outcomeStatus)));
    const sorted = [...finished].sort((a, b) => {
        const rankA = Number(a.rank || Number.MAX_SAFE_INTEGER);
        const rankB = Number(b.rank || Number.MAX_SAFE_INTEGER);
        if (rankA !== rankB) return rankA - rankB;
        return Number(a.finishTimeMs || Number.MAX_SAFE_INTEGER) - Number(b.finishTimeMs || Number.MAX_SAFE_INTEGER);
    });
    const timingByKey = new Map();

    sorted.forEach((runner, index) => {
        timingByKey.set(runner.registrationId || runner.resultId || runner.horseName, 10800 + index * 280);
    });

    return runners.map((runner, index) => {
        const outcome = normalizeOutcome(runner.outcomeStatus);
        const key = runner.registrationId || runner.resultId || runner.horseName;

        if (outcome === 'DNS' || outcome === 'Withdrawn') return 0;
        if (outcome === 'DNF') return 6500 + seeded(hashNumber(key), 20) * 2600;
        return timingByKey.get(key) || 10800 + index * 280;
    });
}

function buildRunnerProfile(runner, index, visualFinishMs) {
    const seed = hashNumber(`${runner.registrationId || runner.resultId || index}-${runner.horseName || ''}`);
    const outcomeStatus = normalizeOutcome(runner.outcomeStatus);
    const dnfStopProgress = outcomeStatus === 'DNF'
        ? 0.48 + seeded(seed, 22) * 0.34
        : null;

    return {
        ...runner,
        outcomeStatus,
        color: runner.color || RUNNER_COLORS[index % RUNNER_COLORS.length],
        jockeyColor: JOCKEY_COLORS[index % JOCKEY_COLORS.length],
        officialRank: Number(runner.rank || 0),
        lane: Number(runner.lane || index + 1),
        visualFinishMs,
        seed,
        curve: buildMonotonicCurve(seed),
        dnfStopProgress,
        bodyTone: seeded(seed, 30),
        markingType: Math.floor(seeded(seed, 31) * 4),
    };
}

function runnerProgress(elapsed, runner) {
    const outcome = normalizeOutcome(runner.outcomeStatus);

    if (outcome === 'DNS' || outcome === 'Withdrawn' || elapsed <= 0) return 0;

    if (outcome === 'DNF') {
        const normalized = clamp(elapsed / Math.max(runner.visualFinishMs, 1), 0, 1);
        const travel = sampleCurve(runner.curve, normalized) * runner.dnfStopProgress;
        return normalized >= 1 ? runner.dnfStopProgress : travel;
    }

    const normalized = clamp(elapsed / Math.max(runner.visualFinishMs, 1), 0, 1);
    const toFinish = sampleCurve(runner.curve, normalized) * FINISH_PROGRESS;

    if (elapsed <= runner.visualFinishMs) return toFinish;

    const afterFinish = clamp((elapsed - runner.visualFinishMs) / 1500, 0, 1);
    return FINISH_PROGRESS + afterFinish * (AFTER_FINISH_PROGRESS - FINISH_PROGRESS);
}

function runnerIsMoving(elapsed, runner, phase) {
    if (phase !== 'running') return false;
    const outcome = normalizeOutcome(runner.outcomeStatus);
    if (outcome === 'DNS' || outcome === 'Withdrawn') return false;
    if (outcome === 'DNF' && elapsed >= runner.visualFinishMs) return false;
    if (elapsed >= runner.visualFinishMs + 1500) return false;
    return true;
}

function sortOfficialRunners(a, b) {
    const aFinished = isNormalFinisher(a);
    const bFinished = isNormalFinisher(b);
    if (aFinished !== bFinished) return aFinished ? -1 : 1;
    if (aFinished && bFinished) return (a.officialRank || 999) - (b.officialRank || 999);
    return a.lane - b.lane;
}

function runnerResultIsVisible(runner, phase) {
    if (phase === 'done') return true;

    const outcome = normalizeOutcome(runner.outcomeStatus);
    if (outcome === 'Finished' || outcome === 'DSQ') {
        return Number(runner.progress || 0) >= FINISH_PROGRESS;
    }

    if (outcome === 'DNF') {
        const stopProgress = Number(runner.dnfStopProgress || 0);
        return stopProgress > 0 && Number(runner.progress || 0) >= stopProgress - 0.001;
    }

    return false;
}

function getVisibleOfficialRunners(runners, phase) {
    return [...runners]
        .filter((runner) => runnerResultIsVisible(runner, phase))
        .sort(sortOfficialRunners);
}

function HorseSprite({ runner, running }) {
    const horseTone = runner.bodyTone > 0.72
        ? '#3d3d3d'
        : runner.bodyTone > 0.46
            ? '#8a5a34'
            : runner.bodyTone > 0.22
                ? '#c58a4e'
                : '#e8e4da';

    return (
        <div className={`real-horse-sprite ${running ? 'is-running' : ''}`}>
            <FaHorse aria-hidden="true" className="horse-icon" style={{ color: horseTone }} />
            <span className="jockey-rider" style={{ backgroundColor: runner.jockeyColor }}>
                <span className="jockey-arm" />
                <span className="jockey-leg" />
            </span>
            <span className="jockey-head">
                <span className="jockey-cap" style={{ backgroundColor: runner.color }} />
            </span>
            <span className="jockey-badge" style={{ backgroundColor: runner.color }}>{runner.lane}</span>
        </div>
    );
}

function OutcomeBadge({ runner }) {
    const outcome = normalizeOutcome(runner.outcomeStatus);
    if (outcome === 'Finished') return null;

    return (
        <div className={`runner-issue issue-${outcome.toLowerCase()}`}>
            <FaExclamationTriangle aria-hidden="true" />
            <span>{outcome}</span>
        </div>
    );
}

function RaceStage({
    replay,
    runners,
    phase,
    elapsed,
    visualRaceMs,
    soundEnabled,
    onToggleSound,
    onBack,
    onStart,
    onPause,
    countdown,
}) {
    const rankable = runners.filter((runner) => isNormalFinisher(runner));
    const ordered = [...rankable].sort((a, b) => {
        if (b.progress !== a.progress) return b.progress - a.progress;
        return (a.officialRank || Number.MAX_SAFE_INTEGER) - (b.officialRank || Number.MAX_SAFE_INTEGER);
    });
    const liveRanks = new Map(ordered.map((runner, index) => [runner.registrationId, index + 1]));
    const leaderProgress = ordered[0]?.progress || Math.max(...runners.map((runner) => runner.progress), 0);
    const distanceMeters = Number(replay.distanceMeters || 0);
    const distanceCovered = Math.round(distanceMeters * clamp(leaderProgress, 0, 1));
    const backgroundShift = clamp(leaderProgress, 0, 1) * 780;
    const winner = [...runners]
        .filter((runner) => isNormalFinisher(runner))
        .sort((a, b) => (a.officialRank || 999) - (b.officialRank || 999))[0];

    const getHorseX = (runner) => 5.5 + clamp(runner.progress, 0, AFTER_FINISH_PROGRESS) * 76.5;

    const laneCount = Math.max(runners.length, 1);
    const laneOrder = [...runners].sort((a, b) => a.lane - b.lane);

    const trackOrder = runners
        .filter((runner) => canRunOnTrack(runner))
        .sort((a, b) => {
            if (b.progress !== a.progress) return b.progress - a.progress;
            return (a.officialRank || Number.MAX_SAFE_INTEGER) - (b.officialRank || Number.MAX_SAFE_INTEGER);
        });
    const offTrackRunners = runners.filter((runner) => !canRunOnTrack(runner));
    const orderPanelItems = [...trackOrder, ...offTrackRunners];
    const visibleOfficialRunners = getVisibleOfficialRunners(runners, phase);

    return (
        <div className="race-game-shell">
            <style>{`
                .race-game-shell { overflow: hidden; border: 6px solid #8a5a2a; border-radius: 14px; background: #2f6b2f; box-shadow: 0 22px 55px rgba(15,23,42,.28), inset 0 0 0 3px #d8a23a; }
                .race-stage { position: relative; height: clamp(580px,70vw,780px); min-height: 580px; overflow: hidden; background: #3f8a3f; }
                .race-field { position:absolute; inset:0; background:repeating-linear-gradient(180deg,#4c9a4c 0 40px,#458f45 40px 80px); transform:translate3d(calc(var(--bg-shift) * -0.15px),0,0); background-size:160px 80px; will-change:transform; }
                .race-border-top,.race-border-bottom { position:absolute; left:0; right:0; height:9%; background:linear-gradient(180deg,#d9b877,#c49a55); z-index:6; box-shadow:inset 0 0 0 3px rgba(255,255,255,.25); }
                .race-border-top { top:0; border-bottom:4px solid #8a5a2a; }
                .race-border-bottom { bottom:0; border-top:4px solid #8a5a2a; }
                .race-tree-row { position:absolute; left:0; right:0; display:flex; justify-content:space-around; align-items:center; z-index:7; }
                .race-tree-row.top { top:1%; } .race-tree-row.bottom { bottom:1%; }
                .race-tree { position:relative; width:26px; height:30px; flex:none; }
                .race-tree::before { content:''; position:absolute; left:50%; bottom:0; width:6px; height:12px; background:#7a4a24; transform:translateX(-50%); border-radius:1px; }
                .race-tree::after { content:''; position:absolute; left:50%; bottom:9px; width:26px; height:26px; background:#2f7d3a; border:2px solid #245e2c; border-radius:50%; transform:translateX(-50%); }
                .race-start-post,.race-finish-post { position:absolute; top:9%; bottom:9%; width:6px; transform:translateX(-50%); background:repeating-linear-gradient(180deg,#fff 0 10px,#c0272d 10px 20px); border:1px solid rgba(0,0,0,.25); z-index:8; }
                .race-start-post { left:5.5%; } .race-finish-post { left:82%; }
                .race-start-post::before,.race-finish-post::before { position:absolute; top:-26px; left:50%; transform:translateX(-50%); border-radius:5px; background:#4a1010; color:#f7d45c; padding:4px 8px; font-size:10px; font-weight:900; letter-spacing:.1em; border:1px solid #d8a23a; }
                .race-start-post::before { content:'START'; } .race-finish-post::before { content:'FINISH'; }
                .race-lanes { position:absolute; left:0; right:0; top:9%; bottom:9%; display:grid; z-index:15; }
                .race-lane-row { position:relative; min-height:0; }
                .race-horse-wrap { position:absolute; left:0; top:50%; width:clamp(64px,6.6vw,100px); aspect-ratio:1.25/1; translate:-50% -50%; rotate:-4deg; will-change:left; z-index:20; }
                .speed-lines { position:absolute; right:100%; top:38%; width:60px; height:34%; opacity:0; pointer-events:none; }
                .speed-lines span { position:absolute; right:0; height:2.5px; background:rgba(255,255,255,.55); border-radius:2px; }
                .speed-lines span:nth-child(1) { top:8%; width:70%; }
                .speed-lines span:nth-child(2) { top:46%; width:100%; }
                .speed-lines span:nth-child(3) { top:82%; width:55%; }
                .race-horse-wrap.is-running .speed-lines { opacity:1; animation:speed-flicker 260ms ease-in-out infinite; }
                @keyframes speed-flicker { 0%,100%{opacity:.35} 50%{opacity:.85} }
                .real-horse-sprite { position:relative; width:100%; height:100%; }
                .horse-icon { position:absolute; inset:0; width:100%; height:100%; filter:drop-shadow(0 6px 3px rgba(44,22,12,.35)); }
                .real-horse-sprite.is-running .horse-icon { animation:horse-bounce 260ms ease-in-out infinite; }
                @keyframes horse-bounce { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-6%) rotate(-3deg)} }
                .jockey-rider { position:absolute; left:33%; top:20%; width:16%; aspect-ratio:0.8; border-radius:50% 50% 35% 35%; border:2px solid #1f2937; z-index:2; box-shadow:0 2px 4px rgba(0,0,0,.3); }
                .jockey-arm { position:absolute; left:100%; top:20%; width:60%; height:16%; background:inherit; border:2px solid #1f2937; border-radius:4px; transform-origin:0 50%; rotate:-25deg; }
                .jockey-leg { position:absolute; left:15%; top:85%; width:60%; height:45%; background:#2b2b2b; border:2px solid #1f2937; border-radius:0 0 40% 40%; }
                .jockey-head { position:absolute; left:38%; top:2%; width:13%; aspect-ratio:1; border-radius:50%; background:#dcae86; border:2px solid #1f2937; z-index:3; }
                .jockey-cap { position:absolute; left:-15%; top:-30%; width:130%; height:70%; border-radius:50% 50% 0 0; border:2px solid #1f2937; border-bottom:none; }
                .jockey-badge { position:absolute; left:58%; top:-8%; display:grid; place-items:center; width:26%; aspect-ratio:1; min-width:18px; border-radius:50%; border:2px solid #1f2937; color:#fff; font-size:.6rem; font-weight:900; box-shadow:0 3px 6px rgba(0,0,0,.3); z-index:4; }
                .race-dust { position:absolute; left:4%; bottom:6%; width:94px; height:32px; opacity:0; pointer-events:none; }
                .race-dust::before,.race-dust::after { content:''; position:absolute; border-radius:50%; background:rgba(224,173,117,.62); filter:blur(3px); }
                .race-dust::before { width:64px; height:21px; left:0; bottom:0; } .race-dust::after { width:38px; height:17px; left:31px; bottom:8px; }
                .race-horse-wrap.is-running .race-dust { opacity:1; animation:dust-puff 500ms ease-out infinite; }
                @keyframes dust-puff { 0%{transform:translateX(23px) scale(.55);opacity:.18} 55%{opacity:.65} 100%{transform:translateX(-42px) scale(1.3);opacity:0} }
                .race-order-panel { position:absolute; right:14px; top:64px; z-index:38; width:min(180px,32vw); border-radius:10px; border:2px solid #d8a23a; background:rgba(74,16,16,.92); box-shadow:0 6px 0 rgba(0,0,0,.25); overflow:hidden; }
                .race-order-panel h4 { margin:0; padding:7px 10px; background:#7a1f1f; color:#f7d45c; font-size:.62rem; font-weight:950; text-transform:uppercase; letter-spacing:.1em; text-align:center; }
                .race-order-row { display:flex; align-items:center; gap:7px; padding:5px 9px; border-top:1px solid rgba(255,255,255,.08); }
                .race-order-pos { flex:none; width:16px; font-size:.68rem; font-weight:950; color:#f7d45c; text-align:center; }
                .race-order-dot { flex:none; width:9px; height:9px; border-radius:50%; box-shadow:0 0 0 1px rgba(255,255,255,.4); }
                .race-order-name { min-width:0; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#fff; font-size:.68rem; font-weight:800; }
                .race-order-tag { flex:none; font-size:.56rem; font-weight:950; color:#ffb4ab; text-transform:uppercase; }
                @media(max-width:800px){ .race-order-panel{display:none} }
                .runner-issue { position:absolute; left:50%; top:-39px; transform:translateX(-50%); display:flex; align-items:center; gap:5px; border:2px solid #fff; border-radius:999px; padding:4px 9px; color:#fff; font-size:.65rem; font-weight:950; box-shadow:0 5px 14px rgba(0,0,0,.28); z-index:5; }
                .issue-dnf,.issue-dsq { background:#a91f27; } .issue-dns,.issue-withdrawn { background:#6b7280; }
                .race-countdown { position:absolute; inset:0; z-index:60; display:grid; place-items:center; background:rgba(9,24,41,.23); backdrop-filter:blur(1px); }
                .race-countdown strong { display:grid; width:126px; height:126px; place-items:center; border-radius:50%; border:7px solid rgba(255,255,255,.92); background:linear-gradient(145deg,#d91f26,#8e0f16); color:#fff; font-size:4rem; text-shadow:0 4px 0 rgba(0,0,0,.2); box-shadow:0 16px 40px rgba(0,0,0,.34); animation:countdown-pop 620ms ease both; }
                @keyframes countdown-pop { 0%{transform:scale(.45);opacity:0} 45%{transform:scale(1.12);opacity:1} 100%{transform:scale(1);opacity:1} }
                .race-winner-burst { position:absolute; left:50%; top:24%; z-index:62; transform:translate(-50%,-50%); border:4px solid #f5c542; border-radius:18px; background:linear-gradient(135deg,rgba(74,16,16,.97),rgba(122,31,31,.97)); color:#fff; padding:16px 24px; text-align:center; box-shadow:0 18px 44px rgba(0,0,0,.34),0 0 0 7px rgba(245,197,66,.14); animation:winner-pop 700ms cubic-bezier(.2,.9,.2,1.25) both; }
                @keyframes winner-pop { from{transform:translate(-50%,-50%) scale(.5);opacity:0} to{transform:translate(-50%,-50%) scale(1);opacity:1} }
                .race-rank-strip { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:12px; align-items:stretch; border-top:4px solid #d8a23a; background:linear-gradient(180deg,#7a1f1f,#3d0e0e); padding:14px 16px; }
                .race-rank-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(92px,1fr)); gap:9px; }
                .race-rank-card { min-width:0; text-align:center; }
                .race-rank-empty { display:grid; min-height:88px; place-items:center; color:rgba(255,255,255,.72); font-size:.72rem; font-weight:950; text-transform:uppercase; letter-spacing:.12em; }
                .race-rank-title { color:#f7d45c; font-size:.95rem; font-weight:950; text-shadow:0 2px 0 rgba(0,0,0,.3); }
                .race-rank-number { display:grid; width:54px; height:48px; margin:5px auto; place-items:center; border:3px solid rgba(255,255,255,.7); border-radius:5px; color:#fff; font-size:1.75rem; font-weight:950; text-shadow:0 2px 0 rgba(0,0,0,.45); box-shadow:0 5px 0 rgba(0,0,0,.25); }
                .race-rank-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:rgba(255,255,255,.88); font-size:.68rem; font-weight:850; text-transform:uppercase; }
                .race-winner-seal { display:grid; width:92px; place-items:center; align-content:center; color:#f6cf50; text-align:center; }
                .race-winner-seal svg { font-size:2.8rem; filter:drop-shadow(0 4px 0 rgba(0,0,0,.35)); }
                .race-control-bar { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; padding:12px 18px; background:linear-gradient(180deg,#5c1616,#320c0c); border-top:3px solid #d8a23a; }
                .race-timer-chip { display:inline-flex; align-items:center; gap:8px; border-radius:8px; border:2px solid #d8a23a; background:linear-gradient(180deg,#6b1a1a,#3a0d0d); padding:8px 14px; color:#fff; font-weight:900; letter-spacing:.04em; box-shadow:0 4px 0 rgba(0,0,0,.28); font-variant-numeric:tabular-nums; }
                .race-phase-chip { font-size:.7rem; font-weight:950; text-transform:uppercase; letter-spacing:.12em; color:rgba(255,255,255,.65); }
                .race-action-btn { display:inline-flex; align-items:center; gap:8px; border-radius:8px; border:2px solid #d8a23a; padding:10px 20px; font-size:.78rem; font-weight:900; text-transform:uppercase; letter-spacing:.08em; color:#fff; box-shadow:0 4px 0 rgba(0,0,0,.28); cursor:pointer; min-height:44px; }
                .race-action-btn.is-start { border-color:#ffe58a; background:linear-gradient(180deg,#d63c2f,#9e1816); }
                .race-action-btn.is-pause { background:linear-gradient(180deg,#7a1f1f,#4a1010); }
                @media(max-width:800px){ .race-stage{height:540px}.race-rank-strip{grid-template-columns:minmax(0,1fr)}.race-winner-seal{display:none} }
            `}</style>

            <div className="race-stage" style={{ '--bg-shift': backgroundShift }}>
                <div className="race-field" />
                <div className="race-border-top" />
                <div className="race-border-bottom" />
                <div className="race-tree-row top">
                    {Array.from({ length: 10 }).map((_, i) => <div className="race-tree" key={`tree-top-${i}`} />)}
                </div>
                <div className="race-tree-row bottom">
                    {Array.from({ length: 10 }).map((_, i) => <div className="race-tree" key={`tree-bottom-${i}`} />)}
                </div>
                <div className="race-start-post" />
                <div className="race-finish-post" />

                <div className="absolute left-4 top-4 z-40 flex flex-wrap items-center gap-2">
                    <button aria-label="Back" className="grid h-11 w-11 place-items-center rounded-[8px] border-2 border-[#d8a23a] bg-[linear-gradient(180deg,#7a1f1f,#4a1010)] text-white shadow-[0_4px_0_rgba(0,0,0,.28)]" onClick={onBack} type="button">
                        <FaArrowLeft />
                    </button>
                    <div className="rounded-[8px] border-2 border-[#d8a23a] bg-[linear-gradient(180deg,#7a1f1f,#4a1010)] px-4 py-2 text-white shadow-[0_4px_0_rgba(0,0,0,.28)]">
                        <p className="m-0 text-[.68rem] font-black uppercase tracking-[.12em] text-white/70">Official race replay</p>
                        <p className="m-0 mt-1 text-[.88rem] font-black">{replay.raceName}</p>
                    </div>
                </div>

                <div className="absolute right-4 top-4 z-40 flex items-center gap-2">
                    <button aria-label={soundEnabled ? 'Mute replay sound' : 'Enable replay sound'} className="grid h-12 w-12 place-items-center rounded-[8px] border-2 border-[#d8a23a] bg-[linear-gradient(180deg,#7a1f1f,#4a1010)] text-xl text-white shadow-[0_4px_0_rgba(0,0,0,.28)]" onClick={onToggleSound} type="button">
                        {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                    </button>
                </div>

                <div className="absolute left-1/2 top-4 z-40 w-[min(520px,44vw)] -translate-x-1/2 rounded-[10px] border-2 border-[#d8a23a] bg-[rgba(74,16,16,.93)] px-4 py-3 text-white shadow-[0_5px_0_rgba(0,0,0,.25)] max-[760px]:top-[76px] max-[760px]:w-[88%]">
                    <div className="flex items-center justify-between gap-3 text-[.75rem] font-black uppercase tracking-[.08em]">
                        <span>{distanceCovered.toLocaleString()}m</span>
                        <span>{replay.tournamentName}</span>
                        <span>{distanceMeters.toLocaleString()}m</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full border border-white/30 bg-[#031b33]">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#f6c543,#ffef8a)]" style={{ width: `${clamp(leaderProgress, 0, 1) * 100}%` }} />
                    </div>
                </div>

                <div className="race-order-panel">
                    <h4>Running Order</h4>
                    {orderPanelItems.map((runner, index) => {
                        const outcome = normalizeOutcome(runner.outcomeStatus);
                        const onTrack = canRunOnTrack(runner);
                        const posLabel = onTrack ? (index + 1) : '—';

                        return (
                            <div className="race-order-row" key={`order-${runner.registrationId || runner.resultId || runner.horseName}`}>
                                <span className="race-order-pos">{posLabel}</span>
                                <span className="race-order-dot" style={{ backgroundColor: runner.color }} />
                                <span className="race-order-name">{runner.horseName}</span>
                                {outcome !== 'Finished' ? <span className="race-order-tag">{outcome}</span> : null}
                            </div>
                        );
                    })}
                </div>

                <div className="race-lanes" style={{ gridTemplateRows: `repeat(${laneCount}, 1fr)` }}>
                    {laneOrder.map((runner) => {
                        const key = runner.registrationId || runner.resultId || runner.horseName;
                        const liveRank = liveRanks.get(runner.registrationId) || null;
                        const x = getHorseX(runner);
                        const moving = runnerIsMoving(elapsed, runner, phase);

                        return (
                            <div className="race-lane-row" key={key}>
                                <div
                                    className={`race-horse-wrap ${moving ? 'is-running' : ''}`}
                                    style={{ left: `${x}%`, zIndex: 30 + runner.lane }}
                                >
                                    <div className="speed-lines"><span /><span /><span /></div>
                                    <div className="race-dust" />
                                    <HorseSprite runner={runner} running={moving} />
                                    <OutcomeBadge runner={runner} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {phase === 'countdown' ? <div className="race-countdown"><strong key={countdown}>{countdown || 'GO!'}</strong></div> : null}

                {phase === 'done' && winner ? (
                    <div className="race-winner-burst">
                        <div className="text-[.72rem] font-black uppercase tracking-[.18em] text-[#f5c542]">Winner</div>
                        <div className="mt-1 text-[1.45rem] font-black">{winner.horseName}</div>
                        <div className="mt-1 text-[.78rem] font-bold text-white/75">Jockey: {winner.jockeyName || '—'} • {formatTime(winner.finishTimeMs)}</div>
                    </div>
                ) : null}
            </div>

            <div className="race-control-bar">
                <div className="race-timer-chip">
                    <FaStopwatch />
                    <span>{formatTime(Math.min(elapsed, visualRaceMs))}</span>
                </div>

                <span className="race-phase-chip">
                    {phase === 'countdown' ? 'Get ready…'
                        : phase === 'running' ? 'Live'
                            : phase === 'paused' ? 'Paused'
                                : phase === 'done' ? 'Race finished'
                                    : 'Ready to start'}
                </span>

                {phase === 'running' ? (
                    <button className="race-action-btn is-pause" onClick={onPause} type="button">
                        <FaPause /> Pause
                    </button>
                ) : (
                    <button className="race-action-btn is-start" onClick={onStart} type="button">
                        {phase === 'done' ? <FaRedo /> : <FaPlay />}
                        {phase === 'done' ? 'Replay again' : phase === 'paused' ? 'Resume race' : 'Start replay'}
                    </button>
                )}
            </div>

            <div className="race-rank-strip">
                <div className="race-rank-list">
                    {visibleOfficialRunners.length === 0 ? (
                        <div className="race-rank-empty">Awaiting finishers</div>
                    ) : (
                        visibleOfficialRunners.map((runner) => (
                            <div className="race-rank-card" key={`rank-${runner.registrationId || runner.resultId}`}>
                                <div className="race-rank-title">{isNormalFinisher(runner) ? ordinal(runner.officialRank) : normalizeOutcome(runner.outcomeStatus)}</div>
                                <div className="race-rank-number" style={{ backgroundColor: runner.color }}>{runner.lane}</div>
                                <div className="race-rank-name">{runner.horseName}</div>
                            </div>
                        ))
                    )}
                </div>
                <div className="race-winner-seal"><FaFlagCheckered /><strong className="mt-1 text-[.72rem] uppercase tracking-[.12em]">Finish</strong></div>
            </div>
        </div>
    );
}

function OfficialResults({ runners, phase }) {
    const ordered = getVisibleOfficialRunners(runners, phase);

    return (
        <section className="surface-card overflow-hidden">
            <div className="section-bar">
                <div>
                    <h2 className="m-0 text-[1.05rem] font-black">Official Finish Order</h2>
                    <p className="m-0 mt-1 text-[.76rem] font-semibold text-[var(--admin-muted)]">Official positions, outcome status, finish time, and referee note from the database.</p>
                </div>
            </div>
            {ordered.length === 0 ? (
                <div className="p-6 text-center text-[.84rem] font-bold text-[var(--admin-muted)]">Awaiting finishers.</div>
            ) : (
                <div className="grid gap-2 p-4 md:grid-cols-2 xl:grid-cols-4">
                {ordered.map((runner) => {
                    const outcome = normalizeOutcome(runner.outcomeStatus);
                    const finished = outcome === 'Finished';
                    return (
                        <article className={`grid gap-3 rounded-[12px] border px-4 py-3 ${finished ? 'border-[var(--admin-border)] bg-[#fffaf8]' : 'border-[#e7b8b2] bg-[#fff4f2]'}`} key={`official-${runner.registrationId || runner.resultId}`}>
                            <div className="flex items-center gap-3">
                                <span className="grid h-11 w-11 flex-none place-items-center rounded-[8px] text-[1.05rem] font-black text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,.3)]" style={{ backgroundColor: runner.color }}>{runner.lane}</span>
                                <div className="min-w-0 flex-1">
                                    <p className={`m-0 text-[.7rem] font-black uppercase tracking-[.1em] ${finished ? 'text-[var(--admin-primary)]' : 'text-[#a4392f]'}`}>{finished ? `${ordinal(runner.officialRank)} place` : outcome}</p>
                                    <p className="m-0 mt-1 truncate text-[.9rem] font-black text-[var(--admin-ink)]">{runner.horseName}</p>
                                    <p className="m-0 mt-1 truncate text-[.72rem] font-semibold text-[var(--admin-muted)]">{runner.jockeyName || 'Jockey not available'}</p>
                                </div>
                                <strong className="text-[.8rem] text-[var(--admin-primary)]">{finished || outcome === 'DSQ' ? formatTime(runner.finishTimeMs) : '—'}</strong>
                            </div>
                            {!finished ? (
                                <div className="rounded-[8px] bg-white/70 px-3 py-2 text-[.74rem] font-semibold text-[#8b302b]">
                                    <strong>{getOutcomeLabel(runner)}.</strong>{runner.note ? ` ${runner.note}` : ' No additional referee note.'}
                                </div>
                            ) : null}
                        </article>
                    );
                })}
                </div>
            )}
        </section>
    );
}

export default function RaceReplay() {
    const { raceId } = useParams();
    const navigate = useNavigate();
    const [replay, setReplay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [phase, setPhase] = useState('idle');
    const [countdown, setCountdown] = useState(3);
    const [elapsed, setElapsed] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const animationRef = useRef(null);
    const startedAtRef = useRef(0);
    const elapsedBeforePauseRef = useRef(0);
    const audioContextRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');

        spectatorApi.getRaceReplay(Number(raceId))
            .then((payload) => { if (!cancelled) setReplay(payload); })
            .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load the official replay.'); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [raceId]);

    useEffect(() => () => {
        if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
        if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    }, []);

    const preparedRunners = useMemo(() => {
        const source = Array.isArray(replay?.runners) ? replay.runners : [];
        const visualTimes = getVisualFinishTimes(source);
        return source.map((runner, index) => buildRunnerProfile(runner, index, visualTimes[index]));
    }, [replay]);

    const visualRaceMs = useMemo(() => {
        const movingTimes = preparedRunners.map((runner) => runner.visualFinishMs).filter((value) => value > 0);
        return movingTimes.length ? Math.max(...movingTimes) + 1650 : 12000;
    }, [preparedRunners]);

    const currentRunners = useMemo(() => preparedRunners.map((runner) => ({
        ...runner,
        progress: runnerProgress(elapsed, runner),
    })), [preparedRunners, elapsed]);

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

    useEffect(() => {
        if (phase !== 'countdown') return undefined;
        playTone(countdown > 0 ? 560 : 920, countdown > 0 ? 0.1 : 0.22, countdown > 0 ? 0.07 : 0.1);
        const timer = window.setTimeout(() => {
            if (countdown > 1) return setCountdown((value) => value - 1);
            if (countdown === 1) return setCountdown(0);
            elapsedBeforePauseRef.current = 0;
            startedAtRef.current = performance.now();
            setElapsed(0);
            return setPhase('running');
        }, countdown === 0 ? 520 : 650);
        return () => window.clearTimeout(timer);
    }, [phase, countdown, playTone]);

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
        return () => { if (animationRef.current) window.cancelAnimationFrame(animationRef.current); };
    }, [phase, visualRaceMs, playTone]);

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

    if (loading) return <div className="surface-card p-10 text-center font-bold text-[var(--admin-muted)]">Loading cinematic race replay...</div>;

    if (error) {
        return (
            <div className="grid gap-4">
                <button className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2 text-[.8rem] font-black text-[var(--admin-primary)]" onClick={() => navigate(-1)} type="button"><FaArrowLeft /> Back</button>
                <div className="surface-card p-10 text-center font-bold text-[#a4392f]">{error}</div>
            </div>
        );
    }

    if (!replay || preparedRunners.length === 0) return <div className="surface-card p-10 text-center font-bold text-[var(--admin-muted)]">No official runners are available.</div>;

    return (
        <div className="grid gap-5">
            <div>
                <h1 className="page-title">Race Replay</h1>
                <p className="page-subtitle">Continuous side-view race animation • {Number(replay.distanceMeters || 0).toLocaleString()}m straight course • horses run beyond the finish line • DNS, DNF, DSQ and notes are shown.</p>
            </div>

            <RaceStage
                countdown={countdown}
                elapsed={elapsed}
                onBack={() => navigate(-1)}
                onPause={pauseReplay}
                onStart={startReplay}
                onToggleSound={() => setSoundEnabled((value) => !value)}
                phase={phase}
                replay={replay}
                runners={currentRunners}
                soundEnabled={soundEnabled}
                visualRaceMs={visualRaceMs}
            />

            <OfficialResults phase={phase} runners={currentRunners} />
        </div>
    );
}
