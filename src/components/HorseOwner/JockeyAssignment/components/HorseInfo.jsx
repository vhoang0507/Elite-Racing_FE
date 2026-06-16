export default function HorseInfo() {
    return (
        <div style={styles.wrapper}>
            {/* Horse Info */}
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <span>Horse Info</span>
                    <span style={styles.infoIcon}>ℹ</span>
                </div>
                <div style={styles.horseRow}>
                    <img src="/Horse1.jpg" alt="horse" style={styles.horseImg} />
                    <div>
                        <p style={styles.horseName}>Desert Thunder</p>
                        <p style={styles.horseBreed}>Arabian</p>
                        <span style={styles.healthBadge}>HEALTHY</span>
                    </div>
                </div>
                <div style={styles.statsGrid}>
                    <div><small style={styles.statLabel}>WEIGHT</small><p style={styles.statValue}>520kg</p></div>
                    <div><small style={styles.statLabel}>HEIGHT</small><p style={styles.statValue}>168cm</p></div>
                    <div><small style={styles.statLabel}>AGE</small><p style={styles.statValue}>5 years</p></div>
                    <div><small style={styles.statLabel}>STATUS</small><p style={{ ...styles.statValue, color: "green" }}>Active</p></div>
                </div>
            </div>

            {/* AI Recommended */}
            <div style={{ ...styles.card, marginTop: "16px" }}>
                <div style={styles.aiHeader}>
                    <span>🤖 AI Recommended Jockeys</span>
                </div>

                <div style={styles.aiCard}>
                    <div style={styles.aiBadge}>PERFECT MATCH • 97.3%</div>
                    <p style={{ margin: "8px 0 4px", fontSize: "13px" }}>
                        Marcus Thorne is statistically significant 14% higher win rate since paired with high-temperament stallions like "Desert Thunder".
                    </p>
                </div>

                <div style={{ marginTop: "12px" }}>
                    <p style={styles.perfLabel}>— PERFORMANCE EVIDENCE —</p>
                    <div style={styles.perfRow}><span>Distance Skill</span><span style={{ color: "green" }}>+8.2%</span></div>
                    <div style={styles.perfRow}><span>Breed Skill</span><span>Top 1%</span></div>
                    <div style={styles.perfRow}><span>Points</span><span>95.4</span></div>
                </div>

                <div style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}>
                    — SUMMARY —<br />
                    <span>Raced with Marcus Thorne • 67%</span>
                </div>
            </div>
        </div>
    );
}

const styles = {
    wrapper: { display: "flex", flexDirection: "column" },
    card: { backgroundColor: "#fff", borderRadius: "12px", padding: "16px", border: "1px solid #eee" },
    cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", fontWeight: "600" },
    infoIcon: { color: "#999", cursor: "pointer" },
    horseRow: { display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" },
    horseImg: { width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" },
    horseName: { margin: 0, fontWeight: "bold", fontSize: "14px" },
    horseBreed: { margin: "2px 0", fontSize: "12px", color: "#999" },
    healthBadge: { backgroundColor: "#d4edda", color: "#155724", fontSize: "10px", padding: "2px 8px", borderRadius: "10px" },
    statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
    statLabel: { color: "#999", fontSize: "11px" },
    statValue: { margin: "2px 0 0", fontWeight: "600", fontSize: "14px" },
    aiHeader: { fontSize: "13px", fontWeight: "600", marginBottom: "12px" },
    aiCard: { backgroundColor: "#fff5f5", borderRadius: "8px", padding: "12px", border: "1px solid #ffcccc" },
    aiBadge: { backgroundColor: "#8B0000", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "10px", display: "inline-block" },
    perfLabel: { fontSize: "11px", color: "#999", textAlign: "center", margin: "0 0 8px" },
    perfRow: { display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" },
};