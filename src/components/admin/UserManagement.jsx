import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    useNavigate,
} from 'react-router-dom';

import {
    FaCalendarCheck,
    FaChevronDown,
    FaCheck,
    FaExclamationTriangle,
    FaEye,
    FaTimes,
    FaUsers,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import { resolveFileUrl } from '../../api/uploadApi';
import { getCompactPaginationItems } from '../../utils/pagination';

import AdminLayout from './AdminLayout';

const formatClass = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');
const isJockeyRole = (role) => formatClass(role) === 'jockey';

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 py-9 max-[780px]:px-5';
const selectWrapClass = 'relative inline-flex min-w-[86px] items-center';
const selectClass = 'h-8 min-w-[86px] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-6 text-[0.8rem] font-bold text-[var(--admin-ink)] outline-0';
const selectIconClass = 'pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[0.7rem] text-[var(--admin-ink)]';
const detailItemClass = 'grid gap-1 rounded-md bg-[#fff8f6] p-3';
const detailLabelClass = 'text-[0.7rem] font-black uppercase text-[#64748b]';
const documentCardClass = 'grid gap-3 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] p-3';

const summaryIconClass = {
    users: 'text-[#ff9a8d]',
    pending: 'text-[#8d6a0d]',
    reports: 'text-[var(--admin-primary)]',
};

const roleClass = {
    admin: 'border-[#b7cbff] bg-[#e7efff] text-[#1f57c7]',
    'horse-owner': 'border-[#a7dfbf] bg-[#e6f7ed] text-[#11734b]',
    jockey: 'border-[#ffc78f] bg-[#fff1df] text-[#c55b12]',
    referee: 'border-[#ffb9c3] bg-[#ffe9ed] text-[#c12e42]',
    spectator: 'border-[#ebb4ca] bg-[#fce8f0] text-[#874a62]',
};

const statusClass = {
    pending: 'border-[#efd06a] bg-[#fff7db] text-[#a17809]',
    active: 'border-[#9fdcb9] bg-[#e8f7ee] text-[#16864f]',
    inactive: 'border-[#dbc3bf] bg-[#f3e8e6] text-[#7f645f]',
    banned: 'border-[#e7a49a] bg-[#e8f7ef] text-[var(--admin-primary)]',
};

const badgeClass = 'inline-flex min-h-[22px] items-center rounded border px-2 text-[0.68rem] font-black uppercase';
const paginationButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]';
const pageSize = 5;

const activeRoleOrder = {
    admin: 0,
    horseowner: 1,
    'horse-owner': 1,
    jockey: 2,
    racereferee: 3,
    referee: 3,
    spectator: 4,
};

const getStatusSortRank = (status) => {
    const statusKey = formatClass(status);

    if (statusKey === 'pending') {
        return 0;
    }

    if (statusKey === 'active') {
        return 1;
    }

    return 2;
};

const getActiveRoleRank = (role) => activeRoleOrder[formatClass(role)] ?? 99;

const sortUsersForManagement = (items) => [...items].sort((current, next) => {
    const currentStatusRank = getStatusSortRank(current.status);
    const nextStatusRank = getStatusSortRank(next.status);

    if (currentStatusRank !== nextStatusRank) {
        return currentStatusRank - nextStatusRank;
    }

    if (currentStatusRank === 1) {
        return getActiveRoleRank(current.role) - getActiveRoleRank(next.role);
    }

    return 0;
});

const readField = (item, camelKey) => {
    if (!item) {
        return undefined;
    }

    const pascalKey = camelKey.charAt(0).toUpperCase() + camelKey.slice(1);

    return item[camelKey] ?? item[pascalKey];
};

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';

const displayValue = (value, suffix = '') => (hasValue(value) ? `${value}${suffix}` : '-');

const getListField = (item, key) => {
    const value = readField(item, key);

    return Array.isArray(value) ? value : [];
};

const getDocumentName = (url) => {
    if (!hasValue(url)) {
        return '';
    }

    const cleanUrl = String(url).split('?')[0];

    return decodeURIComponent(cleanUrl.split('/').pop() || 'Open document');
};

const isPdfUrl = (url) => /\.pdf$/i.test(String(url || '').split('?')[0]);

function DetailItem({ label, children }) {
    return (
        <div className={detailItemClass}>
            <span className={detailLabelClass}>{label}</span>
            <strong className="break-words text-[var(--admin-ink)]">{children}</strong>
        </div>
    );
}

