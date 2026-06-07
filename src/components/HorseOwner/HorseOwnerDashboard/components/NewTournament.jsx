import { useEffect, useState } from "react";
import { ownerApi } from "../../../../api/ownerApi";

export default function NewTournament() {
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
            <button style={styles.viewAll}>View All Tournament</button>

            <div style={styles.list}>
                {tournaments.length === 0 && <p style={{ color: '#705f5b', fontSize: '13px' }}>No upcoming tournaments</p>}
                {tournaments.map((t) => (
                    <div key={t.tournamentId} style={styles.card}>
                        <div style={styles.cardTop}>
                            <p style={styles.name}>{t.tournamentName}</p>
                            <span style={styles.date}>{t.raceDate}</span>
                        </div>
                        <p style={styles.location}>{t.location}</p>
                        <button style={styles.detailBtn}>View Details</button>
                    </div>
                ))}
            </div>
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#fff3ef", borderRadius: "12px", padding: "20px", border: "1px solid #edcfc9" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
    badge: { backgroundColor: "#860707", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "10px" },
    viewAll: { background: "none", border: "none", color: "#860707", cursor: "pointer", fontSize: "13px", marginBottom: "16px", padding: 0, fontWeight: "bold" },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    card: { backgroundColor: "#fffefd", borderRadius: "8px", padding: "14px", border: "1px solid #edcfc9" },
    cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    name: { margin: 0, fontWeight: "bold", fontSize: "14px", color: "#2d2020" },
    date: { fontSize: "12px", color: "#705f5b" },
    location: { margin: "4px 0 10px", fontSize: "12px", color: "#705f5b" },
    detailBtn: { width: "100%", padding: "8px", border: "1px solid #edcfc9", borderRadius: "6px", background: "#fffefd", cursor: "pointer", fontSize: "13px", color: "#2d2020" },
};
