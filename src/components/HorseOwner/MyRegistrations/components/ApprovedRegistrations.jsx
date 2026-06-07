const data = [
    { tournament: "Silverstone Stakes", horse: "Storm Breaker", jockey: "Marcus Vane", raceDate: "Oct 02, 2024", status: "Ready to Race" },
    { tournament: "Emerald Mile", horse: "Golden Hoof", jockey: "Pending selection", raceDate: "Nov 12, 2024", status: "Approved" },
    { tournament: "Bordeaux Grand Prix", horse: "Elysian Field", jockey: "Sofia Rossi", raceDate: "Oct 28, 2024", status: "Jockey Invited" },
];

const statusColor = {
    "Ready to Race": { bg: "#d4edda", color: "#155724" },
    "Approved": { bg: "#d1ecf1", color: "#0c5460" },
    "Jockey Invited": { bg: "#fff3cd", color: "#856404" },
};

export default function ApprovedRegistrations() {
    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h3 style={{ margin: 0 }}>Approved Registrations</h3>
                <button style={styles.filterBtn}>⚙ Filter</button>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        {["Tournament", "Horse", "Jockey", "Race Date", "Status", "Action"].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} style={styles.tr}>
                            <td style={styles.td}>{row.tournament}</td>
                            <td style={styles.td}>{row.horse}</td>
                            <td style={styles.td}>{row.jockey}</td>
                            <td style={styles.td}>{row.raceDate}</td>
                            <td style={styles.td}>
                                <span style={{ ...styles.badge, ...statusColor[row.status] }}>
                                    {row.status}
                                </span>
                            </td>
                            <td style={styles.td}>
                                <button style={styles.raceBtn}>Race Info</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee", marginBottom: "24px" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
    filterBtn: { background: "none", border: "1px solid #ddd", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "13px" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase", borderBottom: "1px solid #eee" },
    tr: { borderBottom: "1px solid #f5f5f5" },
    td: { padding: "12px", fontSize: "14px" },
    badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
    raceBtn: { backgroundColor: "#8B0000", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontSize: "13px" },
};