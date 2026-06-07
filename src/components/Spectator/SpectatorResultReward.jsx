import SpectatorSidebar from "./components/SpectatorSidebar";
import ResultReward from "./components/ResultReward";

export default function SpectatorResultReward() {
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <input
                        placeholder="Search records, horses, races..."
                        style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid #ddd", width: "280px", fontSize: "13px" }}
                    />
                    <div style={{ display: "flex", gap: "12px", fontSize: "20px" }}>
                        <span>🔔</span><span>👤</span>
                    </div>
                </div>

                <ResultReward />

                <div style={{ flex: 1 }} />

                <footer style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#999" }}>
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