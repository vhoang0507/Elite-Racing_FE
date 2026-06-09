const tabs = ["All (22)", "Tournaments", "Predictions", "Results", "Rewards", "Live Alerts"];

const notifications = [
    {
        id: 1,
        type: "alert",
        icon: "🔴",
        title: "Prediction Deadline Approaching",
        desc: "Submit your prediction for Dubai Sprint Cup before Jun 10, 2026. Stakes are high for elite tiers.",
        time: "2 hours ago",
        status: "ACTIVE",
        statusColor: { bg: "#d4edda", color: "#155724" },
        action: "Predict Now",
        actionColor: "#8B0000",
    },
    {
        id: 2,
        type: "results",
        icon: "🟡",
        title: "Official Results Released",
        desc: "Dubai Sprint Cup results are now available. Check your placement and updated league ranking.",
        time: "Today, 10:45 AM",
        status: "PUBLISHED",
        statusColor: { bg: "#d1ecf1", color: "#0c5460" },
        action: "View Results",
        actionColor: "#333",
    },
    {
        id: 3,
        type: "rewards",
        icon: "🟢",
        title: "Reward Redemption Successful",
        desc: "You successfully redeemed the Elite Racing Cap. Shipping details sent to your registered email.",
        time: "Yesterday",
        status: "COMPLETED",
        statusColor: { bg: "#d4edda", color: "#155724" },
        action: "View Reward",
        actionColor: "#333",
    },
];

const stats = [
    { label: "UNREAD ALERTS", value: "12", icon: "🔔" },
    { label: "PREDICTION ALERTS", value: "05", icon: "🎯" },
    { label: "REWARDS PENDING", value: "03", icon: "⭐" },
];

export default function SpectatorNotifications() {
    return (
        <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: "bold" }}>Notifications</h2>
            <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#999" }}>
                Stay updated with live races, prediction events, tournament news, and exclusive spectator rewards.
            </p>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {stats.map((s, i) => (
                    <div key={i} style={styles.statCard}>
                        <span style={{ fontSize: "24px" }}>{s.icon}</span>
                        <div>
                            <small style={styles.statLabel}>{s.label}</small>
                            <h3 style={styles.statValue}>{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={styles.tabBar}>
                {tabs.map((tab, i) => (
                    <button key={i} style={{ ...styles.tab, ...(i === 0 ? styles.activeTab : {}) }}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div style={styles.list}>
                {notifications.map((n, i) => (
                    <div key={i} style={{
                        ...styles.notifCard,
                        borderLeft: n.type === "alert" ? "3px solid #8B0000" : "3px solid transparent",
                        backgroundColor: n.type === "alert" ? "#fff5f5" : "#fff",
                    }}>
                        <span style={{ fontSize: "24px" }}>{n.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <p style={styles.notifTitle}>{n.title}</p>
                                <span style={{ ...styles.badge, backgroundColor: n.statusColor.bg, color: n.statusColor.color }}>
                                    {n.status}
                                </span>
                            </div>
                            <p style={styles.notifDesc}>{n.desc}</p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                                <span style={{ fontSize: "11px", color: "#999" }}>⏰ {n.time}</span>
                                <button style={{ ...styles.actionBtn, color: n.actionColor === "#8B0000" ? "#fff" : "#333", backgroundColor: n.actionColor === "#8B0000" ? "#8B0000" : "#fff", border: n.actionColor === "#8B0000" ? "none" : "1px solid #ddd" }}>
                                    {n.action}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    statCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee", display: "flex", alignItems: "center", gap: "16px" },
    statLabel: { color: "#999", fontSize: "11px", fontWeight: "600" },
    statValue: { margin: "4px 0 0", fontSize: "28px", fontWeight: "bold" },
    tabBar: { display: "flex", gap: "4px", marginBottom: "16px", backgroundColor: "#fff", borderRadius: "10px", padding: "4px", border: "1px solid #eee", flexWrap: "wrap" },
    tab: { padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", background: "transparent", color: "#555" },
    activeTab: { backgroundColor: "#8B0000", color: "#fff" },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    notifCard: { borderRadius: "12px", padding: "16px", border: "1px solid #eee", display: "flex", gap: "16px", alignItems: "flex-start" },
    notifTitle: { margin: 0, fontWeight: "600", fontSize: "14px" },
    notifDesc: { margin: "4px 0 0", fontSize: "13px", color: "#666" },
    badge: { fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: "500", whiteSpace: "nowrap" },
    actionBtn: { padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "500" },
};