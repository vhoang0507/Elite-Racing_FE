import {
    useEffect,
    useState,
} from 'react';

import {
    Link,
    useParams,
} from 'react-router-dom';

import {
    FaArrowLeft,
    FaExclamationCircle,
    FaFileAlt,
    FaRedoAlt,
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

function ValidateResultDetail() {
    const { resultId } = useParams();
    const [detail, setDetail] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

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
                            Referee Report: {detail?.raceName || 'Race result'}
                        </h1>
                        <p className="mt-2 max-w-[720px] text-[0.92rem] font-semibold leading-[1.45] text-[var(--admin-muted)]">
                            Official report content submitted by the race referee for admin review.
                        </p>
                    </div>

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
                            className={`${panelWidthClass} grid grid-cols-4 gap-4 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1`}
                        >
                            <article className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-4">
                                <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#704b46]">Race</span>
                                <strong className="mt-1 block text-[1rem] leading-[1.15] text-[var(--admin-primary-dark)]">{detail?.raceName || '-'}</strong>
                            </article>
                            <article className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-4">
                                <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#704b46]">Referee</span>
                                <strong className="mt-1 block text-[1rem] leading-[1.15] text-[var(--admin-primary-dark)]">#{detail?.refereeId || '-'}</strong>
                            </article>
                            <article className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-4">
                                <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#704b46]">Submitted</span>
                                <strong className="mt-1 block text-[1rem] leading-[1.15] text-[var(--admin-primary-dark)]">{formatDateTime(detail?.submittedAt)}</strong>
                            </article>
                            <article className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-4">
                                <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#704b46]">Status</span>
                                <span className={`mt-2 inline-flex min-h-7 items-center rounded-full border px-3 text-[0.68rem] font-extrabold ${statusClass[formatClass(detail?.status)] || statusClass.pending}`}>
                                    {detail?.status || '-'}
                                </span>
                            </article>
                        </section>

                        <section
                            aria-label="Referee reports"
                            className={`${panelWidthClass} overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_16px_34px_rgba(100,36,28,0.06)]`}
                        >
                            <div className="flex min-h-[62px] items-center justify-between gap-4 border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-6 py-3.5 max-[820px]:flex-col max-[820px]:items-stretch">
                                <h2 className="m-0 text-[1rem] font-black text-[var(--admin-ink)]">Submitted Report</h2>
                                <span className="text-[0.72rem] font-extrabold text-[#475569]">
                                    {detail?.reports?.length || 0} report{detail?.reports?.length === 1 ? '' : 's'}
                                </span>
                            </div>

                            {detail?.reportError ? (
                                <div className="border-b border-[var(--admin-border)] bg-[#fff8f6] px-6 py-4 text-[0.82rem] font-bold text-[var(--admin-primary)]">
                                    {detail.reportError}
                                </div>
                            ) : null}

                            {detail?.reports?.length > 0 ? (
                                <div className="divide-y divide-[var(--admin-border)]">
                                    {detail.reports.map((report) => (
                                        <article className="grid gap-4 px-6 py-5" key={report.id}>
                                            <div className="flex items-start justify-between gap-4 max-[820px]:flex-col">
                                                <div className="flex items-start gap-3">
                                                    <span className="grid h-10 w-10 flex-none place-items-center rounded-md bg-[#e8f7ef] text-[var(--admin-primary)]">
                                                        <FaFileAlt aria-hidden="true" />
                                                    </span>
                                                    <div>
                                                        <h3 className="m-0 text-[1rem] font-black text-[var(--admin-primary-dark)]">{report.title}</h3>
                                                        <p className="m-0 mt-1 text-[0.75rem] font-bold text-[var(--admin-muted)]">
                                                            Race #{report.raceId || '-'} | Registration #{report.registrationId || '-'} | Referee #{report.refereeId || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[0.75rem] font-bold text-[#6d5752]">{formatDateTime(report.submittedAt)}</span>
                                            </div>

                                            <p className="m-0 whitespace-pre-wrap rounded-md border border-[#f0d8d3] bg-[#fffdfc] px-4 py-3 text-[0.9rem] font-semibold leading-7 text-[#4f403d]">
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
                                    No referee report is available for this race from the current admin API.
                                </div>
                            )}
                        </section>
                    </>
                )}
            </section>
        </AdminLayout>
    );
}

export default ValidateResultDetail;
