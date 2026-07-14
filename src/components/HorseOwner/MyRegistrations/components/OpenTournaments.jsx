import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
                <h3 style={{ margin: 0 }}>🏆 Open Tournaments</h3>
            </div>

            {tournaments.length === 0 ? (
                <p style={{ color: "#999", textAlign: "center" }}>No open tournaments available.</p>
            ) : (
                <div style={styles.grid}>
                    {tournaments.map((t) => (
                        <div key={t.tournamentId} style={styles.card} onClick={() => setSelected(t)}>
                            <div style={styles.imgWrapper}>
                                <img
                                    src={t.imageUrl ? resolveFileUrl(t.imageUrl) : "/DubaiSprintCup.jpg"}
                                    alt={t.tournamentName}
                                    style={styles.img}
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/DubaiSprintCup.jpg"; }}
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
                                <p style={styles.date}>📅 {t.raceDate}</p>
                                <p style={styles.date}>📍 {t.location}</p>
                                <p style={styles.date}>🐎 {t.availableSlots} slots left</p>
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
    section: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee", marginBottom: "24px" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
    card: { borderRadius: "10px", overflow: "hidden", border: "1px solid #eee", cursor: "pointer", transition: "box-shadow 0.2s" },
    imgWrapper: { position: "relative" },
    img: { width: "100%", height: "120px", objectFit: "cover" },
    prizeBadge: { position: "absolute", top: "8px", right: "8px", backgroundColor: "#0b7f5a", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "10px" },
    info: { padding: "10px" },
    name: { margin: "0 0 4px", fontWeight: "bold", fontSize: "14px" },
    season: { margin: "2px 0", fontSize: "12px", color: "#0b7f5a", fontWeight: 700 },
    date: { margin: "2px 0", fontSize: "12px", color: "#999" },
};
