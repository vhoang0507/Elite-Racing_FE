import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaArrowLeft,
    FaExclamationTriangle,
    FaFlagCheckered,
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
const AFTER_FINISH_PROGRESS = 1.15;
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

function HorseSprite({ runner, running }) {
    const horseTone = runner.bodyTone > 0.72
        ? '#282727'
        : runner.bodyTone > 0.46
            ? '#5b321f'
            : runner.bodyTone > 0.22
                ? '#89502b'
                : '#b76a36';
    const horseLight = runner.bodyTone > 0.72 ? '#474545' : '#c1804b';
    const horseDark = runner.bodyTone > 0.72 ? '#0f1011' : '#291813';
    const hasBlaze = runner.markingType === 1 || runner.markingType === 3;
    const hasSock = runner.markingType === 2 || runner.markingType === 3;

    return (
        <div
            className={`real-horse-sprite ${running ? 'is-running' : ''}`}
            style={{
                '--runner-color': runner.color,
                '--jockey-color': runner.jockeyColor,
                '--horse-tone': horseTone,
                '--horse-light': horseLight,
                '--horse-dark': horseDark,
            }}
        >
            <svg aria-hidden="true" viewBox="0 0 240 132">
                <defs>
                    <linearGradient id={`body-${runner.seed}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="var(--horse-light)" />
                        <stop offset="0.38" stopColor="var(--horse-tone)" />
                        <stop offset="1" stopColor="var(--horse-dark)" />
                    </linearGradient>
                    <linearGradient id={`saddle-${runner.seed}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="var(--runner-color)" />
                        <stop offset="1" stopColor="#111827" />
                    </linearGradient>
                </defs>

                <ellipse className="horse-shadow" cx="119" cy="119" rx="87" ry="8" fill="rgba(29,17,10,0.32)" />

                <g className="horse-tail">
                    <path d="M58 62 C34 50, 18 57, 5 78 C22 69, 32 79, 49 77 C34 84, 24 95, 16 105 C38 94, 54 85, 67 70" fill="var(--horse-dark)" />
                    <path d="M56 64 C36 61, 24 69, 12 88" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" strokeLinecap="round" />
                </g>

                <g className="horse-core">
                    <path d="M58 55 C77 34, 122 32, 153 51 C167 59, 169 79, 153 91 C127 105, 83 101, 60 84 C50 77, 49 65, 58 55 Z" fill={`url(#body-${runner.seed})`} stroke="var(--horse-dark)" strokeWidth="2.5" />
                    <path d="M148 57 C158 41, 167 29, 182 22 C193 17, 207 20, 216 31 C207 36, 202 45, 200 57 C194 72, 177 78, 160 73 Z" fill={`url(#body-${runner.seed})`} stroke="var(--horse-dark)" strokeWidth="2.5" />
                    <path d="M183 25 C191 11, 205 8, 220 17 C231 24, 236 36, 230 47 C224 58, 206 61, 195 54 C184 47, 179 37, 183 25 Z" fill={`url(#body-${runner.seed})`} stroke="var(--horse-dark)" strokeWidth="2.5" />
                    <path d="M198 17 L198 3 L207 16 Z" fill="var(--horse-dark)" />
                    <path d="M214 18 L222 7 L221 23 Z" fill="var(--horse-dark)" />
                    <path d="M181 27 C190 14, 204 12, 219 20" fill="none" stroke="var(--horse-dark)" strokeWidth="7" strokeLinecap="round" />
                    <path d="M165 48 C155 31, 145 22, 131 18" fill="none" stroke="var(--horse-dark)" strokeWidth="8" strokeLinecap="round" />
                    <circle cx="220" cy="31" r="3.2" fill="#f8fafc" />
                    <circle cx="220" cy="31" r="1.7" fill="#111827" />
                    <path d="M227 44 C236 44, 239 48, 233 52" fill="none" stroke="var(--horse-dark)" strokeWidth="2.5" strokeLinecap="round" />
                    {hasBlaze ? <path d="M207 18 C211 26, 212 37, 207 49" fill="none" stroke="#f8f3e8" strokeWidth="5" strokeLinecap="round" /> : null}
                </g>

                <g className="saddle-cloth">
                    <path d="M85 42 C105 36, 132 38, 151 48 L145 76 L91 77 L78 55 Z" fill={`url(#saddle-${runner.seed})`} stroke="#101820" strokeWidth="2.5" />
                    <path d="M91 74 L143 74 L138 102 L94 101 Z" fill="var(--runner-color)" stroke="#101820" strokeWidth="2.5" />
                    <text x="116" y="94" textAnchor="middle" fontSize="21" fontWeight="950" fill="#ffffff" stroke="#111827" strokeWidth="0.8">
                        {runner.lane}
                    </text>
                </g>

                <g className="leg rear-leg-a">
                    <path d="M76 84 C70 96, 57 108, 41 119" fill="none" stroke="var(--horse-tone)" strokeWidth="10" strokeLinecap="round" />
                    <path d="M42 119 L27 121" fill="none" stroke={hasSock ? '#f1eee7' : 'var(--horse-dark)'} strokeWidth="6" strokeLinecap="round" />
                </g>
                <g className="leg rear-leg-b">
                    <path d="M91 88 C91 102, 83 114, 72 124" fill="none" stroke="var(--horse-tone)" strokeWidth="10" strokeLinecap="round" />
                    <path d="M72 124 L58 125" fill="none" stroke="var(--horse-dark)" strokeWidth="6" strokeLinecap="round" />
                </g>
                <g className="leg front-leg-a">
                    <path d="M148 84 C159 98, 174 111, 190 118" fill="none" stroke="var(--horse-tone)" strokeWidth="10" strokeLinecap="round" />
                    <path d="M189 118 L205 119" fill="none" stroke={hasSock ? '#f1eee7' : 'var(--horse-dark)'} strokeWidth="6" strokeLinecap="round" />
                </g>
                <g className="leg front-leg-b">
                    <path d="M135 87 C140 103, 148 116, 161 126" fill="none" stroke="var(--horse-tone)" strokeWidth="10" strokeLinecap="round" />
                    <path d="M160 126 L176 126" fill="none" stroke="var(--horse-dark)" strokeWidth="6" strokeLinecap="round" />
                </g>

                <g className="jockey-body">
                    <path d="M111 21 L140 37 L127 61 L96 48 Z" fill="var(--jockey-color)" stroke="#111827" strokeWidth="2.3" />
                    <path d="M107 27 L86 50" fill="none" stroke="#d7a987" strokeWidth="7" strokeLinecap="round" />
                    <path d="M130 45 L161 51" fill="none" stroke="#d7a987" strokeWidth="6" strokeLinecap="round" />
                    <path d="M124 59 L139 82" fill="none" stroke="#f8fafc" strokeWidth="9" strokeLinecap="round" />
                    <path d="M108 57 L96 81" fill="none" stroke="#f8fafc" strokeWidth="9" strokeLinecap="round" />
                    <path d="M137 80 L151 90" fill="none" stroke="#16191d" strokeWidth="7" strokeLinecap="round" />
                    <path d="M96 80 L84 91" fill="none" stroke="#16191d" strokeWidth="7" strokeLinecap="round" />
                    <circle cx="107" cy="15" r="11" fill="#d7a987" stroke="#111827" strokeWidth="2.3" />
                    <path d="M95 13 C98 -1, 116 -3, 124 11 L123 16 L96 17 Z" fill="var(--jockey-color)" stroke="#111827" strokeWidth="2.3" />
                    <path d="M121 10 L135 15 L123 18" fill="var(--jockey-color)" stroke="#111827" strokeWidth="1.8" />
                    <path d="M146 41 C158 31, 171 29, 181 31" fill="none" stroke="#34231c" strokeWidth="2.5" strokeLinecap="round" />
                </g>
            </svg>
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

    return (
        <div className="race-game-shell">
            <style>{`
                .race-game-shell { overflow: hidden; border: 4px solid #25384c; border-radius: 14px; background: #12263d; box-shadow: 0 22px 55px rgba(15,23,42,.28), inset 0 0 0 2px rgba(255,255,255,.08); }
                .race-stage { position: relative; height: clamp(520px,62vw,690px); min-height: 520px; overflow: hidden; background: linear-gradient(#1c76d9 0 16%,#dceeff 16% 30%,#b89e72 30% 50%,#bd6f42 50% 84%,#76954e 84% 100%); }
                .race-sky { position:absolute; inset:0 0 70% 0; background:linear-gradient(180deg,#0861c7,#4ca1f1 72%,#e7f5ff); }
                .race-grandstand { position:absolute; top:14%; left:-18%; width:150%; height:33%; transform:translate3d(calc(var(--bg-shift) * -0.035px),0,0); background:linear-gradient(180deg,rgba(248,250,252,.98) 0 9%,transparent 9% 14%,rgba(239,244,248,.98) 14% 20%,transparent 20% 25%,rgba(228,235,241,.97) 25% 31%,transparent 31%),radial-gradient(circle at 5px 5px,#6f5b48 0 2px,transparent 2.5px),radial-gradient(circle at 16px 8px,#29313c 0 2px,transparent 2.5px),radial-gradient(circle at 28px 5px,#c7583c 0 2px,transparent 2.5px),radial-gradient(circle at 38px 9px,#d9c36a 0 2px,transparent 2.5px),linear-gradient(#edf0f2,#c8d0d6); background-size:auto,44px 16px,44px 16px,44px 16px,44px 16px,auto; border-top:12px solid #f8fafc; border-bottom:10px solid #f8fafc; box-shadow:inset 0 -24px 0 rgba(50,57,63,.14); will-change:transform; }
                .race-grandstand::before,.race-grandstand::after { content:''; position:absolute; left:0; right:0; height:6px; background:#fff; box-shadow:0 3px 0 #9da7af; }
                .race-grandstand::before { top:30%; } .race-grandstand::after { top:63%; }
                .race-far-rail { position:absolute; left:-15%; width:145%; top:43%; height:44px; transform:translate3d(calc(var(--bg-shift) * -0.065px),0,0); background:linear-gradient(180deg,transparent 0 6px,#fbfcfc 6px 12px,transparent 12px 25px,#fbfcfc 25px 31px,transparent 31px),repeating-linear-gradient(90deg,transparent 0 83px,#f5f7f6 83px 91px,transparent 91px 168px); filter:drop-shadow(0 3px 1px rgba(0,0,0,.18)); will-change:transform; }
                .race-dirt { position:absolute; top:49%; left:0; right:0; bottom:17%; background:repeating-linear-gradient(90deg,rgba(92,48,26,.08) 0 3px,transparent 3px 20px),linear-gradient(180deg,#ca7a49,#b9653b); box-shadow:inset 0 13px 22px rgba(78,39,20,.13),inset 0 -12px 16px rgba(255,255,255,.08); }
                .race-dirt::after { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at center,transparent 0 44%,rgba(87,40,20,.12) 45% 48%,transparent 49%); background-size:120px 48px; background-position-x:calc(var(--bg-shift) * -0.42px); opacity:.32; }
                .race-foreground { position:absolute; left:-12%; right:-12%; bottom:0; height:22%; transform:translate3d(calc(var(--bg-shift) * -0.085px),0,0); background:linear-gradient(180deg,#e8eee0 0 12%,transparent 12% 25%,#dce6d3 25% 35%,transparent 35%),repeating-linear-gradient(90deg,transparent 0 110px,#f4f7f0 110px 124px,transparent 124px 220px),linear-gradient(#91a96d,#6f914a); border-top:6px solid #f2f5ee; box-shadow:0 -5px 10px rgba(0,0,0,.12); will-change:transform; }
                .race-start-post,.race-finish-post { position:absolute; top:43%; bottom:17%; width:18px; transform:translateX(-50%); background:repeating-conic-gradient(#101820 0 25%,#fff 0 50%) 50%/12px 12px; border:2px solid rgba(255,255,255,.9); box-shadow:0 0 0 2px rgba(0,0,0,.17),0 0 18px rgba(255,255,255,.38); z-index:24; }
                .race-start-post { left:5.5%; opacity:.72; } .race-finish-post { left:82%; }
                .race-start-post::before,.race-finish-post::before { position:absolute; top:-30px; left:50%; transform:translateX(-50%); border-radius:5px; background:#17365f; color:#fff; padding:5px 9px; font-size:10px; font-weight:900; letter-spacing:.12em; }
                .race-start-post::before { content:'START'; } .race-finish-post::before { content:'FINISH'; }
                .race-horse-wrap { position:absolute; width:clamp(176px,18vw,242px); aspect-ratio:240/132; translate:-50% -50%; will-change:left,top; filter:drop-shadow(0 7px 4px rgba(44,22,12,.25)); }
                .real-horse-sprite,.real-horse-sprite svg { display:block; width:100%; height:100%; overflow:visible; }
                .real-horse-sprite.is-running .horse-core,.real-horse-sprite.is-running .saddle-cloth,.real-horse-sprite.is-running .jockey-body { animation:body-gallop 310ms cubic-bezier(.45,.05,.55,.95) infinite; transform-origin:120px 70px; }
                .real-horse-sprite.is-running .horse-tail { animation:tail-gallop 260ms ease-in-out infinite alternate; transform-origin:62px 66px; }
                .real-horse-sprite.is-running .rear-leg-a,.real-horse-sprite.is-running .front-leg-b { animation:leg-forward 310ms cubic-bezier(.4,0,.6,1) infinite; transform-origin:118px 84px; }
                .real-horse-sprite.is-running .rear-leg-b,.real-horse-sprite.is-running .front-leg-a { animation:leg-back 310ms cubic-bezier(.4,0,.6,1) infinite; transform-origin:118px 84px; }
                .real-horse-sprite.is-running .horse-shadow { animation:shadow-gallop 310ms ease-in-out infinite; transform-origin:center; }
                @keyframes body-gallop { 0%,100%{transform:translateY(1px) rotate(-1deg)} 45%{transform:translateY(-5px) rotate(.8deg)} 72%{transform:translateY(-2px) rotate(0)} }
                @keyframes tail-gallop { from{transform:rotate(-8deg) scaleX(.96)} to{transform:rotate(10deg) scaleX(1.06)} }
                @keyframes leg-forward { 0%,100%{transform:rotate(25deg) translateX(1px)} 48%{transform:rotate(-28deg) translateX(4px)} 75%{transform:rotate(-8deg) translateY(-3px)} }
                @keyframes leg-back { 0%,100%{transform:rotate(-27deg) translateX(-1px)} 48%{transform:rotate(27deg) translateX(-4px)} 75%{transform:rotate(7deg) translateY(-2px)} }
                @keyframes shadow-gallop { 0%,100%{transform:scaleX(.84);opacity:.58} 50%{transform:scaleX(1.08);opacity:.36} }
                .race-dust { position:absolute; left:4%; bottom:6%; width:94px; height:32px; opacity:0; pointer-events:none; }
                .race-dust::before,.race-dust::after { content:''; position:absolute; border-radius:50%; background:rgba(224,173,117,.62); filter:blur(3px); }
                .race-dust::before { width:64px; height:21px; left:0; bottom:0; } .race-dust::after { width:38px; height:17px; left:31px; bottom:8px; }
                .race-horse-wrap.is-running .race-dust { opacity:1; animation:dust-puff 500ms ease-out infinite; }
                @keyframes dust-puff { 0%{transform:translateX(23px) scale(.55);opacity:.18} 55%{opacity:.65} 100%{transform:translateX(-42px) scale(1.3);opacity:0} }
                .runner-name { position:absolute; left:50%; top:-8px; transform:translateX(-50%); white-space:nowrap; border:1px solid rgba(255,255,255,.72); border-radius:999px; background:rgba(9,24,41,.9); padding:4px 10px; color:#fff; font-size:.62rem; font-weight:900; text-transform:uppercase; letter-spacing:.08em; box-shadow:0 5px 12px rgba(0,0,0,.22); }
                .runner-issue { position:absolute; left:50%; top:-39px; transform:translateX(-50%); display:flex; align-items:center; gap:5px; border:2px solid #fff; border-radius:999px; padding:4px 9px; color:#fff; font-size:.65rem; font-weight:950; box-shadow:0 5px 14px rgba(0,0,0,.28); z-index:5; }
                .issue-dnf,.issue-dsq { background:#a91f27; } .issue-dns,.issue-withdrawn { background:#6b7280; }
                .race-countdown { position:absolute; inset:0; z-index:60; display:grid; place-items:center; background:rgba(9,24,41,.23); backdrop-filter:blur(1px); }
                .race-countdown strong { display:grid; width:126px; height:126px; place-items:center; border-radius:50%; border:7px solid rgba(255,255,255,.92); background:linear-gradient(145deg,#d91f26,#8e0f16); color:#fff; font-size:4rem; text-shadow:0 4px 0 rgba(0,0,0,.2); box-shadow:0 16px 40px rgba(0,0,0,.34); animation:countdown-pop 620ms ease both; }
                @keyframes countdown-pop { 0%{transform:scale(.45);opacity:0} 45%{transform:scale(1.12);opacity:1} 100%{transform:scale(1);opacity:1} }
                .race-winner-burst { position:absolute; left:50%; top:24%; z-index:62; transform:translate(-50%,-50%); border:4px solid #f5c542; border-radius:18px; background:linear-gradient(135deg,rgba(8,31,57,.97),rgba(23,54,95,.97)); color:#fff; padding:16px 24px; text-align:center; box-shadow:0 18px 44px rgba(0,0,0,.34),0 0 0 7px rgba(245,197,66,.14); animation:winner-pop 700ms cubic-bezier(.2,.9,.2,1.25) both; }
                @keyframes winner-pop { from{transform:translate(-50%,-50%) scale(.5);opacity:0} to{transform:translate(-50%,-50%) scale(1);opacity:1} }
                .race-rank-strip { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:12px; align-items:stretch; border-top:4px solid #2f5c8c; background:linear-gradient(180deg,#0a3c72,#08284d); padding:14px 16px; }
                .race-rank-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(92px,1fr)); gap:9px; }
                .race-rank-card { min-width:0; text-align:center; }
                .race-rank-title { color:#f7d45c; font-size:.95rem; font-weight:950; text-shadow:0 2px 0 rgba(0,0,0,.3); }
                .race-rank-number { display:grid; width:54px; height:48px; margin:5px auto; place-items:center; border:3px solid rgba(255,255,255,.7); border-radius:5px; color:#fff; font-size:1.75rem; font-weight:950; text-shadow:0 2px 0 rgba(0,0,0,.45); box-shadow:0 5px 0 rgba(0,0,0,.25); }
                .race-rank-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:rgba(255,255,255,.88); font-size:.68rem; font-weight:850; text-transform:uppercase; }
                .race-winner-seal { display:grid; width:92px; place-items:center; align-content:center; color:#f6cf50; text-align:center; }
                .race-winner-seal svg { font-size:2.8rem; filter:drop-shadow(0 4px 0 rgba(0,0,0,.35)); }
                @media(max-width:800px){ .race-stage{height:540px}.race-rank-strip{grid-template-columns:minmax(0,1fr)}.race-winner-seal{display:none}.race-horse-wrap{width:175px} }
            `}</style>

            <div className="race-stage" style={{ '--bg-shift': backgroundShift }}>
                <div className="race-sky" />
                <div className="race-grandstand" />
                <div className="race-far-rail" />
                <div className="race-dirt" />
                <div className="race-foreground" />
                <div className="race-start-post" />
                <div className="race-finish-post" />

                <div className="absolute left-4 top-4 z-40 flex flex-wrap items-center gap-2">
                    <button aria-label="Back" className="grid h-11 w-11 place-items-center rounded-[8px] border-2 border-[#9cc0e8] bg-[linear-gradient(180deg,#244f7e,#102c4c)] text-white shadow-[0_4px_0_rgba(0,0,0,.28)]" onClick={onBack} type="button">
                        <FaArrowLeft />
                    </button>
                    <div className="rounded-[8px] border-2 border-[#9cc0e8] bg-[linear-gradient(180deg,#244f7e,#102c4c)] px-4 py-2 text-white shadow-[0_4px_0_rgba(0,0,0,.28)]">
                        <p className="m-0 text-[.68rem] font-black uppercase tracking-[.12em] text-white/70">Official race replay</p>
                        <p className="m-0 mt-1 text-[.88rem] font-black">{replay.raceName}</p>
                    </div>
                </div>

                <div className="absolute right-4 top-4 z-40 flex items-center gap-2">
                    <button aria-label={soundEnabled ? 'Mute replay sound' : 'Enable replay sound'} className="grid h-12 w-12 place-items-center rounded-[8px] border-2 border-[#9cc0e8] bg-[linear-gradient(180deg,#244f7e,#102c4c)] text-xl text-white shadow-[0_4px_0_rgba(0,0,0,.28)]" onClick={onToggleSound} type="button">
                        {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                    </button>
                </div>

                <div className="absolute left-1/2 top-4 z-40 w-[min(520px,44vw)] -translate-x-1/2 rounded-[10px] border-2 border-[#9cc0e8] bg-[rgba(8,40,74,.93)] px-4 py-3 text-white shadow-[0_5px_0_rgba(0,0,0,.25)] max-[760px]:top-[76px] max-[760px]:w-[88%]">
                    <div className="flex items-center justify-between gap-3 text-[.75rem] font-black uppercase tracking-[.08em]">
                        <span>{distanceCovered.toLocaleString()}m</span>
                        <span>{replay.tournamentName}</span>
                        <span>{distanceMeters.toLocaleString()}m</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full border border-white/30 bg-[#031b33]">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#f6c543,#ffef8a)]" style={{ width: `${clamp(leaderProgress, 0, 1) * 100}%` }} />
                    </div>
                </div>

                {runners.map((runner, index) => {
                    const liveRank = liveRanks.get(runner.registrationId) || null;
                    const laneDepth = ((runner.lane - 1) % 6) * 2.15;
                    const y = 59.5 + laneDepth;
                    const x = getHorseX(runner);
                    const moving = runnerIsMoving(elapsed, runner, phase);

                    return (
                        <div
                            className={`race-horse-wrap ${moving ? 'is-running' : ''}`}
                            key={runner.registrationId || runner.resultId || runner.horseName}
                            style={{ left: `${x}%`, top: `${y}%`, zIndex: 30 + runner.lane + index }}
                        >
                            <div className="race-dust" />
                            <HorseSprite runner={runner} running={moving} />
                            <div className="runner-name">
                                {runner.horseName}{liveRank ? ` • ${ordinal(liveRank)}` : ''}
                            </div>
                            <OutcomeBadge runner={runner} />
                        </div>
                    );
                })}

                <div className="absolute bottom-[18%] left-4 z-40 flex items-center gap-2 rounded-[8px] border-2 border-[#9cc0e8] bg-[rgba(8,40,74,.93)] px-3 py-2 text-white shadow-[0_4px_0_rgba(0,0,0,.25)]">
                    <FaStopwatch />
                    <strong>{formatTime(Math.min(elapsed, visualRaceMs))}</strong>
                </div>

                <div className="absolute bottom-[18%] right-4 z-40 flex gap-2">
                    {phase === 'running' ? (
                        <button className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border-2 border-[#9cc0e8] bg-[linear-gradient(180deg,#244f7e,#102c4c)] px-4 text-[.78rem] font-black uppercase tracking-[.08em] text-white shadow-[0_4px_0_rgba(0,0,0,.28)]" onClick={onPause} type="button">
                            <FaPause /> Pause
                        </button>
                    ) : (
                        <button className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border-2 border-[#ffe58a] bg-[linear-gradient(180deg,#d63c2f,#9e1816)] px-4 text-[.78rem] font-black uppercase tracking-[.08em] text-white shadow-[0_4px_0_rgba(0,0,0,.28)]" onClick={onStart} type="button">
                            {phase === 'done' ? <FaRedo /> : <FaPlay />}
                            {phase === 'done' ? 'Replay again' : phase === 'paused' ? 'Resume race' : 'Start replay'}
                        </button>
                    )}
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

            <div className="race-rank-strip">
                <div className="race-rank-list">
                    {[...runners]
                        .sort((a, b) => {
                            const aFinished = isNormalFinisher(a);
                            const bFinished = isNormalFinisher(b);
                            if (aFinished !== bFinished) return aFinished ? -1 : 1;
                            if (aFinished && bFinished) return (a.officialRank || 999) - (b.officialRank || 999);
                            return a.lane - b.lane;
                        })
                        .map((runner) => (
                            <div className="race-rank-card" key={`rank-${runner.registrationId || runner.resultId}`}>
                                <div className="race-rank-title">{isNormalFinisher(runner) ? ordinal(runner.officialRank) : normalizeOutcome(runner.outcomeStatus)}</div>
                                <div className="race-rank-number" style={{ backgroundColor: runner.color }}>{runner.lane}</div>
                                <div className="race-rank-name">{runner.horseName}</div>
                            </div>
                        ))}
                </div>
                <div className="race-winner-seal"><FaFlagCheckered /><strong className="mt-1 text-[.72rem] uppercase tracking-[.12em]">Finish</strong></div>
            </div>
        </div>
    );
}

function OfficialResults({ runners }) {
    const ordered = [...runners].sort((a, b) => {
        const aFinished = isNormalFinisher(a);
        const bFinished = isNormalFinisher(b);
        if (aFinished !== bFinished) return aFinished ? -1 : 1;
        if (aFinished && bFinished) return (a.officialRank || 999) - (b.officialRank || 999);
        return a.lane - b.lane;
    });

    return (
        <section className="surface-card overflow-hidden">
            <div className="section-bar">
                <div>
                    <h2 className="m-0 text-[1.05rem] font-black">Official Finish Order</h2>
                    <p className="m-0 mt-1 text-[.76rem] font-semibold text-[var(--admin-muted)]">Official positions, outcome status, finish time, and referee note from the database.</p>
                </div>
            </div>
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

            <OfficialResults runners={preparedRunners} />
        </div>
    );
}
