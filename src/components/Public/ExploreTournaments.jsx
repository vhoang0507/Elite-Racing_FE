import { Link } from 'react-router-dom';
import {
    FaArrowRight,
    FaClock,
    FaMapMarkerAlt,
    FaSearch,
    FaSyncAlt,
    FaTrophy,
} from 'react-icons/fa';
import PublicLayout from './PublicLayout';
import horseRacing from '../../assets/horse-racing.jpg';

const tournaments = [
    {
        title: 'Royal Ascot Autumn Classic',
        location: 'Ascot, UK',
        image: '/Horse2.jpg',
        status: 'Open Registration',
        statusClass: 'bg-[#e7f7e8] text-[#28733a]',
        date: 'Oct 15, 2024',
        distance: '1600m',
        prize: '$2.5M',
        registered: '18/24 slots',
    },
    {
        title: 'Dubai Desert Dash',
        location: 'Meydan, UAE',
        image: '/RoyalTurfChampionship.jpg',
        status: 'Open Registration',
        statusClass: 'bg-[#e7f7e8] text-[#28733a]',
        date: 'Nov 05, 2024',
        distance: '2000m',
        prize: '$8.0M',
        registered: '12/16 slots',
    },
    {
        title: 'Melbourne Sprint Cup',
        location: 'Flemington, AUS',
        image: '/ticket.jpg',
        status: 'Upcoming',
        statusClass: 'bg-[#f5e1dd] text-[#7b4340]',
        date: 'Dec 12, 2024',
        distance: '1200m',
        prize: '$1.5M',
        registered: '14 Days',
    },
];

