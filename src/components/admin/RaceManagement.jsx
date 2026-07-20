import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    FaBolt,
    FaCalendarAlt,
    FaCheckCircle,
    FaClipboardList,
    FaEdit,
    FaEye,
    FaFilter,
    FaHorseHead,
    FaMapMarkerAlt,
    FaSortAmountDown,
    FaTimes,
    FaTrashAlt,
    FaUserTie,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import { resolveFileUrl } from '../../api/uploadApi';
import horseRacing from '../../assets/horse-racing.jpg';
import {
    formatCurrencyAmount,
    handleCurrencyInputChange,
    parseCurrency,
} from '../../utils/currency';
import {
    confirmAdminAction,
    showAdminSuccess,
} from '../../utils/adminFeedback';
import { getCompactPaginationItems } from '../../utils/pagination';

import AdminLayout from './AdminLayout';

const formatClass = (value) => String(value || '').toLowerCase();

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 pb-7 pt-11 max-[820px]:px-5 max-[820px]:py-7';

const statClass = {
    total: {
        accent: 'before:bg-[var(--admin-primary)]',
        soft: 'bg-[var(--admin-surface-strong)]',
        ink: 'text-[var(--admin-primary)]',
    },
    active: {
        accent: 'before:bg-[#16864f]',
        soft: 'bg-[#e8f7ee]',
        ink: 'text-[#16864f]',
    },
    pending: {
        accent: 'before:bg-[#8a6209]',
        soft: 'bg-[#faf2e0]',
        ink: 'text-[#8a6209]',
    },
    inactive: {
        accent: 'before:bg-[var(--admin-primary)]',
        soft: 'bg-[var(--admin-surface-strong)]',
        ink: 'text-[var(--admin-primary)]',
    },
};

const statusClass = {
    default: 'bg-[#f3f4f6] text-[#374151]',
    draft: 'bg-[#f3f4f6] text-[#374151]',
    openregistration: 'bg-[#e8f7ee] text-[#16864f]',
    closedregistration: 'bg-[#f3e1df] text-[#a4392f]',
    ongoing: 'bg-[#faf2e0] text-[#8a6209]',
    completed: 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]',
    cancelled: 'bg-[#f3f4f6] text-[#6b7280]',
};

const statusBadgeBaseClass = 'inline-flex min-h-6 items-center rounded-full px-2.5 text-[0.68rem] font-black';
const getStatusClass = (status) => `${statusBadgeBaseClass} ${statusClass[formatClass(status)] || statusClass.default}`;

const deadlineClass = {
    warning: 'text-[#b45309]',
    danger: 'text-[#b91c1c]',
};

const statusActionLabels = {
    approve: 'Publish Tournament',
    closeRegistration: 'Close Registration',
    cancel: 'Cancel Tournament',
    restore: 'Restore Tournament',
};

const getTournamentActions = (status) => {
    switch (status) {
        case 'Draft':
            return ['approve', 'cancel'];
        case 'OpenRegistration':
            return ['closeRegistration', 'cancel'];
        case 'ClosedRegistration':
        case 'Ongoing':
            return ['cancel'];
        case 'Cancelled':
            return ['restore'];
        default:
            return [];
    }
};

const normalizeRefereeNames = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.flatMap(normalizeRefereeNames);
    }

    if (typeof value === 'string') {
        const refereeName = value.trim();

        if (!refereeName || refereeName.toLowerCase() === 'unassigned') {
            return [];
        }

        return [refereeName];
    }

    if (typeof value === 'number') {
        return [`Referee #${value}`];
    }

    if (typeof value === 'object') {
        const directName = value.fullName
            || value.FullName
            || value.name
            || value.Name
            || value.refereeName
            || value.RefereeName
            || value.refereeFullName
            || value.RefereeFullName
            || value.userName
            || value.UserName
            || value.email;

        if (directName) {
            return normalizeRefereeNames(directName);
        }

        if (value.referee || value.Referee || value.user || value.User || value.account || value.Account) {
            return normalizeRefereeNames(value.referee || value.Referee || value.user || value.User || value.account || value.Account);
        }

        if (value.refereeId || value.userId) {
            return [`Referee #${value.refereeId || value.userId}`];
        }
    }

    return [];
};

const getRefereeNames = (tournament) => {
    const sources = [
        tournament.referees,
        tournament.assignedReferees,
        tournament.refereeAssignments,
        tournament.raceReferees,
        tournament.tournamentReferees,
        tournament.TournamentReferees,
        tournament.referee,
        tournament.Referee,
        tournament.assignedReferee,
        tournament.AssignedReferee,
        tournament.refereeName,
        tournament.RefereeName,
        tournament.assignedRefereeName,
        tournament.AssignedRefereeName,
        tournament.refereeFullName,
        tournament.RefereeFullName,
    ];

    return [...new Set(sources
        .flatMap(normalizeRefereeNames)
        .map((name) => String(name).trim())
        .filter(Boolean))];
};

const filterSelectClass = 'h-full w-full min-w-0 cursor-pointer border-0 bg-transparent p-0 text-[0.8rem] font-extrabold text-[#5b403c] outline-0';
const paginationButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-full border border-[var(--admin-border)] bg-white font-bold text-[var(--admin-primary-dark)] transition-colors hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary)] hover:text-white';
const editFieldClass = 'grid gap-1.5';
const editLabelClass = 'text-[0.72rem] font-black uppercase text-[#64748b]';
const editControlClass = 'h-10 w-full min-w-0 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.88rem] font-bold text-[var(--admin-ink)] outline-0 focus:border-[#0b7f5a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]';
const editFileControlClass = `${editControlClass} flex min-h-10 cursor-pointer items-center gap-3 py-2`;
const detailItemClass = 'grid gap-1 rounded-md bg-[#fff8f6] p-3';
const detailLabelClass = 'text-[0.66rem] font-black uppercase text-[#64748b]';
const detailValueClass = 'break-words text-[0.9rem] font-bold text-[var(--admin-ink)]';
const actionButtonClass = 'inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-full px-3.5 text-[0.76rem] font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60';
const pageSize = 4;
const distanceOptions = [1000, 1500, 2400];
const minDate = '2000-01-01';
const maxDate = '2100-12-31';
const maxPrizePool = 1000000000;
const maxTournamentImageSize = 5 * 1024 * 1024;
const allowedTournamentImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedTournamentImageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const tournamentImageAccept = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

