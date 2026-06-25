export default function InvitationResponses({ invitations, loading, onSign }) {
    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <span>Jockey Invitation Responses</span>
            </div>

            {loading && <p style={{ color: "#999", fontSize: "0.8rem" }}>Loading...</p>}

            {!loading && invitations.length === 0 && (
                <p style={{ color: "#999", fontSize: "0.8rem" }}>No invitations sent yet.</p>
            )}

            {!loading && invitations.length > 0 && (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>JOCKEY</th>
                            <th style={styles.th}>EXPERIENCE</th>
                            <th style={styles.th}>DATE</th>
                            <th style={styles.th}>DECISION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invitations.map((inv) => (
                            <tr key={inv.invitationId}>
                                <td style={styles.td}>
                                    <div style={styles.jockeyCell}>
                                        <img
                                            src={inv.profileImageUrl || '/Jockey1.jpg'}
                                            alt={inv.jockeyName}
                                            style={styles.avatar}
                                        />
                                        <span>{inv.jockeyName}</span>
                                        {inv.isOfficial && (
                                            <span style={styles.officialBadge}>OFFICIAL</span>
                                        )}
                                    </div>
                                </td>
                                <td style={styles.td}>{inv.experienceYears} yrs</td>
                                <td style={styles.td}>
                                    {inv.respondedAt
                                        ? new Date(inv.respondedAt).toLocaleDateString()
                                        : new Date(inv.sentAt).toLocaleDateString()}
                                </td>
                                <td style={styles.td}>
                                    {inv.canSign && onSign ? (
                                        <button
                                            type="button"
                                            onClick={() => onSign(inv.invitationId)}
                                            className="rounded-md bg-[#610000] px-4 py-1.5 text-[12px] font-bold text-white hover:bg-[#4d0000]"
                                        >
                                            Sign
                                        </button>
                                    ) : (
                                        <span style={styles.statusText}>{inv.status}</span>
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
    cardHeader: { fontSize: "14px", fontWeight: "600", marginBottom: "12px" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", fontSize: "10px", color: "#999", padding: "6px 8px", borderBottom: "1px solid #eee" },
    td: { padding: "10px 8px", borderBottom: "1px solid #f5f5f5", fontSize: "12px" },
    jockeyCell: { display: "flex", alignItems: "center", gap: "8px" },
    avatar: { width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" },
    officialBadge: { fontSize: "9px", backgroundColor: "#d4edda", color: "#155724", padding: "2px 6px", borderRadius: "8px", fontWeight: 700 },
    statusText: { fontSize: "11px", color: "#999", fontWeight: 600 },
};