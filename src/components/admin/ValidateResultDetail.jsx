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

import AdminLayout from './AdminLayout';

const formatClass = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');

const pageShellClass = [
    '[--validate-soft-panel:#f8fbff]',
    'grid min-h-[calc(100vh-64px)] content-start gap-7 px-[52px] py-[54px] max-[820px]:px-5 max-[820px]:py-8',
].join(' ');

const panelWidthClass = 'w-[min(100%,1120px)]';

const statusClass = {
    pending: 'border-[#d6a918] bg-[#ffd95e] text-[#8c6508]',
    draft: 'border-[#d6a918] bg-[#ffd95e] text-[#8c6508]',
    refereeconfirmed: 'border-[#d6a918] bg-[#ffd95e] text-[#8c6508]',
    adminapproved: 'border-[#a7dfbf] bg-[#e8f8ef] text-[#1a7d49]',
    returned: 'border-[#e8897d] bg-[#e8f7ef] text-[var(--admin-primary)]',
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

function ValidateResultDetail() {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');

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

    const handleApprove = async () => {
        if (!window.confirm('Approve this result? This will publish it and award prizes.')) return;
        setActionLoading(true);
        setActionError('');
        setActionSuccess('');
        try {
            await adminApi.publishResult(resultId);
            await loadDetail();
            setActionSuccess('Result approved and refreshed.');
        } catch (err) {
            setActionError(err.message || 'Failed to approve result.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReturn = async () => {
        if (!window.confirm('Return this result to the referee for correction?')) return;
        setActionLoading(true);
        setActionError('');
        setActionSuccess('');
        try {
            await adminApi.rejectResult(resultId);
            setActionSuccess('Result returned to referee.');
            setTimeout(() => navigate('/admin/results'), 1500);
        } catch (err) {
            setActionError(err.message || 'Failed to return result.');
        } finally {
            setActionLoading(false);
        }
    };

    const isStandaloneReport = detail?.detailType === 'admin-report';
    const heading = isStandaloneReport
        ? `${formatReportType(detail?.sourceType)}: ${detail?.raceName || 'Race report'}`
        : `Referee Report: ${detail?.raceName || 'Race result'}`;
    const description = isStandaloneReport
        ? 'Full referee report information submitted from the referee workflow.'
        : 'Official report content submitted by the race referee for admin review.';
    const tournamentName = detail?.tournamentName || detail?.raceName || '-';
    const postRaceResults = detail?.postRace?.results || [];
    const postRaceReports = detail?.postRace?.reports || detail?.reports || [];
    const isPostRaceReportItem = (report) => report.reportPhase === 'PostRace';
    const getReportTournament = (report) => report.tournamentName || detail?.tournamentName || detail?.raceName || '-';
    const getReportSubtitle = (report) => (
        isPostRaceReportItem(report)
            ? `${formatPhase(report.reportPhase)} | ${getReportTournament(report)}`
            : `${formatPhase(report.reportPhase)} | Race #${report.raceId || '-'} | Registration #${report.registrationId || '-'} | Referee ${report.refereeName || detail?.refereeName || `#${report.refereeId || '-'}`}`
    );
    const getReportMetaRows = (report) => {
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
                                <span className="grid h-10 w-10 flex-none place-items-center rounded-md bg-[#e8f7ef] text-[var(--admin-primary)]">
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

                        {(report.violationType || report.action || report.penaltyPoints !== undefined) ? (
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
                            className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--admin-border)] bg-white px-3 text-[0.78rem] font-black text-[var(--admin-primary)] no-underline hover:bg-[#e8f7ef]"
                            to="/admin/results"
                        >
                            <FaArrowLeft aria-hidden="true" className="h-3 w-3" />
                            Return
                        </Link>
                        <h1 className="m-0 text-[1.9rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[820px]:text-[1.5rem]">
                            {heading}
                        </h1>
                        <p className="mt-2 max-w-[720px] text-[0.92rem] font-semibold leading-[1.45] text-[var(--admin-muted)]">
                            {description}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {!loading && !error && !isStandaloneReport && detail?.status === 'RefereeConfirmed' && (
                            <>
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={handleReturn}
                                    className="flex min-h-[38px] cursor-pointer items-center gap-2 rounded-md border border-[#f0b7ae] bg-white px-4 text-[0.78rem] font-black text-[#a11616] hover:bg-[#fff1ef] disabled:opacity-50"
                                >
                                    <FaUndo aria-hidden="true" className="h-3 w-3" />
                                    Return
                                </button>
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={handleApprove}
                                    className="flex min-h-[38px] cursor-pointer items-center gap-2 rounded-md bg-[var(--admin-primary)] px-4 text-[0.78rem] font-black text-white hover:bg-[var(--admin-primary-dark)] disabled:opacity-50"
                                >
                                    <FaCheck aria-hidden="true" className="h-3 w-3" />
                                    {actionLoading ? 'Approving...' : 'Approve'}
                                </button>
                            </>
                        )}
                        <button
                            aria-label="Refresh referee report"
                            className="grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[#64748b] hover:bg-[#e8f7ef] hover:text-[var(--admin-primary)]"
                            disabled={loading}
                            onClick={loadDetail}
                            type="button"
                        >
                            <FaRedoAlt aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {actionError && (
                    <section className={`${panelWidthClass} flex items-start gap-3 rounded-[var(--admin-radius)] border border-[#f0b7ae] bg-[#fff1ef] p-4 text-[#a11616]`}>
                        <FaExclamationCircle aria-hidden="true" className="mt-0.5 flex-none" />
                        <p className="m-0 text-[0.88rem] font-bold">{actionError}</p>
                    </section>
                )}

                {actionSuccess && (
                    <section className={`${panelWidthClass} rounded-[var(--admin-radius)] border border-[#a7dfbf] bg-[#e8f8ef] p-4 text-[#1a7d49]`}>
                        <p className="m-0 text-[0.88rem] font-bold">{actionSuccess}</p>
                    </section>
                )}

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

                        <section
                            aria-label="Post-race workflow"
                            className={`${panelWidthClass} overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_16px_34px_rgba(15,23,42,0.06)]`}
                        >
                            <div className="flex min-h-[62px] items-center justify-between gap-4 border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-6 py-3.5 max-[820px]:flex-col max-[820px]:items-stretch">
                                <div className="flex items-center gap-3">
                                    <span className="grid h-9 w-9 place-items-center rounded-md bg-[#e8f7ef] text-[var(--admin-primary)]">
                                        <FaTrophy aria-hidden="true" />
                                    </span>
                                    <h2 className="m-0 text-[1rem] font-black text-[var(--admin-ink)]">Post-Race</h2>
                                </div>
                                <span className="text-[0.72rem] font-extrabold text-[#475569]">
                                    {postRaceResults.length} result{postRaceResults.length === 1 ? '' : 's'} | {postRaceReports.length} report{postRaceReports.length === 1 ? '' : 's'}
                                </span>
                            </div>

                            <div className="border-b border-[var(--admin-border)] px-6 py-5">
                                <h3 className="m-0 mb-4 text-[0.95rem] font-black text-[var(--admin-primary-dark)]">Result Ranking</h3>
                                {postRaceResults.length > 0 ? (
                                    <div className="overflow-x-auto rounded-md border border-[var(--admin-border)]">
                                        <table className="w-full min-w-[760px] border-collapse bg-white">
                                            <thead>
                                                <tr>
                                                    {['Rank', 'Horse', 'Registration', 'Time', 'Score', 'Status', 'Note'].map((label) => (
                                                        <th className="border-b border-[var(--admin-border)] bg-[#f8fbff] px-4 py-3 text-left text-[0.62rem] font-black uppercase tracking-normal text-[#64748b]" key={label}>
                                                            {label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {postRaceResults.map((result) => (
                                                    <tr key={result.resultId || result.registrationId}>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.86rem] font-black text-[var(--admin-primary-dark)]">
                                                            {result.finishPosition ? `#${result.finishPosition}` : '-'}
                                                        </td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3">
                                                            <strong className="block text-[0.86rem] text-[var(--admin-ink)]">{result.horse}</strong>
                                                            <span className="text-[0.72rem] font-bold text-[var(--admin-muted)]">Horse #{result.horseId || '-'}</span>
                                                        </td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.82rem] font-bold text-[var(--admin-muted)]">
                                                            #{result.registrationId || '-'}
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
                                                            {result.note || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
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
                                    <h3 className="m-0 text-[0.95rem] font-black text-[var(--admin-primary-dark)]">Referee Report</h3>
                                </div>
                                {renderReportCards(
                                    postRaceReports,
                                    'No Post-Race report is available for this race.'
                                )}
                            </div>
                        </section>
                    </>
                )}
            </section>
        </AdminLayout>
    );
}

export default ValidateResultDetail;
