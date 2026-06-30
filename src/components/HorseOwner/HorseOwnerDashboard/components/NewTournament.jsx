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
                <h3 style={{ margin: 0 }}>New Tournament</h3>
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
                        <p style={styles.location}>{t.location}</p>
                        <button style={styles.detailBtn} onClick={() => navigate('/owner/registrations')}>View Details</button>
                    </div>
                ))}
            </div>
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#e8f7ef", borderRadius: "8px", padding: "20px", border: "1px solid #dce5ef", boxShadow: "0 12px 28px rgba(91, 26, 19, 0.05)" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
    badge: { backgroundColor: "#0b7f5a", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "999px", fontWeight: 700 },
    viewAll: { background: "none", border: "none", color: "#0b7f5a", cursor: "pointer", fontSize: "13px", marginBottom: "16px", padding: 0, fontWeight: "bold" },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    card: { backgroundColor: "#fffefd", borderRadius: "8px", padding: "14px", border: "1px solid #dce5ef" },
    cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    name: { margin: 0, fontWeight: "bold", fontSize: "14px", color: "#2d2020" },
    date: { fontSize: "12px", color: "#64748b" },
    location: { margin: "4px 0 10px", fontSize: "12px", color: "#64748b" },
    detailBtn: { width: "100%", padding: "8px", border: "1px solid #dce5ef", borderRadius: "8px", background: "#fffefd", cursor: "pointer", fontSize: "13px", color: "#2d2020", fontWeight: 700 },
};
