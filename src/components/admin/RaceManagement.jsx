import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    FaBolt,
    FaCheckCircle,
    FaClipboardList,
    FaEdit,
    FaEye,
    FaFilter,
    FaMapMarkerAlt,
    FaSortAmountDown,
    FaTimes,
    FaTrashAlt,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import { resolveFileUrl } from '../../api/uploadApi';
import horseRacing from '../../assets/horse-racing.jpg';

import AdminLayout from './AdminLayout';

const formatClass = (value) => String(value || '').toLowerCase();
const isVisibleTournament = (tournament) => formatClass(tournament.status) !== 'cancelled';

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 pb-7 pt-11 max-[820px]:px-5 max-[820px]:py-7';

const statClass = {
    total: {
        accent: 'before:bg-[var(--admin-primary)]',
        soft: 'bg-[#fff1ef]',
        ink: 'text-[var(--admin-primary)]',
    },
    active: {
        accent: 'before:bg-[#23cb74]',
        soft: 'bg-[#e8fff2]',
        ink: 'text-[#119b54]',
    },
    pending: {
        accent: 'before:bg-[#9b7771]',
        soft: 'bg-[#f7eeee]',
        ink: 'text-[#7d615c]',
    },
    inactive: {
        accent: 'before:bg-[#2657d8]',
        soft: 'bg-[#eef3ff]',
        ink: 'text-[#2657d8]',
    },
};

const statusClass = {
    draft: 'border-[#dbc3bf] bg-[#f3e8e6] text-[#7f645f]',
    openregistration: 'border-[#afe2c4] bg-[#dff7e9] text-[#118548]',
    closedregistration: 'border-[#e2cd79] bg-[#f7efcf] text-[#6a520d]',
    ongoing: 'border-[#93c5fd] bg-[#dbeafe] text-[#1e40af]',
    completed: 'border-[#a5b4fc] bg-[#e0e7ff] text-[#3730a3]',
    cancelled: 'border-[#dbaaa5] bg-[#f5e1df] text-[var(--admin-primary-dark)]',
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
const paginationButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]';
const editFieldClass = 'grid gap-1.5';
const editLabelClass = 'text-[0.72rem] font-black uppercase text-[#765c58]';
const editControlClass = 'h-10 w-full min-w-0 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.88rem] font-bold text-[var(--admin-ink)] outline-0 focus:border-[#c6897e] focus:bg-white focus:shadow-[0_0_0_3px_rgba(134,7,7,0.08)]';
const editFileControlClass = `${editControlClass} flex min-h-10 cursor-pointer items-center gap-3 py-2`;
const detailItemClass = 'grid gap-1 rounded-md bg-[#fff8f6] p-3';
const detailLabelClass = 'text-[0.66rem] font-black uppercase text-[#765c58]';
const detailValueClass = 'break-words text-[0.9rem] font-bold text-[var(--admin-ink)]';
const pageSize = 4;
const distanceOptions = [1000, 1500, 2400];

const getDistanceMeters = (tournament) => {
    const distanceMeters = Number(tournament?.distanceMeters ?? tournament?.race?.distanceMeters ?? 0);

    return distanceOptions.includes(distanceMeters) ? distanceMeters : null;
};

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

