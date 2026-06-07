import Sidebar from "../HorseOwnerDashboard/components/Sidebar";
import OpenTournaments from "./components/OpenTournaments";
import PendingRegistrations from "./components/PendingRegistrations";
import ApprovedRegistrations from "./components/ApprovedRegistrations";
import RegistrationJourney from "./components/RegistrationJourney";

export default function MyRegistrations() {
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
                <h2 style={{ margin: "0 0 4px" }}>Registration Central</h2>
                <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#999" }}>
                    Manage your horse entries for the season's most prestigious equine events.
                </p>

                {/* Components */}
                <OpenTournaments />
                <PendingRegistrations />
                <ApprovedRegistrations />
                <RegistrationJourney />

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