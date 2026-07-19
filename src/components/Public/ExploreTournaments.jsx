import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaArrowRight,
    FaClock,
    FaMapMarkerAlt,
    FaSearch,
    FaSyncAlt,
    FaTrophy,
} from 'react-icons/fa';

import { publicApi } from '../../api/publicApi';
import { resolveFileUrl } from '../../api/uploadApi';
import PublicLayout from './PublicLayout';
import horseRacing from '../../assets/horse-racing.jpg';

const fallbackTournaments = [
    {
        tournamentId: 'fallback-1',
        tournamentName: 'Royal Ascot Autumn Classic',
        location: 'Ascot, UK',
        imageUrl: '/Horse2.jpg',
        status: 'OpenRegistration',
        prizePool: 2500000,
        registeredHorseCount: 18,
        race: { distanceMeters: 1600, raceDate: '2024-10-15T14:00:00' },
    },
    {
        tournamentId: 'fallback-2',
        tournamentName: 'Dubai Desert Dash',
        location: 'Meydan, UAE',
        imageUrl: '/RoyalTurfChampionship.jpg',
        status: 'OpenRegistration',
        prizePool: 5000000,
        registeredHorseCount: 12,
        race: { distanceMeters: 2000, raceDate: '2024-11-05T16:00:00' },
    },
    {
        tournamentId: 'fallback-3',
        tournamentName: 'Melbourne Sprint Cup',
        location: 'Flemington, AUS',
        imageUrl: '/ticket.jpg',
        status: 'Scheduled',
        prizePool: 1500000,
        registeredHorseCount: 10,
        race: { distanceMeters: 1200, raceDate: '2024-12-12T13:00:00' },
    },
];

