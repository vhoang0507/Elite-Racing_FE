import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCalendarAlt,
    FaCoins,
    FaExclamationTriangle,
    FaHourglassEnd,
    FaLayerGroup,
    FaMapMarkerAlt,
    FaRulerHorizontal,
    FaUsers,
} from "react-icons/fa";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";
import ImageLightbox from "../../../shared/ImageLightbox";
import { resolveFileUrl } from "../../../../api/uploadApi";
import { formatCurrency } from "../../../../utils/currency";
import Toast from "../../../shared/Toast";
import { useToast } from "../../../shared/useToast";

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

const isSeasonActive = (tournament) => !tournament?.seasonStatus || tournament.seasonStatus === "Active";

const isBeforeRegistrationDeadline = (tournament) => {
    if (!tournament?.registrationDeadline) return true;
    const deadline = Date.parse(tournament.registrationDeadline);
    if (Number.isNaN(deadline)) return true;
    return Date.now() <= deadline;
};

const getRegistrationUnavailableReason = (tournament, tournamentStatus) => {
    if (tournamentStatus !== "OpenRegistration") {
        return registrationStatusLabel(tournamentStatus);
    }

    if (!isSeasonActive(tournament)) {
        return `Season is ${tournament.seasonStatus}.`;
    }

    if (!isBeforeRegistrationDeadline(tournament)) {
        return "Registration deadline has passed.";
    }

    return "";
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
    const { toast, showToast, hideToast } = useToast();

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
    const registrationUnavailableReason = getRegistrationUnavailableReason(tournament, tournamentStatus);
    const isRegistrationOpen = !registrationUnavailableReason;

    const handleSelectHorse = (horse) => {
        if (!horse.isEligible) return;
        setSelectedHorse(horse);
    };

    const handleSubmit = async () => {
        if (!isRegistrationOpen) {
            showToast(registrationUnavailableReason, 'error');
            return;
        }

        if (!selectedHorse) {
            showToast("Please select a horse before registering.", 'error');
            return;
        }
        setSubmitting(true);
        try {
            await ownerApi.createRegistration({
                raceId: tournament.raceId,
                horseId: selectedHorse.horseId,
                notes,
            });
            showToast("Registration submitted! Pending admin approval.", 'success');
            setTimeout(() => {
                onSuccess?.();
            }, 1500);
        } catch (err) {
            if (!handleOwnerAccessError(err, navigate)) {
                showToast(err.message || "Registration failed.", 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <Toast message={toast.message} type={toast.type} title={toast.title} onClose={hideToast} />
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={styles.imgWrapper}>
                    <img
                        src={tournament.imageUrl ? resolveFileUrl(tournament.imageUrl) : "/GoldenDerby.jpg"}
                        alt={tournament.tournamentName}
                        style={styles.img}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/GoldenDerby.jpg"; }}
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
                        {(tournament.seasonName || tournament.seasonStatus) && (
                            <div style={styles.infoRow}><span style={styles.infoIcon}><FaLayerGroup aria-hidden="true" /></span><div style={styles.infoContent}><small style={styles.infoLabel}>SEASON</small><p style={styles.infoValue}>{tournament.seasonName || "N/A"}{tournament.seasonStatus ? ` (${tournament.seasonStatus})` : ""}</p></div></div>
                        )}
                        {tournament.registrationDeadline && (
                            <div style={styles.infoRow}><span style={styles.infoIcon}><FaHourglassEnd aria-hidden="true" /></span><div style={styles.infoContent}><small style={styles.infoLabel}>DEADLINE</small><p style={styles.infoValue}>{tournament.registrationDeadline}</p></div></div>
                        )}
                        <div style={styles.infoRow}><span style={styles.infoIcon}><FaCalendarAlt aria-hidden="true" /></span><div style={styles.infoContent}><small style={styles.infoLabel}>DATE</small><p style={styles.infoValue}>{tournament.raceDate}</p></div></div>
                        <div style={styles.infoRow}><span style={styles.infoIcon}><FaMapMarkerAlt aria-hidden="true" /></span><div style={styles.infoContent}><small style={styles.infoLabel}>LOCATION</small><p style={styles.infoValue}>{tournament.location}</p></div></div>
                        <div style={styles.infoRow}><span style={styles.infoIcon}><FaUsers aria-hidden="true" /></span><div style={styles.infoContent}><small style={styles.infoLabel}>SLOTS LEFT</small><p style={styles.infoValue}>{tournament.availableSlots} / {tournament.maxHorses}</p></div></div>
                        <div style={styles.infoRow}><span style={styles.infoIcon}><FaRulerHorizontal aria-hidden="true" /></span><div style={styles.infoContent}><small style={styles.infoLabel}>DISTANCE</small><p style={styles.infoValue}>{tournament.distanceMeters} m</p></div></div>
                        <div style={styles.infoRow}><span style={styles.infoIcon}><FaCoins aria-hidden="true" /></span><div style={styles.infoContent}><small style={styles.infoLabel}>PRIZE POOL</small><h3 style={styles.prizeValue}>{formatCurrency(tournament.prizePool)}</h3></div></div>
                        <p style={styles.disclaimer}>
                            <FaExclamationTriangle aria-hidden="true" style={{ marginTop: "1px", flexShrink: 0 }} />
                            Registrations require admin approval before race participation.
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
                                            border: selectedHorse?.horseId === horse.horseId ? "2px solid #16305c" : "1px solid #ded2ad",
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <strong>{horse.horseName}</strong>
                                                <span style={{
                                                    fontSize: "11px", padding: "2px 8px", borderRadius: "10px",
                                                    backgroundColor: horse.isEligible ? "#e8f7ee" : "#f3e1df",
                                                    color: horse.isEligible ? "#16864f" : "#a4392f",
                                                }}>
                                                    {horse.isEligible ? "Eligible" : "Ineligible"}
                                                </span>
                                            </div>
                                            <small style={{ color: "#999" }}>{horse.breedName} • {horse.age} years • {horse.weightKg} kg • {horse.healthStatus}</small>
                                            <div style={{ marginTop: "6px" }}>
                                                <HealthCertificateLink url={horse.healthCertificateImageUrl} />
                                            </div>
                                            {!horse.isEligible && (
                                                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#a4392f" }}>{horse.ineligibleReason}</p>
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
                            <p style={styles.closedNotice}>{registrationUnavailableReason}</p>
                        )}
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !isRegistrationOpen}
                                style={{ ...styles.submitBtn, opacity: submitting || !isRegistrationOpen ? 0.7 : 1 }}
                            >
                                {submitting ? "Submitting..." : isRegistrationOpen ? "Submit Registration ➤" : registrationUnavailableReason}
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
    modal: { backgroundColor: "#fff", borderRadius: "14px", width: "980px", maxWidth: "96vw", maxHeight: "92vh", overflowY: "auto" },
    imgWrapper: { position: "relative" },
    img: { width: "100%", height: "180px", objectFit: "cover", borderRadius: "14px 14px 0 0" },
    imgOverlay: { position: "absolute", bottom: "16px", left: "20px" },
    upcomingBadge: { backgroundColor: "#16305c", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "4px", fontWeight: 700, letterSpacing: "0.04em" },
    tournamentName: { color: "#fff", margin: "6px 0 0", fontSize: "24px", fontWeight: 800, textShadow: "0 1px 3px rgba(0,0,0,0.5)" },
    closeBtn: { position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.4)", color: "#fff", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontSize: "14px" },
    body: { display: "grid", gridTemplateColumns: "290px 1fr", gap: "0" },
    infoCol: { padding: "26px 24px", borderRight: "1px solid #eee", backgroundColor: "#faf8f8" },
    infoRow: { display: "flex", gap: "14px", marginBottom: "18px", alignItems: "center", fontSize: "13px" },
    infoIcon: { display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#eef1f7", color: "#16305c", fontSize: "15px", flexShrink: 0 },
    infoContent: { display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 },
    infoLabel: { fontSize: "10.5px", fontWeight: 800, letterSpacing: "0.07em", color: "#8a8380" },
    infoValue: { margin: 0, fontSize: "14px", fontWeight: 700, color: "#1b2333" },
    prizeValue: { margin: 0, fontSize: "16px", fontWeight: 800, color: "#16305c" },
    disclaimer: { display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "11px", fontWeight: 600, color: "#8a8380", marginTop: "12px", paddingTop: "14px", borderTop: "1px solid #ede4e2" },
    formCol: { padding: "26px" },
    stepTitle: { fontSize: "11px", color: "#999", fontWeight: "700", letterSpacing: "1px", margin: "0 0 10px" },
    input: { width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" },
    horseCard: { display: "flex", gap: "12px", padding: "12px", borderRadius: "8px", marginBottom: "4px" },
    certificateLink: { display: "inline-flex", alignItems: "center", gap: "7px", color: "#16305c", fontSize: "11px", fontWeight: "700", textDecoration: "none" },
    certificateThumb: { width: "38px", height: "28px", borderRadius: "6px", border: "1px solid #dce5ef", objectFit: "cover", backgroundColor: "#fff8f6" },
    certificateMissing: { display: "inline-flex", borderRadius: "999px", backgroundColor: "#f4ecea", color: "#64748b", fontSize: "11px", fontWeight: "700", padding: "3px 8px" },
    closedNotice: { color: "#a4392f", backgroundColor: "#f3e1df", borderRadius: "8px", fontSize: "13px", fontWeight: 700, marginBottom: "8px", padding: "8px 10px" },
    submitBtn: { flex: 1, padding: "10px", backgroundColor: "#16305c", color: "#fff", border: "none", borderRadius: "999px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
    cancelBtn: { padding: "10px 20px", backgroundColor: "#fff", border: "1px solid #ded2ad", borderRadius: "999px", cursor: "pointer", fontSize: "14px" },
};
