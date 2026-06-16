import { useState, useEffect } from 'react';
import { spectatorApi } from '../../../api/spectatorApi';

export default function Tournaments() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        spectatorApi.getSpectatorTournaments()
            .then(setTournaments)
            .catch(() => setTournaments([]))
            .finally(() => setLoading(false));
    }, []);

    const stats = [
        { label: "PUBLISHED", value: tournaments.length, icon: "📅" },
        { label: "UPCOMING RACES", value: tournaments.filter(t => t.race?.status === 'Open' || t.race?.status === 'Scheduled').length, icon: "🏇" },
        { label: "PARTICIPATING HORSES", value: "-", icon: "🐴" },
        { label: "PROF. JOCKEYS", value: "-", icon: "🏆" },
    ];

    const featured = tournaments[0];
    const rest = tournaments.slice(1);

    if (loading) return <p style={{ textAlign: 'center', color: '#999' }}>Loading...</p>;

    return (
        <div>
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
            {featured && (
                <div style={styles.featured}>
                    <div style={{ background: 'linear-gradient(135deg, #8B0000, #3d1a1a)', height: '220px', position: 'relative' }}>
                        <div style={styles.featuredOverlay}>
                            <div style={styles.featuredTags}>
                                <span style={styles.groupTag}>{featured.status}</span>
                            </div>
                            <h2 style={styles.featuredTitle}>{featured.tournamentName}</h2>
                            <div style={styles.featuredInfo}>
                                {featured.prizePool && <span>💰 ${Number(featured.prizePool).toLocaleString()}</span>}
                                {featured.location && <span>📍 {featured.location}</span>}
                                {featured.race?.raceDate && <span>📅 {featured.race.raceDate?.slice(0, 10)}</span>}
                                {featured.race?.distanceMeters && <span>📏 {featured.race.distanceMeters}m</span>}
                            </div>
                            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                                <button style={styles.predictBtn}>Predict Winner</button>
                                <button style={styles.detailsBtn}>View Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tournament List */}
            {rest.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {rest.map((t) => (
                        <div key={t.tournamentId} style={styles.card}>
                            <div style={{ background: 'linear-gradient(135deg, #3d1a1a, #8B0000)', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '3rem' }}>🏆</span>
                            </div>
                            <div style={styles.cardBody}>
                                <div style={styles.cardHeader}>
                                    <div>
                                        <p style={styles.cardName}>{t.tournamentName}</p>
                                        <p style={styles.cardDistance}>
                                            {t.race?.distanceMeters ? `${t.race.distanceMeters}m` : '-'} • {t.race?.raceDate?.slice(0, 10) ?? '-'}
                                        </p>
                                    </div>
                                    <span style={styles.cardPrize}>
                                        {t.prizePool ? `$${Number(t.prizePool).toLocaleString()}` : '-'}
                                    </span>
                                </div>
                                <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px' }}>{t.location}</p>
                                <span style={{
                                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                                    backgroundColor: t.status === 'OpenRegistration' ? '#d4edda' : '#fff3cd',
                                    color: t.status === 'OpenRegistration' ? '#155724' : '#856404'
                                }}>
                                    {t.status}
                                </span>
                                <button style={styles.moreBtn}>More Details</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tournaments.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>No tournaments available.</p>
            )}
        </div>
    );
}

const styles = {
    statCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "16px", border: "1px solid #eee", display: "flex", alignItems: "center", gap: "12px" },
    statLabel: { color: "#999", fontSize: "11px", fontWeight: "600" },
    statValue: { margin: "2px 0 0", fontSize: "22px", fontWeight: "bold" },
    featured: { borderRadius: "12px", overflow: "hidden", marginBottom: "24px" },
    featuredOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center" },
    featuredTags: { display: "flex", gap: "8px", marginBottom: "8px" },
    groupTag: { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "4px" },
    featuredTitle: { color: "#fff", margin: "0 0 12px", fontSize: "26px" },
    featuredInfo: { display: "flex", flexWrap: "wrap", gap: "16px", color: "rgba(255,255,255,0.8)", fontSize: "13px" },
    predictBtn: { backgroundColor: "#fff", color: "#8B0000", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
    detailsBtn: { backgroundColor: "transparent", color: "#fff", border: "1px solid #fff", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontSize: "14px" },
    card: { backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" },
    cardBody: { padding: "16px" },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" },
    cardName: { margin: 0, fontWeight: "bold", fontSize: "15px" },
    cardDistance: { margin: "4px 0 0", fontSize: "12px", color: "#999" },
    cardPrize: { color: "#8B0000", fontWeight: "bold", fontSize: "14px" },
    moreBtn: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff", cursor: "pointer", fontSize: "13px", marginTop: "12px" },
};