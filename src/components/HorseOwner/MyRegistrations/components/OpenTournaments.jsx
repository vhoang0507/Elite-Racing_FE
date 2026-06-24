import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";
import RegistrationModal from "./RegistrationModal";

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

const canRegisterTournament = (tournament) => getTournamentStatus(tournament) === "OpenRegistration";

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
                    {tournaments.map((t) => {
                        const tournamentStatus = getTournamentStatus(t);
                        const canRegister = canRegisterTournament(t);

                        return (
                        <div
                            key={t.tournamentId}
                            style={{
                                ...styles.card,
                                cursor: canRegister ? "pointer" : "not-allowed",
                                opacity: canRegister ? 1 : 0.72,
                            }}
                            onClick={() => {
                                if (canRegister) setSelected(t);
                            }}
                        >
                            <div style={styles.imgWrapper}>
                                <img src={t.imageUrl || "/DubaiSprintCup.jpg"} alt={t.tournamentName} style={styles.img} />
                                <span style={styles.prizeBadge}>£{Number(t.prizePool).toLocaleString()}+</span>
                            </div>
                            <div style={styles.info}>
                                <p style={styles.name}>{t.tournamentName}</p>
                                <p style={styles.date}>📅 {t.raceDate}</p>
                                <p style={styles.date}>📍 {t.location}</p>
                                <p style={styles.date}>🐎 {t.availableSlots} slots left</p>
                                <p style={canRegister ? styles.openStatus : styles.closedStatus}>
                                    {registrationStatusLabel(tournamentStatus)}
                                </p>
                            </div>
                        </div>
                        );
                    })}
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
    prizeBadge: { position: "absolute", top: "8px", right: "8px", backgroundColor: "#8B0000", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "10px" },
    info: { padding: "10px" },
    name: { margin: "0 0 4px", fontWeight: "bold", fontSize: "14px" },
    date: { margin: "2px 0", fontSize: "12px", color: "#999" },
    openStatus: { margin: "8px 0 0", fontSize: "11px", color: "#15803d", fontWeight: 700 },
    closedStatus: { margin: "8px 0 0", fontSize: "11px", color: "#b91c1c", fontWeight: 700 },
};
