import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBriefcaseMedical, FaCheckCircle, FaHorseHead, FaTrophy } from "react-icons/fa";
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
        { label: "Total Horses", value: stats?.totalHorses ?? "-", icon: FaHorseHead, tone: "navy" },
        { label: "Active Horses", value: stats?.activeHorses ?? "-", icon: FaCheckCircle, tone: "green" },
        { label: "Injured Horses", value: stats?.injuredHorses ?? "-", icon: FaBriefcaseMedical, tone: "burgundy" },
        { label: "In Races", value: stats?.inRaces ?? "-", icon: FaTrophy, tone: "gold" },
    ];

    return (
        <div style={styles.grid}>
            {items.map((s, i) => {
                const Icon = s.icon;
                return (
                    <div key={i} style={styles.card}>
                        <span style={{ ...styles.icon, ...toneStyle[s.tone] }}>
                            <Icon aria-hidden="true" />
                        </span>
                        <div>
                            <p style={styles.label}>{s.label}</p>
                            <h2 style={styles.value}>{s.value}</h2>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const toneStyle = {
    navy: { backgroundColor: "var(--admin-surface-strong)", color: "var(--admin-primary)" },
    green: { backgroundColor: "#e8f7ee", color: "#16864f" },
    burgundy: { backgroundColor: "#f3e1df", color: "#a4392f" },
    gold: { backgroundColor: "#faf2e0", color: "#8a6209" },
};

const styles = {
    grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
    card: { backgroundColor: "#fff", borderRadius: "var(--admin-radius)", padding: "20px", border: "1px solid var(--admin-border)", display: "flex", alignItems: "center", gap: "16px" },
    icon: { width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
    label: { margin: 0, fontSize: "12px", color: "#999" },
    value: { margin: 0, fontSize: "28px", fontWeight: "bold", color: "#111" },
};