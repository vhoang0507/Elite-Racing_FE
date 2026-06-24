import { useEffect, useState } from 'react';
import {
    FaCalendarAlt,
    FaFlagCheckered,
    FaHorseHead,
    FaMapMarkerAlt,
    FaRulerHorizontal,
    FaTrophy,
    FaUsers,
} from 'react-icons/fa';
import { spectatorApi } from '../../../api/spectatorApi';

export default function Tournaments() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        spectatorApi.getSpectatorTournaments()
            .then(setTournaments)
            .catch(() => setTournaments([]))
            .finally(() => setLoading(false));
    }, []);

    const stats = [
        { label: "PUBLISHED", value: tournaments.length, icon: FaCalendarAlt },
        { label: "UPCOMING RACES", value: tournaments.filter(t => t.race?.status === 'Open' || t.race?.status === 'Scheduled').length, icon: FaFlagCheckered },
        { label: "PARTICIPATING HORSES", value: "-", icon: FaHorseHead },
        { label: "PROF. JOCKEYS", value: "-", icon: FaUsers },
    ];

    const featured = tournaments[0];
    const rest = tournaments.slice(1);

    if (loading) return <p className="m-0 text-center font-semibold text-[var(--admin-muted)]">Loading...</p>;

    return (
        <div className="grid gap-7">
            <div>
                <h2 className="page-title">Tournaments</h2>
                <p className="page-subtitle">
                    Explore upcoming events, analyze lineups, and predict champions.
                </p>
            </div>

            <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
                {stats.map((s) => {
                    const Icon = s.icon;

                    return (
                        <article key={s.label} className="stat-card min-h-[118px]">
                            <div className="stat-icon">
                                <Icon aria-hidden="true" />
                            </div>
                            <small className="stat-label">{s.label}</small>
                            <h3 className="stat-value text-[1.8rem]">{s.value}</h3>
                        </article>
                    );
                })}
            </div>

            {featured && (
                <div className="visual-banner min-h-[220px] p-6">
                    <div className="relative z-[1] flex min-h-[172px] flex-col justify-center">
                        <span className="mb-3 w-fit rounded-[6px] bg-white/20 px-3 py-1 text-[0.72rem] font-black uppercase text-white">
                            {featured.status}
                        </span>
                        <h2 className="m-0 text-[1.8rem] font-black leading-tight text-white">{featured.tournamentName}</h2>
                        <div className="mt-4 flex flex-wrap gap-4 text-[0.86rem] text-white/85">
                            {featured.prizePool && <span className="inline-flex items-center gap-2"><FaTrophy /> ${Number(featured.prizePool).toLocaleString()}</span>}
                            {featured.location && <span className="inline-flex items-center gap-2"><FaMapMarkerAlt /> {featured.location}</span>}
                            {featured.race?.raceDate && <span className="inline-flex items-center gap-2"><FaCalendarAlt /> {featured.race.raceDate?.slice(0, 10)}</span>}
                            {featured.race?.distanceMeters && <span className="inline-flex items-center gap-2"><FaRulerHorizontal /> {featured.race.distanceMeters}m</span>}
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <button className="secondary-button border-white bg-white text-[#8B0000]">Predict Winner</button>
                            <button className="secondary-button border-white/70 bg-transparent text-white hover:bg-white/10">View Details</button>
                        </div>
                    </div>
                </div>
            )}

            {rest.length > 0 && (
                <div className="grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
                    {rest.map((t) => (
                        <article key={t.tournamentId} className="surface-card">
                            <div className="visual-banner grid h-[140px] place-items-center rounded-none shadow-none">
                                <FaTrophy className="relative z-[1] text-[2.6rem] text-white" aria-hidden="true" />
                            </div>
                            <div className="grid gap-3 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="m-0 font-bold text-[var(--admin-ink)]">{t.tournamentName}</p>
                                        <p className="m-0 mt-1 text-[0.82rem] text-[var(--admin-muted)]">
                                            {t.race?.distanceMeters ? `${t.race.distanceMeters}m` : '-'} / {t.race?.raceDate?.slice(0, 10) ?? '-'}
                                        </p>
                                    </div>
                                    <span className="font-black text-[var(--admin-primary)]">
                                        {t.prizePool ? `$${Number(t.prizePool).toLocaleString()}` : '-'}
                                    </span>
                                </div>
                                <p className="m-0 text-[0.82rem] text-[var(--admin-muted)]">{t.location}</p>
                                <span className={`status-badge w-fit ${t.status === 'OpenRegistration' ? 'bg-[#d4edda] text-[#155724]' : 'bg-[#fff3cd] text-[#856404]'}`}>
                                    {t.status}
                                </span>
                                <button className="secondary-button w-full">More Details</button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {tournaments.length === 0 && (
                <p className="m-0 rounded-[8px] border border-[var(--admin-border)] bg-white p-10 text-center text-[var(--admin-muted)]">
                    No tournaments available.
                </p>
            )}
        </div>
    );
}