function readField(item, key) {
    const pascalKey = key[0].toUpperCase() + key.slice(1);
    return item?.[key] ?? item?.[pascalKey];
}

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(String(value).includes('T') ? value : `${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatMoney(value) {
    if (value === null || value === undefined || value === '') return '-';
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
        style: 'currency',
        currency: 'USD',
    }).format(Number(value || 0));
}

function humanizeStatus(status) {
    return String(status || '-').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

function normalizeTournament(item) {
    const race = readField(item, 'race') || {};
    const id = readField(item, 'tournamentId');
    const status = readField(item, 'status') || '-';

    return {
        id,
        title: readField(item, 'tournamentName') || 'Tournament',
        description: readField(item, 'description') || '',
        location: readField(item, 'location') || readField(race, 'location') || '-',
        image: readField(item, 'imageUrl') ? resolveFileUrl(readField(item, 'imageUrl')) : horseRacing,
        status,
        statusLabel: humanizeStatus(status),
        statusClass: status === 'OpenRegistration' ? 'bg-[#e7f7e8] text-[#28733a]' : 'bg-[#f5e1dd] text-[#7b4340]',
        date: formatDate(readField(race, 'raceDate') || readField(item, 'endDate')),
        distance: readField(race, 'distanceMeters') ? `${readField(race, 'distanceMeters')}m` : '-',
        prize: formatMoney(readField(item, 'prizePool')),
        prizeValue: Number(readField(item, 'prizePool') || 0),
        registered: `${readField(item, 'registeredHorseCount') ?? 0} registered`,
        link: Number(id) ? `/public/tournaments/${id}` : '/login',
    };
}

export default function ExploreTournaments() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [distanceFilter, setDistanceFilter] = useState('all');

    const loadTournaments = async () => {
        setLoading(true);
        try {
            const payload = await publicApi.getPublicTournaments(100);
            setItems(Array.isArray(payload) ? payload : []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTournaments();
    }, []);

    const tournaments = useMemo(() => {
        const source = items.length > 0 ? items : fallbackTournaments;
        return source.map(normalizeTournament);
    }, [items]);

    const filteredTournaments = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return tournaments.filter((item) => (
            (!normalizedQuery || [item.title, item.location, item.statusLabel].some((value) => String(value).toLowerCase().includes(normalizedQuery)))
            && (statusFilter === 'all' || item.status === statusFilter)
            && (distanceFilter === 'all' || item.distance === distanceFilter)
        ));
    }, [distanceFilter, query, statusFilter, tournaments]);

    const featured = filteredTournaments[0] || tournaments[0];
    const totalPrize = tournaments.reduce((sum, item) => sum + item.prizeValue, 0);
    const distanceOptions = [...new Set(tournaments.map((item) => item.distance).filter((distance) => distance !== '-'))];

    return (
        <PublicLayout showSearch={false}>
            <section className="relative min-h-[350px] overflow-hidden">
                <img src="/RoyalTurfChampionship.jpg" alt="Tournament stadium" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
                <div className="relative z-10 mx-auto flex min-h-[350px] max-w-7xl flex-col justify-center px-6 text-white md:px-11">
                    <h1 className="max-w-3xl text-4xl font-black md:text-5xl">Explore Tournaments</h1>
                    <p className="mt-4 max-w-2xl text-lg leading-8 text-white/90">
                        Browse public tournaments, race schedules, registration counts, and official detail pages.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-8 md:px-11">
                <div className="grid gap-5 md:grid-cols-4">
                    {[
                        [String(tournaments.length), 'Total Tournaments'],
                        [String(tournaments.filter((item) => item.status === 'OpenRegistration').length), 'Open Registrations'],
                        [formatMoney(totalPrize), 'Total Prize Pool'],
                        [String(tournaments.filter((item) => item.date !== '-').length), 'Scheduled Races'],
                    ].map(([value, label]) => (
                        <div key={label} className="rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] p-5 shadow-[0_10px_30px_rgba(70,32,26,0.06)]">
                            <strong className="block text-3xl font-black text-[var(--racing-primary)]">{value}</strong>
                            <span className="mt-2 block text-xs font-black uppercase tracking-[0.15em] text-[var(--racing-muted)]">{label}</span>
                        </div>
                    ))}
                </div>

                {featured && (
                    <>
                        <div className="mt-8 border-b border-[var(--racing-border)] pb-3">
                            <h2 className="m-0 text-2xl font-black">Featured Event</h2>
                        </div>
                        <article className="mt-4 grid overflow-hidden rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] shadow-[0_16px_40px_rgba(70,32,26,0.08)] lg:grid-cols-[1.15fr_1fr]">
                            <div className="relative min-h-[280px]">
                                <img src={featured.image} alt={featured.title} className="absolute inset-0 h-full w-full object-cover" />
                                <span className="absolute left-5 top-5 rounded-full bg-[var(--racing-primary)] px-4 py-2 text-xs font-black uppercase text-white">
                                    {featured.statusLabel}
                                </span>
                            </div>
                            <div className="p-7 md:p-9">
                                <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[var(--racing-primary)]">
                                    <FaTrophy className="mr-2 inline" />
                                    {featured.title}
                                </p>
                                <h3 className="max-w-md text-4xl font-black leading-tight">Official Tournament Detail</h3>
                                <div className="mt-7 grid gap-6 sm:grid-cols-2">
                                    <div><span className="text-xs text-[var(--racing-muted)]">Prize Pool</span><strong className="block text-xl">{featured.prize}</strong></div>
                                    <div><span className="text-xs text-[var(--racing-muted)]">Location</span><strong className="block text-xl">{featured.location}</strong></div>
                                </div>
                                <div className="mt-8 flex flex-col gap-5 border-t border-[var(--racing-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="m-0 text-sm font-bold text-[var(--racing-muted)]">
                                        <FaClock className="mr-2 inline text-[var(--racing-gold)]" />
                                        Race Date <span className="text-[var(--racing-ink)]">{featured.date}</span>
                                    </p>
                                    <Link to={featured.link} className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[var(--racing-primary)] px-6 py-3 text-sm font-black text-white no-underline hover:bg-[var(--racing-primary-dark)]">
                                        View Full Details <FaArrowRight />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    </>
                )}

                <div className="mt-8 flex flex-col gap-3 rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] p-3 md:flex-row">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--racing-muted)]" />
                        <input className="h-11 w-full rounded-[8px] border border-[var(--racing-border)] bg-white pl-11 pr-4 outline-none focus:border-[var(--racing-primary)]" onChange={(event) => setQuery(event.target.value)} placeholder="Search tournament..." value={query} />
                    </div>
                    <select className="h-11 rounded-[8px] border border-[var(--racing-border)] bg-white px-4 outline-none focus:border-[var(--racing-primary)]" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                        <option value="all">All Status</option>
                        {[...new Set(tournaments.map((item) => item.status))].map((status) => <option key={status} value={status}>{humanizeStatus(status)}</option>)}
                    </select>
                    <select className="h-11 rounded-[8px] border border-[var(--racing-border)] bg-white px-4 outline-none focus:border-[var(--racing-primary)]" onChange={(event) => setDistanceFilter(event.target.value)} value={distanceFilter}>
                        <option value="all">All Distance</option>
                        {distanceOptions.map((distance) => <option key={distance} value={distance}>{distance}</option>)}
                    </select>
                    <button className="inline-flex items-center justify-center gap-2 border-0 bg-transparent px-4 text-sm font-bold text-[var(--racing-muted)]" onClick={() => { setQuery(''); setStatusFilter('all'); setDistanceFilter('all'); loadTournaments(); }} type="button">
                        <FaSyncAlt /> Reset Filter
                    </button>
                </div>

                {loading && <p className="mt-6 text-center text-sm font-bold text-[var(--racing-muted)]">Loading tournaments...</p>}
                <div className="mt-7 grid gap-6 lg:grid-cols-3">
                    {filteredTournaments.map((item) => (
                        <article key={item.id || item.title} className="overflow-hidden rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] shadow-[0_12px_34px_rgba(70,32,26,0.07)]">
                            <div className="relative h-[210px]">
                                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                <span className={`absolute right-3 top-3 rounded px-3 py-1 text-xs font-bold ${item.statusClass}`}>{item.statusLabel}</span>
                            </div>
                            <div className="p-5">
                                <h3 className="text-xl font-black">{item.title}</h3>
                                <p className="mt-1 text-sm text-[var(--racing-muted)]"><FaMapMarkerAlt className="mr-1 inline" />{item.location}</p>
                                {item.description && <p className="mt-2 line-clamp-2 text-sm text-[var(--racing-muted)]">{item.description}</p>}
                                <div className="mt-5 grid grid-cols-2 gap-3 rounded-[8px] border border-[#efd7d2] bg-[#fff7f5] p-4 text-sm">
                                    <div><span className="block text-xs text-[var(--racing-muted)]">Date</span><strong>{item.date}</strong></div>
                                    <div><span className="block text-xs text-[var(--racing-muted)]">Distance</span><strong>{item.distance}</strong></div>
                                    <div><span className="block text-xs text-[var(--racing-muted)]">Prize Pool</span><strong className="text-[var(--racing-primary)]">{item.prize}</strong></div>
                                    <div><span className="block text-xs text-[var(--racing-muted)]">Registered</span><strong>{item.registered}</strong></div>
                                </div>
                                <Link to={item.link} className="mx-auto mt-6 flex h-10 w-40 items-center justify-center rounded-[8px] border border-[#e4b734] bg-white text-sm font-black text-[var(--racing-ink)] no-underline hover:bg-[#fff7dc]">
                                    View Detail
                                </Link>
                            </div>
                        </article>
                    ))}
                    {!loading && filteredTournaments.length === 0 && (
                        <div className="col-span-full rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] p-8 text-center text-sm font-bold text-[var(--racing-muted)]">
                            No tournaments match your filters.
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
