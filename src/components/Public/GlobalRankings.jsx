import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaSearch, FaTrophy } from 'react-icons/fa';
import PublicLayout from './PublicLayout';
import horseRacing from '../../assets/horse-racing.jpg';

const horses = [
    {
        rank: '#2',
        name: 'Midnight Runner',
        location: 'UK',
        image: '/Horse1.jpg',
    },
    {
        rank: '#3',
        name: 'Crimson Tide',
        location: 'USA',
        image: '/Horse2.jpg',
    },
    {
        rank: '#4',
        name: 'Golden Mane',
        location: 'UAE',
        image: '/GoldenDerby.jpg',
    },
    {
        rank: '#5',
        name: 'Storm Dancer',
        location: 'FR',
        image: '/RoyalTurfChampionship.jpg',
    },
    {
        rank: '#6',
        name: 'Royal Eclipse',
        location: 'AUS',
        image: '/ticket.jpg',
    },
];

const performanceRows = [
    ['Thunderstrike', 'Dubai World Cup', '1st', '2:01.38', 'J. Rosario', '98.5'],
    ['Midnight Runner', 'Royal Ascot Gold Cup', '2nd', '4:16.12', 'R. Moore', '95.2'],
    ['Crimson Tide', 'Kentucky Derby', '1st', '2:02.10', 'F. Prat', '96.8'],
    ['Golden Mane', "Prix de l'Arc de Triomphe", '4th', '2:29.45', 'C. Soumillon', '91.0'],
];

