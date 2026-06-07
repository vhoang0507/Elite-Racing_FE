import { useState } from "react";
import RegistrationModal from "./RegistrationModal";

const tournaments = [
    { name: "Dubai Sprint Cup", date: "Oct 15, 2024", prize: "£2.5M+", img: "/DubaiSprintCup.jpg" },
    { name: "Royal Turf Championship", date: "Nov 30, 2024", prize: "£1.5M+", img: "/RoyalTurfChampionship.jpg" },
    { name: "Golden Derby", date: "Dec 05, 2024", prize: "£3.2M+", img: "/GoldenDerby.jpg" },
];

export default function OpenTournaments() {
    const [selected, setSelected] = useState(null);

    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h3 style={{ margin: 0 }}>🏆 Open Tournaments</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button style={styles.navBtn}>‹</button>
                    <button style={styles.navBtn}>›</button>
                </div>
            </div>

            <div style={styles.grid}>
                {tournaments.map((t, i) => (
                    <div key={i} style={styles.card} onClick={() => setSelected(t)}>
                        <div style={styles.imgWrapper}>
                            <img src={t.img} alt={t.name} style={styles.img} />
                            <span style={styles.prizeBadge}>{t.prize}</span>
                        </div>
                        <div style={styles.info}>
                            <p style={styles.name}>{t.name}</p>
                            <p style={styles.date}>📅 {t.date}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selected && (
                <RegistrationModal
                    tournament={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee", marginBottom: "24px" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
    navBtn: { width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: "16px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
    card: { borderRadius: "10px", overflow: "hidden", border: "1px solid #eee", cursor: "pointer", transition: "box-shadow 0.2s" },
    imgWrapper: { position: "relative" },
    img: { width: "100%", height: "120px", objectFit: "cover" },
    prizeBadge: { position: "absolute", top: "8px", right: "8px", backgroundColor: "#8B0000", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "10px" },
    info: { padding: "10px" },
    name: { margin: "0 0 4px", fontWeight: "bold", fontSize: "14px" },
    date: { margin: 0, fontSize: "12px", color: "#999" },
};