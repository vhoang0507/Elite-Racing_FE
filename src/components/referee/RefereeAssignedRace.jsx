import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaClipboardCheck,
    FaGavel,
    FaMapMarkerAlt,
} from 'react-icons/fa';

import { refereeApi } from '../../api/refereeApi';
import RefereeLayout from './RefereeLayout';
import Toast from '../shared/Toast';
import { useToast } from '../shared/useToast';

function formatDateTime(value) {
    if (!value) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

const STATUS_STYLE = {
    Scheduled:     { bg: 'var(--admin-surface-strong)', color: 'var(--admin-primary)' },
    AssignedReferee: { bg: '#faf2e0', color: '#8a6209' },
    ClosedRegistration: { bg: '#f3e1df', color: '#a4392f' },
    RefereeReady:  { bg: '#e8f7ee', color: '#16864f' },
    Ongoing:       { bg: '#faf2e0', color: '#8a6209' },
    Finished:      { bg: 'var(--admin-surface-strong)', color: 'var(--admin-primary)' },
    Completed:     { bg: '#e8f7ee', color: '#16864f' },
    ResultPending: { bg: '#faf2e0', color: '#8a6209' },
    Cancelled:     { bg: '#f3e1df', color: '#a4392f' },
};

const STATUS_LABELS = {
    AssignedReferee: 'Assigned Referee',
    ClosedRegistration: 'Closed Registration',
    OpenRegistration: 'Open Registration',
    RefereeReady: 'Referee Ready',
    ResultPending: 'Result Pending',
};

function getDisplayStatus(race) {
    return race?.tournamentStatus === 'ClosedRegistration'
        ? race.tournamentStatus
        : race?.raceStatus;
}

function formatStatus(status) {
    return STATUS_LABELS[status] || status || 'N/A';
}

function isSeasonActive(race) {
    return !race?.seasonStatus || race.seasonStatus === 'Active';
}

function canOpenPreRace(race) {
    if (!isSeasonActive(race)) return false;

    const actions = race?.allowedActions ?? {};
    return Boolean(
        actions.canInspect ||
        actions.canSubmitPreRaceReport ||
        actions.canMarkReady ||
        race?.tournamentStatus === 'ClosedRegistration' ||
        race?.raceStatus === 'AssignedReferee'
    );
}

function canOpenPostRace(race) {
    if (!isSeasonActive(race)) return false;

    const actions = race?.allowedActions ?? {};
    return Boolean(
        actions.canStartRace ||
        actions.canFinishRace ||
        actions.canEnterResults ||
        actions.canConfirmResults ||
        actions.canSubmitPostRaceReport ||
        ['RefereeReady', 'Ongoing', 'Finished', 'ResultPending'].includes(race?.raceStatus)
    );
}

function getDisabledReason(race, fallback) {
    if (race?.blockingReason) return race.blockingReason;
    if (!isSeasonActive(race)) return `Season is ${race.seasonStatus}.`;
    return fallback;
}

function RefereeAssignedRace() {
    const navigate = useNavigate();
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredRaces = useMemo(() => {
        const q = search.trim().toLowerCase();
        return races.filter(race => {
            const displayStatus = getDisplayStatus(race) ?? '';
            const matchesSearch = !q || [race.raceName, race.tournamentName, race.location, race.seasonStatus]
                .some(v => String(v || '').toLowerCase().includes(q));
            const matchesStatus = statusFilter === 'all' ||
                displayStatus.toLowerCase() === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [races, search, statusFilter]);

    useEffect(() => {
        let ignore = false;
        async function loadRaces() {
            setLoading(true);
            try {
                const data = await refereeApi.getAssignedRacesWithLifecycle();
                if (!ignore) setRaces(data ?? []);
            } catch (err) {
                if (!ignore) showToast(err.message || 'Failed to load assigned races.', 'error');
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        loadRaces();
        return () => { ignore = true; };
    }, []);

    return (
        <RefereeLayout activeKey="assigned-races">
            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
            />
            <section className="page-shell">
                <div>
                    <h1 className="page-title">My Assigned Races</h1>
                    <p className="page-subtitle">
                        Select a race to perform pre-race inspection or manage post-race results and reports.
                    </p>
                </div>

                {!loading && races.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search race or tournament..."
                            className="h-9 flex-1 min-w-[200px] rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-3 text-[0.82rem] outline-none focus:border-[var(--admin-primary)]"
                        />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="h-9 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-3 text-[0.82rem]"
                        >
                            <option value="all">All Status</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="AssignedReferee">Assigned Referee</option>
                            <option value="ClosedRegistration">Closed Registration</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Finished">Finished</option>
                        </select>
                    </div>
                )}

                {loading ? (
                    <div className="surface-card p-8 text-center font-semibold text-[var(--admin-muted)]">
                        Loading assigned races...
                    </div>
                ) : filteredRaces.length === 0 ? (
                    <div className="surface-card p-8 text-center font-semibold text-[var(--admin-muted)]">
                        {races.length === 0 ? 'No assigned races yet.' : 'No races match your filter.'}
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {filteredRaces.map((race) => {
                            const displayStatus = getDisplayStatus(race);
                            const s = STATUS_STYLE[displayStatus] ?? { bg: 'var(--admin-surface-strong)', color: 'var(--admin-primary)' };
                            return (
                                <div
                                    key={race.raceId}
                                    className="surface-card"
                                    style={{ display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden' }}
                                >
                                    {/* Left accent bar */}
                                    <div style={{ width: 5, alignSelf: 'stretch', backgroundColor: s.color, flexShrink: 0 }} />

                                    {/* Race info */}
                                    <div style={{ flex: 1, padding: '16px 20px', minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#2b1b1b' }}>
                                                {race.raceName}
                                            </span>
                                            <span style={{
                                                backgroundColor: s.bg, color: s.color,
                                                fontSize: 11, fontWeight: 700,
                                                padding: '2px 10px', borderRadius: 20,
                                            }}>
                                                {formatStatus(displayStatus)}
                                            </span>
                                            {race.seasonStatus && (
                                                <span style={{
                                                    backgroundColor: race.seasonStatus === 'Active' ? 'var(--admin-surface-strong)' : '#f3e1df',
                                                    color: race.seasonStatus === 'Active' ? 'var(--admin-primary)' : '#a4392f',
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    padding: '2px 10px',
                                                    borderRadius: 20,
                                                }}>
                                                    Season: {race.seasonStatus}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ fontSize: 13, color: 'var(--admin-primary)', fontWeight: 600, marginTop: 2 }}>
                                            {race.tournamentName}
                                        </div>

                                        <div style={{ display: 'flex', gap: 20, marginTop: 6, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 12, color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FaMapMarkerAlt /> {race.location || 'N/A'}
                                            </span>
                                            <span style={{ fontSize: 12, color: '#999' }}>
                                                📅 {formatDateTime(race.raceDate)}
                                            </span>
                                            <span style={{ fontSize: 12, color: '#999' }}>
                                                🏃 {race.distanceMeters?.toLocaleString('en-US') ?? 0}m
                                            </span>
                                        </div>
                                        {race.blockingReason && (
                                            <div style={{ marginTop: 6, fontSize: 12, color: '#b91c1c', fontWeight: 600 }}>
                                                {race.blockingReason}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    {(() => {
                                        const canPreRace = canOpenPreRace(race);
                                        const canPostRace = canOpenPostRace(race);
                                        return (
                                            <div style={{ display: 'flex', gap: 8, padding: '0 20px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                <button
                                                    type="button"
                                                    disabled={!canPreRace}
                                                    onClick={() => navigate(`/referee/races/pre-race/${race.raceId}`, { state: { race } })}
                                                    title={canPreRace ? 'Open pre-race inspection' : getDisabledReason(race, 'Only available after registration is closed')}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                        padding: '8px 16px', borderRadius: 8,
                                                        border: '1px solid #dce5ef',
                                                        background: canPreRace ? '#fff8f6' : '#f5f5f5',
                                                        color: canPreRace ? 'var(--admin-primary)' : '#bbb',
                                                        fontWeight: 700, fontSize: 13,
                                                        cursor: canPreRace ? 'pointer' : 'not-allowed',
                                                    }}
                                                >
                                                    <FaClipboardCheck /> Pre-Race Inspect
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={!canPostRace}
                                                    onClick={() => navigate('/referee/races/post-race', { state: { raceId: race.raceId } })}
                                                    title={canPostRace ? 'Open post-race workflow' : getDisabledReason(race, 'Only available for ready / ongoing / finished races')}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                        padding: '8px 16px', borderRadius: 8,
                                                        border: 'none',
                                                        background: canPostRace ? 'var(--admin-primary)' : '#e0e0e0',
                                                        color: '#fff', fontWeight: 700, fontSize: 13,
                                                        cursor: canPostRace ? 'pointer' : 'not-allowed',
                                                    }}
                                                >
                                                    <FaGavel /> Post-Race
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </RefereeLayout>
    );
}

export default RefereeAssignedRace;
