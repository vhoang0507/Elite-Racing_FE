const stats = [
    { label: "Total Horses", value: "12", icon: "🐴" },
    { label: "Active Horses", value: "08", icon: "✅" },
    { label: "Injured Horses", value: "02", icon: "🏥" },
    { label: "In Races", value: "05", icon: "🏆" },
];

export default function HorseStats() {
    return (
        <div style={styles.grid}>
            {stats.map((s, i) => (
                <div key={i} style={styles.card}>
                    <span style={styles.icon}>{s.icon}</span>
                    <div>
                        <p style={styles.label}>{s.label}</p>
                        <h2 style={styles.value}>{s.value}</h2>
                    </div>
                </div>
            ))}
        </div>
    );
}

const styles = {
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "24px",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    icon: { fontSize: "28px" },
    label: { margin: 0, fontSize: "12px", color: "#999" },
    value: { margin: 0, fontSize: "28px", fontWeight: "bold", color: "#111" },
};