const getDistanceMeters = (tournament) => {
    const distanceMeters = Number(tournament?.distanceMeters ?? tournament?.DistanceMeters ?? tournament?.race?.distanceMeters ?? tournament?.Race?.DistanceMeters ?? 0);

    return distanceOptions.includes(distanceMeters) ? distanceMeters : null;
};

function isDateYearInRange(dateValue) {
    const year = Number(String(dateValue || '').slice(0, 4));

    return Number.isInteger(year) && year >= 2000 && year <= 2100;
}

function validateTournamentImage(file) {
    if (!(typeof File !== 'undefined' && file instanceof File) || file.size === 0) {
        return null;
    }

    const lowerName = file.name.toLowerCase();
    const hasAllowedExtension = allowedTournamentImageExtensions.some((extension) => lowerName.endsWith(extension));

    if (!hasAllowedExtension || !allowedTournamentImageTypes.includes(file.type)) {
        return 'Tournament image must be a JPG, JPEG, PNG, or WEBP file.';
    }

    if (file.size > maxTournamentImageSize) {
        return 'Tournament image must be 5MB or smaller.';
    }

    return null;
}

const matchesQuery = (tournament, query) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return true;
    }

    return [
        tournament.name,
        tournament.className,
        tournament.location,
        tournament.city,
        tournament.status,
    ].some((value) => String(value).toLowerCase().includes(normalizedQuery));
};

const readTournamentField = (tournament, ...keys) => {
    for (const key of keys) {
        const value = tournament?.[key];

        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }

    return null;
};

const detailValue = (value, fallback = '-') => (
    value === undefined || value === null || value === '' ? fallback : value
);

const sortPendingFirst = (items, getStatus) => [...items].sort((current, next) => {
    const currentRank = formatClass(getStatus(current)) === 'pending' ? 0 : 1;
    const nextRank = formatClass(getStatus(next)) === 'pending' ? 0 : 1;

    return currentRank - nextRank;
});

const getRaceTimeLabel = (tournament) => {
    const explicitTime = readTournamentField(tournament, 'raceStartTime', 'RaceStartTime');

    if (explicitTime) {
        return String(explicitTime).slice(0, 5);
    }

    const raceDateTime = readTournamentField(tournament, 'raceDateTime', 'raceDate', 'RaceDate')
        ?? tournament?.race?.raceDate
        ?? tournament?.Race?.RaceDate;

    if (!raceDateTime) {
        return '-';
    }

    const timeMatch = String(raceDateTime).match(/T(\d{2}:\d{2})/);

    return timeMatch?.[1] ?? '-';
};

const getRaceDateLabel = (tournament) => {
    const raceDate = readTournamentField(tournament, 'raceDateTime', 'raceDate', 'RaceDate')
        ?? tournament?.race?.raceDate
        ?? tournament?.Race?.RaceDate
        ?? tournament?.endDate;

    return raceDate ? adminApi.formatters.toDateLabel(String(raceDate).split('T')[0]) : '-';
};

