import { resolveFileUrl } from "../../../../api/uploadApi";

export default function HorseInfo({ context, loading, horseImageUrl, healthCertificateImageUrl }) {
    if (loading && !context) {
        return (
            <div style={styles.card}>
                <p style={{ fontSize: "12px", color: "#999" }}>Loading horse info...</p>
            </div>
        );
    }

    if (!context) return null;

    const certificateUrl = healthCertificateImageUrl || context.healthCertificateImageUrl;

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <span>Horse Info</span>
            </div>
            <div style={styles.horseRow}>
                <img src={horseImageUrl ? resolveFileUrl(horseImageUrl) : "/Horse1.jpg"} alt="horse" style={styles.horseImg} />
                <div>
                    <p style={styles.horseName}>{context.horseName}</p>
                    <p style={styles.horseBreed}>{context.breedName}</p>
                    <span style={{
                        ...styles.healthBadge,
                        backgroundColor: context.horseIsActive ? "#d4edda" : "#f8d7da",
                        color: context.horseIsActive ? "#155724" : "#721c24",
                    }}>
                        {context.healthStatus}
                    </span>
                </div>
            </div>
            <div style={styles.statsGrid}>
                <div><small style={styles.statLabel}>WEIGHT</small><p style={styles.statValue}>{context.weightKg}kg</p></div>
                <div><small style={styles.statLabel}>HEIGHT</small><p style={styles.statValue}>{context.heightCm ? `${context.heightCm}cm` : "—"}</p></div>
                <div><small style={styles.statLabel}>AGE</small><p style={styles.statValue}>{context.age} years</p></div>
                <div>
                    <small style={styles.statLabel}>STATUS</small>
                    <p style={{ ...styles.statValue, color: context.horseIsActive ? "green" : "#721c24" }}>
                        {context.horseIsActive ? "Active" : "Inactive"}
                    </p>
                </div>
            </div>
            <div style={styles.certificateBox}>
                <small style={styles.statLabel}>HEALTH CERTIFICATE</small>
                {certificateUrl ? (
                    <a href={resolveFileUrl(certificateUrl)} target="_blank" rel="noreferrer" style={styles.certificateLink}>
                        <img src={resolveFileUrl(certificateUrl)} alt="Health certificate" style={styles.certificateThumb} />
                        <span>Open certificate</span>
                    </a>
                ) : (
                    <p style={styles.certificateMissing}>Not uploaded</p>
                )}
            </div>
            <div style={styles.raceInfo}>
                <p style={styles.raceInfoRow}><span>Race</span><strong>{context.raceName}</strong></p>
                <p style={styles.raceInfoRow}><span>Distance</span><strong>{context.distanceMeters}m</strong></p>
            </div>
        </div>
    );
}

const styles = {
    card: { backgroundColor: "#fff", borderRadius: "12px", padding: "16px", border: "1px solid #eee" },
    cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", fontWeight: "600" },
    horseRow: { display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" },
    horseImg: { width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" },
    horseName: { margin: 0, fontWeight: "bold", fontSize: "14px" },
    horseBreed: { margin: "2px 0", fontSize: "12px", color: "#999" },
    healthBadge: { fontSize: "10px", padding: "2px 8px", borderRadius: "10px" },
    statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" },
    statLabel: { color: "#999", fontSize: "11px" },
    statValue: { margin: "2px 0 0", fontWeight: "600", fontSize: "14px" },
    certificateBox: { marginBottom: "12px", borderTop: "1px solid #f0e3e0", paddingTop: "10px" },
    certificateLink: { display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", color: "#7d0000", fontSize: "12px", fontWeight: "700", textDecoration: "none" },
    certificateThumb: { width: "58px", height: "42px", borderRadius: "6px", border: "1px solid #ead3cf", objectFit: "cover", backgroundColor: "#fff8f6" },
    certificateMissing: { margin: "4px 0 0", color: "#999", fontSize: "12px", fontWeight: "600" },
    raceInfo: { borderTop: "1px solid #f0f0f0", paddingTop: "10px" },
    raceInfoRow: { display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#666", margin: "4px 0" },
};
