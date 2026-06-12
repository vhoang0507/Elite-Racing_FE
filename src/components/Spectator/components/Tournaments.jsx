const stats = [
    { label: "PUBLISHED", value: "12", icon: "📅" },
    { label: "UPCOMING RACES", value: "8", icon: "🏇" },
    { label: "PARTICIPATING HORSES", value: "84", icon: "🐴" },
    { label: "PROF. JOCKEYS", value: "36", icon: "🏆" },
];

const tournaments = [
    {
        name: "Dubai Sprint Cup",
        tag: "LIVE",
        tagExtra: "Group 1 International",
        prize: "$2,000,000",
        location: "Dubai Meydan",
        date: "Jun 12, 2026",
        raceStart: "16:00",
        distance: "2400 m",
        img: "/DubaiSprintCup.jpg",
        featured: true,
        horses: [],
    },
    {
        name: "Royal Turf Championship",
        prize: "$1,900,000",
        distance: "2400m Turf Race",
        date: "Jul 12, 2026",
        img: "/RoyalTurfChampionship.jpg",
        featured: false,
        horses: [
            { name: "Midnight Blaze", jockey: "Marcus Thorne" },
            { name: "Silver Storm", jockey: "Elena Rossi" },
            { name: "Golden Gale", jockey: "John Smith" },
        ],
    },
    {
        name: "Emerald Fields Derby",
        prize: "$850,000",
        distance: "1800m Grass Track",
        date: "Aug 05, 2026",
        img: "/GoldenDerby.jpg",
        featured: false,
        horses: [
            { name: "Midnight Blaze", jockey: "Marcus Thorne" },
            { name: "Silver Storm", jockey: "Elena Rossi" },
            { name: "Golden Gale", jockey: "John Smith" },
        ],
    },
];

export default function Tournaments() {
    return (
        <div>
            {/* Title */}
            <h2 style={{ margin: "0 0 4px" }}>Tournaments</h2>
            <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#999" }}>
                Explore upcoming events, analyze lineups, and predict champions.
            </p>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {stats.map((s, i) => (
                    <div key={i} style={styles.statCard}>
                        <span style={{ fontSize: "20px" }}>{s.icon}</span>
                        <div>
                            <small style={styles.statLabel}>{s.label}</small>
                            <h3 style={styles.statValue}>{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Featured Tournament */}
            <div style={styles.featured}>
                <img src={tournaments[0].img} alt={tournaments[0].name} style={styles.featuredImg} />
                <div style={styles.featuredOverlay}>
                    <div style={styles.featuredTags}>
                        <span style={styles.liveTag}>● LIVE</span>
                        <span style={styles.groupTag}>{tournaments[0].tagExtra}</span>
                    </div>
                    <h2 style={styles.featuredTitle}>{tournaments[0].name}</h2>
                    <div style={styles.featuredInfo}>
                        <span>💰 {tournaments[0].prize}</span>
                        <span>📍 {tournaments[0].location}</span>
                        <span>📅 {tournaments[0].date}</span>
                        <span>⏰ Race Starts: {tournaments[0].raceStart}</span>
                        <span>📏 {tournaments[0].distance}</span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                        <button style={styles.predictBtn}>Predict Winner</button>
                        <button style={styles.detailsBtn}>View Details</button>
                    </div>
                </div>
            </div>

            {/* Tournament List */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {tournaments.slice(1).map((t, i) => (
                    <div key={i} style={styles.card}>
                        <img src={t.img} alt={t.name} style={styles.cardImg} />
                        <div style={styles.cardBody}>
                            <div style={styles.cardHeader}>
                                <div>
                                    <p style={styles.cardName}>{t.name}</p>
                                    <p style={styles.cardDistance}>{t.distance} • {t.date}</p>
                                </div>
                                <span style={styles.cardPrize}>{t.prize}</span>
                            </div>

                            <p style={styles.horsesLabel}>HORSES AND JOCKEYS</p>
                            {t.horses.map((h, j) => (
                                <div key={j} style={styles.horseRow}>
                                    <img src="/Horse1.jpg" alt={h.name} style={styles.horseImg} />
                                    <div>
                                        <p style={styles.horseName}>{h.name}</p>
                                        <p style={styles.horseJockey}>Jockey: {h.jockey}</p>
                                    </div>
                                </div>
                            ))}

                            <button style={styles.moreBtn}>More Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    statCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "16px", border: "1px solid #eee", display: "flex", alignItems: "center", gap: "12px" },
    statLabel: { color: "#999", fontSize: "11px", fontWeight: "600" },
    statValue: { margin: "2px 0 0", fontSize: "22px", fontWeight: "bold" },
    featured: { position: "relative", borderRadius: "12px", overflow: "hidden", marginBottom: "24px" },
    featuredImg: { width: "100%", height: "220px", objectFit: "cover" },
    featuredOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to right, rgba(0,0,0,0.85) 50%, transparent)", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center" },
    featuredTags: { display: "flex", gap: "8px", marginBottom: "8px" },
    liveTag: { backgroundColor: "#8B0000", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "4px" },
    groupTag: { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "4px" },
    featuredTitle: { color: "#fff", margin: "0 0 12px", fontSize: "26px" },
    featuredInfo: { display: "flex", flexWrap: "wrap", gap: "16px", color: "rgba(255,255,255,0.8)", fontSize: "13px" },
    predictBtn: { backgroundColor: "#fff", color: "#8B0000", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
    detailsBtn: { backgroundColor: "transparent", color: "#fff", border: "1px solid #fff", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontSize: "14px" },
    card: { backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" },
    cardImg: { width: "100%", height: "140px", objectFit: "cover" },
    cardBody: { padding: "16px" },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" },
    cardName: { margin: 0, fontWeight: "bold", fontSize: "15px" },
    cardDistance: { margin: "4px 0 0", fontSize: "12px", color: "#999" },
    cardPrize: { color: "#8B0000", fontWeight: "bold", fontSize: "14px" },
    horsesLabel: { fontSize: "11px", color: "#999", fontWeight: "600", marginBottom: "8px" },
    horseRow: { display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px", padding: "8px", backgroundColor: "#faf8f8", borderRadius: "8px" },
    horseImg: { width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" },
    horseName: { margin: 0, fontWeight: "600", fontSize: "13px" },
    horseJockey: { margin: 0, fontSize: "11px", color: "#999" },
    moreBtn: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff", cursor: "pointer", fontSize: "13px", marginTop: "8px" },
};