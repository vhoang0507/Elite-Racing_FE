import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Link,
} from 'react-router-dom';

import {
    FaBolt,
    FaChevronRight,
    FaFileAlt,
    FaFlagCheckered,
    FaHorseHead,
    FaTrashAlt,
    FaTrophy,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import {
    confirmAdminAction,
    showAdminSuccess,
} from '../../utils/adminFeedback';
import { getCompactPaginationItems } from '../../utils/pagination';

import AdminLayout from './AdminLayout';

const formatClass = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-8 px-[52px] py-14 max-[820px]:px-5 max-[820px]:py-8';

const panelWidthClass = 'w-[min(100%,1090px)]';

const raceIconClass = {
    blue: 'bg-[#dfe4ff] text-[#1c33d0]',
    gray: 'bg-[#e5e7eb] text-[#475569]',
    green: 'bg-[#d1fae5] text-[#047857]',
    red: 'bg-[#e0f2fe] text-[#0369a1]',
    orange: 'bg-[#fef3c7] text-[#92400e]',
};

const statusClass = {
    pending: 'bg-[#faf2e0] text-[#8a6209]',
    draft: 'bg-[#f3f4f6] text-[#374151]',
    refereeconfirmed: 'bg-[#faf2e0] text-[#8a6209]',
    adminapproved: 'bg-[#e8f7ee] text-[#16864f]',
    published: 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]',
    returned: 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]',
    active: 'bg-[#e8f7ee] text-[#16864f]',
    inactive: 'bg-[#f3e8e6] text-[#7f645f]',
    banned: 'bg-[#f3e1df] text-[#a4392f]',
    refereereport: 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]',
    'referee-report': 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]',
    violationreport: 'bg-[#faf2e0] text-[#8a6209]',
    'violation-report': 'bg-[#faf2e0] text-[#8a6209]',
    warning: 'bg-[#faf2e0] text-[#8a6209]',
    disqualified: 'bg-[#f3e1df] text-[#a4392f]',
};
const humanizeLabel = (value) => String(value || '').replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim();

const iconByTone = {
    blue: FaFlagCheckered,
    gray: FaHorseHead,
    green: FaTrophy,
    red: FaBolt,
    orange: FaFileAlt,
};

const pageButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-full border border-[var(--admin-border)] bg-white font-bold text-[var(--admin-primary-dark)] transition-colors hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary)] hover:text-white';
const pageSize = 5;

const sortPendingFirst = (items, getStatus) => [...items].sort((current, next) => {
    const currentRank = formatClass(getStatus(current)) === 'pending' ? 0 : 1;
    const nextRank = formatClass(getStatus(next)) === 'pending' ? 0 : 1;

    return currentRank - nextRank;
});

const matchesQuery = (submission, query) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return true;
    }

    return [
        submission.race,
        submission.detail,
        submission.status,
        submission.reportType,
        submission.refereeName,
        submission.horseName,
        submission.content,
    ].some((value) => String(value).toLowerCase().includes(normalizedQuery));
};

const statusFilterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'refereeconfirmed', label: 'Referee Confirmed' },
    { value: 'adminapproved', label: 'Admin Approved' },
    { value: 'returned', label: 'Returned' },
];

