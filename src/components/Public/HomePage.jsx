import { Link } from 'react-router-dom';
import {
    FaBookmark,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaMoneyBillWave,
} from 'react-icons/fa';
import PublicLayout from './PublicLayout';
import horseRacing from '../../assets/horse-racing.jpg';

const sideEvents = [
    {
        tag: 'Grade II',
        title: 'Melbourne Sprint Cup',
        location: 'Flemington, AUS',
        date: 'Nov 04, 2024',
        purse: '$1.2M',
    },
    {
        tag: 'Invitational',
        title: 'Dubai Desert Dash',
        location: 'Meydan, UAE',
        date: 'Dec 15, 2024',
        purse: '$5.0M',
    },
];

const leaderboardRows = [
    {
        pos: 1,
        horse: 'Thunderstrike',
        jockey: 'J. Reynolds',
        owner: 'Sterling Equine',
        time: '1:59.40',
        style: 'bg-[#f7ce4b]',
    },
    {
        pos: 2,
        horse: 'Midnight Runner',
        jockey: 'M. Chen',
        owner: 'Oakwood Farms',
        time: '1:59.85',
        style: 'bg-[#f3dad6]',
    },
    {
        pos: 3,
        horse: 'Crimson Tide',
        jockey: 'T. Baker',
        owner: 'Highland Syndicate',
        time: '2:00.12',
        style: 'bg-[#efc7c1]',
    },
];

