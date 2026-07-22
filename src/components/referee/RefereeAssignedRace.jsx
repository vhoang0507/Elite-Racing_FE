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

function isRaceConcluded(race) {
    return race?.raceStatus === 'Published' || race?.tournamentStatus === 'Completed';
}

function getDisplayStatus(race) {
    // A race that is already published (or whose tournament is fully completed) is
    // always shown/filtered as concluded, even if the tournament itself is still
    // sitting in "ClosedRegistration" (e.g. other races in the same tournament are
    // still running). Otherwise a finished race could get masked as "Closed
    // Registration" and stay stuck in the active/unfinished list forever.
    if (isRaceConcluded(race)) {
        return race?.raceStatus ?? race?.tournamentStatus;
    }
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
    if (isRaceConcluded(race)) return false;

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
    if (isRaceConcluded(race)) return false;

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
    const [showCompleted, setShowCompleted] = useState(false);

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

    const activeRaces = filteredRaces.filter((race) => !['Completed', 'Published'].includes(getDisplayStatus(race)));
    const completedRaces = filteredRaces.filter((race) => ['Completed', 'Published'].includes(getDisplayStatus(race)));

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
                        Focus on unfinished assignments first. Completed races can be collapsed below when you need to review them again.
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
                    <div className="grid gap-5">
                        <div className="grid gap-3">
                            {activeRaces.length === 0 ? (
                                <div className="surface-card p-6 text-center text-[0.9rem] font-semibold text-[var(--admin-muted)]">
                                    No unfinished races match your current filter.
                                </div>
                            ) : activeRaces.map((race) => {
                                const displayStatus = getDisplayStatus(race);
                                const s = STATUS_STYLE[displayStatus] ?? { bg: 'var(--admin-surface-strong)', color: 'var(--admin-primary)' };
                                const canPreRace = canOpenPreRace(race);
                                const canPostRace = canOpenPostRace(race);
                                return (
                                    <div key={race.raceId} className="surface-card overflow-hidden border-[1.5px] border-[var(--admin-border)]">
                                        <div style={{ width: '100%', height: 4, backgroundColor: s.color }} />
                                        <div style={{ padding: '18px 20px', display: 'grid', gap: 14 }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#2b1b1b' }}>{race.raceName}</h3>
                                                        <span style={{ backgroundColor: s.bg, color: s.color, fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 999 }}>
                                                            {formatStatus(displayStatus)}
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: '4px 0 0', fontSize: '0.84rem', fontWeight: 700, color: 'var(--admin-primary)' }}>{race.tournamentName}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                    <button
                                                        type="button"
                                                        disabled={!canPreRace}
                                                        onClick={() => navigate(`/referee/races/pre-race/${race.raceId}`, { state: { race } })}
                                                        title={canPreRace ? 'Open pre-race inspection' : getDisabledReason(race, 'Only available after registration is closed')}
                                                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 15px', borderRadius: 10, border: '1px solid #dce5ef', background: canPreRace ? '#fff8f6' : '#f5f5f5', color: canPreRace ? 'var(--admin-primary)' : '#bbb', fontWeight: 700, fontSize: 13, cursor: canPreRace ? 'pointer' : 'not-allowed' }}
                                                    >
                                                        <FaClipboardCheck /> Pre-Race
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={!canPostRace}
                                                        onClick={() => navigate('/referee/races/post-race', { state: { raceId: race.raceId } })}
                                                        title={canPostRace ? 'Open post-race workflow' : getDisabledReason(race, 'Only available for ready / ongoing / finished races')}
                                                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 15px', borderRadius: 10, border: 'none', background: canPostRace ? 'var(--admin-primary)' : '#e0e0e0', color: '#fff', fontWeight: 700, fontSize: 13, cursor: canPostRace ? 'pointer' : 'not-allowed' }}
                                                    >
                                                        <FaGavel /> Post-Race
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, fontSize: 12, color: '#6b7280', fontWeight: 700 }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FaMapMarkerAlt /> {race.location || 'N/A'}</span>
                                                <span>📅 {formatDateTime(race.raceDate)}</span>
                                                <span>🏁 {(race.distanceMeters ?? 0).toLocaleString('en-US')}m</span>
                                                {race.seasonStatus && race.seasonStatus !== 'Active' ? <span>Season: {race.seasonStatus}</span> : null}
                                            </div>
                                            {race.blockingReason && !canPreRace && !canPostRace ? (
                                                <div style={{ fontSize: 12, color: '#b91c1c', fontWeight: 700 }}>{race.blockingReason}</div>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {completedRaces.length > 0 && (
                            <div className="surface-card overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setShowCompleted((current) => !current)}
                                    style={{ width: '100%', padding: '16px 20px', border: 'none', background: '#fffaf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 800, color: '#2b1b1b' }}
                                >
                                    <span>Completed races ({completedRaces.length})</span>
                                    <span style={{ color: 'var(--admin-primary)' }}>{showCompleted ? 'Hide' : 'Show'}</span>
                                </button>
                                {showCompleted ? (
                                    <div style={{ padding: '0 16px 16px', display: 'grid', gap: 10 }}>
                                        {completedRaces.map((race) => {
                                            const displayStatus = getDisplayStatus(race);
                                            const s = STATUS_STYLE[displayStatus] ?? { bg: 'var(--admin-surface-strong)', color: 'var(--admin-primary)' };
                                            return (
                                                <div key={race.raceId} style={{ border: '1px solid var(--admin-border)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                                            <strong style={{ color: '#2b1b1b' }}>{race.raceName}</strong>
                                                            <span style={{ backgroundColor: s.bg, color: s.color, fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 999 }}>{formatStatus(displayStatus)}</span>
                                                        </div>
                                                        <p style={{ margin: '5px 0 0', fontSize: 12, color: '#6b7280', fontWeight: 700 }}>{race.tournamentName} • {formatDateTime(race.raceDate)} • {(race.distanceMeters ?? 0).toLocaleString('en-US')}m</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate('/referee/races/post-race', { state: { raceId: race.raceId } })}
                                                        style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #dce5ef', background: '#fff', color: 'var(--admin-primary)', fontWeight: 700, cursor: 'pointer' }}
                                                    >
                                                        View details
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </RefereeLayout>
    );
}

export default RefereeAssignedRace;
