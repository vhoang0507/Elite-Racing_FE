const stats = [
    { label: "PREDICTIONS SUBMITTED", value: "24", extra: "+3 today" },
    { label: "PREDICTION ACCURACY", value: "82%", extra: "——" },
    { label: "REWARD POINTS", value: "1,250", icon: "🏆" },
    { label: "GLOBAL RANKING", value: "#12", extra: "Top 1%" },
];

const horses = [
    { name: "Midnight Blaze", jockey: "Marcus Sterling", rank: 1, speed: 95, endurance: 91 },
    { name: "Desert Thunder", jockey: "Elena Vance", rank: 2, speed: 89, endurance: 94 },
];

const predictions = [
    { name: "Midnight Blaze", value: 80, color: "#8B0000" },
    { name: "Desert Thunder", value: 40, color: "#8B0000" },
    { name: "Velvet Shadow", value: 30, color: "#8B0000" },
    { name: "Others", value: 20, color: "#ddd" },
];

export default function Predictions() {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h2 style={{ margin: "0 0 4px" }}>Predictions</h2>
                    <p style={{ margin: 0, fontSize: "13px", color: "#999" }}>
                        Predict race outcomes, compete with spectators, and earn exclusive rewards.
                    </p>
                </div>
                <button style={styles.filterBtn}>⚙ Filter</button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {stats.map((s, i) => (
                    <div key={i} style={styles.statCard}>
                        <small style={styles.statLabel}>{s.label}</small>
                        <h3 style={styles.statValue}>{s.value}</h3>
                        {s.extra && <small style={{ color: "#999", fontSize: "11px" }}>{s.extra}</small>}
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>

                {/* Left */}
                <div>
                    {/* Race Banner */}
                    <div style={styles.banner}>
                        <img src="/DubaiSprintCup.jpg" alt="race" style={styles.bannerImg} />
                        <div style={styles.bannerOverlay}>
                            <span style={styles.majorTag}>MAJOR EVENT</span>
                            <span style={styles.closingTag}>⏰ Prediction closes in 2 Days</span>
                            <h2 style={styles.bannerTitle}>Dubai Sprint Cup</h2>
                            <p style={styles.bannerPrize}>💰 PRIZE POOL $2,000,000</p>
                            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                                <button style={styles.predictBtn}>Make Prediction</button>
                                <button style={styles.viewBtn}>View Tournament</button>
                            </div>
                        </div>
                    </div>

                    {/* Top Contenders */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h3 style={{ margin: 0 }}>Top Contenders Analysis</h3>
                            <button style={styles.compareBtn}>Compare All</button>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            {horses.map((h, i) => (
                                <div key={i} style={styles.horseCard}>
                                    <small style={{ color: "#8B0000", fontWeight: "600" }}>RANKED #{h.rank}</small>
                                    <p style={styles.horseName}>{h.name}</p>
                                    <div style={styles.barRow}>
                                        <span style={styles.barLabel}>Speed</span>
                                        <div style={styles.barBg}><div style={{ ...styles.barFill, width: `${h.speed}%` }} /></div>
                                        <span style={styles.barVal}>{h.speed}/100</span>
                                    </div>
                                    <div style={styles.barRow}>
                                        <span style={styles.barLabel}>Endurance</span>
                                        <div style={styles.barBg}><div style={{ ...styles.barFill, width: `${h.endurance}%` }} /></div>
                                        <span style={styles.barVal}>{h.endurance}/100</span>
                                    </div>
                                    <small style={{ color: "#999", fontSize: "11px" }}>Jockey: {h.jockey}</small>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Predict Top 3 */}
                    <div style={{ ...styles.card, marginTop: "16px" }}>
                        <h3 style={{ margin: "0 0 16px" }}>Predict Top 3 Finishes</h3>
                        {[1, 2, 3].map(n => (
                            <div key={n} style={styles.predictRow}>
                                <div style={styles.rankCircle}>{n}</div>
                                {n === 1
                                    ? <div style={styles.selectedHorse}>
                                        <p style={{ margin: 0, fontWeight: "bold" }}>Midnight Blaze</p>
                                        <small style={{ color: "#999" }}>Marcus Sterling</small>
                                    </div>
                                    : <div style={styles.selectBox}>Select {n === 2 ? "2nd" : "3rd"} Place...</div>
                                }
                            </div>
                        ))}
                        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                            <button style={styles.submitBtn}>Submit Prediction</button>
                            <button style={styles.saveDraftBtn}>Save Draft</button>
                        </div>
                        <button style={styles.resetBtn}>Reset Prediction</button>
                    </div>
                </div>

                {/* Right - AI Insight */}
                <div>
                    <div style={styles.aiCard}>
                        <h4 style={{ margin: "0 0 8px", fontSize: "13px" }}>🤖 AI Prediction Insight</h4>
                        <small style={{ color: "#999" }}>TOP RECOMMENDATION</small>
                        <h3 style={{ margin: "4px 0 16px", color: "#8B0000" }}>Midnight Blaze</h3>
                        <h4 style={{ margin: "0 0 12px", fontSize: "13px" }}>Total Predictions</h4>
                        {predictions.map((p, i) => (
                            <div key={i} style={{ marginBottom: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                                    <span>{p.name}</span>
                                    <span>{p.value}</span>
                                </div>
                                <div style={styles.barBg}>
                                    <div style={{ ...styles.barFill, width: `${p.value}%`, backgroundColor: p.color }} />
                                </div>
                            </div>
                        ))}
                        <small style={{ color: "#999", fontSize: "11px" }}>Total Predictions: 170 prediction</small>
                    </div>
                </div>

            </div>
        </div>
    );
}

const styles = {
    filterBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: "13px" },
    statCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "16px", border: "1px solid #eee" },
    statLabel: { color: "#999", fontSize: "11px", fontWeight: "600" },
    statValue: { margin: "4px 0 2px", fontSize: "22px", fontWeight: "bold" },
    banner: { position: "relative", borderRadius: "12px", overflow: "hidden", marginBottom: "16px" },
    bannerImg: { width: "100%", height: "180px", objectFit: "cover" },
    bannerOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to right, rgba(0,0,0,0.85) 60%, transparent)", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center" },
    majorTag: { backgroundColor: "#8B0000", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "4px", width: "fit-content", marginBottom: "4px" },
    closingTag: { color: "rgba(255,255,255,0.8)", fontSize: "12px", marginBottom: "8px" },
    bannerTitle: { color: "#fff", margin: "0 0 4px", fontSize: "22px" },
    bannerPrize: { color: "rgba(255,255,255,0.8)", margin: 0, fontSize: "13px" },
    predictBtn: { backgroundColor: "#8B0000", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "13px" },
    viewBtn: { backgroundColor: "transparent", color: "#fff", border: "1px solid #fff", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "13px" },
    card: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee" },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
    compareBtn: { background: "none", border: "none", color: "#8B0000", cursor: "pointer", fontSize: "13px" },
    horseCard: { backgroundColor: "#faf8f8", borderRadius: "8px", padding: "14px" },
    horseName: { margin: "4px 0 12px", fontWeight: "bold", fontSize: "15px" },
    barRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" },
    barLabel: { fontSize: "12px", color: "#999", width: "70px" },
    barBg: { flex: 1, height: "6px", backgroundColor: "#eee", borderRadius: "3px" },
    barFill: { height: "6px", backgroundColor: "#8B0000", borderRadius: "3px" },
    barVal: { fontSize: "12px", color: "#555", width: "50px", textAlign: "right" },
    predictRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" },
    rankCircle: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#8B0000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 },
    selectedHorse: { flex: 1, backgroundColor: "#fff5f5", borderRadius: "8px", padding: "10px", border: "1px solid #ffcccc" },
    selectBox: { flex: 1, backgroundColor: "#faf8f8", borderRadius: "8px", padding: "10px", border: "1px dashed #ddd", color: "#999", fontSize: "13px" },
    submitBtn: { flex: 1, padding: "10px", backgroundColor: "#8B0000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
    saveDraftBtn: { flex: 1, padding: "10px", backgroundColor: "#fff", color: "#333", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
    resetBtn: { width: "100%", padding: "10px", backgroundColor: "#fff", color: "#999", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontSize: "14px", marginTop: "8px" },
    aiCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee" },
};