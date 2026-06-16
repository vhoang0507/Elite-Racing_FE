import { useEffect, useState } from "react";
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
                <button style={styles.filterBtn}>⚙ Filter</button>
            </div>

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
                        <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#999' }}>No approved registrations</td></tr>
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
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #edcfc9", marginBottom: "0" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
    filterBtn: { background: "none", border: "1px solid #edcfc9", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "13px" },
    table: { width: "100%", borderCollapse: "collapse" },
    thead: { borderBottom: "1px solid #edcfc9" },
    th: { textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#705f5b", fontWeight: "600", textTransform: "uppercase" },
    td: { padding: "14px 12px", fontSize: "14px", borderBottom: "1px solid #f5f0ee" },
    trEven: { backgroundColor: "#fffefd" },
    trOdd: { backgroundColor: "#fff8f6" },
    badge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
    raceBtn: { backgroundColor: "#860707", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontSize: "13px" },
};
