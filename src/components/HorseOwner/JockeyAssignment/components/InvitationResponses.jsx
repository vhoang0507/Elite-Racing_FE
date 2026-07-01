import { resolveFileUrl } from '../../../../api/uploadApi';

const STATUS_CONFIG = {
    Pending:   { bg: '#fef9c3', color: '#92400e', border: '#fde68a', label: 'Pending' },
    Accepted:  { bg: '#dcfce7', color: '#15803d', border: '#86efac', label: 'Accepted' },
    Rejected:  { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', label: 'Declined' },
    Confirmed: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd', label: 'Confirmed' },
    Cancelled: { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1', label: 'Cancelled' },
};

const AVATAR_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"%3E%3Ccircle cx="18" cy="18" r="18" fill="%23f0ebe8"/%3E%3Ctext x="18" y="24" text-anchor="middle" font-size="18" fill="%23c9a8a0"%3E🏇%3C/text%3E%3C/svg%3E';

function SafeAvatar({ src, alt }) {
    return (
        <img
            src={src ? resolveFileUrl(src) : AVATAR_FALLBACK}
            alt={alt}
            style={styles.avatar}
            onError={(e) => { e.currentTarget.src = AVATAR_FALLBACK; }}
        />
    );
}

export default function InvitationResponses({ invitations, loading, onSign }) {
    return (
        <div style={styles.wrap}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <p style={styles.headerTitle}>Jockey Invitation Responses</p>
                    <p style={styles.headerSub}>{invitations.length} invitation{invitations.length !== 1 ? 's' : ''} sent</p>
                </div>
            </div>

            {loading && (
                <div style={styles.stateBox}>
                    <span>⏳</span>
                    <p style={styles.stateText}>Loading responses...</p>
                </div>
            )}

            {!loading && invitations.length === 0 && (
                <div style={styles.stateBox}>
                    <span style={{ fontSize: 32 }}>✉️</span>
                    <p style={styles.stateText}>No invitations sent yet. Pick a jockey above to get started.</p>
                </div>
            )}

            {!loading && invitations.length > 0 && (
                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.headRow}>
                                <th style={styles.th}>Jockey</th>
                                <th style={styles.th}>Experience</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invitations.map((inv, i) => {
                                const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.Cancelled;
                                return (
                                    <tr key={inv.invitationId} style={{ ...styles.row, backgroundColor: i % 2 === 0 ? '#fff' : '#faf7f5' }}>
                                        <td style={styles.td}>
                                            <div style={styles.jockeyCell}>
                                                <SafeAvatar src={inv.profileImageUrl} alt={inv.jockeyName} />
                                                <div>
                                                    <p style={styles.jockeyName}>{inv.jockeyName}</p>
                                                    {inv.isOfficial && (
                                                        <span style={styles.officialTag}>★ Official</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.chip}>{inv.experienceYears} yrs</span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.dateText}>
                                                {inv.respondedAt
                                                    ? new Date(inv.respondedAt).toLocaleDateString()
                                                    : new Date(inv.sentAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ ...styles.statusBadge, backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                                {inv.isOfficial ? '★ Official' : cfg.label}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {inv.canSign && onSign ? (
                                                <button
                                                    type="button"
                                                    onClick={() => onSign(inv.invitationId)}
                                                    style={styles.confirmBtn}
                                                >
                                                    Confirm ✓
                                                </button>
                                            ) : (
                                                <span style={styles.noop}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const styles = {
    wrap: { backgroundColor: '#fff', borderRadius: 14, border: '1px solid #e8ddd9', overflow: 'hidden' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#faf7f5', borderBottom: '1px solid #f0ebe8' },
    headerTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' },
    headerSub: { margin: '2px 0 0', fontSize: 12, color: '#94a3b8' },
    stateBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '40px 20px', textAlign: 'center' },
    stateText: { margin: 0, fontSize: 13, color: '#64748b' },
    tableWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    headRow: { backgroundColor: '#f8f4f2' },
    th: { textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', borderBottom: '1px solid #e8ddd9' },
    row: { borderBottom: '1px solid #f0ebe8', transition: 'background 0.15s' },
    td: { padding: '12px 16px', fontSize: 13, verticalAlign: 'middle' },
    jockeyCell: { display: 'flex', alignItems: 'center', gap: 10 },
    avatar: { width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8ddd9', flexShrink: 0 },
    jockeyName: { margin: 0, fontWeight: 600, fontSize: 13, color: '#1e293b' },
    officialTag: { fontSize: 10, fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', borderRadius: 4, padding: '1px 6px' },
    chip: { backgroundColor: '#f0ebe8', color: '#5b3a3a', borderRadius: 6, padding: '3px 8px', fontSize: 12, fontWeight: 600 },
    dateText: { fontSize: 12, color: '#64748b' },
    statusBadge: { fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px', display: 'inline-block' },
    confirmBtn: { backgroundColor: '#15803d', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
    noop: { color: '#cbd5e1', fontSize: 14 },
};
