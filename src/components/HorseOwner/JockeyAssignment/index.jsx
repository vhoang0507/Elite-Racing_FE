import { useState } from "react";
import Sidebar from "../HorseOwnerDashboard/components/Sidebar";
import HorseInfo from "./components/HorseInfo";
import JockeyGrid from "./components/JockeyGrid";
import InvitationModal from "./components/InvitationModal";

export default function JockeyAssignment() {
    const [selectedJockey, setSelectedJockey] = useState(null);

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

                {/* Title */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div>
                        <h2 style={{ margin: 0 }}>Jockey Assignment</h2>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#999" }}>
                            Find the perfect match for your thoroughbred for the upcoming Derby Qualifiers.
                        </p>
                    </div>
                    <button style={{
                        backgroundColor: "#8B0000",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        cursor: "pointer",
                        fontSize: "14px",
                    }}>
                        Change tournament
                    </button>
                </div>

                {/* Tournament Info */}
                <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#666", marginBottom: "24px" }}>
                    <span>📅 12 Jun 2026 • 18:30 GST</span>
                    <span>📍 Dubai Meydan, UAE</span>
                    <span>📏 2400m</span>
                </div>

                {/* Filter Bar */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    <input
                        placeholder="Search jockey name..."
                        style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #ddd", width: "280px", fontSize: "13px" }}
                    />
                    <select style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px" }}>
                        <option>Health Status</option>
                        <option>Fit</option>
                        <option>Injured</option>
                        <option>Suspended</option>
                    </select>
                    <button style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: "13px" }}>Filter</button>
                    <button style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #d4edda", background: "#d4edda", color: "#155724", cursor: "pointer", fontSize: "13px" }}>Active</button>
                    <button style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #f8d7da", background: "#f8d7da", color: "#721c24", cursor: "pointer", fontSize: "13px" }}>Inactive</button>
                </div>

                {/* Main Content */}
                <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "20px", flex: 1 }}>
                    <HorseInfo />
                    <JockeyGrid onInvite={setSelectedJockey} />
                </div>

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

            {/* Modal */}
            {selectedJockey && (
                <InvitationModal
                    jockey={selectedJockey}
                    onClose={() => setSelectedJockey(null)}
                />
            )}
        </div>
    );
}