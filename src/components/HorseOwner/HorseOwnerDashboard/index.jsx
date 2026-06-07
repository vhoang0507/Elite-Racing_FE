import HorseOwnerLayout from "../HorseOwnerLayout";
import StatCard from "./components/StatCard";
import ApprovedRegistrations from "./components/ApprovedRegistrations";
import MyHorses from "./components/MyHorses";
import NewTournament from "./components/NewTournament";

const stats = [
    { icon: "🐴", label: "Total Horse", value: 24 },
    { icon: "📋", label: "Registrations", value: 8 },
    { icon: "✉️", label: "Pending Invitations", value: 16 },
    { icon: "🏆", label: "Approved Races", value: 3 },
];

export default function HorseOwnerDashboard() {
    return (
        <HorseOwnerLayout activeKey="dashboard">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary-dark)]">Dashboard Overview</h2>

                <div className="grid grid-cols-4 gap-4 max-[1024px]:grid-cols-2 max-[720px]:grid-cols-1">
                    {stats.map(s => <StatCard key={s.label} {...s} />)}
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
