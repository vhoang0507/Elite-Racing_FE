import { useState } from "react";
import { resolveFileUrl } from "../../../../api/uploadApi";
import ImageLightbox from "../../../shared/ImageLightbox";

export default function HorseInfo({ context, loading, horseImageUrl, healthCertificateImageUrl }) {
    const [lightboxSrc, setLightboxSrc] = useState(null);

    if (loading && !context) {
        return (
            <div style={styles.card}>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, padding: 16 }}>Loading horse info...</p>
            </div>
        );
    }

    if (!context) return null;

    const certificateUrl = healthCertificateImageUrl || context.healthCertificateImageUrl;
    const isActive = context.horseIsActive;

    return (
        <>
        <div style={styles.card}>
            {/* Horse image header */}
            <div style={styles.imgArea}>
                <img
                    src={horseImageUrl ? resolveFileUrl(horseImageUrl) : '/Horse1.jpg'}
                    alt={context.horseName}
                    style={styles.horseImg}
                    onError={(e) => { e.currentTarget.src = '/Horse1.jpg'; }}
                />
                <div style={styles.imgOverlay}>
                    <p style={styles.overlayName}>{context.horseName}</p>
                    <p style={styles.overlayBreed}>{context.breedName}</p>
                </div>
                <span style={{ ...styles.activeBadge, backgroundColor: isActive ? '#16a34a' : '#dc2626' }}>
                    {isActive ? '● Active' : '● Inactive'}
                </span>
            </div>

            {/* Stats */}
            <div style={styles.statsGrid}>
                <StatBox label="Weight" value={`${context.weightKg} kg`} />
                <StatBox label="Height" value={context.heightCm ? `${context.heightCm} cm` : '—'} />
                <StatBox label="Age" value={`${context.age} yrs`} />
                <StatBox label="Health" value={context.healthStatus} color={context.healthStatus === 'Healthy' ? '#15803d' : '#b91c1c'} />
            </div>

            {/* Certificate */}
            <div style={styles.certSection}>
                <p style={styles.certLabel}>Health Certificate</p>
                {certificateUrl ? (
                    <button
                        onClick={() => setLightboxSrc(resolveFileUrl(certificateUrl))}
                        style={styles.certBtn}
                        type="button"
                    >
                        <img
                            src={resolveFileUrl(certificateUrl)}
                            alt="Certificate"
                            style={styles.certThumb}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span>View Certificate →</span>
                    </button>
                ) : (
                    <span style={styles.certMissing}>Not uploaded</span>
                )}
            </div>

            {/* Race info */}
            <div style={styles.raceSection}>
                <InfoRow label="Race" value={context.raceName} />
                <InfoRow label="Distance" value={context.distanceMeters ? `${context.distanceMeters} m` : '—'} />
            </div>
        </div>
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        </>
    );
}

function StatBox({ label, value, color }) {
    return (
        <div style={styles.statBox}>
            <p style={styles.statLabel}>{label}</p>
            <p style={{ ...styles.statValue, color: color || '#1e293b' }}>{value}</p>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div style={styles.infoRow}>
            <span style={styles.infoLabel}>{label}</span>
            <span style={styles.infoValue}>{value || '—'}</span>
        </div>
    );
}

const styles = {
    card: { backgroundColor: '#fff', borderRadius: 14, border: '1px solid #e8ddd9', overflow: 'hidden' },
    imgArea: { position: 'relative' },
    horseImg: { width: '100%', height: 160, objectFit: 'cover', display: 'block' },
    imgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.65))', padding: '16px 14px 12px' },
    overlayName: { margin: 0, color: '#fff', fontWeight: 800, fontSize: 15 },
    overlayBreed: { margin: '2px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: 11 },
    activeBadge: { position: 'absolute', top: 10, right: 10, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#fff' },
    statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, backgroundColor: '#e8ddd9', borderTop: '1px solid #e8ddd9', borderBottom: '1px solid #e8ddd9' },
    statBox: { backgroundColor: '#faf7f5', padding: '10px 14px', textAlign: 'center' },
    statLabel: { margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' },
    statValue: { margin: '3px 0 0', fontSize: 14, fontWeight: 700 },
    certSection: { padding: '14px 16px', borderBottom: '1px solid #f0ebe8' },
    certLabel: { margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' },
    certBtn: { display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: '1px solid #e8ddd9', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', width: '100%', color: '#610000', fontWeight: 700, fontSize: 12 },
    certThumb: { width: 48, height: 34, borderRadius: 5, objectFit: 'cover', border: '1px solid #e8ddd9' },
    certMissing: { fontSize: 12, color: '#94a3b8', fontWeight: 600 },
    raceSection: { padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 },
    infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    infoLabel: { fontSize: 12, color: '#94a3b8', fontWeight: 600 },
    infoValue: { fontSize: 12, fontWeight: 700, color: '#1e293b', textAlign: 'right' },
};