export default function HomePage() {
    return (
        <PublicLayout>
            <section className="relative min-h-[640px] overflow-hidden">
                <img
                    src={horseRacing}
                    alt="Elite horse racing"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />

                <div className="absolute inset-0 bg-[rgba(255,247,245,0.38)]" />
                <div className="absolute inset-x-0 bottom-0 h-[230px] bg-gradient-to-b from-transparent to-[var(--racing-bg)]" />

                <div className="relative z-10 mx-auto flex min-h-[640px] max-w-5xl flex-col items-center justify-center px-6 text-center text-white">
                    <span className="mb-6 rounded-full border border-[#d9a19a] bg-[#fff0ed]/90 px-4 py-2 text-xs font-black uppercase tracking-wide text-[var(--racing-primary)]">
                        ● The Pinnacle of Equine Competition
                    </span>

                    <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-[-0.04em] drop-shadow-[0_5px_12px_rgba(0,0,0,0.28)] md:text-6xl">
                        Witness Elite Racing History Unfold
                    </h1>

                    <p className="mt-5 max-w-3xl text-base leading-7 text-white drop-shadow-[0_3px_9px_rgba(0,0,0,0.30)] md:text-lg">
                        Access premium tournament data, track pedigree rankings, and secure paddock passes for the world's most prestigious equine events.
                    </p>

                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                        <Link
                            to="/explore-tournaments"
                            className="rounded-[6px] bg-[var(--racing-primary)] px-7 py-4 text-sm font-black text-white no-underline shadow-[0_14px_28px_rgba(134,7,7,0.25)] hover:bg-[var(--racing-primary-dark)]"
                        >
                            Explore Tournaments
                        </Link>

                        <Link
                            to="/global-rankings"
                            className="rounded-[6px] border border-[var(--racing-border)] bg-[#fffaf8] px-7 py-4 text-sm font-black text-[var(--racing-primary)] no-underline hover:bg-[#fff1ee]"
                        >
                            View Global Rankings
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-16 pt-8 md:px-11 md:pt-14">
                <div className="mb-7 flex flex-col gap-3 border-b border-[var(--racing-border)] pb-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="m-0 text-3xl font-black tracking-[-0.03em]">
                            Upcoming Tournaments
                        </h2>
                        <p className="mt-2 text-sm text-[var(--racing-muted)]">
                            Secure your spot at the next major event.
                        </p>
                    </div>

                    <Link
                        to="/explore-tournaments"
                        className="text-xs font-black uppercase tracking-wide text-[var(--racing-primary)] no-underline"
                    >
                        View Calendar →
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <article className="relative min-h-[345px] overflow-hidden rounded-[8px] shadow-[0_18px_45px_rgba(70,32,26,0.13)]">
                        <img
                            src="/Horse2.jpg"
                            alt="Royal Ascot Autumn Classic"
                            className="absolute inset-0 h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                        <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                            <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold">
                                <span className="rounded bg-[var(--racing-primary)] px-2.5 py-1.5">
                                    Grade I Stakes
                                </span>

                                <span className="rounded bg-white/90 px-2.5 py-1.5 text-[var(--racing-ink)]">
                                    <FaCalendarAlt className="mr-1 inline" /> Oct 12, 2024
                                </span>
                            </div>

                            <h3 className="m-0 text-3xl font-black tracking-[-0.03em]">
                                The Royal Ascot Autumn Classic
                            </h3>

                            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/90">
                                <span>
                                    <FaMapMarkerAlt className="mr-1 inline" /> Ascot, UK
                                </span>
                                <span>
                                    <FaMoneyBillWave className="mr-1 inline" /> $2.5M Purse
                                </span>
                            </p>
                        </div>
                    </article>

                    <div className="grid gap-5">
                        {sideEvents.map((event) => (
                            <article
                                key={event.title}
                                className="rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] p-5 shadow-[0_10px_28px_rgba(70,32,26,0.06)]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="rounded bg-[#f5d8d3] px-2 py-1 text-xs font-black text-[#9b3a32]">
                                            {event.tag}
                                        </span>

                                        <h3 className="mt-3 text-xl font-black">
                                            {event.title}
                                        </h3>

                                        <p className="mt-1 text-sm text-[var(--racing-muted)]">
                                            <FaMapMarkerAlt className="mr-1 inline" />
                                            {event.location}
                                        </p>
                                    </div>

                                    <FaBookmark className="text-[var(--racing-muted)]" />
                                </div>

                                <div className="mt-5 flex items-center justify-between border-t border-[var(--racing-border)] pt-4 text-sm font-bold">
                                    <span>{event.date}</span>
                                    <span className="text-[var(--racing-gold)]">
                                        {event.purse}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-y border-[var(--racing-border)] bg-[#fff0ee] px-6 py-16 md:px-11">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 text-center">
                        <h2 className="m-0 text-3xl font-black tracking-[-0.03em]">
                            Recent Results & Leaderboard
                        </h2>
                        <p className="mt-2 text-sm text-[var(--racing-muted)]">
                            The latest official placements from the global elite racing circuit.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] shadow-[0_20px_46px_rgba(70,32,26,0.08)]">
                        <div className="flex items-center justify-between px-5 py-4">
                            <h3 className="m-0 text-lg font-black">
                                Kentucky Derby Select - Final
                            </h3>

                            <Link
                                to="/global-rankings"
                                className="text-xs font-black uppercase tracking-wide text-[var(--racing-primary)] no-underline"
                            >
                                Full Standings
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                                <thead className="bg-[#fff7f5] text-xs uppercase tracking-wide text-[var(--racing-muted)]">
                                    <tr>
                                        <th className="px-5 py-3">Pos</th>
                                        <th className="px-5 py-3">Horse / Jockey</th>
                                        <th className="px-5 py-3">Owner / Stable</th>
                                        <th className="px-5 py-3">Time</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {leaderboardRows.map((row) => (
                                        <tr key={row.pos} className="border-t border-[#f1dcd8]">
                                            <td className="px-5 py-4">
                                                <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-black ${row.style}`}>
                                                    {row.pos}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <strong className="block">{row.horse}</strong>
                                                <span className="text-xs text-[var(--racing-muted)]">
                                                    {row.jockey}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-[var(--racing-muted)]">
                                                {row.owner}
                                            </td>

                                            <td className="px-5 py-4 font-mono font-bold">
                                                {row.time}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}