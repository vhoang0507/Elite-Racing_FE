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
    FaTrophy,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';

import AdminLayout from './AdminLayout';

const formatClass = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');

const pageShellClass = [
    '[--validate-soft-panel:#f8fbff]',
    '[--validate-table-head:#f1f5ff]',
    'grid min-h-[calc(100vh-64px)] content-start gap-8 px-[52px] py-14 max-[820px]:px-5 max-[820px]:py-8',
].join(' ');

const panelWidthClass = 'w-[min(100%,1090px)]';

const raceIconClass = {
    blue: 'bg-[#dfe4ff] text-[#1c33d0]',
    gray: 'bg-[#e5e7eb] text-[#475569]',
    green: 'bg-[#d1fae5] text-[#047857]',
    red: 'bg-[#e0f2fe] text-[#0369a1]',
    orange: 'bg-[#fef3c7] text-[#92400e]',
};

const statusClass = {
    pending: 'border-[#9ab8ff] bg-[#e7f0ff] text-[#1747c2]',
    draft: 'border-[#d6a918] bg-[#ffd95e] text-[#8c6508]',
    refereeconfirmed: 'border-[#d6a918] bg-[#ffd95e] text-[#8c6508]',
    adminapproved: 'border-[#a7dfbf] bg-[#e8f8ef] text-[#1a7d49]',
    returned: 'border-[#93c5fd] bg-[#eff6ff] text-[#075985]',
    active: 'border-[#a7dfbf] bg-[#e8f8ef] text-[#1a7d49]',
    inactive: 'border-[#ddd6d3] bg-[#f7f5f4] text-[#6f6360]',
    banned: 'border-[#cbd5e1] bg-[#f1f5f9] text-[#475569]',
    refereereport: 'border-[#9ab8ff] bg-[#e7f0ff] text-[#1747c2]',
    'referee-report': 'border-[#9ab8ff] bg-[#e7f0ff] text-[#1747c2]',
    violationreport: 'border-[#f1d59b] bg-[#fff7df] text-[#8a5a00]',
    'violation-report': 'border-[#f1d59b] bg-[#fff7df] text-[#8a5a00]',
    warning: 'border-[#f1d59b] bg-[#fff7df] text-[#8a5a00]',
    disqualified: 'border-[#f0b7ae] bg-[#fff1ef] text-[#a11616]',
};

const iconByTone = {
    blue: FaFlagCheckered,
    gray: FaHorseHead,
    green: FaTrophy,
    red: FaBolt,
    orange: FaFileAlt,
};

const pageButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-white font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]';
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
                        <h1 className="m-0 text-[2rem] leading-[1.12] text-[var(--admin-primary-dark)] max-[820px]:text-[1.6rem]">
                            Validate Results
                        </h1>
                        <p className="mt-2 text-[0.95rem] font-semibold leading-[1.45] text-[var(--admin-muted)]">
                            Review referee-submitted race results and reports before publishing official race outcomes.
                        </p>
                    </div>

                    <section
                        aria-label="Active submissions"
                        className={`${panelWidthClass} overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_16px_34px_rgba(15,23,42,0.08)]`}
                    >
                        <div className="flex min-h-[58px] items-center justify-between gap-4 border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-6">
                            <h2 className="m-0 text-[1.04rem] font-black text-[var(--admin-ink)]">
                                Active Submissions & Reports
                            </h2>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="h-8 rounded-md border border-[var(--admin-border)] bg-white px-2 text-[0.78rem] font-bold text-[#475569] outline-none"
                            >
                                {statusFilterOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse max-[820px]:min-w-[840px]">
                                <thead>
                                    <tr>
                                        <th className="border-b border-[var(--admin-border)] bg-[var(--validate-table-head)] px-6 py-[18px] pl-[78px] text-left text-[0.66rem] font-black uppercase tracking-normal text-[var(--admin-muted)] max-[820px]:pl-6">
                                            Tournament Name
                                        </th>
                                        <th className="w-[260px] border-b border-[var(--admin-border)] bg-[var(--validate-table-head)] px-6 py-[18px] text-left text-[0.66rem] font-black uppercase tracking-normal text-[var(--admin-muted)]">
                                            Status
                                        </th>
                                        <th className="w-60 border-b border-[var(--admin-border)] bg-[var(--validate-table-head)] px-6 py-[18px] text-center text-[0.66rem] font-black uppercase tracking-normal text-[var(--admin-muted)]">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleSubmissions.map((submission) => {
                                        const Icon = iconByTone[submission.tone] || FaFlagCheckered;

                                        return (
                                            <tr key={submission.id || submission.race}>
                                                <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-6 py-[18px] pl-[78px] align-middle max-[820px]:pl-6">
                                                    <div className="flex min-w-80 items-center gap-4">
                                                        <span className={`grid h-9 w-9 flex-none place-items-center rounded-md ${raceIconClass[submission.tone]}`}>
                                                            <Icon aria-hidden="true" className="h-[17px] w-[17px]" />
                                                        </span>
                                                        <div>
                                                            <strong className="block text-[0.9rem] leading-[1.15] text-[var(--admin-ink)]">
                                                                {submission.race}
                                                            </strong>
                                                            <span className="mt-1 block text-[0.72rem] font-bold text-[#475569]">
                                                                {submission.detail}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="w-[260px] whitespace-nowrap border-b border-[var(--admin-border)] px-6 py-[18px] align-middle">
                                                    <span className={`inline-flex min-h-6 items-center rounded-full border px-2.5 text-[0.66rem] font-extrabold ${statusClass[formatClass(submission.status)] || statusClass.pending}`}>
                                                        {submission.status}
                                                    </span>
                                                </td>
                                                <td className="w-60 whitespace-nowrap border-b border-[var(--admin-border)] px-6 py-[18px] text-center align-middle">
                                                    <Link
                                                        className="inline-flex min-h-[38px] min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--admin-primary)] bg-white text-[0.82rem] font-extrabold text-[var(--admin-primary)] no-underline hover:bg-[var(--admin-primary)] hover:text-white"
                                                        to={`/admin/results/${submission.slug}`}
                                                    >
                                                        <span>{submission.kind === 'report' ? 'View Report' : 'View Details'}</span>
                                                        <FaChevronRight aria-hidden="true" className="h-3 w-3" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex min-h-[68px] items-center justify-between gap-[18px] px-[22px] py-4 text-[0.82rem] font-bold text-[var(--admin-muted)] max-[820px]:flex-col max-[820px]:items-stretch">
                            <span>Showing {firstShown} - {lastShown} of {filteredSubmissions.length} results</span>

                            <div className="flex items-center gap-2 max-[820px]:flex-wrap">
                                <button aria-label="Previous page" className={pageButtonClass} disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">&lt;</button>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                    <button
                                        className={`${pageButtonClass} ${pageNumber === page ? 'border-[var(--admin-primary)] bg-[#e8f7ef] text-[#064e3b] hover:bg-[#d1fae5]' : ''}`}
                                        key={pageNumber}
                                        onClick={() => setPage(pageNumber)}
                                        type="button"
                                    >
                                        {pageNumber}
                                    </button>
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
