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
        <RefereeLayout activeKey="assigned-races">
            <div className="p-8">
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
                        <h1 className="text-5xl font-bold text-[#7d0000]">
                            Inspection Registry
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Update horse inspection status and rule violations for the selected tournament race.
                        </p>
                    </div>

                    <span className="rounded-full bg-[#f7efee] px-4 py-2 text-sm font-bold text-[#7d0000]">
                        Race #{raceId}
                    </span>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-700">
                        {success}
                    </div>
                )}

                <div className="mb-8 rounded-2xl border border-[#ead3cf] bg-white p-6">
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

                                <h2 className="mt-1 text-3xl font-bold text-[#2b1b1b]">
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

                <div className="overflow-hidden rounded-2xl border bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b p-6">
                        <div>
                            <h2 className="text-3xl font-semibold">
                                Inspection Registry
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
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
                                        className={`rounded px-4 py-2 font-semibold ${filter === option.key
                                            ? 'bg-[#7d0000] text-white'
                                            : 'border'
                                            }`}
                                    >
                                        {option.label} ({count ?? 0})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px]">
                            <thead className="bg-[#faf6f5]">
                                <tr className="text-left">
                                    <th className="p-4">HORSE</th>
                                    <th className="p-4">REG STATUS</th>
                                    <th className="p-4">CHECKLIST</th>
                                    <th className="p-4">RULE REF</th>
                                    <th className="p-4">SEVERITY</th>
                                    <th className="p-4">DETAILS</th>
                                    <th className="p-4">OUTCOME</th>
                                    <th className="p-4">UPDATE</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loadingReport ? (
                                    <tr>
                                        <td
                                            className="p-6 text-center text-gray-500"
                                            colSpan={8}
                                        >
                                            Loading inspection registry...
                                        </td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td
                                            className="p-6 text-center text-gray-500"
                                            colSpan={8}
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
                                                <td className="p-4">
                                                    <div className="font-bold">
                                                        {horse.horseName}
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        {horse.registrationCode}
                                                    </div>
                                                </td>

                                                <td className="p-4">
                                                    {registration?.status ??
                                                        'N/A'}
                                                </td>

                                                <td className="p-4">
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

                                                <td className="p-4">
                                                    {horse.ruleRef}
                                                </td>

                                                <td className="p-4">
                                                    {horse.severity}
                                                </td>

                                                <td className="max-w-xs p-4">
                                                    {horse.violation}
                                                </td>

                                                <td className="p-4">
                                                    <span
                                                        className={`font-semibold ${horse.outcome ===
                                                            'ALLOWED'
                                                            ? 'text-green-600'
                                                            : horse.outcome ===
                                                                'PROHIBITED'
                                                                ? 'text-red-600'
                                                                : 'text-yellow-600'
                                                            }`}
                                                    >
                                                        {horse.outcome}
                                                    </span>
                                                </td>

                                                <td className="w-[320px] p-4">
                                                    <div className="grid gap-2">
                                                        <select
                                                            value={draft.status}
                                                            onChange={(event) =>
                                                                handleDraftChange(
                                                                    horse.registrationId,
                                                                    'status',
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                            className="rounded border border-[#ead3cf] px-3 py-2 outline-none focus:border-[#7d0000]"
                                                        >
                                                            {statusOptions.map(
                                                                (option) => (
                                                                    <option
                                                                        key={
                                                                            option.value
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>

                                                        <input
                                                            type="text"
                                                            value={draft.note}
                                                            onChange={(event) =>
                                                                handleDraftChange(
                                                                    horse.registrationId,
                                                                    'note',
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Inspection note"
                                                            className="rounded border border-[#ead3cf] px-3 py-2 outline-none focus:border-[#7d0000]"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSaveInspection(
                                                                    horse.registrationId
                                                                )
                                                            }
                                                            disabled={
                                                                savingId ===
                                                                horse.registrationId
                                                            }
                                                            className="rounded bg-[#7d0000] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {savingId ===
                                                                horse.registrationId
                                                                ? 'Saving...'
                                                                : 'Save Inspection'}
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

                    <div className="border-t p-4 text-sm text-gray-500">
                        Showing {rows.length} of {counts.all ?? rows.length} entries
                    </div>
                </div>
            </div>
        </RefereeLayout>
    );
}

export default PreRaceInspectionRegistry;