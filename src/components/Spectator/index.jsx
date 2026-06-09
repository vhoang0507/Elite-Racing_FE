import SpectatorLayout from "./SpectatorLayout";
import LiveRaceBanner from "./components/LiveRaceBanner";
import RewardsCenter from "./components/RewardsCenter";

const stats = [
    { label: "UPCOMING TOURNAMENTS", value: "12", icon: "📅" },
    { label: "PREDICTIONS SUBMITTED", value: "5", icon: "🎯" },
    { label: "REWARD POINTS", value: "1,250", icon: "⭐", suffix: "pts" },
];

export default function SpectatorDashboard() {
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

                <LiveRaceBanner />
                <RewardsCenter />
            </section>
        </SpectatorLayout>
    );
}
