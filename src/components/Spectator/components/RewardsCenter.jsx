const rewards = [
    { name: "VIP Tournament Ticket", desc: "Full access pass to upcoming Dubai finals.", points: 2000, locked: true, icon: "🎫" },
    { name: "Elite Racing Cap", desc: "Limited edition performance apparel.", points: 500, locked: false, icon: "🧢" },
    { name: "Limited Edition Hoddies", desc: "Limited edition performance apparel.", points: 1000, locked: false, icon: "👕" },
];

export default function RewardsCenter() {
    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <div>
                    <h3 style={{ margin: 0 }}>Rewards Center</h3>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#999" }}>
                        Redeem your hard-earned points for exclusive perks.
                    </p>
                </div>
                <div style={styles.pointsBox}>
                    <small style={{ color: "#999", fontSize: "11px" }}>CURRENT POINTS</small>
                    <p style={styles.points}>1,250 pts</p>
                </div>
            </div>

            <div style={styles.grid}>
                {rewards.map((r, i) => (
                    <div key={i} style={styles.card}>
                        <div style={styles.iconBox}>
                            <span style={{ fontSize: "32px" }}>{r.icon}</span>
                        </div>
                        <p style={styles.rewardName}>{r.name}</p>
                        <p style={styles.rewardDesc}>{r.desc}</p>
                        <div style={styles.cardFooter}>
                            <span style={styles.rewardPoints}>{r.points} pts</span>
                            {r.locked
                                ? <span style={styles.lockedBtn}>Locked</span>
                                : <button style={styles.redeemBtn}>Redeem Now</button>
                            }
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee", marginBottom: "24px" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
    pointsBox: { textAlign: "right" },
    points: { margin: "2px 0 0", fontWeight: "bold", fontSize: "18px", color: "#8B0000" },
    grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
    card: { backgroundColor: "#faf8f8", borderRadius: "10px", padding: "20px", border: "1px solid #eee" },
    iconBox: { backgroundColor: "#fff", borderRadius: "8px", padding: "16px", textAlign: "center", marginBottom: "12px" },
    rewardName: { margin: "0 0 4px", fontWeight: "bold", fontSize: "14px" },
    rewardDesc: { margin: "0 0 12px", fontSize: "12px", color: "#999" },
    cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    rewardPoints: { fontWeight: "bold", fontSize: "14px", color: "#8B0000" },
    lockedBtn: { fontSize: "12px", color: "#999", backgroundColor: "#eee", padding: "4px 12px", borderRadius: "6px" },
    redeemBtn: { backgroundColor: "#8B0000", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontSize: "13px" },
};