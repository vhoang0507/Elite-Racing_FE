import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaBullhorn,
    FaCheckCircle,
    FaClipboardCheck,
    FaExclamationTriangle,
    FaFileAlt,
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

function formatTime(value) {
    if (!value) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

const statusLabels = {
    AssignedReferee: 'Assigned Referee',
    ClosedRegistration: 'Closed Registration',
    Completed: 'Completed',
    Ongoing: 'Ongoing',
    OpenRegistration: 'Open Registration',
    ResultPending: 'Result Pending',
    Scheduled: 'Scheduled',
};

function getDisplayStatus(race) {
    return race?.tournamentStatus === 'ClosedRegistration'
        ? race.tournamentStatus
        : race?.raceStatus;
}

function formatStatus(status) {
    return statusLabels[status] || status || 'N/A';
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
        ['AssignedReferee', 'Scheduled'].includes(race?.raceStatus)
    );
}

function getDisabledReason(race) {
    if (race?.blockingReason) return race.blockingReason;
    if (!isSeasonActive(race)) return `Season is ${race.seasonStatus}.`;
    return 'Inspection is not available for this race yet.';
}

function getStatusBadgeClass(status) {
    if (status === 'ClosedRegistration') {
        return 'status-badge bg-red-100 text-red-700';
    }

    if (status === 'Ongoing' || status === 'ResultPending') {
        return 'status-badge bg-blue-100 text-blue-700';
    }

    return 'status-badge bg-yellow-100 text-yellow-700';
}