function ValidateResults() {
    const [submissions, setSubmissions] = useState([]);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [deletingId, setDeletingId] = useState('');

    useEffect(() => {
        let isMounted = true;

        adminApi.getResultSubmissions().then((payload) => {
            if (isMounted) {
                setSubmissions(payload);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredSubmissions = useMemo(() => sortPendingFirst(
        submissions.filter((submission) =>
            matchesQuery(submission, query) &&
            (statusFilter === 'all' || formatClass(submission.status) === statusFilter)
        ),
        (submission) => submission.status
    ), [query, statusFilter, submissions]);
    const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / pageSize));
    const visibleSubmissions = filteredSubmissions.slice((page - 1) * pageSize, page * pageSize);
    const firstShown = filteredSubmissions.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastShown = Math.min(page * pageSize, filteredSubmissions.length);

    const handleQueryChange = (value) => {
        setQuery(value);
        setPage(1);
    };

    const handleDeleteSubmission = async (submission) => {
        const confirmed = await confirmAdminAction({
            title: 'Delete result report',
            message: `Are you sure you want to delete ${submission.race || 'this result report'} (${submission.detail || 'selected submission'})?`,
            confirmLabel: 'Delete',
            tone: 'danger',
        });

        if (!confirmed) return;

        const ids = Array.isArray(submission.resultIds) && submission.resultIds.length > 0
            ? submission.resultIds
            : [submission.resultId || submission.id || submission.slug].filter(Boolean);
        const deleteKey = String(submission.id || submission.slug || ids[0] || '');
        setDeletingId(deleteKey);

        try {
            for (const id of ids) {
                await adminApi.deleteResult(id);
            }
            setSubmissions((current) => current.filter((item) => item !== submission));
            showAdminSuccess('Result report deleted successfully.', 'Deleted');
        } catch (err) {
            window.alert(err.message || 'Failed to delete result report.');
        } finally {
            setDeletingId('');
        }
    };

    return (
        <AdminLayout
            activeKey="results"
            mainClassName="validate-results-main"
            onSearchChange={handleQueryChange}
            searchPlaceholder="Search result submissions..."
            searchValue={query}
        >
                <section className={pageShellClass}>
                    <div className="max-w-[760px]">
                        <h1 className="page-title">
                            Validate Results
                        </h1>
                        <p className="page-subtitle leading-[1.45]">
                            Review referee-submitted race results and violations before publishing official race outcomes.
                        </p>
                    </div>

                    <section
                        aria-label="Active submissions"
                        className={`${panelWidthClass} overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_16px_34px_rgba(15,23,42,0.08)]`}
                    >
                        <div className="flex min-h-[58px] items-center justify-between gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-6">
                            <h2 className="m-0 text-[1.04rem] font-black text-[var(--admin-ink)]">
                                Active Result Submissions
                            </h2>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="h-8 rounded-full border border-[var(--admin-border)] bg-white px-3.5 text-[0.78rem] font-bold text-[var(--admin-ink)] outline-none transition-colors hover:border-[var(--admin-gold)]"
                            >
                                {statusFilterOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {visibleSubmissions.length === 0 ? (
                            <div className="px-6 py-12 text-center font-bold text-[var(--admin-muted)]">
                                No result submissions found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-5 p-5 max-[1180px]:grid-cols-2 max-[720px]:grid-cols-1">
                                {visibleSubmissions.map((submission) => {
                                    const Icon = iconByTone[submission.tone] || FaFlagCheckered;

                                    return (
                                        <article
                                            className="flex flex-col overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-white shadow-[0_10px_26px_rgba(11,27,52,0.06)] transition-shadow duration-200 hover:shadow-[0_16px_36px_rgba(11,27,52,0.14)]"
                                            key={submission.id || submission.race}
                                        >
                                            <div className="flex items-center gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4">
                                                <span className={`grid h-11 w-11 flex-none place-items-center rounded-full ${raceIconClass[submission.tone]}`}>
                                                    <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                                                </span>
                                                <div className="min-w-0">
                                                    <strong className="block truncate text-[0.94rem] leading-[1.2] text-[var(--admin-ink)]">
                                                        {submission.race}
                                                    </strong>
                                                    <span className="block truncate text-[0.74rem] font-bold text-[var(--admin-muted)]">
                                                        {submission.detail}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-1 flex-col gap-4 p-4">
                                                <span className={`inline-flex w-fit min-h-6 items-center rounded-full px-3 text-[0.66rem] font-bold uppercase tracking-wide ${statusClass[formatClass(submission.status)] || statusClass.pending}`}>
                                                    {humanizeLabel(submission.status)}
                                                </span>

                                                <div className="mt-auto flex items-center gap-2 border-t border-[var(--admin-border)] pt-3">
                                                    <Link
                                                        className="inline-flex min-h-[38px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--admin-primary)] bg-white text-[0.82rem] font-extrabold text-[var(--admin-primary)] no-underline transition-colors hover:bg-[var(--admin-primary)] hover:text-white"
                                                        to={`/admin/results/${submission.slug}`}
                                                    >
                                                        <span>View Details</span>
                                                        <FaChevronRight aria-hidden="true" className="h-3 w-3" />
                                                    </Link>
                                                    <button
                                                        aria-label={`Delete ${submission.race || 'result report'}`}
                                                        className="grid h-[38px] w-[38px] flex-none cursor-pointer place-items-center rounded-full bg-[#f3e1df] text-[#a4392f] hover:bg-[#ecd0cc] disabled:cursor-not-allowed disabled:opacity-50"
                                                        disabled={deletingId === String(submission.id || submission.slug || submission.resultId)}
                                                        onClick={() => handleDeleteSubmission(submission)}
                                                        type="button"
                                                    >
                                                        <FaTrashAlt aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex min-h-[68px] items-center justify-between gap-[18px] border-t border-[var(--admin-border)] px-[22px] py-4 text-[0.82rem] font-bold text-[var(--admin-muted)] max-[820px]:flex-col max-[820px]:items-stretch">
                            <span>Showing {firstShown} - {lastShown} of {filteredSubmissions.length} results</span>

                            <div className="flex items-center gap-2 max-[820px]:flex-wrap">
                                <button aria-label="Previous page" className={pageButtonClass} disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">&lt;</button>
                                {getCompactPaginationItems(totalPages, page).map((pageItem) => (
                                    typeof pageItem === 'number' ? (
                                        <button
                                            className={`${pageButtonClass} ${pageItem === page ? '!border-[var(--admin-primary)] !bg-[var(--admin-primary)] !text-white' : ''}`}
                                            key={pageItem}
                                            onClick={() => setPage(pageItem)}
                                            type="button"
                                        >
                                            {pageItem}
                                        </button>
                                    ) : (
                                        <span className={`${pageButtonClass} cursor-default border-transparent text-[var(--admin-muted)] hover:!border-transparent hover:!bg-transparent hover:!text-[var(--admin-muted)]`} key={pageItem}>...</span>
                                    )
                                ))}
                                <button aria-label="Next page" className={pageButtonClass} disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">&gt;</button>
                            </div>
                        </div>
                    </section>
                </section>
        </AdminLayout>
    );
}

export default ValidateResults;
