import { useEffect, useState } from 'react';
import {
    FaBullseye,
    FaCalendarAlt,
    FaCheckCircle,
    FaCoins,
    FaMapMarkerAlt,
    FaPercent,
} from 'react-icons/fa';
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
        { label: "PREDICTIONS SUBMITTED", value: totalPredictions, icon: FaBullseye },
        { label: "PREDICTION ACCURACY", value: `${accuracy}%`, icon: FaPercent },
        { label: "REWARD POINTS", value: totalPoints, icon: FaCoins },
        { label: "CORRECT PREDICTIONS", value: correctPredictions, icon: FaCheckCircle },
    ];

    const openTournaments = tournaments.filter(t => t.status === 'OpenRegistration');

    if (loading) return <p className="m-0 text-center font-semibold text-[var(--admin-muted)]">Loading...</p>;

    return (
        <div className="grid gap-7">
            <div>
                <h2 className="page-title">Predictions</h2>
                <p className="page-subtitle">
                    Predict race outcomes, compete with spectators, and earn exclusive rewards.
                </p>
            </div>

            <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
                {stats.map((s) => {
                    const Icon = s.icon;

                    return (
                        <article key={s.label} className="stat-card min-h-[118px]">
                            <div className="stat-icon">
                                <Icon aria-hidden="true" />
                            </div>
                            <small className="stat-label">{s.label}</small>
                            <h3 className="stat-value text-[1.8rem]">{s.value}</h3>
                        </article>
                    );
                })}
            </div>

            <div className="surface-card">
                <div className="section-bar">
                    <h3 className="m-0 text-[1.05rem] font-bold">My Predictions</h3>
                </div>
                {predictions.length === 0 ? (
                    <p className="m-0 p-8 text-center text-[var(--admin-muted)]">No predictions yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table min-w-[760px]">
                            <thead>
                                <tr>
                                    {['Tournament', 'Race', 'Predicted Horse', 'Status', 'Points'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {predictions.map((p) => (
                                    <tr key={p.predictionId}>
                                        <td>{p.tournamentName ?? '-'}</td>
                                        <td>{p.raceName}</td>
                                        <td>{p.predictedHorseName}</td>
                                        <td>
                                            <span className={`status-badge ${p.isCorrect === true ? 'bg-[#d4edda] text-[#155724]' : p.isCorrect === false ? 'bg-[#f8d7da] text-[#721c24]' : 'bg-[#fff3cd] text-[#856404]'}`}>
                                                {p.isCorrect === true ? 'Correct' : p.isCorrect === false ? 'Wrong' : p.status}
                                            </span>
                                        </td>
                                        <td className="font-black text-[var(--admin-primary)]">
                                            {p.pointsAwarded > 0 ? `+${p.pointsAwarded}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {openTournaments.length > 0 && (
                <div className="surface-card p-5">
                    <h3 className="m-0 mb-4 text-[1.05rem] font-bold">Available for Prediction</h3>
                    <div className="grid grid-cols-2 gap-4 max-[820px]:grid-cols-1">
                        {openTournaments.map(t => (
                            <article key={t.tournamentId} className="rounded-[8px] border border-[var(--admin-border)] bg-[#fffaf8] p-4">
                                <p className="m-0 font-bold">{t.tournamentName}</p>
                                <p className="m-0 mt-2 flex flex-wrap gap-4 text-[0.82rem] text-[var(--admin-muted)]">
                                    <span className="inline-flex items-center gap-2"><FaCalendarAlt /> {t.race?.raceDate?.slice(0, 10) ?? '-'}</span>
                                    <span className="inline-flex items-center gap-2"><FaMapMarkerAlt /> {t.location ?? '-'}</span>
                                </p>
                                <button className="primary-button mt-3 w-full">
                                    Make Prediction
                                </button>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
