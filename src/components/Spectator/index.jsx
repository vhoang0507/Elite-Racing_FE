import { useState, useEffect } from 'react';
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
        { label: "UPCOMING TOURNAMENTS", value: data?.upcomingTournaments ?? '-', icon: "📅" },
        { label: "PREDICTIONS SUBMITTED", value: data?.predictionsSubmitted ?? '-', icon: "🎯" },
        { label: "REWARD POINTS", value: data?.rewardPoints ?? '-', icon: "⭐", suffix: "pts" },
    ];

    const featured = data?.featuredTournament;

    return (
        <SpectatorLayout activeKey="dashboard">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <div>
                    <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary-dark)]">Dashboard</h2>
                    <p className="m-0 mt-1 text-[0.85rem] text-[var(--admin-muted)]">
                        Follow tournaments, predict winners, earn rewards, and stay updated with live racing events.
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
                    {stats.map((s, i) => (
                        <div key={i} className="flex items-center justify-between rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                            <div>
                                <small className="text-[0.7rem] font-bold uppercase text-[var(--admin-muted)]">{s.label}</small>
                                <h2 className="m-0 mt-1 text-[1.8rem] text-[var(--admin-ink)]">
                                    {s.value} {s.suffix && <span className="text-[0.85rem] text-[var(--admin-muted)]">{s.suffix}</span>}
                                </h2>
                            </div>
                            <span className="text-[1.5rem]">{s.icon}</span>
                        </div>
                    ))}
                </div>

                {/* Featured Tournament Banner */}
                {featured && (
                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #8B0000 0%, #3d1a1a 100%)', height: '200px', display: 'flex', alignItems: 'center', padding: '24px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>
                                        {featured.status}
                                    </span>
                                </div>
                                <h2 style={{ color: '#fff', margin: '0 0 12px', fontSize: '26px' }}>{featured.tournamentName}</h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                                    {featured.location && <span>📍 {featured.location}</span>}
                                    {featured.race?.raceDate && <span>📅 {featured.race.raceDate?.slice(0, 10)}</span>}
                                    {featured.race?.distanceMeters && <span>📏 {featured.race.distanceMeters}m</span>}
                                    {featured.prizePool && <span>💰 ${Number(featured.prizePool).toLocaleString()}</span>}
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                    <button style={{ backgroundColor: '#fff', color: '#8B0000', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                                        Make Prediction
                                    </button>
                                    <button style={{ backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px' }}>
                                        View Tournament
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rewards Center */}
                <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                    <h3 className="m-0 mb-2 text-[1rem] font-bold">Rewards Center</h3>
                    <p className="m-0 text-[0.85rem] text-[var(--admin-muted)]">
                        Earn points by making correct predictions and redeem them for exclusive rewards.
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <small className="text-[0.7rem] font-bold uppercase text-[var(--admin-muted)]">Current Points</small>
                            <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary)]">{data?.rewardPoints ?? 0} pts</h2>
                        </div>
                        <button className="rounded-[var(--admin-radius)] bg-[var(--admin-primary)] px-5 py-2 font-bold text-white">
                            View Rewards
                        </button>
                    </div>
                </div>
            </section>
        </SpectatorLayout>
    );
}