function RefereeDashboard() {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        let ignore = false;

        async function loadDashboard() {
            setLoading(true);

            try {
                const [data, assignedRaces] = await Promise.all([
                    refereeApi.getRefereeDashboard(),
                    refereeApi.getAssignedRacesWithLifecycle().catch(() => []),
                ]);

                const assignedByRaceId = new Map(
                    (assignedRaces ?? []).map((race) => [Number(race.raceId), race])
                );
                const upcomingRaces = (data?.upcomingRaces ?? []).map((race) => {
                    const assignedRace = assignedByRaceId.get(Number(race.raceId));

                    return assignedRace
                        ? {
                            ...race,
                            raceStatus: assignedRace.raceStatus ?? race.raceStatus,
                            tournamentStatus: assignedRace.tournamentStatus,
                            assignmentStatus: assignedRace.assignmentStatus,
                            seasonStatus: assignedRace.seasonStatus ?? race.seasonStatus,
                            allowedActions: assignedRace.allowedActions ?? race.allowedActions,
                            blockingReason: assignedRace.blockingReason ?? race.blockingReason,
                        }
                        : race;
                });

                if (!ignore) {
                    setDashboard({
                        ...data,
                        upcomingRaces,
                    });
                }
            } catch (err) {
                if (!ignore) showToast(err.message || 'Failed to load referee dashboard.', 'error');
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        loadDashboard();

        return () => {
            ignore = true;
        };
    }, []);

    const summary = dashboard?.summary ?? {};
    const upcomingRaces = useMemo(() => dashboard?.upcomingRaces ?? [], [dashboard]);
    const recentViolations = dashboard?.recentViolations ?? [];

    const completedInspections = (summary.passedInspections ?? 0) + (summary.failedInspections ?? 0);
    const priorityRace = useMemo(
        () => upcomingRaces.find((race) => ['Ongoing', 'Completed', 'ResultPending'].includes(race.raceStatus)) ?? upcomingRaces[0],
        [upcomingRaces]
    );

    const cards = [
        {
            icon: FaClipboardCheck,
            label: 'Assigned Races',
            value: summary.assignedRaces ?? 0,
            hint: 'Active assignments',
            tone: '',
        },
        {
            icon: FaCheckCircle,
            label: 'Inspections Done',
            value: completedInspections,
            hint: `${summary.passedInspections ?? 0} passed`,
            tone: 'green',
        },
        {
            icon: FaExclamationTriangle,
            label: 'Pending Inspections',
            value: summary.pendingInspections ?? 0,
            hint: 'Requires action',
            tone: 'gold',
        },
        {
            icon: FaFileAlt,
            label: 'Reports Submitted',
            value: summary.submittedReports ?? 0,
            hint: `${summary.violationReports ?? 0} violations`,
            tone: 'blue',
        },
    ];

    return (
        <RefereeLayout
            activeKey="dashboard"
            searchPlaceholder="Search records, horses, races..."
        >
            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
            />
            <section className="page-shell">
                <div className="page-heading border-b border-[var(--admin-border)] pb-5">
                    <div>
                        <h1 className="page-title">Referee Overview</h1>
                        <p className="page-subtitle">
                            Manage your active inspections and race validations.
                        </p>
                    </div>

                    <div className="rounded-full bg-[var(--admin-surface-strong)] px-4 py-2 text-sm font-bold text-[var(--admin-primary)]">
                        {new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                        }).format(new Date())}
                    </div>
                </div>

                {loading ? (
                    <div className="surface-card p-8 text-center font-semibold text-[var(--admin-muted)]">
                        Loading referee dashboard...
                    </div>
                ) : (
                    <>
                        <div className="grid gap-5 lg:grid-cols-4 md:grid-cols-2">
                            {cards.map((card) => {
                                const Icon = card.icon;
                                const toneClass = card.tone === 'green'
                                    ? 'bg-[#e8f7ee] text-[#16864f]'
                                    : card.tone === 'gold'
                                        ? 'bg-[#faf2e0] text-[#8a6209]'
                                        : card.tone === 'blue'
                                            ? 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]'
                                            : '';

                                return (
                                    <article key={card.label} className="stat-card">
                                        <div className={`stat-icon ${toneClass}`}>
                                            <Icon aria-hidden="true" />
                                        </div>
                                        <p className="stat-label m-0">{card.label}</p>
                                        <h2 className="stat-value">{card.value}</h2>
                                        <span className="font-bold text-[var(--admin-muted)]">{card.hint}</span>
                                    </article>
                                );
                            })}
                        </div>

                        <div className="visual-banner p-7">
                            <div className="relative z-[1]">
                                <span className="rounded-[6px] bg-white/20 px-3 py-1 text-xs font-black uppercase">
                                    Priority Action
                                </span>

                                <h2 className="mt-4 text-2xl font-black">
                                    {priorityRace ? 'Review Assigned Race' : 'No Assigned Race'}
                                </h2>

                                <p className="mt-3 max-w-3xl text-white/90">
                                    {priorityRace
                                        ? `${priorityRace.raceName} at ${priorityRace.location || 'N/A'} is scheduled for ${formatDateTime(priorityRace.raceDate)}.`
                                        : 'There are no assigned races from the backend for this referee account.'}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => navigate('/referee/races/post-race', { state: { raceId: priorityRace?.raceId } })}
                                    disabled={!priorityRace}
                                    className="secondary-button mt-6 border-white bg-white text-[var(--admin-primary)]"
                                >
                                    Open Race Workflow
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
                            <div className="surface-card">
                                <div className="section-bar">
                                    <h2 className="m-0 text-[1.05rem] font-bold">
                                        Assigned Races
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={() => navigate('/referee/races')}
                                        className="action-pill"
                                    >
                                        View Schedule
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="data-table min-w-[760px]">
                                        <thead>
                                            <tr>
                                                <th>Time</th>
                                                <th>Race</th>
                                                <th>Location</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {upcomingRaces.length === 0 ? (
                                                <tr>
                                                    <td className="text-center text-[var(--admin-muted)]" colSpan="5">
                                                        No assigned races.
                                                    </td>
                                                </tr>
                                            ) : (
                                                upcomingRaces.map((item) => {
                                                    const canInspect = canOpenPreRace(item);

                                                    return (
                                                    <tr key={item.assignmentId}>
                                                        <td>
                                                            {formatTime(item.raceDate)}
                                                        </td>

                                                        <td>
                                                            <div className="font-bold">
                                                                {item.raceName}
                                                            </div>

                                                            <div className="text-sm text-[var(--admin-muted)]">
                                                                {item.tournamentName}
                                                            </div>
                                                            {item.seasonStatus && (
                                                                <div className={`mt-1 text-xs font-bold ${item.seasonStatus === 'Active' ? 'text-[var(--admin-primary)]' : 'text-red-700'}`}>
                                                                    Season: {item.seasonStatus}
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td>
                                                            {item.location || 'N/A'}
                                                        </td>

                                                        <td>
                                                            <span className={getStatusBadgeClass(getDisplayStatus(item))}>
                                                                {formatStatus(getDisplayStatus(item))}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/referee/races/pre-race/${item.raceId}`, { state: { race: item } })}
                                                                disabled={!canInspect}
                                                                title={canInspect ? 'Open inspection registry' : getDisabledReason(item)}
                                                                className="font-bold text-[var(--admin-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                Inspect
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="surface-card">
                                <div className="section-bar justify-start">
                                    <h2 className="m-0 flex items-center gap-2 text-[1.05rem] font-bold">
                                        <FaBullhorn />
                                        Recent Violations
                                    </h2>
                                </div>

                                {recentViolations.length === 0 ? (
                                    <div className="p-5 text-sm text-[var(--admin-muted)]">
                                        No violation reports from this referee yet.
                                    </div>
                                ) : (
                                    recentViolations.map((item) => (
                                        <div key={item.violationId} className="border-b border-[var(--admin-border)] p-5 last:border-b-0">
                                            <div className="flex gap-3">
                                                <FaExclamationTriangle className="mt-1 text-red-500" />

                                                <div>
                                                    <h3 className="m-0 font-bold">
                                                        {item.violationType}
                                                    </h3>

                                                    <p className="mt-2 text-sm text-[var(--admin-muted)]">
                                                        {item.horseName} in {item.raceName}. Action: {item.action}.
                                                    </p>

                                                    <span className="mt-3 block text-xs text-[#9c8783]">
                                                        {formatDateTime(item.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                <button
                                    type="button"
                                    onClick={() => navigate('/referee/races/post-race')}
                                    className="w-full border-t border-[var(--admin-border)] p-4 font-bold text-[var(--admin-primary)]"
                                >
                                    Open Violation Log
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </RefereeLayout>
    );
}

export default RefereeDashboard;
