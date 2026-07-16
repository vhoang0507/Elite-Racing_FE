import { useEffect, useState } from "react";
import {
    FaClipboardList,
    FaEnvelopeOpenText,
    FaHorseHead,
    FaTrophy,
} from "react-icons/fa";
import HorseOwnerLayout from "../HorseOwnerLayout";
import StatCard from "./components/StatCard";
import ApprovedRegistrations from "./components/ApprovedRegistrations";
import MyHorses from "./components/MyHorses";
import NewTournament from "./components/NewTournament";
import { ownerApi } from "../../../api/ownerApi";
import { getAuthUser } from "../../../utils/tokenStorage";

export default function HorseOwnerDashboard() {
    const [stats, setStats] = useState({ totalHorse: 0, registrations: 0, pendingInvitations: 0, approvedRaces: 0 });
    const [loading, setLoading] = useState(true);
    const user = getAuthUser();

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

    const todayLabel = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date());

    const statCards = [
        { icon: FaHorseHead,          label: "Total Horse",        value: stats.totalHorse,         accent: "#16305c" },
        { icon: FaClipboardList,      label: "Registrations",      value: stats.registrations,      accent: "#b3893a" },
        { icon: FaEnvelopeOpenText,   label: "Pending Invitations", value: stats.pendingInvitations, accent: "#a4392f" },
        { icon: FaTrophy,             label: "Approved Races",     value: stats.approvedRaces,      accent: "#2f7d5c" },
    ];

    return (
        <HorseOwnerLayout activeKey="dashboard">
            <section className="page-shell">
                <div className="visual-banner flex flex-wrap items-end justify-between gap-4 px-7 py-6 max-[720px]:px-5">
                    <div className="relative z-[1]">
                        <span className="text-[0.72rem] font-black uppercase tracking-[0.08em] text-[var(--racing-gold-bright)]">
                            Horse Owner Console
                        </span>
                        <h2 className="m-0 mt-1.5 text-[1.9rem] leading-[1.15] max-[720px]:text-[1.5rem]">
                            Welcome back, {user?.fullName ?? "Horse Owner"}
                        </h2>
                        <p className="m-0 mt-1.5 text-[0.9rem] font-semibold text-[rgba(246,236,210,0.78)]">
                            Today is {todayLabel}. Here's what's happening with your stable.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <p className="text-[var(--admin-muted)]">Loading...</p>
                ) : (
                    <div className="grid grid-cols-4 gap-4 max-[1024px]:grid-cols-2 max-[720px]:grid-cols-1">
                        {statCards.map(s => <StatCard key={s.label} {...s} />)}
                    </div>
                )}

                <ApprovedRegistrations />

                <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
                    <MyHorses />
                    <NewTournament />
                </div>
            </section>
        </HorseOwnerLayout>
    );
}
