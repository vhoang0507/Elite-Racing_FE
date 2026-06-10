import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    FaCalendarCheck,
    FaEllipsisV,
    FaExclamationTriangle,
    FaHorseHead,
    FaSearch,
    FaTrashAlt,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import horseRacing from '../../assets/horse-racing.jpg';

import AdminLayout from './AdminLayout';

const formatClass = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 py-10 max-[860px]:px-5 max-[860px]:py-7';

const summaryClass = {
    total: {
        icon: 'bg-[#ffe8e4] text-[var(--admin-primary)]',
        border: 'before:bg-[var(--admin-primary)]',
    },
    pending: {
        icon: 'bg-[#fff3ce] text-[#8a6209]',
        border: 'before:bg-[#d49a15]',
    },
    reported: {
        icon: 'bg-[#ffe3df] text-[#d71920]',
        border: 'before:bg-[#d71920]',
    },
};

const approvalClass = {
    pending: 'border-[#efd06a] bg-[#fff7db] text-[#a17809]',
    active: 'border-[#a7dfbf] bg-[#e8f7ee] text-[#16864f]',
    inactive: 'border-[#dbc3bf] bg-[#f3e8e6] text-[#7f645f]',
    banned: 'border-[#e7a49a] bg-[#ffe8e4] text-[var(--admin-primary)]',
};

const severityClass = {
    high: 'border-[#e8897d] bg-[#ffe8e4] text-[var(--admin-primary)]',
    medium: 'border-[#e2cd79] bg-[#fff5d3] text-[#8a6209]',
};

const selectClass = 'h-[38px] min-w-[142px] cursor-pointer rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.78rem] font-bold text-[#5f4b47] outline-0';
const pageButtonClass = 'min-h-[34px] cursor-pointer rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]';
const pageSize = 4;

const matchesQuery = (horse, query) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return true;
    }

    return [
        horse.id,
        horse.name,
        horse.breed,
        horse.owner,
        horse.approval,
        horse.healthStatus,
        horse.reportStatus,
    ].some((value) => String(value).toLowerCase().includes(normalizedQuery));
};

