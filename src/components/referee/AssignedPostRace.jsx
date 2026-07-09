import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    FaCheck,
    FaClipboardList,
    FaEdit,
    FaExclamationTriangle,
    FaGavel,
    FaMapMarkerAlt,
    FaRedo,
    FaTimes,
    FaTrash,
    FaTrophy,
} from 'react-icons/fa';

import {
    VIOLATION_ACTIONS,
    refereeApi,
} from '../../api/refereeApi';
import RefereeLayout from './RefereeLayout';
import Toast, { useToast } from '../shared/Toast';

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
    'False Start', 'Track Interference', 'Dangerous Riding',
    'Improper Equipment', 'Unsportsmanlike Conduct', 'Whip Misuse',
    'Health / Doping Issue', 'Other',
];

const TABS = [
    { key: 'results',    icon: FaTrophy,      label: 'Results' },
    { key: 'violations', icon: FaGavel,        label: 'Violations' },
];

function formatDateTime(value) {
    if (!value) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
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
    const jockeyLabel = registration.jockeyName ? `Jockey ${registration.jockeyName}` : 'No jockey';
    return `${horseName} — ${jockeyLabel}`;
}

function getOwnerLabel(registration) {
    if (registration?.ownerName) return registration.ownerName;
    return registration?.ownerId ? `#${registration.ownerId}` : 'N/A';
}

function getStatusClass(status) {
    if (['RefereeConfirmed', 'AdminApproved', 'Published'].includes(status)) return 'bg-green-100 text-green-700';
    if (status === 'Returned') return 'bg-red-100 text-red-700';
    return 'bg-[#e8f7ef] text-[#0b7f5a]';
}

const inputClass = "rounded border border-[#dce5ef] px-3 py-2.5 text-sm outline-none focus:border-[#0b7f5a] w-full";
const labelClass = "block text-xs font-bold text-[#64748b] uppercase mb-1.5";
const primaryBtn = "rounded bg-[#0b7f5a] px-5 py-2.5 font-semibold text-white text-sm disabled:cursor-not-allowed disabled:opacity-60 w-full";
const confirmToneClass = {
    primary: 'bg-[#0b7f5a] hover:bg-[#09664a]',
    danger: 'bg-[#b91c1c] hover:bg-[#991b1b]',
};

