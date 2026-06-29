import { resolveFileUrl } from '../../../../api/uploadApi';

const AVATAR_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"%3E%3Ccircle cx="14" cy="14" r="14" fill="%23f3e8e6"/%3E%3Ctext x="14" y="19" text-anchor="middle" font-size="14" fill="%23c9a8a0"%3E🏇%3C/text%3E%3C/svg%3E';

function SafeAvatar({ src, alt }) {
    const resolved = src ? resolveFileUrl(src) : '';
    return (
        <img
            src={resolved || AVATAR_FALLBACK}
            alt={alt}
            style={styles.avatar}
            onError={(e) => { e.currentTarget.src = AVATAR_FALLBACK; }}
        />
    );
}

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
                                        <SafeAvatar src={inv.profileImageUrl} alt={inv.jockeyName} />
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