const data = [
    { tournament: "Grosvenor Classic", horse: "Crimson Thunder", regDate: "Sep 15, 2024", status: "Pending" },
    { tournament: "Emirates Masters", horse: "Midnight Runner", regDate: "Sep 18, 2024", status: "Pending" },
];

export default function PendingRegistrations() {
    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h3 style={{ margin: 0 }}>Pending Approval Registrations</h3>
                <span style={styles.badge}>⏳ Waiting for Admin review</span>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        {["Tournament", "Horse", "Reg Date", "Status", "Action"].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} style={styles.tr}>
                            <td style={styles.td}>{row.tournament}</td>
                            <td style={styles.td}>{row.horse}</td>
                            <td style={styles.td}>{row.regDate}</td>
                            <td style={styles.td}>
                                <span style={styles.pendingBadge}>{row.status}</span>
                            </td>
                            <td style={styles.td}>
                                <button style={styles.viewBtn}>View Status</button>
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
    badge: { fontSize: "12px", backgroundColor: "#fff3cd", color: "#856404", padding: "4px 10px", borderRadius: "10px" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase", borderBottom: "1px solid #eee" },
    tr: { borderBottom: "1px solid #f5f5f5" },
    td: { padding: "12px", fontSize: "14px" },
    pendingBadge: { backgroundColor: "#fff3cd", color: "#856404", padding: "3px 10px", borderRadius: "20px", fontSize: "12px" },
    viewBtn: { background: "none", border: "1px solid #ddd", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", fontSize: "13px" },
};