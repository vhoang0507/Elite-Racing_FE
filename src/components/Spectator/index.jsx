import { useEffect, useState } from 'react';
import {
    FaBullseye,
    FaCalendarAlt,
    FaCoins,
    FaMapMarkerAlt,
    FaRulerHorizontal,
    FaTrophy,
} from 'react-icons/fa';
import SpectatorLayout from "./SpectatorLayout";
import { spectatorApi } from "../../api/spectatorApi";

export default function SpectatorDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        spectatorApi.getSpectatorDashboard()
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    const stats = [
        { label: "UPCOMING TOURNAMENTS", value: data?.upcomingTournaments ?? '-', icon: FaCalendarAlt, tone: "primary" },
        { label: "PREDICTIONS SUBMITTED", value: data?.predictionsSubmitted ?? '-', icon: FaBullseye, tone: "blue" },
        { label: "REWARD POINTS", value: data?.rewardPoints ?? '-', icon: FaCoins, suffix: "pts", tone: "gold" },
    ];

    const featured = data?.featuredTournament;

    return (
        <SpectatorLayout activeKey="dashboard">
            <section className="page-shell">
                <div>
                    <h2 className="page-title">Dashboard</h2>
                    <p className="page-subtitle">
                        Follow tournaments, predict winners, earn rewards, and stay updated with live racing events.
                    </p>
                </div>

                {loading && <p className="m-0 font-semibold text-[var(--admin-muted)]">Loading...</p>}

                <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
                    {stats.map((s) => {
                        const Icon = s.icon;

                        return (
                            <article key={s.label} className="stat-card">
                                <div className={`stat-icon ${s.tone === 'blue' ? 'bg-[#e3f2fd] text-[#1565c0]' : s.tone === 'gold' ? 'bg-[#fff3cd] text-[#856404]' : ''}`}>
                                    <Icon aria-hidden="true" />
                                </div>
                                <small className="stat-label">{s.label}</small>
                                <h2 className="stat-value">
                                    {s.value} {s.suffix && <span className="text-[0.85rem] text-[var(--admin-muted)]">{s.suffix}</span>}
                                </h2>
                            </article>
                        );
                    })}
                </div>

                {featured && (
                    <div className="visual-banner min-h-[210px] p-6">
                        <div className="relative z-[1] flex min-h-[162px] flex-col justify-center">
                            <div className="mb-3 flex flex-wrap gap-2">
                                <span className="rounded-[6px] bg-white/20 px-3 py-1 text-[0.72rem] font-black uppercase text-white">
                                    {featured.status}
                                </span>
                            </div>
                            <h2 className="m-0 text-[1.7rem] font-black leading-tight text-white">{featured.tournamentName}</h2>
                            <div className="mt-4 flex flex-wrap gap-4 text-[0.86rem] text-white/85">
                                {featured.location && <span className="inline-flex items-center gap-2"><FaMapMarkerAlt /> {featured.location}</span>}
                                {featured.race?.raceDate && <span className="inline-flex items-center gap-2"><FaCalendarAlt /> {featured.race.raceDate?.slice(0, 10)}</span>}
                                {featured.race?.distanceMeters && <span className="inline-flex items-center gap-2"><FaRulerHorizontal /> {featured.race.distanceMeters}m</span>}
                                {featured.prizePool && <span className="inline-flex items-center gap-2"><FaTrophy /> ${Number(featured.prizePool).toLocaleString()}</span>}
                            </div>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <button className="secondary-button border-white bg-white text-[#8B0000]">
                                    Make Prediction
                                </button>
                                <button className="secondary-button border-white/70 bg-transparent text-white hover:bg-white/10">
                                    View Tournament
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="soft-card p-5">
                    <h3 className="m-0 mb-2 text-[1rem] font-bold">Rewards Center</h3>
                    <p className="m-0 text-[0.9rem] text-[var(--admin-muted)]">
                        Earn points by making correct predictions and redeem them for exclusive rewards.
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-stretch">
                        <div>
                            <small className="stat-label">Current Points</small>
                            <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary)]">{data?.rewardPoints ?? 0} pts</h2>
                        </div>
                        <button className="primary-button">
                            View Rewards
                        </button>
                    </div>
                </div>
            </section>
        </SpectatorLayout>
    );
}
