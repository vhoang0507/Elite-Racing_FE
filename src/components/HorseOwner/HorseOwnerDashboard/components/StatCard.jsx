export default function StatCard({ icon, label, value }) {
    return (
        <div style={styles.card}>
            <span style={styles.icon}>{icon}</span>
            <p style={styles.label}>{label}</p>
            <h2 style={styles.value}>{value}</h2>
        </div>
    );
}

const styles = {
    card: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid #eee",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    icon: { fontSize: "24px" },
    label: { margin: 0, fontSize: "13px", color: "#999" },
    value: { margin: 0, fontSize: "28px", fontWeight: "bold", color: "#111" },
};