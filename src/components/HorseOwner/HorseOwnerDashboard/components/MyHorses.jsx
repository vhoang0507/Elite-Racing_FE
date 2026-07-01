import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ownerApi } from "../../../../api/ownerApi";
import { resolveFileUrl } from "../../../../api/uploadApi";
import ImageLightbox from "../../../shared/ImageLightbox";

export default function MyHorses() {
    const navigate = useNavigate();
    const [horses, setHorses] = useState([]);
    const [lightboxSrc, setLightboxSrc] = useState(null);

    useEffect(() => {
        let mounted = true;
        ownerApi.getHorses({ pageSize: 2 })
            .then((res) => { if (mounted) setHorses(res.items || []); })
            .catch(() => { });
        return () => { mounted = false; };
    }, []);

    return (
        <>
        <section style={styles.section}>
            <div style={styles.header}>
                <h3 style={{ margin: 0 }}>My Horses</h3>
                <button style={styles.viewAll} onClick={() => navigate('/owner/my-horse')}>View All</button>
            </div>

            <div style={styles.list}>
                {horses.length === 0 && <p style={{ color: '#64748b', fontSize: '13px' }}>No horses yet</p>}
                {horses.map((horse) => (
                    <div key={horse.horseId} style={{ ...styles.card, cursor: 'pointer' }} onClick={() => navigate(`/owner/horses/${horse.horseId}`)}>
                        {horse.imageUrl && (
                            <img src={resolveFileUrl(horse.imageUrl)} alt={horse.horseName} style={{ width: "100px", height: "70px", borderRadius: "8px", objectFit: "cover" }} />
                        )}
                        <div style={styles.info}>
                            <span style={styles.breed}>{horse.breedName || `Breed #${horse.breedId}`}</span>
                            <p style={styles.name}>{horse.horseName}</p>
                            <div style={styles.tags}>
                                <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor: horse.healthStatus === "Healthy" ? "#dff7e9" : "#f5e1df",
                                    color: horse.healthStatus === "Healthy" ? "#118548" : "#0b7f5a",
                                }}>
                                    {horse.healthStatus}
                                </span>
                                <span style={styles.tag}>{horse.age} yrs</span>
                                <span style={styles.tag}>{horse.weightKg}kg</span>
                            </div>
                            {horse.healthCertificateImageUrl ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setLightboxSrc(resolveFileUrl(horse.healthCertificateImageUrl)); }}
                                    style={{ ...styles.certificateLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                                >
                                    Health certificate uploaded
                                </button>
                            ) : (
                                <span style={styles.certificateMissing}>Health certificate not uploaded</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        </>
    );
}

const styles = {
    section: { backgroundColor: "#fffefd", borderRadius: "8px", padding: "20px", border: "1px solid #dce5ef", boxShadow: "0 12px 28px rgba(91, 26, 19, 0.05)" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
    viewAll: { background: "none", border: "none", color: "#0b7f5a", cursor: "pointer", fontSize: "13px", fontWeight: "bold" },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    card: { display: "flex", gap: "12px", alignItems: "center", padding: "10px", borderRadius: "8px", border: "1px solid #dce5ef", backgroundColor: "#fffaf8" },
    info: { display: "flex", flexDirection: "column", gap: "4px" },
    breed: { fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" },
    name: { margin: 0, fontWeight: "bold", fontSize: "15px", color: "#2d2020" },
    tags: { display: "flex", gap: "6px", flexWrap: "wrap" },
    statusBadge: { fontSize: "11px", padding: "2px 8px", borderRadius: "999px", fontWeight: "700" },
    tag: { fontSize: "11px", padding: "2px 8px", borderRadius: "999px", backgroundColor: "#e8f7ef", color: "#64748b" },
    certificateLink: { width: "fit-content", color: "#0b7f5a", fontSize: "11px", fontWeight: "700", textDecoration: "none" },
    certificateMissing: { color: "#9a827d", fontSize: "11px", fontWeight: "700" },
};
