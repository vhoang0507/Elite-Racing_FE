export default function InvitationModal({ jockey, onClose }) {
    if (!jockey) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h3 style={{ margin: 0 }}>Jockey Assignment Form</h3>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#999" }}>
                            Send a formal invitation to {jockey.name} for the upcoming Dubai Sprint Cup
                        </p>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* Jockey Card */}
                <div style={styles.jockeyCard}>
                    <img src={jockey.img} alt={jockey.name} style={styles.jockeyImg} />
                    <div style={{ flex: 1 }}>
                        <p style={styles.jockeyName}>{jockey.name}</p>
                        <p style={styles.jockeyLocation}>📍 Lexington, KY</p>
                        <div style={styles.jockeyStats}>
                            <div><small>EXPERIENCE</small><p>{jockey.experience} Years</p></div>
                            <div><small>WEIGHT</small><p>{jockey.weight}</p></div>
                            <div><small>HEALTH</small><p>Fit</p></div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div style={styles.formRow}>
                    <div style={styles.field}>
                        <label style={styles.label}>TOURNAMENT REGISTRATION</label>
                        <input defaultValue="Dubai Sprint Cup" style={styles.input} />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>PROPOSED APPEARANCE FEE ($)</label>
                        <input defaultValue="500" type="number" style={styles.input} />
                    </div>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>PERSONALIZED MESSAGE (OPTIONAL)</label>
                    <textarea
                        defaultValue={`Dear ${jockey.name},\n\nWe would love for you to ride our star thoroughbred 'Desert Thunder' in the upcoming qualifiers...`}
                        style={{ ...styles.input, height: "100px", resize: "vertical" }}
                    />
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <span style={{ fontWeight: "bold", color: "#8B0000" }}>Elite Racing League</span>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                        <button style={styles.sendBtn}>Send Invitation ➤</button>
                    </div>
                </div>

            </div>
        </div>
    );
}

const styles = {
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
    modal: { backgroundColor: "#fff", borderRadius: "12px", width: "600px", maxWidth: "95vw", padding: "24px" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
    closeBtn: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#999" },
    jockeyCard: { backgroundColor: "#8B0000", borderRadius: "10px", padding: "16px", display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", color: "#fff" },
    jockeyImg: { width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" },
    jockeyName: { margin: 0, fontWeight: "bold", fontSize: "16px" },
    jockeyLocation: { margin: "4px 0 8px", fontSize: "13px", opacity: 0.8 },
    jockeyStats: { display: "flex", gap: "24px", fontSize: "13px" },
    formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
    field: { marginBottom: "16px" },
    label: { display: "block", fontSize: "11px", color: "#999", fontWeight: "700", letterSpacing: "1px", marginBottom: "6px" },
    input: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" },
    footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid #eee" },
    cancelBtn: { padding: "10px 20px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
    sendBtn: { padding: "10px 24px", backgroundColor: "#8B0000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
};