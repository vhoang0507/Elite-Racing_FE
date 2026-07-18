import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaHorseHead, FaMapMarkerAlt, FaTrophy } from "react-icons/fa";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";
import { resolveFileUrl } from "../../../../api/uploadApi";
import { formatCurrency } from "../../../../utils/currency";
import RegistrationModal from "./RegistrationModal";

export default function OpenTournaments() {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        setLoading(true);
        ownerApi.getOpenTournaments(6)
            .then(setTournaments)
            .catch((err) => {
                if (!handleOwnerAccessError(err, navigate)) setTournaments([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={{ textAlign: "center", color: "#999" }}>Loading...</p>;

    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaTrophy aria-hidden="true" style={{ color: "var(--admin-primary)" }} />
                    Open Tournaments
                </h3>
            </div>

            {tournaments.length === 0 ? (
                <p style={{ color: "#999", textAlign: "center" }}>No open tournaments available.</p>
            ) : (
                <div style={styles.grid}>
                    {tournaments.map((t) => (
                        <div key={t.tournamentId} style={styles.card} onClick={() => setSelected(t)}>
                            <div style={styles.imgWrapper}>
                                <img
                                    src={t.imageUrl ? resolveFileUrl(t.imageUrl) : "/GoldenDerby.jpg"}
                                    alt={t.tournamentName}
                                    style={styles.img}
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/GoldenDerby.jpg"; }}
                                />
                                <span style={styles.prizeBadge}>{formatCurrency(t.prizePool)}+</span>
                            </div>
                            <div style={styles.info}>
                                <p style={styles.name}>{t.tournamentName}</p>
                                {(t.seasonName || t.seasonStatus) && (
                                    <p style={styles.season}>
                                        Season: {t.seasonName || "N/A"}{t.seasonStatus ? ` (${t.seasonStatus})` : ""}
                                    </p>
                                )}
                                {t.registrationDeadline && (
                                    <p style={styles.date}>Deadline: {t.registrationDeadline}</p>
                                )}
                                <p style={styles.date}><FaCalendarAlt aria-hidden="true" style={{ marginRight: 5 }} />{t.raceDate}</p>
                                <p style={styles.date}><FaMapMarkerAlt aria-hidden="true" style={{ marginRight: 5 }} />{t.location}</p>
                                <p style={styles.date}><FaHorseHead aria-hidden="true" style={{ marginRight: 5 }} />{t.availableSlots} slots left</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selected && (
                <RegistrationModal
                    tournament={selected}
                    onClose={() => setSelected(null)}
                    onSuccess={() => {
                        setSelected(null);
                        ownerApi.getOpenTournaments(6).then(setTournaments).catch(() => { });
                    }}
                />
            )}
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #ded2ad", marginBottom: "24px", boxShadow: "0 8px 22px rgba(15,23,42,0.06)" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
    card: { borderRadius: "12px", overflow: "hidden", border: "1px solid #ded2ad", cursor: "pointer", transition: "box-shadow 0.2s" },
    imgWrapper: { position: "relative" },
    img: { width: "100%", height: "120px", objectFit: "cover" },
    prizeBadge: { position: "absolute", top: "8px", right: "8px", backgroundColor: "#16305c", color: "#fff", fontSize: "11px", padding: "3px 10px", borderRadius: "999px", fontWeight: 700 },
    info: { padding: "10px" },
    name: { margin: "0 0 4px", fontWeight: "bold", fontSize: "14px", color: "#0a1930" },
    season: { margin: "2px 0", fontSize: "12px", color: "#16305c", fontWeight: 700 },
    date: { margin: "2px 0", fontSize: "12px", color: "#6b6456" },
};