function DocumentPreview({ label, url }) {
    const resolvedUrl = hasValue(url) ? resolveFileUrl(String(url)) : '';
    const fileName = getDocumentName(url);

    return (
        <article className={documentCardClass}>
            <span className={detailLabelClass}>{label}</span>
            {resolvedUrl ? (
                <div className="grid gap-2">
                    {isPdfUrl(url) ? (
                        <a
                            className="grid min-h-[132px] place-items-center rounded-md border border-dashed border-[var(--admin-border)] bg-[#fff8f6] px-3 text-center text-[0.84rem] font-black text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]"
                            href={resolvedUrl}
                            rel="noreferrer"
                            target="_blank"
                        >
                            Open PDF document
                        </a>
                    ) : (
                        <a href={resolvedUrl} rel="noreferrer" target="_blank">
                            <img
                                alt={label}
                                className="h-[132px] w-full rounded-md border border-[var(--admin-border)] object-contain"
                                src={resolvedUrl}
                            />
                        </a>
                    )}
                    <a className="truncate text-[0.78rem] font-bold text-[var(--admin-primary)]" href={resolvedUrl} rel="noreferrer" target="_blank">
                        {fileName || 'Open document'}
                    </a>
                </div>
            ) : (
                <span className="grid min-h-[132px] place-items-center rounded-md border border-dashed border-[var(--admin-border)] bg-[#fff8f6] text-[0.82rem] font-bold text-[var(--admin-muted)]">
                    Not uploaded
                </span>
            )}
        </article>
    );
}

function ExperienceList({ emptyText, items, renderItem }) {
    if (!items.length) {
        return <p className="m-0 text-[0.86rem] font-bold text-[var(--admin-muted)]">{emptyText}</p>;
    }

    return (
        <div className="grid gap-2">
            {items.map((item, index) => renderItem(item, index))}
        </div>
    );
}

const matchesQuery = (user, query) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return true;
    }

    return [
        user.id,
        user.name,
        user.email,
        user.role,
        user.status,
    ].some((value) => String(value).toLowerCase().includes(normalizedQuery));
};

