import { FaCalendarAlt, FaCheck, FaEnvelope, FaHourglassHalf, FaStar, FaTrophy } from 'react-icons/fa';
import { resolveFileUrl } from '../../../../api/uploadApi';

const formatShortDate = (value) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(value));
};

const STATUS_CONFIG = {
    Pending:   { bg: '#faf2e0', color: '#8a6209', border: '#eddcb0', label: 'Pending' },
    Accepted:  { bg: '#e8f7ee', color: '#16864f', border: '#bfe6d0', label: 'Accepted' },
    Rejected:  { bg: '#f3e1df', color: '#a4392f', border: '#e3bcb7', label: 'Declined' },
    Confirmed: { bg: 'var(--admin-surface-strong)', color: 'var(--admin-primary)', border: 'var(--admin-border)', label: 'Confirmed' },
    Cancelled: { bg: '#f3e1df', color: '#a4392f', border: '#e3bcb7', label: 'Cancelled' },
};

const AVATAR_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"%3E%3Ccircle cx="18" cy="18" r="18" fill="%23f0ebe8"/%3E%3Ctext x="18" y="24" text-anchor="middle" font-size="18" fill="%23c9a8a0"%3E🏇%3C/text%3E%3C/svg%3E';
const AVATAR_FALLBACK_LG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"%3E%3Ccircle cx="48" cy="48" r="48" fill="%23f0ebe8"/%3E%3Ctext x="48" y="64" text-anchor="middle" font-size="48" fill="%23c9a8a0"%3E🏇%3C/text%3E%3C/svg%3E';

function SafeAvatar({ src, alt, large }) {
    return (
        <img
            src={src ? resolveFileUrl(src) : (large ? AVATAR_FALLBACK_LG : AVATAR_FALLBACK)}
            alt={alt}
            style={large ? styles.avatarLg : styles.avatar}
            onError={(e) => { e.currentTarget.src = large ? AVATAR_FALLBACK_LG : AVATAR_FALLBACK; }}
        />
    );
}

