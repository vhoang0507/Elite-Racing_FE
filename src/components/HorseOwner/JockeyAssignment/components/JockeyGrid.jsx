import { useEffect, useState } from "react";
import { FaCheckCircle, FaEnvelope, FaHorseHead, FaHourglassHalf } from "react-icons/fa";
import { ownerApi } from "../../../../api/ownerApi";
import { resolveFileUrl } from "../../../../api/uploadApi";

const HEALTH_CONFIG = {
    Fit:       { bg: '#e8f7ee', color: '#16864f', dot: '#16864f' },
    Suspended: { bg: '#faf2e0', color: '#8a6209', dot: '#8a6209' },
    Injured:   { bg: '#f3e1df', color: '#a4392f', dot: '#a4392f' },
};

export function formatSkillLevel(value) {
    if (!value) return 'N/A';
    return String(value).replace(/([a-z])([A-Z])/g, '$1 $2');
}

export default function JockeyGrid({ registrationId, search = '', healthStatus = '', onInvite, disableInvite = false, refreshKey = 0 }) {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [imgErrors, setImgErrors] = useState({});

    useEffect(() => {
        if (!registrationId) { setCandidates([]); return; }
        let mounted = true;
        setLoading(true);
        ownerApi.getJockeyCandidates(registrationId, { search, healthStatus, pageSize: 50 })
            .then((data) => { if (mounted) setCandidates(data?.items ?? []); })
            .catch((err) => { if (mounted) setError(err.message || 'Failed to load jockey candidates'); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [registrationId, search, healthStatus, refreshKey]);

    const uninvited = candidates.filter(j => !j.alreadyInvited);
    const visible = showAll ? uninvited : uninvited.slice(0, 3);

    return (
        <div style={styles.wrap}>
            {/* Card header */}
            <div style={styles.header}>
                <div>
                    <p style={styles.headerTitle}>Send Jockey Invitations</p>
                    <p style={styles.headerSub}>{uninvited.length} eligible jockeys available</p>
                </div>
                {uninvited.length > 3 && (
                    <button style={styles.viewAllBtn} onClick={() => setShowAll(!showAll)} type="button">
                        {showAll ? '← Show less' : `View all ${uninvited.length} →`}
                    </button>
                )}
            </div>

            {error && <p style={styles.errorMsg}>{error}</p>}
            {loading && (
                <div style={styles.stateBox}>
                    <FaHourglassHalf aria-hidden="true" style={{ fontSize: 22, color: '#94a3b8' }} />
                    <p style={styles.stateText}>Loading candidates...</p>
                </div>
            )}

            {!loading && uninvited.length === 0 && (
                <div style={styles.stateBox}>
                    <FaHorseHead aria-hidden="true" style={{ fontSize: 32, color: '#94a3b8' }} />
                    <p style={styles.stateText}>
                        {candidates.length > 0
                            ? 'All jockeys have been invited. Check responses below.'
                            : 'No jockey candidates found for this race.'}
                    </p>
                </div>
            )}

            <div style={styles.grid}>
                {visible.map((jockey) => {
                    const canInvite = jockey.canInvite && !disableInvite;
                    const hc = HEALTH_CONFIG[jockey.healthStatus] || { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' };
                    return (
                        <div key={jockey.jockeyId} style={styles.card}>
                            {/* Image */}
                            <div style={styles.imgWrap}>
                                {imgErrors[jockey.jockeyId] ? (
                                    <div style={styles.imgFallback}><FaHorseHead aria-hidden="true" /></div>
                                ) : (
                                    <img
                                        src={jockey.profileImageUrl ? resolveFileUrl(jockey.profileImageUrl) : '/Jockey1.jpg'}
                                        alt={jockey.fullName}
                                        style={styles.img}
                                        onError={() => setImgErrors(p => ({ ...p, [jockey.jockeyId]: true }))}
                                    />
                                )}
                                {/* Health badge overlay */}
                                <span style={{ ...styles.healthBadge, backgroundColor: hc.bg, color: hc.color }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: hc.dot, display: 'inline-block', flexShrink: 0 }} />
                                    {jockey.healthStatus}
                                </span>
                            </div>

                            {/* Body */}
                            <div style={styles.body}>
                                <p style={styles.name}>{jockey.fullName}</p>

                                {/* Stats row */}
                                <div style={styles.statsRow}>
                                    <Stat label="Experience" value={`${jockey.yearsOfExperience} yrs`} />
                                    <Stat label="Weight" value={`${jockey.weightKg} kg`} />
                                </div>

                                {/* Skills */}
                                <div style={styles.skillsRow}>
                                    <SkillPill label="Distance" value={formatSkillLevel(jockey.distanceSkillLevel)} />
                                    <SkillPill label="Breed" value={formatSkillLevel(jockey.breedSkillLevel)} />
                                </div>

                                <button
                                    style={{
                                        ...styles.inviteBtn,
                                        backgroundColor: canInvite ? '#16305c' : '#e2d9d6',
                                        color: canInvite ? '#fff' : '#a38f8f',
                                        cursor: canInvite ? 'pointer' : 'not-allowed',
                                    }}
                                    disabled={!canInvite}
                                    title={!canInvite ? (jockey.cannotInviteReason || 'Cannot invite') : undefined}
                                    onClick={() => canInvite && onInvite(jockey)}
                                    type="button"
                                >
                                    {canInvite ? (
                                        <>
                                            <FaEnvelope aria-hidden="true" style={{ fontSize: 12, flexShrink: 0 }} />
                                            Send Invitation
                                        </>
                                    ) : (
                                        <>
                                            <FaCheckCircle aria-hidden="true" style={{ fontSize: 12, flexShrink: 0 }} />
                                            Invited
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div style={{ flex: 1, backgroundColor: '#f8f4f2', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{label}</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{value}</p>
        </div>
    );
}

function SkillPill({ label, value }) {
    return (
        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', backgroundColor: '#f0ebe8', borderRadius: 20, padding: '3px 9px', fontSize: 11, color: '#5b3a3a', fontWeight: 600 }}>
            <span style={{ color: '#94a3b8', fontSize: 10 }}>{label}:</span> {value}
        </span>
    );
}

const styles = {
    wrap: { backgroundColor: '#fff', borderRadius: 14, border: '1px solid #e8ddd9', overflow: 'hidden' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f0ebe8', backgroundColor: '#faf7f5' },
    headerTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' },
    headerSub: { margin: '2px 0 0', fontSize: 12, color: '#94a3b8' },
    viewAllBtn: { background: 'none', border: '1px solid #ded2ad', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: '#16305c', cursor: 'pointer' },
    errorMsg: { margin: '12px 20px', fontSize: 13, color: '#a4392f', backgroundColor: '#f3e1df', borderRadius: 10, padding: '8px 12px' },
    stateBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '40px 20px', textAlign: 'center' },
    stateText: { margin: 0, fontSize: 13, color: '#64748b' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e8ddd9', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    imgWrap: { position: 'relative' },
    img: { width: '100%', height: 130, objectFit: 'cover', display: 'block' },
    imgFallback: { width: '100%', height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0ebe8', fontSize: '2.5rem' },
    healthBadge: { position: 'absolute', bottom: 8, left: 8, display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700 },
    body: { padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
    name: { margin: 0, fontWeight: 700, fontSize: 14, color: '#1e293b' },
    statsRow: { display: 'flex', gap: 6 },
    skillsRow: { display: 'flex', flexWrap: 'wrap', gap: 5 },
    inviteBtn: { width: '100%', padding: '9px 0', border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 700, marginTop: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
};
