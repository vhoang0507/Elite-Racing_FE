import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";

const STATUS_CFG = {
    Pending:   { bg: '#fef9c3', color: '#92400e', border: '#fde68a' },
    Rejected:  { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
    Cancelled: { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
};

export default function PendingRegistrations({ onViewStatus }) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setLoading(true);
        ownerApi.getPendingRegistrations()
            .then(setData)
            .catch((err) => {
                if (!handleOwnerAccessError(err, navigate)) setData([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredData = search.trim()
        ? data.filter(row =>
            [row.tournamentName, row.horseName, row.seasonName, row.seasonStatus, row.registrationDeadline]
                .some(v => String(v || '').toLowerCase().includes(search.trim().toLowerCase()))
          )
        : data;

    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <div>
                    <p style={styles.title}>Pending Approval Registrations</p>
                    <p style={styles.sub}>{data.length} registration{data.length !== 1 ? 's' : ''} awaiting review</p>
                </div>
                <span style={styles.badge}>⏳ Waiting for Admin review</span>
            </div>

            <div style={{ marginBottom: 12 }}>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search tournament or horse..."
                    style={styles.searchInput}
                />
            </div>

            {loading ? (
                <p style={styles.center}>Loading...</p>
            ) : (
                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.headRow}>
                                {["Tournament", "Horse", "Reg Date", "Status", "Note", "Action"].map(h => (
                                    <th key={h} style={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={styles.emptyCell}>
                                        {data.length === 0 ? 'No pending registrations' : 'No registrations match your search.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((row, i) => {
                                    const cfg = STATUS_CFG[row.status] ?? { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
                                    return (
                                        <tr key={row.registrationId} style={{ ...styles.row, backgroundColor: i % 2 === 0 ? '#fff' : '#faf7f5' }}>
                                            <td style={styles.td}>
                                                <span style={styles.bold}>{row.tournamentName}</span>
                                                {(row.seasonName || row.seasonStatus) && (
                                                    <span style={styles.blockMuted}>
                                                        Season: {row.seasonName || "N/A"}{row.seasonStatus ? ` (${row.seasonStatus})` : ""}
                                                    </span>
                                                )}
                                                {row.registrationDeadline && (
                                                    <span style={styles.blockMuted}>Deadline: {row.registrationDeadline}</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>{row.horseName}</td>
                                            <td style={styles.td}><span style={styles.date}>{row.regDate}</span></td>
                                            <td style={styles.td}>
                                                <span style={{ ...styles.statusBadge, backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td style={styles.td}><span style={styles.note}>{row.adminNote || "—"}</span></td>
                                            <td style={styles.td}>
                                                <button
                                                    style={styles.viewBtn}
                                                    onClick={() => onViewStatus && onViewStatus(row.registrationId)}
                                                    type="button"
                                                >
                                                    View Status
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e8ddd9", overflow: "hidden", marginBottom: 24 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", backgroundColor: "#faf7f5", borderBottom: "1px solid #f0ebe8" },
    title: { margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" },
    sub: { margin: "2px 0 0", fontSize: 12, color: "#94a3b8" },
    badge: { fontSize: 12, backgroundColor: "#fef9c3", color: "#856404", padding: "4px 10px", borderRadius: 10, fontWeight: 600 },
    searchInput: { height: 34, width: "100%", maxWidth: 320, borderRadius: 8, border: "1px solid #e8ddd9", padding: "0 12px", fontSize: "0.82rem", outline: "none", boxSizing: "border-box", margin: "12px 20px 0" },
    center: { textAlign: "center", color: "#999", padding: "24px 0" },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse" },
    headRow: { backgroundColor: "#f8f4f2" },
    th: { textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", borderBottom: "1px solid #e8ddd9" },
    row: { borderBottom: "1px solid #f0ebe8" },
    td: { padding: "12px 16px", fontSize: 13, verticalAlign: "middle" },
    bold: { fontWeight: 600, color: "#1e293b" },
    blockMuted: { display: "block", marginTop: 3, fontSize: 11, color: "#64748b", fontWeight: 600 },
    date: { fontSize: 12, color: "#64748b" },
    note: { fontSize: 12, color: "#94a3b8", fontStyle: "italic" },
    statusBadge: { fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px", display: "inline-block" },
    emptyCell: { textAlign: "center", padding: "28px", color: "#94a3b8", fontSize: 13 },
    viewBtn: { border: "1px solid #e8ddd9", borderRadius: 8, backgroundColor: "#fff", padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151" },
};
