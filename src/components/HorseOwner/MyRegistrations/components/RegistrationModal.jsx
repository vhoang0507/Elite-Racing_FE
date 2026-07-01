import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";
import ImageLightbox from "../../../shared/ImageLightbox";
import { resolveFileUrl } from "../../../../api/uploadApi";

const getTournamentStatus = (tournament) => tournament.status ?? tournament.Status ?? "OpenRegistration";

const registrationStatusLabel = (status) => {
    switch (status) {
        case "OpenRegistration":
            return "Open Registration";
        case "ClosedRegistration":
            return "Registration Closed";
        case "Ongoing":
            return "Race Ongoing";
        case "Completed":
            return "Completed";
        default:
            return "Registration Closed";
    }
};

function HealthCertificateLink({ url }) {
    const [lightboxSrc, setLightboxSrc] = useState(null);
    if (!url) {
        return <span style={styles.certificateMissing}>Health certificate not uploaded</span>;
    }

    const resolvedUrl = resolveFileUrl(url);

    return (
        <>
            <button
                onClick={(event) => { event.stopPropagation(); setLightboxSrc(resolvedUrl); }}
                style={{ ...styles.certificateLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '8px' }}
                type="button"
            >
                <img src={resolvedUrl} alt="Health certificate" style={styles.certificateThumb} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                Health certificate
            </button>
            <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        </>
    );
}

