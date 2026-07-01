import {
    useEffect,
    useMemo,
    useState,
} from 'react';
import ImageLightbox from '../shared/ImageLightbox';

import {
    FaCheck,
    FaEye,
    FaTimes,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import { resolveFileUrl } from '../../api/uploadApi';
import horseRacing from '../../assets/horse-racing.jpg';
import AdminLayout from './AdminLayout';

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 py-10 max-[860px]:px-5 max-[860px]:py-7';

const statusClass = {
    pending: 'border-[#efd06a] bg-[#fff7db] text-[#a17809]',
    approved: 'border-[#a7dfbf] bg-[#e8f7ee] text-[#16864f]',
    rejected: 'border-[#e7a49a] bg-[#e8f7ef] text-[var(--admin-primary)]',
    jockeyinvited: 'border-[#b8d4ef] bg-[#e8f2ff] text-[#286a8f]',
    readytorace: 'border-[#a7dfbf] bg-[#e8f7ee] text-[#16864f]',
    completed: 'border-[#d6d6d6] bg-[#f2f2f2] text-[#555]',
    cancelled: 'border-[#e7a49a] bg-[#e8f7ef] text-[var(--admin-primary)]',
};

const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'jockeyinvited', label: 'JockeyInvited' },
    { value: 'readytorace', label: 'ReadyToRace' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const formatClass = (value) => String(value || '').toLowerCase().replace(/\s+/g, '');

function formatDateTime(value) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function detailValue(value, suffix = '') {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return `${value}${suffix}`;
}

function DetailItem({ label, value }) {
    return (
        <div className="rounded-md border border-[var(--admin-border)] bg-[#fff8f6] p-3">
            <span className="block text-[0.68rem] font-black uppercase text-[#64748b]">
                {label}
            </span>
            <strong className="mt-1 block break-words text-[0.9rem] text-[var(--admin-ink)]">
                {value || '-'}
            </strong>
        </div>
    );
}

function HealthCertificatePreview({ url, compact = false }) {
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

export default function RegistrationManagement() {
    const [registrations, setRegistrations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState('');
    const [selectedLoading, setSelectedLoading] = useState(false);
    const [selectedError, setSelectedError] = useState('');
    const [registrationStats, setRegistrationStats] = useState({ pending: 0, approved: 0, rejected: 0 });

    const loadRegistrations = async (nextStatus = statusFilter) => {
        try {
            setLoading(true);
            setError('');

            let data;
            let allData;

            if (nextStatus === 'pending') {
                [data, allData] = await Promise.all([
                    adminApi.getPendingRegistrations(),
                    adminApi.getRegistrations().catch(() => []),
                ]);
            } else {
                data = await adminApi.getRegistrations();
                allData = data;
            }

            setRegistrations(Array.isArray(data) ? data : []);

            const statItems = Array.isArray(allData) ? allData : [];
            setRegistrationStats({
                pending: statItems.filter((item) => formatClass(item.status) === 'pending').length,
                approved: statItems.filter((item) => formatClass(item.status) === 'approved').length,
                rejected: statItems.filter((item) => formatClass(item.status) === 'rejected').length,
            });
        } catch (err) {
            setError(err.message || 'Cannot load registrations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRegistrations('pending');
    }, []);

    const handleStatusFilterChange = (event) => {
        const nextStatus = event.target.value;
        setStatusFilter(nextStatus);
        loadRegistrations(nextStatus);
    };

    const filteredRegistrations = useMemo(() => {
        const keyword = query.trim().toLowerCase();

        return registrations.filter((item) => {
            const normalizedStatus = formatClass(item.status);
            const matchStatus = statusFilter === 'all' || normalizedStatus === statusFilter;

            const searchText = [
                item.registrationId,
                item.horseName,
                item.breedName,
                item.ownerName,
                item.ownerEmail,
                item.tournamentName,
                item.raceName,
                item.status,
            ].join(' ').toLowerCase();

            return matchStatus && searchText.includes(keyword);
        });
    }, [query, registrations, statusFilter]);

    const pendingCount = registrationStats.pending;
    const approvedCount = registrationStats.approved;
    const rejectedCount = registrationStats.rejected;

    const handleApprove = async (registration) => {
        const ok = window.confirm(
            `Confirm "${registration.horseName}" for "${registration.tournamentName}"?`
        );

        if (!ok) {
            return;
        }

        try {
            setSavingId(registration.registrationId);
            await adminApi.approveRegistration(registration.registrationId);
            await loadRegistrations(statusFilter);
            setSelected(null);
        } catch (err) {
            window.alert(err.message || 'Approve failed.');
        } finally {
            setSavingId(null);
        }
    };

    const handleReject = async (registration) => {
        const note = window.prompt(
            `Reject reason for "${registration.horseName}" in "${registration.tournamentName}":`,
            'Rejected by admin'
        );

        if (note === null) {
            return;
        }

        try {
            setSavingId(registration.registrationId);
            await adminApi.rejectRegistration(registration.registrationId, note);
            await loadRegistrations(statusFilter);
            setSelected(null);
        } catch (err) {
            window.alert(err.message || 'Reject failed.');
        } finally {
            setSavingId(null);
        }
    };

    const handleOpenRegistrationDetail = async (registration) => {
        setSelected(registration);
        setSelectedError('');
        setSelectedLoading(true);

        try {
            const detail = await adminApi.getRegistrationById(registration.registrationId);
            setSelected({ ...registration, ...detail });
        } catch (err) {
            setSelectedError(err.message || 'Cannot load registration detail.');
        } finally {
            setSelectedLoading(false);
        }
    };

    return (
        <AdminLayout
            activeKey="registrations"
            mainClassName="registration-management-main"
            onSearchChange={setQuery}
            searchPlaceholder="Search race entries, horses, owners..."
            searchValue={query}
        >
            <section className={pageShellClass}>
                <div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[860px]:text-[1.6rem]">
                        Race Entry Approval
                    </h1>
                    <p className="mt-2 text-[0.92rem] font-semibold text-[var(--admin-muted)]">
                        Review horse entries submitted by owners for races and tournaments.
                    </p>
                </div>

                <section className="grid grid-cols-3 gap-7 max-[1180px]:grid-cols-1">
                    <article className="relative min-h-[120px] rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-6 py-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:bg-[#d49a15] before:content-['']">
                        <span className="block text-[0.78rem] font-black uppercase text-[#64748b]">
                            Pending Approval
                        </span>
                        <strong className="mt-3 block text-[2.4rem] leading-none text-[var(--admin-primary-dark)]">
                            {pendingCount}
                        </strong>
                    </article>

                    <article className="relative min-h-[120px] rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-6 py-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:bg-[#24715d] before:content-['']">
                        <span className="block text-[0.78rem] font-black uppercase text-[#64748b]">
                            Approved Entries
                        </span>
                        <strong className="mt-3 block text-[2.4rem] leading-none text-[var(--admin-primary-dark)]">
                            {approvedCount}
                        </strong>
                    </article>

                    <article className="relative min-h-[120px] rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-6 py-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:bg-[var(--admin-primary)] before:content-['']">
                        <span className="block text-[0.78rem] font-black uppercase text-[#64748b]">
                            Rejected Entries
                        </span>
                        <strong className="mt-3 block text-[2.4rem] leading-none text-[var(--admin-primary-dark)]">
                            {rejectedCount}
                        </strong>
                    </article>
                </section>

                <section className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] bg-[#f8fbff] px-5 py-4">
                        <h2 className="m-0 text-[1.05rem] font-black text-[var(--admin-ink)]">
                            Horse Race Registration Requests
                        </h2>

                        <select
                            className="h-[38px] min-w-[160px] cursor-pointer rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.78rem] font-bold text-[#475569] outline-0"
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="m-4 rounded-md border border-[#e7a49a] bg-[#e8f7ef] p-3 font-bold text-[var(--admin-primary)]">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="p-8 text-center font-bold text-[var(--admin-muted)]">
                            Loading registrations...
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse max-[860px]:min-w-[980px]">
                                <thead>
                                    <tr>
                                        {[
                                            'Horse & Breed',
                                            'Owner',
                                            'Tournament / Race',
                                            'Health Certificate',
                                            'Race Date',
                                            'Submitted',
                                            'Status',
                                            'Actions',
                                        ].map((heading) => (
                                            <th
                                                className="whitespace-nowrap border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[18px] text-left text-[0.72rem] uppercase text-[#64748b]"
                                                key={heading}
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredRegistrations.length === 0 ? (
                                        <tr>
                                            <td
                                                className="px-[22px] py-8 text-center font-bold text-[var(--admin-muted)]"
                                                colSpan={8}
                                            >
                                                No race entry requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRegistrations.map((item) => {
                                            const normalizedStatus = formatClass(item.status);
                                            const canReview = normalizedStatus === 'pending';

                                            return (
                                                <tr key={item.registrationId}>
                                                    <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                        <div className="flex min-w-[220px] items-center gap-3">
                                                            <img
                                                                alt={item.horseName || 'Horse'}
                                                                className="h-11 w-11 flex-none rounded-md object-cover"
                                                                src={item.horseImageUrl ? resolveFileUrl(item.horseImageUrl) : horseRacing}
                                                            />
                                                            <div>
                                                                <strong className="block text-[var(--admin-ink)]">
                                                                    {item.horseName || '-'}
                                                                </strong>
                                                                <span className="mt-1 block text-[0.74rem] font-bold text-[var(--admin-muted)]">
                                                                    {item.breedName || '-'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                        <strong>{item.ownerName || '-'}</strong>
                                                        <span className="mt-1 block text-[0.74rem] text-[var(--admin-muted)]">
                                                            {item.ownerEmail || '-'}
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                        <strong>{item.tournamentName || '-'}</strong>
                                                        <span className="mt-1 block text-[0.74rem] text-[var(--admin-muted)]">
                                                            {item.raceName || '-'}
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                        <HealthCertificatePreview url={item.healthCertificateImageUrl} compact />
                                                    </td>

                                                    <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                        {formatDateTime(item.raceDate)}
                                                    </td>

                                                    <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                        {formatDateTime(item.submittedAt)}
                                                    </td>

                                                    <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                        <span className={`inline-flex min-h-6 items-center rounded border px-2.5 text-[0.68rem] font-black uppercase ${statusClass[normalizedStatus] || statusClass.pending}`}>
                                                            {item.status || '-'}
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.9rem] font-bold text-[var(--admin-ink)]">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                aria-label={`View race entry ${item.registrationId}`}
                                                                className="grid h-8 w-8 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary)] hover:bg-[#e8f7ef]"
                                                                title="View"
                                                                type="button"
                                                                onClick={() => handleOpenRegistrationDetail(item)}
                                                            >
                                                                <FaEye aria-hidden="true" />
                                                            </button>

                                                            {canReview && (
                                                                <>
                                                                    <button
                                                                        aria-label={`Approve race entry ${item.registrationId}`}
                                                                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-md border border-[#a7dfbf] bg-[#e8f7ee] text-[#16864f] hover:bg-[#d8f1e3] disabled:cursor-not-allowed disabled:opacity-50"
                                                                        disabled={savingId === item.registrationId}
                                                                        title="Confirm"
                                                                        type="button"
                                                                        onClick={() => handleApprove(item)}
                                                                    >
                                                                        <FaCheck aria-hidden="true" />
                                                                    </button>

                                                                    <button
                                                                        aria-label={`Reject race entry ${item.registrationId}`}
                                                                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-md border border-[#e7a49a] bg-[#e8f7ef] text-[var(--admin-primary)] hover:bg-[#d7f2e4] disabled:cursor-not-allowed disabled:opacity-50"
                                                                        disabled={savingId === item.registrationId}
                                                                        title="Reject"
                                                                        type="button"
                                                                        onClick={() => handleReject(item)}
                                                                    >
                                                                        <FaTimes aria-hidden="true" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </section>

            {selected && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(45,32,32,0.45)] px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="registration-detail-title">
                    <section className="max-h-[92vh] w-[min(860px,100%)] overflow-y-auto rounded-[var(--admin-radius)] bg-[var(--admin-surface)] shadow-[0_25px_80px_rgba(0,0,0,0.22)]">
                        <div className="flex items-start justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
                            <div>
                                <h3 id="registration-detail-title" className="m-0 text-[1.25rem] font-black text-[var(--admin-primary-dark)]">
                                    Race Entry #{selected.registrationId}
                                </h3>
                                <p className="mt-1 text-[0.88rem] font-semibold text-[var(--admin-muted)]">
                                    {selected.horseName || '-'} for {selected.tournamentName || '-'}
                                </p>
                            </div>

                            <button
                                aria-label="Close race entry details"
                                className="grid h-8 w-8 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] font-black text-[var(--admin-primary)] hover:bg-[#e8f7ef]"
                                type="button"
                                onClick={() => setSelected(null)}
                            >
                                x
                            </button>
                        </div>

                        {(selectedLoading || selectedError) && (
                            <div className={`mx-5 mt-4 rounded-md border px-4 py-3 text-[0.82rem] font-bold ${selectedError ? 'border-[#e7a49a] bg-[#e8f7ef] text-[var(--admin-primary)]' : 'border-[var(--admin-border)] bg-[#fff8f6] text-[var(--admin-muted)]'}`}>
                                {selectedError || 'Loading race entry detail...'}
                            </div>
                        )}

                        <div className="grid grid-cols-[240px_1fr] gap-5 p-5 max-[720px]:grid-cols-1">
                            <div className="grid content-start gap-3">
                                <img
                                    alt={selected.horseName || 'Horse'}
                                    className="h-[190px] w-full rounded-md object-cover"
                                    src={selected.horseImageUrl ? resolveFileUrl(selected.horseImageUrl) : horseRacing}
                                />
                                <div className="rounded-md border border-[var(--admin-border)] bg-[#fffdfc] p-4">
                                    <span className="block text-[0.68rem] font-black uppercase text-[#64748b]">
                                        Health Certificate
                                    </span>
                                    <HealthCertificatePreview url={selected.healthCertificateImageUrl} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
                                <DetailItem label="Horse Name" value={selected.horseName} />
                                <DetailItem label="Breed" value={selected.breedName} />
                                <DetailItem label="Age" value={detailValue(selected.age, ' yrs')} />
                                <DetailItem label="Weight" value={detailValue(selected.weightKg, ' kg')} />
                                <DetailItem label="Health Status" value={selected.healthStatus} />
                                <DetailItem label="Owner" value={selected.ownerName} />
                                <DetailItem label="Owner Email" value={selected.ownerEmail} />
                                <DetailItem label="Tournament" value={selected.tournamentName} />
                                <DetailItem label="Race" value={selected.raceName} />
                                <DetailItem label="Race Date" value={formatDateTime(selected.raceDate)} />
                                <DetailItem label="Distance" value={detailValue(selected.distanceMeters, ' m')} />
                                <DetailItem label="Status" value={selected.status} />
                                <DetailItem label="Submitted At" value={formatDateTime(selected.submittedAt)} />
                                <DetailItem label="Admin Note" value={selected.adminNote} />
                            </div>
                        </div>

                        {formatClass(selected.status) === 'pending' && (
                            <div className="flex justify-end gap-3 border-t border-[var(--admin-border)] px-5 py-4">
                                <button
                                    className="min-h-[38px] cursor-pointer rounded-md border border-[#e7a49a] bg-white px-4 font-black text-[var(--admin-primary)] hover:bg-[#e8f7ef] disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={savingId === selected.registrationId}
                                    type="button"
                                    onClick={() => handleReject(selected)}
                                >
                                    Reject
                                </button>

                                <button
                                    className="min-h-[38px] cursor-pointer rounded-md border border-[var(--admin-primary)] bg-[var(--admin-primary)] px-4 font-black text-white hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={savingId === selected.registrationId}
                                    type="button"
                                    onClick={() => handleApprove(selected)}
                                >
                                    Confirm
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </AdminLayout>
    );
}
