import {
    useEffect,
    useMemo,
    useState,
} from 'react';
import ImageLightbox from '../shared/ImageLightbox';

import {
    FaCalendarCheck,
    FaExclamationTriangle,
    FaEye,
    FaHorseHead,
    FaSearch,
    FaTrashAlt,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import { resolveFileUrl } from '../../api/uploadApi';
import horseRacing from '../../assets/horse-racing.jpg';
import {
    confirmAdminAction,
    showAdminSuccess,
} from '../../utils/adminFeedback';
import { getCompactPaginationItems } from '../../utils/pagination';

import AdminLayout from './AdminLayout';

const formatClass = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 py-10 max-[860px]:px-5 max-[860px]:py-7';

const summaryClass = {
    total: {
        icon: 'bg-[#e8f7ef] text-[var(--admin-primary)]',
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
    banned: 'border-[#e7a49a] bg-[#e8f7ef] text-[var(--admin-primary)]',
};

const severityClass = {
    high: 'border-[#e8897d] bg-[#e8f7ef] text-[var(--admin-primary)]',
    medium: 'border-[#e2cd79] bg-[#fff5d3] text-[#8a6209]',
};

const selectClass = 'h-[38px] min-w-[142px] cursor-pointer rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.78rem] font-bold text-[#475569] outline-0';
const pageButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]';
const pageSize = 4;
const horseApprovalStorageKey = 'adminHorseApprovalStatuses';

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

const readStoredHorseApprovals = () => {
    try {
        return JSON.parse(localStorage.getItem(horseApprovalStorageKey) || '{}');
    } catch {
        return {};
    }
};

const writeStoredHorseApproval = (horseId, approval) => {
    const storedApprovals = readStoredHorseApprovals();
    localStorage.setItem(horseApprovalStorageKey, JSON.stringify({
        ...storedApprovals,
        [horseId]: approval,
    }));
};

const detailValue = (value, suffix = '') => {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return `${value}${suffix}`;
};

const formatDetailDate = (value) => {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

function HorseDetailItem({ label, value }) {
    return (
        <div className="rounded-md border border-[var(--admin-border)] bg-[#fff8f6] p-3">
            <span className="block text-[0.68rem] font-black uppercase text-[#64748b]">{label}</span>
            <strong className="mt-1 block text-[0.9rem] text-[var(--admin-ink)]">{value}</strong>
        </div>
    );
}

function HealthCertificateLink({ url, compact = false }) {
    if (!url) {
        if (!compact) {
            return (
                <div className="mt-3 grid min-h-[170px] place-items-center rounded-md border border-dashed border-[var(--admin-border)] bg-[#fff8f6] px-4 text-center text-[0.82rem] font-bold text-[var(--admin-muted)]">
                    Health certificate image not uploaded
                </div>
            );
        }

        return (
            <span className="inline-flex min-h-6 items-center rounded border border-[#dbc3bf] bg-[#f3e8e6] px-2.5 text-[0.68rem] font-black uppercase text-[#7f645f]">
                Not uploaded
            </span>
        );
    }

    const [lightboxSrc, setLightboxSrc] = useState(null);
    const resolvedUrl = resolveFileUrl(url);

    if (compact) {
        return (
            <>
                <button
                    className="inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-[0.78rem] font-black text-[var(--admin-primary)] hover:underline"
                    onClick={() => setLightboxSrc(resolvedUrl)}
                    type="button"
                >
                    <img alt="Health certificate" className="h-8 w-11 rounded border border-[var(--admin-border)] object-cover" src={resolvedUrl} />
                    View
                </button>
                <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
            </>
        );
    }

    return (
        <>
            <button
                className="mt-3 block w-full cursor-pointer rounded-md border border-[var(--admin-border)] bg-[#fff8f6] p-3 text-[0.86rem] font-black text-[var(--admin-primary)] hover:bg-[#e8f7ef]"
                style={{ border: undefined, background: undefined }}
                onClick={() => setLightboxSrc(resolvedUrl)}
                type="button"
            >
                <span className="grid h-[170px] place-items-center overflow-hidden rounded-md border border-[var(--admin-border)] bg-white">
                    <img alt="Health certificate" className="h-full w-full object-contain" src={resolvedUrl} />
                </span>
                <span className="mt-2 block text-center">Open health certificate</span>
            </button>
            <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        </>
    );
}

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
    const [selectedHorseId, setSelectedHorseId] = useState(null);
    const [selectedHorseDetail, setSelectedHorseDetail] = useState(null);
    const [selectedHorseLoading, setSelectedHorseLoading] = useState(false);
    const [selectedHorseError, setSelectedHorseError] = useState('');

    useEffect(() => {
        let isMounted = true;

        adminApi.getHorses().then((payload) => {
            if (isMounted) {
                const storedApprovals = readStoredHorseApprovals();
                setHorses(payload.horses.map((horse) => ({
                    ...horse,
                    approval: storedApprovals[horse.id] || horse.approval,
                })));
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
    const selectedHorse = selectedHorseDetail || horses.find((horse) => horse.id === selectedHorseId) || null;

    const handleQueryChange = (value) => {
        setQuery(value);
        setPage(1);
    };

    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
        setPage(1);
    };

    const handleOpenHorseDetail = async (horse) => {
        setSelectedHorseId(horse.id);
        setSelectedHorseDetail(horse);
        setSelectedHorseError('');
        setSelectedHorseLoading(true);

        try {
            const detail = await adminApi.getHorseById(horse.id);
            setSelectedHorseDetail({
                ...horse,
                ...detail,
                imageUrl: detail.imageUrl || horse.imageUrl,
                approval: horse.approval || detail.approval,
            });
        } catch (err) {
            setSelectedHorseError(err.message || 'Cannot load horse detail.');
        } finally {
            setSelectedHorseLoading(false);
        }
    };

    const handleCloseHorseDetail = () => {
        handleCloseHorseDetail();
        setSelectedHorseDetail(null);
        setSelectedHorseError('');
        setSelectedHorseLoading(false);
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
        const confirmed = await confirmAdminAction({
            title: 'Suspend horse',
            message: `Are you sure you want to suspend "${report.horse}"?`,
            confirmLabel: 'Suspend',
            tone: 'danger',
        });

        if (!confirmed) {
            return;
        }

        await adminApi.updateHorseApproval(report.horseId, 'Banned');
        setHorses((current) => current.map((horse) => (
            horse.id === report.horseId
                ? {
                    ...horse,
                    approval: 'Banned',
                }
                : horse
        )));
        showAdminSuccess('Horse suspended successfully.', 'Updated');
    };

    const handleUpdateHorseApproval = async (horse, approval) => {
        const confirmed = await confirmAdminAction({
            title: approval === 'Active' ? 'Confirm horse' : 'Reject horse',
            message: approval === 'Active'
                ? `Are you sure you want to confirm "${horse.name}"?`
                : `Are you sure you want to reject "${horse.name}"?`,
            confirmLabel: approval === 'Active' ? 'Confirm' : 'Reject',
            tone: approval === 'Active' ? 'primary' : 'danger',
        });

        if (!confirmed) {
            return;
        }

        await adminApi.updateHorseApproval(horse.id, approval);
        writeStoredHorseApproval(horse.id, approval);
        setHorses((current) => current.map((item) => (
            item.id === horse.id
                ? {
                    ...item,
                    approval,
                }
                : item
        )));
        setSelectedHorseId(null);
        showAdminSuccess(approval === 'Active' ? 'Horse confirmed successfully.' : 'Horse rejected successfully.', approval === 'Active' ? 'Confirmed' : 'Rejected');
    };

    const handleDeleteReport = async (id) => {
        const confirmed = await confirmAdminAction({
            title: 'Delete report',
            message: 'Are you sure you want to delete this report?',
            confirmLabel: 'Delete',
            tone: 'danger',
        });

        if (!confirmed) {
            return;
        }

        await adminApi.deleteHorseReport(id);
        setReports((current) => current.filter((report) => report.id !== id));
        showAdminSuccess('Report deleted successfully.', 'Deleted');
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
                                <article className={`relative flex min-h-[138px] items-start justify-between overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-6 py-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:content-[''] ${tone.border}`} key={stat.label}>
                                    <div>
                                        <span className="block text-[0.78rem] font-black uppercase text-[#64748b]">{stat.label}</span>
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
                        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--admin-border)] bg-[#f8fbff] px-5 py-4">
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
                                        {['Horse & Breed', 'Age/Weight', 'Owner', 'Health Certificate', 'Approval', 'Details'].map((heading) => (
                                            <th className="whitespace-nowrap border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[18px] text-left text-[0.72rem] uppercase text-[#64748b]" key={heading}>
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleHorses.map((horse) => (
                                        <tr key={horse.id}>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                <div className="flex min-w-[220px] items-center gap-3">
                                                    <img
                                                        alt={horse.name}
                                                        className="h-11 w-11 flex-none rounded-md object-cover"
                                                        src={horse.imageUrl ? resolveFileUrl(horse.imageUrl) : horseRacing}
                                                    />
                                                    <div>
                                                        <strong className="block text-[var(--admin-ink)]">{horse.name}</strong>
                                                        <span className="mt-1 block text-[0.74rem] font-bold text-[var(--admin-muted)]">{horse.breed}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">{horse.age ?? '-'} yrs / {horse.weight ?? '-'} kg</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">{horse.owner || '-'}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                <HealthCertificateLink url={horse.healthCertificateImageUrl} compact />
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                <span className={`inline-flex min-h-6 items-center rounded border px-2.5 text-[0.68rem] font-black uppercase ${approvalClass[formatClass(horse.approval)]}`}>
                                                    {horse.approval}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                <button aria-label={`View details for ${horse.name}`} className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md bg-transparent text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={() => handleOpenHorseDetail(horse)} type="button">
                                                    <FaEye aria-hidden="true" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex min-h-[68px] items-center justify-between gap-[18px] px-[22px] py-4 text-[0.82rem] font-bold text-[var(--admin-muted)] max-[820px]:flex-col max-[820px]:items-stretch">
                            <span>Showing {firstShown} - {lastShown} of {filteredHorses.length} horses</span>
                            <div className="flex items-center gap-2 max-[820px]:flex-wrap">
                                <button aria-label="Previous page" className={pageButtonClass} disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">&lt;</button>
                                {getCompactPaginationItems(totalPages, page).map((pageItem) => (
                                    typeof pageItem === 'number' ? (
                                        <button
                                            className={`${pageButtonClass} ${pageItem === page ? 'border-[var(--admin-primary)] bg-[#e8f7ef] text-[#064e3b] hover:bg-[#d1fae5]' : ''}`}
                                            key={pageItem}
                                            onClick={() => setPage(pageItem)}
                                            type="button"
                                        >
                                            {pageItem}
                                        </button>
                                    ) : (
                                        <span className={`${pageButtonClass} cursor-default text-[var(--admin-muted)] hover:bg-[#fffdfc]`} key={pageItem}>...</span>
                                    )
                                ))}
                                <button aria-label="Next page" className={pageButtonClass} disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">&gt;</button>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-5">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="m-0 inline-flex items-center gap-2 text-[1.15rem] text-[var(--admin-primary-dark)]">
                                <FaExclamationTriangle aria-hidden="true" />
                                <span>Reported Horses Requiring Review</span>
                            </h2>
                            <button className="cursor-pointer rounded-full bg-[#e8f7ef] px-3 py-1.5 text-[0.72rem] font-black uppercase text-[var(--admin-primary)] hover:bg-[#d7f2e4]" type="button">View all</button>
                        </div>

                        <div className="grid grid-cols-2 gap-5 max-[1180px]:grid-cols-1">
                            {openReports.map((report) => (
                                <article className="grid gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]" key={report.id}>
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
                                        <span className="text-[0.68rem] font-black uppercase text-[#64748b]">Reason for report</span>
                                        <p className="mt-2 text-[0.84rem] font-semibold leading-[1.5] text-[#475569]">{report.reason}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button className="min-h-[36px] cursor-pointer rounded-md bg-[var(--admin-primary)] px-3 font-black text-white hover:bg-[var(--admin-primary-dark)]" onClick={() => handleReviewReport(report)} type="button">Review Report</button>
                                        <button className="min-h-[36px] cursor-pointer rounded-md border border-[#d89288] bg-white px-3 font-black text-[var(--admin-primary)] hover:bg-[#e8f7ef]" onClick={() => handleSuspendHorse(report)} type="button">Suspend Temporarily</button>
                                        <button aria-label={`Delete report for ${report.horse}`} className="grid h-9 w-9 cursor-pointer place-items-center rounded-md bg-transparent text-[#64748b] hover:bg-[#e8f7ef] hover:text-[var(--admin-primary)]" onClick={() => handleDeleteReport(report.id)} type="button">
                                            <FaTrashAlt aria-hidden="true" />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </section>

                {selectedHorse && (
                    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(37,18,14,0.45)] px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="horse-detail-title">
                        <section className="max-h-[92vh] w-full max-w-[860px] overflow-y-auto rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_24px_70px_rgba(37,18,14,0.28)]">
                            <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] bg-[#f8fbff] px-6 py-5">
                                <div>
                                    <h2 id="horse-detail-title" className="m-0 text-[1.35rem] text-[var(--admin-primary-dark)]">{selectedHorse.name}</h2>
                                    <span className="mt-1 block text-[0.82rem] font-bold text-[var(--admin-muted)]">{selectedHorse.breed}</span>
                                </div>
                                <button className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[1.15rem] font-black text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={handleCloseHorseDetail} type="button" aria-label="Close horse details">
                                    ×
                                </button>
                            </div>

                            {(selectedHorseLoading || selectedHorseError) && (
                                <div className={`mx-6 mt-4 rounded-md border px-4 py-3 text-[0.82rem] font-bold ${selectedHorseError ? 'border-[#e7a49a] bg-[#e8f7ef] text-[var(--admin-primary)]' : 'border-[var(--admin-border)] bg-[#fff8f6] text-[var(--admin-muted)]'}`}>
                                    {selectedHorseError || 'Loading horse detail...'}
                                </div>
                            )}

                            <div className="grid grid-cols-[260px_1fr] gap-6 p-6 max-[760px]:grid-cols-1">
                                <div className="grid content-start gap-3">
                                    <img
                                        alt={selectedHorse.name}
                                        className="h-[230px] w-full rounded-md object-cover"
                                        src={selectedHorse.imageUrl ? resolveFileUrl(selectedHorse.imageUrl) : horseRacing}
                                    />
                                    <div className="rounded-md border border-[var(--admin-border)] bg-[#fffdfc] p-4">
                                        <span className="block text-[0.68rem] font-black uppercase text-[#64748b]">Health Certificate</span>
                                        <HealthCertificateLink url={selectedHorse.healthCertificateImageUrl} />
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-3 max-[620px]:grid-cols-1">
                                        <HorseDetailItem label="Horse Name" value={detailValue(selectedHorse.name)} />
                                        <HorseDetailItem label="Breed" value={detailValue(selectedHorse.breed)} />
                                        <HorseDetailItem label="Age" value={detailValue(selectedHorse.age, ' yrs')} />
                                        <HorseDetailItem label="Weight" value={detailValue(selectedHorse.weight, ' kg')} />
                                        <HorseDetailItem label="Height" value={detailValue(selectedHorse.heightCm, ' cm')} />
                                        <HorseDetailItem label="Owner" value={detailValue(selectedHorse.owner)} />
                                        <HorseDetailItem label="Health Status" value={detailValue(selectedHorse.healthStatus)} />
                                        <HorseDetailItem label="Approval" value={detailValue(selectedHorse.approval)} />
                                        <HorseDetailItem label="Registered At" value={formatDetailDate(selectedHorse.createdAt)} />
                                        <HorseDetailItem label="Owner ID" value={detailValue(selectedHorse.ownerId)} />
                                    </div>

                                    <div className="rounded-md border border-[var(--admin-border)] bg-[#fff8f6] p-4">
                                        <span className="block text-[0.68rem] font-black uppercase text-[#64748b]">Achievement Summary</span>
                                        <p className="mt-2 text-[0.88rem] font-semibold leading-[1.55] text-[#475569]">{detailValue(selectedHorse.achievementSummary)}</p>
                                    </div>

                                    <div className="flex flex-wrap justify-end gap-3">
                                        <button className="min-h-[38px] cursor-pointer rounded-md border border-[#d89288] bg-white px-4 font-black text-[var(--admin-primary)] hover:bg-[#e8f7ef]" onClick={() => handleUpdateHorseApproval(selectedHorse, 'Banned')} type="button">Reject</button>
                                        <button className="min-h-[38px] cursor-pointer rounded-md bg-[var(--admin-primary)] px-4 font-black text-white hover:bg-[var(--admin-primary-dark)]" onClick={() => handleUpdateHorseApproval(selectedHorse, 'Active')} type="button">Confirm</button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
        </AdminLayout>
    );
}

export default HorseManagement;
