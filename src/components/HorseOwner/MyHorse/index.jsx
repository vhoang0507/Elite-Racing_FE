import { useNavigate } from "react-router-dom";
import Sidebar from "../HorseOwnerDashboard/components/Sidebar";
import HorseStats from "./components/HorseStats";
import HorseTable from "./components/HorseTable";

export default function MyHorse() {
    const navigate = useNavigate();

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
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

                {/* Title + Add Button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div>
                        <h2 style={{ margin: 0 }}>My Horse Directory</h2>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#999" }}>
                            Manage your horses, monitor health status, and register for tournaments.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/register-horse")}
                        style={{
                            backgroundColor: "#8B0000",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px 20px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "bold",
                        }}
                    >
                        + Add Horse
                    </button>
                </div>

                {/* Stats */}
                <div style={{ marginTop: "24px" }}>
                    <HorseStats />
                </div>

                {/* Table */}
                <HorseTable />

                {/* Spacer */}
                <div style={{ flex: 1 }} />

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