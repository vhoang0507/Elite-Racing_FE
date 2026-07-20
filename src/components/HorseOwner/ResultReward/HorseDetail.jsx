import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaBirthdayCake,
    FaFire,
    FaFileMedicalAlt,
    FaHorseHead,
    FaStar,
    FaStopwatch,
    FaTrophy,
    FaUser,
    FaUserTie,
    FaWeightHanging,
} from "react-icons/fa";
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

const statusTone = {
    Win: 'bg-[#e8f7ee] text-[#16864f]',
    Won: 'bg-[#e8f7ee] text-[#16864f]',
    Loss: 'bg-[#f3e1df] text-[#a4392f]',
    Lost: 'bg-[#f3e1df] text-[#a4392f]',
    DNF: 'bg-[#f3e1df] text-[#a4392f]',
    DQ: 'bg-[#f3e1df] text-[#a4392f]',
};

function getStatusTone(status) {
    return statusTone[status] || 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]';
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
                    className="inline-flex items-center gap-1.5 self-start rounded-full border border-transparent bg-transparent px-0 py-1 text-[0.82rem] font-bold text-[var(--admin-muted)] transition-colors hover:text-[var(--admin-primary)]"
                >
                    <span aria-hidden="true">←</span> Back to Fleet
                </button>

                {loading && (
                    <div className="surface-card p-10 text-center font-semibold text-[var(--admin-muted)]">
                        Loading horse profile...
                    </div>
                )}
                {error && (
                    <div className="rounded-[8px] border border-[#e3bcb7] bg-[#f3e1df] px-5 py-3 text-sm font-bold text-[#a4392f]">
                        {error}
                    </div>
                )}

                {!loading && data && (
                    <>
                        <div>
                            <h1 className="page-title">{data.horse.horseName}</h1>
                            <p className="page-subtitle">{data.horse.breedName || 'Unknown breed'} · Performance profile and race history.</p>
                        </div>

                        <div className="grid grid-cols-[1.15fr_1fr] gap-5 max-[900px]:grid-cols-1">
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

function InfoStat({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3 rounded-[8px] border border-[var(--admin-border)] bg-[#fffaf8] p-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                <Icon aria-hidden="true" className="text-[0.85rem]" />
            </span>
            <div className="min-w-0">
                <p className="m-0 text-[0.66rem] font-black uppercase tracking-wide text-[var(--admin-muted)]">{label}</p>
                <p className="m-0 mt-0.5 truncate text-[0.9rem] font-bold text-[var(--admin-ink)]">{value}</p>
            </div>
        </div>
    );
}

function HorseProfileCard({ horse }) {
    const [lightboxSrc, setLightboxSrc] = useState(null);

    return (
        <div className="surface-card p-5">
            <div className="flex items-center gap-4 border-b border-[var(--admin-border)] pb-5">
                <img
                    alt={horse.horseName}
                    className="h-20 w-20 flex-none rounded-full border-2 border-[var(--admin-surface-strong)] object-cover"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/Horse1.jpg"; }}
                    src={horse.imageUrl ? resolveFileUrl(horse.imageUrl) : "/Horse1.jpg"}
                />
                <div className="min-w-0">
                    <p className="m-0 text-[1.15rem] font-black text-[var(--admin-ink)]">{horse.horseName}</p>
                    <p className="m-0 mt-0.5 flex items-center gap-1.5 text-[0.82rem] font-semibold text-[var(--admin-muted)]">
                        <FaHorseHead aria-hidden="true" className="text-[0.75rem]" />
                        {horse.breedName || 'Unknown breed'}
                    </p>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <InfoStat icon={FaBirthdayCake} label="Age" value={`${horse.age} years`} />
                <InfoStat icon={FaWeightHanging} label="Weight" value={`${horse.weightKg} kg`} />
                <InfoStat icon={FaUser} label="Owner" value={horse.ownerName} />
                <InfoStat icon={FaUserTie} label="Assigned Jockey" value={horse.assignedJockeyName ?? "—"} />
            </div>

            <div className="mt-5 rounded-[8px] border border-[var(--admin-border)] bg-[#fffaf8] p-4">
                <p className="m-0 flex items-center gap-1.5 text-[0.66rem] font-black uppercase tracking-wide text-[var(--admin-muted)]">
                    <FaFileMedicalAlt aria-hidden="true" />
                    Health Certificate
                </p>
                {horse.healthCertificateImageUrl ? (
                    <>
                        <button
                            className="mt-3 flex w-full items-center gap-3 rounded-[8px] border border-[var(--admin-border)] bg-white p-2 text-left transition-colors hover:border-[var(--admin-primary)]"
                            onClick={() => setLightboxSrc(resolveFileUrl(horse.healthCertificateImageUrl))}
                            type="button"
                        >
                            <img
                                alt="Health certificate"
                                className="h-12 w-16 flex-none rounded-[6px] border border-[var(--admin-border)] object-cover"
                                src={resolveFileUrl(horse.healthCertificateImageUrl)}
                            />
                            <span className="text-[0.82rem] font-bold text-[var(--admin-primary)]">Open certificate</span>
                        </button>
                        <ImageLightbox onClose={() => setLightboxSrc(null)} src={lightboxSrc} />
                    </>
                ) : (
                    <p className="m-0 mt-2 text-[0.82rem] font-semibold text-[var(--admin-muted)]">Not uploaded</p>
                )}
            </div>
        </div>
    );
}

function AchievementsCard({ achievements }) {
    const items = [
        { icon: FaTrophy, label: "Title", value: achievements.championTitles > 0 ? `Champion Titles x${achievements.championTitles}` : "No titles yet", tone: 'bg-[#faf2e0] text-[#8a6209]' },
        { icon: FaStopwatch, label: "Best Time", value: achievements.bestTime != null ? formatTime(achievements.bestTime) : "—", tone: 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]' },
        { icon: FaFire, label: "Current Streak", value: `${achievements.currentWinStreak} Consecutive Wins`, tone: 'bg-[#f3e1df] text-[#a4392f]' },
        { icon: FaStar, label: "Award", value: achievements.award || "—", tone: 'bg-[#e8f7ee] text-[#16864f]' },
    ];

    return (
        <div className="surface-card p-5">
            <h2 className="m-0 mb-4 text-[1.05rem] font-black text-[var(--admin-ink)]">Recent Achievements</h2>
            <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
                {items.map((item) => (
                    <div className="rounded-[8px] border border-[var(--admin-border)] bg-[#fffaf8] p-4" key={item.label}>
                        <span className={`grid h-9 w-9 place-items-center rounded-full ${item.tone}`}>
                            <item.icon aria-hidden="true" className="text-[0.85rem]" />
                        </span>
                        <p className="m-0 mt-3 text-[0.68rem] font-black uppercase tracking-wide text-[var(--admin-muted)]">{item.label}</p>
                        <p className="m-0 mt-1 text-[0.92rem] font-bold text-[var(--admin-ink)]">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RaceHistoryTable({ history }) {
    return (
        <section className="surface-card">
            <div className="section-bar">
                <h2 className="m-0 text-[1.05rem] font-black text-[var(--admin-ink)]">Race History</h2>
                <span className="text-xs font-black text-[var(--admin-muted)]">{history.length} race{history.length === 1 ? '' : 's'}</span>
            </div>

            {history.length === 0 ? (
                <div className="p-10 text-center text-[var(--admin-muted)]">
                    <FaHorseHead aria-hidden="true" className="mx-auto mb-2 text-2xl" />
                    <p className="m-0 font-semibold">No race history yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="data-table min-w-[880px]">
                        <thead>
                            <tr>
                                <th>Tournament</th>
                                <th>Date</th>
                                <th>Track</th>
                                <th>Dist</th>
                                <th>Jockey</th>
                                <th>Pos</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h) => (
                                <tr key={h.resultId}>
                                    <td className="font-bold text-[var(--admin-primary-dark)]">{h.tournamentName}</td>
                                    <td>{new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(h.raceDate))}</td>
                                    <td>{h.track ?? "—"}</td>
                                    <td>{h.distanceMeters}m</td>
                                    <td>{h.jockeyName ?? "—"}</td>
                                    <td>{h.position ?? "-"}</td>
                                    <td>{h.finishTime != null ? formatTime(h.finishTime) : "-"}</td>
                                    <td>
                                        <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[0.68rem] font-black ${getStatusTone(h.status)}`}>
                                            {h.status?.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
