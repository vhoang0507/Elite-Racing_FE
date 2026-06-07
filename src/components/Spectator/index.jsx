import SpectatorSidebar from "./components/SpectatorSidebar";
import LiveRaceBanner from "./components/LiveRaceBanner";
import RewardsCenter from "./components/RewardsCenter";
import Tournaments from "./components/Tournaments";

const stats = [
    { label: "UPCOMING TOURNAMENTS", value: "12", icon: "📅" },
    { label: "PREDICTIONS SUBMITTED", value: "5", icon: "🎯" },
    { label: "REWARD POINTS", value: "1,250", icon: "⭐", suffix: "pts" },
];

export default function SpectatorDashboard() {
    return (
        <div style={{ display: "flex" }}>
            <SpectatorSidebar />
            <main style={{
                flex: 1,
                padding: "24px",
                backgroundColor: "#faf8f8",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
            }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <input
                        placeholder="Search records, horses, races..."
                        style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid #ddd", width: "280px", fontSize: "13px" }}
                    />
                    <div style={{ display: "flex", gap: "12px", fontSize: "20px" }}>
                        <span>🔔</span><span>👤</span>
                    </div>
                </div>

                {/* Title */}
                <h2 style={{ margin: "0 0 4px" }}>Dashboard</h2>
                <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#999" }}>
                    Follow tournaments, predict winners, earn rewards, and stay updated with live racing events.
                </p>

                {/* Stat Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                    {stats.map((s, i) => (
                        <div key={i} style={styles.statCard}>
                            <div>
                                <small style={styles.statLabel}>{s.label}</small>
                                <h2 style={styles.statValue}>{s.value} {s.suffix && <span style={{ fontSize: "14px", color: "#999" }}>{s.suffix}</span>}</h2>
                            </div>
                            <span style={{ fontSize: "28px" }}>{s.icon}</span>
                        </div>
                    ))}
                </div>

                {/* Live Race Banner */}
                <LiveRaceBanner />

                {/* Rewards Center */}
                <RewardsCenter />

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Footer */}
                <footer style={{
                    marginTop: "40px",
                    paddingTop: "20px",
                    borderTop: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
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

const styles = {
    statCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" },
    statLabel: { color: "#999", fontSize: "11px", fontWeight: "600" },
    statValue: { margin: "4px 0 0", fontSize: "28px", fontWeight: "bold" },
};