const jockeys = [
    { name: "Julian de la Cruz", status: "ACTIVE", experience: 3, weight: "64kg", health: "Fit", distance: "3400 m", breed: "Arabian Expert", img: "/Jockey1.jpg" },
    { name: "Marcus Thorne", status: "ACTIVE", experience: 5, weight: "62kg", health: "Fit", distance: "3400 m", breed: "Arabian Pro", img: "/Jockey2.jpg" },
    { name: "Elena Vance", status: "INACTIVE", experience: 6, weight: "52kg", health: "Suspended", distance: "1000-3400 m", breed: "Arabian Expert", img: "/Jockey3.jpg" },
    { name: "Sanjay Gupta", status: "INACTIVE", experience: 4, weight: "65kg", health: "Injured", distance: "All", breed: "Mixed Specialist", img: "/Jockey4.jpg" },
];

const healthColor = {
    Fit: { color: "#155724" },
    Suspended: { color: "#856404" },
    Injured: { color: "#721c24" },
};

export default function JockeyGrid({ onInvite }) {
    return (
        <div style={styles.grid}>
            {jockeys.map((jockey, i) => (
                <div key={i} style={styles.card}>
                    {/* Image */}
                    <div style={styles.imgWrapper}>
                        <img src={jockey.img} alt={jockey.name} style={styles.img} />
                        <span style={{
                            ...styles.statusBadge,
                            backgroundColor: jockey.status === "ACTIVE" ? "#d4edda" : "#f8d7da",
                            color: jockey.status === "ACTIVE" ? "#155724" : "#721c24",
                        }}>
                            {jockey.status}
                        </span>
                    </div>

                    {/* Name */}
                    <p style={styles.name}>{jockey.name}</p>

                    {/* Stats */}
                    <div style={styles.statsRow}>
                        <div style={styles.stat}>
                            <small style={styles.statLabel}>EXPERIENCE</small>
                            <p style={styles.statValue}>{jockey.experience} Years</p>
                        </div>
                        <div style={styles.stat}>
                            <small style={styles.statLabel}>WEIGHT</small>
                            <p style={styles.statValue}>{jockey.weight}</p>
                        </div>
                        <div style={styles.stat}>
                            <small style={styles.statLabel}>HEALTH</small>
                            <p style={{ ...styles.statValue, ...healthColor[jockey.health] }}>{jockey.health}</p>
                        </div>
                    </div>

                    <div style={styles.divider} />

                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Distance Skill</span>
                        <span style={styles.infoValue}>{jockey.distance}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Breed Skill</span>
                        <span style={styles.infoValue}>{jockey.breed}</span>
                    </div>

                    {/* Button */}
                    <button
                        style={{
                            ...styles.inviteBtn,
                            backgroundColor: jockey.status === "ACTIVE" ? "#8B0000" : "#ccc",
                            cursor: jockey.status === "ACTIVE" ? "pointer" : "not-allowed",
                        }}
                        onClick={() => jockey.status === "ACTIVE" && onInvite(jockey)}
                    >
                        Send Invitation
                    </button>
                </div>
            ))}
        </div>
    );
}

const styles = {
    grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" },
    card: { backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" },
    imgWrapper: { position: "relative" },
    img: { width: "100%", height: "160px", objectFit: "cover" },
    statusBadge: { position: "absolute", top: "8px", left: "8px", fontSize: "11px", padding: "3px 8px", borderRadius: "10px", fontWeight: "600" },
    name: { margin: "12px 12px 8px", fontWeight: "bold", fontSize: "15px" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", padding: "0 12px", gap: "8px" },
    stat: { textAlign: "center" },
    statLabel: { fontSize: "10px", color: "#999" },
    statValue: { margin: "2px 0 0", fontWeight: "600", fontSize: "13px" },
    divider: { height: "1px", backgroundColor: "#f0f0f0", margin: "12px" },
    infoRow: { display: "flex", justifyContent: "space-between", padding: "0 12px", marginBottom: "6px" },
    infoLabel: { fontSize: "12px", color: "#999" },
    infoValue: { fontSize: "12px", fontWeight: "500" },
    inviteBtn: { width: "calc(100% - 24px)", margin: "12px", padding: "10px", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500" },
};