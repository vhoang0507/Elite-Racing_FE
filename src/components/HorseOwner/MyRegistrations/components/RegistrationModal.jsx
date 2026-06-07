export default function RegistrationModal({ tournament, onClose }) {
    if (!tournament) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                {/* Header ảnh */}
                <div style={styles.imgWrapper}>
                    <img src={tournament.img} alt={tournament.name} style={styles.img} />
                    <div style={styles.imgOverlay}>
                        <span style={styles.upcomingBadge}>UPCOMING MAJOR EVENT</span>
                        <h2 style={styles.tournamentName}>{tournament.name}</h2>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* Info + Form */}
                <div style={styles.body}>

                    {/* Cột trái - Tournament Info */}
                    <div style={styles.infoCol}>
                        <div style={styles.infoRow}><span>📅</span><div><small>DATE & TIME</small><p>12 Jun 2026 • 18:30 GST</p></div></div>
                        <div style={styles.infoRow}><span>📍</span><div><small>LOCATION</small><p>Dubai Meydan, UAE</p></div></div>
                        <div style={styles.infoRow}><span>👥</span><div><small>CAPACITY</small><p>Max 12 Horses • 4 Slots Left</p></div></div>
                        <div style={styles.infoRow}><span>📏</span><div><small>DISTANCE</small><p>2400 m</p></div></div>
                        <div style={styles.infoRow}><span>💰</span><div><small>PRIZE POOL</small><h3 style={{ margin: 0, color: "#8B0000" }}>$2,000,000</h3></div></div>
                        <div style={styles.infoRow}><span>🎫</span><div><small>ENTRY FEE</small><p>$5,000</p></div></div>
                        <div style={styles.infoRow}><span>🏇</span><div><small>ASSIGNED JOCKEY</small><p>Marcus Bennett</p></div></div>
                        <div style={styles.infoRow}><span>⏰</span><div><small>DEADLINE</small><p style={{ color: "#8B0000" }}>08 Jun 2026</p></div></div>
                        <p style={{ fontSize: "11px", color: "#999", marginTop: "8px" }}>
                            ⚠️ Registrations require admin approval before race participation.
                        </p>
                    </div>

                    {/* Cột phải - Form */}
                    <div style={styles.formCol}>
                        <h4 style={styles.stepTitle}>STEP 1: HORSE OWNER INFORMATION</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                            <div>
                                <label style={styles.label}>Name</label>
                                <input defaultValue="Ella Smith" style={styles.input} />
                            </div>
                            <div>
                                <label style={styles.label}>Email</label>
                                <input defaultValue="e.smith@erl.org" style={styles.input} />
                            </div>
                        </div>

                        <h4 style={styles.stepTitle}>STEP 2: HORSE INFORMATION</h4>
                        <select style={{ ...styles.input, marginBottom: "12px" }}>
                            <option>Choose Your Horse</option>
                            <option>Desert Thunder</option>
                            <option>Shadow Dancer</option>
                        </select>

                        <div style={styles.horseCard}>
                            <img src="/Horse1.jpg" alt="horse" style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <strong>Desert Thunder</strong>
                                    <span style={{ backgroundColor: "#d4edda", color: "#155724", fontSize: "11px", padding: "2px 8px", borderRadius: "10px" }}>HEALTHY</span>
                                </div>
                                <small style={{ color: "#999" }}>Arabian</small>
                                <div style={{ display: "flex", gap: "16px", marginTop: "4px", fontSize: "12px" }}>
                                    <span>520kg</span><span>168cm</span><span>5 years</span><span style={{ color: "green" }}>Active</span>
                                </div>
                            </div>
                        </div>

                        <h4 style={styles.stepTitle}>STEP 3: PAYMENT</h4>
                        <div style={styles.paymentBox}>
                            <div style={styles.payRow}><span>Participation Fee</span><span>$5,000.00</span></div>
                            <div style={styles.payRow}><span>Insurance</span><span>$500.00</span></div>
                            <div style={styles.payRow}><span>Stable Service</span><span>$300.00</span></div>
                            <div style={{ ...styles.payRow, fontWeight: "bold", borderTop: "1px solid #eee", paddingTop: "8px", marginTop: "4px" }}>
                                <span>TOTAL AMOUNT</span><span style={{ color: "#8B0000" }}>$5,800.00</span>
                            </div>
                            <button style={styles.payBtn}>💳 Proceed Payment</button>
                        </div>

                        <h4 style={styles.stepTitle}>STEP 4: ADDITIONAL NOTES</h4>
                        <textarea
                            placeholder="Dietary restrictions, stable placement preferences, or equipment details..."
                            style={{ ...styles.input, height: "80px", resize: "vertical" }}
                        />

                        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                            <button style={styles.submitBtn}>Submit Registration ➤</button>
                            <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
    modal: { backgroundColor: "#fff", borderRadius: "12px", width: "900px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" },
    imgWrapper: { position: "relative" },
    img: { width: "100%", height: "160px", objectFit: "cover", borderRadius: "12px 12px 0 0" },
    imgOverlay: { position: "absolute", bottom: "16px", left: "16px" },
    upcomingBadge: { backgroundColor: "#8B0000", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "4px" },
    tournamentName: { color: "#fff", margin: "4px 0 0", fontSize: "22px", textShadow: "0 1px 3px rgba(0,0,0,0.5)" },
    closeBtn: { position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.4)", color: "#fff", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontSize: "14px" },
    body: { display: "grid", gridTemplateColumns: "240px 1fr", gap: "0" },
    infoCol: { padding: "20px", borderRight: "1px solid #eee", backgroundColor: "#faf8f8" },
    infoRow: { display: "flex", gap: "10px", marginBottom: "12px", alignItems: "flex-start", fontSize: "13px" },
    formCol: { padding: "20px" },
    stepTitle: { fontSize: "11px", color: "#999", fontWeight: "700", letterSpacing: "1px", margin: "0 0 10px" },
    label: { fontSize: "12px", color: "#555", display: "block", marginBottom: "4px" },
    input: { width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" },
    horseCard: { display: "flex", gap: "12px", padding: "12px", border: "1px solid #eee", borderRadius: "8px", marginBottom: "16px" },
    paymentBox: { backgroundColor: "#faf8f8", borderRadius: "8px", padding: "14px", marginBottom: "16px" },
    payRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" },
    payBtn: { width: "100%", padding: "10px", backgroundColor: "#8B0000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "8px", fontSize: "14px" },
    submitBtn: { flex: 1, padding: "10px", backgroundColor: "#8B0000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
    cancelBtn: { padding: "10px 20px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
};