import { useState } from "react";
import Sidebar from "../HorseOwnerDashboard/components/Sidebar";

const notifications = [
    {
        id: 1,
        type: "registration",
        icon: "🟡",
        title: "Registration Approved",
        desc: "Desert Thunder for Dubai Sprint Cup",
        time: "2 mins ago",
        status: "APPROVED",
        statusColor: { bg: "#d4edda", color: "#155724" },
        read: false,
    },
    {
        id: 2,
        type: "jockey",
        icon: "🔵",
        title: "Invitation Accepted",
        desc: "Julian de la Cruz has confirmed for seasonal duty.",
        time: "15 mins ago",
        status: "CONFIRMED",
        statusColor: { bg: "#d1ecf1", color: "#0c5460" },
        read: false,
    },
    {
        id: 3,
        type: "registration",
        icon: "🔴",
        title: "Registration Returned",
        desc: "Update health documents for Pegasus Derby entry.",
        time: "1 hr ago",
        status: "RETURNED",
        statusColor: { bg: "#f8d7da", color: "#721c24" },
        read: true,
    },
];

const tabs = ["All", "Registrations", "Jockeys", "Tournaments"];

export default function Notifications() {
    const [activeTab, setActiveTab] = useState("All");

    const filtered = notifications.filter(n => {
        if (activeTab === "All") return true;
        if (activeTab === "Registrations") return n.type === "registration";
        if (activeTab === "Jockeys") return n.type === "jockey";
        return true;
    });

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
                <h2 style={{ margin: "0 0 4px" }}>Notifications</h2>
                <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#999" }}>
                    Stay updated with tournaments, race schedules, jockey responses
                </p>

                {/* Stat Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                    {[
                        { label: "UNREAD", value: 12, icon: "📬" },
                        { label: "INVITATIONS", value: 3, icon: "👤" },
                        { label: "UPCOMING RACES", value: 5, icon: "📅" },
                    ].map((s, i) => (
                        <div key={i} style={styles.statCard}>
                            <span style={{ fontSize: "20px" }}>{s.icon}</span>
                            <div>
                                <small style={{ color: "#999", fontSize: "11px" }}>{s.label}</small>
                                <h3 style={{ margin: 0, fontSize: "24px" }}>{s.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={styles.tabBar}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            style={{
                                ...styles.tab,
                                backgroundColor: activeTab === tab ? "#8B0000" : "transparent",
                                color: activeTab === tab ? "#fff" : "#555",
                            }}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                    <button style={styles.viewAll}>View All</button>
                </div>

                {/* Notification List */}
                <div style={styles.list}>
                    {filtered.map((n, i) => (
                        <div key={i} style={styles.notifCard}>
                            <span style={{ fontSize: "24px" }}>{n.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <p style={styles.notifTitle}>{n.title}</p>
                                    {!n.read && <span style={styles.unreadDot} />}
                                </div>
                                <p style={styles.notifDesc}>{n.desc}</p>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                                    <span style={{ fontSize: "11px", color: "#999" }}>⏰ {n.time}</span>
                                    <span style={{ ...styles.badge, backgroundColor: n.statusColor.bg, color: n.statusColor.color }}>
                                        {n.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
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
        </div>
    );
}

const styles = {
    statCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee", display: "flex", alignItems: "center", gap: "16px" },
    tabBar: { display: "flex", gap: "4px", marginBottom: "16px", alignItems: "center", backgroundColor: "#fff", borderRadius: "10px", padding: "4px", border: "1px solid #eee" },
    tab: { padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "500" },
    viewAll: { marginLeft: "auto", background: "none", border: "none", color: "#8B0000", cursor: "pointer", fontSize: "13px" },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    notifCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "16px", border: "1px solid #eee", display: "flex", gap: "16px", alignItems: "flex-start" },
    notifTitle: { margin: 0, fontWeight: "600", fontSize: "14px" },
    notifDesc: { margin: "4px 0 0", fontSize: "13px", color: "#666" },
    unreadDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#8B0000" },
    badge: { fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: "500" },
};