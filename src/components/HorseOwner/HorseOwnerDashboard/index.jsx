import Sidebar from "./components/Sidebar";
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
        <div style={{ display: "flex" }}>
            <Sidebar />
            <main style={{ flex: 1, padding: "24px", backgroundColor: "#faf8f8" }}>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                    <input
                        placeholder="Search records, horses, races..."
                        style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid #ddd", width: "280px", fontSize: "13px" }}
                    />
                    <div style={{ display: "flex", gap: "12px", fontSize: "20px" }}>
                        <span>🔔</span><span>👤</span>
                    </div>
                </div>

                <h2 style={{ marginBottom: "16px" }}>Dashboard Overview</h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                    {stats.map(s => <StatCard key={s.label} {...s} />)}
                </div>

                <ApprovedRegistrations />

                {/* Bottom row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <MyHorses />
                    <NewTournament />
                </div>
                {/* Footer */}
                <footer style={{
                    marginTop: "40px",
                    paddingTop: "20px",
                    borderTop: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12px",
                    color: "#999",
                }}>
                    <span style={{ fontWeight: "bold", color: "#8B0000" }}>Elite Racing League</span>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <a href="#" style={{ color: "#999", textDecoration: "none" }}>Terms of Service</a>
                        <a href="#" style={{ color: "#999", textDecoration: "none" }}>Privacy Policy</a>
                        <a href="#" style={{ color: "#999", textDecoration: "none" }}>Contact Support</a>
                        <a href="#" style={{ color: "#999", textDecoration: "none" }}>Racing Rules</a>
                    </div>
                </footer>
            </main>
        </div>
    );
}