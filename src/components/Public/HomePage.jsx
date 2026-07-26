import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaMoneyBillWave,
} from 'react-icons/fa';

import { publicApi } from '../../api/publicApi';
import { resolveFileUrl } from '../../api/uploadApi';
import horseRacing from '../../assets/horse-racing.jpg';
import PublicLayout from './PublicLayout';

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

function normalizeTournament(item) {
    const race = readField(item, 'race') || {};
    const id = readField(item, 'tournamentId');

    return {
        id,
        title: readField(item, 'tournamentName') || 'Tournament',
        location: readField(item, 'location') || readField(race, 'location') || '-',
        image: readField(item, 'imageUrl') ? resolveFileUrl(readField(item, 'imageUrl')) : horseRacing,
        status: readField(item, 'status') || '-',
        date: formatDate(readField(race, 'raceDate') || readField(item, 'endDate')),
        distance: readField(race, 'distanceMeters') ? `${readField(race, 'distanceMeters')}m` : '-',
        prize: formatMoney(readField(item, 'prizePool')),
        registered: `${readField(item, 'registeredHorseCount') ?? 0} registered`,
        link: Number(id) ? `/public/tournaments/${id}` : '/explore-tournaments',
    };
}

export default function HomePage() {
    const [homeData, setHomeData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [requestVersion, setRequestVersion] = useState(0);
    const [activeTournamentIndex, setActiveTournamentIndex] = useState(0);

    useEffect(() => {
        let isMounted = true;

        publicApi.getPublicHome()
            .then((payload) => {
                if (isMounted) {
                    setHomeData(payload);
                    setLoadError('');
                }
            })
            .catch((error) => {
                if (isMounted) {
                    setHomeData(null);
                    setLoadError(error.message || 'Unable to load homepage data.');
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [requestVersion]);

    const handleRetry = () => {
        setHomeData(null);
        setLoadError('');
        setIsLoading(true);
        setRequestVersion((version) => version + 1);
    };

    const tournaments = useMemo(() => {
        const payload = readField(homeData, 'upcomingTournaments');
        const items = Array.isArray(payload) ? payload : [];
        return items.map(normalizeTournament);
    }, [homeData]);

    useEffect(() => {
        setActiveTournamentIndex(0);
    }, [tournaments]);

    useEffect(() => {
        if (tournaments.length <= 1) {
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            setActiveTournamentIndex((currentIndex) => (
                (currentIndex + 1) % tournaments.length
            ));
        }, 3000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [tournaments.length]);

    const safeTournamentIndex = tournaments.length > 0
        ? activeTournamentIndex % tournaments.length
        : 0;
    const featured = tournaments[safeTournamentIndex];
    const currentSeason = readField(homeData, 'currentSeason');
    const latestResult = readField(homeData, 'latestResult');
    const standings = readField(latestResult, 'standings');
    const leaderboardRows = Array.isArray(standings) ? standings : [];

    return (
        <PublicLayout showSearch={false}>
            <section className="relative min-h-[640px] overflow-hidden">
                <img
                    src={horseRacing}
                    alt="Elite horse racing"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-[rgba(255,247,245,0.38)]" />
                <div className="absolute inset-x-0 bottom-0 h-[230px] bg-gradient-to-b from-transparent to-[var(--racing-bg)]" />
                <div className="relative z-10 mx-auto flex min-h-[640px] max-w-5xl flex-col items-center justify-center px-6 text-center text-white">
                    <span className="mb-6 rounded-full border border-[#d9a19a] bg-[#e8f7ef]/90 px-4 py-2 text-xs font-black uppercase tracking-wide text-[var(--racing-primary)]">
                        {currentSeason
                            ? `${readField(currentSeason, 'seasonName')} · ${readField(currentSeason, 'status')}`
                            : 'Elite Racing League'}
                    </span>
                    <h1 className="max-w-4xl text-4xl font-black leading-tight drop-shadow-[0_5px_12px_rgba(0,0,0,0.28)] md:text-6xl">
                        Witness Elite Racing History Unfold
                    </h1>
                    <p className="mt-5 max-w-3xl text-base leading-7 text-white drop-shadow-[0_3px_9px_rgba(0,0,0,0.30)] md:text-lg">
                        Track public tournaments, race schedules, and official results from one place.
                    </p>
                    {currentSeason && (
                        <p className="mt-3 text-sm font-bold text-white drop-shadow-[0_3px_9px_rgba(0,0,0,0.30)]">
                            Current season: {formatDate(readField(currentSeason, 'startDate'))} – {formatDate(readField(currentSeason, 'endDate'))}
                        </p>
                    )}
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                        <Link to="/explore-tournaments" className="rounded-[6px] bg-[var(--racing-primary)] px-7 py-4 text-sm font-black text-white no-underline shadow-[0_14px_28px_rgba(16,185,129,0.25)] hover:bg-[var(--racing-primary-dark)]">
                            Explore Tournaments
                        </Link>
                        <Link to="/global-rankings" className="rounded-[6px] border border-[var(--racing-border)] bg-[#fffaf8] px-7 py-4 text-sm font-black text-[var(--racing-primary)] no-underline hover:bg-[#fff1ee]">
                            View Global Rankings
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-16 pt-8 md:px-11 md:pt-14">
                <div className="mb-7 flex flex-col gap-3 border-b border-[var(--racing-border)] pb-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="m-0 text-3xl font-black">Upcoming Tournaments</h2>
                        <p className="mt-2 text-sm text-[var(--racing-muted)]">Follow the next official races and published schedules.</p>
                    </div>
                    <Link to="/explore-tournaments" className="text-xs font-black uppercase tracking-wide text-[var(--racing-primary)] no-underline">View Calendar</Link>
                </div>

                {isLoading ? (
                    <div className="rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] px-6 py-14 text-center text-sm font-bold text-[var(--racing-muted)]">
                        Loading upcoming tournaments...
                    </div>
                ) : loadError ? (
                    <div className="rounded-[10px] border border-[#efb4ad] bg-[#fff4f2] px-6 py-10 text-center">
                        <p className="m-0 text-sm font-bold text-[#9b3a32]">{loadError}</p>
                        <button className="mt-4 rounded-[6px] border-0 bg-[var(--racing-primary)] px-5 py-2.5 text-sm font-black text-white" onClick={handleRetry} type="button">
                            Retry
                        </button>
                    </div>
                ) : featured ? (
                    <div
                        key={`${featured.id || featured.title}-${safeTournamentIndex}`}
                        className="upcoming-tournament-slide"
                    >
                        <article className="relative min-h-[345px] w-full overflow-hidden rounded-[8px] shadow-[0_18px_45px_rgba(70,32,26,0.13)] md:min-h-[500px]">
                            <img src={featured.image} alt={featured.title} className="absolute inset-0 h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                                <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold">
                                    <span className="rounded bg-[var(--racing-primary)] px-2.5 py-1.5">{featured.status}</span>
                                    <span className="rounded bg-white/90 px-2.5 py-1.5 text-[var(--racing-ink)]">
                                        <FaCalendarAlt className="mr-1 inline" /> {featured.date}
                                    </span>
                                </div>
                                <h3 className="m-0 text-3xl font-black">{featured.title}</h3>
                                <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/90">
                                    <span><FaMapMarkerAlt className="mr-1 inline" /> {featured.location}</span>
                                    <span><FaMoneyBillWave className="mr-1 inline" /> {featured.prize}</span>
                                    <span>{featured.distance}</span>
                                    <span>{featured.registered}</span>
                                </p>
                                <Link to={featured.link} className="mt-5 inline-flex rounded-[6px] bg-white px-5 py-2.5 text-sm font-black text-[var(--racing-primary)] no-underline">
                                    View Detail
                                </Link>
                            </div>
                        </article>

                    </div>
                ) : (
                    <div className="rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] px-6 py-14 text-center text-sm font-bold text-[var(--racing-muted)]">
                        No upcoming tournaments are currently available.
                    </div>
                )}

                <style>{`
                    @keyframes upcomingTournamentSlideIn {
                        from {
                            opacity: 0;
                            transform: translateX(32px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    .upcoming-tournament-slide {
                        animation: upcomingTournamentSlideIn 450ms ease-out;
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .upcoming-tournament-slide {
                            animation: none;
                        }
                    }
                `}</style>
            </section>

            <section className="border-y border-[var(--racing-border)] bg-[#eef4ff] px-6 py-16 md:px-11">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 text-center">
                        <h2 className="m-0 text-3xl font-black">Recent Results & Leaderboard</h2>
                        <p className="mt-2 text-sm text-[var(--racing-muted)]">Latest official placements from published races.</p>
                    </div>

                    {isLoading ? (
                        <div className="rounded-[10px] border border-[var(--racing-border)] bg-white px-6 py-14 text-center text-sm font-bold text-[var(--racing-muted)]">
                            Loading recent results...
                        </div>
                    ) : loadError ? (
                        <div className="rounded-[10px] border border-[#efb4ad] bg-[#fff4f2] px-6 py-10 text-center">
                            <p className="m-0 text-sm font-bold text-[#9b3a32]">Recent results could not be loaded.</p>
                            <button className="mt-4 rounded-[6px] border-0 bg-[var(--racing-primary)] px-5 py-2.5 text-sm font-black text-white" onClick={handleRetry} type="button">
                                Retry
                            </button>
                        </div>
                    ) : latestResult && leaderboardRows.length > 0 ? (
                        <div className="overflow-hidden rounded-[10px] border border-[var(--racing-border)] bg-white shadow-[0_20px_46px_rgba(15,23,42,0.08)]">
                            <div className="flex items-center justify-between gap-4 px-5 py-4">
                                <div>
                                    <h3 className="m-0 text-lg font-black">
                                        {readField(latestResult, 'raceName') || 'Latest Published Result'}
                                    </h3>
                                    {readField(latestResult, 'publishedAt') && (
                                        <p className="mb-0 mt-1 text-xs font-semibold text-[var(--racing-muted)]">
                                            Published {formatDate(readField(latestResult, 'publishedAt'))}
                                        </p>
                                    )}
                                </div>
                                <Link to={`/public/races/${readField(latestResult, 'raceId')}`} className="text-xs font-black uppercase tracking-wide text-[var(--racing-primary)] no-underline">
                                    Race Detail
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                                    <thead className="bg-[#f1f5ff] text-xs uppercase tracking-wide text-[var(--racing-muted)]">
                                        <tr>
                                            <th className="px-5 py-3">Position</th>
                                            <th className="px-5 py-3">Horse / Jockey</th>
                                            <th className="px-5 py-3">Owner</th>
                                            <th className="px-5 py-3">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboardRows.map((row, index) => {
                                            const position = readField(row, 'position') ?? index + 1;
                                            return (
                                                <tr key={readField(row, 'horseId') || position} className="border-t border-[#dce5ef]">
                                                    <td className="px-5 py-4"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#f7ce4b] text-sm font-black">{position}</span></td>
                                                    <td className="px-5 py-4">
                                                        <strong className="block">{readField(row, 'horseName')}</strong>
                                                        <span className="text-xs text-[var(--racing-muted)]">{readField(row, 'jockeyName') || '-'}</span>
                                                    </td>
                                                    <td className="px-5 py-4 text-[var(--racing-muted)]">{readField(row, 'ownerName') || '-'}</td>
                                                    <td className="px-5 py-4 font-mono font-bold">{readField(row, 'finishTimeSeconds') != null ? `${readField(row, 'finishTimeSeconds')}s` : '-'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-[10px] border border-[var(--racing-border)] bg-white px-6 py-14 text-center text-sm font-bold text-[var(--racing-muted)]">
                            No published race results are currently available.
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
