import { useCallback, useEffect, useMemo, useState } from 'react';
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
import Toast from '../shared/Toast';
import { useToast } from '../shared/useToast';

const emptyResultForm = {
    registrationId: '',
    outcomeStatus: 'Finished',
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

const outcomeOptions = [
    { value: 'Finished', label: 'Finished' },
    { value: 'DNS', label: 'Did Not Start' },
    { value: 'DNF', label: 'Did Not Finish' },
    { value: 'DSQ', label: 'Disqualified' },
    { value: 'Withdrawn', label: 'Withdrawn' },
];

function normalizeOutcomeStatus(value) {
    const normalized = String(value || '').trim();
    const aliases = {
        Disqualified: 'DSQ',
        DidNotStart: 'DNS',
        DidNotFinish: 'DNF',
    };
    return aliases[normalized] || normalized || 'Finished';
}

function getOutcomeLabel(value) {
    const normalized = normalizeOutcomeStatus(value);
    return outcomeOptions.find((option) => option.value === normalized)?.label || normalized;
}

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
    if (['RefereeConfirmed', 'AdminApproved', 'Published'].includes(status)) return 'bg-[#e8f7ee] text-[#16864f]';
    if (status === 'Returned') return 'bg-[#f3e1df] text-[#a4392f]';
    return 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]';
}

function isSeasonActive(race) {
    return !race?.seasonStatus || race.seasonStatus === 'Active';
}

function hasPostRaceAction(race) {
    const actions = race?.allowedActions ?? {};
    return Boolean(
        actions.canStartRace ||
        actions.canFinishRace ||
        actions.canEnterResults ||
        actions.canConfirmResults ||
        actions.canSubmitPostRaceReport
    );
}

function getRaceBlockingReason(race) {
    if (race?.blockingReason) return race.blockingReason;
    if (!isSeasonActive(race)) return `Season is ${race.seasonStatus}.`;
    return '';
}

const inputClass = "rounded-lg border border-[var(--admin-border)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--admin-primary)] w-full";
const labelClass = "block text-xs font-bold text-[var(--admin-muted)] uppercase mb-1.5";
const primaryBtn = "rounded-full bg-[var(--admin-primary)] px-5 py-2.5 font-semibold text-white text-sm transition-colors hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60 w-full";
const confirmToneClass = {
    primary: 'bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-dark)]',
    danger: 'bg-[#a4392f] hover:bg-[#8a2e26]',
};

const getPostRaceDraftKey = (raceId) => `erl:post-race-report-draft:${raceId}`;