export default function RegistrationModal({ tournament, onClose, onSuccess }) {
    const navigate = useNavigate();
    const [horses, setHorses] = useState([]);
    const [selectedHorse, setSelectedHorse] = useState(null);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!tournament) return;
        setLoading(true);
        ownerApi.getEligibleHorses(tournament.raceId)
            .then(async (items) => {
                const list = Array.isArray(items) ? items : [];
                const withCertificate = await Promise.all(list.map(async (horse) => {
                    if (horse.healthCertificateImageUrl) return horse;

                    try {
                        const detail = await ownerApi.getHorseDetail(horse.horseId);
                        return {
                            ...horse,
                            imageUrl: horse.imageUrl || detail.imageUrl,
                            healthCertificateImageUrl: detail.healthCertificateImageUrl,
                        };
                    } catch {
                        return horse;
                    }
                }));

                setHorses(withCertificate);
            })
            .catch((err) => {
                if (!handleOwnerAccessError(err, navigate)) setHorses([]);
            })
            .finally(() => setLoading(false));
    }, [tournament?.raceId]);

    if (!tournament) return null;

    const tournamentStatus = getTournamentStatus(tournament);
    const isRegistrationOpen = tournamentStatus === "OpenRegistration";

    const handleSelectHorse = (horse) => {
        if (!horse.isEligible) return;
        setSelectedHorse(horse);
        setError("");
    };

    const handleSubmit = async () => {
        if (!isRegistrationOpen) {
            setError(registrationStatusLabel(tournamentStatus));
            return;
        }

        if (!selectedHorse) {
            setError("Please select a horse before registering.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await ownerApi.createRegistration({
                raceId: tournament.raceId,
                horseId: selectedHorse.horseId,
                notes,
            });
            setSuccess("Registration submitted! Pending admin approval.");
            setTimeout(() => {
                onSuccess?.();
            }, 1500);
        } catch (err) {
            if (!handleOwnerAccessError(err, navigate)) {
                setError(err.message || "Registration failed.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={styles.imgWrapper}>
                    <img
                        src={tournament.imageUrl ? resolveFileUrl(tournament.imageUrl) : "/DubaiSprintCup.jpg"}
                        alt={tournament.tournamentName}
                        style={styles.img}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/DubaiSprintCup.jpg"; }}
                    />
                    <div style={styles.imgOverlay}>
                        <span style={styles.upcomingBadge}>UPCOMING MAJOR EVENT</span>
                        <h2 style={styles.tournamentName}>{tournament.tournamentName}</h2>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* Body */}
                <div style={styles.body}>

                    {/* Left column - Tournament Info */}
                    <div style={styles.infoCol}>
                        <div style={styles.infoRow}><span>📅</span><div><small>DATE</small><p>{tournament.raceDate}</p></div></div>
                        <div style={styles.infoRow}><span>📍</span><div><small>LOCATION</small><p>{tournament.location}</p></div></div>
                        <div style={styles.infoRow}><span>👥</span><div><small>SLOTS LEFT</small><p>{tournament.availableSlots} / {tournament.maxHorses}</p></div></div>
                        <div style={styles.infoRow}><span>📏</span><div><small>DISTANCE</small><p>{tournament.distanceMeters} m</p></div></div>
                        <div style={styles.infoRow}><span>💰</span><div><small>PRIZE POOL</small><h3 style={{ margin: 0, color: "#0b7f5a" }}>${Number(tournament.prizePool).toLocaleString()}</h3></div></div>
                        <p style={{ fontSize: "11px", color: "#999", marginTop: "8px" }}>
                            ⚠️ Registrations require admin approval before race participation.
                        </p>
                    </div>

                    {/* Right column - Form */}
                    <div style={styles.formCol}>

                        <h4 style={styles.stepTitle}>STEP 1: SELECT HORSE</h4>
                        {loading ? (
                            <p style={{ color: "#999" }}>Loading horses...</p>
                        ) : horses.length === 0 ? (
                            <p style={{ color: "#999" }}>No eligible horses found.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                                {horses.map(horse => (
                                    <div
                                        key={horse.horseId}
                                        onClick={() => handleSelectHorse(horse)}
                                        style={{
                                            ...styles.horseCard,
                                            opacity: horse.isEligible ? 1 : 0.5,
                                            cursor: horse.isEligible ? "pointer" : "not-allowed",
                                            border: selectedHorse?.horseId === horse.horseId ? "2px solid #0b7f5a" : "1px solid #eee",
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <strong>{horse.horseName}</strong>
                                                <span style={{
                                                    fontSize: "11px", padding: "2px 8px", borderRadius: "10px",
                                                    backgroundColor: horse.isEligible ? "#d4edda" : "#f8d7da",
                                                    color: horse.isEligible ? "#155724" : "#721c24",
                                                }}>
                                                    {horse.isEligible ? "Eligible" : "Ineligible"}
                                                </span>
                                            </div>
                                            <small style={{ color: "#999" }}>{horse.breedName} • {horse.age}y • {horse.weightKg}kg • {horse.healthStatus}</small>
                                            <div style={{ marginTop: "6px" }}>
                                                <HealthCertificateLink url={horse.healthCertificateImageUrl} />
                                            </div>
                                            {!horse.isEligible && (
                                                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#721c24" }}>{horse.ineligibleReason}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <h4 style={styles.stepTitle}>STEP 2: NOTES (optional)</h4>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Dietary restrictions, stable placement preferences..."
                            style={{ ...styles.input, height: "80px", resize: "vertical", marginBottom: "16px" }}
                        />

                        {!isRegistrationOpen && (
                            <p style={styles.closedNotice}>{registrationStatusLabel(tournamentStatus)}</p>
                        )}
                        {error && <p style={{ color: "#721c24", fontSize: "13px", marginBottom: "8px" }}>{error}</p>}
                        {success && <p style={{ color: "#155724", fontSize: "13px", marginBottom: "8px" }}>{success}</p>}

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !isRegistrationOpen}
                                style={{ ...styles.submitBtn, opacity: submitting || !isRegistrationOpen ? 0.7 : 1 }}
                            >
                                {submitting ? "Submitting..." : isRegistrationOpen ? "Submit Registration ➤" : registrationStatusLabel(tournamentStatus)}
                            </button>
                            <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
    modal: { backgroundColor: "#fff", borderRadius: "12px", width: "900px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" },
    imgWrapper: { position: "relative" },
    img: { width: "100%", height: "160px", objectFit: "cover", borderRadius: "12px 12px 0 0" },
    imgOverlay: { position: "absolute", bottom: "16px", left: "16px" },
    upcomingBadge: { backgroundColor: "#0b7f5a", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "4px" },
    tournamentName: { color: "#fff", margin: "4px 0 0", fontSize: "22px", textShadow: "0 1px 3px rgba(0,0,0,0.5)" },
    closeBtn: { position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.4)", color: "#fff", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontSize: "14px" },
    body: { display: "grid", gridTemplateColumns: "240px 1fr", gap: "0" },
    infoCol: { padding: "20px", borderRight: "1px solid #eee", backgroundColor: "#faf8f8" },
    infoRow: { display: "flex", gap: "10px", marginBottom: "12px", alignItems: "flex-start", fontSize: "13px" },
    formCol: { padding: "20px" },
    stepTitle: { fontSize: "11px", color: "#999", fontWeight: "700", letterSpacing: "1px", margin: "0 0 10px" },
    input: { width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" },
    horseCard: { display: "flex", gap: "12px", padding: "12px", borderRadius: "8px", marginBottom: "4px" },
    certificateLink: { display: "inline-flex", alignItems: "center", gap: "7px", color: "#0b7f5a", fontSize: "11px", fontWeight: "700", textDecoration: "none" },
    certificateThumb: { width: "38px", height: "28px", borderRadius: "6px", border: "1px solid #dce5ef", objectFit: "cover", backgroundColor: "#fff8f6" },
    certificateMissing: { display: "inline-flex", borderRadius: "999px", backgroundColor: "#f4ecea", color: "#64748b", fontSize: "11px", fontWeight: "700", padding: "3px 8px" },
    closedNotice: { color: "#b91c1c", backgroundColor: "#fee2e2", borderRadius: "8px", fontSize: "13px", fontWeight: 700, marginBottom: "8px", padding: "8px 10px" },
    submitBtn: { flex: 1, padding: "10px", backgroundColor: "#0b7f5a", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
    cancelBtn: { padding: "10px 20px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
};
