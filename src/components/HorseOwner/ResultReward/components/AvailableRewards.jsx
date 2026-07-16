import { formatCurrency } from "../../../../utils/currency";

const statusStyle = {
    ReadyToClaim: { backgroundColor: "#e8f7ee", color: "#16864f" },
    UnderReview: { backgroundColor: "#faf2e0", color: "#8a6209" },
    Paid: { backgroundColor: "#efe8d6", color: "#6b6456" },
};

function formatStatus(status) {
    if (status === "ReadyToClaim") return "READY TO CLAIM";
    if (status === "UnderReview") return "UNDER REVIEW";
    return status?.toUpperCase();
}

function ordinal(n) {
    if (!n) return "—";
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function AvailableRewards({ rewards, loading, onClaim, claimingId }) {
    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <span>Available Rewards</span>
            </div>

            {loading && <p style={{ color: "#999", fontSize: "0.8rem" }}>Loading...</p>}
            {!loading && rewards.length === 0 && (
                <p style={{ color: "#999", fontSize: "0.8rem" }}>No rewards available yet.</p>
            )}

            {!loading && rewards.length > 0 && (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>TOURNAMENT</th>
                            <th style={styles.th}>HORSE</th>
                            <th style={styles.th}>RANK</th>
                            <th style={styles.th}>PRIZE</th>
                            <th style={styles.th}>STATUS</th>
                            <th style={styles.th}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rewards.map((r) => (
                            <tr key={r.prizeAwardId}>
                                <td style={styles.td}>
                                    <strong>{r.tournamentName}</strong>
                                    <div style={styles.subText}>{new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(r.raceDate))}</div>
                                </td>
                                <td style={styles.td}>{r.horseName}</td>
                                <td style={styles.td}>{ordinal(r.rankPosition)}</td>
                                <td style={styles.td}>{formatCurrency(r.prizeAmount)}</td>
                                <td style={styles.td}>
                                    <span style={{ ...styles.statusBadge, ...(statusStyle[r.status] || {}) }}>
                                        {formatStatus(r.status)}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    {r.canClaim ? (
                                        <button
                                            type="button"
                                            disabled={claimingId === r.prizeAwardId}
                                            onClick={() => onClaim(r.prizeAwardId)}
                                            className="rounded-full bg-[var(--admin-primary,#16305c)] px-4 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-[#0a1930] disabled:opacity-60"
                                        >
                                            {claimingId === r.prizeAwardId ? "..." : "Claim"}
                                        </button>
                                    ) : (
                                        <button type="button" style={styles.detailsBtn}>Details</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const styles = {
    card: { backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #ded2ad", padding: "16px", boxShadow: "0 8px 22px rgba(15,23,42,0.06)" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", fontSize: "14px", fontWeight: "600", color: "#0a1930" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", fontSize: "10px", color: "#64748b", fontWeight: 700, padding: "10px 8px", borderBottom: "2px solid #c8a24a", background: "#efe8d6" },
    td: { padding: "10px 8px", borderBottom: "1px solid #f0ece0", fontSize: "12px", verticalAlign: "top" },
    subText: { fontSize: "10px", color: "#94a3b8" },
    statusBadge: { fontSize: "10px", padding: "3px 10px", borderRadius: "999px", fontWeight: 700 },
    detailsBtn: { border: "1px solid #ded2ad", background: "#fff", borderRadius: "999px", padding: "5px 12px", fontSize: "11px", fontWeight: 600, cursor: "pointer", color: "#16305c" },
};
