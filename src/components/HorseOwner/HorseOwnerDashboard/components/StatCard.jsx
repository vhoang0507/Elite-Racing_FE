export default function StatCard({ icon, label, value, accent = "#0b7f5a" }) {
    const lightAccent = accent + "18"; // ~10% opacity version of accent

    return (
        <div style={styles.card}>
            {/* Top accent bar */}
            <div style={{ ...styles.accentBar, backgroundColor: accent }} />

            <div style={styles.body}>
                {/* Icon badge */}
                <div style={{ ...styles.iconBadge, backgroundColor: lightAccent }}>
                    <span style={styles.icon}>{icon}</span>
                </div>

                {/* Text */}
                <div style={styles.textGroup}>
                    <p style={styles.label}>{label}</p>
                    <h2 style={{ ...styles.value, color: accent }}>{value}</h2>
                </div>
            </div>
        </div>
    );
}

const styles = {
    card: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #dce5ef",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 8px rgba(16,185,129,0.06)",
    },
    accentBar: {
        height: "4px",
        width: "100%",
    },
    body: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "20px 22px",
    },
    iconBadge: {
        width: "52px",
        height: "52px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    icon: {
        fontSize: "26px",
        lineHeight: 1,
    },
    textGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    label: {
        margin: 0,
        fontSize: "0.82rem",
        color: "#9e8e8a",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
    },
    value: {
        margin: 0,
        fontSize: "2rem",
        fontWeight: 800,
        lineHeight: 1,
    },
};
