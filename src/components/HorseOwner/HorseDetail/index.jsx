import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaMedal, FaRulerCombined } from "react-icons/fa";
import HorseOwnerLayout from "../HorseOwnerLayout";
import { ownerApi } from "../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../api/handleOwnerAccessError";
import { resolveFileUrl } from "../../../api/uploadApi";

const humanizeLabel = (value) => String(value || "").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();

const healthColors = {
    Healthy:       { bg: "#e8f7ee", color: "#16864f" },
    Injured:       { bg: "#f3e1df", color: "#a4392f" },
    UnderTraining: { bg: "#faf2e0", color: "#8a6209" },
    NeedsCheck:    { bg: "#faf2e0", color: "#8a6209" },
    Sick:          { bg: "#f3e1df", color: "#a4392f" },
    Recovering:    { bg: "#edf2fa", color: "#16305c" },
    UnfitToRace:   { bg: "#f3e1df", color: "#a4392f" },
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
                                        {humanizeLabel(horse.healthStatus)}
                                    </span>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: horse.isActive ? "#e8f7ee" : "#f3e1df",
                                        color: horse.isActive ? "#16864f" : "#a4392f",
                                    }}>
                                        {horse.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/owner/horses/${horseId}/edit`)}
                                style={styles.editBtn}
                            >
                                <FaEdit /> Edit Horse
                            </button>
                        </div>

                        {/* ── Cards grid ─────────────────────────────── */}
                        <div style={styles.grid}>
                            {/* Physical Stats */}
                            <div style={styles.card}>
                                <p style={{ ...styles.cardTitle, display: "flex", alignItems: "center", gap: "8px" }}>
                                    <FaRulerCombined aria-hidden="true" style={{ color: "var(--admin-primary)" }} />
                                    Physical Stats
                                </p>
                                <div style={styles.infoGrid}>
                                    <InfoItem label="AGE"    value={`${horse.age} yrs`} />
                                    <InfoItem label="HEIGHT" value={horse.heightCm ? `${horse.heightCm} cm` : "—"} />
                                    <InfoItem label="WEIGHT" value={`${horse.weightKg} kg`} />
                                    <InfoItem label="BREED"  value={horse.breedName ?? "—"} />
                                </div>
                            </div>

                            {/* Achievement Summary */}
                            <div style={styles.card}>
                                <p style={{ ...styles.cardTitle, display: "flex", alignItems: "center", gap: "8px" }}>
                                    <FaMedal aria-hidden="true" style={{ color: "var(--admin-primary)" }} />
                                    Achievement Summary
                                </p>
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
        color: "#6b6456",
        alignSelf: "flex-start",
    },
    hero: {
        backgroundColor: "#fff",
        borderRadius: "14px",
        border: "1px solid #ded2ad",
        padding: "28px 32px",
        display: "flex",
        alignItems: "center",
        gap: "24px",
        flexWrap: "wrap",
        boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
    },
    heroImg: {
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "3px solid #f3e6c2",
    },
    heroName: {
        margin: 0,
        fontSize: "2rem",
        fontWeight: 700,
        color: "#0a1930",
    },
    heroBreed: {
        margin: "4px 0 0",
        fontSize: "1rem",
        color: "#6b6456",
    },
    editBtn: {
        marginLeft: "auto",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 28px",
        borderRadius: "999px",
        border: "none",
        backgroundColor: "#16305c",
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
        border: "1px solid #ded2ad",
        padding: "24px 28px",
        boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
    },
    cardTitle: {
        margin: "0 0 18px",
        fontSize: "1rem",
        fontWeight: 700,
        color: "#0a1930",
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "18px",
    },
    infoLabel: {
        fontSize: "0.75rem",
        color: "#6b6456",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
    },
    infoValue: {
        margin: "4px 0 0",
        fontWeight: 600,
        fontSize: "1.05rem",
        color: "#1b2333",
    },
    summaryText: {
        margin: 0,
        fontSize: "1rem",
        color: "#3e3a30",
        lineHeight: 1.7,
    },
};
