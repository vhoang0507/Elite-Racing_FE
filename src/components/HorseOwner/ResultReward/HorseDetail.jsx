import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaFire, FaStar, FaStopwatch, FaTrophy } from "react-icons/fa";
import HorseOwnerLayout from "../HorseOwnerLayout";
import { ownerApi } from "../../../api/ownerApi";
import { resolveFileUrl } from "../../../api/uploadApi";
import ImageLightbox from "../../shared/ImageLightbox";

function formatTime(seconds) {
    if (seconds == null) return "—";
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(1);
    return m > 0 ? `${m}:${s.padStart(4, "0")}` : `${s}s`;
}

export default function HorseResultDetail() {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        ownerApi.getHorsePerformance(resultId)
            .then((res) => { if (mounted) setData(res); })
            .catch((err) => { if (mounted) setError(err.message || 'Failed to load horse performance'); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [resultId]);

    return (
        <HorseOwnerLayout activeKey="rewards">
            <section className="grid gap-6 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1 self-start border-0 bg-transparent p-0 text-[0.8rem] font-semibold text-[var(--admin-muted)] hover:text-[var(--admin-primary)]"
                >
                    ← Back to Fleet
                </button>

                {loading && <p className="text-[0.85rem] text-[var(--admin-muted)]">Loading...</p>}
                {error && <p className="text-[0.85rem] text-red-700">{error}</p>}

                {!loading && data && (
                    <>
                        <h2 className="m-0 text-[1.6rem] text-[var(--admin-primary-dark)]">{data.horse.horseName}</h2>

                        <div className="grid grid-cols-[1fr_1fr] gap-5 max-[900px]:grid-cols-1">
                            <HorseProfileCard horse={data.horse} />
                            <AchievementsCard achievements={data.achievements} />
                        </div>

                        <RaceHistoryTable history={data.raceHistory} />
                    </>
                )}
            </section>
        </HorseOwnerLayout>
    );
}

function HorseProfileCard({ horse }) {
    const [lightboxSrc, setLightboxSrc] = useState(null);

    return (
        <div style={styles.card}>
            <div style={styles.profileRow}>
                <img
                    src={horse.imageUrl ? resolveFileUrl(horse.imageUrl) : "/Horse1.jpg"}
                    alt={horse.horseName}
                    style={styles.profileImg}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/Horse1.jpg"; }}
                />
                <div>
                    <p style={styles.horseName}>{horse.horseName}</p>
                    <p style={styles.horseBreed}>{horse.breedName}</p>
                </div>
            </div>
            <div style={styles.infoGrid}>
                <div><small style={styles.label}>AGE</small><p style={styles.value}>{horse.age} years</p></div>
                <div><small style={styles.label}>WEIGHT</small><p style={styles.value}>{horse.weightKg} kg</p></div>
                <div><small style={styles.label}>OWNER</small><p style={styles.value}>{horse.ownerName}</p></div>
                <div><small style={styles.label}>ASSIGNED JOCKEY</small><p style={styles.value}>{horse.assignedJockeyName ?? "—"}</p></div>
            </div>
            <div style={styles.certificateBox}>
                <small style={styles.label}>HEALTH CERTIFICATE</small>
                {horse.healthCertificateImageUrl ? (
                    <>
                        <button type="button" onClick={() => setLightboxSrc(resolveFileUrl(horse.healthCertificateImageUrl))} style={{ ...styles.certificateLink, background: 'none', border: 'none', cursor: 'zoom-in' }}>
                            <img src={resolveFileUrl(horse.healthCertificateImageUrl)} alt="Health certificate" style={styles.certificateImg} />
                            <span>Open certificate</span>
                        </button>
                        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
                    </>
                ) : (
                    <p style={styles.certificateMissing}>Not uploaded</p>
                )}
            </div>
        </div>
    );
}

function AchievementsCard({ achievements }) {
    const items = [
        { icon: FaTrophy, label: "Title", value: achievements.championTitles > 0 ? `Champion Titles x${achievements.championTitles}` : "No titles yet" },
        { icon: FaStopwatch, label: "Best Time", value: achievements.bestTime != null ? formatTime(achievements.bestTime) : "—" },
        { icon: FaFire, label: "Current Streak", value: `${achievements.currentWinStreak} Consecutive Wins` },
        { icon: FaStar, label: "Award", value: achievements.award || "—" },
    ];

    return (
        <div style={styles.card}>
            <p style={styles.cardTitle}>Recent Achievements</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {items.map((item, i) => (
                    <div key={i} style={styles.achievementRow}>
                        <span style={styles.achievementIcon}><item.icon aria-hidden="true" /></span>
                        <div>
                            <p style={styles.achievementLabel}>{item.label}</p>
                            <p style={styles.achievementValue}>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RaceHistoryTable({ history }) {
    return (
        <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <p style={styles.cardTitle}>Race History</p>
            </div>

            {history.length === 0 ? (
                <p style={{ color: "#999", fontSize: "0.8rem" }}>No race history yet.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>TOURNAMENT</th>
                            <th style={styles.th}>DATE</th>
                            <th style={styles.th}>TRACK</th>
                            <th style={styles.th}>DIST</th>
                            <th style={styles.th}>JOCKEY</th>
                            <th style={styles.th}>POS</th>
                            <th style={styles.th}>TIME</th>
                            <th style={styles.th}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((h) => (
                            <tr key={h.resultId}>
                                <td style={{ ...styles.td, fontWeight: 600, color: "#16305c" }}>{h.tournamentName}</td>
                                <td style={styles.td}>{new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(h.raceDate))}</td>
                                <td style={styles.td}>{h.track ?? "—"}</td>
                                <td style={styles.td}>{h.distanceMeters}m</td>
                                <td style={styles.td}>{h.jockeyName ?? "—"}</td>
                                <td style={styles.td}>{h.position ?? "-"}</td>
                                <td style={styles.td}>{h.finishTime != null ? formatTime(h.finishTime) : "-"}</td>
                                <td style={styles.td}>
                                    <span style={styles.statusBadge}>{h.status?.toUpperCase()}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const styles = {
    card: { backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #ded2ad", padding: "20px", boxShadow: "0 8px 22px rgba(15,23,42,0.06)" },
    cardTitle: { margin: 0, fontSize: "14px", fontWeight: 700, color: "#0a1930" },
    profileRow: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "20px" },
    profileImg: { width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", marginBottom: "10px" },
    horseName: { margin: 0, fontWeight: 700, fontSize: "16px", color: "#1b2333" },
    horseBreed: { margin: "2px 0", fontSize: "12px", color: "#6b6456" },
    infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
    label: { color: "#6b6456", fontSize: "11px" },
    value: { margin: "2px 0 0", fontWeight: 600, fontSize: "13px", color: "#1b2333" },
    certificateMissing: { margin: "6px 0 0", color: "#94a3b8", fontSize: "12px", fontWeight: 600 },
    achievementRow: { display: "flex", alignItems: "center", gap: "10px" },
    achievementIcon: { width: "32px", height: "32px", borderRadius: "999px", backgroundColor: "#f3e6c2", color: "#8a6a1f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" },
    achievementLabel: { margin: 0, fontSize: "11px", color: "#6b6456" },
    achievementValue: { margin: "2px 0 0", fontWeight: 600, fontSize: "13px", color: "#1b2333" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", fontSize: "10px", color: "#64748b", fontWeight: 700, padding: "10px 8px", borderBottom: "2px solid #c8a24a", background: "#efe8d6" },
    td: { padding: "10px 8px", borderBottom: "1px solid #f0ece0", fontSize: "12px" },
    statusBadge: { fontSize: "10px", padding: "3px 10px", borderRadius: "999px", fontWeight: 700, backgroundColor: "#edf2fa", color: "#16305c" },
};