function HorseManagement() {
    const [horses, setHorses] = useState([]);
    const [reports, setReports] = useState([]);
    const [query, setQuery] = useState('');
    const [breedFilter, setBreedFilter] = useState('all-breeds');
    const [healthFilter, setHealthFilter] = useState('health');
    const [approvalFilter, setApprovalFilter] = useState('registration');
    const [reportFilter, setReportFilter] = useState('report');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);

    useEffect(() => {
        let isMounted = true;

        adminApi.getHorses().then((payload) => {
            if (isMounted) {
                setHorses(payload.horses);
                setReports(payload.reports);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const horseStats = useMemo(() => [
        {
            label: 'Total Horses',
            value: horses.length.toLocaleString('en-US'),
            icon: FaHorseHead,
            tone: 'total',
        },
        {
            label: 'Pending Approval',
            value: String(horses.filter((horse) => formatClass(horse.approval) === 'pending').length),
            icon: FaCalendarCheck,
            tone: 'pending',
        },
        {
            label: 'Reported Horses',
            value: String(reports.filter((report) => formatClass(report.status) === 'pending').length),
            icon: FaExclamationTriangle,
            tone: 'reported',
        },
    ], [horses, reports]);

    const filteredHorses = useMemo(() => {
        const filtered = horses.filter((horse) => (
            matchesQuery(horse, query)
            && (breedFilter === 'all-breeds' || formatClass(horse.breed) === breedFilter)
            && (healthFilter === 'health' || formatClass(horse.healthStatus) === healthFilter)
            && (approvalFilter === 'registration' || formatClass(horse.approval) === approvalFilter)
            && (reportFilter === 'report' || formatClass(horse.reportStatus) === reportFilter)
        ));

        return [...filtered].sort((current, next) => {
            if (sortBy === 'oldest') {
                return new Date(current.createdAt) - new Date(next.createdAt);
            }

            return new Date(next.createdAt) - new Date(current.createdAt);
        });
    }, [approvalFilter, breedFilter, healthFilter, horses, query, reportFilter, sortBy]);

    const openReports = reports.filter((report) => formatClass(report.status) === 'pending');
    const totalPages = Math.max(1, Math.ceil(filteredHorses.length / pageSize));
    const visibleHorses = filteredHorses.slice((page - 1) * pageSize, page * pageSize);
    const firstShown = filteredHorses.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastShown = Math.min(page * pageSize, filteredHorses.length);

    const handleQueryChange = (value) => {
        setQuery(value);
        setPage(1);
    };

    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
        setPage(1);
    };

    const handleReviewReport = async (report) => {
        await adminApi.closeHorseReport(report.id);
        setReports((current) => current.map((item) => (
            item.id === report.id
                ? {
                    ...item,
                    status: 'Active',
                }
                : item
        )));
        setHorses((current) => current.map((horse) => (
            horse.id === report.horseId
                ? {
                    ...horse,
                    healthStatus: 'Active',
                    reportStatus: 'Active',
                }
                : horse
        )));
    };

    const handleSuspendHorse = async (report) => {
        await adminApi.updateHorseApproval(report.horseId, 'Banned');
        setHorses((current) => current.map((horse) => (
            horse.id === report.horseId
                ? {
                    ...horse,
                    approval: 'Banned',
                }
                : horse
        )));
    };

    const handleToggleHorseApproval = async (horse) => {
        const approval = horse.approval === 'Pending'
            ? 'Active'
            : horse.approval === 'Active'
                ? 'Banned'
                : 'Pending';

        await adminApi.updateHorseApproval(horse.id, approval);
        setHorses((current) => current.map((item) => (
            item.id === horse.id
                ? {
                    ...item,
                    approval,
                }
                : item
        )));
    };

    const handleDeleteReport = async (id) => {
        await adminApi.deleteHorseReport(id);
        setReports((current) => current.filter((report) => report.id !== id));
    };

    return (
        <AdminLayout
            activeKey="horses"
            mainClassName="horse-management-main"
            onSearchChange={handleQueryChange}
            searchPlaceholder="Search horses, owners, reports..."
            searchValue={query}
        >
                <section className={pageShellClass}>
                    <div>
                        <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[860px]:text-[1.6rem]">
                            Horse Management
                        </h1>
                        <p className="mt-2 text-[0.92rem] font-semibold text-[var(--admin-muted)]">
                            Manage horse records, registration approvals, and referee reports.
                        </p>
                    </div>

                    <section aria-label="Horse management summary" className="grid grid-cols-3 gap-7 max-[1180px]:grid-cols-1">
                        {horseStats.map((stat) => {
                            const Icon = stat.icon;
                            const tone = summaryClass[stat.tone];

                            return (
                                <article className={`relative flex min-h-[138px] items-start justify-between overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-6 py-6 shadow-[0_14px_30px_rgba(91,26,19,0.05)] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:content-[''] ${tone.border}`} key={stat.label}>
                                    <div>
                                        <span className="block text-[0.78rem] font-black uppercase text-[#765c58]">{stat.label}</span>
                                        <strong className="mt-3 block text-[2.4rem] leading-none text-[var(--admin-primary-dark)]">{stat.value}</strong>
                                    </div>
                                    <span className={`grid h-10 w-10 place-items-center rounded-lg ${tone.icon}`}>
                                        <Icon aria-hidden="true" />
                                    </span>
                                </article>
                            );
                        })}
                    </section>

                    <section className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--admin-border)] bg-[#fff4f1] px-5 py-4">
                            <label className="flex h-[38px] min-w-[220px] flex-1 items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[#826661]">
                                <FaSearch aria-hidden="true" />
                                <input className="h-full w-full min-w-0 border-0 bg-transparent p-0 text-[0.78rem] text-[var(--admin-ink)] outline-0" onChange={(event) => handleQueryChange(event.target.value)} placeholder="Search horses..." type="search" value={query} />
                            </label>

                            <select className={selectClass} onChange={handleFilterChange(setBreedFilter)} value={breedFilter}>
                                <option value="all-breeds">All Breeds</option>
                                <option value="thoroughbred">Thoroughbred</option>
                                <option value="arabian">Arabian</option>
                                <option value="quarter-horse">Quarter Horse</option>
                            </select>

                            <select className={selectClass} onChange={handleFilterChange(setHealthFilter)} value={healthFilter}>
                                <option value="health">Health Status</option>
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="banned">Banned</option>
                            </select>

                            <select className={selectClass} onChange={handleFilterChange(setApprovalFilter)} value={approvalFilter}>
                                <option value="registration">Reg Status</option>
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="banned">Banned</option>
                            </select>

                            <select className={selectClass} onChange={handleFilterChange(setReportFilter)} value={reportFilter}>
                                <option value="report">Report Status</option>
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="banned">Banned</option>
                            </select>

                            <select className={selectClass} onChange={handleFilterChange(setSortBy)} value={sortBy}>
                                <option value="newest">Sort by: Newest</option>
                                <option value="oldest">Sort by: Oldest</option>
                            </select>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse max-[860px]:min-w-[820px]">
                                <thead>
                                    <tr>
                                        {['Horse & Breed', 'Age/Weight', 'Owner', 'Approval', 'Details'].map((heading) => (
                                            <th className="whitespace-nowrap border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[18px] text-left text-[0.72rem] uppercase text-[#765c58]" key={heading}>
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleHorses.map((horse, index) => (
                                        <tr key={horse.id}>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                <div className="flex min-w-[220px] items-center gap-3">
                                                    <img
                                                        alt=""
                                                        className="h-11 w-11 flex-none rounded-md object-cover"
                                                        src={horseRacing}
                                                        style={{ objectPosition: `${35 + index * 15}% center` }}
                                                    />
                                                    <div>
                                                        <strong className="block text-[var(--admin-ink)]">{horse.name}</strong>
                                                        <span className="mt-1 block text-[0.74rem] font-bold text-[var(--admin-muted)]">{horse.breed}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">{horse.age} yrs / {horse.weight} kg</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">{horse.owner}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                <span className={`inline-flex min-h-6 items-center rounded border px-2.5 text-[0.68rem] font-black uppercase ${approvalClass[formatClass(horse.approval)]}`}>
                                                    {horse.approval}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                <button aria-label={`Cycle approval for ${horse.name}`} className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md bg-transparent text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]" onClick={() => handleToggleHorseApproval(horse)} type="button">
                                                    <FaEllipsisV aria-hidden="true" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex min-h-[62px] items-center justify-between gap-[18px] px-5 py-3.5 text-[0.82rem] font-bold text-[var(--admin-muted)] max-[860px]:flex-col max-[860px]:items-stretch">
                            <span>Showing {firstShown} - {lastShown} of {filteredHorses.length} horses</span>
                            <div className="flex items-center gap-2">
                                <button className={pageButtonClass} disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">Previous</button>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                    <button
                                        className={`${pageButtonClass} ${pageNumber === page ? 'bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary)]' : ''}`}
                                        key={pageNumber}
                                        onClick={() => setPage(pageNumber)}
                                        type="button"
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                                <button className={pageButtonClass} disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">Next</button>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-5">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="m-0 inline-flex items-center gap-2 text-[1.15rem] text-[var(--admin-primary-dark)]">
                                <FaExclamationTriangle aria-hidden="true" />
                                <span>Reported Horses Requiring Review</span>
                            </h2>
                            <button className="cursor-pointer rounded-full bg-[#ffe8e4] px-3 py-1.5 text-[0.72rem] font-black uppercase text-[var(--admin-primary)] hover:bg-[#ffd8d2]" type="button">View all</button>
                        </div>

                        <div className="grid grid-cols-2 gap-5 max-[1180px]:grid-cols-1">
                            {openReports.map((report) => (
                                <article className="grid gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-[0_14px_30px_rgba(91,26,19,0.05)]" key={report.id}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="m-0 text-base text-[var(--admin-ink)]">{report.horse}</h3>
                                            <span className="mt-1 block text-[0.78rem] font-bold text-[var(--admin-muted)]">Reported by: {report.reporter}</span>
                                        </div>
                                        <strong className={`rounded border px-2.5 py-1 text-[0.66rem] font-black uppercase ${severityClass[report.severity.toLowerCase().split(' ')[0]]}`}>
                                            {report.severity}
                                        </strong>
                                    </div>

                                    <div className="rounded-md bg-[#fff8f6] p-4">
                                        <span className="text-[0.68rem] font-black uppercase text-[#765c58]">Reason for report</span>
                                        <p className="mt-2 text-[0.84rem] font-semibold leading-[1.5] text-[#5f4b47]">{report.reason}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button className="min-h-[36px] cursor-pointer rounded-md bg-[var(--admin-primary)] px-3 font-black text-white hover:bg-[var(--admin-primary-dark)]" onClick={() => handleReviewReport(report)} type="button">Review Report</button>
                                        <button className="min-h-[36px] cursor-pointer rounded-md border border-[#d89288] bg-white px-3 font-black text-[var(--admin-primary)] hover:bg-[#fff0ed]" onClick={() => handleSuspendHorse(report)} type="button">Suspend Temporarily</button>
                                        <button aria-label={`Delete report for ${report.horse}`} className="grid h-9 w-9 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" onClick={() => handleDeleteReport(report.id)} type="button">
                                            <FaTrashAlt aria-hidden="true" />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </section>
        </AdminLayout>
    );
}

export default HorseManagement;
