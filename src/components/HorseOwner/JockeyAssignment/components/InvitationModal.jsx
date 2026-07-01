import { useState } from "react";
import { ownerApi } from "../../../../api/ownerApi";
import { resolveFileUrl } from "../../../../api/uploadApi";
import {
    formatCurrencyAmount,
    parseCurrency,
} from "../../../../utils/currency";

export default function InvitationModal({ jockey, registrationId, tournamentName, onClose, onSent }) {
    const [feeAmount, setFeeAmount] = useState(formatCurrencyAmount(500));
    const [message, setMessage] = useState(
        `Dear ${jockey?.fullName ?? ''},\n\nWe would love for you to ride our horse in the upcoming race...`
    );
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    if (!jockey) return null;

    const handleSend = async () => {
        if (!registrationId) return;
        setSending(true);
        setError('');
        try {
            await ownerApi.sendJockeyInvitation(registrationId, {
                jockeyId: jockey.jockeyId,
                feeAmount: parseCurrency(feeAmount),
                message: message?.trim() || null,
            });
            onSent?.(jockey.fullName);
        } catch (err) {
            setError(err.message || 'Failed to send invitation');
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                <div style={styles.header}>
                    <div>
                        <h3 style={{ margin: 0 }}>Jockey Assignment Form</h3>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#999" }}>
                            Send a formal invitation to {jockey.fullName} for {tournamentName || "this race"}
                        </p>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.jockeyCard}>
                    <img src={jockey.profileImageUrl ? resolveFileUrl(jockey.profileImageUrl) : '/Jockey1.jpg'} alt={jockey.fullName} style={styles.jockeyImg} />
                    <div style={{ flex: 1 }}>
                        <p style={styles.jockeyName}>{jockey.fullName}</p>
                        <div style={styles.jockeyStats}>
                            <div><small>EXPERIENCE</small><p>{jockey.yearsOfExperience} Years</p></div>
                            <div><small>WEIGHT</small><p>{jockey.weightKg}kg</p></div>
                            <div><small>HEALTH</small><p>{jockey.healthStatus}</p></div>
                        </div>
                    </div>
                </div>

                <div style={styles.formRow}>
                    <div style={styles.field}>
                        <label style={styles.label}>TOURNAMENT REGISTRATION</label>
                        <input defaultValue={tournamentName || ''} disabled style={styles.input} />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>PROPOSED APPEARANCE FEE ($)</label>
                        <input
                            value={feeAmount}
                            inputMode="numeric"
                            onChange={(e) => setFeeAmount(formatCurrencyAmount(e.target.value))}
                            type="text"
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>PERSONALIZED MESSAGE (OPTIONAL)</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{ ...styles.input, height: "100px", resize: "vertical" }}
                    />
                </div>

                {error && <p style={{ color: "#721c24", fontSize: "12px", margin: "0 0 12px" }}>{error}</p>}

                <div style={styles.footer}>
                    <span style={{ fontWeight: "bold", color: "#610000" }}>Elite Racing League</span>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button style={styles.cancelBtn} onClick={onClose} disabled={sending}>Cancel</button>
                        <button style={styles.sendBtn} onClick={handleSend} disabled={sending}>
                            {sending ? "Sending..." : "Send Invitation ➤"}
                        </button>
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
    jockeyCard: { backgroundColor: "#610000", borderRadius: "10px", padding: "16px", display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", color: "#fff" },
    jockeyImg: { width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" },
    jockeyName: { margin: 0, fontWeight: "bold", fontSize: "16px" },
    jockeyStats: { display: "flex", gap: "24px", fontSize: "13px", marginTop: "8px" },
    formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
    field: { marginBottom: "16px" },
    label: { display: "block", fontSize: "11px", color: "#999", fontWeight: "700", letterSpacing: "1px", marginBottom: "6px" },
    input: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" },
    footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid #eee" },
    cancelBtn: { padding: "10px 20px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
    sendBtn: { padding: "10px 24px", backgroundColor: "#610000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
};
