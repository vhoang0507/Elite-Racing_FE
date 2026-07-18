import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    FaArrowLeft,
    FaCheckCircle,
    FaChevronDown,
    FaMapMarkerAlt,
    FaTimesCircle,
} from 'react-icons/fa';

import {
    INSPECTION_STATUSES,
    refereeApi,
} from '../../api/refereeApi';
import { resolveFileUrl } from '../../api/uploadApi';
import ImageLightbox from '../shared/ImageLightbox';
import RefereeLayout from './RefereeLayout';
import Toast from '../shared/Toast';
import { useToast } from '../shared/useToast';

const filterOptions = [
    { key: 'ALL', apiValue: 'all', label: 'ALL' },
    { key: 'FLAGGED', apiValue: 'flagged', label: 'FLAGGED' },
    { key: 'PENDING', apiValue: 'pending', label: 'PENDING' },
];

const statusOptions = [
    { value: INSPECTION_STATUSES.passed, label: 'Passed' },
    { value: INSPECTION_STATUSES.failed, label: 'Failed' },
    { value: INSPECTION_STATUSES.pending, label: 'Pending' },
];

function formatDateTime(value) {
    if (!value) return 'N/A';

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function statusFromOutcome(outcome) {
    if (outcome === 'ALLOWED') return INSPECTION_STATUSES.passed;
    if (outcome === 'PROHIBITED') return INSPECTION_STATUSES.failed;
    return INSPECTION_STATUSES.pending;
}

function isSeasonActive(race) {
    return !race?.seasonStatus || race.seasonStatus === 'Active';
}

function canMarkRaceReady(race) {
    if (!isSeasonActive(race)) return false;
    return Boolean(race?.allowedActions?.canMarkReady || race?.raceStatus === 'AssignedReferee');
}

function getMarkReadyDisabledReason(race) {
    if (race?.blockingReason) return race.blockingReason;
    if (!isSeasonActive(race)) return `Season is ${race.seasonStatus}.`;
    return 'Race is not ready for this action.';
}

function HealthCertificateCell({ url }) {
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const resolvedUrl = resolveFileUrl(url);

    if (!url) {
        return (
            <span className="inline-flex rounded-full border border-[#e9d8a6] bg-[#faf2e0] px-2.5 py-1 text-xs font-bold text-[#8a6209]">
                Not uploaded
            </span>
        );
    }

    return (
        <>
            <button type="button" className="inline-flex cursor-zoom-in items-center gap-2 border-0 bg-transparent p-0 font-bold text-[var(--admin-primary)] hover:underline" onClick={() => setLightboxSrc(resolvedUrl)}>
                <img alt="Health certificate" className="h-8 w-11 rounded border border-[var(--admin-border)] object-cover" src={resolvedUrl} />
                View
            </button>
            <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        </>
    );
}

const CHECKLIST_LABELS = [
    'Registration documents valid',
    'Registration status meets requirement',
    'Horse health status',
    'Health certificate uploaded',
];

function ChecklistSummary({ checklist, violation, ruleRef }) {
    const items = checklist ?? [];
    const total = items.length || CHECKLIST_LABELS.length;
    const passed = items.filter(Boolean).length;
    const tone =
        passed === total
            ? { bg: '#e8f7ee', text: '#16864f' }
            : passed === 0
                ? { bg: '#f3e1df', text: '#a4392f' }
                : { bg: '#faf2e0', text: '#8a6209' };
    const hasRuleRef = ruleRef && ruleRef !== 'N/A';

    return (
        <details className="w-fit">
            <summary
                className="inline-flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold [&::-webkit-details-marker]:hidden"
                style={{ backgroundColor: tone.bg, color: tone.text }}
            >
                {passed}/{total} Passed
                <FaChevronDown size={9} />
            </summary>

            <div className="mt-2 flex w-max min-w-[230px] max-w-[300px] flex-col gap-2 rounded-lg border border-[var(--admin-border)] bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.1)]">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                        {item ? (
                            <FaCheckCircle className="mt-0.5 shrink-0 text-[#16864f]" size={12} />
                        ) : (
                            <FaTimesCircle className="mt-0.5 shrink-0 text-[#a4392f]" size={12} />
                        )}
                        <div>
                            <div
                                className="text-[0.74rem] font-bold"
                                style={{ color: item ? 'var(--admin-ink)' : '#a4392f' }}
                            >
                                {CHECKLIST_LABELS[idx] || `Item ${idx + 1}`}
                            </div>
                            {!item && (
                                <div className="mt-0.5 text-[0.7rem] leading-snug text-[var(--admin-muted)]">
                                    {violation || 'No reason provided.'}
                                    {hasRuleRef ? ` (${ruleRef})` : ''}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </details>
    );
}

function PreRaceInspectionRegistry() {
    const { raceId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [races, setRaces] = useState(
        location.state?.race ? [location.state.race] : []
    );
    const [filter, setFilter] = useState('ALL');
    const [report, setReport] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [loadingRace, setLoadingRace] = useState(!location.state?.race);
    const [loadingReport, setLoadingReport] = useState(false);
    const [savingId, setSavingId] = useState(null);
    const [markingReady, setMarkingReady] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const selectedRace = useMemo(
        () =>
            races.find((race) => String(race.raceId) === String(raceId)) ??
            location.state?.race ??
            null,
        [races, raceId, location.state]
    );

    const registrationById = useMemo(() => {
        const map = new Map();

        registrations.forEach((registration) => {
            map.set(registration.registrationId, registration);
        });

        return map;
    }, [registrations]);

    const rows = report?.items ?? [];
    const counts = report?.counts ?? {
        all: rows.length,
        flagged: 0,
        pending: 0,
    };

    useEffect(() => {
        let ignore = false;

        async function loadSelectedRace() {
            setLoadingRace(true);

            try {
                const data = await refereeApi.getAssignedRacesWithLifecycle();

                if (!ignore) {
                    setRaces(data ?? []);
                }
            } catch (err) {
                if (!ignore) {
                    showToast(err.message || 'Failed to load assigned race.', 'error');
                }
            } finally {
                if (!ignore) {
                    setLoadingRace(false);
                }
            }
        }

        loadSelectedRace();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        if (!raceId) return undefined;

        let ignore = false;

        const apiFilter =
            filterOptions.find((item) => item.key === filter)?.apiValue ?? 'all';

        async function loadInspectionReport() {
            setLoadingReport(true);

            try {
                const [reportData, registrationData] = await Promise.all([
                    refereeApi.getInspectionReport(raceId, apiFilter),
                    refereeApi.getRaceRegistrations(raceId),
                ]);

                if (ignore) return;

                setReport(reportData);
                setRegistrations(registrationData ?? []);

                setDrafts((previous) => {
                    const next = { ...previous };

                    (reportData?.items ?? []).forEach((item) => {
                        if (!next[item.registrationId]) {
                            next[item.registrationId] = {
                                status: statusFromOutcome(item.outcome),
                                note:
                                    item.outcome === 'PROHIBITED'
                                        ? item.violation
                                        : '',
                            };
                        }
                    });

                    return next;
                });
            } catch (err) {
                if (!ignore) {
                    showToast(err.message || 'Failed to load inspection report.', 'error');
                }
            } finally {
                if (!ignore) {
                    setLoadingReport(false);
                }
            }
        }

        loadInspectionReport();

        return () => {
            ignore = true;
        };
    }, [raceId, filter]);

    const handleDraftChange = (registrationId, field, value) => {
        setDrafts((previous) => ({
            ...previous,
            [registrationId]: {
                status: statusFromOutcome(
                    rows.find((row) => row.registrationId === registrationId)
                        ?.outcome
                ),
                note: '',
                ...previous[registrationId],
                [field]: value,
            },
        }));
    };

    const handleMarkReady = async () => {
        if (!raceId || markingReady) return;
        setMarkingReady(true);
        try {
            const updatedLifecycle = await refereeApi.markRaceReady(raceId);
            setRaces((previous) =>
                previous.map((race) =>
                    String(race.raceId) === String(raceId)
                        ? { ...race, ...updatedLifecycle }
                        : race
                )
            );
            showToast('Race marked as Ready. You can now start the race from the Post-Race panel.', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to mark race as ready.', 'error');
        } finally {
            setMarkingReady(false);
        }
    };

    const handleSaveInspection = async (registrationId) => {
        if (!raceId) return;

        const draft = drafts[registrationId] ?? {
            status: INSPECTION_STATUSES.pending,
            note: '',
        };

        setSavingId(registrationId);

        try {
            await refereeApi.saveInspection(raceId, {
                registrationId,
                status: draft.status,
                note: draft.note?.trim() || null,
            });

            const apiFilter =
                filterOptions.find((item) => item.key === filter)?.apiValue ??
                'all';

            const reportData = await refereeApi.getInspectionReport(
                raceId,
                apiFilter
            );

            setReport(reportData);
            showToast('Inspection saved successfully!', 'success', 'Inspection Saved');
        } catch (err) {
            showToast(err.message || 'Failed to save inspection.', 'error', 'Save Error');
        } finally {
            setSavingId(null);
        }
    };

    const showMarkReadyButton = selectedRace?.raceStatus === 'AssignedReferee' || selectedRace?.allowedActions?.canMarkReady;
    const markReadyAllowed = canMarkRaceReady(selectedRace);

    return (
        <RefereeLayout activeKey="pre-race">
            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
                duration={3500}
            />
            <section className="page-shell">
                <button
                    type="button"
                    onClick={() => navigate('/referee/races/pre-race')}
                    className="mb-6 flex items-center gap-2 font-semibold text-[var(--admin-primary)]"
                >
                    <FaArrowLeft />
                    Back to Pre-Race Tournaments
                </button>

                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title">
                            Inspection Registry
                        </h1>

                        <p className="page-subtitle">
                            Update horse inspection status and rule violations for the selected tournament race.
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="rounded-full bg-[var(--admin-surface-strong)] px-4 py-2 text-sm font-bold text-[var(--admin-primary)]">
                            Race #{raceId}
                        </span>
                        {showMarkReadyButton && (
                            <button
                                type="button"
                                disabled={markingReady || !markReadyAllowed}
                                onClick={handleMarkReady}
                                title={markReadyAllowed ? 'Mark race ready' : getMarkReadyDisabledReason(selectedRace)}
                                className="inline-flex items-center gap-2 rounded-full bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FaCheckCircle />
                                {markingReady ? 'Processing...' : 'Mark Race Ready'}
                            </button>
                        )}
                    </div>
                </div>


                <div className="surface-card mb-8 p-6">
                    {loadingRace && !selectedRace ? (
                        <div className="text-[var(--admin-muted)]">
                            Loading selected race...
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <div className="text-xs font-semibold text-[var(--admin-muted)]">
                                    RACE
                                </div>

                                <h2 className="mt-1 text-lg font-bold text-[var(--admin-ink)]">
                                    {selectedRace?.raceName ||
                                        report?.race?.raceName ||
                                        'Selected race'}
                                </h2>

                                {selectedRace?.tournamentName && (
                                    <p className="mt-1 font-semibold text-[var(--admin-primary)]">
                                        {selectedRace.tournamentName}
                                    </p>
                                )}

                                {selectedRace?.seasonStatus && (
                                    <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${selectedRace.seasonStatus === 'Active' ? 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]' : 'bg-[#f3e1df] text-[#a4392f]'}`}>
                                        Season: {selectedRace.seasonStatus}
                                    </span>
                                )}

                                {selectedRace?.blockingReason && (
                                    <p className="mt-2 text-sm font-semibold text-[#a4392f]">
                                        {selectedRace.blockingReason}
                                    </p>
                                )}

                                <div className="mt-2 flex items-center gap-2 text-[var(--admin-muted)]">
                                    <FaMapMarkerAlt />
                                    {selectedRace?.location ||
                                        report?.race?.location ||
                                        'N/A'}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold text-[var(--admin-muted)]">
                                    TIME
                                </div>

                                <div className="mt-1 font-semibold">
                                    {formatDateTime(
                                        selectedRace?.raceDate ||
                                        report?.race?.raceDate
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold text-[var(--admin-muted)]">
                                    DISTANCE
                                </div>

                                <div className="mt-1 font-semibold">
                                    {(selectedRace?.distanceMeters ||
                                        report?.race?.distanceMeters)?.toLocaleString(
                                            'en-US'
                                        ) ?? 0}
                                    m
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="surface-card">
                    <div className="section-bar flex-wrap gap-4">
                        <div>
                            <h2 className="m-0 text-[1.05rem] font-bold">
                                Inspection Registry
                            </h2>

                            <p className="mt-1 text-sm text-[var(--admin-muted)]">
                                {selectedRace?.raceName ||
                                    report?.race?.raceName ||
                                    'Selected race'}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {filterOptions.map((option) => {
                                const count =
                                    option.key === 'ALL'
                                        ? counts.all
                                        : option.key === 'FLAGGED'
                                            ? counts.flagged
                                            : counts.pending;

                                return (
                                    <button
                                        type="button"
                                        key={option.key}
                                        onClick={() => setFilter(option.key)}
                                        className={`rounded-full px-4 py-1.5 text-[0.78rem] font-bold transition-colors ${
                                            filter === option.key
                                                ? 'bg-[var(--admin-primary)] text-white'
                                                : 'border border-[var(--admin-border)] bg-white text-[var(--admin-primary)] hover:bg-[var(--admin-surface-strong)]'
                                        }`}
                                    >
                                        {option.label} ({count ?? 0})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="data-table min-w-[1220px]">
                            <thead>
                                <tr>
                                    <th>Horse</th>
                                    <th>Health Certificate</th>
                                    <th>Registration Status</th>
                                    <th>Checklist</th>
                                    <th>Rule Reference</th>
                                    <th>Severity</th>
                                    <th>Details</th>
                                    <th>Outcome</th>
                                    <th>Update</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loadingReport ? (
                                    <tr>
                                        <td
                                            className="p-6 text-center text-[var(--admin-muted)]"
                                            colSpan={9}
                                        >
                                            Loading inspection registry...
                                        </td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td
                                            className="p-6 text-center text-[var(--admin-muted)]"
                                            colSpan={9}
                                        >
                                            No inspection items for this filter.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((horse) => {
                                        const draft = drafts[
                                            horse.registrationId
                                        ] ?? {
                                            status: statusFromOutcome(
                                                horse.outcome
                                            ),
                                            note: '',
                                        };

                                        const registration = registrationById.get(
                                            horse.registrationId
                                        );

                                        return (
                                            <tr
                                                key={horse.registrationId}
                                                className="border-t align-top"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-[0.9rem]">
                                                        {horse.horseName}
                                                    </div>

                                                    <div className="text-xs text-[var(--admin-muted)]">
                                                        {horse.registrationCode}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <HealthCertificateCell url={horse.healthCertificateImageUrl || registration?.healthCertificateImageUrl} />
                                                </td>

                                                <td className="px-4 py-3 text-sm">
                                                    {registration?.status ?? 'N/A'}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <ChecklistSummary
                                                        checklist={horse.checklist}
                                                        violation={horse.violation}
                                                        ruleRef={horse.ruleRef}
                                                    />
                                                </td>

                                                <td className="px-4 py-3 text-sm text-[var(--admin-muted)]">
                                                    {horse.ruleRef || '—'}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {horse.severity ? (
                                                        <span style={{
                                                            fontSize: 11, fontWeight: 700,
                                                            padding: '2px 9px', borderRadius: 20,
                                                            backgroundColor: horse.severity === 'HIGH' ? '#f3e1df' : horse.severity === 'MEDIUM' ? '#faf2e0' : 'var(--admin-surface-strong)',
                                                            color: horse.severity === 'HIGH' ? '#a4392f' : horse.severity === 'MEDIUM' ? '#8a6209' : 'var(--admin-primary)',
                                                        }}>
                                                            {horse.severity}
                                                        </span>
                                                    ) : '—'}
                                                </td>

                                                <td className="px-4 py-3 text-sm text-[var(--admin-muted)]" style={{ maxWidth: 200 }}>
                                                    {horse.violation || '—'}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 700,
                                                        padding: '3px 10px', borderRadius: 20,
                                                        backgroundColor: horse.outcome === 'ALLOWED' ? '#e8f7ee' : horse.outcome === 'PROHIBITED' ? '#f3e1df' : '#faf2e0',
                                                        color: horse.outcome === 'ALLOWED' ? '#16864f' : horse.outcome === 'PROHIBITED' ? '#a4392f' : '#8a6209',
                                                    }}>
                                                        {horse.outcome ?? 'PENDING'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3" style={{ minWidth: 230 }}>
                                                    <div className="flex flex-col gap-2">
                                                        <select
                                                            value={draft.status}
                                                            onChange={(event) =>
                                                                handleDraftChange(horse.registrationId, 'status', event.target.value)
                                                            }
                                                            className="w-full rounded-lg border border-[var(--admin-border)] px-2.5 py-1.5 text-[0.8rem] outline-none transition-colors focus:border-[var(--admin-primary)]"
                                                        >
                                                            {statusOptions.map((option) => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <input
                                                            type="text"
                                                            value={draft.note}
                                                            onChange={(event) =>
                                                                handleDraftChange(horse.registrationId, 'note', event.target.value)
                                                            }
                                                            placeholder="Inspection note"
                                                            className="w-full rounded-lg border border-[var(--admin-border)] px-2.5 py-1.5 text-[0.8rem] outline-none transition-colors focus:border-[var(--admin-primary)]"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() => handleSaveInspection(horse.registrationId)}
                                                            disabled={savingId === horse.registrationId}
                                                            className="inline-flex w-fit items-center rounded-full bg-[var(--admin-primary)] px-3.5 py-1.5 text-[0.72rem] font-bold text-white transition-colors hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {savingId === horse.registrationId ? 'Saving...' : 'Save'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t px-6 py-3 text-xs font-semibold text-[var(--admin-muted)]">
                        Showing {rows.length} of {counts.all ?? rows.length} entries
                    </div>
                </div>
            </section>
        </RefereeLayout>
    );
}

export default PreRaceInspectionRegistry;
