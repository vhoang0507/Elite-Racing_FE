import { useEffect, useState } from "react";
import HorseOwnerLayout from "../HorseOwnerLayout";
import StatCard from "./components/StatCard";
import ApprovedRegistrations from "./components/ApprovedRegistrations";
import MyHorses from "./components/MyHorses";
import NewTournament from "./components/NewTournament";
import { ownerApi } from "../../../api/ownerApi";

export default function HorseOwnerDashboard() {
    const [stats, setStats] = useState({ totalHorse: 0, registrations: 0, pendingInvitations: 0, approvedRaces: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        ownerApi.getDashboardOverview()
            .then((data) => {
                if (mounted) setStats(data);
            })
            .catch(() => {})
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    const statCards = [
        { icon: "🐴", label: "Total Horse", value: stats.totalHorse },
        { icon: "📋", label: "Registrations", value: stats.registrations },
        { icon: "✉️", label: "Pending Invitations", value: stats.pendingInvitations },
        { icon: "🏆", label: "Approved Races", value: stats.approvedRaces },
    ];

    return (
        <HorseOwnerLayout activeKey="dashboard">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary-dark)]">Dashboard Overview</h2>

                {loading && <p className="text-[var(--admin-muted)]">Loading...</p>}

                <div className="grid grid-cols-4 gap-4 max-[1024px]:grid-cols-2 max-[720px]:grid-cols-1">
                    {statCards.map(s => <StatCard key={s.label} {...s} />)}
                </div>

                <ApprovedRegistrations />

                <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
                    <MyHorses />
                    <NewTournament />
                </div>
            </section>
        </HorseOwnerLayout>
    );
}