const getDateTimeLabel = (value) => {
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

const getRaceTimeInputValue = (tournament) => {
    const raceTime = getRaceTimeLabel(tournament);

    return raceTime === '-' ? '' : raceTime;
};


const buildTournamentRows = async () => {
    const payload = await adminApi.getTournaments();

    return Promise.all((payload || []).map(async (tournament) => {
        try {
            const detail = await adminApi.getTournamentById(tournament.id);

            // Extract the race start time directly from detail or tournament to avoid overwrite loss
            let extractedRaceStartTime = readTournamentField(detail, 'raceStartTime', 'RaceStartTime') || readTournamentField(tournament, 'raceStartTime', 'RaceStartTime');

            if (!extractedRaceStartTime && detail?.endDate?.includes('T')) {
                const timePart = detail.endDate.split('T')[1];
                if (timePart) {
                    extractedRaceStartTime = timePart.slice(0, 5);
                }
            }

            return {
                ...detail,
                ...tournament,
                raceStartTime: extractedRaceStartTime,
                referee: getRefereeNames(tournament).length > 0 ? getRefereeNames(tournament) : getRefereeNames(detail),
                distanceMeters: getDistanceMeters(detail) ?? getDistanceMeters(tournament),
            };
        } catch {
            return tournament;
        }
    }));
};

function DetailItem({
    children,
    label,
}) {
    return (
        <div className={detailItemClass}>
            <span className={detailLabelClass}>{label}</span>
            <div className={detailValueClass}>{children}</div>
        </div>
    );
}

function RaceManagement() {
    const [tournaments, setTournaments] = useState([]);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [editingTournament, setEditingTournament] = useState(null);
    const [editError, setEditError] = useState('');
    const [editTournamentImageName, setEditTournamentImageName] = useState('');
    const [actionMenuId, setActionMenuId] = useState(null);
    const actionMenuRef = useRef(null);
    const [statusActionError, setStatusActionError] = useState('');
    const [statusActionMessage, setStatusActionMessage] = useState('');
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const [referees, setReferees] = useState([]);
    const [loadingReferees, setLoadingReferees] = useState(false);
    const [assigningTournament, setAssigningTournament] = useState(null);
    const [assignRefereeId, setAssignRefereeId] = useState('');
    const [assignError, setAssignError] = useState('');
    const [savingAssignment, setSavingAssignment] = useState(false);
    const [detailStandings, setDetailStandings] = useState([]);
    const [detailError, setDetailError] = useState('');
    const [standingsActionLoading, setStandingsActionLoading] = useState('');

    useEffect(() => {
        if (!actionMenuId) return undefined;

        const handleClickOutside = (event) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
                setActionMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [actionMenuId]);

    useEffect(() => {
        let isMounted = true;

        buildTournamentRows().then((tournamentRows) => {
            if (isMounted) {
                setTournaments(tournamentRows);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const stats = useMemo(() => [
        {
            label: 'Total Tournaments',
            value: String(tournaments.length),
            tone: 'total',
            icon: FaClipboardList,
        },
        {
            label: 'Open Registration',
            value: String(tournaments.filter((tournament) => formatClass(tournament.status) === 'openregistration').length),
            tone: 'active',
            icon: FaBolt,
        },
        {
            label: 'Draft',
            value: String(tournaments.filter((tournament) => formatClass(tournament.status) === 'draft').length),
            tone: 'pending',
            icon: FaEdit,
        },
        {
            label: 'Completed',
            value: String(tournaments.filter((tournament) => formatClass(tournament.status) === 'completed').length),
            tone: 'inactive',
            icon: FaCheckCircle,
        },
    ], [tournaments]);

    const filteredTournaments = useMemo(() => {
        const filtered = tournaments.filter((tournament) => (
            matchesQuery(tournament, query)
            && (statusFilter === 'all'
                ? formatClass(tournament.status) !== 'cancelled'
                : formatClass(tournament.status) === statusFilter)
        ));

        const sorted = [...filtered].sort((current, next) => {
            if (sortBy === 'oldest') {
                return new Date(current.startDate) - new Date(next.startDate);
            }

            if (sortBy === 'prize') {
                return next.prizePool - current.prizePool;
            }

            return new Date(next.startDate) - new Date(current.startDate);
        });

        return sortPendingFirst(sorted, (tournament) => tournament.status);
    }, [query, sortBy, statusFilter, tournaments]);

    const totalPages = Math.max(1, Math.ceil(filteredTournaments.length / pageSize));
    const visibleTournaments = filteredTournaments.slice((page - 1) * pageSize, page * pageSize);
    const firstShown = filteredTournaments.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastShown = Math.min(page * pageSize, filteredTournaments.length);

    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
        setPage(1);
    };

    const handleDelete = async (tournament) => {
        const confirmed = await confirmAdminAction({
            title: 'Delete tournament',
            message: `Are you sure you want to delete "${tournament.name}"?`,
            confirmLabel: 'Delete',
            tone: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            await adminApi.deleteTournament(tournament.id);
            setTournaments((current) => current.filter((item) => item.id !== tournament.id));
            setPage(1);
            showAdminSuccess('Tournament deleted successfully.', 'Deleted');
        } catch (err) {
            setStatusActionError(err.message || 'Failed to delete tournament.');
        }
    };

    const refreshTournamentRows = async () => {
        const tournamentRows = await buildTournamentRows();

        setTournaments(tournamentRows);
        setPage(1);
    };

    const loadTournamentDetailData = async (tournamentId) => {
        setDetailError('');

        try {
            const standingsPayload = await adminApi
                .getTournamentStandings(tournamentId)
                .catch(() => []);

            setDetailStandings(Array.isArray(standingsPayload) ? standingsPayload : []);
        } catch (err) {
            setDetailStandings([]);
            setDetailError(err.message || 'Failed to load tournament standings.');
        }
    };

    const openTournamentDetail = async (tournament) => {
        setSelectedTournament(tournament);
        await loadTournamentDetailData(tournament.id);
    };

    const closeTournamentDetail = () => {
        setSelectedTournament(null);
        setDetailStandings([]);
        setDetailError('');
    };

    const handleRecalculateStandings = async () => {
        if (!selectedTournament) {
            return;
        }

        setStandingsActionLoading('recalculate');
        setDetailError('');

        try {
            const response = await adminApi.recalculateTournamentStandings(selectedTournament.id);
            showAdminSuccess(response?.message || response?.Message || 'Standings recalculated.', 'Recalculated');
            await loadTournamentDetailData(selectedTournament.id);
        } catch (err) {
            setDetailError(err.message || 'Failed to recalculate standings.');
        } finally {
            setStandingsActionLoading('');
        }
    };

    const handleFinalizeStandings = async () => {
        if (!selectedTournament) {
            return;
        }

        const confirmed = await confirmAdminAction({
            title: 'Finalize standings',
            message: `Finalize standings for "${selectedTournament.name}" and complete this tournament?`,
            confirmLabel: 'Finalize',
        });

        if (!confirmed) {
            return;
        }

        setStandingsActionLoading('finalize');
        setDetailError('');

        try {
            const response = await adminApi.finalizeTournamentStandings(selectedTournament.id, 'Final standings confirmed by admin.');
            showAdminSuccess(response?.message || response?.Message || 'Tournament standings finalized.', 'Finalized');
            await loadTournamentDetailData(selectedTournament.id);
            await refreshTournamentRows();
        } catch (err) {
            setDetailError(err.message || 'Failed to finalize standings.');
        } finally {
            setStandingsActionLoading('');
        }
    };

    const handleTournamentStatusChange = async (tournament, action) => {
        const actionCopy = {
            approve: {
                title: 'Publish tournament',
                message: `Are you sure you want to publish "${tournament.name}"?`,
                confirmLabel: 'Publish',
                tone: 'primary',
                fallbackMessage: 'Tournament published successfully.',
            },
            closeRegistration: {
                title: 'Close registration',
                message: `Are you sure you want to close registration for "${tournament.name}"?`,
                confirmLabel: 'Close Registration',
                tone: 'primary',
                fallbackMessage: 'Tournament registration closed successfully.',
            },
            cancel: {
                title: 'Cancel tournament',
                message: `Are you sure you want to cancel "${tournament.name}"?`,
                confirmLabel: 'Cancel tournament',
                tone: 'danger',
                fallbackMessage: 'Tournament cancelled successfully.',
            },
            restore: {
                title: 'Restore tournament',
                message: `Restore "${tournament.name}" to Draft status?`,
                confirmLabel: 'Restore',
                tone: 'primary',
                fallbackMessage: 'Tournament restored successfully.',
            },
        }[action] || {
            title: 'Update tournament',
            message: `Are you sure you want to update "${tournament.name}"?`,
            confirmLabel: 'Update',
            tone: 'primary',
            fallbackMessage: 'Tournament updated successfully.',
        };
        const confirmed = await confirmAdminAction({
            title: actionCopy.title,
            message: actionCopy.message,
            confirmLabel: actionCopy.confirmLabel,
            tone: actionCopy.tone,
        });

        if (!confirmed) {
            return;
        }

        setUpdatingStatusId(tournament.id);
        setStatusActionError('');
        setStatusActionMessage('');

        try {
            let response;
            if (action === 'approve') {
                response = await adminApi.approveTournament(tournament.id);
            } else if (action === 'closeRegistration') {
                response = await adminApi.closeTournamentRegistration(tournament.id);
            } else if (action === 'cancel') {
                response = await adminApi.cancelTournament(tournament.id);
            } else if (action === 'restore') {
                response = await adminApi.restoreTournament(tournament.id);
            }
            const successMessage = response?.message || response?.Message || actionCopy.fallbackMessage;
            setStatusActionMessage(successMessage);
            showAdminSuccess(successMessage, 'Updated');
            setActionMenuId(null);
            await refreshTournamentRows();
        } catch (err) {
            setStatusActionError(err.message || `Failed to ${action} tournament.`);
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const openAssignReferee = async (tournament) => {
        setAssigningTournament(tournament);
        setAssignRefereeId('');
        setAssignError('');
        setLoadingReferees(true);

        try {
            const payload = await adminApi.getTournamentReferees();
            setReferees(Array.isArray(payload) ? payload : []);
        } catch (err) {
            setReferees([]);
            setAssignError(err.message || 'Failed to load referees.');
        } finally {
            setLoadingReferees(false);
        }
    };

    const closeAssignReferee = () => {
        setAssigningTournament(null);
        setAssignRefereeId('');
        setAssignError('');
    };

    const handleAssignReferee = async (event) => {
        event.preventDefault();

        if (!assigningTournament || !assignRefereeId) {
            setAssignError('Select a referee before saving.');
            return;
        }

        const confirmed = await confirmAdminAction({
            title: 'Assign referee',
            message: `Assign selected referee to "${assigningTournament.name}"? Existing assignment will be replaced.`,
            confirmLabel: 'Save Assignment',
        });

        if (!confirmed) {
            return;
        }

        setSavingAssignment(true);
        setAssignError('');

        try {
            const response = await adminApi.assignTournamentReferee(assigningTournament.id, assignRefereeId);
            const successMessage = response?.message || response?.Message || 'Referee assignment saved successfully.';
            showAdminSuccess(successMessage, 'Saved');
            closeAssignReferee();
            await refreshTournamentRows();
        } catch (err) {
            setAssignError(err.message || 'Failed to assign referee.');
        } finally {
            setSavingAssignment(false);
        }
    };

    const handleEditTournamentImageChange = (event) => {
        const file = event.target.files?.[0];

        setEditTournamentImageName(file ? file.name : '');
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        setEditError('');

        const formData = new FormData(event.currentTarget);
        const tournamentImage = formData.get('tournamentImage');
        const patch = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            location: formData.get('location').trim(),
            distanceMeters: Number(formData.get('distanceMeters') || 0),
            maxHorses: Number(formData.get('maxHorses') || 0),
            prizePool: parseCurrency(formData.get('prizePool')),
            raceStartTime: String(formData.get('raceStartTime') || '').trim(),
            rules: formData.get('rules'),
            tournamentImage: typeof File !== 'undefined' && tournamentImage instanceof File && tournamentImage.size > 0 ? tournamentImage : null,
        };

        if (patch.name.length < 3 || patch.name.length > 200) {
            setEditError('Tournament name must be between 3 and 200 characters.');
            return;
        }

        if (patch.description.length > 1000) {
            setEditError('Description cannot exceed 1,000 characters.');
            return;
        }

        if (patch.location.length < 3 || patch.location.length > 255) {
            setEditError('Location must be between 3 and 255 characters.');
            return;
        }

        if (!patch.startDate || !patch.endDate) {
            setEditError('Race date and registration deadline are required.');
            return;
        }

        if (!isDateYearInRange(patch.startDate) || !isDateYearInRange(patch.endDate)) {
            setEditError('Dates must be between year 2000 and 2100.');
            return;
        }

        if (patch.startDate >= patch.endDate) {
            setEditError('Race date must be after the registration and jockey deadline.');
            return;
        }

        if (!distanceOptions.includes(patch.distanceMeters)) {
            setEditError('Distance must be 1000, 1500, or 2400 meters.');
            return;
        }

        if (!Number.isInteger(patch.maxHorses) || patch.maxHorses < 2 || patch.maxHorses > 20) {
            setEditError('Max horses must be an integer between 2 and 20.');
            return;
        }

        if (patch.prizePool < 0 || patch.prizePool > maxPrizePool) {
            setEditError('Prize pool must be between 0 and 1,000,000,000.');
            return;
        }

        if (!patch.raceStartTime) {
            setEditError('Race start time is required and must be in HH:mm format. Example: 14:30');
            return;
        }

        if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(patch.raceStartTime)) {
            setEditError('Race start time must be in HH:mm format. Example: 14:30');
            return;
        }

        if (String(patch.rules || '').trim().length > 10000) {
            setEditError('Rules cannot exceed 10,000 characters.');
            return;
        }

        const imageError = validateTournamentImage(tournamentImage);

        if (imageError) {
            setEditError(imageError);
            return;
        }

        const confirmed = await confirmAdminAction({
            title: 'Save tournament changes',
            message: `Are you sure you want to save changes for "${editingTournament.name}"?`,
            confirmLabel: 'Save Changes',
        });

        if (!confirmed) {
            return;
        }

        try {
            await adminApi.updateTournament(editingTournament.id, patch);

            // Refresh tournament list from BE
            await refreshTournamentRows();
            setEditingTournament(null);
            setEditTournamentImageName('');
            showAdminSuccess('Tournament changes saved successfully.', 'Saved');
        } catch (err) {
            setEditError(err.message || 'Failed to update tournament.');
        }
    };

    return (
        <AdminLayout
            activeKey="races"
            mainClassName="race-management-main"
            onSearchChange={(value) => {
                setQuery(value);
                setPage(1);
            }}
            searchPlaceholder="Search tournaments, locations, statuses..."
            searchValue={query}
        >
                <section className={pageShellClass}>
                    <div>
                        <h1 className="page-title">
                            Tournament Management
                        </h1>
                        <p className="page-subtitle">
                            Create and manage horse racing tournaments and race conditions.
                        </p>
                    </div>

                    <section aria-label="Tournament summary" className="grid grid-cols-4 gap-7 max-[1280px]:grid-cols-2 max-[820px]:grid-cols-1">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            const tone = statClass[stat.tone];

                            return (
                                <article
                                    className={`relative grid min-h-[136px] content-start gap-3 overflow-hidden rounded-[var(--admin-radius)] bg-[var(--admin-surface)] px-[22px] py-5 shadow-[0_14px_32px_rgba(81,31,22,0.07)] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[5px] before:content-[''] ${tone.accent}`}
                                    key={stat.label}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span className={`grid h-[34px] w-[34px] place-items-center rounded-lg ${tone.soft} ${tone.ink}`}>
                                            <Icon aria-hidden="true" />
                                        </span>
                                    </div>
                                    <span className="text-[0.82rem] font-extrabold text-[#6e5550]">{stat.label}</span>
                                    <strong className="text-[2rem] leading-none text-[var(--admin-ink)]">{stat.value}</strong>
                                </article>
                            );
                        })}
                    </section>

                    {statusActionError && (
                        <div className="rounded-md border border-[#f3b8b8] bg-[#fff1f1] px-4 py-3 text-[0.86rem] font-bold text-[#b91c1c]" role="alert">
                            {statusActionError}
                        </div>
                    )}

                    {statusActionMessage && (
                        <div className="rounded-md border border-[#afe2c4] bg-[#effcf4] px-4 py-3 text-[0.86rem] font-bold text-[#15803d]" role="status">
                            {statusActionMessage}
                        </div>
                    )}

                    <section className="overflow-hidden rounded-[var(--admin-radius)] bg-[var(--admin-surface)] shadow-[0_14px_32px_rgba(81,31,22,0.07)]">
                        <div className="flex min-h-[76px] items-center justify-between gap-[18px] border-b border-[var(--admin-border)] px-[22px] py-[18px] max-[1280px]:flex-col max-[1280px]:items-stretch">
                            <h2 className="m-0 text-[1.1rem] text-[var(--admin-ink)]">All Tournaments</h2>

                            <div className="flex items-center justify-end gap-2.5 max-[1280px]:justify-start max-[820px]:flex-col max-[820px]:items-stretch">
                                <label className="flex h-[38px] w-[180px] items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-3.5 text-[var(--admin-gold)] transition-colors hover:border-[var(--admin-gold)] max-[820px]:w-full">
                                    <FaFilter aria-hidden="true" />
                                    <select className={filterSelectClass} onChange={handleFilterChange(setStatusFilter)} value={statusFilter}>
                                        <option value="all">Status: All</option>
                                        <option value="draft">Draft</option>
                                        <option value="openregistration">Open Registration</option>
                                        <option value="closedregistration">Closed Registration</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </label>

                                <label className="flex h-[38px] w-[180px] items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-3.5 text-[var(--admin-gold)] transition-colors hover:border-[var(--admin-gold)] max-[820px]:w-full">
                                    <FaSortAmountDown aria-hidden="true" />
                                    <select className={filterSelectClass} onChange={handleFilterChange(setSortBy)} value={sortBy}>
                                        <option value="newest">Sort: Newest First</option>
                                        <option value="oldest">Sort: Oldest First</option>
                                        <option value="prize">Sort: Prize Pool</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-5 p-5 max-[1400px]:grid-cols-3 max-[1080px]:grid-cols-2 max-[560px]:grid-cols-1">
                            {visibleTournaments.map((tournament) => {
                                const deadlineWarning = adminApi.formatters.getTournamentDeadlineWarning(tournament);
                                const statusActions = getTournamentActions(tournament.status);
                                const referees = getRefereeNames(tournament);

                                return (
                                    <article
                                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-white shadow-[0_10px_26px_rgba(11,27,52,0.06)] transition-shadow duration-200 hover:shadow-[0_16px_36px_rgba(11,27,52,0.14)]"
                                        key={tournament.id}
                                    >
                                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--admin-surface-strong)]">
                                            <img
                                                alt=""
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                src={tournament.imageUrl ? resolveFileUrl(tournament.imageUrl) : horseRacing}
                                                style={{ objectPosition: tournament.imagePosition }}
                                            />
                                            <span className={`absolute right-3 top-3 shadow-[0_4px_10px_rgba(11,27,52,0.22)] ${getStatusClass(tournament.status)}`}>
                                                {adminApi.formatters.formatTournamentStatus(tournament.status)}
                                            </span>
                                        </div>

                                        <div className="flex flex-1 flex-col gap-3 p-4">
                                            <h3 className="m-0 line-clamp-2 min-h-[2.4em] text-[1rem] font-extrabold leading-snug text-[var(--admin-ink)]">
                                                {tournament.name}
                                            </h3>

                                            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[0.78rem] font-semibold text-[var(--admin-muted)]">
                                                <span className="inline-flex items-center gap-1.5 truncate">
                                                    <FaCalendarAlt aria-hidden="true" className="flex-none text-[var(--admin-gold)]" />
                                                    {getRaceDateLabel(tournament)}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 truncate">
                                                    <FaMapMarkerAlt aria-hidden="true" className="flex-none text-[var(--admin-primary)]" />
                                                    {tournament.city}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 truncate">
                                                    <FaHorseHead aria-hidden="true" className="flex-none text-[var(--admin-gold)]" />
                                                    {tournament.maxHorses} horses
                                                </span>
                                                <strong className="truncate text-[0.86rem] text-[var(--admin-primary-dark)]">
                                                    {adminApi.formatters.toMoney(tournament.prizePool)}
                                                </strong>
                                            </div>

                                            {deadlineWarning && (
                                                <small className={`-mt-1 block text-[0.72rem] font-black ${deadlineClass[deadlineWarning.type] || deadlineClass.warning}`}>
                                                    Deadline: {adminApi.formatters.toDateLabel(tournament.startDate) || '-'} · {deadlineWarning.text}
                                                </small>
                                            )}

                                            <div className="flex flex-wrap gap-1.5">
                                                {referees.length > 0 ? (
                                                    referees.map((referee) => (
                                                        <span className="inline-flex min-h-6 items-center rounded-full border border-[#e6d3cf] bg-[#fff7f5] px-2.5 text-[0.66rem] font-black text-[#6e5550]" key={`${tournament.id}-${referee}`}>
                                                            {referee}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[0.74rem] font-bold text-[#9a817c]">Unassigned referee</span>
                                                )}
                                            </div>

                                            <div className="relative mt-auto flex items-center justify-end gap-2 border-t border-[var(--admin-border)] pt-3" ref={actionMenuId === tournament.id ? actionMenuRef : null}>
                                                <button
                                                    aria-expanded={actionMenuId === tournament.id}
                                                    aria-label={`View options for ${tournament.name}`}
                                                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-transparent text-[var(--admin-muted)] hover:bg-[#f3e6c2] hover:text-[var(--admin-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                                                    disabled={updatingStatusId === tournament.id}
                                                    onClick={() => setActionMenuId((current) => (current === tournament.id ? null : tournament.id))}
                                                    type="button"
                                                >
                                                    <FaEye aria-hidden="true" />
                                                </button>
                                                <button aria-label={`Delete ${tournament.name}`} className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-transparent text-[var(--admin-muted)] hover:bg-[#f3e1df] hover:text-[#a4392f]" onClick={() => { handleDelete(tournament); setActionMenuId(null); }} type="button">
                                                    <FaTrashAlt aria-hidden="true" />
                                                </button>
                                                {actionMenuId === tournament.id && (
                                                    <div className="absolute bottom-11 right-0 z-30 grid w-56 max-w-[calc(100vw-40px)] overflow-hidden rounded-md border border-[var(--admin-border)] bg-white py-1 text-left shadow-[0_14px_34px_rgba(11,27,52,0.18)]">
                                                        <button className="px-3 py-2 text-left text-[0.78rem] font-extrabold text-[var(--admin-ink)] hover:bg-[#f8f3e2]" onClick={() => { openTournamentDetail(tournament); setActionMenuId(null); }} type="button">
                                                            View Detail
                                                        </button>
                                                        <button className="px-3 py-2 text-left text-[0.78rem] font-extrabold text-[var(--admin-ink)] hover:bg-[#f8f3e2]" onClick={() => { setEditTournamentImageName(''); setEditingTournament(tournament); setActionMenuId(null); }} type="button">
                                                            Edit Tournament
                                                        </button>
                                                        <button className="px-3 py-2 text-left text-[0.78rem] font-extrabold text-[var(--admin-ink)] hover:bg-[#f8f3e2]" onClick={() => { openAssignReferee(tournament); setActionMenuId(null); }} type="button">
                                                            Assign/Reassign Referee
                                                        </button>
                                                        {statusActions.length > 0 && <span className="my-1 h-px bg-[var(--admin-border)]" />}
                                                        {statusActions.map((nextStatus) => (
                                                            <button
                                                                className="px-3 py-2 text-left text-[0.78rem] font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#f3e6c2] disabled:cursor-not-allowed disabled:opacity-60"
                                                                disabled={updatingStatusId === tournament.id}
                                                                key={nextStatus}
                                                                onClick={() => handleTournamentStatusChange(tournament, nextStatus)}
                                                                type="button"
                                                            >
                                                                {statusActionLabels[nextStatus] || adminApi.formatters.formatTournamentStatus(nextStatus)}
                                                            </button>
                                                        ))}
                                                        {statusActions.length === 0 && (
                                                            <span className="px-3 py-2 text-[0.76rem] font-bold text-[var(--admin-muted)]">No status actions</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <div className="flex min-h-[68px] items-center justify-between gap-[18px] px-[22px] py-4 text-[0.82rem] font-bold text-[var(--admin-muted)] max-[820px]:flex-col max-[820px]:items-stretch">
                            <span>Showing {firstShown} - {lastShown} of {filteredTournaments.length} tournaments</span>

                            <div className="flex items-center gap-2 max-[820px]:flex-wrap">
                                <button aria-label="Previous page" className={paginationButtonClass} disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">&lt;</button>
                                {getCompactPaginationItems(totalPages, page).map((pageItem) => (
                                    typeof pageItem === 'number' ? (
                                        <button
                                            className={`${paginationButtonClass} ${pageItem === page ? '!border-[var(--admin-primary)] !bg-[var(--admin-primary)] !text-white' : ''}`}
                                            key={pageItem}
                                            onClick={() => setPage(pageItem)}
                                            type="button"
                                        >
                                            {pageItem}
                                        </button>
                                    ) : (
                                        <span className={`${paginationButtonClass} cursor-default border-transparent text-[var(--admin-muted)] hover:!border-transparent hover:!bg-transparent hover:!text-[var(--admin-muted)]`} key={pageItem}>...</span>
                                    )
                                ))}
                                <button aria-label="Next page" className={paginationButtonClass} disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">&gt;</button>
                            </div>
                        </div>
                    </section>

                    {assigningTournament && (
                        <div className="fixed inset-0 z-40 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8" onClick={closeAssignReferee} role="presentation">
                            <form
                                aria-label={`Assign referee for ${assigningTournament.name}`}
                                className="grid w-[min(520px,100%)] gap-5 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_20px_48px_rgba(45,32,32,0.22)]"
                                onClick={(event) => event.stopPropagation()}
                                onSubmit={handleAssignReferee}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="m-0 flex items-center gap-2 text-[1.25rem] leading-[1.15] text-[var(--admin-primary-dark)]">
                                            <FaUserTie aria-hidden="true" />
                                            Assign Referee
                                        </h2>
                                        <p className="mb-0 mt-1.5 text-[0.86rem] font-semibold text-[var(--admin-muted)]">
                                            {assigningTournament.name}
                                        </p>
                                    </div>
                                    <button aria-label="Close assign referee" className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={closeAssignReferee} type="button">
                                        <FaTimes aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="grid gap-2 rounded-md border border-[var(--admin-border)] bg-[#fff8f6] p-3">
                                    <span className="text-[0.68rem] font-black uppercase text-[#64748b]">Current Referee</span>
                                    <strong className="text-[0.9rem] text-[var(--admin-ink)]">
                                        {getRefereeNames(assigningTournament).length > 0 ? getRefereeNames(assigningTournament).join(', ') : 'Unassigned'}
                                    </strong>
                                </div>

                                <label className={editFieldClass}>
                                    <span className={editLabelClass}>Select Referee</span>
                                    <select
                                        className={editControlClass}
                                        disabled={loadingReferees || savingAssignment}
                                        onChange={(event) => setAssignRefereeId(event.target.value)}
                                        required
                                        value={assignRefereeId}
                                    >
                                        <option value="" disabled>
                                            {loadingReferees ? 'Loading referees...' : 'Select referee'}
                                        </option>
                                        {referees.map((referee) => (
                                            <option key={referee.refereeId} value={referee.refereeId}>
                                                {referee.fullName}{referee.email ? ` (${referee.email})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {assignError && (
                                    <div className="rounded-md border border-[#f0b4b4] bg-[#fff3f3] px-4 py-3 text-[0.85rem] font-semibold text-[var(--admin-primary)]">
                                        {assignError}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 max-[720px]:flex-col">
                                    <button className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-4 font-black text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={closeAssignReferee} type="button">
                                        Cancel
                                    </button>
                                    <button className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] px-4 font-black text-white hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60" disabled={savingAssignment || loadingReferees || !assignRefereeId} type="submit">
                                        {savingAssignment ? 'Saving...' : 'Save Assignment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {selectedTournament && (
                        <div className="fixed inset-0 z-40 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8" onClick={closeTournamentDetail} role="presentation">
                            <section
                                aria-label={`Details for ${selectedTournament.name}`}
                                className="grid max-h-[calc(100vh-48px)] w-[min(820px,100%)] gap-5 overflow-y-auto rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_20px_48px_rgba(45,32,32,0.22)]"
                                onClick={(event) => event.stopPropagation()}
                                role="dialog"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="m-0 text-[1.45rem] leading-[1.15] text-[var(--admin-primary-dark)]">{selectedTournament.name}</h2>
                                        <p className="mb-0 mt-1.5 text-[0.86rem] font-semibold text-[var(--admin-muted)]">
                                            Tournament details and assigned race configuration.
                                        </p>
                                    </div>
                                    <button aria-label="Close tournament details" className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={closeTournamentDetail} type="button">
                                        <FaTimes aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
                                    <DetailItem label="Tournament ID">
                                        {detailValue(readTournamentField(selectedTournament, 'id', 'tournamentId', 'TournamentId'))}
                                    </DetailItem>
                                    <DetailItem label="Status">
                                        <span className={`${getStatusClass(selectedTournament.status)} w-fit`}>
                                            {detailValue(adminApi.formatters.formatTournamentStatus(selectedTournament.status))}
                                        </span>
                                    </DetailItem>
                                    <DetailItem label="Season">
                                        {detailValue(readTournamentField(selectedTournament, 'seasonName', 'SeasonName'))}
                                    </DetailItem>
                                    <DetailItem label="Season Status">
                                        {detailValue(readTournamentField(selectedTournament, 'seasonStatus', 'SeasonStatus'))}
                                    </DetailItem>
                                    <DetailItem label="Race Status">
                                        {detailValue(readTournamentField(selectedTournament, 'raceStatus', 'RaceStatus') ?? selectedTournament?.race?.status)}
                                    </DetailItem>
                                    <DetailItem label="Prediction Deadline">
                                        {getDateTimeLabel(readTournamentField(selectedTournament, 'predictionDeadline', 'PredictionDeadline') ?? selectedTournament?.race?.predictionDeadline)}
                                    </DetailItem>
                                    <DetailItem label="Registration & Jockey Deadline">
                                        <span className="block">{adminApi.formatters.toDateLabel(selectedTournament.startDate)}</span>
                                        {adminApi.formatters.getTournamentDeadlineWarning(selectedTournament) && (
                                            <small className={`mt-1 block text-[0.72rem] font-black ${deadlineClass[adminApi.formatters.getTournamentDeadlineWarning(selectedTournament).type] || deadlineClass.warning}`}>
                                                {adminApi.formatters.getTournamentDeadlineWarning(selectedTournament).text}
                                            </small>
                                        )}
                                    </DetailItem>
                                    <DetailItem label="Race Date">
                                        {adminApi.formatters.toDateLabel(selectedTournament.endDate)}
                                    </DetailItem>
                                    <DetailItem label="Race Time">
                                        {getRaceTimeLabel(selectedTournament)}
                                    </DetailItem>
                                    <DetailItem label="Location">
                                        {detailValue(selectedTournament.location || selectedTournament.city)}
                                    </DetailItem>
                                    <DetailItem label="Distance">
                                        {getDistanceMeters(selectedTournament) ? `${getDistanceMeters(selectedTournament)}m` : '-'}
                                    </DetailItem>
                                    <DetailItem label="Max Horses">
                                        {detailValue(selectedTournament.maxHorses)}
                                    </DetailItem>
                                    <DetailItem label="Registered Horses">
                                        {detailValue(readTournamentField(selectedTournament, 'registeredHorses', 'entriesCount', 'EntriesCount'))}
                                    </DetailItem>
                                    <DetailItem label="Prize Pool">
                                        {adminApi.formatters.toMoney(selectedTournament.prizePool)}
                                    </DetailItem>
                                    <DetailItem label="Referee">
                                        {getRefereeNames(selectedTournament).length > 0 ? getRefereeNames(selectedTournament).join(', ') : 'Unassigned'}
                                    </DetailItem>
                                    <DetailItem label="Created At">
                                        {readTournamentField(selectedTournament, 'createdAt', 'CreatedAt')
                                            ? adminApi.formatters.toDateLabel(String(readTournamentField(selectedTournament, 'createdAt', 'CreatedAt')).split('T')[0])
                                            : '-'}
                                    </DetailItem>
                                    <div className={detailItemClass}>
                                        <span className={detailLabelClass}>Description</span>
                                        <div className={detailValueClass}>{detailValue(selectedTournament.description || selectedTournament.className)}</div>
                                    </div>
                                    <div className={detailItemClass}>
                                        <span className={detailLabelClass}>Rules</span>
                                        <div className={`${detailValueClass} whitespace-pre-wrap leading-relaxed`}>{detailValue(selectedTournament.rules)}</div>
                                    </div>
                                </div>

                                {detailError && (
                                    <div className="rounded-md border border-[#f0b4b4] bg-[#fff3f3] px-4 py-3 text-[0.85rem] font-semibold text-[var(--admin-primary)]">
                                        {detailError}
                                    </div>
                                )}

                                <section className="overflow-hidden rounded-md border border-[var(--admin-border)] bg-[#fffdfc]">
                                    <div className="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] bg-[#f8fbff] px-4 py-3 max-[720px]:flex-col max-[720px]:items-stretch">
                                        <div>
                                            <h3 className="m-0 text-[0.98rem] font-black text-[var(--admin-primary-dark)]">Tournament Result</h3>
                                            <p className="m-0 mt-1 text-[0.76rem] font-bold text-[var(--admin-muted)]">
                                                Review the official result calculated from the tournament's single published race.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button className={`${actionButtonClass} border border-[var(--admin-border)] bg-white text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`} disabled={standingsActionLoading !== ''} onClick={handleRecalculateStandings} type="button">
                                                <FaBolt aria-hidden="true" />
                                                {standingsActionLoading === 'recalculate' ? 'Recalculating...' : 'Recalculate'}
                                            </button>
                                            <button className={`${actionButtonClass} bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)]`} disabled={standingsActionLoading !== '' || detailStandings.length === 0} onClick={handleFinalizeStandings} type="button">
                                                <FaCheckCircle aria-hidden="true" />
                                                {standingsActionLoading === 'finalize' ? 'Finalizing...' : 'Finalize'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[760px] border-collapse">
                                            <thead>
                                                <tr>
                                                    {['Rank', 'Horse', 'Owner', 'Jockey', 'Points', 'Wins', 'Completed', 'Final'].map((heading) => (
                                                        <th className="border-b border-[var(--admin-border)] bg-[#fff8f6] px-4 py-3 text-left text-[0.64rem] font-black uppercase text-[#64748b]" key={heading}>{heading}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailStandings.length === 0 ? (
                                                    <tr>
                                                        <td className="px-4 py-5 text-center text-[0.86rem] font-bold text-[var(--admin-muted)]" colSpan="8">No standings calculated yet.</td>
                                                    </tr>
                                                ) : detailStandings.map((standing) => (
                                                    <tr key={`${readTournamentField(standing, 'finalRank', 'FinalRank')}-${readTournamentField(standing, 'horseId', 'HorseId')}`}>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-black text-[var(--admin-primary-dark)]">#{readTournamentField(standing, 'finalRank', 'FinalRank')}</td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-bold text-[var(--admin-ink)]">{readTournamentField(standing, 'horseName', 'HorseName')}</td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readTournamentField(standing, 'ownerName', 'OwnerName')}</td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readTournamentField(standing, 'jockeyName', 'JockeyName') || '-'}</td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-black text-[var(--admin-ink)]">{readTournamentField(standing, 'totalPoints', 'TotalPoints') ?? 0}</td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readTournamentField(standing, 'wins', 'Wins') ?? 0}</td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readTournamentField(standing, 'completedRaces', 'CompletedRaces') ?? 0}</td>
                                                        <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readTournamentField(standing, 'isFinal', 'IsFinal') ? 'Yes' : 'No'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </section>
                        </div>
                    )}

                    {editingTournament && (
                        <div className="fixed inset-0 z-40 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8" onClick={() => setEditingTournament(null)} role="presentation">
                            <form
                                aria-label={`Edit ${editingTournament.name}`}
                                className="grid max-h-[calc(100vh-48px)] w-[min(760px,100%)] gap-5 overflow-y-auto rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_20px_48px_rgba(45,32,32,0.22)]"
                                onClick={(event) => event.stopPropagation()}
                                onSubmit={handleEditSubmit}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="m-0 text-[1.35rem] leading-[1.15] text-[var(--admin-primary-dark)]">Edit Tournament</h2>
                                    </div>
                                    <button aria-label="Close edit tournament" className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={() => setEditingTournament(null)} type="button">
                                        <FaTimes aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
                                    <label className={`${editFieldClass} col-span-2 max-[720px]:col-span-1`}>
                                        <span className={editLabelClass}>Tournament Name</span>
                                        <input className={editControlClass} defaultValue={editingTournament.name} maxLength={200} minLength={3} name="name" required type="text" />
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Description</span>
                                        <input className={editControlClass} defaultValue={editingTournament.description || editingTournament.className} maxLength={1000} name="description" type="text" />
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Distance</span>
                                        <select className={editControlClass} defaultValue={getDistanceMeters(editingTournament) ?? ''} name="distanceMeters" required>
                                            <option value="" disabled>Select Distance</option>
                                            {distanceOptions.map((distanceMeters) => (
                                                <option key={distanceMeters} value={distanceMeters}>{distanceMeters}m</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Race Date</span>
                                        <div className="grid grid-cols-[minmax(0,1fr)_132px] gap-3 max-[720px]:grid-cols-1">
                                            <input className={editControlClass} defaultValue={editingTournament.endDate} max={maxDate} min={minDate} name="endDate" required type="date" />
                                            <input aria-label="Race start time" className={editControlClass} defaultValue={getRaceTimeInputValue(editingTournament)} name="raceStartTime" required type="time" />
                                        </div>
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Registration & Jockey Deadline</span>
                                        <input className={editControlClass} defaultValue={editingTournament.startDate} max={maxDate} min={minDate} name="startDate" required type="date" />
                                        <span className="text-[0.72rem] font-semibold text-[var(--admin-muted)]">
                                            Horse registration, jockey invitations, and jockey responses close together at the end of this date.
                                        </span>
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Location</span>
                                        <input className={editControlClass} defaultValue={editingTournament.location} maxLength={255} minLength={3} name="location" required type="text" />
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Max Horses</span>
                                        <input className={editControlClass} defaultValue={editingTournament.maxHorses} max="20" min="2" name="maxHorses" required step="1" type="number" />
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Prize Pool</span>
                                        <input className={editControlClass} defaultValue={formatCurrencyAmount(editingTournament.prizePool)} inputMode="numeric" name="prizePool" onChange={handleCurrencyInputChange} type="text" />
                                    </label>

                                    <label className={`${editFieldClass} col-span-2 max-[720px]:col-span-1`}>
                                        <span className={editLabelClass}>Tournament Image</span>
                                        <span className={editFileControlClass}>
                                            <span className="inline-flex min-h-7 flex-none items-center rounded-md bg-[var(--admin-primary)] px-3 text-[0.76rem] font-[850] text-white">
                                                Choose File
                                            </span>
                                            <span className="min-w-0 truncate text-[0.86rem] font-semibold text-[#7d6661]">
                                                {editTournamentImageName || 'No file chosen'}
                                            </span>
                                        </span>
                                        <input accept={tournamentImageAccept} className="sr-only" name="tournamentImage" onChange={handleEditTournamentImageChange} type="file" />
                                    </label>

                                    <label className={`${editFieldClass} col-span-2 max-[720px]:col-span-1`}>
                                        <span className={editLabelClass}>Rules</span>
                                        <textarea className={`${editControlClass} min-h-[96px] py-2`} defaultValue={editingTournament.rules || ''} maxLength={10000} name="rules" />
                                    </label>
                                </div>

                                {editError && (
                                    <div className="rounded-md border border-[#f0b4b4] bg-[#fff3f3] px-4 py-3 text-[0.85rem] font-semibold text-[var(--admin-primary)]">
                                        {editError}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 max-[720px]:flex-col">
                                    <button className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-4 font-black text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={() => { setEditingTournament(null); setEditError(''); }} type="button">
                                        Cancel
                                    </button>
                                    <button className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] px-4 font-black text-white hover:bg-[var(--admin-primary-dark)]" type="submit">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </section>
        </AdminLayout>
    );
}

export default RaceManagement;
