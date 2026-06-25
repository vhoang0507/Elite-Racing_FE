import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HorseOwnerLayout from "../HorseOwnerLayout";
import { ownerApi } from "../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../api/handleOwnerAccessError";
import { resolveFileUrl } from "../../../api/uploadApi";

const healthColors = {
    Healthy:       { bg: "#d4edda", color: "#155724" },
    Injured:       { bg: "#f8d7da", color: "#721c24" },
    UnderTraining: { bg: "#fff3cd", color: "#856404" },
    NeedsCheck:    { bg: "#fff3cd", color: "#856404" },
    Sick:          { bg: "#f8d7da", color: "#721c24" },
    Recovering:    { bg: "#cce5ff", color: "#004085" },
    UnfitToRace:   { bg: "#f8d7da", color: "#721c24" },
};

export default function HorseDetail() {
    const { horseId } = useParams();
    const navigate = useNavigate();
    const [horse, setHorse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        ownerApi.getHorseDetail(horseId)
            .then(data => { if (mounted) setHorse(data); })
            .catch(err => {
                if (!handleOwnerAccessError(err, navigate)) setError("Failed to load horse details.");
            })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [horseId]);

    const healthStyle = horse ? (healthColors[horse.healthStatus] ?? { bg: "#eee", color: "#555" }) : {};

    return (
        <HorseOwnerLayout activeKey="my-horse">
            <section style={styles.page}>
                {/* Back link */}
                <button
                    type="button"
                    onClick={() => navigate("/owner/my-horse")}
                    style={styles.backLink}
                >
                    ← Back to My Horses
                </button>

                {loading && <p style={{ color: "#999", fontSize: "0.85rem" }}>Loading...</p>}
                {error   && <p style={{ color: "#c62828", fontSize: "0.85rem" }}>{error}</p>}

                {!loading && horse && (
                    <>
                        {/* ── Hero ───────────────────────────────────── */}
                        <div style={styles.hero}>
                            <img
                                src={horse.imageUrl ? resolveFileUrl(horse.imageUrl) : "/Horse1.jpg"}
                                alt={horse.horseName}
                                style={styles.heroImg}
                            />
                            <div>
                                <h2 style={styles.heroName}>{horse.horseName}</h2>
                                <p style={styles.heroBreed}>{horse.breedName ?? "Unknown Breed"}</p>
                                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                                    <span style={{ ...styles.badge, ...healthStyle }}>
                                        {horse.healthStatus}
                                    </span>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: horse.isActive ? "#d4edda" : "#f8d7da",
                                        color: horse.isActive ? "#155724" : "#721c24",
                                    }}>
                                        {horse.isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/owner/horses/${horseId}/edit`)}
                                style={styles.editBtn}
                            >
                                ✏️ Edit Horse
                            </button>
                        </div>

                        {/* ── Cards grid ─────────────────────────────── */}
                        <div style={styles.grid}>
                            {/* Physical Stats */}
                            <div style={styles.card}>
                                <p style={styles.cardTitle}>📏 Physical Stats</p>
                                <div style={styles.infoGrid}>
                                    <InfoItem label="AGE"    value={`${horse.age} yrs`} />
                                    <InfoItem label="HEIGHT" value={horse.heightCm ? `${horse.heightCm} cm` : "—"} />
                                    <InfoItem label="WEIGHT" value={`${horse.weightKg} kg`} />
                                    <InfoItem label="BREED"  value={horse.breedName ?? "—"} />
                                </div>
                            </div>

                            {/* Achievement Summary */}
                            <div style={styles.card}>
                                <p style={styles.cardTitle}>🏅 Achievement Summary</p>
                                <p style={styles.summaryText}>
                                    {horse.achievementSummary || "No achievement summary provided."}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </HorseOwnerLayout>
    );
}

function InfoItem({ label, value }) {
    return (
        <div>
            <small style={styles.infoLabel}>{label}</small>
            <p style={styles.infoValue}>{value}</p>
        </div>
    );
}

const styles = {
    page: {
        display: "grid",
        gap: "24px",
        padding: "36px 44px",
    },
    backLink: {
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "#888",
        alignSelf: "flex-start",
    },
    hero: {
        backgroundColor: "#fff",
        borderRadius: "14px",
        border: "1px solid #eee",
        padding: "28px 32px",
        display: "flex",
        alignItems: "center",
        gap: "24px",
        flexWrap: "wrap",
    },
    heroImg: {
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "3px solid #fde2e1",
    },
    heroName: {
        margin: 0,
        fontSize: "2rem",
        fontWeight: 700,
        color: "#2d2020",
    },
    heroBreed: {
        margin: "4px 0 0",
        fontSize: "1rem",
        color: "#999",
    },
    editBtn: {
        marginLeft: "auto",
        padding: "12px 28px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#8B0000",
        color: "#fff",
        fontWeight: 700,
        fontSize: "1rem",
        cursor: "pointer",
    },
    badge: {
        padding: "5px 14px",
        borderRadius: "20px",
        fontSize: "0.88rem",
        fontWeight: 600,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #eee",
        padding: "24px 28px",
    },
    cardTitle: {
        margin: "0 0 18px",
        fontSize: "1rem",
        fontWeight: 700,
        color: "#610000",
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "18px",
    },
    infoLabel: {
        fontSize: "0.75rem",
        color: "#aaa",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
    },
    infoValue: {
        margin: "4px 0 0",
        fontWeight: 600,
        fontSize: "1.05rem",
        color: "#2d2020",
    },
    summaryText: {
        margin: 0,
        fontSize: "1rem",
        color: "#555",
        lineHeight: 1.7,
    },
};
