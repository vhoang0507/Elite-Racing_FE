const rewards = [
    { name: "Elite Racing T-Shirt", points: 800, img: "/tee.jpg", status: "redeem" },
    { name: "Premium Racing Hoodie", points: 2000, img: "/hoddie.jpg", status: "insufficient" },
    { name: "Elite Racing Jacket", points: 3500, img: "/jacket.jpg", status: "insufficient" },
    { name: "Racing Cap", points: 500, img: "/cap.jpg", status: "redeem" },
];

const pointHistory = [
    { label: "Correct Prediction", sub: "Dubai Sprint Cup", points: "+150" },
    { label: "Daily Participation", sub: "Daily Streaks", points: "+50" },
    { label: "Bonus Reward", sub: "First Week Login", points: "+200" },
];

export default function ResultReward() {
    return (
        <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: "bold" }}>Results & Rewards</h2>
            <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#999" }}>
                View race results, earn prediction points, and redeem exclusive racing rewards.
            </p>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Correct Predictions", value: "24", icon: "✅" },
                    { label: "Reward Points", value: "1,250", icon: "🏆" },
                    { label: "Prediction Accuracy", value: "82%", icon: "🎯" },
                ].map((s, i) => (
                    <div key={i} style={styles.statCard}>
                        <span style={{ fontSize: "24px" }}>{s.icon}</span>
                        <div>
                            <small style={styles.statLabel}>{s.label}</small>
                            <h3 style={styles.statValue}>{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                {/* Reward Progress */}
                <div style={styles.card}>
                    <h3 style={{ margin: "0 0 16px" }}>Reward Progress</h3>
                    <div style={styles.progressRow}>
                        <span style={styles.progressLabel}>Current: 1,250 pts</span>
                    </div>
                    <div style={styles.progressBg}>
                        <div style={{ ...styles.progressFill, width: "62%" }} />
                    </div>
                    <p style={styles.progressHint}>750 pts more to unlock: <strong>Elite Racing Hoodie</strong></p>
                </div>

                {/* Point History */}
                <div style={styles.card}>
                    <h3 style={{ margin: "0 0 16px" }}>POINT HISTORY</h3>
                    {pointHistory.map((p, i) => (
                        <div key={i} style={styles.historyRow}>
                            <div>
                                <p style={styles.historyLabel}>{p.label}</p>
                                <small style={{ color: "#999" }}>{p.sub}</small>
                            </div>
                            <span style={styles.historyPoints}>{p.points}</span>
                        </div>
                    ))}
                    <button style={styles.viewFullBtn}>View Full Statement</button>
                </div>
            </div>

            {/* Redeem Rewards */}
            <div style={styles.card}>
                <div style={styles.redeemHeader}>
                    <h3 style={{ margin: 0 }}>Redeem Rewards</h3>
                    <span style={styles.storeLink}>🏪 Official Merchandise Store</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "16px" }}>
                    {rewards.map((r, i) => (
                        <div key={i} style={styles.rewardCard}>
                            <img src={r.img} alt={r.name} style={styles.rewardImg} />
                            <p style={styles.rewardName}>{r.name}</p>
                            <p style={styles.rewardPoints}>{r.points} pts</p>
                            <button style={{
                                ...styles.redeemBtn,
                                backgroundColor: r.status === "redeem" ? "#8B0000" : "#eee",
                                color: r.status === "redeem" ? "#fff" : "#999",
                                cursor: r.status === "redeem" ? "pointer" : "not-allowed",
                            }}>
                                {r.status === "redeem" ? "Redeem" : "Insufficient Points"}
                            </button>
                            <button style={styles.detailsBtn}>View Details</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    statCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee", display: "flex", alignItems: "center", gap: "16px" },
    statLabel: { color: "#999", fontSize: "11px", fontWeight: "600" },
    statValue: { margin: "4px 0 0", fontSize: "24px", fontWeight: "bold" },
    card: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee" },
    progressRow: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
    progressLabel: { fontSize: "13px", fontWeight: "600" },
    progressBg: { height: "8px", backgroundColor: "#eee", borderRadius: "4px", marginBottom: "8px" },
    progressFill: { height: "8px", backgroundColor: "#8B0000", borderRadius: "4px" },
    progressHint: { fontSize: "12px", color: "#999", margin: 0 },
    historyRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f5f5f5" },
    historyLabel: { margin: 0, fontSize: "13px", fontWeight: "500" },
    historyPoints: { color: "#155724", fontWeight: "bold", fontSize: "14px" },
    viewFullBtn: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff", cursor: "pointer", fontSize: "13px", marginTop: "12px" },
    redeemHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    storeLink: { fontSize: "13px", color: "#8B0000", cursor: "pointer" },
    rewardCard: { border: "1px solid #eee", borderRadius: "10px", overflow: "hidden" },
    rewardImg: { width: "100%", height: "120px", objectFit: "cover" },
    rewardName: { margin: "10px 10px 4px", fontSize: "13px", fontWeight: "600" },
    rewardPoints: { margin: "0 10px 10px", fontSize: "14px", fontWeight: "bold", color: "#8B0000" },
    redeemBtn: { width: "calc(100% - 20px)", margin: "0 10px 8px", padding: "8px", border: "none", borderRadius: "6px", fontSize: "12px" },
    detailsBtn: { width: "calc(100% - 20px)", margin: "0 10px 10px", padding: "8px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", cursor: "pointer", fontSize: "12px" },
};