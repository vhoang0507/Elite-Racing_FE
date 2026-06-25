import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";

export default function HorseStats() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        ownerApi.getHorseStats()
            .then(setStats)
            .catch((err) => handleOwnerAccessError(err, navigate));
    }, []);

    const items = [
        { label: "Total Horses", value: stats?.totalHorses ?? "-", icon: "🐴" },
        { label: "Active Horses", value: stats?.activeHorses ?? "-", icon: "✅" },
        { label: "Injured Horses", value: stats?.injuredHorses ?? "-", icon: "🏥" },
        { label: "In Races", value: stats?.inRaces ?? "-", icon: "🏆" },
    ];

    return (
        <div style={styles.grid}>
            {items.map((s, i) => (
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
    card: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee", display: "flex", alignItems: "center", gap: "16px" },
    icon: { fontSize: "28px" },
    label: { margin: 0, fontSize: "12px", color: "#999" },
    value: { margin: 0, fontSize: "28px", fontWeight: "bold", color: "#111" },
};