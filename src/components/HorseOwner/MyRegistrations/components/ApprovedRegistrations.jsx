import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";

const statusColor = {
    "ReadyToRace": { bg: "#d4edda", color: "#155724" },
    "Approved": { bg: "#d1ecf1", color: "#0c5460" },
    "JockeyInvited": { bg: "#fff3cd", color: "#856404" },
};

export default function ApprovedRegistrations() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        ownerApi.getApprovedRegistrationsList()
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
                <h3 style={{ margin: 0 }}>Approved Registrations</h3>
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
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#999" }}>
                                No approved registrations
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr key={row.registrationId} style={styles.tr}>
                                <td style={styles.td}>{row.tournamentName}</td>
                                <td style={styles.td}>{row.horseName}</td>
                                <td style={styles.td}>{row.jockeyName || "Pending selection"}</td>
                                <td style={styles.td}>{row.raceDate}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: statusColor[row.status]?.bg ?? "#eee",
                                        color: statusColor[row.status]?.color ?? "#333",
                                    }}>
                                        {row.status}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button style={styles.raceBtn}>Race Info</button>
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
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase", borderBottom: "1px solid #eee" },
    tr: { borderBottom: "1px solid #f5f5f5" },
    td: { padding: "12px", fontSize: "14px" },
    badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
    raceBtn: { backgroundColor: "#8B0000", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontSize: "13px" },
};