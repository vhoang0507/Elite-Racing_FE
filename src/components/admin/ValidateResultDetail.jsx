import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Link,
    useParams,
} from 'react-router-dom';

import {
    FaFilter,
    FaRedoAlt,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import horseRacing from '../../assets/horse-racing.jpg';

import AdminLayout from './AdminLayout';

const formatClass = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');

const pageShellClass = [
    '[--validate-soft-panel:#fff4f1]',
    'grid min-h-[calc(100vh-64px)] content-start gap-7 px-[52px] py-[54px] max-[820px]:px-5 max-[820px]:py-8',
].join(' ');

const panelWidthClass = 'w-[min(100%,1120px)]';

const positionClass = {
    1: 'bg-[#ffd85a] text-[#7b5a05]',
    2: 'bg-[#ffe3df] text-[#7a4740]',
    3: 'bg-[#ffe3df] text-[#7a4740]',
    4: 'bg-[#ffe3df] text-[#7a4740]',
    5: 'bg-[#ffe3df] text-[#7a4740]',
};

const scoreClass = {
    green: 'bg-[#c9f6d9] text-[#0d854d]',
    gold: 'bg-[#ffe88f] text-[#8b6707]',
};

const statusClass = {
    pending: 'border-[#d6a918] bg-[#ffd95e] text-[#8c6508]',
    active: 'border-[#a7dfbf] bg-[#e8f8ef] text-[#1a7d49]',
    inactive: 'border-[#ddd6d3] bg-[#f5f4f3] text-[#6f6360]',
    banned: 'border-[#e8897d] bg-[#ffe8e4] text-[var(--admin-primary)]',
};

const pageButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]';
const pageSize = 5;

const sortPendingFirst = (items, getStatus) => [...items].sort((current, next) => {
    const currentRank = formatClass(getStatus(current)) === 'pending' ? 0 : 1;
    const nextRank = formatClass(getStatus(next)) === 'pending' ? 0 : 1;

    return currentRank - nextRank;
});

