import { useState, useEffect } from 'react';
import { spectatorApi } from '../../../api/spectatorApi';

export default function Predictions() {
    const [predictions, setPredictions] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            spectatorApi.getMyPredictions().catch(() => []),
            spectatorApi.getSpectatorTournaments().catch(() => []),
        ]).then(([preds, tours]) => {
            setPredictions(preds);
            setTournaments(tours);
        }).finally(() => setLoading(false));
    }, []);

    const totalPredictions = predictions.length;
    const correctPredictions = predictions.filter(p => p.isCorrect === true).length;
    const accuracy = totalPredictions === 0 ? 0 : Math.round(correctPredictions / totalPredictions * 100);
    const totalPoints = predictions.reduce((sum, p) => sum + (p.pointsAwarded ?? 0), 0);

    const stats = [
        { label: "PREDICTIONS SUBMITTED", value: totalPredictions, extra: null },
        { label: "PREDICTION ACCURACY", value: `${accuracy}%`, extra: null },
        { label: "REWARD POINTS", value: totalPoints, icon: "🏆" },
        { label: "CORRECT PREDICTIONS", value: correctPredictions, extra: null },
    ];

    if (loading) return <p style={{ textAlign: 'center', color: '#999' }}>Loading...</p>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h2 style={{ margin: "0 0 4px" }}>Predictions</h2>
                    <p style={{ margin: 0, fontSize: "13px", color: "#999" }}>
                        Predict race outcomes, compete with spectators, and earn exclusive rewards.
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {stats.map((s, i) => (
                    <div key={i} style={styles.statCard}>
                        <small style={styles.statLabel}>{s.label}</small>
                        <h3 style={styles.statValue}>{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Predictions List */}
            <div style={styles.card}>
                <h3 style={{ margin: "0 0 16px" }}>My Predictions</h3>
                {predictions.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center', padding: '24px' }}>No predictions yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Tournament', 'Race', 'Predicted Horse', 'Status', 'Points'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '12px', color: '#999', fontWeight: '600', borderBottom: '1px solid #eee' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {predictions.map((p) => (
                                <tr key={p.predictionId} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{p.tournamentName ?? '-'}</td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{p.raceName}</td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{p.predictedHorseName}</td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
                                            backgroundColor: p.isCorrect === true ? '#d4edda' : p.isCorrect === false ? '#f8d7da' : '#fff3cd',
                                            color: p.isCorrect === true ? '#155724' : p.isCorrect === false ? '#721c24' : '#856404',
                                        }}>
                                            {p.isCorrect === true ? 'Correct' : p.isCorrect === false ? 'Wrong' : p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: 'bold', color: '#8B0000' }}>
                                        {p.pointsAwarded > 0 ? `+${p.pointsAwarded}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Available Tournaments to Predict */}
            {tournaments.filter(t => t.status === 'OpenRegistration').length > 0 && (
                <div style={{ ...styles.card, marginTop: '16px' }}>
                    <h3 style={{ margin: "0 0 16px" }}>Available for Prediction</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {tournaments.filter(t => t.status === 'OpenRegistration').map(t => (
                            <div key={t.tournamentId} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px' }}>
                                <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{t.tournamentName}</p>
                                <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                                    📅 {t.race?.raceDate?.slice(0, 10) ?? '-'} • 📍 {t.location ?? '-'}
                                </p>
                                <button style={{ ...styles.predictBtn, marginTop: '8px', width: '100%' }}>
                                    Make Prediction
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    statCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "16px", border: "1px solid #eee" },
    statLabel: { color: "#999", fontSize: "11px", fontWeight: "600" },
    statValue: { margin: "4px 0 2px", fontSize: "22px", fontWeight: "bold" },
    card: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee" },
    predictBtn: { backgroundColor: "#8B0000", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "13px" },
};