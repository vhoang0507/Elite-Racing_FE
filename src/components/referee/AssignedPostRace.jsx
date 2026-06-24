import { useEffect, useMemo, useState } from 'react';
import {
    FaCheck,
    FaClipboardList,
    FaExclamationTriangle,
    FaFileAlt,
    FaGavel,
    FaMapMarkerAlt,
    FaRedo,
    FaTrophy,
} from 'react-icons/fa';

import {
    VIOLATION_ACTIONS,
    refereeApi,
} from '../../api/refereeApi';
import RefereeLayout from './RefereeLayout';

const panelClass = 'surface-card';

const emptyResultForm = {
    registrationId: '',
    finishTimeSeconds: '',
    finishPosition: '',
    score: '',
    note: '',
};

const emptyViolationForm = {
    registrationId: '',
    violationType: '',
    description: '',
    action: VIOLATION_ACTIONS.warning,
    penaltyPoints: '',
};

const violationTypes = [
    'False Start',
    'Track Interference',
    'Dangerous Riding',
    'Improper Equipment',
    'Unsportsmanlike Conduct',
    'Whip Misuse',
    'Health / Doping Issue',
    'Other',
];

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

function nullableNumber(value) {
    if (value === '' || value === null || value === undefined) return null;

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function formatSeconds(value) {
    if (value === null || value === undefined || value === '') return '-';
    return `${Number(value).toFixed(2)}s`;
}

function getRegistrationLabel(registration) {
    if (!registration) return 'Unknown registration';

    const horseName = registration.horseName || 'Unnamed horse';
    const jockeyLabel = registration.jockeyId
        ? `Jockey #${registration.jockeyId}`
        : 'No jockey';

    return `${horseName} - REG #${registration.registrationId} - ${jockeyLabel}`;
}

function getStatusClass(status) {
    if (
        status === 'RefereeConfirmed' ||
        status === 'AdminApproved' ||
        status === 'Published'
    ) {
        return 'bg-green-100 text-green-700';
    }

    if (status === 'Returned') {
        return 'bg-red-100 text-red-700';
    }

    return 'bg-[#f7efee] text-[#7d0000]';
}

function AssignedPostRace() {
    const [races, setRaces] = useState([]);
    const [selectedRaceId, setSelectedRaceId] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [results, setResults] = useState([]);
    const [violations, setViolations] = useState([]);
    const [reports, setReports] = useState([]);

    const [resultForm, setResultForm] = useState(emptyResultForm);
    const [violationForm, setViolationForm] = useState(emptyViolationForm);
    const [reportContent, setReportContent] = useState('');

    const [loadingRaces, setLoadingRaces] = useState(true);
    const [loadingRaceData, setLoadingRaceData] = useState(false);
    const [saving, setSaving] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const selectedRace = useMemo(
        () =>
            races.find(
                (race) => String(race.raceId) === String(selectedRaceId)
            ) ?? null,
        [races, selectedRaceId]
    );

    const registrationById = useMemo(() => {
        const map = new Map();

        registrations.forEach((registration) => {
            map.set(String(registration.registrationId), registration);
        });

        return map;
    }, [registrations]);

    const selectedResultRegistration = registrationById.get(
        String(resultForm.registrationId)
    );

    const selectedViolationRegistration = registrationById.get(
        String(violationForm.registrationId)
    );

    async function loadAssignedRaces(ignoreRef = { current: false }) {
        setLoadingRaces(true);
        setError('');

        try {
            const data = await refereeApi.getAssignedRaces({ phase: 'post' });

            if (ignoreRef.current) return;

            const nextRaces = data ?? [];

            setRaces(nextRaces);
            setSelectedRaceId((current) => current ?? nextRaces[0]?.raceId ?? null);
        } catch (err) {
            if (!ignoreRef.current) {
                setError(err.message || 'Failed to load completed races.');
            }
        } finally {
            if (!ignoreRef.current) {
                setLoadingRaces(false);
            }
        }
    }

    async function loadRaceWorkflowData(raceId, ignoreRef = { current: false }) {
        if (!raceId) return;

        setLoadingRaceData(true);
        setError('');
        setSuccess('');

        try {
            const [
                registrationData,
                resultData,
                violationData,
                reportData,
            ] = await Promise.all([
                refereeApi.getRaceRegistrations(raceId),
                refereeApi.getRaceResults(raceId),
                refereeApi.getViolations(raceId),
                refereeApi.getRefereeReports(raceId),
            ]);

            if (ignoreRef.current) return;

            const nextRegistrations = registrationData ?? [];
            const firstRegistrationId = nextRegistrations[0]?.registrationId
                ? String(nextRegistrations[0].registrationId)
                : '';

            setRegistrations(nextRegistrations);
            setResults(resultData ?? []);
            setViolations(violationData ?? []);
            setReports(reportData ?? []);

            setResultForm({
                ...emptyResultForm,
                registrationId: firstRegistrationId,
            });

            setViolationForm({
                ...emptyViolationForm,
                registrationId: firstRegistrationId,
            });

            setReportContent('');
        } catch (err) {
            if (!ignoreRef.current) {
                setError(err.message || 'Failed to load race workflow data.');
            }
        } finally {
            if (!ignoreRef.current) {
                setLoadingRaceData(false);
            }
        }
    }

    useEffect(() => {
        const ignoreRef = { current: false };

        loadAssignedRaces(ignoreRef);

        return () => {
            ignoreRef.current = true;
        };
    }, []);

    useEffect(() => {
        if (!selectedRaceId) return undefined;

        const ignoreRef = { current: false };

        loadRaceWorkflowData(selectedRaceId, ignoreRef);

        return () => {
            ignoreRef.current = true;
        };
    }, [selectedRaceId]);

    const refreshResults = async () => {
        if (!selectedRaceId) return;

        const data = await refereeApi.getRaceResults(selectedRaceId);
        setResults(data ?? []);
    };

    const refreshViolations = async () => {
        if (!selectedRaceId) return;

        const data = await refereeApi.getViolations(selectedRaceId);
        setViolations(data ?? []);
    };

    const refreshReports = async () => {
        if (!selectedRaceId) return;

        const data = await refereeApi.getRefereeReports(selectedRaceId);
        setReports(data ?? []);
    };

    const handleRaceSelect = (raceId) => {
        setSelectedRaceId(raceId);
        setError('');
        setSuccess('');
    };

    const handleResultChange = (field, value) => {
        setResultForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleViolationChange = (field, value) => {
        setViolationForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const validateResultForm = () => {
        if (!selectedRaceId) return 'Please select a race first.';
        if (!resultForm.registrationId) {
            return 'Please select a registration for result entry.';
        }

        const hasAtLeastOneResultValue =
            resultForm.finishPosition !== '' ||
            resultForm.finishTimeSeconds !== '' ||
            resultForm.score !== '';

        if (!hasAtLeastOneResultValue) {
            return 'Please enter finish position, finish time, or score.';
        }

        const finishPosition = nullableNumber(resultForm.finishPosition);
        const finishTimeSeconds = nullableNumber(resultForm.finishTimeSeconds);
        const score = nullableNumber(resultForm.score);

        if (
            resultForm.finishPosition !== '' &&
            (!Number.isInteger(finishPosition) || finishPosition < 1)
        ) {
            return 'Finish position must be a positive whole number.';
        }

        if (
            resultForm.finishTimeSeconds !== '' &&
            (finishTimeSeconds === null || finishTimeSeconds < 0)
        ) {
            return 'Finish time must be zero or greater.';
        }

        if (resultForm.score !== '' && (score === null || score < 0)) {
            return 'Score must be zero or greater.';
        }

        return '';
    };

    const validateViolationForm = () => {
        if (!selectedRaceId) return 'Please select a race first.';
        if (!violationForm.registrationId) {
            return 'Please select a registration for the violation.';
        }

        if (!violationForm.violationType.trim()) {
            return 'Violation type is required.';
        }

        const penaltyPoints = nullableNumber(violationForm.penaltyPoints);

        if (
            violationForm.penaltyPoints !== '' &&
            (penaltyPoints === null || penaltyPoints < 0)
        ) {
            return 'Penalty points must be zero or greater.';
        }

        if (
            violationForm.action === VIOLATION_ACTIONS.pointDeduction &&
            (!penaltyPoints || penaltyPoints <= 0)
        ) {
            return 'Point deduction requires penalty points greater than zero.';
        }

        return '';
    };

    const handleSaveResult = async (event) => {
        event.preventDefault();

        const validationMessage = validateResultForm();

        if (validationMessage) {
            setError(validationMessage);
            setSuccess('');
            return;
        }

        setSaving('result');
        setError('');
        setSuccess('');

        try {
            await refereeApi.saveRaceResult(selectedRaceId, {
                registrationId: Number(resultForm.registrationId),
                finishTimeSeconds: nullableNumber(resultForm.finishTimeSeconds),
                finishPosition: nullableNumber(resultForm.finishPosition),
                score: nullableNumber(resultForm.score),
                note: resultForm.note?.trim() || null,
            });

            await refreshResults();

            setResultForm((previous) => ({
                ...emptyResultForm,
                registrationId: previous.registrationId,
            }));

            setSuccess('Race result saved successfully.');
        } catch (err) {
            setError(err.message || 'Failed to save race result.');
        } finally {
            setSaving('');
        }
    };

    const handleEditResult = (result) => {
        setResultForm({
            registrationId: String(result.registrationId),
            finishTimeSeconds: result.finishTimeSeconds ?? '',
            finishPosition: result.finishPosition ?? '',
            score: result.score ?? '',
            note: result.note ?? '',
        });

        setError('');
        setSuccess('Editing selected result. Update the fields and click Save Result.');
    };

    const handleConfirmResult = async (resultId) => {
        if (!selectedRaceId) return;

        setSaving(`confirm-${resultId}`);
        setError('');
        setSuccess('');

        try {
            await refereeApi.confirmRaceResult(selectedRaceId, resultId);
            await refreshResults();
            setSuccess('Race result confirmed successfully.');
        } catch (err) {
            setError(err.message || 'Failed to confirm race result.');
        } finally {
            setSaving('');
        }
    };

    const handleCreateViolation = async (event) => {
        event.preventDefault();

        const validationMessage = validateViolationForm();

        if (validationMessage) {
            setError(validationMessage);
            setSuccess('');
            return;
        }

        setSaving('violation');
        setError('');
        setSuccess('');

        try {
            await refereeApi.createViolation(selectedRaceId, {
                registrationId: Number(violationForm.registrationId),
                violationType: violationForm.violationType.trim(),
                description: violationForm.description?.trim() || null,
                action: violationForm.action,
                penaltyPoints: nullableNumber(violationForm.penaltyPoints),
            });

            await refreshViolations();

            setViolationForm((previous) => ({
                ...emptyViolationForm,
                registrationId: previous.registrationId,
            }));

            setSuccess('Violation created successfully.');
        } catch (err) {
            setError(err.message || 'Failed to create violation.');
        } finally {
            setSaving('');
        }
    };

    const handleCreateReport = async (event) => {
        event.preventDefault();

        if (!selectedRaceId || !reportContent.trim()) return;

        setSaving('report');
        setError('');
        setSuccess('');

        try {
            await refereeApi.createRefereeReport(
                selectedRaceId,
                reportContent.trim()
            );

            await refreshReports();
            setReportContent('');
            setSuccess('Referee report submitted successfully.');
        } catch (err) {
            setError(err.message || 'Failed to submit report.');
        } finally {
            setSaving('');
        }
    };

    const handleRefreshRaceData = async () => {
        if (!selectedRaceId) return;

        await loadRaceWorkflowData(selectedRaceId);
    };

    return (
        <RefereeLayout activeKey="assigned-races">
            <section className="page-shell">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title">
                            Post-Race Workflow
                        </h1>

                        <p className="page-subtitle">
                            Select a race, enter official results, create violations, and submit referee reports.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleRefreshRaceData}
                        disabled={!selectedRaceId || loadingRaceData}
                        className="secondary-button gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FaRedo />
                        Refresh Data
                    </button>
                </div>

                {error && (
                    <div className="rounded-[8px] border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-[8px] border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-700">
                        {success}
                    </div>
                )}

                <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {loadingRaces ? (
                        <div className="soft-card p-6 text-gray-500">
                            Loading assigned races...
                        </div>
                    ) : races.length === 0 ? (
                        <div className="soft-card p-6 text-gray-500">
                            No assigned races from backend.
                        </div>
                    ) : (
                        races.map((race) => (
                            <button
                                type="button"
                                key={race.raceId}
                                onClick={() => handleRaceSelect(race.raceId)}
                                className={`soft-card p-6 text-left transition ${String(selectedRaceId) === String(race.raceId)
                                    ? 'border-[#7d0000] shadow-md'
                                    : 'border-[#ead3cf] hover:border-[#7d0000] hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between">
                                    <span className="rounded-full bg-[#f7efee] px-3 py-1 text-xs font-semibold">
                                        {race.displayStatus || race.tournamentStatus || race.raceStatus}
                                    </span>

                                    <span className="font-bold">
                                        #{race.raceId}
                                    </span>
                                </div>

                                <h2 className="mt-5 text-2xl font-black">
                                    {race.raceName}
                                </h2>

                                {race.tournamentName && (
                                    <p className="mt-1 text-sm font-semibold text-[#7d0000]">
                                        {race.tournamentName}
                                    </p>
                                )}

                                <div className="mt-2 flex items-center gap-2 text-gray-500">
                                    <FaMapMarkerAlt />
                                    {race.location || 'N/A'}
                                </div>

                                <p className="mt-4 text-sm font-semibold text-gray-500">
                                    {formatDateTime(race.raceDate)} -{' '}
                                    {race.distanceMeters?.toLocaleString('en-US') ?? 0}m
                                </p>
                            </button>
                        ))
                    )}
                </section>

                <section className="grid gap-6 xl:grid-cols-3">
                    <form
                        onSubmit={handleSaveResult}
                        className={`${panelClass} p-6`}
                    >
                        <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold text-[#2b1b1b]">
                            <FaTrophy className="text-[#7d0000]" />
                            Result Entry
                        </h2>

                        {selectedRace && (
                            <div className="mb-5 rounded-[8px] bg-[#faf6f5] px-4 py-3 text-sm text-gray-600">
                                Entering result for{' '}
                                <span className="font-bold text-[#7d0000]">
                                    {selectedRace.raceName}
                                </span>
                            </div>
                        )}

                        <div className="grid gap-4">
                            <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                Registration
                                <select
                                    value={resultForm.registrationId}
                                    onChange={(event) =>
                                        handleResultChange(
                                            'registrationId',
                                            event.target.value
                                        )
                                    }
                                    required
                                    disabled={
                                        loadingRaceData ||
                                        registrations.length === 0
                                    }
                                    className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000] disabled:bg-gray-50 disabled:text-gray-400"
                                >
                                    <option value="" disabled>
                                        {registrations.length === 0
                                            ? 'No registrations found for this race'
                                            : 'Select registration'}
                                    </option>

                                    {registrations.map((registration) => (
                                        <option
                                            key={registration.registrationId}
                                            value={String(
                                                registration.registrationId
                                            )}
                                        >
                                            {getRegistrationLabel(registration)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {selectedResultRegistration && (
                                <div className="rounded-[8px] border border-[#ead3cf] p-3 text-sm text-gray-600">
                                    <div className="font-semibold text-[#2b1b1b]">
                                        {selectedResultRegistration.horseName}
                                    </div>

                                    <div>
                                        Registration status:{' '}
                                        {selectedResultRegistration.status || 'N/A'}
                                    </div>

                                    <div>
                                        Owner #
                                        {selectedResultRegistration.ownerId || 'N/A'} ·
                                        Jockey #
                                        {selectedResultRegistration.jockeyId || 'N/A'}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                    Finish Position
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={resultForm.finishPosition}
                                        onChange={(event) =>
                                            handleResultChange(
                                                'finishPosition',
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. 1"
                                        className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                    />
                                </label>

                                <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                    Time Seconds
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={resultForm.finishTimeSeconds}
                                        onChange={(event) =>
                                            handleResultChange(
                                                'finishTimeSeconds',
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. 92.45"
                                        className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                    />
                                </label>
                            </div>

                            <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                Score
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={resultForm.score}
                                    onChange={(event) =>
                                        handleResultChange(
                                            'score',
                                            event.target.value
                                        )
                                    }
                                    placeholder="Optional score"
                                    className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                />
                            </label>

                            <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                Note
                                <textarea
                                    value={resultForm.note}
                                    onChange={(event) =>
                                        handleResultChange(
                                            'note',
                                            event.target.value
                                        )
                                    }
                                    rows={3}
                                    placeholder="Result note"
                                    className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={
                                    saving === 'result' ||
                                    loadingRaceData ||
                                    registrations.length === 0
                                }
                                className="rounded bg-[#7d0000] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving === 'result'
                                    ? 'Saving...'
                                    : 'Save Result'}
                            </button>
                        </div>
                    </form>

                    <form
                        onSubmit={handleCreateViolation}
                        className={`${panelClass} p-6`}
                    >
                        <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold text-[#2b1b1b]">
                            <FaGavel className="text-[#7d0000]" />
                            Violation
                        </h2>

                        {selectedRace && (
                            <div className="mb-5 rounded-[8px] bg-[#faf6f5] px-4 py-3 text-sm text-gray-600">
                                Create violation for{' '}
                                <span className="font-bold text-[#7d0000]">
                                    {selectedRace.raceName}
                                </span>
                            </div>
                        )}

                        <div className="grid gap-4">
                            <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                Registration
                                <select
                                    value={violationForm.registrationId}
                                    onChange={(event) =>
                                        handleViolationChange(
                                            'registrationId',
                                            event.target.value
                                        )
                                    }
                                    required
                                    disabled={
                                        loadingRaceData ||
                                        registrations.length === 0
                                    }
                                    className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000] disabled:bg-gray-50 disabled:text-gray-400"
                                >
                                    <option value="" disabled>
                                        {registrations.length === 0
                                            ? 'No registrations found for this race'
                                            : 'Select registration'}
                                    </option>

                                    {registrations.map((registration) => (
                                        <option
                                            key={registration.registrationId}
                                            value={String(
                                                registration.registrationId
                                            )}
                                        >
                                            {getRegistrationLabel(registration)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {selectedViolationRegistration && (
                                <div className="rounded-[8px] border border-[#ead3cf] p-3 text-sm text-gray-600">
                                    <div className="font-semibold text-[#2b1b1b]">
                                        {selectedViolationRegistration.horseName}
                                    </div>

                                    <div>
                                        Registration status:{' '}
                                        {selectedViolationRegistration.status ||
                                            'N/A'}
                                    </div>

                                    <div>
                                        Owner #
                                        {selectedViolationRegistration.ownerId ||
                                            'N/A'}{' '}
                                        · Jockey #
                                        {selectedViolationRegistration.jockeyId ||
                                            'N/A'}
                                    </div>
                                </div>
                            )}

                            <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                Violation Type
                                <select
                                    value={violationForm.violationType}
                                    onChange={(event) =>
                                        handleViolationChange(
                                            'violationType',
                                            event.target.value
                                        )
                                    }
                                    required
                                    className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                >
                                    <option value="" disabled>
                                        Select violation type
                                    </option>

                                    {violationTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                    Action
                                    <select
                                        value={violationForm.action}
                                        onChange={(event) =>
                                            handleViolationChange(
                                                'action',
                                                event.target.value
                                            )
                                        }
                                        className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                    >
                                        <option value={VIOLATION_ACTIONS.warning}>
                                            Warning
                                        </option>

                                        <option
                                            value={
                                                VIOLATION_ACTIONS.pointDeduction
                                            }
                                        >
                                            Point Deduction
                                        </option>

                                        <option
                                            value={VIOLATION_ACTIONS.disqualified}
                                        >
                                            Disqualified
                                        </option>
                                    </select>
                                </label>

                                <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                    Penalty Points
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={violationForm.penaltyPoints}
                                        onChange={(event) =>
                                            handleViolationChange(
                                                'penaltyPoints',
                                                event.target.value
                                            )
                                        }
                                        placeholder={
                                            violationForm.action ===
                                                VIOLATION_ACTIONS.pointDeduction
                                                ? 'Required'
                                                : 'Optional'
                                        }
                                        className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                    />
                                </label>
                            </div>

                            <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                Description
                                <textarea
                                    value={violationForm.description}
                                    onChange={(event) =>
                                        handleViolationChange(
                                            'description',
                                            event.target.value
                                        )
                                    }
                                    rows={3}
                                    placeholder="Describe what happened"
                                    className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={
                                    saving === 'violation' ||
                                    loadingRaceData ||
                                    registrations.length === 0
                                }
                                className="rounded bg-[#7d0000] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving === 'violation'
                                    ? 'Creating...'
                                    : 'Create Violation'}
                            </button>
                        </div>
                    </form>

                    <form
                        onSubmit={handleCreateReport}
                        className={`${panelClass} p-6`}
                    >
                        <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold text-[#2b1b1b]">
                            <FaFileAlt className="text-[#7d0000]" />
                            Referee Report
                        </h2>

                        <label className="grid gap-2 text-sm font-semibold text-gray-600">
                            Report Content
                            <textarea
                                value={reportContent}
                                onChange={(event) =>
                                    setReportContent(event.target.value)
                                }
                                rows={13}
                                required
                                placeholder="Write final post-race report"
                                className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={saving === 'report' || !reportContent.trim()}
                            className="mt-4 rounded bg-[#7d0000] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving === 'report'
                                ? 'Submitting...'
                                : 'Submit Report'}
                        </button>
                    </form>
                </section>

                {registrations.length === 0 &&
                    !loadingRaceData &&
                    selectedRaceId && (
                        <div className="flex items-start gap-3 rounded-[8px] border border-yellow-200 bg-yellow-50 p-5 text-yellow-800">
                            <FaExclamationTriangle className="mt-1" />

                            <div>
                                <div className="font-bold">
                                    No registrations available for this race.
                                </div>

                                <p className="mt-1 text-sm">
                                    Result entry and violation creation need at least one race registration from the backend.
                                </p>
                            </div>
                        </div>
                    )}

                <section className={`${panelClass}`}>
                    <div className="flex items-center justify-between border-b p-5">
                        <h2 className="flex items-center gap-2 text-2xl font-bold">
                            <FaClipboardList className="text-[#7d0000]" />
                            Results
                        </h2>

                        <span className="text-sm font-semibold text-gray-500">
                            {selectedRace?.raceName || 'Select a race'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="bg-[#faf6f5] text-left">
                                <tr>
                                    <th className="p-4">HORSE</th>
                                    <th className="p-4">POSITION</th>
                                    <th className="p-4">TIME</th>
                                    <th className="p-4">SCORE</th>
                                    <th className="p-4">STATUS</th>
                                    <th className="p-4">NOTE</th>
                                    <th className="p-4">ACTION</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loadingRaceData ? (
                                    <tr>
                                        <td
                                            className="p-6 text-center text-gray-500"
                                            colSpan={7}
                                        >
                                            Loading race data...
                                        </td>
                                    </tr>
                                ) : results.length === 0 ? (
                                    <tr>
                                        <td
                                            className="p-6 text-center text-gray-500"
                                            colSpan={7}
                                        >
                                            No results submitted yet.
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((result) => (
                                        <tr
                                            key={result.resultId}
                                            className="border-t align-top"
                                        >
                                            <td className="p-4">
                                                <div className="font-semibold">
                                                    {result.horseName}
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    REG #{result.registrationId}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                {result.finishPosition ?? '-'}
                                            </td>

                                            <td className="p-4">
                                                {formatSeconds(
                                                    result.finishTimeSeconds
                                                )}
                                            </td>

                                            <td className="p-4">
                                                {result.score ?? '-'}
                                            </td>

                                            <td className="p-4">
                                                <span
                                                    className={`rounded px-3 py-1 text-xs font-bold ${getStatusClass(
                                                        result.status
                                                    )}`}
                                                >
                                                    {result.status}
                                                </span>
                                            </td>

                                            <td className="max-w-xs p-4 text-sm text-gray-600">
                                                {result.note || '-'}
                                            </td>

                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditResult(
                                                                result
                                                            )
                                                        }
                                                        className="rounded border px-3 py-2 text-sm font-semibold"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleConfirmResult(
                                                                result.resultId
                                                            )
                                                        }
                                                        disabled={
                                                            result.status ===
                                                            'RefereeConfirmed' ||
                                                            saving ===
                                                            `confirm-${result.resultId}`
                                                        }
                                                        className="rounded bg-[#7d0000] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <FaCheck className="mr-1 inline" />
                                                        {saving ===
                                                            `confirm-${result.resultId}`
                                                            ? 'Confirming...'
                                                            : 'Confirm'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                    <div className={panelClass}>
                        <div className="border-b p-5">
                            <h2 className="flex items-center gap-2 text-2xl font-bold">
                                <FaGavel className="text-[#7d0000]" />
                                Violations
                            </h2>
                        </div>

                        <div className="divide-y">
                            {loadingRaceData ? (
                                <div className="p-5 text-gray-500">
                                    Loading violations...
                                </div>
                            ) : violations.length === 0 ? (
                                <div className="p-5 text-gray-500">
                                    No violations logged.
                                </div>
                            ) : (
                                violations.map((violation) => (
                                    <div
                                        key={violation.violationId}
                                        className="p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold">
                                                    {violation.violationType}
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-600">
                                                    {violation.horseName} -{' '}
                                                    {violation.description ||
                                                        'No description'}
                                                </p>
                                            </div>

                                            <span className="rounded bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                                {violation.action}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-xs text-gray-500">
                                            {formatDateTime(
                                                violation.createdAt
                                            )}{' '}
                                            - Penalty:{' '}
                                            {violation.penaltyPoints ?? 0}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className={panelClass}>
                        <div className="border-b p-5">
                            <h2 className="flex items-center gap-2 text-2xl font-bold">
                                <FaFileAlt className="text-[#7d0000]" />
                                Submitted Reports
                            </h2>
                        </div>

                        <div className="divide-y">
                            {loadingRaceData ? (
                                <div className="p-5 text-gray-500">
                                    Loading reports...
                                </div>
                            ) : reports.length === 0 ? (
                                <div className="p-5 text-gray-500">
                                    No referee reports submitted.
                                </div>
                            ) : (
                                reports.map((report) => (
                                    <div key={report.reportId} className="p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <h3 className="font-bold">
                                                Report #{report.reportId}
                                            </h3>

                                            <span className="text-xs text-gray-500">
                                                {formatDateTime(
                                                    report.submittedAt
                                                )}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-sm leading-6 text-gray-700">
                                            {report.reportContent}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </section>
        </RefereeLayout>
    );
}

export default AssignedPostRace;
