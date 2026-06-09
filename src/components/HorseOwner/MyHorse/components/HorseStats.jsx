import { useEffect, useState } from "react";
import { ownerApi } from "../../../../api/ownerApi";

export default function HorseStats() {
    const [stats, setStats] = useState({ totalHorses: 0, activeHorses: 0, injuredHorses: 0, inRaces: 0 });

    useEffect(() => {
        let mounted = true;
        ownerApi.getHorseStats()
            .then((data) => { if (mounted) setStats(data); })
            .catch(() => {});
        return () => { mounted = false; };
    }, []);

    const cards = [
        { label: "Total Horses", value: String(stats.totalHorses).padStart(2, '0'), icon: "🐴" },
        { label: "Active Horses", value: String(stats.activeHorses).padStart(2, '0'), icon: "✅" },
        { label: "Injured Horses", value: String(stats.injuredHorses).padStart(2, '0'), icon: "🏥" },
        { label: "In Races", value: String(stats.inRaces).padStart(2, '0'), icon: "🏆" },
    ];

    return (
        <div style={styles.grid}>
            {cards.map((s, i) => (
                <div key={i} style={styles.card}>
                    <span style={styles.icon}>{s.icon}</span>
                    <div>
                        <p style={styles.label}>{s.label}</p>
                        <h2 style={styles.value}>{s.value}</h2>
                    </div>
                </div>
            ))}
        </div>
    );
}

const styles = {
    grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
    card: { backgroundColor: "#fffefd", borderRadius: "12px", padding: "20px", border: "1px solid #edcfc9", display: "flex", alignItems: "center", gap: "16px" },
    icon: { fontSize: "28px" },
    label: { margin: 0, fontSize: "12px", color: "#705f5b" },
    value: { margin: 0, fontSize: "28px", fontWeight: "bold", color: "#2d2020" },
};
