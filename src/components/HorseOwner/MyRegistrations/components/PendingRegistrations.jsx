import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHourglassHalf } from "react-icons/fa";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";
import Toast from "../../../shared/Toast";
import { useToast } from "../../../shared/useToast";
import WithdrawModal from "./WithdrawModal";

const humanizeLabel = (value) => String(value || "").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();

const STATUS_CFG = {
    Pending:   { bg: '#faf2e0', color: '#8a6209', border: '#eddcb0' },
    Rejected:  { bg: '#f3e1df', color: '#a4392f', border: '#e3bcb7' },
    Cancelled: { bg: '#f3e1df', color: '#a4392f', border: '#e3bcb7' },
};

export default function PendingRegistrations({ onViewStatus }) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [actionId, setActionId] = useState(null);
    const [withdrawTarget, setWithdrawTarget] = useState(null);
    const { toast, showToast, hideToast } = useToast();

    const loadData = useCallback(() => {
        setLoading(true);
        ownerApi.getPendingRegistrations()
            .then(setData)
            .catch((err) => {
                if (!handleOwnerAccessError(err, navigate)) setData([]);
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const confirmWithdraw = async (row, reason) => {
        setActionId(row.registrationId);

        try {
            await ownerApi.withdrawRegistration(row.registrationId, reason);
            setWithdrawTarget(null);
            showToast("Registration withdrawn successfully.", "success");
            loadData();
        } catch (err) {
            if (!handleOwnerAccessError(err, navigate)) {
                throw err;
            }
        } finally {
            setActionId(null);
        }
    };

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
                <span style={{ ...styles.badge, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <FaHourglassHalf aria-hidden="true" size={10} /> Waiting for Admin review
                </span>
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
                                    const cfg = STATUS_CFG[row.status] ?? { bg: 'var(--admin-surface-strong)', color: 'var(--admin-primary)', border: 'var(--admin-border)' };
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
                                                    {humanizeLabel(row.status)}
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
                                                <button
                                                    disabled={actionId === row.registrationId}
                                                    onClick={() => setWithdrawTarget(row)}
                                                    style={{ ...styles.withdrawBtn, ...(actionId === row.registrationId ? styles.disabledBtn : {}) }}
                                                    type="button"
                                                >
                                                    {actionId === row.registrationId ? "Withdrawing..." : "Withdraw"}
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

            <Toast message={toast.message} type={toast.type} title={toast.title} onClose={hideToast} />
            <WithdrawModal
                onClose={() => setWithdrawTarget(null)}
                onConfirm={confirmWithdraw}
                target={withdrawTarget}
            />
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e8ddd9", overflow: "hidden", marginBottom: 24 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", backgroundColor: "#faf7f5", borderBottom: "1px solid #f0ebe8" },
    title: { margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" },
    sub: { margin: "2px 0 0", fontSize: 12, color: "#94a3b8" },
    badge: { fontSize: 12, backgroundColor: "#faf2e0", color: "#8a6209", padding: "4px 10px", borderRadius: 10, fontWeight: 600 },
    searchInput: { height: 34, width: "100%", maxWidth: 320, borderRadius: 999, border: "1px solid #ded2ad", padding: "0 14px", fontSize: "0.82rem", outline: "none", boxSizing: "border-box", margin: "12px 20px 0" },
    center: { textAlign: "center", color: "#999", padding: "24px 0" },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse" },
    headRow: { backgroundColor: "#efe8d6" },
    th: { textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", borderBottom: "2px solid #c8a24a" },
    row: { borderBottom: "1px solid #f0ebe8" },
    td: { padding: "12px 16px", fontSize: 13, verticalAlign: "middle" },
    bold: { fontWeight: 600, color: "#1e293b" },
    blockMuted: { display: "block", marginTop: 3, fontSize: 11, color: "#64748b", fontWeight: 600 },
    date: { fontSize: 12, color: "#64748b" },
    note: { fontSize: 12, color: "#94a3b8", fontStyle: "italic" },
    statusBadge: { fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px", display: "inline-block" },
    emptyCell: { textAlign: "center", padding: "28px", color: "#94a3b8", fontSize: 13 },
    viewBtn: { border: "1px solid #ded2ad", borderRadius: 999, backgroundColor: "#fff", padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#16305c" },
    withdrawBtn: { border: "1px solid #e3bcb7", borderRadius: 999, backgroundColor: "#fff", color: "#a4392f", cursor: "pointer", fontSize: 12, fontWeight: 600, marginLeft: 6, padding: "5px 14px" },
    disabledBtn: { cursor: "not-allowed", opacity: 0.65 },
};
