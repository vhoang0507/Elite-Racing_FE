import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ownerApi } from "../../../../api/ownerApi";

export default function NewTournament() {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);

    useEffect(() => {
        let mounted = true;
        ownerApi.getNewTournaments()
            .then((res) => { if (mounted) setTournaments(res || []); })
            .catch(() => {});
        return () => { mounted = false; };
    }, []);

    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h3 style={{ margin: 0, color: "#0a1930" }}>New Tournament</h3>
                <span style={styles.badge}>{tournaments.length} New</span>
            </div>
            <button style={styles.viewAll} onClick={() => navigate('/owner/registrations')}>View All Tournament</button>

            <div style={styles.list}>
                {tournaments.length === 0 && <p style={{ color: '#64748b', fontSize: '13px' }}>No upcoming tournaments</p>}
                {tournaments.map((t) => (
                    <div key={t.tournamentId} style={styles.card}>
                        <div style={styles.cardTop}>
                            <p style={styles.name}>{t.tournamentName}</p>
                            <span style={styles.date}>{t.raceDate}</span>
                        </div>
                        {(t.seasonName || t.seasonStatus) && (
                            <p style={styles.season}>
                                Season: {t.seasonName || "N/A"}{t.seasonStatus ? ` (${t.seasonStatus})` : ""}
                            </p>
                        )}
                        {t.registrationDeadline && (
                            <p style={styles.location}>Deadline: {t.registrationDeadline}</p>
                        )}
                        <p style={styles.location}>{t.location}</p>
                        <button style={styles.detailBtn} onClick={() => navigate('/owner/registrations')}>View Details</button>
                    </div>
                ))}
            </div>
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#efe8d6", borderRadius: "12px", padding: "20px", border: "1px solid #ded2ad", boxShadow: "0 8px 22px rgba(15,23,42,0.06)" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
    badge: { backgroundColor: "#16305c", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "999px", fontWeight: 700 },
    viewAll: { background: "none", border: "none", color: "#16305c", cursor: "pointer", fontSize: "13px", marginBottom: "16px", padding: 0, fontWeight: "bold" },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    card: { backgroundColor: "#fff", borderRadius: "10px", padding: "14px", border: "1px solid #ded2ad" },
    cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    name: { margin: 0, fontWeight: "bold", fontSize: "14px", color: "#1b2333" },
    date: { fontSize: "12px", color: "#6b6456" },
    season: { margin: "6px 0 2px", fontSize: "12px", color: "#16305c", fontWeight: 700 },
    location: { margin: "4px 0 10px", fontSize: "12px", color: "#6b6456" },
    detailBtn: { width: "100%", padding: "8px", border: "1px solid #ded2ad", borderRadius: "999px", background: "#fff", cursor: "pointer", fontSize: "13px", color: "#1b2333", fontWeight: 700 },
};