function ValidateResultDetail() {
    const { resultId } = useParams();
    const [detail, setDetail] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [isPublishing, setIsPublishing] = useState(false);
    const [page, setPage] = useState(1);

    const loadDetail = async () => {
        setDetail(await adminApi.getResultDetail(resultId));
    };

    useEffect(() => {
        let isMounted = true;

        adminApi.getResultDetail(resultId).then((payload) => {
            if (isMounted) {
                setDetail(payload);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [resultId]);

    const filteredResults = useMemo(() => {
        if (!detail) {
            return [];
        }

        return sortPendingFirst(detail.results.filter((result) => (
            statusFilter === 'all' || formatClass(result.status) === statusFilter
        )), (result) => result.status);
    }, [detail, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
    const visibleResults = filteredResults.slice((page - 1) * pageSize, page * pageSize);
    const firstShown = filteredResults.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastShown = Math.min(page * pageSize, filteredResults.length);

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setPage(1);
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        await adminApi.publishResult(resultId);
        await loadDetail();
        setIsPublishing(false);
    };

    if (!detail) {
        return (
            <AdminLayout activeKey="results" mainClassName="validate-detail-main">
                <section className={pageShellClass}>
                    <p className="m-0 font-bold text-[var(--admin-muted)]">Loading result details...</p>
                </section>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activeKey="results" mainClassName="validate-detail-main">
                <section className={pageShellClass}>
                    <h1 className="m-0 text-[1.9rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[820px]:text-[1.5rem]">
                        Race Result Details: {detail.raceName}
                    </h1>

                    <section
                        aria-label="Race result summary"
                        className={`${panelWidthClass} grid grid-cols-[minmax(0,250px)_minmax(0,250px)_minmax(340px,1fr)] gap-6 max-[1180px]:grid-cols-2 max-[820px]:grid-cols-1`}
                    >
                        <article className="grid min-h-[110px] content-center gap-[5px] overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-[18px]">
                            <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#704b46]">Track Conditions</span>
                            <strong className="text-[1.32rem] leading-[1.1] text-[var(--admin-primary)]">{detail.trackCondition}</strong>
                            <small className="text-[0.76rem] font-semibold text-[#5f4b47]">{detail.wind}</small>
                        </article>

                        <article className="grid min-h-[110px] content-center gap-[5px] overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-[18px]">
                            <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#704b46]">Winning Time</span>
                            <strong className="text-[1.32rem] leading-[1.1] text-[var(--admin-primary)]">{detail.winningTime}</strong>
                            <small className="text-[0.76rem] font-semibold text-[#5f4b47]">{detail.recordTime}</small>
                        </article>

                        <article className="relative flex min-h-[110px] items-center overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-primary)] px-[22px] py-[18px] text-white before:absolute before:inset-0 before:z-[1] before:bg-[linear-gradient(90deg,rgba(134,7,7,0.98)_0%,rgba(134,7,7,0.92)_45%,rgba(134,7,7,0.44)_100%)] before:content-[''] max-[1180px]:col-span-full max-[820px]:col-span-1">
                            <img alt="" className="absolute right-0 top-0 h-full w-[54%] object-cover object-[64%_center]" src={horseRacing} />
                            <div className="relative z-[2] grid max-w-[420px] gap-1">
                                <span className="text-[0.62rem] font-black uppercase tracking-normal text-[#ffd8d3]">Top Performer</span>
                                <strong className="text-[1.35rem] leading-[1.05] text-white">{detail.topPerformer.horse}</strong>
                                <small className="text-[0.78rem] font-bold text-[#ffd8d3]">
                                    Jockey: {detail.topPerformer.jockey} | Owner: {detail.topPerformer.owner}
                                </small>
                            </div>
                        </article>
                    </section>

                    <section
                        aria-label="Race result entries"
                        className={`${panelWidthClass} overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]`}
                    >
                        <div className="flex min-h-[70px] items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-6 py-3.5 max-[820px]:flex-col max-[820px]:items-stretch">
                            <label className="inline-flex h-[38px] w-[285px] items-center gap-2.5 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[#765d58] max-[820px]:w-full">
                                <FaFilter aria-hidden="true" />
                                <select className="h-full w-full min-w-0 cursor-pointer border-0 bg-transparent p-0 pr-6 text-[0.78rem] font-bold text-[var(--admin-ink)] outline-0" onChange={handleStatusFilterChange} value={statusFilter}>
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="banned">Banned</option>
                                </select>
                            </label>

                            <button
                                aria-label="Refresh results"
                                className="grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[#765d58] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]"
                                onClick={loadDetail}
                                type="button"
                            >
                                <FaRedoAlt aria-hidden="true" />
                            </button>

                            <span className="ml-auto text-[0.72rem] font-extrabold text-[#5f4b47] max-[820px]:ml-0">
                                Showing {firstShown} - {lastShown} of {filteredResults.length} Entries
                            </span>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse max-[820px]:min-w-[920px]">
                                <thead>
                                    <tr>
                                        <th className="w-[150px] border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-[22px] py-5 pl-[62px] text-left text-[0.76rem] font-black uppercase leading-[1.1] tracking-normal text-[#7b625d] max-[820px]:pl-6">Position</th>
                                        <th className="w-[210px] border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-[22px] py-5 text-left text-[0.76rem] font-black uppercase leading-[1.1] tracking-normal text-[#7b625d]">Horse Name</th>
                                        <th className="border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-[22px] py-5 text-left text-[0.76rem] font-black uppercase leading-[1.1] tracking-normal text-[#7b625d]">Jockey Name</th>
                                        <th className="border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-[22px] py-5 text-left text-[0.76rem] font-black uppercase leading-[1.1] tracking-normal text-[#7b625d]">Finish Time</th>
                                        <th className="w-[150px] border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-[22px] py-5 text-center text-[0.76rem] font-black uppercase leading-[1.1] tracking-normal text-[#7b625d]">Score</th>
                                        <th className="w-[210px] border-b border-[var(--admin-border)] bg-[var(--validate-soft-panel)] px-[22px] py-5 text-center text-[0.76rem] font-black uppercase leading-[1.1] tracking-normal text-[#7b625d]">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleResults.map((result) => (
                                        <tr key={result.horse}>
                                            <td className="w-[150px] whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-5 pl-[62px] align-middle text-[0.78rem] font-bold text-[#6d5752] max-[820px]:pl-6">
                                                <span className={`inline-grid h-7 w-7 place-items-center rounded-full text-[0.72rem] font-black ${positionClass[result.position]}`}>
                                                    {result.position}
                                                </span>
                                            </td>
                                            <td className="w-[210px] whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-5 align-middle text-[0.78rem] font-bold text-[#6d5752]">
                                                <strong className="block max-w-[120px] whitespace-normal text-[0.88rem] leading-[1.05] text-[var(--admin-primary)]">
                                                    {result.horse}
                                                </strong>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-5 align-middle text-[0.78rem] font-bold text-[#6d5752]">{result.jockey}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-5 align-middle font-[Consolas,'Courier_New',monospace] text-[0.78rem] font-bold text-[#6d5752]">{result.finishTime}</td>
                                            <td className="w-[150px] whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-5 text-center align-middle text-[0.78rem] font-bold text-[#6d5752]">
                                                <span className={`inline-grid min-h-5 min-w-7 place-items-center rounded text-[0.66rem] font-black ${scoreClass[result.scoreTone] || scoreClass.gold}`}>
                                                    {result.score}
                                                </span>
                                            </td>
                                            <td className="w-[210px] whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-5 text-center align-middle text-[0.78rem] font-bold text-[#6d5752]">
                                                <span className={`inline-flex min-h-8 max-w-[92px] items-center justify-center whitespace-normal rounded-full border px-[11px] text-[0.62rem] font-extrabold leading-[1.05] ${statusClass[formatClass(result.status)]}`}>
                                                    {result.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex min-h-[68px] items-center justify-between gap-[18px] px-[22px] py-4 text-[0.82rem] font-bold text-[var(--admin-muted)] max-[820px]:flex-col max-[820px]:items-stretch">
                            <span>Showing {firstShown} - {lastShown} of {filteredResults.length} entries</span>

                            <div className="flex items-center gap-2 max-[820px]:flex-wrap">
                                <button aria-label="Previous page" className={pageButtonClass} disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">&lt;</button>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                    <button
                                        className={`${pageButtonClass} ${pageNumber === page ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary)]' : ''}`}
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

                    <div className={`${panelWidthClass} -mt-5 flex justify-end gap-[18px] max-[820px]:mt-0 max-[820px]:flex-col max-[820px]:items-stretch`}>
                        <Link
                            className="inline-flex min-h-12 min-w-[108px] cursor-pointer items-center justify-center rounded-lg border-2 border-[var(--admin-primary)] bg-white text-[0.82rem] font-black text-[var(--admin-primary)] no-underline hover:bg-[#fff0ed]"
                            to="/admin/results"
                        >
                            Return
                        </Link>
                        <button
                            className="inline-flex min-h-12 min-w-[108px] cursor-pointer items-center justify-center rounded-lg border-2 border-[var(--admin-primary)] bg-[var(--admin-primary)] text-[0.82rem] font-black text-white hover:border-[var(--admin-primary-dark)] hover:bg-[var(--admin-primary-dark)]"
                            disabled={isPublishing}
                            onClick={handlePublish}
                            type="button"
                        >
                            {isPublishing ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </section>
        </AdminLayout>
    );
}

export default ValidateResultDetail;