function OfficialJockeyCard({ jockey }) {
    const confirmedDate = formatShortDate(jockey.respondedAt);

    return (
        <div style={styles.cardWrap}>
            <div style={styles.cardHeader}>
                <div style={styles.cardHeaderLeft}>
                    <span style={styles.checkIcon}><FaCheck aria-hidden="true" /></span>
                    <div>
                        <p style={styles.cardHeaderTitle}>Official Jockey Confirmed</p>
                        <p style={styles.cardHeaderSub}>A jockey has been officially assigned to this registration</p>
                    </div>
                </div>
                <span style={{ ...styles.officialBadge, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <FaStar aria-hidden="true" size={10} /> Official
                </span>
            </div>

            <div style={styles.profileBody}>
                <div style={styles.profileLeft}>
                    <div style={styles.avatarWrap}>
                        <SafeAvatar src={jockey.profileImageUrl} alt={jockey.jockeyName} large />
                        <span style={styles.avatarBadge}><FaCheck aria-hidden="true" size={10} /></span>
                    </div>
                    <div style={styles.profileInfo}>
                        <h3 style={styles.profileName}>{jockey.jockeyName}</h3>
                        <span style={{ ...styles.officialPill, display: 'inline-flex', alignItems: 'center', gap: 5, width: 'fit-content' }}>
                            <FaStar aria-hidden="true" size={10} /> Official Jockey
                        </span>
                    </div>
                </div>

                <div style={styles.profileStats}>
                    <div style={styles.statItem}>
                        <span style={styles.statIcon}><FaTrophy aria-hidden="true" /></span>
                        <div>
                            <p style={styles.statLabel}>Experience</p>
                            <p style={styles.statValue}>{jockey.experienceYears ?? '—'} years</p>
                        </div>
                    </div>
                    <div style={styles.statItem}>
                        <span style={styles.statIcon}><FaCalendarAlt aria-hidden="true" /></span>
                        <div>
                            <p style={styles.statLabel}>Confirmed On</p>
                            <p style={styles.statValue}>{confirmedDate}</p>
                        </div>
                    </div>
                    <div style={styles.statItem}>
                        <span style={styles.statIcon}><FaEnvelope aria-hidden="true" /></span>
                        <div>
                            <p style={styles.statLabel}>Invitation Sent</p>
                            <p style={styles.statValue}>{formatShortDate(jockey.sentAt)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function InvitationResponses({ invitations, loading, onSign }) {
    const officialJockey = invitations.find(inv => inv.isOfficial);

    return (
        <div style={styles.wrap}>
            <div style={styles.header}>
                <div>
                    <p style={styles.headerTitle}>Jockey Invitation Responses</p>
                    <p style={styles.headerSub}>{invitations.length} invitation{invitations.length !== 1 ? 's' : ''} sent</p>
                </div>
            </div>

            {loading && (
                <div style={styles.stateBox}>
                    <FaHourglassHalf aria-hidden="true" style={{ fontSize: 22, color: '#94a3b8' }} />
                    <p style={styles.stateText}>Loading responses...</p>
                </div>
            )}

            {!loading && invitations.length === 0 && (
                <div style={styles.stateBox}>
                    <FaEnvelope aria-hidden="true" style={{ fontSize: 32, color: '#94a3b8' }} />
                    <p style={styles.stateText}>No invitations sent yet. Pick a jockey above to get started.</p>
                </div>
            )}

            {!loading && officialJockey && (
                <div style={{ padding: '20px' }}>
                    <OfficialJockeyCard jockey={officialJockey} />
                </div>
            )}

            {!loading && invitations.length > 0 && !officialJockey && (
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
                                                <p style={styles.jockeyName}>{inv.jockeyName}</p>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.chip}>{inv.experienceYears} yrs</span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.dateText}>
                                                {formatShortDate(inv.respondedAt || inv.sentAt)}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ ...styles.statusBadge, backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {inv.canSign && onSign ? (
                                                <button
                                                    type="button"
                                                    onClick={() => onSign(inv.invitationId)}
                                                    style={styles.confirmBtn}
                                                >
                                                    <FaCheck aria-hidden="true" size={10} style={{ marginRight: 5 }} />
                                                    Confirm
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
    headRow: { backgroundColor: '#efe8d6' },
    th: { textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', borderBottom: '2px solid #c8a24a' },
    row: { borderBottom: '1px solid #f0ebe8', transition: 'background 0.15s' },
    td: { padding: '12px 16px', fontSize: 13, verticalAlign: 'middle' },
    jockeyCell: { display: 'flex', alignItems: 'center', gap: 10 },
    avatar: { width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8ddd9', flexShrink: 0 },
    jockeyName: { margin: 0, fontWeight: 600, fontSize: 13, color: '#1e293b' },
    chip: { backgroundColor: '#f0ebe8', color: '#5b3a3a', borderRadius: 6, padding: '3px 8px', fontSize: 12, fontWeight: 600 },
    dateText: { fontSize: 12, color: '#64748b' },
    statusBadge: { fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px', display: 'inline-block' },
    confirmBtn: { backgroundColor: '#16864f', color: '#fff', border: 'none', borderRadius: 999, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
    noop: { color: '#cbd5e1', fontSize: 14 },
    cardWrap: { borderRadius: 12, border: '1.5px solid #bfe6d0', backgroundColor: '#f4fbf7', overflow: 'hidden' },
    cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', backgroundColor: '#e8f7ee', borderBottom: '1px solid #bfe6d0' },
    cardHeaderLeft: { display: 'flex', alignItems: 'center', gap: 12 },
    checkIcon: { display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', backgroundColor: '#16864f', color: '#fff', fontSize: 14, fontWeight: 800, flexShrink: 0 },
    cardHeaderTitle: { margin: 0, fontSize: 14, fontWeight: 700, color: '#0f5c38' },
    cardHeaderSub: { margin: '2px 0 0', fontSize: 12, color: '#16864f' },
    officialBadge: { backgroundColor: '#16864f', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '4px 12px' },
    profileBody: { display: 'flex', alignItems: 'center', gap: 32, padding: '24px 20px', flexWrap: 'wrap' },
    profileLeft: { display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 },
    avatarWrap: { position: 'relative', flexShrink: 0 },
    avatarLg: { width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid #16864f' },
    avatarBadge: { position: 'absolute', bottom: 2, right: 2, width: 22, height: 22, borderRadius: '50%', backgroundColor: '#16864f', color: '#fff', fontSize: 11, fontWeight: 800, display: 'grid', placeItems: 'center', border: '2px solid #fff' },
    profileInfo: { display: 'flex', flexDirection: 'column', gap: 6 },
    profileName: { margin: 0, fontSize: 18, fontWeight: 800, color: '#0f5c38' },
    officialPill: { display: 'inline-block', backgroundColor: '#16864f', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px' },
    profileStats: { display: 'flex', gap: 28, flexWrap: 'wrap', flex: 1 },
    statItem: { display: 'flex', alignItems: 'center', gap: 10 },
    statIcon: { fontSize: 22, flexShrink: 0 },
    statLabel: { margin: 0, fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
    statValue: { margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: '#1e293b' },
};
