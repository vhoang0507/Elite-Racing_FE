import { useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";
import Toast from "../../../shared/Toast";
import { useToast } from "../../../shared/useToast";
import WithdrawModal from "./WithdrawModal";

const STATUS_CFG = {
    ReadyToRace:   { bg: "#e8f7ee", color: "#16864f", border: "#bfe6d0" },
    Approved:      { bg: "var(--admin-surface-strong)", color: "var(--admin-primary)", border: "var(--admin-border)" },
    JockeyInvited: { bg: "#faf2e0", color: "#8a6209", border: "#eddcb0" },
    Completed:     { bg: "#e8f7ee", color: "#16864f", border: "#bfe6d0" },
};
const humanizeLabel = (value) => String(value || "").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();

export default function ApprovedRegistrations({ onViewStatus, refreshKey = 0 }) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [infoLoadingId, setInfoLoadingId] = useState(null);
    const [infoError, setInfoError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [actionId, setActionId] = useState(null);
    const [withdrawTarget, setWithdrawTarget] = useState(null);
    const { toast, showToast, hideToast } = useToast();

    const filteredData = useMemo(() => {
        const q = search.trim().toLowerCase();
        return data.filter(row => {
            const matchesSearch = !q || [row.tournamentName, row.horseName, row.jockeyName, row.seasonName, row.seasonStatus, row.registrationDeadline]
                .some(v => String(v || "").toLowerCase().includes(q));
            const matchesStatus = statusFilter === "all" || row.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [data, search, statusFilter]);

    const loadData = useCallback(() => {
        setLoading(true);
        ownerApi.getApprovedRegistrationsList()
            .then(setData)
            .catch((err) => {
                if (!handleOwnerAccessError(err, navigate)) setData([]);
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    useEffect(() => {
        loadData();
    }, [loadData, refreshKey]);

    const canWithdraw = (status) => !["Rejected", "Cancelled", "Withdrawn", "Completed"].includes(status);

    const confirmWithdraw = async (row, reason) => {
        setActionId(row.registrationId);

        try {
            await ownerApi.withdrawRegistration(row.registrationId, reason);
            setWithdrawTarget(null);
            showToast("Registration withdrawn successfully.", "success");
            loadData();
        } catch (err) {
            if (!handleOwnerAccessError(err, navigate)) {
                throw err;
            }
        } finally {
            setActionId(null);
        }
    };

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

    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <div>
                    <p style={styles.title}>Approved Registrations</p>
                    <p style={styles.sub}>{data.length} registration{data.length !== 1 ? "s" : ""} approved</p>
                </div>
            </div>

            <div style={styles.filterRow}>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search tournament or horse..."
                    style={styles.searchInput}
                />
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={styles.select}
                >
                    <option value="all">All Status</option>
                    <option value="Approved">Approved</option>
                    <option value="JockeyInvited">Jockey Invited</option>
                    <option value="ReadyToRace">Ready To Race</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            {loading ? (
                <p style={styles.center}>Loading...</p>
            ) : (
                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.headRow}>
                                {["Tournament", "Horse", "Jockey", "Race Date", "Status", "Action"].map(h => (
                                    <th key={h} style={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={styles.emptyCell}>
                                        {data.length === 0 ? "No approved registrations" : "No registrations match your filter."}
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((row, i) => {
                                    const cfg = STATUS_CFG[row.status] ?? { bg: "var(--admin-surface-strong)", color: "var(--admin-primary)", border: "var(--admin-border)" };
                                    return (
                                        <tr key={row.registrationId} style={{ ...styles.row, backgroundColor: i % 2 === 0 ? "#fff" : "#faf7f5" }}>
                                            <td style={styles.td}>
                                                <span style={styles.bold}>{row.tournamentName}</span>
                                                {(row.seasonName || row.seasonStatus) && (
                                                    <span style={styles.blockMuted}>
                                                        Season: {row.seasonName || "N/A"}{row.seasonStatus ? ` (${row.seasonStatus})` : ""}
                                                    </span>
                                                )}
                                                {row.registrationDeadline && (
                                                    <span style={styles.blockMuted}>Deadline: {row.registrationDeadline}</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>{row.horseName}</td>
                                            <td style={styles.td}><span style={styles.muted}>{row.jockeyName || "Pending selection"}</span></td>
                                            <td style={styles.td}><span style={styles.date}>{row.raceDate}</span></td>
                                            <td style={styles.td}>
                                                <span style={{ ...styles.statusBadge, backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                                    {humanizeLabel(row.status)}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    <button
                                                        onClick={() => onViewStatus?.(row.registrationId)}
                                                        style={{ ...styles.actionBtn, ...styles.ghostBtn }}
                                                        type="button"
                                                    >
                                                        View Status
                                                    </button>
                                                    <button
                                                        disabled={infoLoadingId === row.registrationId}
                                                        onClick={() => openRaceInfo(row)}
                                                        style={{ ...styles.actionBtn, ...styles.primaryBtn, ...(infoLoadingId === row.registrationId ? styles.disabledBtn : {}) }}
                                                        type="button"
                                                    >
                                                        {infoLoadingId === row.registrationId ? "Loading..." : "Race Info"}
                                                    </button>
                                                    <button
                                                        disabled={!canWithdraw(row.status) || actionId === row.registrationId}
                                                        onClick={() => setWithdrawTarget(row)}
                                                        style={{ ...styles.actionBtn, ...styles.dangerBtn, ...((!canWithdraw(row.status) || actionId === row.registrationId) ? styles.disabledBtn : {}) }}
                                                        type="button"
                                                    >
                                                        {actionId === row.registrationId ? "Withdrawing..." : "Withdraw"}
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {infoError && <p style={styles.error}>{infoError}</p>}
            {selectedInfo && <RaceInfoModal data={selectedInfo} onClose={() => setSelectedInfo(null)} />}

            <Toast message={toast.message} type={toast.type} title={toast.title} onClose={hideToast} />
            <WithdrawModal
                onClose={() => setWithdrawTarget(null)}
                onConfirm={confirmWithdraw}
                target={withdrawTarget}
            />
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
        <div style={styles.overlay} onClick={onClose}>
            <section style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <div>
                        <h3 style={styles.modalTitle}>{race.tournamentName || data.tournamentName}</h3>
                        <p style={styles.modalSubtitle}>Registration #{data.registrationId} · {data.horseName}</p>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn} type="button">✕</button>
                </div>
                <div style={styles.modalBody}>
                    <div style={styles.infoGrid}>
                        <InfoItem label="Tournament" value={race.tournamentName || data.tournamentName} />
                        <InfoItem label="Season" value={data.seasonName} />
                        <InfoItem label="Season Status" value={data.seasonStatus} />
                        <InfoItem label="Registration Deadline" value={data.registrationDeadline} />
                        <InfoItem label="Race Name" value={race.raceName || data.tournamentName} />
                        <InfoItem label="Race Date" value={race.raceDate || data.raceDate} />
                        <InfoItem label="Location" value={race.location} />
                        <InfoItem label="Distance" value={race.distance ? `${race.distance} m` : null} />
                        <InfoItem label="Race Status" value={race.status} />
                        <InfoItem label="Registration Status" value={data.status} />
                        <InfoItem label="Submitted At" value={data.submittedAt} />
                        <InfoItem label="Horse" value={data.horseName} />
                        <InfoItem label="Jockey" value={data.jockeyName || "Pending selection"} />
                        <InfoItem label="Admin Note" value={data.adminNote} />
                    </div>
                </div>
            </section>
        </div>
    );
}

const styles = {
    section: { backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e8ddd9", overflow: "hidden", marginBottom: 24 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", backgroundColor: "#faf7f5", borderBottom: "1px solid #f0ebe8" },
    title: { margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" },
    sub: { margin: "2px 0 0", fontSize: 12, color: "#94a3b8" },
    filterRow: { display: "flex", gap: 10, flexWrap: "wrap", padding: "12px 20px", borderBottom: "1px solid #f0ebe8" },
    searchInput: { height: 34, flex: 1, minWidth: 180, borderRadius: 999, border: "1px solid #ded2ad", padding: "0 14px", fontSize: "0.82rem", outline: "none" },
    select: { height: 34, borderRadius: 999, border: "1px solid #ded2ad", padding: "0 12px", fontSize: "0.82rem", backgroundColor: "#fff" },
    center: { textAlign: "center", color: "#999", padding: "24px 0" },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse" },
    headRow: { backgroundColor: "#efe8d6" },
    th: { textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", borderBottom: "2px solid #c8a24a" },
    row: { borderBottom: "1px solid #f0ebe8" },
    td: { padding: "12px 16px", fontSize: 13, verticalAlign: "middle" },
    bold: { fontWeight: 600, color: "#1e293b" },
    blockMuted: { display: "block", marginTop: 3, fontSize: 11, color: "#64748b", fontWeight: 600 },
    muted: { color: "#64748b" },
    date: { fontSize: 12, color: "#64748b" },
    statusBadge: { fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px", display: "inline-block" },
    emptyCell: { textAlign: "center", padding: "28px", color: "#94a3b8", fontSize: 13 },
    actionBtn: { borderRadius: 999, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, border: "none" },
    primaryBtn: { backgroundColor: "#16305c", color: "#fff" },
    dangerBtn: { backgroundColor: "#fff", border: "1px solid #e3bcb7", color: "#a4392f" },
    ghostBtn: { backgroundColor: "#fff", color: "#374151", border: "1px solid #ded2ad" },
    disabledBtn: { cursor: "not-allowed", opacity: 0.65 },
    error: { margin: "14px 20px 0", color: "#a4392f", fontSize: 13, fontWeight: 600 },
    overlay: { alignItems: "center", backgroundColor: "rgba(45,32,32,0.45)", display: "flex", inset: 0, justifyContent: "center", padding: "20px", position: "fixed", zIndex: 50 },
    modal: { backgroundColor: "#fff", borderRadius: 14, boxShadow: "0 24px 70px rgba(37,18,14,0.28)", maxHeight: "90vh", maxWidth: "760px", overflow: "auto", width: "100%" },
    modalHeader: { alignItems: "flex-start", borderBottom: "1px solid #f0ebe8", display: "flex", gap: "16px", justifyContent: "space-between", padding: "20px" },
    modalTitle: { color: "#0f172a", fontSize: "22px", margin: 0 },
    modalSubtitle: { color: "#64748b", fontSize: "13px", fontWeight: 600, margin: "6px 0 0" },
    closeBtn: { backgroundColor: "#faf7f0", border: "1px solid #ded2ad", borderRadius: "999px", color: "#16305c", cursor: "pointer", fontSize: "16px", fontWeight: 800, height: "34px", width: "34px" },
    modalBody: { padding: "20px" },
    infoGrid: { display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" },
    infoItem: { backgroundColor: "#faf7f0", border: "1px solid #ded2ad", borderRadius: "10px", padding: "12px" },
    infoLabel: { color: "#64748b", display: "block", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" },
    infoValue: { color: "#1e293b", display: "block", fontSize: "14px", marginTop: "6px", wordBreak: "break-word" },
};
