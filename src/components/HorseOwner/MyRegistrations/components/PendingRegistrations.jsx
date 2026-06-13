import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";

export default function PendingRegistrations() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        ownerApi.getPendingRegistrations()
            .then(setData)
            .catch((err) => {
                if (!handleOwnerAccessError(err, navigate)) setData([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={{ textAlign: "center", color: "#999" }}>Loading...</p>;

    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h3 style={{ margin: 0 }}>Pending Approval Registrations</h3>
                <span style={styles.badge}>⏳ Waiting for Admin review</span>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        {["Tournament", "Horse", "Reg Date", "Status", "Note", "Action"].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#999" }}>
                                No pending registrations
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr key={row.registrationId} style={styles.tr}>
                                <td style={styles.td}>{row.tournamentName}</td>
                                <td style={styles.td}>{row.horseName}</td>
                                <td style={styles.td}>{row.regDate}</td>
                                <td style={styles.td}>
                                    <span style={styles.pendingBadge}>{row.status}</span>
                                </td>
                                <td style={styles.td}>{row.adminNote || "-"}</td>
                                <td style={styles.td}>
                                    <button style={styles.viewBtn}>View Status</button>
                                </td>
                            </tr>
                        ))
                    )}
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