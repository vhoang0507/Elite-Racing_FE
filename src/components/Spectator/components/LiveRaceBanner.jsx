export default function LiveRaceBanner() {
    return (
        <div style={styles.banner}>
            <img src="/DubaiSprintCup.jpg" alt="race" style={styles.img} />
            <div style={styles.overlay}>
                <div style={styles.tags}>
                    <span style={styles.liveTag}>● LIVE NOW</span>
                    <span style={styles.locationTag}>Dubai Meydan • UAE</span>
                </div>
                <h2 style={styles.title}>Dubai Sprint Cup</h2>
                <div style={styles.info}>
                    <div>
                        <small style={styles.infoLabel}>PRIZE POOL</small>
                        <p style={styles.prizeValue}>$2,000,000</p>
                    </div>
                    <div>
                        <small style={styles.infoLabel}>DISTANCE</small>
                        <p style={styles.infoValue}>2400 m</p>
                    </div>
                </div>
                <div style={styles.buttons}>
                    <button style={styles.primaryBtn}>Make Prediction</button>
                    <button style={styles.secondaryBtn}>View Tournament</button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    banner: { position: "relative", borderRadius: "12px", overflow: "hidden", marginBottom: "24px" },
    img: { width: "100%", height: "200px", objectFit: "cover" },
    overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to right, rgba(0,0,0,0.8) 40%, transparent)", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center" },
    tags: { display: "flex", gap: "8px", marginBottom: "8px" },
    liveTag: { backgroundColor: "#8B0000", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "4px" },
    locationTag: { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "4px" },
    title: { color: "#fff", margin: "0 0 12px", fontSize: "28px", fontWeight: "bold" },
    info: { display: "flex", gap: "24px", marginBottom: "16px" },
    infoLabel: { color: "rgba(255,255,255,0.7)", fontSize: "11px" },
    prizeValue: { margin: "2px 0 0", color: "#FFD700", fontWeight: "bold", fontSize: "18px" },
    infoValue: { margin: "2px 0 0", color: "#fff", fontWeight: "bold", fontSize: "16px" },
    buttons: { display: "flex", gap: "12px" },
    primaryBtn: { backgroundColor: "#8B0000", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
    secondaryBtn: { backgroundColor: "transparent", color: "#fff", border: "1px solid #fff", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontSize: "14px" },
};