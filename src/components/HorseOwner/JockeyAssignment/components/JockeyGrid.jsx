import { useEffect, useState } from "react";
import { ownerApi } from "../../../../api/ownerApi";

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

    const visibleCandidates = showAll ? candidates : candidates.slice(0, 3);

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <span>Send Jockey Invitations</span>
                {candidates.length > 3 && (
                    <button type="button" style={styles.viewAllBtn} onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Show less' : 'View All →'}
                    </button>
                )}
            </div>

            {error && <p style={{ color: '#721c24', fontSize: '0.8rem' }}>{error}</p>}
            {loading && <p style={{ color: '#999', fontSize: '0.8rem' }}>Loading candidates...</p>}

            {!loading && candidates.length === 0 && (
                <p style={{ color: '#999', fontSize: '0.8rem' }}>
                    {disableInvite ? 'Chọn một giải đấu đã được duyệt để xem danh sách jockey.' : 'No jockey candidates found.'}
                </p>
            )}

            <div style={styles.grid}>
                {visibleCandidates.map((jockey) => {
                    const canInvite = jockey.canInvite && !disableInvite;
                    const isInvited = jockey.alreadyInvited;
                    return (
                        <div key={jockey.jockeyId} style={styles.cardItem}>
                            <div style={styles.imgWrapper}>
                                <img src={jockey.profileImageUrl || '/Jockey1.jpg'} alt={jockey.fullName} style={styles.img} />
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
                                title={!canInvite ? (jockey.cannotInviteReason || (disableInvite ? "Vui lòng chọn một giải đấu đã được duyệt trước" : undefined)) : undefined}
                                onClick={() => canInvite && onInvite(jockey)}
                            >
                                {isInvited ? "Invited" : "Send Invitation"}
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