function UserManagement() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');
    const [detailActionError, setDetailActionError] = useState('');
    const [detailActionLoading, setDetailActionLoading] = useState('');
    const detailRequestRef = useRef(0);

    useEffect(() => {
        let isMounted = true;

        adminApi.getUsers().then((payload) => {
            if (isMounted) {
                setUsers(payload);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const summaryCards = useMemo(() => [
        {
            label: 'Total Users',
            value: users.length.toLocaleString('en-US'),
            detail: 'All registered accounts',
            icon: FaUsers,
            tone: 'users',
        },
        {
            label: 'Pending Approval',
            value: String(users.filter((user) => formatClass(user.status) === 'pending').length),
            detail: 'Awaiting verification',
            icon: FaCalendarCheck,
            tone: 'pending',
        },
        {
            label: 'Banned Users',
            value: String(users.filter((user) => formatClass(user.status) === 'banned').length),
            detail: 'Requires attention',
            icon: FaExclamationTriangle,
            tone: 'reports',
        },
    ], [users]);

    const filteredUsers = useMemo(() => sortUsersForManagement(users.filter((user) => (
        matchesQuery(user, query)
        && (roleFilter === 'all' || formatClass(user.role) === roleFilter)
        && (statusFilter === 'all' || formatClass(user.status) === statusFilter)
    ))), [query, roleFilter, statusFilter, users]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
    const firstShown = filteredUsers.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastShown = Math.min(page * pageSize, filteredUsers.length);

    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
        setPage(1);
    };

    const handleQueryChange = (value) => {
        setQuery(value);
        setPage(1);
    };

    const handleCloseDetails = () => {
        detailRequestRef.current += 1;
        setSelectedUser(null);
        setDetailLoading(false);
        setDetailError('');
        setDetailActionError('');
        setDetailActionLoading('');
    };

    const handleViewDetails = async (user) => {
        const requestId = detailRequestRef.current + 1;
        detailRequestRef.current = requestId;
        setSelectedUser(user);
        setDetailError('');
        setDetailActionError('');
        setDetailActionLoading('');

        if (!isJockeyRole(user.role)) {
            setDetailLoading(false);
            return;
        }

        setDetailLoading(true);

        try {
            const jockeyDetail = await adminApi.getVerificationById(user.id);

            if (detailRequestRef.current !== requestId) {
                return;
            }

            setSelectedUser((current) => (
                current?.id === user.id ? { ...current, jockeyDetail } : current
            ));
        } catch (error) {
            if (detailRequestRef.current === requestId) {
                setDetailError(error.message || 'Failed to load jockey details.');
            }
        } finally {
            if (detailRequestRef.current === requestId) {
                setDetailLoading(false);
            }
        }
    };

    const selectedUserIsJockey = Boolean(selectedUser && isJockeyRole(selectedUser.role));
    const selectedJockeyDetail = selectedUser?.jockeyDetail;
    const jockeyDistanceExperiences = getListField(selectedJockeyDetail, 'distanceExperiences');
    const jockeyBreedExperiences = getListField(selectedJockeyDetail, 'breedExperiences');

    const updateSelectedUserState = (nextStatus, nextVerified) => {
        if (!selectedUser) {
            return;
        }

        setUsers((current) => current.map((user) => (
            user.id === selectedUser.id
                ? { ...user, status: nextStatus, verified: nextVerified ?? user.verified }
                : user
        )));

        setSelectedUser((current) => (
            current
                ? { ...current, status: nextStatus, verified: nextVerified ?? current.verified }
                : current
        ));
    };

    const handleUpdateSelectedUserStatus = async ({
        apiStatus,
        nextStatus,
        nextVerified,
        loadingKey,
        confirmMessage,
        errorMessage,
    }) => {
        if (!selectedUser) {
            return;
        }

        if (confirmMessage && !window.confirm(confirmMessage)) {
            return;
        }

        setDetailActionError('');
        setDetailActionLoading(loadingKey);

        try {
            await adminApi.updateUserStatus(selectedUser.id, apiStatus);
            updateSelectedUserState(nextStatus, nextVerified);
        } catch (error) {
            setDetailActionError(error.message || errorMessage || 'Failed to update this user.');
        } finally {
            setDetailActionLoading('');
        }
    };

    const handleRejectSelectedUser = async () => {
        if (!selectedUser) {
            return;
        }

        setDetailActionError('');
        setDetailActionLoading('reject');

        try {
            if (selectedUserIsJockey) {
                const jockeyId = readField(selectedJockeyDetail, 'jockeyId') || selectedUser.id;

                await adminApi.rejectVerification(jockeyId, 'Rejected by admin');
            } else {
                await adminApi.updateUserStatus(selectedUser.id, 'Inactive');
            }

            setUsers((current) => current.map((user) => (
                user.id === selectedUser.id
                    ? { ...user, status: 'Inactive', verified: false }
                    : user
            )));
            handleCloseDetails();
        } catch (error) {
            setDetailActionError(error.message || 'Failed to reject this user.');
        } finally {
            setDetailActionLoading('');
        }
    };

    return (
        <AdminLayout
            activeKey="users"
            mainClassName="user-management-main"
            onSearchChange={handleQueryChange}
            searchPlaceholder="Search users by name, role, email..."
            searchValue={query}
        >
                <section className={pageShellClass}>
                    <div className="flex items-center justify-between gap-5 max-[1180px]:flex-col max-[1180px]:items-stretch">
                        <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)]">
                            User Management
                        </h1>

                        <div className="flex items-center justify-end gap-2 max-[1180px]:justify-start max-[780px]:flex-col max-[780px]:items-stretch">
                            <label className="inline-flex h-[38px] items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.8rem] font-black text-[var(--admin-ink)] max-[780px]:w-full">
                                <span>Role:</span>
                                <span className={selectWrapClass}>
                                    <select className={selectClass} onChange={handleFilterChange(setRoleFilter)} value={roleFilter}>
                                        <option value="all">All</option>
                                        <option value="admin">Admin</option>
                                        <option value="horse-owner">Horse Owner</option>
                                        <option value="jockey">Jockey</option>
                                        <option value="referee">Referee</option>
                                        <option value="spectator">Spectator</option>
                                    </select>
                                    <FaChevronDown aria-hidden="true" className={selectIconClass} />
                                </span>
                            </label>

                            <label className="inline-flex h-[38px] items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.8rem] font-black text-[var(--admin-ink)] max-[780px]:w-full">
                                <span>Status:</span>
                                <span className={selectWrapClass}>
                                    <select className={selectClass} onChange={handleFilterChange(setStatusFilter)} value={statusFilter}>
                                        <option value="all">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="banned">Banned</option>
                                    </select>
                                    <FaChevronDown aria-hidden="true" className={selectIconClass} />
                                </span>
                            </label>

                            <button className="h-[38px] min-w-[92px] cursor-pointer rounded-md border-0 bg-[var(--admin-primary)] font-normal text-white hover:bg-[var(--admin-primary-dark)] max-[780px]:w-full" onClick={() => navigate('/admin/referees/create')} type="button">Create Referee Account</button>
                        </div>
                    </div>

                    <section aria-label="User management summary" className="grid grid-cols-3 gap-7 max-[1180px]:grid-cols-1">
                        {summaryCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <article className="flex min-h-[150px] items-start justify-between gap-5 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-7 py-[26px]" key={card.label}>
                                    <div>
                                        <span className="block text-[0.74rem] font-black uppercase tracking-normal text-[#64748b]">{card.label}</span>
                                        <strong className="mt-2 block text-[2rem] leading-none text-[var(--admin-primary-dark)]">{card.value}</strong>
                                        <small className={`mt-[18px] block text-[0.74rem] font-black ${card.tone === 'reports' ? 'text-[var(--admin-primary)]' : 'text-inherit'}`}>
                                            {card.detail}
                                        </small>
                                    </div>
                                    <Icon aria-hidden="true" className={`h-7 w-7 flex-none ${summaryIconClass[card.tone]}`} />
                                </article>
                            );
                        })}
                    </section>

                    <section className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse max-[780px]:min-w-[920px]">
                                <thead>
                                    <tr>
                                        {['User ID', 'Full Name', 'Email', 'Role', 'Status', 'Verified', 'Created At', 'Details'].map((heading) => (
                                            <th className="whitespace-nowrap border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-[18px] text-left text-[0.72rem] uppercase text-[#64748b]" key={heading}>
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">{user.id}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">
                                                <strong>{user.name}</strong>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">{user.email}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">
                                                <span className={`${badgeClass} ${roleClass[formatClass(user.role)]}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">
                                                <span className={`${badgeClass} ${statusClass[formatClass(user.status)]}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">
                                                <span className={`inline-grid h-[22px] w-[22px] place-items-center rounded-full ${user.verified ? 'text-[#0aa15f]' : 'text-[#d71920]'}`}>
                                                    {user.verified ? <FaCheck /> : <FaTimes />}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">{adminApi.formatters.toDateLabel(user.createdAt)}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-[18px] align-middle text-[0.92rem] text-[var(--admin-ink)]">
                                                <button aria-label={`View details for ${user.name}`} className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border-0 bg-transparent text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={() => handleViewDetails(user)} type="button">
                                                    <FaEye aria-hidden="true" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex min-h-[68px] items-center justify-between gap-[18px] px-[22px] py-4 text-[0.82rem] font-bold text-[var(--admin-muted)] max-[820px]:flex-col max-[820px]:items-stretch">
                            <span>Showing {firstShown} - {lastShown} of {filteredUsers.length} entries</span>

                            <div className="flex items-center gap-2 max-[820px]:flex-wrap">
                                <button aria-label="Previous page" className={paginationButtonClass} disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">&lt;</button>
                                {getCompactPaginationItems(totalPages, page).map((pageItem) => (
                                    typeof pageItem === 'number' ? (
                                        <button
                                            className={`${paginationButtonClass} ${pageItem === page ? 'border-[var(--admin-primary)] bg-[#e8f7ef] text-[#064e3b] hover:bg-[#d1fae5]' : ''}`}
                                            key={pageItem}
                                            onClick={() => setPage(pageItem)}
                                            type="button"
                                        >
                                            {pageItem}
                                        </button>
                                    ) : (
                                        <span className={`${paginationButtonClass} cursor-default text-[var(--admin-muted)] hover:bg-[#fffdfc]`} key={pageItem}>...</span>
                                    )
                                ))}
                                <button aria-label="Next page" className={paginationButtonClass} disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">&gt;</button>
                            </div>
                        </div>
                    </section>

                    {selectedUser && (
                        <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8" onClick={handleCloseDetails} role="presentation">
                            <section
                                aria-label={`Details for ${selectedUser.name}`}
                                className={`grid max-h-[calc(100vh-64px)] ${selectedUserIsJockey ? 'w-[min(920px,100%)]' : 'w-[min(520px,100%)]'} gap-5 overflow-y-auto rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_20px_48px_rgba(45,32,32,0.22)]`}
                                onClick={(event) => event.stopPropagation()}
                                role="dialog"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="m-0 text-[1.35rem] leading-[1.15] text-[var(--admin-primary-dark)]">{selectedUser.name}</h2>
                                        <span className="mt-2 inline-flex text-[0.8rem] font-black text-[var(--admin-muted)]">{selectedUser.id}</span>
                                    </div>
                                    <button aria-label="Close user details" className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={handleCloseDetails} type="button">
                                        <FaTimes aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-[0.9rem] max-[560px]:grid-cols-1">
                                    <DetailItem label="Email">{selectedUser.email}</DetailItem>
                                    <div className={detailItemClass}>
                                        <span className={detailLabelClass}>Role</span>
                                        <span className={`${badgeClass} w-fit ${roleClass[formatClass(selectedUser.role)]}`}>{selectedUser.role}</span>
                                    </div>
                                    <div className={detailItemClass}>
                                        <span className={detailLabelClass}>Status</span>
                                        <span className={`${badgeClass} w-fit ${statusClass[formatClass(selectedUser.status)]}`}>{selectedUser.status}</span>
                                    </div>
                                    <div className={detailItemClass}>
                                        <span className={detailLabelClass}>Verified</span>
                                        <strong className={selectedUser.verified ? 'text-[#0aa15f]' : 'text-[#d71920]'}>
                                            {selectedUser.verified ? 'Verified' : 'Not verified'}
                                        </strong>
                                    </div>
                                    <DetailItem label="Created At">{adminApi.formatters.toDateLabel(selectedUser.createdAt)}</DetailItem>
                                </div>

                                {selectedUserIsJockey && (
                                    <section className="grid gap-5 border-t border-[var(--admin-border)] pt-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <h3 className="m-0 text-[1.05rem] text-[var(--admin-primary-dark)]">Jockey Profile</h3>
                                            {detailLoading && <span className="text-[0.8rem] font-black text-[var(--admin-muted)]">Loading...</span>}
                                        </div>

                                        {detailError && (
                                            <p className="m-0 rounded-md border border-[#e7a49a] bg-[#e8f7ef] px-3 py-2 text-[0.86rem] font-bold text-[var(--admin-primary)]">
                                                {detailError}
                                            </p>
                                        )}

                                        {!detailLoading && !detailError && selectedJockeyDetail && (
                                            <>
                                                <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 max-[760px]:grid-cols-1">
                                                    <DocumentPreview label="Profile Image" url={readField(selectedJockeyDetail, 'profileImageUrl')} />

                                                    <div className="grid grid-cols-3 gap-3 text-[0.9rem] max-[760px]:grid-cols-1">
                                                        <DetailItem label="Jockey ID">{displayValue(readField(selectedJockeyDetail, 'jockeyId'))}</DetailItem>
                                                        <DetailItem label="Jockey Code">{displayValue(readField(selectedJockeyDetail, 'jockeyCode'))}</DetailItem>
                                                        <DetailItem label="Phone">{displayValue(readField(selectedJockeyDetail, 'phone'))}</DetailItem>
                                                        <DetailItem label="Weight">{displayValue(readField(selectedJockeyDetail, 'weightKg'), ' kg')}</DetailItem>
                                                        <DetailItem label="Experience">{displayValue(readField(selectedJockeyDetail, 'yearsOfExperience'), ' years')}</DetailItem>
                                                        <DetailItem label="Health">{displayValue(readField(selectedJockeyDetail, 'healthStatus'))}</DetailItem>
                                                        <DetailItem label="Jockey Active">{readField(selectedJockeyDetail, 'isActive') ? 'Active' : 'Inactive'}</DetailItem>
                                                        <DetailItem label="Certificate No">{displayValue(readField(selectedJockeyDetail, 'certificateNo'))}</DetailItem>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
                                                    <DocumentPreview label="National ID - Front" url={readField(selectedJockeyDetail, 'idCardFrontUrl')} />
                                                    <DocumentPreview label="National ID - Back" url={readField(selectedJockeyDetail, 'idCardBackUrl')} />
                                                    <DocumentPreview label="Horse Racing License" url={readField(selectedJockeyDetail, 'certificateFileUrl')} />
                                                    <DocumentPreview label="Health Certificate" url={readField(selectedJockeyDetail, 'healthCertificateUrl')} />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
                                                    <div className="grid gap-3 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] p-3">
                                                        <span className={detailLabelClass}>Distance Experience</span>
                                                        <ExperienceList
                                                            emptyText="No distance experience."
                                                            items={jockeyDistanceExperiences}
                                                            renderItem={(item, index) => (
                                                                <div className="flex items-center justify-between gap-3 rounded-md bg-[#fff8f6] px-3 py-2 text-[0.86rem]" key={`${readField(item, 'distanceMeters') || index}-distance`}>
                                                                    <span className="font-bold text-[var(--admin-ink)]">
                                                                        {readField(item, 'label') || displayValue(readField(item, 'distanceMeters'), 'm')}
                                                                    </span>
                                                                    <strong className="text-[var(--admin-primary-dark)]">{displayValue(readField(item, 'skillLevel'))}</strong>
                                                                </div>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="grid gap-3 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] p-3">
                                                        <span className={detailLabelClass}>Breed Experience</span>
                                                        <ExperienceList
                                                            emptyText="No breed experience."
                                                            items={jockeyBreedExperiences}
                                                            renderItem={(item, index) => (
                                                                <div className="flex items-center justify-between gap-3 rounded-md bg-[#fff8f6] px-3 py-2 text-[0.86rem]" key={`${readField(item, 'breedId') || index}-breed`}>
                                                                    <span className="font-bold text-[var(--admin-ink)]">{displayValue(readField(item, 'breedName'))}</span>
                                                                    <strong className="text-[var(--admin-primary-dark)]">{displayValue(readField(item, 'experienceLevel'))}</strong>
                                                                </div>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {!detailLoading && !detailError && !selectedJockeyDetail && (
                                            <p className="m-0 rounded-md bg-[#fff8f6] px-3 py-2 text-[0.86rem] font-bold text-[var(--admin-muted)]">
                                                Jockey details are not available.
                                            </p>
                                        )}
                                    </section>
                                )}

                                {detailActionError && (
                                    <p className="m-0 rounded-md border border-[#e7a49a] bg-[#e8f7ef] px-3 py-2 text-[0.86rem] font-bold text-[var(--admin-primary)]">
                                        {detailActionError}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-3 border-t border-[var(--admin-border)] pt-4">
                                    {['pending', 'inactive'].includes(formatClass(selectedUser.status)) && (
                                        <button
                                            className="inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] px-4 font-black text-white hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-70"
                                            disabled={Boolean(detailActionLoading)}
                                            onClick={() => handleUpdateSelectedUserStatus({
                                                apiStatus: 'Active',
                                                nextStatus: 'Active',
                                                nextVerified: true,
                                                loadingKey: 'approve',
                                                errorMessage: 'Failed to approve this user.',
                                            })}
                                            type="button"
                                        >
                                            {detailActionLoading === 'approve' ? 'Approving...' : 'Approve'}
                                        </button>
                                    )}

                                    {formatClass(selectedUser.status) === 'pending' && (
                                        <button
                                            className="inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-4 font-black text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef] disabled:cursor-not-allowed disabled:opacity-70"
                                            disabled={Boolean(detailActionLoading)}
                                            onClick={handleRejectSelectedUser}
                                            type="button"
                                        >
                                            {detailActionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
                                        </button>
                                    )}

                                    {formatClass(selectedUser.status) !== 'banned' && (
                                        <button
                                            className="inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-md border border-[#e7a49a] bg-[#e8f7ef] px-4 font-black text-[var(--admin-primary)] hover:bg-[#d7f2e4] disabled:cursor-not-allowed disabled:opacity-70"
                                            disabled={Boolean(detailActionLoading)}
                                            onClick={() => handleUpdateSelectedUserStatus({
                                                apiStatus: 'Banned',
                                                nextStatus: 'Banned',
                                                loadingKey: 'ban',
                                                confirmMessage: `Ban ${selectedUser.name}?`,
                                                errorMessage: 'Failed to ban this user.',
                                            })}
                                            type="button"
                                        >
                                            {detailActionLoading === 'ban' ? 'Banning...' : 'Ban'}
                                        </button>
                                    )}

                                    {formatClass(selectedUser.status) === 'banned' && (
                                        <button
                                            className="inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] px-4 font-black text-white hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-70"
                                            disabled={Boolean(detailActionLoading)}
                                            onClick={() => handleUpdateSelectedUserStatus({
                                                apiStatus: 'Unblocked',
                                                nextStatus: 'Active',
                                                nextVerified: true,
                                                loadingKey: 'unblock',
                                                errorMessage: 'Failed to unblock this user.',
                                            })}
                                            type="button"
                                        >
                                            {detailActionLoading === 'unblock' ? 'Unblocking...' : 'Unblock'}
                                        </button>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}
                </section>
        </AdminLayout>
    );
}

export default UserManagement;
