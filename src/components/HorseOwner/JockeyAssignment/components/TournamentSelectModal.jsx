export default function TournamentSelectModal({ registrations, selectedId, onSelect, onClose }) {
    const openRegistrations = registrations.filter(r => r.tournamentStatus === 'OpenRegistration');

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Select Tournament</h3>
                    <button style={styles.closeBtn} onClick={onClose} type="button">✕</button>
                </div>

                {openRegistrations.length === 0 ? (
                    <p style={styles.emptyText}>
                        No tournaments are currently open for registration.
                    </p>
                ) : (
                    <div style={styles.list}>
                        {openRegistrations.map((r) => (
                            <button
                                key={r.registrationId}
                                type="button"
                                onClick={() => onSelect(r)}
                                style={{
                                    ...styles.item,
                                    ...(selectedId === r.registrationId ? styles.itemActive : {}),
                                }}
                            >
                                <div style={styles.itemMain}>
                                    <strong style={styles.itemTitle}>{r.tournamentName}</strong>
                                    <span style={styles.itemSub}>{r.horseName}</span>
                                </div>
                                <div style={styles.itemMeta}>
                                    <span>{r.raceDate}</span>
                                    <span style={styles.statusBadge}>
                                        {r.hasOfficialJockey ? "OFFICIAL" : r.registrationStatus}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
    },
    modal: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "20px",
        width: "min(420px, 90vw)",
        maxHeight: "80vh",
        overflowY: "auto",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
    },
    title: { margin: 0, fontSize: "16px", fontWeight: 700 },
    closeBtn: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "16px",
        color: "#999",
    },
    emptyText: { fontSize: "13px", color: "#999", textAlign: "center", padding: "20px 0" },
    list: { display: "flex", flexDirection: "column", gap: "8px" },
    item: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        border: "1px solid #ded2ad",
        borderRadius: "12px",
        background: "#fff",
        cursor: "pointer",
        textAlign: "left",
    },
    itemActive: {
        borderColor: "#16305c",
        backgroundColor: "#edf2fa",
    },
    itemMain: { display: "flex", flexDirection: "column" },
    itemTitle: { fontSize: "13px" },
    itemSub: { fontSize: "12px", color: "#999" },
    itemMeta: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "4px",
        fontSize: "11px",
        color: "#666",
    },
    statusBadge: {
        backgroundColor: "#e8f7ee",
        color: "#16864f",
        padding: "2px 8px",
        borderRadius: "10px",
        fontWeight: 600,
    },
};