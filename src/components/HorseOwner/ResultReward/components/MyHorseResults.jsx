import { useNavigate } from "react-router-dom";

function formatTime(seconds) {
    if (seconds == null) return "—";
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(1);
    return m > 0 ? `${m}:${s.padStart(4, "0")}` : `${s}s`;
}

export default function MyHorseResults({ results, loading, onLoadMore, canLoadMore }) {
    const navigate = useNavigate();

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <span>My Horse Result</span>
            </div>

            {loading && results.length === 0 && <p style={{ color: "#999", fontSize: "0.8rem" }}>Loading...</p>}
            {!loading && results.length === 0 && (
                <p style={{ color: "#999", fontSize: "0.8rem" }}>No race results yet.</p>
            )}

            {results.length > 0 && (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>RANK</th>
                            <th style={styles.th}>HORSE</th>
                            <th style={styles.th}>TOURNAMENT</th>
                            <th style={styles.th}>JOCKEY</th>
                            <th style={styles.th}>TIME</th>
                            <th style={styles.th}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((r, i) => (
                            <tr key={r.resultId}>
                                <td style={styles.td}>{r.rankPosition ?? i + 1}</td>
                                <td style={styles.td}>
                                    <div style={styles.horseCell}>
                                        <span style={styles.avatarPlaceholder}>{r.horseName?.slice(0, 2).toUpperCase()}</span>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{r.horseName}</div>
                                            <div style={styles.subText}>{r.horseBreed}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={styles.td}>{r.tournamentName}</td>
                                <td style={styles.td}>{r.jockeyName ?? "—"}</td>
                                <td style={styles.td}>{formatTime(r.finishTime)}</td>
                                <td style={styles.td}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/owner/rewards/${r.resultId}`)}
                                        style={styles.detailBtn}
                                    >
                                        Detail
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {canLoadMore && (
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <button type="button" onClick={onLoadMore} style={styles.loadMoreBtn}>
                        {loading ? "Loading..." : "Load More ⌄"}
                    </button>
                </div>
            )}
        </div>
    );
}

const styles = {
    card: { backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #ded2ad", padding: "16px", boxShadow: "0 8px 22px rgba(15,23,42,0.06)" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", fontSize: "14px", fontWeight: "600", color: "#0a1930" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", fontSize: "10px", color: "#64748b", fontWeight: 700, padding: "10px 8px", borderBottom: "2px solid #c8a24a", background: "#efe8d6" },
    td: { padding: "10px 8px", borderBottom: "1px solid #f0ece0", fontSize: "12px" },
    horseCell: { display: "flex", alignItems: "center", gap: "8px" },
    avatarPlaceholder: { width: "28px", height: "28px", borderRadius: "999px", backgroundColor: "#16305c", color: "#fff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
    subText: { fontSize: "10px", color: "#94a3b8" },
    detailBtn: { border: "1px solid #ded2ad", background: "#fff", borderRadius: "999px", padding: "5px 12px", fontSize: "11px", fontWeight: 600, cursor: "pointer", color: "#16305c" },
    loadMoreBtn: { border: "none", background: "none", color: "#16305c", fontWeight: 600, fontSize: "12px", cursor: "pointer" },
};