function AssignedPostRace() {
    const location = useLocation();

    const [races, setRaces] = useState([]);
    const [selectedRaceId, setSelectedRaceId] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [results, setResults] = useState([]);
    const [violations, setViolations] = useState([]);
    const [activeTab, setActiveTab] = useState('results');

    const [resultForm, setResultForm] = useState(emptyResultForm);
    const [editingResultId, setEditingResultId] = useState('');
    const [violationForm, setViolationForm] = useState(emptyViolationForm);
    const [editingViolationId, setEditingViolationId] = useState('');

    const [loadingRaces, setLoadingRaces] = useState(true);
    const [loadingRaceData, setLoadingRaceData] = useState(false);
    const [saving, setSaving] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmRequest, setConfirmRequest] = useState(null);
    const { toast, showToast, hideToast } = useToast();

    const selectedRace = useMemo(
        () => races.find((race) => String(race.raceId) === String(selectedRaceId)) ?? null,
        [races, selectedRaceId]
    );

    const registrationById = useMemo(() => {
        const map = new Map();
        registrations.forEach((r) => map.set(String(r.registrationId), r));
        return map;
    }, [registrations]);

    const selectedResultRegistration = registrationById.get(String(resultForm.registrationId));
    const selectedViolationRegistration = registrationById.get(String(violationForm.registrationId));
    const isEditingResult = Boolean(editingResultId);
    const isEditingViolation = Boolean(editingViolationId);

    const canFinishRace =
        selectedRace?.allowedActions?.canFinishRace ||
        selectedRace?.raceStatus === 'Ongoing';

    const canEnterResults =
        selectedRace?.allowedActions?.canEnterResults ||
        selectedRace?.raceStatus === 'Finished';

    const draftResultCount = results.filter((result) => result.status === 'Draft').length;
    const confirmedResultCount = results.filter((result) => result.status === 'RefereeConfirmed').length;
    const submitReportDisabled =
        saving === 'submit-report' ||
        loadingRaceData ||
        !selectedRaceId ||
        !canEnterResults ||
        results.length === 0 ||
        draftResultCount === 0;

    const submitReportHint = !selectedRaceId
        ? 'Select a race before submitting.'
        : selectedRace?.raceStatus === 'ResultPending'
            ? 'Post-race report has already been sent to admin.'
            : !canEnterResults
                ? `Race must be Finished before submission. Current status: ${selectedRace?.raceStatus || 'N/A'}.`
                : results.length === 0
                    ? 'Save race results before submitting.'
                    : draftResultCount === 0
                        ? 'No draft results waiting for submission.'
                        : `${draftResultCount} draft result${draftResultCount === 1 ? '' : 's'} ready to submit.`;

    async function loadAssignedRaces(ignoreRef = { current: false }) {
        setLoadingRaces(true);
        setError('');
        try {
            const data = await refereeApi.getAssignedRaces();
            if (ignoreRef.current) return;
            const nextRaces = (data ?? []).filter((r) =>
                r.raceStatus === 'Ongoing' ||
                r.raceStatus === 'Finished' ||
                r.raceStatus === 'ResultPending'
            );
            setRaces(nextRaces);
            setSelectedRaceId((current) => {
                if (current) return current;
                const fromNav = location.state?.raceId;
                if (fromNav) return fromNav;
                return nextRaces[0]?.raceId ?? null;
            });
        } catch (err) {
            if (!ignoreRef.current) setError(err.message || 'Failed to load races.');
        } finally {
            if (!ignoreRef.current) setLoadingRaces(false);
        }
    }

    async function loadRaceWorkflowData(raceId, ignoreRef = { current: false }) {
        if (!raceId) return;
        setLoadingRaceData(true);
        setError('');
        setSuccess('');
        try {
            const [registrationData, resultData, violationData] = await Promise.all([
                refereeApi.getRaceRegistrations(raceId),
                refereeApi.getRaceResults(raceId),
                refereeApi.getViolations(raceId),
            ]);
            if (ignoreRef.current) return;
            const nextRegistrations = registrationData ?? [];
            const firstId = nextRegistrations[0]?.registrationId ? String(nextRegistrations[0].registrationId) : '';
            setRegistrations(nextRegistrations);
            setResults(resultData ?? []);
            setViolations(violationData ?? []);
            setResultForm({ ...emptyResultForm, registrationId: firstId });
            setEditingResultId('');
            setViolationForm({ ...emptyViolationForm, registrationId: firstId });
            setEditingViolationId('');
        } catch (err) {
            if (!ignoreRef.current) setError(err.message || 'Failed to load race data.');
        } finally {
            if (!ignoreRef.current) setLoadingRaceData(false);
        }
    }

    useEffect(() => {
        const ignoreRef = { current: false };
        loadAssignedRaces(ignoreRef);
        return () => { ignoreRef.current = true; };
    }, []);

    useEffect(() => {
        if (!selectedRaceId) return undefined;
        const ignoreRef = { current: false };
        loadRaceWorkflowData(selectedRaceId, ignoreRef);
        return () => { ignoreRef.current = true; };
    }, [selectedRaceId]);

    const refreshResults = async () => { if (selectedRaceId) setResults(await refereeApi.getRaceResults(selectedRaceId) ?? []); };
    const refreshViolations = async () => { if (selectedRaceId) setViolations(await refereeApi.getViolations(selectedRaceId) ?? []); };

    const requestViolationConfirm = (options) => new Promise((resolve) => {
        setConfirmRequest({
            title: options.title,
            message: options.message,
            confirmLabel: options.confirmLabel,
            cancelLabel: options.cancelLabel || 'Cancel',
            tone: options.tone || 'primary',
            resolve,
        });
    });

    const resolveConfirmRequest = (value) => {
        confirmRequest?.resolve?.(value);
        setConfirmRequest(null);
    };

    const validateResultForm = () => {
        if (!selectedRaceId) return 'Select a race first.';
        if (!canEnterResults) return 'Race must be Finished before entering results.';
        if (!resultForm.registrationId) return 'Select a registration.';
        const hasValue = resultForm.finishPosition !== '' || resultForm.finishTimeSeconds !== '' || resultForm.score !== '';
        if (!hasValue) return 'Enter finish position, time, or score.';
        const pos = nullableNumber(resultForm.finishPosition);
        if (resultForm.finishPosition !== '' && (!Number.isInteger(pos) || pos < 1)) return 'Finish position must be a positive whole number.';
        const time = nullableNumber(resultForm.finishTimeSeconds);
        if (resultForm.finishTimeSeconds !== '' && (time === null || time < 0)) return 'Finish time must be ≥ 0.';
        const score = nullableNumber(resultForm.score);
        if (resultForm.score !== '' && (score === null || score < 0)) return 'Score must be ≥ 0.';
        return '';
    };

    const validateViolationForm = () => {
        if (!selectedRaceId) return 'Select a race first.';
        if (!violationForm.registrationId) return 'Select a registration.';
        if (!violationForm.violationType.trim()) return 'Violation type is required.';
        const pts = nullableNumber(violationForm.penaltyPoints);
        if (violationForm.penaltyPoints !== '' && (pts === null || pts < 0)) return 'Penalty points must be ≥ 0.';
        if (violationForm.action === VIOLATION_ACTIONS.pointDeduction && (!pts || pts <= 0)) return 'Point deduction requires penalty points > 0.';
        return '';
    };

    const handleFinishRace = async () => {
        if (!selectedRaceId) return;
        setSaving('finish');
        setError('');
        setSuccess('');
        try {
            const updatedLifecycle = await refereeApi.finishRace(selectedRaceId);
            setRaces((prev) =>
                prev.map((race) =>
                    String(race.raceId) === String(selectedRaceId)
                        ? {
                            ...race,
                            raceStatus: updatedLifecycle?.raceStatus || 'Finished',
                            currentStage: updatedLifecycle?.currentStage,
                            nextStage: updatedLifecycle?.nextStage,
                            allowedActions: updatedLifecycle?.allowedActions,
                        }
                        : race
                )
            );
            await loadRaceWorkflowData(selectedRaceId);
            setSuccess('Race marked as Finished. You can now enter results.');
        } catch (err) {
            setError(err.message || 'Failed to finish race.');
        } finally {
            setSaving('');
        }
    };

    const handleSaveResult = async (e) => {
        e.preventDefault();
        const msg = validateResultForm();
        if (msg) { setError(msg); setSuccess(''); return; }
        setSaving('result'); setError(''); setSuccess('');
        try {
            await refereeApi.saveRaceResult(selectedRaceId, {
                registrationId: Number(resultForm.registrationId),
                finishTimeSeconds: nullableNumber(resultForm.finishTimeSeconds),
                finishPosition: nullableNumber(resultForm.finishPosition),
                score: nullableNumber(resultForm.score),
                note: resultForm.note?.trim() || null,
            });
            await refreshResults();
            setResultForm((p) => ({ ...emptyResultForm, registrationId: p.registrationId }));
            setEditingResultId('');
            setSuccess(isEditingResult
                ? 'Result draft changes saved. Submit the post-race report to send it to admin.'
                : 'Result saved as draft. Submit the post-race report to send it to admin.'
            );
        } catch (err) {
            setError(err.message || 'Failed to save result.');
        } finally { setSaving(''); }
    };

    const handleEditResult = (result) => {
        setEditingResultId(String(result.resultId || result.registrationId || ''));
        setResultForm({
            registrationId: String(result.registrationId),
            finishTimeSeconds: result.finishTimeSeconds ?? '',
            finishPosition: result.finishPosition ?? '',
            score: result.score ?? '',
            note: result.note ?? '',
        });
        setSuccess('Editing result — update fields and save.');
        setError('');
    };

    const handleSaveViolation = async (e) => {
        e.preventDefault();
        const msg = validateViolationForm();
        if (msg) { setError(msg); setSuccess(''); return; }

        if (isEditingViolation) {
            const confirmed = await requestViolationConfirm({
                title: 'Update violation',
                message: 'Are you sure you want to update this violation?',
                confirmLabel: 'Update',
                tone: 'primary',
            });
            if (!confirmed) return;
        }

        setSaving('violation'); setError(''); setSuccess('');
        const payload = {
            registrationId: Number(violationForm.registrationId),
            violationType: violationForm.violationType.trim(),
            description: violationForm.description?.trim() || null,
            action: violationForm.action,
            penaltyPoints: nullableNumber(violationForm.penaltyPoints),
        };
        try {
            if (isEditingViolation) {
                await refereeApi.updateViolation(selectedRaceId, editingViolationId, payload);
            } else {
                await refereeApi.createViolation(selectedRaceId, payload);
            }
            await refreshViolations();
            setViolationForm((p) => ({ ...emptyViolationForm, registrationId: p.registrationId }));
            setEditingViolationId('');
            const successMessage = isEditingViolation ? 'Violation updated successfully.' : 'Violation created.';
            setSuccess(successMessage);
            if (isEditingViolation) {
                showToast(successMessage, 'success', 'Updated');
            }
        } catch (err) {
            setError(err.message || (isEditingViolation ? 'Failed to update violation.' : 'Failed to create violation.'));
        } finally { setSaving(''); }
    };

    const handleEditViolation = (violation) => {
        setEditingViolationId(String(violation.violationId || ''));
        setViolationForm({
            registrationId: String(violation.registrationId || ''),
            violationType: violation.violationType ?? '',
            description: violation.description ?? '',
            action: violation.action ?? VIOLATION_ACTIONS.warning,
            penaltyPoints: violation.penaltyPoints ?? '',
        });
        setSuccess('Editing violation - update fields and save.');
        setError('');
    };

    const handleCancelViolationEdit = () => {
        setViolationForm((p) => ({ ...emptyViolationForm, registrationId: p.registrationId }));
        setEditingViolationId('');
        setError('');
        setSuccess('');
    };

    const handleDeleteViolation = async (violation) => {
        if (!selectedRaceId || !violation?.violationId) return;
        const confirmed = await requestViolationConfirm({
            title: 'Delete violation',
            message: 'Are you sure you want to delete this violation?',
            confirmLabel: 'Delete',
            tone: 'danger',
        });
        if (!confirmed) return;

        const savingKey = `delete-violation-${violation.violationId}`;
        setSaving(savingKey);
        setError('');
        setSuccess('');
        try {
            await refereeApi.deleteViolation(selectedRaceId, violation.violationId);
            await refreshViolations();
            if (String(editingViolationId) === String(violation.violationId)) {
                setViolationForm((p) => ({ ...emptyViolationForm, registrationId: p.registrationId }));
                setEditingViolationId('');
            }
            const successMessage = 'Violation deleted successfully.';
            setSuccess(successMessage);
            showToast(successMessage, 'success', 'Deleted');
        } catch (err) {
            setError(err.message || 'Failed to delete violation.');
        } finally {
            setSaving('');
        }
    };

    const handleSubmitPostRaceReport = async () => {
        if (!selectedRaceId) return;
        if (results.length === 0) {
            setError('Save race results before submitting.');
            setSuccess('');
            return;
        }

        setSaving('submit-report'); setError(''); setSuccess('');
        try {
            const updatedLifecycle = await refereeApi.confirmAllRaceResults(selectedRaceId);
            setRaces((prev) =>
                prev.map((race) =>
                    String(race.raceId) === String(selectedRaceId)
                        ? {
                            ...race,
                            raceStatus: updatedLifecycle?.raceStatus || 'ResultPending',
                            currentStage: updatedLifecycle?.currentStage,
                            nextStage: updatedLifecycle?.nextStage,
                            allowedActions: updatedLifecycle?.allowedActions,
                        }
                        : race
                )
            );
            await loadRaceWorkflowData(selectedRaceId);
            setActiveTab('results');
            setSuccess(`Post-race report submitted to admin with ${results.length} result${results.length === 1 ? '' : 's'} and ${violations.length} violation${violations.length === 1 ? '' : 's'}.`);
        } catch (err) {
            setError(err.message || 'Failed to submit post-race report.');
        } finally { setSaving(''); }
    };

    return (
        <RefereeLayout activeKey="post-race">
            <section className="page-shell">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 className="page-title">Post-Race Workflow</h1>
                        <p className="page-subtitle">Enter results, log violations, and submit the post-race report to admin.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => loadRaceWorkflowData(selectedRaceId)}
                        disabled={!selectedRaceId || loadingRaceData}
                        className="secondary-button gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FaRedo /> Refresh
                    </button>
                </div>

                {/* Alerts */}
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

                {selectedRace?.raceStatus === 'Ongoing' && (
                    <div className="rounded-[8px] border border-yellow-200 bg-yellow-50 px-5 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="font-semibold text-yellow-800">
                                Race is currently <strong>Ongoing</strong>. Finish the race before entering results.
                            </div>
                            <button
                                type="button"
                                onClick={handleFinishRace}
                                disabled={!canFinishRace || saving === 'finish'}
                                className="rounded bg-[#0b7f5a] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving === 'finish' ? 'Finishing...' : 'Finish Race'}
                            </button>
                        </div>
                    </div>
                )}

                {selectedRace?.raceStatus === 'ResultPending' && activeTab === 'results' && (
                    <div className="rounded-[8px] border border-blue-200 bg-blue-50 px-5 py-4 font-semibold text-blue-700">
                        Post-race report has already been sent to admin. Current status: <strong>{selectedRace.raceStatus}</strong>
                    </div>
                )}

                {/* ── Race selector ── */}
                <div className="surface-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Race</span>
                        {loadingRaces && <span style={{ fontSize: 12, color: '#999' }}>Loading...</span>}
                    </div>

                    <div style={{ display: 'flex', gap: 0, overflowX: 'auto', padding: '12px 16px', flexWrap: 'nowrap' }}>
                        {races.length === 0 && !loadingRaces && (
                            <span style={{ fontSize: 13, color: '#999', padding: '8px 0' }}>No assigned races.</span>
                        )}
                        {races.map((race) => {
                            const isSelected = String(selectedRaceId) === String(race.raceId);
                            return (
                                <button
                                    type="button"
                                    key={race.raceId}
                                    onClick={() => { setSelectedRaceId(race.raceId); setError(''); setSuccess(''); }}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                        padding: '10px 16px', marginRight: 8, borderRadius: 10, cursor: 'pointer',
                                        border: isSelected ? '2px solid #0b7f5a' : '1px solid #dce5ef',
                                        background: isSelected ? '#f8fbff' : '#fff',
                                        flexShrink: 0, minWidth: 180, textAlign: 'left',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <span style={{ fontWeight: 700, fontSize: 13, color: isSelected ? '#0b7f5a' : '#2b1b1b', lineHeight: 1.3 }}>
                                        {race.raceName}
                                    </span>
                                    <span style={{ fontSize: 11, color: '#999', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <FaMapMarkerAlt /> {race.location || 'N/A'}
                                    </span>
                                    <span style={{ fontSize: 11, color: isSelected ? '#0b7f5a' : '#aaa', marginTop: 2, fontWeight: 600 }}>
                                        {race.raceStatus}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* No registrations warning */}
                {registrations.length === 0 && !loadingRaceData && selectedRaceId && (
                    <div className="flex items-start gap-3 rounded-[8px] border border-yellow-200 bg-yellow-50 p-5 text-yellow-800">
                        <FaExclamationTriangle className="mt-1" />
                        <div>
                            <div className="font-bold">No registrations for this race.</div>
                            <p className="mt-1 text-sm">Result entry and violation creation require at least one registration.</p>
                        </div>
                    </div>
                )}

                {/* ── Tab bar ── */}
                <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #dce5ef' }}>
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const count = tab.key === 'results' ? results.length
                            : violations.length;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => { setActiveTab(tab.key); setError(''); setSuccess(''); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderBottom: isActive ? '2px solid #0b7f5a' : '2px solid transparent',
                                    marginBottom: -2,
                                    background: 'transparent',
                                    fontWeight: isActive ? 800 : 600,
                                    color: isActive ? '#0b7f5a' : '#64748b',
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <Icon />
                                {tab.label}
                                <span style={{
                                    fontSize: 11, fontWeight: 700,
                                    backgroundColor: isActive ? '#0b7f5a' : '#dce5ef',
                                    color: isActive ? '#fff' : '#64748b',
                                    borderRadius: 20, padding: '1px 7px', marginLeft: 2,
                                }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {loadingRaceData && (
                    <div className="surface-card p-6 text-center font-semibold text-[var(--admin-muted)]">
                        Loading race data...
                    </div>
                )}

                {/* ── RESULTS TAB ── */}
                {!loadingRaceData && activeTab === 'results' && (
                    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                        {/* Form */}
                        <form onSubmit={handleSaveResult} className="surface-card" style={{ padding: 24 }}>
                            <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 800, color: '#2b1b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FaTrophy style={{ color: '#0b7f5a' }} /> Result Entry
                            </h2>

                            {selectedRace && (
                                <div style={{ background: '#faf6f5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#64748b' }}>
                                    Race: <strong style={{ color: '#0b7f5a' }}>{selectedRace.raceName}</strong>
                                </div>
                            )}

                            <div style={{ display: 'grid', gap: 14 }}>
                                <div>
                                    <label className={labelClass}>Registration</label>
                                    <select
                                        value={resultForm.registrationId}
                                        onChange={(e) => setResultForm((p) => ({ ...p, registrationId: e.target.value }))}
                                        required
                                        disabled={loadingRaceData || registrations.length === 0}
                                        className={inputClass}
                                    >
                                        <option value="" disabled>
                                            {registrations.length === 0 ? 'No registrations' : 'Select registration'}
                                        </option>
                                        {registrations.map((r) => (
                                            <option key={r.registrationId} value={String(r.registrationId)}>
                                                {getRegistrationLabel(r)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedResultRegistration && (
                                    <div style={{ background: '#fff8f6', border: '1px solid #dce5ef', borderRadius: 8, padding: 12, fontSize: 13 }}>
                                        <strong style={{ color: '#2b1b1b' }}>{selectedResultRegistration.horseName}</strong>
                                        <div style={{ color: '#64748b', marginTop: 2 }}>
                                            Status: {selectedResultRegistration.status || 'N/A'} · Owner {getOwnerLabel(selectedResultRegistration)} · Jockey {selectedResultRegistration.jockeyName || 'N/A'}
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label className={labelClass}>Finish Position</label>
                                        <input type="number" min="1" step="1" value={resultForm.finishPosition}
                                            onChange={(e) => setResultForm((p) => ({ ...p, finishPosition: e.target.value }))}
                                            placeholder="e.g. 1" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Time (seconds)</label>
                                        <input type="number" step="0.01" min="0" value={resultForm.finishTimeSeconds}
                                            onChange={(e) => setResultForm((p) => ({ ...p, finishTimeSeconds: e.target.value }))}
                                            placeholder="e.g. 92.45" className={inputClass} />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Score</label>
                                    <input type="number" step="0.01" min="0" value={resultForm.score}
                                        onChange={(e) => setResultForm((p) => ({ ...p, score: e.target.value }))}
                                        placeholder="Optional" className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Note</label>
                                    <textarea value={resultForm.note} rows={3}
                                        onChange={(e) => setResultForm((p) => ({ ...p, note: e.target.value }))}
                                        placeholder="Result note" className={inputClass} />
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving === 'result' || loadingRaceData || registrations.length === 0 || !canEnterResults}
                                    className={primaryBtn}
                                >
                                    {saving === 'result' ? 'Saving...' : isEditingResult ? 'Save Change' : 'Save Result'}
                                </button>
                            </div>
                        </form>

                        {/* Results table */}
                        <div className="surface-card" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #dce5ef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FaClipboardList style={{ color: '#0b7f5a' }} /> Results
                                </h2>
                                <span style={{ fontSize: 12, color: '#999' }}>{selectedRace?.raceName || 'Select a race'}</span>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                                    <thead>
                                        <tr style={{ background: '#faf6f5' }}>
                                            {['Horse', 'Position', 'Time', 'Score', 'Status', 'Note', 'Action'].map(h => (
                                                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.length === 0 ? (
                                            <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#999' }}>No results submitted yet.</td></tr>
                                        ) : results.map((result) => (
                                            <tr key={result.resultId} style={{ borderTop: '1px solid #f5f5f5' }}>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{result.horseName}</div>
                                                    <div style={{ fontSize: 11, color: '#999' }}>REG #{result.registrationId}</div>
                                                </td>
                                                <td style={{ padding: '12px 14px', fontSize: 13 }}>{result.finishPosition ?? '-'}</td>
                                                <td style={{ padding: '12px 14px', fontSize: 13 }}>{formatSeconds(result.finishTimeSeconds)}</td>
                                                <td style={{ padding: '12px 14px', fontSize: 13 }}>{result.score ?? '-'}</td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <span className={`rounded px-3 py-1 text-xs font-bold ${getStatusClass(result.status)}`}>{result.status}</span>
                                                </td>
                                                <td style={{ padding: '12px 14px', fontSize: 12, color: '#64748b', maxWidth: 160 }}>{result.note || '-'}</td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button type="button" onClick={() => handleEditResult(result)}
                                                            style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #dce5ef', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── VIOLATIONS TAB ── */}
                {!loadingRaceData && activeTab === 'violations' && (
                    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                        {/* Form */}
                        <form onSubmit={handleSaveViolation} className="surface-card" style={{ padding: 24 }}>
                            <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 800, color: '#2b1b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FaGavel style={{ color: '#0b7f5a' }} /> {isEditingViolation ? 'Edit Violation' : 'Log Violation'}
                            </h2>

                            {selectedRace && (
                                <div style={{ background: '#faf6f5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#64748b' }}>
                                    Race: <strong style={{ color: '#0b7f5a' }}>{selectedRace.raceName}</strong>
                                </div>
                            )}

                            <div style={{ display: 'grid', gap: 14 }}>
                                <div>
                                    <label className={labelClass}>Registration</label>
                                    <select value={violationForm.registrationId}
                                        onChange={(e) => setViolationForm((p) => ({ ...p, registrationId: e.target.value }))}
                                        required disabled={loadingRaceData || registrations.length === 0}
                                        className={inputClass}>
                                        <option value="" disabled>
                                            {registrations.length === 0 ? 'No registrations' : 'Select registration'}
                                        </option>
                                        {registrations.map((r) => (
                                            <option key={r.registrationId} value={String(r.registrationId)}>
                                                {getRegistrationLabel(r)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedViolationRegistration && (
                                    <div style={{ background: '#fff8f6', border: '1px solid #dce5ef', borderRadius: 8, padding: 12, fontSize: 13 }}>
                                        <strong style={{ color: '#2b1b1b' }}>{selectedViolationRegistration.horseName}</strong>
                                        <div style={{ color: '#64748b', marginTop: 2 }}>
                                            Status: {selectedViolationRegistration.status || 'N/A'}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className={labelClass}>Violation Type</label>
                                    <select value={violationForm.violationType}
                                        onChange={(e) => setViolationForm((p) => ({ ...p, violationType: e.target.value }))}
                                        required className={inputClass}>
                                        <option value="" disabled>Select type</option>
                                        {violationTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label className={labelClass}>Action</label>
                                        <select value={violationForm.action}
                                            onChange={(e) => setViolationForm((p) => ({ ...p, action: e.target.value }))}
                                            className={inputClass}>
                                            <option value={VIOLATION_ACTIONS.warning}>Warning</option>
                                            <option value={VIOLATION_ACTIONS.pointDeduction}>Point Deduction</option>
                                            <option value={VIOLATION_ACTIONS.disqualified}>Disqualified</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Penalty Points</label>
                                        <input type="number" step="0.01" min="0" value={violationForm.penaltyPoints}
                                            onChange={(e) => setViolationForm((p) => ({ ...p, penaltyPoints: e.target.value }))}
                                            placeholder={violationForm.action === VIOLATION_ACTIONS.pointDeduction ? 'Required' : 'Optional'}
                                            className={inputClass} />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Description</label>
                                    <textarea value={violationForm.description} rows={3}
                                        onChange={(e) => setViolationForm((p) => ({ ...p, description: e.target.value }))}
                                        placeholder="Describe what happened" className={inputClass} />
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="submit" disabled={saving === 'violation' || loadingRaceData || registrations.length === 0} className={primaryBtn}>
                                        {saving === 'violation' ? 'Saving...' : isEditingViolation ? 'Update Violation' : 'Create Violation'}
                                    </button>
                                    {isEditingViolation && (
                                        <button
                                            type="button"
                                            onClick={handleCancelViolationEdit}
                                            title="Cancel edit"
                                            aria-label="Cancel edit"
                                            disabled={saving === 'violation'}
                                            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded border border-[#dce5ef] bg-white text-[#64748b] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>

                        {/* Violations list */}
                        <div className="surface-card" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #dce5ef' }}>
                                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FaGavel style={{ color: '#0b7f5a' }} /> Logged Violations
                                </h2>
                            </div>
                            <div>
                                {violations.length === 0 ? (
                                    <div style={{ padding: 24, textAlign: 'center', color: '#999', fontSize: 13 }}>No violations logged.</div>
                                ) : violations.map((v) => (
                                    <div key={v.violationId} style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: '#2b1b1b' }}>{v.violationType}</div>
                                                <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
                                                    {v.horseName} — {v.description || 'No description'}
                                                </div>
                                                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                                                    {formatDateTime(v.createdAt)} · Penalty: {v.penaltyPoints ?? 0} pts
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                                <span style={{ background: '#fde8e8', color: '#b91c1c', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>
                                                    {v.action}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditViolation(v)}
                                                    title="Edit violation"
                                                    aria-label="Edit violation"
                                                    disabled={loadingRaceData || Boolean(saving)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#dce5ef] bg-white text-[#0b7f5a] disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteViolation(v)}
                                                    title="Delete violation"
                                                    aria-label="Delete violation"
                                                    disabled={loadingRaceData || Boolean(saving)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-200 bg-white text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Final submit */}
                {!loadingRaceData && selectedRaceId && (
                    <section className="surface-card" style={{ padding: 22 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#2b1b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FaClipboardList style={{ color: '#0b7f5a' }} /> Submit Post-Race Report
                                </h2>
                                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13, fontWeight: 600 }}>
                                    {submitReportHint}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ border: '1px solid #dce5ef', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 800, color: '#0b7f5a', background: '#f8fbff' }}>
                                    Results: {results.length}
                                </span>
                                <span style={{ border: '1px solid #dce5ef', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 800, color: '#0b7f5a', background: '#f8fbff' }}>
                                    Draft: {draftResultCount}
                                </span>
                                <span style={{ border: '1px solid #dce5ef', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 800, color: '#0b7f5a', background: '#f8fbff' }}>
                                    Confirmed: {confirmedResultCount}
                                </span>
                                <span style={{ border: '1px solid #dce5ef', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 800, color: '#0b7f5a', background: '#f8fbff' }}>
                                    Violations: {violations.length}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmitPostRaceReport}
                            disabled={submitReportDisabled}
                            className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded bg-[#0b7f5a] px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <FaCheck />
                            {saving === 'submit-report' ? 'Submitting...' : 'Submit Report to Admin'}
                        </button>
                    </section>
                )}
            </section>

            {confirmRequest && (
                <div
                    aria-modal="true"
                    className="fixed inset-0 z-[10000] grid place-items-center bg-[rgba(15,23,42,0.42)] px-5 py-8"
                    onClick={() => resolveConfirmRequest(false)}
                    role="dialog"
                >
                    <section
                        className="grid w-[min(440px,100%)] gap-5 rounded-[8px] border border-[#dce5ef] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="grid gap-2">
                            <h2 className="m-0 text-[1.15rem] font-black text-[#2b1b1b]">
                                {confirmRequest.title}
                            </h2>
                            <p className="m-0 text-[0.92rem] font-semibold leading-6 text-[#64748b]">
                                {confirmRequest.message}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 max-[520px]:flex-col">
                            <button
                                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-[#dce5ef] bg-[#fffdfc] px-4 font-black text-[#2b1b1b] hover:bg-[#e8f7ef]"
                                onClick={() => resolveConfirmRequest(false)}
                                type="button"
                            >
                                {confirmRequest.cancelLabel}
                            </button>
                            <button
                                className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md px-4 font-black text-white ${confirmToneClass[confirmRequest.tone] || confirmToneClass.primary}`}
                                onClick={() => resolveConfirmRequest(true)}
                                type="button"
                            >
                                {confirmRequest.confirmLabel}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
            />
        </RefereeLayout>
    );
}

export default AssignedPostRace;
