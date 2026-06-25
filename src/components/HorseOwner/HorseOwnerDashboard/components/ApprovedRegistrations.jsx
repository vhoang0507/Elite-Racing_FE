import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";

const statusColor = {
    "ReadyToRace":  { bg: "#d4edda", color: "#155724" },
    "Approved":     { bg: "#d1ecf1", color: "#0c5460" },
    "JockeyInvited":{ bg: "#fff3cd", color: "#856404" },
};

export default function ApprovedRegistrations() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [infoLoadingId, setInfoLoadingId] = useState(null);
    const [infoError, setInfoError] = useState("");

    useEffect(() => {
        setLoading(true);
        ownerApi.getApprovedRegistrations()
            .then(setData)
            .catch((err) => {
                if (!handleOwnerAccessError(err, navigate)) setData([]);
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const openRaceInfo = async (row) => {
        setInfoLoadingId(row.registrationId);
        setInfoError("");
        try {
            const [registrationDetail, raceDetail] = await Promise.all([
                ownerApi.getRegistrationDetail(row.registrationId),
                ownerApi.getRaceDetail(row.raceId),
            ]);
            setSelectedInfo({ ...row, ...registrationDetail, race: raceDetail });
        } catch (err) {
            if (!handleOwnerAccessError(err, navigate)) {
                setInfoError(err.message || "Cannot load race information.");
            }
        } finally {
            setInfoLoadingId(null);
        }
    };

    if (loading) return <p style={{ textAlign: "center", color: "#999" }}>Loading...</p>;

    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h3 style={{ margin: 0 }}>Approved Registrations</h3>
                <button style={styles.filterBtn} onClick={() => navigate("/owner/registrations")}>
                    View All →
                </button>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        {["Tournament", "Horse", "Jockey", "Race Date", "Status", "Action"].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#999" }}>
                                No approved registrations
                            </td>
                        </tr>
                    ) : (
                        data.map((row, i) => (
                            <tr key={row.registrationId || i} style={styles.tr}>
                                <td style={styles.td}>{row.tournamentName}</td>
                                <td style={styles.td}>{row.horseName}</td>
                                <td style={styles.td}>{row.jockeyName || "Pending selection"}</td>
                                <td style={styles.td}>{row.raceDate}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: statusColor[row.status]?.bg ?? "#eee",
                                        color: statusColor[row.status]?.color ?? "#333",
                                    }}>
                                        {row.status}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button
                                        type="button"
                                        disabled={infoLoadingId === row.registrationId}
                                        onClick={() => openRaceInfo(row)}
                                        style={{
                                            ...styles.raceBtn,
                                            ...(infoLoadingId === row.registrationId ? styles.disabledBtn : {}),
                                        }}
                                    >
                                        {infoLoadingId === row.registrationId ? "Loading..." : "Race Info"}
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {infoError && <p style={styles.error}>{infoError}</p>}

            {selectedInfo && (
                <RaceInfoModal data={selectedInfo} onClose={() => setSelectedInfo(null)} />
            )}
        </section>
    );
}

function InfoItem({ label, value }) {
    return (
        <div style={styles.infoItem}>
            <span style={styles.infoLabel}>{label}</span>
            <strong style={styles.infoValue}>{value || "-"}</strong>
        </div>
    );
}

function RaceInfoModal({ data, onClose }) {
    const race = data.race || {};
    return (
        <div style={styles.overlay}>
            <section style={styles.modal}>
                <div style={styles.modalHeader}>
                    <div>
                        <h3 style={styles.modalTitle}>{race.tournamentName || data.tournamentName}</h3>
                        <p style={styles.modalSubtitle}>
                            Registration #{data.registrationId} for {data.horseName}
                        </p>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn} type="button">✕</button>
                </div>
                <div style={styles.modalBody}>
                    <div style={styles.infoGrid}>
                        <InfoItem label="Tournament"           value={race.tournamentName || data.tournamentName} />
                        <InfoItem label="Race Name"            value={race.raceName || data.tournamentName} />
                        <InfoItem label="Race Date"            value={race.raceDate || data.raceDate} />
                        <InfoItem label="Location"             value={race.location} />
                        <InfoItem label="Distance"             value={race.distance ? `${race.distance} m` : null} />
                        <InfoItem label="Race Status"          value={race.status} />
                        <InfoItem label="Registration Status"  value={data.status} />
                        <InfoItem label="Submitted At"         value={data.submittedAt} />
                        <InfoItem label="Horse"                value={data.horseName} />
                        <InfoItem label="Horse ID"             value={data.horseId} />
                        <InfoItem label="Jockey"               value={data.jockeyName || "Pending selection"} />
                        <InfoItem label="Admin Note"           value={data.adminNote} />
                    </div>
                </div>
            </section>
        </div>
    );
}

const styles = {
    section:     { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #edcfc9" },
    header:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
    filterBtn:   { background: "none", border: "1px solid #edcfc9", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "13px", color: "#8B0000", fontWeight: 600 },
    table:       { width: "100%", borderCollapse: "collapse" },
    th:          { textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase", borderBottom: "1px solid #eee" },
    tr:          { borderBottom: "1px solid #f5f5f5" },
    td:          { padding: "12px", fontSize: "14px" },
    badge:       { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
    raceBtn:     { backgroundColor: "#8B0000", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontSize: "13px" },
    disabledBtn: { cursor: "not-allowed", opacity: 0.65 },
    error:       { margin: "14px 0 0", color: "#8B0000", fontSize: "13px", fontWeight: 600 },
    overlay: {
        position: "fixed", inset: 0, zIndex: 50,
        backgroundColor: "rgba(45,32,32,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    },
    modal: {
        backgroundColor: "#fff", borderRadius: "12px",
        boxShadow: "0 24px 70px rgba(37,18,14,0.28)",
        maxHeight: "90vh", maxWidth: "760px", overflow: "auto", width: "100%",
    },
    modalHeader: {
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: "16px", padding: "20px", borderBottom: "1px solid #eee",
    },
    modalTitle:    { margin: 0, fontSize: "22px", color: "#650404" },
    modalSubtitle: { margin: "6px 0 0", fontSize: "13px", fontWeight: 600, color: "#705f5b" },
    closeBtn: {
        width: "34px", height: "34px", borderRadius: "8px",
        border: "1px solid #edcfc9", backgroundColor: "#fff8f6",
        color: "#8B0000", fontSize: "16px", fontWeight: 800, cursor: "pointer",
    },
    modalBody: { padding: "20px" },
    infoGrid:  { display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" },
    infoItem:  { backgroundColor: "#fff8f6", border: "1px solid #edcfc9", borderRadius: "8px", padding: "12px" },
    infoLabel: { display: "block", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#765c58" },
    infoValue: { display: "block", marginTop: "6px", fontSize: "14px", color: "#2d2020", wordBreak: "break-word" },
};
