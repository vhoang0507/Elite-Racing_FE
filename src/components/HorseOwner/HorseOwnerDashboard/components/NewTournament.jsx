
const tournaments = [
    { name: "Derby Qualifiers", location: "Churchill Downs • Turf", date: "Oct 24, 2023" },
    { name: "Autumn Stakes", location: "Keeneland • Dirt", date: "Nov 02, 2023" },
];

export default function NewTournament() {
    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h3 style={{ margin: 0 }}>New Tournament</h3>
                <span style={styles.badge}>5 New</span>
            </div>
            <button style={styles.viewAll}>View All Tournament</button>

            <div style={styles.list}>
                {tournaments.map((t, i) => (
                    <div key={i} style={styles.card}>
                        <div style={styles.cardTop}>
                            <p style={styles.name}>{t.name}</p>
                            <span style={styles.date}>{t.date}</span>
                        </div>
                        <p style={styles.location}>{t.location}</p>
                        <button style={styles.detailBtn}>View Details</button>
                    </div>
                ))}
            </div>
        </section>
    );
}

const styles = {
    section: {
        backgroundColor: "#fff5f5",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid #eee",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
    },
    badge: {
        backgroundColor: "#8B0000",
        color: "#fff",
        fontSize: "11px",
        padding: "3px 8px",
        borderRadius: "10px",
    },
    viewAll: {
        background: "none",
        border: "none",
        color: "#8B0000",
        cursor: "pointer",
        fontSize: "13px",
        marginBottom: "16px",
        padding: 0,
    },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    card: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "14px",
        border: "1px solid #eee",
    },
    cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    name: { margin: 0, fontWeight: "bold", fontSize: "14px" },
    date: { fontSize: "12px", color: "#999" },
    location: { margin: "4px 0 10px", fontSize: "12px", color: "#888" },
    detailBtn: {
        width: "100%",
        padding: "8px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        background: "#fff",
        cursor: "pointer",
        fontSize: "13px",
    },
};