function AssignedPostRace() {
    const location = useLocation();
    const queryRaceId = new URLSearchParams(location.search).get('raceId');
    const initialRaceId = location.state?.raceId ?? queryRaceId;

    const [races, setRaces] = useState([]);
    const [selectedRaceId, setSelectedRaceId] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [results, setResults] = useState([]);
    const [violations, setViolations] = useState([]);
    const [reports, setReports] = useState([]);
    const [activeTab, setActiveTab] = useState('results');

    const [resultForm, setResultForm] = useState(emptyResultForm);
    const [editingResultId, setEditingResultId] = useState('');
    const [violationForm, setViolationForm] = useState(emptyViolationForm);
    const [editingViolationId, setEditingViolationId] = useState('');
    const [reportContent, setReportContent] = useState('');
    const [editingReportId, setEditingReportId] = useState('');

    const [loadingRaces, setLoadingRaces] = useState(true);
    const [loadingRaceData, setLoadingRaceData] = useState(false);
    const [saving, setSaving] = useState('');
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
    const resultFormIsFinished = resultForm.outcomeStatus === 'Finished';
    const trimmedReportContent = reportContent.trim();
    const selectedRaceBlockingReason = getRaceBlockingReason(selectedRace);
    const postRaceReport = useMemo(
        () => reports.find((report) => report.reportType === 'PostRace') ?? null,
        [reports]
    );
    const postRaceReportStatus = postRaceReport?.status || '';
    const finalReportIsReturned = postRaceReportStatus === 'Returned';
    const finalReportIsLocked = ['Submitted', 'Approved'].includes(postRaceReportStatus);

    const canStartRace =
        isSeasonActive(selectedRace) &&
        (selectedRace?.allowedActions?.canStartRace ||
            selectedRace?.raceStatus === 'RefereeReady');

    const canFinishRace =
        isSeasonActive(selectedRace) &&
        (selectedRace?.allowedActions?.canFinishRace ||
            selectedRace?.raceStatus === 'Ongoing');

    const canEnterResults =
        isSeasonActive(selectedRace) &&
        !finalReportIsLocked &&
        (selectedRace?.allowedActions?.canEnterResults ||
            selectedRace?.raceStatus === 'Finished');

    const canEditFinalReport =
        isSeasonActive(selectedRace) &&
        !finalReportIsLocked &&
        ['Finished', 'ResultPending'].includes(selectedRace?.raceStatus);

    const draftResultCount = results.filter((result) => result.status === 'Draft').length;
    const returnedResultCount = results.filter((result) => result.status === 'Returned').length;
    const confirmedResultCount = results.filter((result) => result.status === 'RefereeConfirmed').length;
    const canSubmitFromFinished =
        selectedRace?.raceStatus === 'Finished' &&
        (draftResultCount > 0 || returnedResultCount > 0);
    const canSubmitFromPending =
        selectedRace?.raceStatus === 'ResultPending' &&
        !postRaceReport;
    const canResubmitReturnedReport =
        finalReportIsReturned &&
        ['Finished', 'ResultPending'].includes(selectedRace?.raceStatus);

    const submitReportDisabled =
        saving === 'submit-report' ||
        loadingRaceData ||
        !selectedRaceId ||
        results.length === 0 ||
        !trimmedReportContent ||
        finalReportIsLocked ||
        !(canSubmitFromFinished || canSubmitFromPending || canResubmitReturnedReport);

    const submitReportHint = !selectedRaceId
        ? 'Select a race before submitting.'
        : selectedRaceBlockingReason
            ? selectedRaceBlockingReason
            : finalReportIsLocked
                ? `Final report is ${postRaceReportStatus} and is locked.`
                : finalReportIsReturned
                    ? 'The admin returned this final report. Revise it, then resubmit.'
                    : selectedRace?.raceStatus === 'ResultPending' && !postRaceReport
                        ? 'Results are confirmed. Submit the final report to complete the admin submission.'
                        : selectedRace?.raceStatus !== 'Finished'
                            ? `Race must be Finished before submission. Current status: ${selectedRace?.raceStatus || 'N/A'}.`
                            : results.length === 0
                                ? 'Save race results before submitting.'
                                : !trimmedReportContent
                                    ? 'Write the post-race report content before submitting.'
                                    : `${draftResultCount + returnedResultCount} result${draftResultCount + returnedResultCount === 1 ? '' : 's'} ready to submit.`;

    const loadAssignedRaces = useCallback(async (ignoreRef = { current: false }) => {
        setLoadingRaces(true);
        try {
            const data = await refereeApi.getAssignedRacesWithLifecycle();
            if (ignoreRef.current) return;
            const nextRaces = (data ?? []).filter((r) =>
                isSeasonActive(r) &&
                (hasPostRaceAction(r) ||
                r.raceStatus === 'RefereeReady' ||
                r.raceStatus === 'Ongoing' ||
                r.raceStatus === 'Finished' ||
                r.raceStatus === 'ResultPending')
            );
            setRaces(nextRaces);
            setSelectedRaceId((current) => {
                const containsRace = (value) => nextRaces.some(
                    (race) => String(race.raceId) === String(value)
                );

                if (current && containsRace(current)) return current;
                if (initialRaceId && containsRace(initialRaceId)) return initialRaceId;
                return nextRaces[0]?.raceId ?? null;
            });
        } catch (err) {
            if (!ignoreRef.current) showToast(err.message || 'Failed to load races.', 'error');
        } finally {
            if (!ignoreRef.current) setLoadingRaces(false);
        }
    }, [initialRaceId, showToast]);

    const loadRaceWorkflowData = useCallback(async (raceId, ignoreRef = { current: false }) => {
        if (!raceId) return;
        setLoadingRaceData(true);
        try {
            const [registrationData, resultData, violationData, reportData] = await Promise.all([
                refereeApi.getPostRaceRegistrations(raceId),
                refereeApi.getRaceResults(raceId),
                refereeApi.getViolations(raceId),
                refereeApi.getRefereeReports(raceId).catch(() => []),
            ]);
            if (ignoreRef.current) return;
            const nextRegistrations = registrationData ?? [];
            const firstId = nextRegistrations[0]?.registrationId ? String(nextRegistrations[0].registrationId) : '';
            const nextReports = reportData ?? [];
            const postRaceReport = nextReports.find((report) => report.reportType === 'PostRace');
            setRegistrations(nextRegistrations);
            setResults(resultData ?? []);
            setViolations(violationData ?? []);
            setReports(nextReports);
            setResultForm({ ...emptyResultForm, registrationId: firstId });
            setEditingResultId('');
            setViolationForm({ ...emptyViolationForm, registrationId: firstId });
            setEditingViolationId('');
            const localDraft = window.localStorage.getItem(getPostRaceDraftKey(raceId)) || '';
            setReportContent(postRaceReport?.reportContent ?? localDraft);
            setEditingReportId(postRaceReport?.reportId ? String(postRaceReport.reportId) : '');
        } catch (err) {
            if (!ignoreRef.current) showToast(err.message || 'Failed to load race data.', 'error');
        } finally {
            if (!ignoreRef.current) setLoadingRaceData(false);
        }
    }, [showToast]);

    useEffect(() => {
        const ignoreRef = { current: false };
        loadAssignedRaces(ignoreRef);
        return () => { ignoreRef.current = true; };
    }, [loadAssignedRaces]);

    useEffect(() => {
        if (!selectedRaceId) return undefined;
        const ignoreRef = { current: false };
        loadRaceWorkflowData(selectedRaceId, ignoreRef);
        return () => { ignoreRef.current = true; };
    }, [loadRaceWorkflowData, selectedRaceId]);

    const refreshResults = async () => { if (selectedRaceId) setResults(await refereeApi.getRaceResults(selectedRaceId) ?? []); };
    const refreshViolations = async () => { if (selectedRaceId) setViolations(await refereeApi.getViolations(selectedRaceId) ?? []); };
    const refreshReports = async () => {
        if (!selectedRaceId) return [];

        const nextReports = await refereeApi.getRefereeReports(selectedRaceId) ?? [];
        const nextPostRaceReport = nextReports.find((report) => report.reportType === 'PostRace');
        setReports(nextReports);
        setEditingReportId(nextPostRaceReport?.reportId ? String(nextPostRaceReport.reportId) : '');
        return nextReports;
    };

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

    const validateFinishTimeOrder = (candidate) => {
        const candidateRegistrationId = String(candidate.registrationId || '');
        const candidateResultId = String(candidate.resultId || '');
        const finishedRows = results
            .filter((result) => {
                const resultId = result.resultId ?? result.ResultId;
                const registrationId = result.registrationId ?? result.RegistrationId;
                const sameResult = candidateResultId && String(resultId) === candidateResultId;
                const sameRegistration = candidateRegistrationId && String(registrationId) === candidateRegistrationId;
                return !sameResult && !sameRegistration;
            })
            .concat(candidate)
            .map((result) => {
                const position = nullableNumber(result.finishPosition ?? result.FinishPosition);
                const time = nullableNumber(result.finishTimeSeconds ?? result.FinishTimeSeconds);
                const outcomeStatus = normalizeOutcomeStatus(result.outcomeStatus ?? result.OutcomeStatus);
                return { position, time, outcomeStatus };
            })
            .filter((result) =>
                result.outcomeStatus === 'Finished' &&
                Number.isInteger(result.position) &&
                result.position > 0 &&
                result.time !== null
            )
            .sort((a, b) => a.position - b.position);

        let slowestHigherRank = null;
        for (const row of finishedRows) {
            if (slowestHigherRank && row.position > slowestHigherRank.position && row.time <= slowestHigherRank.time) {
                return `Position #${row.position} time (${formatSeconds(row.time)}) must be greater than position #${slowestHigherRank.position} time (${formatSeconds(slowestHigherRank.time)}).`;
            }
            if (!slowestHigherRank || row.time > slowestHigherRank.time) {
                slowestHigherRank = row;
            }
        }

        return '';
    };

    const validateScoreOrder = (candidate) => {
        const candidateRegistrationId = String(candidate.registrationId || '');
        const candidateResultId = String(candidate.resultId || '');
        const finishedRows = results
            .filter((result) => {
                const resultId = result.resultId ?? result.ResultId;
                const registrationId = result.registrationId ?? result.RegistrationId;
                const sameResult = candidateResultId && String(resultId) === candidateResultId;
                const sameRegistration = candidateRegistrationId && String(registrationId) === candidateRegistrationId;
                return !sameResult && !sameRegistration;
            })
            .concat(candidate)
            .map((result) => {
                const position = nullableNumber(result.finishPosition ?? result.FinishPosition);
                const score = nullableNumber(result.score ?? result.Score);
                const outcomeStatus = normalizeOutcomeStatus(result.outcomeStatus ?? result.OutcomeStatus);
                return { position, score, outcomeStatus };
            })
            .filter((result) =>
                result.outcomeStatus === 'Finished' &&
                Number.isInteger(result.position) &&
                result.position > 0 &&
                result.score !== null
            )
            .sort((a, b) => a.position - b.position);

        let highestHigherRankScore = null;
        for (const row of finishedRows) {
            if (highestHigherRankScore && row.position > highestHigherRankScore.position && row.score <= highestHigherRankScore.score) {
                return `Position #${row.position} score (${row.score}) must be greater than position #${highestHigherRankScore.position} score (${highestHigherRankScore.score}).`;
            }
            if (!highestHigherRankScore || row.score > highestHigherRankScore.score) {
                highestHigherRankScore = row;
            }
        }

        return '';
    };

    const validateResultForm = () => {
        if (!selectedRaceId) return 'Select a race first.';
        if (finalReportIsLocked) return `The final report is ${postRaceReportStatus} and the results are locked.`;
        if (!canEnterResults) return 'Race must be Finished before entering results.';
        if (!resultForm.registrationId) return 'Select a registration.';
        if (!outcomeOptions.some((option) => option.value === resultForm.outcomeStatus)) return 'Select a valid outcome.';
        const isFinished = resultForm.outcomeStatus === 'Finished';
        const pos = nullableNumber(resultForm.finishPosition);
        const time = nullableNumber(resultForm.finishTimeSeconds);
        if (isFinished && (!Number.isInteger(pos) || pos < 1)) return 'Finished outcome requires a positive whole-number position.';
        if (!isFinished && resultForm.finishPosition !== '') return `${resultForm.outcomeStatus} outcome must not have a finish position.`;
        if (isFinished && (time === null || time <= 0)) return 'Finished outcome requires a finish time greater than 0.';
        if (!isFinished && resultForm.finishTimeSeconds !== '' && (time === null || time <= 0)) return 'Finish time must be greater than 0 when provided.';
        if (resultForm.finishTimeSeconds !== '' && (time === null || time < 0)) return 'Finish time must be ≥ 0.';
        const score = nullableNumber(resultForm.score);
        if (resultForm.score !== '' && (score === null || score < 0)) return 'Score must be ≥ 0.';
        const finishTimeOrderMessage = validateFinishTimeOrder({
            resultId: editingResultId,
            registrationId: resultForm.registrationId,
            outcomeStatus: resultForm.outcomeStatus,
            finishPosition: pos,
            finishTimeSeconds: time,
        });
        if (finishTimeOrderMessage) return finishTimeOrderMessage;
        const scoreOrderMessage = validateScoreOrder({
            resultId: editingResultId,
            registrationId: resultForm.registrationId,
            outcomeStatus: resultForm.outcomeStatus,
            finishPosition: pos,
            score,
        });
        if (scoreOrderMessage) return scoreOrderMessage;
        return '';
    };

    const validateViolationForm = () => {
        if (!selectedRaceId) return 'Select a race first.';
        if (finalReportIsLocked) return `The final report is ${postRaceReportStatus} and violations are locked.`;
        if (!violationForm.registrationId) return 'Select a registration.';
        if (!violationForm.violationType.trim()) return 'Violation type is required.';
        const pts = nullableNumber(violationForm.penaltyPoints);
        if (violationForm.penaltyPoints !== '' && (pts === null || pts < 0)) return 'Penalty points must be ≥ 0.';
        if (violationForm.action === VIOLATION_ACTIONS.pointDeduction && (!pts || pts <= 0)) return 'Point deduction requires penalty points > 0.';
        return '';
    };

    const persistPostRaceReport = async () => {
        if (!selectedRaceId) {
            throw new Error('Select a race first.');
        }

        if (!trimmedReportContent) {
            throw new Error('Post-race report content is required.');
        }

        if (postRaceReport?.status === 'Returned') {
            return refereeApi.resubmitFinalReport(
                selectedRaceId,
                postRaceReport.reportId,
                trimmedReportContent
            );
        }

        if (postRaceReport?.status === 'Submitted' || postRaceReport?.status === 'Approved') {
            throw new Error(`The final report is already ${postRaceReport.status} and cannot be edited.`);
        }

        return refereeApi.createRefereeReport(
            selectedRaceId,
            trimmedReportContent,
            'PostRace'
        );
    };

    const handleSavePostRaceReport = () => {
        if (!selectedRaceId) {
            showToast('Select a race first.', 'error');
            return;
        }

        if (!trimmedReportContent) {
            showToast('Post-race report content is required.', 'error');
            return;
        }

        window.localStorage.setItem(
            getPostRaceDraftKey(selectedRaceId),
            trimmedReportContent
        );
        showToast('Report draft saved in this browser. It has not been sent to admin.', 'success');
    };

    const handleStartRace = async () => {
        if (!selectedRaceId) return;
        setSaving('start');
        try {
            const updatedLifecycle = await refereeApi.startRace(selectedRaceId);
            setRaces((prev) =>
                prev.map((race) =>
                    String(race.raceId) === String(selectedRaceId)
                        ? {
                            ...race,
                            ...updatedLifecycle,
                            raceStatus: updatedLifecycle?.raceStatus || 'Ongoing',
                            currentStage: updatedLifecycle?.currentStage,
                            nextStage: updatedLifecycle?.nextStage,
                            allowedActions: updatedLifecycle?.allowedActions ?? race.allowedActions,
                            seasonStatus: updatedLifecycle?.seasonStatus ?? race.seasonStatus,
                            blockingReason: updatedLifecycle?.blockingReason ?? race.blockingReason,
                        }
                        : race
                )
            );
            // Reload through the dedicated post-race endpoint immediately.
            // This removes every failed pre-race horse before the page can be used.
            await loadRaceWorkflowData(selectedRaceId);
            showToast('Race started! Only passed horses are available for post-race work.', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to start race.', 'error');
        } finally {
            setSaving('');
        }
    };

    const handleFinishRace = async () => {
        if (!selectedRaceId) return;
        setSaving('finish');
        try {
            const updatedLifecycle = await refereeApi.finishRace(selectedRaceId);
            setRaces((prev) =>
                prev.map((race) =>
                    String(race.raceId) === String(selectedRaceId)
                        ? {
                            ...race,
                            ...updatedLifecycle,
                            raceStatus: updatedLifecycle?.raceStatus || 'Finished',
                            currentStage: updatedLifecycle?.currentStage,
                            nextStage: updatedLifecycle?.nextStage,
                            allowedActions: updatedLifecycle?.allowedActions ?? race.allowedActions,
                            seasonStatus: updatedLifecycle?.seasonStatus ?? race.seasonStatus,
                            blockingReason: updatedLifecycle?.blockingReason ?? race.blockingReason,
                        }
                        : race
                )
            );
            await loadRaceWorkflowData(selectedRaceId);
            showToast('Race marked as Finished. You can now enter results.', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to finish race.', 'error');
        } finally {
            setSaving('');
        }
    };

    const handleSaveResult = async (e) => {
        e.preventDefault();
        const msg = validateResultForm();
        if (msg) { showToast(msg, 'error'); return; }
        setSaving('result');
        try {
            const normalizedOutcome = normalizeOutcomeStatus(resultForm.outcomeStatus);
            const isFinished = normalizedOutcome === 'Finished';
            await refereeApi.saveRaceResult(selectedRaceId, {
                registrationId: Number(resultForm.registrationId),
                finishTimeSeconds: isFinished ? nullableNumber(resultForm.finishTimeSeconds) : null,
                finishPosition: isFinished ? nullableNumber(resultForm.finishPosition) : null,
                score: nullableNumber(resultForm.score),
                outcomeStatus: normalizedOutcome,
                note: resultForm.note?.trim() || null,
            });
            await refreshResults();
            setResultForm((p) => ({ ...emptyResultForm, registrationId: p.registrationId }));
            setEditingResultId('');
            showToast(isEditingResult
                ? 'Result draft changes saved. Submit the post-race report to send it to admin.'
                : 'Result saved as draft. Submit the post-race report to send it to admin.',
                'success'
            );
        } catch (err) {
            showToast(err.message || 'Failed to save result.', 'error');
        } finally { setSaving(''); }
    };

    const handleEditResult = (result) => {
        if (finalReportIsLocked) {
            showToast(`The final report is ${postRaceReportStatus}. Results can no longer be edited.`, 'error');
            return;
        }

        const normalizedOutcome = normalizeOutcomeStatus(result.outcomeStatus ?? result.OutcomeStatus);
        const isFinished = normalizedOutcome === 'Finished';

        setEditingResultId(String(result.resultId || result.registrationId || ''));
        setResultForm({
            registrationId: String(result.registrationId),
            outcomeStatus: normalizedOutcome,
            finishTimeSeconds: isFinished ? (result.finishTimeSeconds ?? '') : '',
            finishPosition: isFinished ? (result.finishPosition ?? '') : '',
            score: result.score ?? '',
            note: result.note ?? '',
        });
        showToast('Editing result — update fields and save.', 'info');
    };

    const handleSaveViolation = async (e) => {
        e.preventDefault();
        const msg = validateViolationForm();
        if (msg) { showToast(msg, 'error'); return; }

        if (isEditingViolation) {
            const confirmed = await requestViolationConfirm({
                title: 'Update violation',
                message: 'Are you sure you want to update this violation?',
                confirmLabel: 'Update',
                tone: 'primary',
            });
            if (!confirmed) return;
        }

        setSaving('violation');
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
            showToast(
                isEditingViolation ? 'Violation updated successfully.' : 'Violation created.',
                'success',
                isEditingViolation ? 'Updated' : 'Created'
            );
        } catch (err) {
            showToast(err.message || (isEditingViolation ? 'Failed to update violation.' : 'Failed to create violation.'), 'error');
        } finally { setSaving(''); }
    };

    const handleEditViolation = (violation) => {
        if (violation?.isReadOnly) {
            showToast('Pre-race inspection failures are read-only. Edit them from Pre-Race Inspection.', 'info');
            return;
        }

        if (finalReportIsLocked) {
            showToast(`The final report is ${postRaceReportStatus}. Violations can no longer be edited.`, 'error');
            return;
        }

        setEditingViolationId(String(violation.violationId || ''));
        setViolationForm({
            registrationId: String(violation.registrationId || ''),
            violationType: violation.violationType ?? '',
            description: violation.description ?? '',
            action: violation.action ?? VIOLATION_ACTIONS.warning,
            penaltyPoints: violation.penaltyPoints ?? '',
        });
        showToast('Editing violation - update fields and save.', 'info');
    };

    const handleCancelViolationEdit = () => {
        setViolationForm((p) => ({ ...emptyViolationForm, registrationId: p.registrationId }));
        setEditingViolationId('');
    };

    const handleDeleteViolation = async (violation) => {
        if (violation?.isReadOnly) {
            showToast('Pre-race inspection failures cannot be deleted from Post-Race.', 'info');
            return;
        }

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
        try {
            await refereeApi.deleteViolation(selectedRaceId, violation.violationId);
            await refreshViolations();
            if (String(editingViolationId) === String(violation.violationId)) {
                setViolationForm((p) => ({ ...emptyViolationForm, registrationId: p.registrationId }));
                setEditingViolationId('');
            }
            showToast('Violation deleted successfully.', 'success', 'Deleted');
        } catch (err) {
            showToast(err.message || 'Failed to delete violation.', 'error');
        } finally {
            setSaving('');
        }
    };

    const handleSubmitPostRaceReport = async () => {
        if (!selectedRaceId) return;

        if (results.length === 0) {
            showToast('Save race results before submitting.', 'error');
            return;
        }

        if (!trimmedReportContent) {
            showToast('Write the post-race report content before submitting.', 'error');
            return;
        }

        if (finalReportIsLocked) {
            showToast(`The final report is already ${postRaceReportStatus}.`, 'error');
            return;
        }

        setSaving('submit-report');

        try {
            let updatedLifecycle = null;

            /*
             * IMPORTANT:
             * Confirm results first. The old order created and locked the final
             * report before result confirmation, leaving the workflow stuck if
             * confirm-all failed.
             */
            if (
                selectedRace?.raceStatus === 'Finished'
                && (draftResultCount > 0 || returnedResultCount > 0)
            ) {
                updatedLifecycle = await refereeApi.confirmAllRaceResults(selectedRaceId);
            }

            await persistPostRaceReport();

            window.localStorage.removeItem(getPostRaceDraftKey(selectedRaceId));

            if (updatedLifecycle) {
                setRaces((prev) =>
                    prev.map((race) =>
                        String(race.raceId) === String(selectedRaceId)
                            ? {
                                ...race,
                                ...updatedLifecycle,
                                raceStatus: updatedLifecycle?.raceStatus || 'ResultPending',
                                currentStage: updatedLifecycle?.currentStage,
                                nextStage: updatedLifecycle?.nextStage,
                                allowedActions: updatedLifecycle?.allowedActions ?? race.allowedActions,
                                seasonStatus: updatedLifecycle?.seasonStatus ?? race.seasonStatus,
                                blockingReason: updatedLifecycle?.blockingReason ?? race.blockingReason,
                            }
                            : race
                    )
                );
            }

            await Promise.all([
                loadAssignedRaces(),
                loadRaceWorkflowData(selectedRaceId),
            ]);

            setActiveTab('results');
            showToast(
                finalReportIsReturned
                    ? 'Revised post-race report resubmitted to admin.'
                    : `Post-race submission sent with ${results.length} result${results.length === 1 ? '' : 's'} and ${violations.length} violation${violations.length === 1 ? '' : 's'}.`,
                'success'
            );
        } catch (err) {
            showToast(err.message || 'Failed to submit post-race report.', 'error');
        } finally {
            setSaving('');
        }
    };

    if (!loadingRaces && races.length === 0) {
        return (
            <RefereeLayout activeKey="post-race">
                <section className="page-shell">
                    <h1 className="page-title">Post-Race Workflow</h1>
                    <p className="page-subtitle">Enter results, log violations, and submit the post-race report to admin.</p>
                    <div className="mt-6 rounded-[8px] border border-[#e3bcb7] bg-[#f3e1df] p-6 text-[#a4392f]">
                        <h2 className="m-0 text-lg font-black">Post-race report unavailable</h2>
                        <p className="mb-0 mt-2 font-semibold">
                            This post-race report page is locked because there is no active assigned race in the post-race workflow.
                        </p>
                    </div>
                </section>
            </RefereeLayout>
        );
    }

    return (
        <RefereeLayout activeKey="post-race">
            <section className="page-shell">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 className="page-title">Post-Race Workflow</h1>
                        <p className="page-subtitle">Enter results, log violations, and submit the post-race report to admin.</p>
                    </div>
                </div>

                {/* Alerts */}
                {selectedRaceBlockingReason && (
                    <div className="rounded-[8px] border border-[#e3bcb7] bg-[#f3e1df] px-5 py-4 font-semibold text-[#a4392f]">
                        {selectedRaceBlockingReason}
                    </div>
                )}

                {selectedRace?.raceStatus === 'RefereeReady' && (
                    <div className="rounded-[8px] border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="font-semibold text-[var(--admin-primary)]">
                                Race is <strong>Ready</strong>. Start the race when all runners are at the gate.
                            </div>
                            <button
                                type="button"
                                onClick={handleStartRace}
                                disabled={!canStartRace || saving === 'start'}
                                title={canStartRace ? 'Start race' : selectedRaceBlockingReason || 'Race cannot be started yet.'}
                                className="inline-flex items-center gap-2 rounded-full bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FaTrophy />
                                {saving === 'start' ? 'Starting...' : 'Start Race'}
                            </button>
                        </div>
                    </div>
                )}

                {selectedRace?.raceStatus === 'Ongoing' && (
                    <div className="rounded-[8px] border border-[#e9d8a6] bg-[#faf2e0] px-5 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="font-semibold text-[#8a6209]">
                                Race is currently <strong>Ongoing</strong>. Finish the race before entering results.
                            </div>
                            <button
                                type="button"
                                onClick={handleFinishRace}
                                disabled={!canFinishRace || saving === 'finish'}
                                title={canFinishRace ? 'Finish race' : selectedRaceBlockingReason || 'Race cannot be finished yet.'}
                                className="rounded-full bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving === 'finish' ? 'Finishing...' : 'Finish Race'}
                            </button>
                        </div>
                    </div>
                )}

                {selectedRace?.raceStatus === 'ResultPending' && activeTab === 'results' && (
                    <div className="rounded-[8px] border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-4 font-semibold text-[var(--admin-primary)]">
                        Post-race report has already been sent to admin. Current status: <strong>{selectedRace.raceStatus}</strong>
                    </div>
                )}

                {/* ── Race selector ── */}
                <div className="surface-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Race</span>
                        {loadingRaces && <span style={{ fontSize: 12, color: 'var(--admin-muted)' }}>Loading...</span>}
                    </div>

                    <div style={{ display: 'flex', gap: 0, overflowX: 'auto', padding: '12px 16px', flexWrap: 'nowrap' }}>
                        {races.length === 0 && !loadingRaces && (
                            <span style={{ fontSize: 13, color: 'var(--admin-muted)', padding: '8px 0' }}>No assigned races.</span>
                        )}
                        {races.map((race) => {
                            const isSelected = String(selectedRaceId) === String(race.raceId);
                            return (
                                <button
                                    type="button"
                                    key={race.raceId}
                                    onClick={() => setSelectedRaceId(race.raceId)}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                        padding: '10px 16px', marginRight: 8, borderRadius: 10, cursor: 'pointer',
                                        border: isSelected ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                                        background: isSelected ? 'var(--admin-surface-strong)' : '#fff',
                                        flexShrink: 0, minWidth: 180, textAlign: 'left',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <span style={{ fontWeight: 700, fontSize: 13, color: isSelected ? 'var(--admin-primary)' : 'var(--admin-ink)', lineHeight: 1.3 }}>
                                        {race.raceName}
                                    </span>
                                    <span style={{ fontSize: 11, color: 'var(--admin-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <FaMapMarkerAlt /> {race.location || 'N/A'}
                                    </span>
                                    <span style={{ fontSize: 11, color: isSelected ? 'var(--admin-primary)' : 'var(--admin-muted)', marginTop: 2, fontWeight: 600 }}>
                                        {race.raceStatus}
                                    </span>
                                    {race.seasonStatus && (
                                        <span style={{ fontSize: 11, color: race.seasonStatus === 'Active' ? 'var(--admin-primary)' : '#a4392f', marginTop: 2, fontWeight: 600 }}>
                                            Season: {race.seasonStatus}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Only horses that passed pre-race inspection appear in Post-Race Results. */}
                {registrations.length === 0 && !loadingRaceData && selectedRaceId && (
                    <div className="flex items-start gap-3 rounded-[8px] border border-[#e9d8a6] bg-[#faf2e0] p-5 text-[#8a6209]">
                        <FaExclamationTriangle className="mt-1" />
                        <div>
                            <div className="font-bold">No horse passed pre-race inspection.</div>
                            <p className="mt-1 text-sm">Failed inspections are shown as read-only items in the Violations tab and do not require a Post-Race result.</p>
                        </div>
                    </div>
                )}

                {/* ── Tab bar ── */}
                <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--admin-border)' }}>
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const count = tab.key === 'results' ? results.length
                            : violations.length;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderBottom: isActive ? '2px solid var(--admin-primary)' : '2px solid transparent',
                                    marginBottom: -2,
                                    background: 'transparent',
                                    fontWeight: isActive ? 800 : 600,
                                    color: isActive ? 'var(--admin-primary)' : 'var(--admin-muted)',
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <Icon />
                                {tab.label}
                                <span style={{
                                    fontSize: 11, fontWeight: 700,
                                    backgroundColor: isActive ? 'var(--admin-primary)' : 'var(--admin-surface-strong)',
                                    color: isActive ? '#fff' : 'var(--admin-primary)',
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
                            <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FaTrophy style={{ color: 'var(--admin-primary)' }} /> Result Entry
                            </h2>

                            {selectedRace && (
                                <div style={{ background: 'var(--admin-surface-strong)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--admin-muted)' }}>
                                    Race: <strong style={{ color: 'var(--admin-primary)' }}>{selectedRace.raceName}</strong>
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
                                            {registrations.length === 0 ? 'No eligible horses' : 'Select horse'}
                                        </option>
                                        {registrations.map((r) => (
                                            <option key={r.registrationId} value={String(r.registrationId)}>
                                                {getRegistrationLabel(r)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedResultRegistration && (
                                    <div style={{ background: 'var(--admin-surface-strong)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: 12, fontSize: 13 }}>
                                        <strong style={{ color: 'var(--admin-ink)' }}>{selectedResultRegistration.horseName}</strong>
                                        <div style={{ color: 'var(--admin-muted)', marginTop: 2 }}>
                                            Status: {selectedResultRegistration.status || 'N/A'} · Owner {getOwnerLabel(selectedResultRegistration)} · Jockey {selectedResultRegistration.jockeyName || 'N/A'}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className={labelClass}>Outcome</label>
                                    <select
                                        className={inputClass}
                                        disabled={loadingRaceData}
                                        onChange={(e) => setResultForm((p) => ({
                                            ...p,
                                            outcomeStatus: e.target.value,
                                            finishPosition: e.target.value === 'Finished' ? p.finishPosition : '',
                                            finishTimeSeconds: e.target.value === 'Finished' ? p.finishTimeSeconds : '',
                                        }))}
                                        value={resultForm.outcomeStatus}
                                    >
                                        {outcomeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label className={labelClass}>Finish Position</label>
                                        <input type="number" min="1" step="1" value={resultForm.finishPosition}
                                            onChange={(e) => setResultForm((p) => ({ ...p, finishPosition: e.target.value }))}
                                            placeholder={resultFormIsFinished ? 'e.g. 1' : 'Not applicable'}
                                            disabled={!resultFormIsFinished}
                                            className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Time (seconds)</label>
                                        <input type="number" step="0.01" min="0" value={resultForm.finishTimeSeconds}
                                            onChange={(e) => setResultForm((p) => ({ ...p, finishTimeSeconds: e.target.value }))}
                                            placeholder={resultFormIsFinished ? 'e.g. 92.45' : 'Not applicable'}
                                            disabled={!resultFormIsFinished}
                                            className={inputClass} />
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
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FaClipboardList style={{ color: 'var(--admin-primary)' }} /> Results
                                </h2>
                                <span style={{ fontSize: 12, color: 'var(--admin-muted)' }}>{selectedRace?.raceName || 'Select a race'}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="data-table" style={{ minWidth: 600 }}>
                                    <thead>
                                        <tr>
                                            <th>Horse</th>
                                            <th>Outcome</th>
                                            <th>Position</th>
                                            <th>Time</th>
                                            <th>Score</th>
                                            <th>Status</th>
                                            <th>Note</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.length === 0 ? (
                                            <tr><td colSpan={8} className="p-6 text-center text-[var(--admin-muted)]">No results submitted yet.</td></tr>
                                        ) : results.map((result) => (
                                            <tr key={result.resultId}>
                                                <td>
                                                    <div className="font-bold text-[0.9rem]">{result.horseName}</div>
                                                    <div className="text-xs text-[var(--admin-muted)]">Registration #{result.registrationId}</div>
                                                </td>
                                                <td className="text-sm font-bold text-[var(--admin-ink)]">{getOutcomeLabel(result.outcomeStatus ?? result.OutcomeStatus)}</td>
                                                <td className="text-sm">{normalizeOutcomeStatus(result.outcomeStatus ?? result.OutcomeStatus) === 'Finished' ? (result.finishPosition ?? '-') : '-'}</td>
                                                <td className="text-sm">{normalizeOutcomeStatus(result.outcomeStatus ?? result.OutcomeStatus) === 'Finished' ? formatSeconds(result.finishTimeSeconds) : '-'}</td>
                                                <td className="text-sm">{result.score ?? '-'}</td>
                                                <td>
                                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(result.status)}`}>{result.status}</span>
                                                </td>
                                                <td className="text-xs text-[var(--admin-muted)]" style={{ maxWidth: 160 }}>{result.note || '-'}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditResult(result)}
                                                        disabled={finalReportIsLocked}
                                                        title={finalReportIsLocked ? `Final report is ${postRaceReportStatus}.` : 'Edit result'}
                                                        className="rounded-full border border-[var(--admin-border)] bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--admin-primary)] transition-colors hover:bg-[var(--admin-surface-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Edit
                                                    </button>
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
                            <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FaGavel style={{ color: 'var(--admin-primary)' }} /> {isEditingViolation ? 'Edit Violation' : 'Log Violation'}
                            </h2>

                            {selectedRace && (
                                <div style={{ background: 'var(--admin-surface-strong)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--admin-muted)' }}>
                                    Race: <strong style={{ color: 'var(--admin-primary)' }}>{selectedRace.raceName}</strong>
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
                                            {registrations.length === 0 ? 'No eligible horses' : 'Select horse'}
                                        </option>
                                        {registrations.map((r) => (
                                            <option key={r.registrationId} value={String(r.registrationId)}>
                                                {getRegistrationLabel(r)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedViolationRegistration && (
                                    <div style={{ background: 'var(--admin-surface-strong)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: 12, fontSize: 13 }}>
                                        <strong style={{ color: 'var(--admin-ink)' }}>{selectedViolationRegistration.horseName}</strong>
                                        <div style={{ color: 'var(--admin-muted)', marginTop: 2 }}>
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
                                    <button type="submit" disabled={saving === 'violation' || loadingRaceData || registrations.length === 0 || finalReportIsLocked} className={primaryBtn}>
                                        {saving === 'violation' ? 'Saving...' : isEditingViolation ? 'Update Violation' : 'Create Violation'}
                                    </button>
                                    {isEditingViolation && (
                                        <button
                                            type="button"
                                            onClick={handleCancelViolationEdit}
                                            title="Cancel edit"
                                            aria-label="Cancel edit"
                                            disabled={saving === 'violation'}
                                            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>

                        {/* Violations list */}
                        <div className="surface-card" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)' }}>
                                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FaGavel style={{ color: 'var(--admin-primary)' }} /> Violations & Pre-Race Failures
                                </h2>
                            </div>
                            <div>
                                {violations.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-[var(--admin-muted)]">No violations or failed pre-race inspections.</div>
                                ) : violations.map((v) => (
                                    <div key={v.violationId} className="border-t border-[var(--admin-border)] px-5 py-4">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                            <div>
                                                <div className="text-sm font-bold text-[var(--admin-ink)]">{v.violationType}</div>
                                                <div className="mt-0.5 text-[0.8rem] text-[var(--admin-muted)]">
                                                    {v.horseName} — {v.description || 'No description'}
                                                </div>
                                                <div className="mt-1 text-xs text-[var(--admin-muted)]">
                                                    {formatDateTime(v.createdAt)}
                                                    {v.isReadOnly ? ' · Pre-race inspection' : ` · Penalty: ${v.penaltyPoints ?? 0} pts`}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                                <span className="inline-flex flex-shrink-0 items-center rounded-full bg-[#f3e1df] px-2.5 py-1 text-[0.68rem] font-bold text-[#a4392f]">
                                                    {v.isReadOnly ? 'Pre-Race Failed' : v.action}
                                                </span>
                                                {!v.isReadOnly && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditViolation(v)}
                                                            title={finalReportIsLocked ? `Final report is ${postRaceReportStatus}.` : 'Edit violation'}
                                                            aria-label="Edit violation"
                                                            disabled={loadingRaceData || Boolean(saving) || finalReportIsLocked}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-primary)] transition-colors hover:bg-[var(--admin-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteViolation(v)}
                                                            title="Delete violation"
                                                            aria-label="Delete violation"
                                                            disabled={loadingRaceData || Boolean(saving) || finalReportIsLocked}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e3bcb7] bg-white text-[#a4392f] transition-colors hover:bg-[#f3e1df] disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </>
                                                )}
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
                                <h2 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: 'var(--admin-ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FaClipboardList style={{ color: 'var(--admin-primary)' }} /> Submit Post-Race Report
                                </h2>
                                <p style={{ margin: '6px 0 0', color: 'var(--admin-muted)', fontSize: 13, fontWeight: 600 }}>
                                    {submitReportHint}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <span className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-3 py-2 text-xs font-black text-[var(--admin-primary)]">
                                    Results: {results.length}
                                </span>
                                <span className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-3 py-2 text-xs font-black text-[var(--admin-primary)]">
                                    Draft: {draftResultCount}
                                </span>
                                <span className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-3 py-2 text-xs font-black text-[var(--admin-primary)]">
                                    Confirmed: {confirmedResultCount}
                                </span>
                                <span className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-3 py-2 text-xs font-black text-[var(--admin-primary)]">
                                    Violations: {violations.length}
                                </span>
                            </div>
                        </div>

                        <div style={{ marginTop: 18 }}>
                            <label className={labelClass}>Post-Race Report</label>
                            <textarea
                                className={inputClass}
                                disabled={loadingRaceData || Boolean(saving) || !canEditFinalReport}
                                onChange={(event) => setReportContent(event.target.value)}
                                placeholder="Summarize race conditions, result notes, incidents, and referee confirmation."
                                rows={5}
                                style={{ minHeight: 118, resize: 'vertical' }}
                                value={reportContent}
                            />
                            <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                                <button
                                    className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--admin-primary)] bg-white px-4 text-sm font-bold text-[var(--admin-primary)] transition-colors hover:bg-[var(--admin-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={loadingRaceData || !selectedRaceId || !canEditFinalReport || !trimmedReportContent}
                                    onClick={handleSavePostRaceReport}
                                    type="button"
                                >
                                    <FaClipboardList />
                                    Save Local Draft
                                </button>
                                {postRaceReport && (
                                    <span style={{ color: 'var(--admin-muted)', fontSize: 12, fontWeight: 700 }}>
                                        Final report #{editingReportId || postRaceReport.reportId}: {postRaceReportStatus}
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmitPostRaceReport}
                            disabled={submitReportDisabled}
                            className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--admin-primary)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <FaCheck />
                            {saving === 'submit-report'
                                ? 'Submitting...'
                                : finalReportIsReturned
                                    ? 'Resubmit Report to Admin'
                                    : 'Submit Report to Admin'}
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
                        className="grid w-[min(440px,100%)] gap-5 rounded-[8px] border border-[var(--admin-border)] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="grid gap-2">
                            <h2 className="m-0 text-[1.15rem] font-black text-[var(--admin-ink)]">
                                {confirmRequest.title}
                            </h2>
                            <p className="m-0 text-[0.92rem] font-semibold leading-6 text-[var(--admin-muted)]">
                                {confirmRequest.message}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 max-[520px]:flex-col">
                            <button
                                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-[var(--admin-border)] bg-white px-4 font-black text-[var(--admin-ink)] transition-colors hover:bg-[var(--admin-surface-strong)]"
                                onClick={() => resolveConfirmRequest(false)}
                                type="button"
                            >
                                {confirmRequest.cancelLabel}
                            </button>
                            <button
                                className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full px-4 font-black text-white transition-colors ${confirmToneClass[confirmRequest.tone] || confirmToneClass.primary}`}
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
