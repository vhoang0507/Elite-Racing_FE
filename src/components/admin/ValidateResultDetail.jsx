import {
    useEffect,
    useState,
} from 'react';

import {
    Link,
    useNavigate,
    useParams,
} from 'react-router-dom';

import {
    FaArrowLeft,
    FaCheck,
    FaExclamationCircle,
    FaFileAlt,
    FaRedoAlt,
    FaTrophy,
    FaUndo,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import {
    confirmAdminAction,
    showAdminSuccess,
    showAdminError,
} from '../../utils/adminFeedback';

import AdminLayout from './AdminLayout';

const formatClass = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');

const pageShellClass = [
    '[--validate-soft-panel:#f8fbff]',
    'grid min-h-[calc(100vh-64px)] content-start gap-7 px-[52px] py-[54px] max-[820px]:px-5 max-[820px]:py-8',
].join(' ');

const panelWidthClass = 'w-[min(100%,1120px)]';


const returnReasonOptions = [
    { value: 'MissingInformation', label: 'Missing information' },
    { value: 'DataMismatch', label: 'Result data mismatch' },
    { value: 'MissingViolationDetails', label: 'Missing violation details' },
    { value: 'IncorrectRaceInformation', label: 'Incorrect race information' },
    { value: 'MissingEvidence', label: 'Missing supporting evidence' },
    { value: 'UnclearConclusion', label: 'Unclear conclusion' },
    { value: 'Other', label: 'Other correction' },
];

const createInitialReturnForm = () => ({
    reasonCategory: 'MissingInformation',
    reason: '',
});

const statusClass = {
    pending: 'border-[#d6a918] bg-[#ffd95e] text-[#8c6508]',
    draft: 'border-[#d6a918] bg-[#ffd95e] text-[#8c6508]',
    refereeconfirmed: 'border-[#d6a918] bg-[#ffd95e] text-[#8c6508]',
    adminapproved: 'border-[#a7dfbf] bg-[#e8f8ef] text-[#1a7d49]',
    published: 'border-[#a7dfbf] bg-[#e8f8ef] text-[#1a7d49]',
    returned: 'border-[#e8897d] bg-[#fff1ef] text-[#a11616]',
    'referee-report': 'border-[#9ab8ff] bg-[#e7f0ff] text-[#1747c2]',
    'violation-report': 'border-[#f1d59b] bg-[#fff7df] text-[#8a5a00]',
    warning: 'border-[#f1d59b] bg-[#fff7df] text-[#8a5a00]',
    disqualified: 'border-[#f0b7ae] bg-[#fff1ef] text-[#a11616]',
};

const formatDateTime = (value) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const formatReportType = (type) => {
    const labels = {
        RefereeReport: 'Referee Report',
        Violation: 'Violation Report',
    };

    return labels[type] || type || 'Referee Report';
};

const formatPhase = (phase) => {
    const labels = {
        PreRace: 'Pre-Race',
        PostRace: 'Post-Race',
    };

    return labels[phase] || phase || 'Post-Race';
};

const formatScore = (value) => {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return String(value);
};

const isViolationReport = (report) => (
    report?.sourceType === 'Violation'
    || Boolean(report?.violationId)
    || Boolean(report?.violationType)
);

const normalizeViolationValue = (value) => String(value || '').replace(/\s+/g, '').toLowerCase();

const isDisqualifiedViolation = (report) => (
    isViolationReport(report)
    && [report?.action, report?.violationType].some((value) => normalizeViolationValue(value) === 'disqualified')
);

const formatPenaltyPoints = (value) => {
    if (value === null || value === undefined || value === '') {
        return 'Optional';
    }

    return String(value);
};

const formatRegistrationSelection = (report) => {
    const horseName = report?.horseName || '';
    const jockeyLabel = report?.jockeyName || (report?.jockeyId ? `Jockey ${report.jockeyId}` : '');

    if (horseName && jockeyLabel) {
        return `${horseName} - ${jockeyLabel}`;
    }

    if (horseName) {
        return horseName;
    }

    if (jockeyLabel) {
        return jockeyLabel;
    }

    return report?.registrationId ? `Registration ${report.registrationId}` : '';
};

function ValidateResultDetail() {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [returnForm, setReturnForm] = useState(createInitialReturnForm);
    const [returnFormError, setReturnFormError] = useState('');

    const loadDetail = async () => {
        setLoading(true);
        setError('');

        try {
            const payload = await adminApi.getResultReportDetail(resultId);
            setDetail(payload);
        } catch (err) {
            setDetail(null);
            setError(err.message || 'Failed to load referee report.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        setLoading(true);
        setError('');

        adminApi.getResultReportDetail(resultId)
            .then((payload) => {
                if (isMounted) {
                    setDetail(payload);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setDetail(null);
                    setError(err.message || 'Failed to load referee report.');
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [resultId]);

    const getFinalPostRaceReport = () => {
        const reports = detail?.postRace?.reports || detail?.reports || [];

        return reports.find((report) => (
            report?.reportPhase === 'PostRace'
            && report?.sourceType !== 'Violation'
            && report?.reportId
        )) || null;
    };

    const handleApprove = async () => {
        const confirmed = await confirmAdminAction({
            title: 'Approve result report',
            message: hasDisqualifiedViolations
                ? 'Disqualified participants will be excluded from official ranks and prize awards. Approve and publish the remaining valid results?'
                : 'Are you sure you want to approve this result report? This will publish all referee-confirmed results and award prizes.',
            confirmLabel: 'Approve',
        });

        if (!confirmed) return;

        setActionLoading(true);
        try {
            const raceId = detail?.raceId || postRaceResults.find((result) => result?.raceId)?.raceId;
            const approvableResults = postRaceResults.filter((result) => (
                result?.status === 'RefereeConfirmed'
                || result?.status === 'AdminApproved'
            ));

            if (!raceId) {
                throw new Error('Race information is missing for this approval.');
            }

            if (approvableResults.length === 0) {
                throw new Error('No referee-confirmed results to approve.');
            }

            const finalReport = getFinalPostRaceReport();

            if (!finalReport) {
                throw new Error('The final post-race report is missing.');
            }

            if (finalReport.status === 'Returned') {
                throw new Error('The final report was returned and must be resubmitted before approval.');
            }

            if (!['Submitted', 'Approved'].includes(finalReport.status)) {
                throw new Error(`The final report cannot be approved from status ${finalReport.status || 'N/A'}.`);
            }

            // One BE endpoint now validates everything first, then approves the
            // final report and publishes every result in a single transaction.
            await adminApi.approveAllResults(raceId);

            showAdminSuccess('Final report and all race results approved together.', 'Approved');
            setTimeout(() => navigate('/admin/results'), 1500);
        } catch (err) {
            showAdminError(err.message || 'Failed to approve result.');
        } finally {
            setActionLoading(false);
        }
    };

    const openReturnModal = () => {
        setReturnForm(createInitialReturnForm());
        setReturnFormError('');
        setReturnModalOpen(true);
    };

    const closeReturnModal = () => {
        if (actionLoading) return;

        setReturnModalOpen(false);
        setReturnFormError('');
    };

    const handleReturnFormChange = (field) => (event) => {
        const { value } = event.target;

        setReturnForm((current) => ({
            ...current,
            [field]: value,
        }));

        if (returnFormError) {
            setReturnFormError('');
        }
    };

    const handleReturn = async (event) => {
        event.preventDefault();

        const trimmedReason = String(returnForm.reason || '').trim();

        if (!returnForm.reasonCategory) {
            setReturnFormError('Choose the main reason for returning this submission.');
            return;
        }

        if (trimmedReason.length < 10 || trimmedReason.length > 1000) {
            setReturnFormError('Correction instructions must contain between 10 and 1,000 characters.');
            return;
        }

        setActionLoading(true);
        setReturnFormError('');

        try {
            const finalReport = getFinalPostRaceReport();

            if (!finalReport?.reportId) {
                throw new Error('The final post-race report is missing.');
            }

            if (!['Submitted', 'Approved', 'Returned'].includes(finalReport.status)) {
                throw new Error(`The final report cannot be returned from status ${finalReport.status || 'N/A'}.`);
            }

            if (finalReport.status !== 'Returned') {
                // One BE endpoint returns the report, every race result, and the
                // race status together. It also repairs the old partial state
                // where the report was Approved but the results were not published.
                await adminApi.returnRefereeReport(
                    finalReport.reportId,
                    trimmedReason,
                    returnForm.reasonCategory
                );
            }

            setReturnModalOpen(false);
            showAdminSuccess('Final report and all results returned to referee.', 'Returned');
            setTimeout(() => navigate('/admin/results'), 1500);
        } catch (err) {
            const message = err.message || 'Failed to return result.';
            setReturnFormError(message);
            showAdminError(message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRetryPredictionEvaluation = async () => {
        const raceId = detail?.raceId || postRaceResults.find((result) => result?.raceId)?.raceId;

        if (!raceId) {
            showAdminError('Race information is missing for prediction evaluation.');
            return;
        }

        const confirmed = await confirmAdminAction({
            title: 'Retry prediction evaluation',
            message: 'Retry prediction evaluation for this race?',
            confirmLabel: 'Retry Evaluation',
        });

        if (!confirmed) return;

        setActionLoading(true);

        try {
            const response = await adminApi.evaluateRacePredictions(raceId);
            const successMessage = response?.message || response?.Message || 'Prediction evaluation completed.';
            showAdminSuccess(successMessage, 'Evaluated');
            await loadDetail();
        } catch (err) {
            showAdminError(err.message || 'Failed to evaluate predictions.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReopenPublishedResults = async () => {
        const raceId = detail?.raceId || postRaceResults.find((result) => result?.raceId)?.raceId;

        if (!raceId) {
            showAdminError('Race information is missing for result correction.');
            return;
        }

        const reason = window.prompt('Reason for reopening published results?');
        const trimmedReason = String(reason || '').trim();

        if (!trimmedReason) {
            return;
        }

        if (trimmedReason.length < 10 || trimmedReason.length > 1000) {
            showAdminError('Reopen reason must be between 10 and 1,000 characters.');
            return;
        }

        const confirmed = await confirmAdminAction({
            title: 'Reopen published results',
            message: 'This will move published results back to referee-confirmed status for correction.',
            confirmLabel: 'Reopen',
            tone: 'danger',
        });

        if (!confirmed) return;

        setActionLoading(true);

        try {
            const response = await adminApi.reopenPublishedRaceResults(raceId, trimmedReason);
            showAdminSuccess(response?.message || response?.Message || 'Published results reopened for correction.', 'Reopened');
            await loadDetail();
        } catch (err) {
            showAdminError(err.message || 'Failed to reopen published results.');
        } finally {
            setActionLoading(false);
        }
    };

    const isStandaloneReport = detail?.detailType === 'admin-report';
    const heading = isStandaloneReport
        ? `${formatReportType(detail?.sourceType)}: ${detail?.raceName || 'Race report'}`
        : `Post-Race Submission: ${detail?.raceName || 'Race result'}`;
    const description = isStandaloneReport
        ? 'Full referee report information submitted from the referee workflow.'
        : 'Official race results and logged violations submitted by the race referee for admin review.';
    const tournamentName = detail?.tournamentName || detail?.raceName || '-';
    const postRaceResults = detail?.postRace?.results || [];
    const canReopenPublishedResults = !isStandaloneReport && (
        detail?.status === 'Published'
        || postRaceResults.some((result) => result?.status === 'Published')
    );
    const postRaceReports = detail?.postRace?.reports || detail?.reports || [];
    const postRaceViolations = postRaceReports.filter(isViolationReport);
    const disqualifiedViolations = postRaceViolations.filter(isDisqualifiedViolation);
    const disqualifiedRegistrationIds = new Set(disqualifiedViolations
        .map((violation) => violation?.registrationId)
        .filter(Boolean)
        .map(String));
    const hasDisqualifiedViolations = disqualifiedViolations.length > 0;
    const getDisqualifiedViolation = (result) => disqualifiedViolations.find((violation) => (
        result?.registrationId
        && violation?.registrationId
        && String(result.registrationId) === String(violation.registrationId)
    ));
    const isPostRaceReportItem = (report) => report.reportPhase === 'PostRace';
    const getReportTournament = (report) => report.tournamentName || detail?.tournamentName || detail?.raceName || '-';
    const getReportSubtitle = (report) => (
        isPostRaceReportItem(report)
            ? `${formatPhase(report.reportPhase)} | ${getReportTournament(report)}`
            : `${formatPhase(report.reportPhase)} | Race #${report.raceId || '-'} | Registration #${report.registrationId || '-'} | Referee ${report.refereeName || detail?.refereeName || `#${report.refereeId || '-'}`}`
    );
    const getReportMetaRows = (report) => {
        if (isViolationReport(report)) {
            return [
                ['Report Phase', formatPhase(report.reportPhase)],
                ['Tournament', getReportTournament(report)],
                ['Race', report.raceName || detail?.raceName],
                ['Registration', formatRegistrationSelection(report)],
                ['Registration Status', report.registrationStatus],
                ['Violation Type', report.violationType],
                ['Action', report.action],
                ['Penalty Points', formatPenaltyPoints(report.penaltyPoints)],
                ['Referee', report.refereeName || detail?.refereeName],
            ];
        }

        if (isPostRaceReportItem(report)) {
            return [
                ['Report Phase', formatPhase(report.reportPhase)],
                ['Tournament', getReportTournament(report)],
            ];
        }

        return [
            ['Report Phase', formatPhase(report.reportPhase)],
            ['Tournament', getReportTournament(report)],
            ['Horse', report.horseName || detail?.horseName],
            ['Referee', report.refereeName || detail?.refereeName],
            ['Referee ID', report.refereeId || detail?.refereeId],
        ];
    };
    const renderReportCards = (items, emptyText) => (
        items.length > 0 ? (
            <div className="divide-y divide-[var(--admin-border)]">
                {items.map((report) => (
                    <article className="grid gap-4 px-6 py-5" key={report.id}>
                        <div className="flex items-start justify-between gap-4 max-[820px]:flex-col">
                            <div className="flex items-start gap-3">
                                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                                    <FaFileAlt aria-hidden="true" />
                                </span>
                                <div>
                                    <h3 className="m-0 text-[1rem] font-black text-[var(--admin-primary-dark)]">{report.title}</h3>
                                    <p className="m-0 mt-1 text-[0.75rem] font-bold text-[var(--admin-muted)]">
                                        {getReportSubtitle(report)}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[0.75rem] font-bold text-[#6d5752]">{formatDateTime(report.submittedAt)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 rounded-md border border-[var(--admin-border)] bg-[#f8fbff] p-4 text-[0.78rem] font-bold text-[var(--admin-muted)] max-[720px]:grid-cols-1">
                            {getReportMetaRows(report)
                                .filter(([, value]) => value !== undefined && value !== null && value !== '')
                                .map(([label, value]) => (
                                    <div className="grid gap-1" key={label}>
                                        <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#64748b]">{label}</span>
                                        <strong className="text-[0.88rem] text-[var(--admin-ink)]">{value}</strong>
                                    </div>
                                ))}
                        </div>

                        <p className="m-0 whitespace-pre-wrap rounded-md border border-[#dbe7f3] bg-white px-4 py-3 text-[0.9rem] font-semibold leading-7 text-[#334155]">
                            {report.content}
                        </p>

                        {(!isViolationReport(report) && (report.violationType || report.action || report.penaltyPoints !== undefined)) ? (
                            <div className="flex flex-wrap gap-2 text-[0.72rem] font-black text-[#6d5752]">
                                {report.violationType ? <span className="rounded border border-[#e6d3cf] bg-[#fff7f5] px-2.5 py-1">Type: {report.violationType}</span> : null}
                                {report.action ? <span className="rounded border border-[#e6d3cf] bg-[#fff7f5] px-2.5 py-1">Action: {report.action}</span> : null}
                                {report.penaltyPoints !== undefined && report.penaltyPoints !== null ? <span className="rounded border border-[#e6d3cf] bg-[#fff7f5] px-2.5 py-1">Penalty: {report.penaltyPoints}</span> : null}
                            </div>
                        ) : null}
                    </article>
                ))}
            </div>
        ) : (
            <div className="px-6 py-8 text-[0.9rem] font-bold text-[var(--admin-muted)]">
                {emptyText}
            </div>
        )
    );

    return (
        <AdminLayout activeKey="results" mainClassName="validate-detail-main">
            <section className={pageShellClass}>
                <div className={`${panelWidthClass} flex items-start justify-between gap-4 max-[820px]:flex-col`}>
                    <div>
                        <Link
                            className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-3 text-[0.78rem] font-black text-[var(--admin-primary)] no-underline transition-colors hover:border-[var(--admin-gold)]"
                            to="/admin/results"
                        >
                            <FaArrowLeft aria-hidden="true" className="h-3 w-3" />
                            Return
                        </Link>
                        <h1 className="page-title">
                            {heading}
                        </h1>
                        <p className="page-subtitle max-w-[720px] leading-[1.45]">
                            {description}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {!loading && !error && !isStandaloneReport && detail?.status === 'RefereeConfirmed' && (
                            <>
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={openReturnModal}
                                    className="flex min-h-[38px] cursor-pointer items-center gap-2 rounded-full border border-[#d89288] bg-white px-4 text-[0.78rem] font-black text-[#a4392f] transition-colors hover:bg-[#f3e1df] disabled:opacity-50"
                                >
                                    <FaUndo aria-hidden="true" className="h-3 w-3" />
                                    Return
                                </button>
                                <button
                                    type="button"
                                    disabled={actionLoading || !detail?.raceId}
                                    onClick={handleApprove}
                                    className="flex min-h-[38px] cursor-pointer items-center gap-2 rounded-full bg-[var(--admin-primary)] px-4 text-[0.78rem] font-black text-white hover:bg-[var(--admin-primary-dark)] disabled:opacity-50"
                                >
                                    <FaCheck aria-hidden="true" className="h-3 w-3" />
                                    Approve
                                </button>
                            </>
                        )}
                        {!loading && !error && detail?.raceId && (
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={handleRetryPredictionEvaluation}
                                className="flex min-h-[38px] cursor-pointer items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 text-[0.78rem] font-black text-[var(--admin-primary)] transition-colors hover:border-[var(--admin-gold)] disabled:opacity-50"
                            >
                                <FaRedoAlt aria-hidden="true" className="h-3 w-3" />
                                Retry Evaluation
                            </button>
                        )}
                        {!loading && !error && canReopenPublishedResults && (
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={handleReopenPublishedResults}
                                className="flex min-h-[38px] cursor-pointer items-center gap-2 rounded-full border border-[#d89288] bg-white px-4 text-[0.78rem] font-black text-[#a4392f] transition-colors hover:bg-[#f3e1df] disabled:opacity-50"
                            >
                                <FaUndo aria-hidden="true" className="h-3 w-3" />
                                Reopen
                            </button>
                        )}
                        <button
                            aria-label="Refresh referee report"
                            className="grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-full border border-[var(--admin-border)] bg-white text-[#64748b] transition-colors hover:border-[var(--admin-gold)] hover:text-[var(--admin-primary)]"
                            disabled={loading}
                            onClick={loadDetail}
                            type="button"
                        >
                            <FaRedoAlt aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <section className={`${panelWidthClass} rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6`}>
                        <p className="m-0 font-bold text-[var(--admin-muted)]">Loading referee report...</p>
                    </section>
                ) : error ? (
                    <section className={`${panelWidthClass} flex items-start gap-3 rounded-[var(--admin-radius)] border border-[#f0b7ae] bg-[#f8fbff] p-6 text-[var(--admin-primary)]`}>
                        <FaExclamationCircle aria-hidden="true" className="mt-1 flex-none" />
                        <p className="m-0 text-[0.9rem] font-bold">{error}</p>
                    </section>
                ) : (
                    <>
                        <section
                            aria-label="Report summary"
                            className={`${panelWidthClass} grid grid-cols-5 gap-4 max-[1160px]:grid-cols-3 max-[820px]:grid-cols-2 max-[640px]:grid-cols-1`}
                        >
                            <article className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-4">
                                <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#704b46]">Tournament</span>
                                <strong className="mt-1 block text-[1rem] leading-[1.15] text-[var(--admin-primary-dark)]">{tournamentName}</strong>
                            </article>
                            <article className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-4">
                                <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#704b46]">Race</span>
                                <strong className="mt-1 block text-[1rem] leading-[1.15] text-[var(--admin-primary-dark)]">{detail?.raceName || '-'}</strong>
                            </article>
                            <article className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-4">
                                <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#704b46]">Referee</span>
                                <strong className="mt-1 block text-[1rem] leading-[1.15] text-[var(--admin-primary-dark)]">
                                    {detail?.refereeName || (detail?.refereeId ? `#${detail.refereeId}` : '-')}
                                </strong>
                            </article>
                            <article className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-4">
                                <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#704b46]">Submitted</span>
                                <strong className="mt-1 block text-[1rem] leading-[1.15] text-[var(--admin-primary-dark)]">{formatDateTime(detail?.submittedAt)}</strong>
                            </article>
                            <article className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-4">
                                <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#704b46]">{isStandaloneReport ? 'Report Type' : 'Status'}</span>
                                <span className={`mt-2 inline-flex min-h-7 items-center rounded-full border px-3 text-[0.68rem] font-extrabold ${statusClass[formatClass(detail?.status)] || statusClass.pending}`}>
                                    {isStandaloneReport ? formatReportType(detail?.sourceType) : (detail?.status || '-')}
                                </span>
                            </article>
                        </section>

                        {detail?.reportError ? (
                            <section className={`${panelWidthClass} rounded-[var(--admin-radius)] border border-[#f0b7ae] bg-[#fff8f6] px-6 py-4 text-[0.82rem] font-bold text-[var(--admin-primary)]`}>
                                {detail.reportError}
                            </section>
                        ) : null}

                        {hasDisqualifiedViolations ? (
                            <section className={`${panelWidthClass} flex items-start gap-3 rounded-[var(--admin-radius)] border border-[#f0b7ae] bg-[#fff1ef] px-6 py-4 text-[#a11616]`}>
                                <FaExclamationCircle aria-hidden="true" className="mt-1 flex-none" />
                                <div className="grid gap-2">
                                    <p className="m-0 text-[0.88rem] font-black">
                                        {disqualifiedRegistrationIds.size} disqualified registration{disqualifiedRegistrationIds.size === 1 ? '' : 's'} found.
                                    </p>
                                    <p className="m-0 text-[0.8rem] font-bold leading-6">
                                        Disqualified participants will be excluded from official ranks and prize awards when results are approved.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {disqualifiedViolations.map((violation) => (
                                            <span
                                                className="inline-flex min-h-7 items-center rounded-full border border-[#f0b7ae] bg-white px-3 text-[0.68rem] font-extrabold text-[#a11616]"
                                                key={violation.id || violation.violationId || violation.registrationId}
                                            >
                                                {formatRegistrationSelection(violation) || `Registration ${violation.registrationId || '-'}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        ) : null}

                        <section
                            aria-label="Post-race workflow"
                            className={`${panelWidthClass} overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_16px_34px_rgba(15,23,42,0.06)]`}
                        >
                            <div className="flex min-h-[62px] items-center justify-between gap-4 border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-6 py-3.5 max-[820px]:flex-col max-[820px]:items-stretch">
                                <div className="flex items-center gap-3">
                                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                                        <FaTrophy aria-hidden="true" />
                                    </span>
                                    <h2 className="m-0 text-[1rem] font-black text-[var(--admin-ink)]">Post-Race</h2>
                                </div>
                                <span className="text-[0.72rem] font-extrabold text-[#475569]">
                                    {postRaceResults.length} result{postRaceResults.length === 1 ? '' : 's'} | {postRaceViolations.length} violation{postRaceViolations.length === 1 ? '' : 's'}
                                </span>
                            </div>

                            <div className="border-b border-[var(--admin-border)] px-6 py-5">
                                <h3 className="m-0 mb-4 text-[0.95rem] font-black text-[var(--admin-primary-dark)]">Result Ranking</h3>
                                {postRaceResults.length > 0 ? (
                                    <div className="overflow-x-auto rounded-md border border-[var(--admin-border)]">
                                        <table className="w-full min-w-[760px] border-collapse bg-white">
                                            <thead>
                                                <tr>
                                                    {['Rank', 'Horse', 'Registration', 'Outcome', 'Time', 'Score', 'Status', 'Note'].map((label) => (
                                                        <th className="border-b border-[var(--admin-border)] bg-[#f8fbff] px-4 py-3 text-left text-[0.62rem] font-black uppercase tracking-normal text-[#64748b]" key={label}>
                                                            {label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {postRaceResults.map((result) => {
                                                    const disqualifiedViolation = getDisqualifiedViolation(result);

                                                    return (
                                                        <tr
                                                            className={disqualifiedViolation ? 'bg-[#fff8f6]' : ''}
                                                            key={result.resultId || result.registrationId}
                                                        >
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.86rem] font-black text-[var(--admin-primary-dark)]">
                                                            {result.finishPosition ? `#${result.finishPosition}` : '-'}
                                                        </td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3">
                                                            <strong className="block text-[0.86rem] text-[var(--admin-ink)]">{result.horse}</strong>
                                                            <span className="text-[0.72rem] font-bold text-[var(--admin-muted)]">Horse #{result.horseId || '-'}</span>
                                                            {disqualifiedViolation ? (
                                                                <span className="mt-1 inline-flex min-h-6 items-center rounded-full border border-[#f0b7ae] bg-[#fff1ef] px-2.5 text-[0.62rem] font-extrabold text-[#a11616]">
                                                                    Disqualified
                                                                </span>
                                                            ) : null}
                                                        </td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.82rem] font-bold text-[var(--admin-muted)]">
                                                            #{result.registrationId || '-'}
                                                        </td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.82rem] font-bold text-[var(--admin-ink)]">
                                                            {result.outcomeStatus || 'Finished'}
                                                        </td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.82rem] font-bold text-[var(--admin-ink)]">
                                                            {result.finishTime}
                                                        </td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.82rem] font-bold text-[var(--admin-ink)]">
                                                            {formatScore(result.score)}
                                                        </td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3">
                                                            <span className={`inline-flex min-h-6 items-center rounded-full border px-2.5 text-[0.66rem] font-extrabold ${statusClass[formatClass(result.status)] || statusClass.pending}`}>
                                                                {result.status || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.82rem] font-semibold text-[var(--admin-muted)]">
                                                            {disqualifiedViolation
                                                                ? 'Excluded from official rank and prize'
                                                                : (result.note || '-')}
                                                        </td>
                                                    </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="rounded-md border border-[var(--admin-border)] bg-[#f8fbff] px-4 py-5 text-[0.9rem] font-bold text-[var(--admin-muted)]">
                                        No Post-Race result ranking is available for this race.
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="border-b border-[var(--admin-border)] px-6 py-4">
                                    <h3 className="m-0 text-[0.95rem] font-black text-[var(--admin-primary-dark)]">Violations</h3>
                                </div>
                                {renderReportCards(
                                    postRaceViolations,
                                    'No violations were reported for this race.'
                                )}
                            </div>
                        </section>
                    </>
                )}
            </section>

            {returnModalOpen ? (
                <div
                    aria-labelledby="return-submission-title"
                    aria-modal="true"
                    className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-[#07152d]/65 px-4 py-8 backdrop-blur-[2px]"
                    onMouseDown={closeReturnModal}
                    role="dialog"
                >
                    <form
                        className="w-[min(100%,620px)] overflow-hidden rounded-[22px] border border-[#e0c98c] bg-white shadow-[0_28px_80px_rgba(3,15,38,0.35)]"
                        onMouseDown={(event) => event.stopPropagation()}
                        onSubmit={handleReturn}
                    >
                        <div className="flex items-start justify-between gap-5 border-b border-[#eadfca] bg-[#fffaf0] px-6 py-5">
                            <div className="flex items-start gap-3.5">
                                <span className="grid h-11 w-11 flex-none place-items-center rounded-full border border-[#efb9b1] bg-[#fff0ed] text-[#a62c22]">
                                    <FaUndo aria-hidden="true" />
                                </span>
                                <div>
                                    <h2 className="m-0 text-[1.18rem] font-black text-[#102b57]" id="return-submission-title">
                                        Return to referee for correction
                                    </h2>
                                    <p className="m-0 mt-1.5 max-w-[470px] text-[0.8rem] font-semibold leading-5 text-[#6b7280]">
                                        The final post-race report, all referee-confirmed results, and the race status will be returned together.
                                    </p>
                                </div>
                            </div>
                            <button
                                aria-label="Close return dialog"
                                className="grid h-9 w-9 flex-none cursor-pointer place-items-center rounded-full border border-[#ded4c2] bg-white text-[1.35rem] font-bold leading-none text-[#42526b] hover:bg-[#f6efe4] disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={actionLoading}
                                onClick={closeReturnModal}
                                type="button"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid gap-5 px-6 py-6">
                            <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#dbe5f0] bg-[#f7faff] p-4 max-[620px]:grid-cols-1">
                                <div>
                                    <span className="block text-[0.62rem] font-black uppercase tracking-wide text-[#718096]">Tournament</span>
                                    <strong className="mt-1 block text-[0.87rem] text-[#17233b]">{tournamentName}</strong>
                                </div>
                                <div>
                                    <span className="block text-[0.62rem] font-black uppercase tracking-wide text-[#718096]">Referee</span>
                                    <strong className="mt-1 block text-[0.87rem] text-[#17233b]">{detail?.refereeName || `#${detail?.refereeId || '-'}`}</strong>
                                </div>
                            </div>

                            <label className="grid gap-2 text-[0.74rem] font-black uppercase tracking-wide text-[#48658f]">
                                Correction category
                                <select
                                    autoFocus
                                    className="min-h-[46px] rounded-xl border border-[#d8c58d] bg-white px-4 text-[0.9rem] font-bold normal-case tracking-normal text-[#17233b] outline-none transition focus:border-[#0f3d79] focus:ring-2 focus:ring-[#0f3d79]/15"
                                    disabled={actionLoading}
                                    onChange={handleReturnFormChange('reasonCategory')}
                                    value={returnForm.reasonCategory}
                                >
                                    {returnReasonOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="grid gap-2 text-[0.74rem] font-black uppercase tracking-wide text-[#48658f]">
                                Instructions for the referee
                                <textarea
                                    className="min-h-[150px] resize-y rounded-xl border border-[#d8c58d] bg-white px-4 py-3 text-[0.92rem] font-semibold leading-6 normal-case tracking-normal text-[#17233b] outline-none transition placeholder:font-medium placeholder:text-[#98a2b3] focus:border-[#0f3d79] focus:ring-2 focus:ring-[#0f3d79]/15"
                                    disabled={actionLoading}
                                    maxLength={1000}
                                    onChange={handleReturnFormChange('reason')}
                                    placeholder="Describe exactly what is incorrect and what the referee must update before resubmitting..."
                                    value={returnForm.reason}
                                />
                            </label>

                            <div className="flex items-start justify-between gap-4 text-[0.72rem] font-bold">
                                <span className={returnForm.reason.trim().length > 0 && returnForm.reason.trim().length < 10 ? 'text-[#a62c22]' : 'text-[#718096]'}>
                                    Minimum 10 characters. This message will be shown to the referee.
                                </span>
                                <span className="flex-none text-[#718096]">{returnForm.reason.length}/1000</span>
                            </div>

                            {returnFormError ? (
                                <div className="flex items-start gap-3 rounded-xl border border-[#efb9b1] bg-[#fff2ef] px-4 py-3 text-[0.82rem] font-bold leading-5 text-[#a62c22]" role="alert">
                                    <FaExclamationCircle aria-hidden="true" className="mt-0.5 flex-none" />
                                    <span>{returnFormError}</span>
                                </div>
                            ) : null}

                            <div className="rounded-xl border border-[#f1d49d] bg-[#fff8e8] px-4 py-3 text-[0.78rem] font-semibold leading-5 text-[#765216]">
                                Returning this submission does not delete the data. The referee can edit the returned report and results, then submit them again for approval.
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-[#eadfca] bg-[#fffdf9] px-6 py-4 max-[520px]:flex-col-reverse">
                            <button
                                className="min-h-[44px] cursor-pointer rounded-full border border-[#d8c58d] bg-white px-5 text-[0.8rem] font-black text-[#17335f] hover:bg-[#f8f1e4] disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={actionLoading}
                                onClick={closeReturnModal}
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#a62c22] px-5 text-[0.8rem] font-black text-white shadow-[0_8px_20px_rgba(166,44,34,0.2)] hover:bg-[#87241d] disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={actionLoading || returnForm.reason.trim().length < 10}
                                type="submit"
                            >
                                <FaUndo aria-hidden="true" className="h-3.5 w-3.5" />
                                {actionLoading ? 'Returning...' : 'Return to Referee'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}
        </AdminLayout>
    );
}

export default ValidateResultDetail;
