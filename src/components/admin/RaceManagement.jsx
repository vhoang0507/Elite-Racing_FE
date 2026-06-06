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

import { adminMockApi } from '../../api/adminMockApi';
import horseRacing from '../../assets/horse-racing.jpg';

import AdminLayout from './AdminLayout';

const formatClass = (value) => value.toLowerCase();

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
    draft: {
        accent: 'before:bg-[#9b7771]',
        soft: 'bg-[#f7eeee]',
        ink: 'text-[#7d615c]',
    },
    completed: {
        accent: 'before:bg-[#2657d8]',
        soft: 'bg-[#eef3ff]',
        ink: 'text-[#2657d8]',
    },
};

const statusClass = {
    active: 'border-[#afe2c4] bg-[#dff7e9] text-[#118548]',
    draft: 'border-[#dbc3bf] bg-[#f3e8e6] text-[#7f645f]',
    completed: 'border-[#dbaaa5] bg-[#f5e1df] text-[var(--admin-primary-dark)]',
    cancelled: 'border-[#f5b8bf] bg-[#ffe5e7] text-[#c3222c]',
};

const filterSelectClass = 'h-full w-full min-w-0 cursor-pointer border-0 bg-transparent p-0 text-[0.8rem] font-extrabold text-[#5b403c] outline-0';
const paginationButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]';
const editFieldClass = 'grid gap-1.5';
const editLabelClass = 'text-[0.72rem] font-black uppercase text-[#765c58]';
const editControlClass = 'h-10 w-full min-w-0 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.88rem] font-bold text-[var(--admin-ink)] outline-0 focus:border-[#c6897e] focus:bg-white focus:shadow-[0_0_0_3px_rgba(134,7,7,0.08)]';
const pageSize = 4;

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