const getRaceTimeInputValue = (tournament) => {
    const raceTime = getRaceTimeLabel(tournament);

    return raceTime === '-' ? '' : raceTime;
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

    useEffect(() => {
        let isMounted = true;

        adminApi.getTournaments().then(async (payload) => {
            const tournamentsWithReferees = await Promise.all((payload || []).map(async (tournament) => {
                try {
                    const detail = await adminApi.getTournamentById(tournament.id);
                    return {
                        ...detail,
                        ...tournament,
                        referee: getRefereeNames(tournament).length > 0 ? getRefereeNames(tournament) : getRefereeNames(detail),
                        distanceMeters: getDistanceMeters(detail) ?? getDistanceMeters(tournament),
                    };
                } catch {
                    return tournament;
                }
            }));

            if (isMounted) {
                setTournaments(tournamentsWithReferees.filter(isVisibleTournament));
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
            marker: 'YTD',
            tone: 'total',
            icon: FaClipboardList,
        },
        {
            label: 'Open Registration',
            value: String(tournaments.filter((tournament) => formatClass(tournament.status) === 'openregistration').length),
            marker: 'Live',
            tone: 'active',
            icon: FaBolt,
        },
        {
            label: 'Draft',
            value: String(tournaments.filter((tournament) => formatClass(tournament.status) === 'draft').length),
            marker: 'Draft',
            tone: 'pending',
            icon: FaEdit,
        },
        {
            label: 'Completed',
            value: String(tournaments.filter((tournament) => formatClass(tournament.status) === 'completed').length),
            marker: 'Done',
            tone: 'inactive',
            icon: FaCheckCircle,
        },
    ], [tournaments]);

    const filteredTournaments = useMemo(() => {
        const filtered = tournaments.filter((tournament) => (
            matchesQuery(tournament, query)
            && (statusFilter === 'all' || formatClass(tournament.status) === statusFilter)
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

    const handleDelete = async (id) => {
        await adminApi.deleteTournament(id);
        setTournaments((current) => current.filter((tournament) => tournament.id !== id));
        setPage(1);
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
            city: formData.get('city').trim(),
            distanceMeters: Number(formData.get('distanceMeters') || 0),
            maxHorses: Number(formData.get('maxHorses') || 0),
            registeredHorses: Number(formData.get('registeredHorses') || 0),
            prizePool: Number(formData.get('prizePool') || 0),
            raceStartTime: String(formData.get('raceStartTime') || '').trim(),
            rules: formData.get('rules'),
            status: formData.get('status'),
            tournamentImage: typeof File !== 'undefined' && tournamentImage instanceof File && tournamentImage.size > 0 ? tournamentImage : null,
        };

        if (!distanceOptions.includes(patch.distanceMeters)) {
            setEditError('Distance must be 1000, 1500, or 2400 meters.');
            return;
        }

        if (!patch.raceStartTime) {
            setEditError('Race start time is required and must be in HH:mm format. Example: 14:30');
            return;
        }

        try {
            // Update tournament data (now includes status)
            await adminApi.updateTournament(editingTournament.id, patch);

            // Refresh tournament list from BE
            const freshTournaments = await adminApi.getTournaments();
            const tournamentsWithDetails = await Promise.all((freshTournaments || []).map(async (tournament) => {
                try {
                    const detail = await adminApi.getTournamentById(tournament.id);
                    return {
                        ...detail,
                        ...tournament,
                        distanceMeters: getDistanceMeters(detail) ?? getDistanceMeters(tournament),
                    };
                } catch {
                    return tournament;
                }
            }));

            setTournaments(tournamentsWithDetails.filter(isVisibleTournament));
            setEditingTournament(null);
            setEditTournamentImageName('');
            setPage(1);
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
                        <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[820px]:text-[1.6rem]">
                            Race Management
                        </h1>
                        <p className="mt-2 text-[0.92rem] font-semibold text-[var(--admin-muted)]">
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
                                        <small className={`text-[0.66rem] font-black ${tone.ink}`}>{stat.marker}</small>
                                    </div>
                                    <span className="text-[0.82rem] font-extrabold text-[#6e5550]">{stat.label}</span>
                                    <strong className="text-[2rem] leading-none text-[var(--admin-ink)]">{stat.value}</strong>
                                </article>
                            );
                        })}
                    </section>

                    <section className="overflow-hidden rounded-[var(--admin-radius)] bg-[var(--admin-surface)] shadow-[0_14px_32px_rgba(81,31,22,0.07)]">
                        <div className="flex min-h-[76px] items-center justify-between gap-[18px] border-b border-[var(--admin-border)] px-[22px] py-[18px] max-[1280px]:flex-col max-[1280px]:items-stretch">
                            <h2 className="m-0 text-[1.1rem] text-[var(--admin-ink)]">All Tournaments</h2>

                            <div className="flex items-center justify-end gap-2.5 max-[1280px]:justify-start max-[820px]:flex-col max-[820px]:items-stretch">
                                <label className="flex h-[38px] w-[180px] items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-2.5 text-[#8a6b66] max-[820px]:w-full">
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

                                <label className="flex h-[38px] w-[180px] items-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-2.5 text-[#8a6b66] max-[820px]:w-full">
                                    <FaSortAmountDown aria-hidden="true" />
                                    <select className={filterSelectClass} onChange={handleFilterChange(setSortBy)} value={sortBy}>
                                        <option value="newest">Sort: Newest First</option>
                                        <option value="oldest">Sort: Oldest First</option>
                                        <option value="prize">Sort: Prize Pool</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse max-[820px]:min-w-[1100px]">
                                <thead>
                                    <tr>
                                        {['Tournament Name', 'Race Date', 'Location', 'Max Horses', 'Prize Pool', 'Referee', 'Status', 'Actions'].map((heading) => (
                                            <th className="whitespace-nowrap border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[18px] text-left text-[0.68rem] uppercase tracking-normal text-[#8b6e68]" key={heading}>
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleTournaments.map((tournament) => (
                                        <tr key={tournament.id}>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <div className="flex min-w-[230px] items-center gap-3.5">
                                                    <img
                                                        alt=""
                                                        className="h-12 w-12 flex-none rounded-md object-cover"
                                                        src={tournament.imageUrl ? resolveFileUrl(tournament.imageUrl) : horseRacing}
                                                        style={{ objectPosition: tournament.imagePosition }}
                                                    />
                                                    <strong className="max-w-[180px] whitespace-normal leading-[1.15] text-[var(--admin-ink)]">{tournament.name}</strong>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                {getRaceDateLabel(tournament)}
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FaMapMarkerAlt aria-hidden="true" className="text-[var(--admin-primary)]" />
                                                    {tournament.city}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">{tournament.maxHorses}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <strong className="text-[0.95rem] text-[var(--admin-primary-dark)]">{adminApi.formatters.toMoney(tournament.prizePool)}</strong>
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                {getRefereeNames(tournament).length > 0 ? (
                                                    <div className="flex max-w-[180px] flex-wrap gap-1.5">
                                                        {getRefereeNames(tournament).map((referee) => (
                                                            <span className="inline-flex min-h-6 items-center rounded border border-[#e6d3cf] bg-[#fff7f5] px-2 text-[0.68rem] font-black text-[#6e5550]" key={`${tournament.id}-${referee}`}>
                                                                {referee}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-[0.76rem] font-extrabold text-[#9a817c]">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <span className={`inline-flex min-h-6 items-center rounded border px-2.5 text-[0.68rem] font-black uppercase ${statusClass[formatClass(tournament.status)]}`}>
                                                    {tournament.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <div className="inline-flex items-center gap-3.5">
                                                    <button aria-label={`View ${tournament.name}`} className="grid h-7 w-7 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" onClick={() => setSelectedTournament(tournament)} type="button">
                                                        <FaEye aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        aria-label={`Edit ${tournament.name}`}
                                                        className="grid h-7 w-7 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]"
                                                        onClick={() => {
                                                            setEditTournamentImageName('');
                                                            setEditingTournament(tournament);
                                                        }}
                                                        type="button"
                                                    >
                                                        <FaEdit aria-hidden="true" />
                                                    </button>
                                                    <button aria-label={`Delete ${tournament.name}`} className="grid h-7 w-7 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" onClick={() => handleDelete(tournament.id)} type="button">
                                                        <FaTrashAlt aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex min-h-[68px] items-center justify-between gap-[18px] px-[22px] py-4 text-[0.82rem] font-bold text-[var(--admin-muted)] max-[820px]:flex-col max-[820px]:items-stretch">
                            <span>Showing {firstShown} - {lastShown} of {filteredTournaments.length} tournaments</span>

                            <div className="flex items-center gap-2 max-[820px]:flex-wrap">
                                <button aria-label="Previous page" className={paginationButtonClass} disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">&lt;</button>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                    <button
                                        className={`${paginationButtonClass} ${pageNumber === page ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary)]' : ''}`}
                                        key={pageNumber}
                                        onClick={() => setPage(pageNumber)}
                                        type="button"
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                                <button aria-label="Next page" className={paginationButtonClass} disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">&gt;</button>
                            </div>
                        </div>
                    </section>

                    {selectedTournament && (
                        <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8" onClick={() => setSelectedTournament(null)} role="presentation">
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
                                    <button aria-label="Close tournament details" className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]" onClick={() => setSelectedTournament(null)} type="button">
                                        <FaTimes aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
                                    <DetailItem label="Tournament ID">
                                        {detailValue(readTournamentField(selectedTournament, 'id', 'tournamentId', 'TournamentId'))}
                                    </DetailItem>
                                    <DetailItem label="Status">
                                        <span className={`inline-flex min-h-6 w-fit items-center rounded border px-2.5 text-[0.68rem] font-black uppercase ${statusClass[formatClass(selectedTournament.status)] || statusClass.draft}`}>
                                            {detailValue(selectedTournament.status)}
                                        </span>
                                    </DetailItem>
                                    <DetailItem label="Registration Deadline">
                                        {adminApi.formatters.toDateLabel(selectedTournament.startDate)}
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
                                    <DetailItem label="Created By">
                                        {detailValue(readTournamentField(selectedTournament, 'createdBy', 'CreatedBy'))}
                                    </DetailItem>
                                    <DetailItem label="Created At">
                                        {readTournamentField(selectedTournament, 'createdAt', 'CreatedAt')
                                            ? adminApi.formatters.toDateLabel(String(readTournamentField(selectedTournament, 'createdAt', 'CreatedAt')).split('T')[0])
                                            : '-'}
                                    </DetailItem>
                                    <div className={`${detailItemClass} col-span-2 max-[720px]:col-span-1`}>
                                        <span className={detailLabelClass}>Description</span>
                                        <div className={detailValueClass}>{detailValue(selectedTournament.description || selectedTournament.className)}</div>
                                    </div>
                                    <div className={`${detailItemClass} col-span-2 max-[720px]:col-span-1`}>
                                        <span className={detailLabelClass}>Rules</span>
                                        <div className={`${detailValueClass} whitespace-pre-wrap leading-relaxed`}>{detailValue(selectedTournament.rules)}</div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {editingTournament && (
                        <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8" onClick={() => setEditingTournament(null)} role="presentation">
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
                                    <button aria-label="Close edit tournament" className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]" onClick={() => setEditingTournament(null)} type="button">
                                        <FaTimes aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
                                    <label className={`${editFieldClass} col-span-2 max-[720px]:col-span-1`}>
                                        <span className={editLabelClass}>Tournament Name</span>
                                        <input className={editControlClass} defaultValue={editingTournament.name} name="name" required type="text" />
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Description</span>
                                        <input className={editControlClass} defaultValue={editingTournament.description || editingTournament.className} name="description" type="text" />
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
                                        <span className={editLabelClass}>Status</span>
                                        <select className={editControlClass} defaultValue={editingTournament.status} name="status">
                                            <option value="Draft">Draft</option>
                                            <option value="OpenRegistration">Open Registration</option>
                                            <option value="ClosedRegistration">Closed Registration</option>
                                            <option value="Ongoing">Ongoing</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Race Date</span>
                                        <div className="grid grid-cols-[minmax(0,1fr)_132px] gap-3 max-[720px]:grid-cols-1">
                                            <input className={editControlClass} defaultValue={editingTournament.endDate} name="endDate" required type="date" />
                                            <input aria-label="Race start time" className={editControlClass} defaultValue={getRaceTimeInputValue(editingTournament)} name="raceStartTime" required type="time" />
                                        </div>
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Registration Deadline</span>
                                        <input className={editControlClass} defaultValue={editingTournament.startDate} name="startDate" required type="date" />
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Location</span>
                                        <input className={editControlClass} defaultValue={editingTournament.location} name="location" type="text" />
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>City</span>
                                        <input className={editControlClass} defaultValue={editingTournament.city} name="city" required type="text" />
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Max Horses</span>
                                        <input className={editControlClass} defaultValue={editingTournament.maxHorses} min="0" name="maxHorses" type="number" />
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Registered Horses</span>
                                        <input className={editControlClass} defaultValue={editingTournament.registeredHorses} min="0" name="registeredHorses" type="number" />
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Prize Pool</span>
                                        <input className={editControlClass} defaultValue={editingTournament.prizePool} min="0" name="prizePool" step="any" type="number" />
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
                                        <input accept="image/*" className="sr-only" name="tournamentImage" onChange={handleEditTournamentImageChange} type="file" />
                                    </label>

                                    <label className={`${editFieldClass} col-span-2 max-[720px]:col-span-1`}>
                                        <span className={editLabelClass}>Rules</span>
                                        <textarea className={`${editControlClass} min-h-[96px] py-2`} defaultValue={editingTournament.rules || ''} name="rules" />
                                    </label>
                                </div>

                                {editError && (
                                    <div className="rounded-md border border-[#f0b4b4] bg-[#fff3f3] px-4 py-3 text-[0.85rem] font-semibold text-[var(--admin-primary)]">
                                        {editError}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 max-[720px]:flex-col">
                                    <button className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-4 font-black text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]" onClick={() => { setEditingTournament(null); setEditError(''); }} type="button">
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
