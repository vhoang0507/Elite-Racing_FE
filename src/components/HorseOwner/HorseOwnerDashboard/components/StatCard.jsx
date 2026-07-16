export default function StatCard({ icon: Icon, label, value, accent = "#16305c" }) {
    const lightAccent = accent + "18"; // ~10% opacity version of accent

    return (
        <div style={styles.card}>
            {/* Top accent bar */}
            <div style={{ ...styles.accentBar, backgroundColor: accent }} />

            <div style={styles.body}>
                {/* Icon badge */}
                <div style={{ ...styles.iconBadge, backgroundColor: lightAccent, color: accent }}>
                    {Icon ? <Icon aria-hidden="true" style={styles.icon} /> : null}
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
        border: "1px solid #ded2ad",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
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
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    icon: {
        fontSize: "22px",
        lineHeight: 1,
    },
    textGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    label: {
        margin: 0,
        fontSize: "0.78rem",
        color: "#6b6456",
        fontWeight: 700,
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