function RaceManagement() {
    const [tournaments, setTournaments] = useState([]);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);
    const [editingTournament, setEditingTournament] = useState(null);

    useEffect(() => {
        let isMounted = true;

        adminMockApi.getTournaments().then((payload) => {
            if (isMounted) {
                setTournaments(payload);
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
            label: 'Active Tournaments',
            value: String(tournaments.filter((tournament) => tournament.status === 'Active').length),
            marker: 'Live',
            tone: 'active',
            icon: FaBolt,
        },
        {
            label: 'Draft Tournaments',
            value: String(tournaments.filter((tournament) => tournament.status === 'Draft').length),
            marker: 'Pending',
            tone: 'draft',
            icon: FaEdit,
        },
        {
            label: 'Completed Tournaments',
            value: String(tournaments.filter((tournament) => tournament.status === 'Completed').length),
            marker: 'History',
            tone: 'completed',
            icon: FaCheckCircle,
        },
    ], [tournaments]);

    const filteredTournaments = useMemo(() => {
        const filtered = tournaments.filter((tournament) => (
            matchesQuery(tournament, query)
            && (statusFilter === 'all' || formatClass(tournament.status) === statusFilter)
        ));

        return [...filtered].sort((current, next) => {
            if (sortBy === 'oldest') {
                return new Date(current.startDate) - new Date(next.startDate);
            }

            if (sortBy === 'prize') {
                return next.prizePool - current.prizePool;
            }

            return new Date(next.startDate) - new Date(current.startDate);
        });
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
        await adminMockApi.deleteTournament(id);
        setTournaments((current) => current.filter((tournament) => tournament.id !== id));
        setPage(1);
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const patch = {
            name: formData.get('name').trim(),
            className: formData.get('className').trim(),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            location: formData.get('location').trim(),
            city: formData.get('city').trim(),
            maxHorses: Number(formData.get('maxHorses') || 0),
            registeredHorses: Number(formData.get('registeredHorses') || 0),
            prizePool: Number(formData.get('prizePool') || 0),
            status: formData.get('status'),
        };

        await adminMockApi.updateTournament(editingTournament.id, patch);
        setTournaments((current) => current.map((item) => (
            item.id === editingTournament.id
                ? {
                    ...item,
                    ...patch,
                }
                : item
        )));
        setEditingTournament(null);
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
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
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
                            <table className="w-full border-collapse max-[820px]:min-w-[980px]">
                                <thead>
                                    <tr>
                                        {['Tournament Name', 'Timeline', 'Location', 'Max Horses', 'Prize Pool', 'Status', 'Actions'].map((heading) => (
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
                                                        src={horseRacing}
                                                        style={{ objectPosition: tournament.imagePosition }}
                                                    />
                                                    <strong className="max-w-[180px] whitespace-normal leading-[1.15] text-[var(--admin-ink)]">{tournament.name}</strong>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <div className="grid leading-[1.15]">
                                                    {adminMockApi.formatters.toShortDateParts(tournament.startDate, tournament.endDate).map((line, index) => (
                                                        <span className={index === 2 ? 'mt-0.5 text-[0.7rem] font-extrabold text-[#9a817c]' : ''} key={`${tournament.id}-${line}`}>{line}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FaMapMarkerAlt aria-hidden="true" className="text-[var(--admin-primary)]" />
                                                    {tournament.city}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">{tournament.maxHorses}</td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <strong className="text-[0.95rem] text-[var(--admin-primary-dark)]">{adminMockApi.formatters.toMoney(tournament.prizePool)}</strong>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <span className={`inline-flex min-h-6 items-center rounded border px-2.5 text-[0.68rem] font-black uppercase ${statusClass[formatClass(tournament.status)]}`}>
                                                    {tournament.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                                <div className="inline-flex items-center gap-3.5">
                                                    <button aria-label={`View ${tournament.name}`} className="grid h-7 w-7 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" type="button">
                                                        <FaEye aria-hidden="true" />
                                                    </button>
                                                    <button aria-label={`Edit ${tournament.name}`} className="grid h-7 w-7 cursor-pointer place-items-center rounded-md bg-transparent text-[#725955] hover:bg-[#fff0ed] hover:text-[var(--admin-primary)]" onClick={() => setEditingTournament(tournament)} type="button">
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
                                        <span className="mt-2 inline-flex text-[0.8rem] font-black text-[var(--admin-muted)]">{editingTournament.id}</span>
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
                                        <span className={editLabelClass}>Class</span>
                                        <input className={editControlClass} defaultValue={editingTournament.className} name="className" type="text" />
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Status</span>
                                        <select className={editControlClass} defaultValue={editingTournament.status} name="status">
                                            <option value="Active">Active</option>
                                            <option value="Draft">Draft</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>Start Date</span>
                                        <input className={editControlClass} defaultValue={editingTournament.startDate} name="startDate" required type="date" />
                                    </label>

                                    <label className={editFieldClass}>
                                        <span className={editLabelClass}>End Date</span>
                                        <input className={editControlClass} defaultValue={editingTournament.endDate} name="endDate" required type="date" />
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
                                        <input className={editControlClass} defaultValue={editingTournament.prizePool} min="0" name="prizePool" step="1000" type="number" />
                                    </label>
                                </div>

                                <div className="flex justify-end gap-3 max-[720px]:flex-col">
                                    <button className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-4 font-black text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]" onClick={() => setEditingTournament(null)} type="button">
                                        Cancel
                                    </button>
                                    <button className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] px-4 font-black text-white hover:bg-[var(--admin-primary-dark)]" type="submit">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <footer className="mt-[132px] flex items-center justify-between gap-6 text-[var(--admin-primary-dark)] max-[820px]:mt-12 max-[820px]:flex-col max-[820px]:items-stretch">
                        <strong className="text-base font-black">Elite Racing League</strong>
                        <nav aria-label="Footer links" className="flex flex-wrap justify-end gap-7 max-[820px]:justify-start">
                            <a className="text-[0.76rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Terms of Service</a>
                            <a className="text-[0.76rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Privacy Policy</a>
                            <a className="text-[0.76rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Contact Support</a>
                            <a className="text-[0.76rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Racing Rules</a>
                        </nav>
                    </footer>
                </section>
        </AdminLayout>
    );
}

export default RaceManagement;
