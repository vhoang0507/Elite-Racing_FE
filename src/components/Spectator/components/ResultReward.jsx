import { useEffect, useState } from 'react';
import {
    FaBullseye,
    FaCheckCircle,
    FaCoins,
} from 'react-icons/fa';
import { spectatorApi } from '../../../api/spectatorApi';

export default function ResultReward() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        spectatorApi.getSpectatorRewards()
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="m-0 text-center font-semibold text-[var(--admin-muted)]">Loading...</p>;

    const stats = [
        { label: "Correct Predictions", value: data?.correctPredictions ?? 0, icon: FaCheckCircle, tone: "green" },
        { label: "Reward Points", value: data?.rewardPoints ?? 0, icon: FaCoins, tone: "gold" },
        { label: "Prediction Accuracy", value: `${data?.predictionAccuracy ?? 0}%`, icon: FaBullseye, tone: "primary" },
    ];

    return (
        <div className="grid gap-7">
            <div>
                <h2 className="page-title">Results & Rewards</h2>
                <p className="page-subtitle">
                    View race results, earn prediction points, and redeem exclusive racing rewards.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
                {stats.map((s) => {
                    const Icon = s.icon;

                    return (
                        <article key={s.label} className="stat-card min-h-[118px]">
                            <div className={`stat-icon ${s.tone === 'green' ? 'bg-[#dff7e9] text-[#118548]' : s.tone === 'gold' ? 'bg-[#fff3cd] text-[#856404]' : ''}`}>
                                <Icon aria-hidden="true" />
                            </div>
                            <small className="stat-label">{s.label}</small>
                            <h3 className="stat-value text-[1.8rem]">{s.value}</h3>
                        </article>
                    );
                })}
            </div>

            <div className="grid grid-cols-2 gap-5 max-[920px]:grid-cols-1">
                <div className="surface-card p-5">
                    <h3 className="m-0 mb-4 text-[1.05rem] font-bold">Reward Progress</h3>
                    <div className="mb-2 flex justify-between text-[0.9rem] font-bold">
                        <span>Current: {data?.rewardPoints ?? 0} pts</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#f1e2df]">
                        <div
                            className="h-full rounded-full bg-[var(--admin-primary)]"
                            style={{ width: `${Math.min(100, (data?.rewardPoints ?? 0) / 20)}%` }}
                        />
                    </div>
                    <p className="m-0 mt-3 text-[0.82rem] text-[var(--admin-muted)]">Keep predicting to earn more points!</p>
                </div>

                <div className="surface-card p-5">
                    <h3 className="m-0 mb-4 text-[1.05rem] font-bold">Point History</h3>
                    {data?.pointHistory?.length === 0 || !data?.pointHistory ? (
                        <p className="m-0 text-[0.9rem] text-[var(--admin-muted)]">No point history yet.</p>
                    ) : (
                        <div className="grid gap-2">
                            {data.pointHistory.map((p, i) => (
                                <div key={i} className="flex items-center justify-between border-b border-[#f5f0ee] py-3 last:border-b-0">
                                    <div>
                                        <p className="m-0 text-[0.9rem] font-bold">Correct Prediction</p>
                                        <small className="text-[var(--admin-muted)]">{p.raceName}</small>
                                    </div>
                                    <span className="font-black text-[#155724]">+{p.points}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
