import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { ownerApi } from "../../../../api/ownerApi";

export default function ApprovedRegistrations() {
    const [data, setData] = useState([]);

    useEffect(() => {
        let mounted = true;
        ownerApi.getApprovedRegistrations()
            .then((res) => { if (mounted) setData(res); })
            .catch(() => {});
        return () => { mounted = false; };
    }, []);

    const getStatusStyle = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('ready')) return { bg: '#dff7e9', color: '#118548' };
        if (s.includes('approved')) return { bg: '#e3f2fd', color: '#1565c0' };
        if (s.includes('invited')) return { bg: '#fff3cd', color: '#856404' };
        return { bg: '#f5f5f5', color: '#555' };
    };

    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h3 style={{ margin: 0 }}>Approved Registrations</h3>
                <button style={styles.filterBtn}>
                    <FaFilter aria-hidden="true" />
                    Filter
                </button>
            </div>

            <div style={styles.tableWrap}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thead}>
                            <th style={styles.th}>Tournament</th>
                            <th style={styles.th}>Horse</th>
                            <th style={styles.th}>Jockey</th>
                            <th style={styles.th}>Race Date</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#999' }}>
                                    No approved registrations
                                </td>
                            </tr>
                        )}
                        {data.map((row, i) => {
                            const statusStyle = getStatusStyle(row.status);
                            return (
                                <tr key={row.registrationId || i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                                    <td style={styles.td}>{row.tournamentName}</td>
                                    <td style={styles.td}>{row.horseName}</td>
                                    <td style={styles.td}>{row.jockeyName || 'Pending selection'}</td>
                                    <td style={styles.td}>{row.raceDate}</td>
                                    <td style={styles.td}>
                                        <span style={{ ...styles.badge, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button style={styles.raceBtn}>Race Info</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

const styles = {
    section: {
        backgroundColor: "#fffefd",
        borderRadius: "8px",
        padding: "20px",
        border: "1px solid #edcfc9",
        marginBottom: "0",
        boxShadow: "0 12px 28px rgba(91, 26, 19, 0.05)",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        marginBottom: "16px",
    },
    filterBtn: {
        background: "#fffaf8",
        border: "1px solid #edcfc9",
        borderRadius: "8px",
        padding: "7px 12px",
        cursor: "pointer",
        fontSize: "13px",
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        color: "#650404",
        fontWeight: 700,
    },
    tableWrap: { width: "100%", overflowX: "auto" },
    table: { width: "100%", minWidth: "780px", borderCollapse: "collapse" },
    thead: { borderBottom: "1px solid #edcfc9" },
    th: { textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#705f5b", fontWeight: "700", textTransform: "uppercase" },
    td: { padding: "14px 12px", fontSize: "14px", borderBottom: "1px solid #f5f0ee" },
    trEven: { backgroundColor: "#fffefd" },
    trOdd: { backgroundColor: "#fff8f6" },
    badge: { padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700" },
    raceBtn: { backgroundColor: "#860707", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontSize: "13px", fontWeight: 700 },
};
