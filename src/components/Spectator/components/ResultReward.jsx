import { useState, useEffect } from 'react';
import { spectatorApi } from '../../../api/spectatorApi';

export default function ResultReward() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        spectatorApi.getSpectatorRewards()
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={{ textAlign: 'center', color: '#999' }}>Loading...</p>;

    return (
        <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: "bold" }}>Results & Rewards</h2>
            <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#999" }}>
                View race results, earn prediction points, and redeem exclusive racing rewards.
            </p>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Correct Predictions", value: data?.correctPredictions ?? 0, icon: "✅" },
                    { label: "Reward Points", value: data?.rewardPoints ?? 0, icon: "🏆" },
                    { label: "Prediction Accuracy", value: `${data?.predictionAccuracy ?? 0}%`, icon: "🎯" },
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
                        <span style={styles.progressLabel}>Current: {data?.rewardPoints ?? 0} pts</span>
                    </div>
                    <div style={styles.progressBg}>
                        <div style={{ ...styles.progressFill, width: `${Math.min(100, (data?.rewardPoints ?? 0) / 20)}%` }} />
                    </div>
                    <p style={styles.progressHint}>Keep predicting to earn more points!</p>
                </div>

                {/* Point History */}
                <div style={styles.card}>
                    <h3 style={{ margin: "0 0 16px" }}>POINT HISTORY</h3>
                    {data?.pointHistory?.length === 0 || !data?.pointHistory ? (
                        <p style={{ color: '#999', fontSize: '13px' }}>No point history yet.</p>
                    ) : (
                        data.pointHistory.map((p, i) => (
                            <div key={i} style={styles.historyRow}>
                                <div>
                                    <p style={styles.historyLabel}>Correct Prediction</p>
                                    <small style={{ color: "#999" }}>{p.raceName}</small>
                                </div>
                                <span style={styles.historyPoints}>+{p.points}</span>
                            </div>
                        ))
                    )}
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
};