export default function ExploreTournaments() {
    return (
        <PublicLayout showSearch={false}>
            <section className="relative min-h-[350px] overflow-hidden">
                <img
                    src="/RoyalTurfChampionship.jpg"
                    alt="Tournament stadium"
                    className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />

                <div className="relative z-10 mx-auto flex min-h-[350px] max-w-7xl flex-col justify-center px-6 text-white md:px-11">
                    <h1 className="max-w-3xl text-4xl font-black tracking-[-0.04em] md:text-5xl">
                        Explore Tournaments
                    </h1>

                    <p className="mt-4 max-w-2xl text-lg leading-8 text-white/90">
                        Browse upcoming horse racing tournaments and register your horses.
                        Compete at the highest level of equestrian sports.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-8 md:px-11">
                <div className="grid gap-5 md:grid-cols-4">
                    {[
                        ['12', 'Total Tournaments'],
                        ['5', 'Open Registrations'],
                        ['$25M+', 'Total Prize Pool'],
                        ['8', 'Upcoming Races This Month'],
                    ].map(([value, label]) => (
                        <div
                            key={label}
                            className="rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] p-5 shadow-[0_10px_30px_rgba(70,32,26,0.06)]"
                        >
                            <strong className="block text-3xl font-black text-[var(--racing-primary)]">
                                {value}
                            </strong>

                            <span className="mt-2 block text-xs font-black uppercase tracking-[0.15em] text-[var(--racing-muted)]">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 border-b border-[var(--racing-border)] pb-3">
                    <h2 className="m-0 text-2xl font-black tracking-[-0.03em]">
                        Featured Event
                    </h2>
                </div>

                <article className="mt-4 grid overflow-hidden rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] shadow-[0_16px_40px_rgba(70,32,26,0.08)] lg:grid-cols-[1.15fr_1fr]">
                    <div className="relative min-h-[280px]">
                        <img
                            src={horseRacing}
                            alt="Featured tournament"
                            className="absolute inset-0 h-full w-full object-cover"
                        />

                        <span className="absolute left-5 top-5 rounded-full bg-[var(--racing-primary)] px-4 py-2 text-xs font-black uppercase text-white">
                            Premier Tier
                        </span>
                    </div>

                    <div className="p-7 md:p-9">
                        <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[var(--racing-primary)]">
                            <FaTrophy className="mr-2 inline" />
                            Thunder Crown Stakes
                        </p>

                        <h3 className="max-w-md text-4xl font-black leading-tight tracking-[-0.04em]">
                            The Ultimate Test of Speed
                        </h3>

                        <div className="mt-7 grid gap-6 sm:grid-cols-2">
                            <div>
                                <span className="text-xs text-[var(--racing-muted)]">
                                    Prize Pool
                                </span>
                                <strong className="block text-xl">$5,000,000</strong>
                            </div>

                            <div>
                                <span className="text-xs text-[var(--racing-muted)]">
                                    Location
                                </span>
                                <strong className="block text-xl">Belmont Park, NY</strong>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-5 border-t border-[var(--racing-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="m-0 text-sm font-bold text-[var(--racing-muted)]">
                                <FaClock className="mr-2 inline text-[var(--racing-gold)]" />
                                Starts In{' '}
                                <span className="text-[var(--racing-ink)]">
                                    2d 14h 32m
                                </span>
                            </p>

                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[var(--racing-primary)] px-6 py-3 text-sm font-black text-white no-underline hover:bg-[var(--racing-primary-dark)]"
                            >
                                View Full Details <FaArrowRight />
                            </Link>
                        </div>
                    </div>
                </article>

                <div className="mt-8 flex flex-col gap-3 rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] p-3 md:flex-row">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--racing-muted)]" />
                        <input
                            className="h-11 w-full rounded-[8px] border border-[var(--racing-border)] bg-white pl-11 pr-4 outline-none focus:border-[var(--racing-primary)]"
                            placeholder="Search tournament..."
                        />
                    </div>

                    {['Status', 'Location', 'Distance'].map((label) => (
                        <select
                            key={label}
                            className="h-11 rounded-[8px] border border-[var(--racing-border)] bg-white px-4 outline-none focus:border-[var(--racing-primary)]"
                        >
                            <option>{label}</option>
                        </select>
                    ))}

                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 border-0 bg-transparent px-4 text-sm font-bold text-[var(--racing-muted)]"
                    >
                        <FaSyncAlt /> Reset Filter
                    </button>
                </div>

                <div className="mt-7 grid gap-6 lg:grid-cols-3">
                    {tournaments.map((item) => (
                        <article
                            key={item.title}
                            className="overflow-hidden rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] shadow-[0_12px_34px_rgba(70,32,26,0.07)]"
                        >
                            <div className="relative h-[210px]">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-full w-full object-cover"
                                />

                                <span className={`absolute right-3 top-3 rounded px-3 py-1 text-xs font-bold ${item.statusClass}`}>
                                    ● {item.status}
                                </span>
                            </div>

                            <div className="p-5">
                                <h3 className="text-xl font-black">{item.title}</h3>

                                <p className="mt-1 text-sm text-[var(--racing-muted)]">
                                    <FaMapMarkerAlt className="mr-1 inline" />
                                    {item.location}
                                </p>

                                <div className="mt-5 grid grid-cols-2 gap-3 rounded-[8px] border border-[#efd7d2] bg-[#fff7f5] p-4 text-sm">
                                    <div>
                                        <span className="block text-xs text-[var(--racing-muted)]">Date</span>
                                        <strong>{item.date}</strong>
                                    </div>

                                    <div>
                                        <span className="block text-xs text-[var(--racing-muted)]">Distance</span>
                                        <strong>{item.distance}</strong>
                                    </div>

                                    <div>
                                        <span className="block text-xs text-[var(--racing-muted)]">Prize Pool</span>
                                        <strong className="text-[var(--racing-primary)]">{item.prize}</strong>
                                    </div>

                                    <div>
                                        <span className="block text-xs text-[var(--racing-muted)]">Registered</span>
                                        <strong>{item.registered}</strong>
                                    </div>
                                </div>

                                <Link
                                    to="/login"
                                    className="mx-auto mt-6 flex h-10 w-40 items-center justify-center rounded-[8px] border border-[#e4b734] bg-white text-sm font-black text-[var(--racing-ink)] no-underline hover:bg-[#fff7dc]"
                                >
                                    View Detail
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}