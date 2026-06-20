import { useEffect, useMemo, useState } from 'react';
import {
    FaCheck,
    FaClipboardList,
    FaFileAlt,
    FaGavel,
    FaMapMarkerAlt,
    FaTrophy,
} from 'react-icons/fa';

import {
    VIOLATION_ACTIONS,
    refereeApi,
} from '../../api/refereeApi';
import RefereeLayout from './RefereeLayout';

const panelClass = 'overflow-hidden rounded-2xl border border-[#ead3cf] bg-white';

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
    return Number(value);
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
        () => races.find((race) => race.raceId === selectedRaceId) ?? null,
        [races, selectedRaceId]
    );

    useEffect(() => {
        let ignore = false;

        async function loadRaces() {
            setLoadingRaces(true);
            setError('');

            try {
                const data = await refereeApi.getAssignedRaces();
                if (ignore) return;

                const nextRaces = data ?? [];
                setRaces(nextRaces);
                setSelectedRaceId((current) => current ?? nextRaces[0]?.raceId ?? null);
            } catch (err) {
                if (!ignore) setError(err.message || 'Failed to load assigned races.');
            } finally {
                if (!ignore) setLoadingRaces(false);
            }
        }

        loadRaces();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        if (!selectedRaceId) return undefined;

        let ignore = false;

        async function loadRaceData() {
            setLoadingRaceData(true);
            setError('');
            setSuccess('');

            try {
                const [registrationData, resultData, violationData, reportData] = await Promise.all([
                    refereeApi.getRaceRegistrations(selectedRaceId),
                    refereeApi.getRaceResults(selectedRaceId),
                    refereeApi.getViolations(selectedRaceId),
                    refereeApi.getRefereeReports(selectedRaceId),
                ]);

                if (ignore) return;

                const nextRegistrations = registrationData ?? [];
                const firstRegistrationId = nextRegistrations[0]?.registrationId ?? '';
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
                if (!ignore) setError(err.message || 'Failed to load race workflow data.');
            } finally {
                if (!ignore) setLoadingRaceData(false);
            }
        }

        loadRaceData();

        return () => {
            ignore = true;
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

    const handleSaveResult = async (event) => {
        event.preventDefault();
        if (!selectedRaceId || !resultForm.registrationId) return;

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
            registrationId: result.registrationId,
            finishTimeSeconds: result.finishTimeSeconds ?? '',
            finishPosition: result.finishPosition ?? '',
            score: result.score ?? '',
            note: result.note ?? '',
        });
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
        if (!selectedRaceId || !violationForm.registrationId) return;

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
            await refereeApi.createRefereeReport(selectedRaceId, reportContent.trim());
            await refreshReports();
            setReportContent('');
            setSuccess('Referee report submitted successfully.');
        } catch (err) {
            setError(err.message || 'Failed to submit report.');
        } finally {
            setSaving('');
        }
    };

    return (
        <RefereeLayout activeKey="assigned-races">
            <div className="space-y-8 p-8">
                <div>
                    <h1 className="text-5xl font-bold text-[#7d0000]">
                        Post-Race Workflow
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Submit results, confirm referee entries, file violations, and submit post-race reports.
                    </p>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-700">
                        {success}
                    </div>
                )}

                <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {loadingRaces ? (
                        <div className="rounded-2xl border border-[#ead3cf] bg-white p-6 text-gray-500">
                            Loading assigned races...
                        </div>
                    ) : races.length === 0 ? (
                        <div className="rounded-2xl border border-[#ead3cf] bg-white p-6 text-gray-500">
                            No assigned races from backend.
                        </div>
                    ) : (
                        races.map((race) => (
                            <button
                                type="button"
                                key={race.raceId}
                                onClick={() => setSelectedRaceId(race.raceId)}
                                className={`rounded-2xl border bg-white p-6 text-left transition ${selectedRaceId === race.raceId
                                    ? 'border-[#7d0000] shadow-md'
                                    : 'border-[#ead3cf]'
                                    }`}
                            >
                                <div className="flex justify-between">
                                    <span className="rounded-full bg-[#f7efee] px-3 py-1 text-xs font-semibold">
                                        {race.raceStatus}
                                    </span>
                                    <span className="font-bold">#{race.raceId}</span>
                                </div>

                                <h2 className="mt-5 text-3xl font-semibold">
                                    {race.raceName}
                                </h2>

                                <div className="mt-2 flex items-center gap-2 text-gray-500">
                                    <FaMapMarkerAlt />
                                    {race.location || 'N/A'}
                                </div>

                                <p className="mt-4 text-sm font-semibold text-gray-500">
                                    {formatDateTime(race.raceDate)} - {race.distanceMeters?.toLocaleString('en-US') ?? 0}m
                                </p>
                            </button>
                        ))
                    )}
                </section>

                <div className="grid gap-6 xl:grid-cols-3">
                    <form onSubmit={handleSaveResult} className={`${panelClass} p-6`}>
                        <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold text-[#2b1b1b]">
                            <FaTrophy className="text-[#7d0000]" />
                            Result Entry
                        </h2>

                        <div className="grid gap-4">
                            <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                Registration
                                <select
                                    value={resultForm.registrationId}
                                    onChange={(event) => handleResultChange('registrationId', event.target.value)}
                                    required
                                    className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                >
                                    {registrations.map((registration) => (
                                        <option key={registration.registrationId} value={registration.registrationId}>
                                            {registration.horseName} - #{registration.registrationId}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                    Finish Position
                                    <input
                                        type="number"
                                        min="1"
                                        value={resultForm.finishPosition}
                                        onChange={(event) => handleResultChange('finishPosition', event.target.value)}
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
                                        onChange={(event) => handleResultChange('finishTimeSeconds', event.target.value)}
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
                                    onChange={(event) => handleResultChange('score', event.target.value)}
                                    className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                />
                            </label>

                            <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                Note
                                <textarea
                                    value={resultForm.note}
                                    onChange={(event) => handleResultChange('note', event.target.value)}
                                    rows={3}
                                    className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={saving === 'result' || registrations.length === 0}
                                className="rounded bg-[#7d0000] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving === 'result' ? 'Saving...' : 'Save Result'}
                            </button>
                        </div>
                    </form>

                    <form onSubmit={handleCreateViolation} className={`${panelClass} p-6`}>
                        <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold text-[#2b1b1b]">
                            <FaGavel className="text-[#7d0000]" />
                            Violation
                        </h2>

                        <div className="grid gap-4">
                            <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                Registration
                                <select
                                    value={violationForm.registrationId}
                                    onChange={(event) => handleViolationChange('registrationId', event.target.value)}
                                    required
                                    className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                >
                                    {registrations.map((registration) => (
                                        <option key={registration.registrationId} value={registration.registrationId}>
                                            {registration.horseName} - #{registration.registrationId}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                Violation Type
                                <input
                                    type="text"
                                    value={violationForm.violationType}
                                    onChange={(event) => handleViolationChange('violationType', event.target.value)}
                                    required
                                    className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                />
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                    Action
                                    <select
                                        value={violationForm.action}
                                        onChange={(event) => handleViolationChange('action', event.target.value)}
                                        className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                    >
                                        <option value={VIOLATION_ACTIONS.warning}>Warning</option>
                                        <option value={VIOLATION_ACTIONS.pointDeduction}>Point Deduction</option>
                                        <option value={VIOLATION_ACTIONS.disqualified}>Disqualified</option>
                                    </select>
                                </label>

                                <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                    Penalty Points
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={violationForm.penaltyPoints}
                                        onChange={(event) => handleViolationChange('penaltyPoints', event.target.value)}
                                        className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                    />
                                </label>
                            </div>

                            <label className="grid gap-2 text-sm font-semibold text-gray-600">
                                Description
                                <textarea
                                    value={violationForm.description}
                                    onChange={(event) => handleViolationChange('description', event.target.value)}
                                    rows={3}
                                    className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={saving === 'violation' || registrations.length === 0}
                                className="rounded bg-[#7d0000] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving === 'violation' ? 'Creating...' : 'Create Violation'}
                            </button>
                        </div>
                    </form>

                    <form onSubmit={handleCreateReport} className={`${panelClass} p-6`}>
                        <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold text-[#2b1b1b]">
                            <FaFileAlt className="text-[#7d0000]" />
                            Referee Report
                        </h2>

                        <label className="grid gap-2 text-sm font-semibold text-gray-600">
                            Report Content
                            <textarea
                                value={reportContent}
                                onChange={(event) => setReportContent(event.target.value)}
                                rows={11}
                                required
                                className="rounded border border-[#ead3cf] px-3 py-3 outline-none focus:border-[#7d0000]"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={saving === 'report' || !reportContent.trim()}
                            className="mt-4 rounded bg-[#7d0000] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving === 'report' ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </form>
                </div>

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
                                    <th className="p-4">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingRaceData ? (
                                    <tr>
                                        <td className="p-6 text-center text-gray-500" colSpan={6}>
                                            Loading race data...
                                        </td>
                                    </tr>
                                ) : results.length === 0 ? (
                                    <tr>
                                        <td className="p-6 text-center text-gray-500" colSpan={6}>
                                            No results submitted yet.
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((result) => (
                                        <tr key={result.resultId} className="border-t">
                                            <td className="p-4 font-semibold">{result.horseName}</td>
                                            <td className="p-4">{result.finishPosition ?? '-'}</td>
                                            <td className="p-4">{result.finishTimeSeconds ?? '-'}s</td>
                                            <td className="p-4">{result.score ?? '-'}</td>
                                            <td className="p-4">
                                                <span className="rounded bg-[#f7efee] px-3 py-1 text-xs font-bold text-[#7d0000]">
                                                    {result.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditResult(result)}
                                                        className="rounded border px-3 py-2 text-sm font-semibold"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleConfirmResult(result.resultId)}
                                                        disabled={result.status === 'RefereeConfirmed' || saving === `confirm-${result.resultId}`}
                                                        className="rounded bg-[#7d0000] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <FaCheck className="mr-1 inline" />
                                                        {saving === `confirm-${result.resultId}` ? 'Confirming...' : 'Confirm'}
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
                            <h2 className="text-2xl font-bold">Violations</h2>
                        </div>
                        <div className="divide-y">
                            {violations.length === 0 ? (
                                <div className="p-5 text-gray-500">No violations logged.</div>
                            ) : (
                                violations.map((violation) => (
                                    <div key={violation.violationId} className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold">{violation.violationType}</h3>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {violation.horseName} - {violation.description || 'No description'}
                                                </p>
                                            </div>
                                            <span className="rounded bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                                {violation.action}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-xs text-gray-500">
                                            {formatDateTime(violation.createdAt)} - Penalty: {violation.penaltyPoints ?? 0}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className={panelClass}>
                        <div className="border-b p-5">
                            <h2 className="text-2xl font-bold">Submitted Reports</h2>
                        </div>
                        <div className="divide-y">
                            {reports.length === 0 ? (
                                <div className="p-5 text-gray-500">No referee reports submitted.</div>
                            ) : (
                                reports.map((report) => (
                                    <div key={report.reportId} className="p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <h3 className="font-bold">Report #{report.reportId}</h3>
                                            <span className="text-xs text-gray-500">
                                                {formatDateTime(report.submittedAt)}
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
            </div>
        </RefereeLayout>
    );
}

export default AssignedPostRace;
