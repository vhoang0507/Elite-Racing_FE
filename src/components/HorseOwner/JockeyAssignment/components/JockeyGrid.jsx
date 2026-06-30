import { useEffect, useState } from "react";
import { ownerApi } from "../../../../api/ownerApi";
import { resolveFileUrl } from "../../../../api/uploadApi";

const healthColor = {
    Fit: { color: "#155724" },
    Suspended: { color: "#856404" },
    Injured: { color: "#721c24" },
};

export default function JockeyGrid({ registrationId, search = '', healthStatus = '', onInvite, disableInvite = false }) {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [imgErrors, setImgErrors] = useState({});

    useEffect(() => {
        if (!registrationId) {
            setCandidates([]);
            return;
        }
        let mounted = true;
        setLoading(true);
        ownerApi.getJockeyCandidates(registrationId, { search, healthStatus, pageSize: 50 })
            .then((data) => {
                if (!mounted) return;
                setCandidates(data?.items ?? []);
            })
            .catch((err) => {
                if (mounted) setError(err.message || 'Failed to load jockey candidates');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, [registrationId, search, healthStatus]);

    const uninvitedCandidates = candidates.filter((j) => !j.alreadyInvited);
    const visibleCandidates = showAll ? uninvitedCandidates : uninvitedCandidates.slice(0, 3);

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <span>Send Jockey Invitations</span>
                {uninvitedCandidates.length > 3 && (
                    <button type="button" style={styles.viewAllBtn} onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Show less' : 'View All →'}
                    </button>
                )}
            </div>

            {error && <p style={{ color: '#721c24', fontSize: '0.8rem' }}>{error}</p>}
            {loading && <p style={{ color: '#999', fontSize: '0.8rem' }}>Loading candidates...</p>}

            {!loading && uninvitedCandidates.length === 0 && (
                <p style={{ color: '#999', fontSize: '0.8rem' }}>
                    {disableInvite
                        ? 'Select an approved tournament to view available jockeys.'
                        : candidates.length > 0
                        ? 'All available jockeys have already been invited. Check the Responses table below.'
                        : 'No jockey candidates found.'}
                </p>
            )}

            <div style={styles.grid}>
                {visibleCandidates.map((jockey) => {
                    const canInvite = jockey.canInvite && !disableInvite;
                    return (
                        <div key={jockey.jockeyId} style={styles.cardItem}>
                            <div style={styles.imgWrapper}>
                                {imgErrors[jockey.jockeyId] ? (
                                    <div style={{ ...styles.img, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3eeec', fontSize: '2rem' }}>🏇</div>
                                ) : (
                                    <img
                                        src={jockey.profileImageUrl ? resolveFileUrl(jockey.profileImageUrl) : '/Jockey1.jpg'}
                                        alt={jockey.fullName}
                                        style={styles.img}
                                        onError={() => setImgErrors((prev) => ({ ...prev, [jockey.jockeyId]: true }))}
                                    />
                                )}
                            </div>

                            <p style={styles.name}>{jockey.fullName}</p>

                            <div style={styles.statsRow}>
                                <div style={styles.stat}>
                                    <small style={styles.statLabel}>EXPERIENCE</small>
                                    <p style={styles.statValue}>{jockey.yearsOfExperience} Years</p>
                                </div>
                                <div style={styles.stat}>
                                    <small style={styles.statLabel}>WEIGHT</small>
                                    <p style={styles.statValue}>{jockey.weightKg}kg</p>
                                </div>
                                <div style={styles.stat}>
                                    <small style={styles.statLabel}>HEALTH</small>
                                    <p style={{ ...styles.statValue, ...(healthColor[jockey.healthStatus] || {}) }}>{jockey.healthStatus}</p>
                                </div>
                            </div>

                            <div style={styles.divider} />

                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Distance Skill</span>
                                <span style={styles.infoValue}>{jockey.distanceSkillLevel}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Breed Skill</span>
                                <span style={styles.infoValue}>{jockey.breedSkillLevel || 'No Experience'}</span>
                            </div>

                            <button
                                style={{
                                    ...styles.inviteBtn,
                                    backgroundColor: canInvite ? "#610000" : "#ccc",
                                    cursor: canInvite ? "pointer" : "not-allowed",
                                }}
                                disabled={!canInvite}
                                title={!canInvite ? (jockey.cannotInviteReason || (disableInvite ? "Please select an approved tournament first" : undefined)) : undefined}
                                onClick={() => canInvite && onInvite(jockey)}
                            >
                                Send Invitation
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const styles = {
    card: { backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "16px" },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", fontSize: "14px", fontWeight: "600" },
    viewAllBtn: { background: "none", border: "none", color: "#610000", fontWeight: 600, fontSize: "12px", cursor: "pointer" },
    grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" },
    cardItem: { backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" },
    imgWrapper: { position: "relative" },
    img: { width: "100%", height: "120px", objectFit: "cover" },
    name: { margin: "10px 10px 6px", fontWeight: "bold", fontSize: "13px" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", padding: "0 10px", gap: "6px" },
    stat: { textAlign: "center" },
    statLabel: { fontSize: "9px", color: "#999" },
    statValue: { margin: "2px 0 0", fontWeight: "600", fontSize: "11px" },
    divider: { height: "1px", backgroundColor: "#f0f0f0", margin: "10px" },
    infoRow: { display: "flex", justifyContent: "space-between", padding: "0 10px", marginBottom: "4px" },
    infoLabel: { fontSize: "11px", color: "#999" },
    infoValue: { fontSize: "11px", fontWeight: "500" },
    inviteBtn: { width: "calc(100% - 20px)", margin: "10px", padding: "8px", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "500" },
};