export default function GlobalRankings() {
    return (
        <PublicLayout showSearch={false}>
            <section className="relative min-h-[390px] overflow-hidden">
                <img
                    src={horseRacing}
                    alt="Elite racing horses"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />

                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 mx-auto flex min-h-[390px] max-w-5xl flex-col items-center justify-center px-6 text-center text-white">
                    <h1 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">
                        Elite Racing Horses
                    </h1>

                    <p className="mt-3 text-lg text-white/90">
                        Discover world-class race horses competing across global tournaments.
                    </p>

                    <div className="relative mt-8 w-full max-w-2xl">
                        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--racing-muted)]" />
                        <input
                            className="h-14 w-full rounded-[8px] border border-white/30 bg-white px-5 pl-12 text-[var(--racing-ink)] shadow-[0_15px_38px_rgba(0,0,0,0.16)] outline-none"
                            placeholder="Search by name, breed, or ID..."
                        />
                    </div>

                    <div className="mt-7 grid w-full max-w-xl grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                            ['1,840', 'Total Horses'],
                            ['920', 'Active Racers'],
                            ['45', 'Champions'],
                            ['68 km/h', 'Avg Speed'],
                        ].map(([value, label]) => (
                            <div
                                key={label}
                                className="rounded-[8px] bg-black/55 px-4 py-4 backdrop-blur"
                            >
                                <strong className="block text-2xl font-black">
                                    {value}
                                </strong>
                                <span className="text-xs uppercase text-white/80">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-8 md:px-11">
                <div className="mb-8 flex flex-col gap-3 rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] p-3 md:flex-row md:items-center">
                    {['Breed', 'Age', 'Performance', 'Status', 'Distance', 'Region'].map((label) => (
                        <select
                            key={label}
                            className="h-11 rounded-[8px] border border-[var(--racing-border)] bg-white px-4 outline-none"
                        >
                            <option>{label}</option>
                        </select>
                    ))}

                    <div className="flex-1" />

                    <select className="h-11 rounded-[8px] border border-[var(--racing-border)] bg-white px-4 outline-none">
                        <option>Highest Ranked</option>
                    </select>
                </div>

                <article className="grid overflow-hidden rounded-[12px] bg-[#fffaf8] shadow-[0_18px_45px_rgba(70,32,26,0.10)] lg:grid-cols-[1fr_1fr]">
                    <div className="relative min-h-[360px]">
                        <img
                            src="/Horse2.jpg"
                            alt="Thunderstrike"
                            className="absolute inset-0 h-full w-full object-cover"
                        />

                        <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded bg-[#f7d84a] px-3 py-2 text-xs font-black uppercase">
                            <FaTrophy /> #1 Global Rank
                        </span>
                    </div>

                    <div className="p-7 md:p-9">
                        <div className="flex gap-2">
                            <span className="rounded border border-[#efbbb5] bg-[#fff0ee] px-2 py-1 text-xs font-bold text-[#9b3a32]">
                                Thoroughbred
                            </span>

                            <span className="rounded border border-[#efbbb5] bg-[#fff0ee] px-2 py-1 text-xs font-bold text-[#9b3a32]">
                                5yo
                            </span>
                        </div>

                        <h2 className="mt-4 text-4xl font-black tracking-[-0.04em]">
                            Thunderstrike
                        </h2>

                        <p className="mt-3 max-w-md leading-7 text-[var(--racing-muted)]">
                            The reigning champion across three continents. Known for an explosive finishing kick and unparalleled stamina in classic distance races.
                        </p>

                        <div className="mt-8 grid grid-cols-2 gap-8">
                            <div>
                                <span className="text-xs font-bold uppercase text-[var(--racing-muted)]">
                                    Locations
                                </span>
                                <strong className="block text-2xl">UK</strong>
                            </div>

                            <div>
                                <span className="text-xs font-bold uppercase text-[var(--racing-muted)]">
                                    Earnings
                                </span>
                                <strong className="block text-2xl">$12.4M</strong>
                            </div>
                        </div>

                        <Link
                            to="/login"
                            className="mt-12 inline-flex rounded-[6px] bg-[var(--racing-primary)] px-6 py-3 text-sm font-black text-white no-underline hover:bg-[var(--racing-primary-dark)]"
                        >
                            View Full Profile
                        </Link>
                    </div>
                </article>

                <div className="mb-5 mt-8 flex items-center justify-between border-b border-[var(--racing-border)] pb-3">
                    <h2 className="m-0 text-2xl font-black tracking-[-0.03em]">
                        Elite Directory
                    </h2>

                    <Link
                        to="/global-rankings"
                        className="text-sm font-black text-[var(--racing-primary)] no-underline"
                    >
                        View All →
                    </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                    {horses.map((horse) => (
                        <article
                            key={horse.name}
                            className="overflow-hidden rounded-[8px] bg-[#fffaf8] shadow-[0_12px_30px_rgba(70,32,26,0.08)]"
                        >
                            <div className="relative h-[145px]">
                                <img
                                    src={horse.image}
                                    alt={horse.name}
                                    className="h-full w-full object-cover"
                                />

                                <span className="absolute left-2 top-2 rounded bg-white/90 px-2 py-1 text-xs font-black">
                                    {horse.rank}
                                </span>
                            </div>

                            <div className="p-4">
                                <h3 className="text-lg font-black">{horse.name}</h3>

                                <p className="mt-1 text-sm text-[var(--racing-muted)]">
                                    <FaMapMarkerAlt className="mr-1 inline" />
                                    {horse.location}
                                </p>

                                <Link
                                    to="/login"
                                    className="mt-4 block border-t border-[#efd7d2] pt-3 text-xs font-black text-[var(--racing-primary)] no-underline"
                                >
                                    Profile ›
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-10 overflow-hidden rounded-[12px] border border-[var(--racing-border)] bg-[#fffaf8] shadow-[0_16px_40px_rgba(70,32,26,0.07)]">
                    <h2 className="px-5 py-4 text-xl font-black">
                        Recent Global Performances
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                            <thead className="bg-[#fff0ee] text-xs uppercase tracking-wide text-[var(--racing-muted)]">
                                <tr>
                                    {['Horse', 'Latest Tournament', 'Position', 'Time', 'Jockey', 'Score'].map((head) => (
                                        <th key={head} className="px-5 py-4">
                                            {head}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {performanceRows.map((row) => (
                                    <tr key={`${row[0]}-${row[1]}`} className="border-t border-[#f1dcd8]">
                                        <td className="px-5 py-4 font-black text-[var(--racing-primary)]">
                                            {row[0]}
                                        </td>

                                        <td className="px-5 py-4 text-[var(--racing-muted)]">
                                            {row[1]}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="rounded bg-[#fff3c4] px-2 py-1 font-black">
                                                {row[2]}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 font-mono">
                                            {row[3]}
                                        </td>

                                        <td className="px-5 py-4">
                                            {row[4]}
                                        </td>

                                        <td className="px-5 py-4 font-black">
                                            {row[5]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}