import { formatCurrency } from "../../../../utils/currency";

const statusStyle = {
    ReadyToClaim: { backgroundColor: "#d4edda", color: "#155724" },
    UnderReview: { backgroundColor: "#fff3cd", color: "#856404" },
    Paid: { backgroundColor: "#e2e3e5", color: "#383d41" },
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
                                    <div style={styles.subText}>{new Date(r.raceDate).toLocaleDateString()}</div>
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
                                            className="rounded-md bg-[#610000] px-4 py-1.5 text-[12px] font-bold text-white hover:bg-[#4d0000] disabled:opacity-60"
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
    card: { backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "16px" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", fontSize: "14px", fontWeight: "600" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", fontSize: "10px", color: "#999", padding: "6px 8px", borderBottom: "1px solid #eee" },
    td: { padding: "10px 8px", borderBottom: "1px solid #f5f5f5", fontSize: "12px", verticalAlign: "top" },
    subText: { fontSize: "10px", color: "#999" },
    statusBadge: { fontSize: "10px", padding: "3px 8px", borderRadius: "10px", fontWeight: 700 },
    detailsBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: "6px", padding: "5px 12px", fontSize: "11px", fontWeight: 600, cursor: "pointer" },
};
