import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    FaArrowLeft,
    FaCheckCircle,
    FaMapMarkerAlt,
    FaTimesCircle,
} from 'react-icons/fa';

import {
    INSPECTION_STATUSES,
    refereeApi,
} from '../../api/refereeApi';
import { resolveFileUrl } from '../../api/uploadApi';
import RefereeLayout from './RefereeLayout';

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

function HealthCertificateCell({ url }) {
    if (!url) {
        return (
            <span className="inline-flex rounded border border-[#dbc3bf] bg-[#f3e8e6] px-2.5 py-1 text-xs font-bold text-[#7f645f]">
                Not uploaded
            </span>
        );
    }

    const resolvedUrl = resolveFileUrl(url);

    return (
        <a className="inline-flex items-center gap-2 font-bold text-[#7d0000] no-underline hover:underline" href={resolvedUrl} target="_blank" rel="noreferrer">
            <img alt="Health certificate" className="h-8 w-11 rounded border border-[#ead3cf] object-cover" src={resolvedUrl} />
            View
        </a>
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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
                const data = await refereeApi.getAssignedRaces();

                if (!ignore) {
                    setRaces(data ?? []);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.message || 'Failed to load assigned race.');
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
            setError('');
            setSuccess('');

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
                    setError(err.message || 'Failed to load inspection report.');
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

    const handleSaveInspection = async (registrationId) => {
        if (!raceId) return;

        const draft = drafts[registrationId] ?? {
            status: INSPECTION_STATUSES.pending,
            note: '',
        };

        setSavingId(registrationId);
        setError('');
        setSuccess('');

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
            setSuccess('Inspection saved successfully.');
        } catch (err) {
            setError(err.message || 'Failed to save inspection.');
        } finally {
            setSavingId(null);
        }
    };

    return (
        <RefereeLayout activeKey="pre-race">
            <section className="page-shell">
                <button
                    type="button"
                    onClick={() => navigate('/referee/races/pre-race')}
                    className="mb-6 flex items-center gap-2 font-semibold text-[#7d0000]"
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

                    <span className="rounded-full bg-[#f7efee] px-4 py-2 text-sm font-bold text-[#7d0000]">
                        Race #{raceId}
                    </span>
                </div>

                {error && (
                    <div className="mb-6 rounded-[8px] border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-[8px] border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-700">
                        {success}
                    </div>
                )}

                <div className="surface-card mb-8 p-6">
                    {loadingRace && !selectedRace ? (
                        <div className="text-gray-500">
                            Loading selected race...
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <div className="text-xs font-semibold text-gray-400">
                                    RACE
                                </div>

                                <h2 className="mt-1 text-lg font-bold text-[#2b1b1b]">
                                    {selectedRace?.raceName ||
                                        report?.race?.raceName ||
                                        'Selected race'}
                                </h2>

                                {selectedRace?.tournamentName && (
                                    <p className="mt-1 font-semibold text-[#7d0000]">
                                        {selectedRace.tournamentName}
                                    </p>
                                )}

                                <div className="mt-2 flex items-center gap-2 text-gray-500">
                                    <FaMapMarkerAlt />
                                    {selectedRace?.location ||
                                        report?.race?.location ||
                                        'N/A'}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold text-gray-400">
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
                                <div className="text-xs font-semibold text-gray-400">
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
                                        style={{
                                            padding: '7px 16px',
                                            borderRadius: 8,
                                            fontSize: 13,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            border: filter === option.key ? 'none' : '1px solid #edcfc9',
                                            background: filter === option.key ? '#7d0000' : '#fff8f6',
                                            color: filter === option.key ? '#fff' : '#7d0000',
                                        }}
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
                                    <th>Health Cert</th>
                                    <th>Reg Status</th>
                                    <th>Checklist</th>
                                    <th>Rule Ref</th>
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
                                            className="p-6 text-center text-gray-500"
                                            colSpan={9}
                                        >
                                            Loading inspection registry...
                                        </td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td
                                            className="p-6 text-center text-gray-500"
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
                                                    <div className="flex gap-1">
                                                        {(horse.checklist ?? []).map(
                                                            (item, idx) =>
                                                                item ? (
                                                                    <FaCheckCircle
                                                                        key={idx}
                                                                        className="text-green-600"
                                                                    />
                                                                ) : (
                                                                    <FaTimesCircle
                                                                        key={idx}
                                                                        className="text-red-600"
                                                                    />
                                                                )
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-sm text-[var(--admin-muted)]">
                                                    {horse.ruleRef || '—'}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {horse.severity ? (
                                                        <span style={{
                                                            fontSize: 11, fontWeight: 700,
                                                            padding: '2px 9px', borderRadius: 20,
                                                            backgroundColor: horse.severity === 'HIGH' ? '#f8d7da' : horse.severity === 'MEDIUM' ? '#fff3cd' : '#e3f2fd',
                                                            color: horse.severity === 'HIGH' ? '#721c24' : horse.severity === 'MEDIUM' ? '#856404' : '#1565c0',
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
                                                        backgroundColor: horse.outcome === 'ALLOWED' ? '#d4edda' : horse.outcome === 'PROHIBITED' ? '#f8d7da' : '#fff3cd',
                                                        color: horse.outcome === 'ALLOWED' ? '#155724' : horse.outcome === 'PROHIBITED' ? '#721c24' : '#856404',
                                                    }}>
                                                        {horse.outcome ?? 'PENDING'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3" style={{ minWidth: 230 }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                        <select
                                                            value={draft.status}
                                                            onChange={(event) =>
                                                                handleDraftChange(horse.registrationId, 'status', event.target.value)
                                                            }
                                                            style={{ fontSize: 13, padding: '6px 10px', borderRadius: 6, border: '1px solid #edcfc9', outline: 'none', width: '100%' }}
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
                                                            style={{ fontSize: 13, padding: '6px 10px', borderRadius: 6, border: '1px solid #edcfc9', outline: 'none', width: '100%' }}
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() => handleSaveInspection(horse.registrationId)}
                                                            disabled={savingId === horse.registrationId}
                                                            style={{
                                                                fontSize: 12, fontWeight: 700, padding: '6px 14px',
                                                                borderRadius: 6, border: 'none', cursor: 'pointer',
                                                                background: '#7d0000', color: '#fff',
                                                                alignSelf: 'flex-start',
                                                                opacity: savingId === horse.registrationId ? 0.6 : 1,
                                                            }}
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
