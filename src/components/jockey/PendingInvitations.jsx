import { useState, useEffect } from 'react';
import {
    FaEnvelope,
    FaCheckCircle,
    FaCalendarAlt,
    FaUsers,
    FaTimes,
    FaDollarSign,
} from 'react-icons/fa';

import JockeyLayout from './JockeyLayout';
import { jockeyApi } from '../../api/jockeyApi';
import { resolveFileUrl } from '../../api/uploadApi';

const pageShellClass = 'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFee(amount) {
    if (amount == null) return '—';
    return `$${Number(amount).toLocaleString()}`;
}

function formatAge(age) {
    if (age == null) return '—';
    return `${age} years`;
}

function mapDetailToFlat(detail) {
    return {
        invitationId: detail.invitationId,
        tournamentName: detail.tournament?.tournamentName,
        raceName: detail.race?.raceName,
        raceDate: detail.race?.raceDate,
        location: detail.race?.location,
        distanceMeters: detail.race?.distanceMeters,
        surfaceType: detail.race?.surfaceType,
        jockeySelectionDeadline: detail.race?.jockeySelectionDeadline,
        horseId: detail.horse?.horseId,
        horseName: detail.horse?.horseName,
        horseImageUrl: detail.horse?.imageUrl,
        healthCertificateImageUrl: detail.horse?.healthCertificateImageUrl,
        breedName: detail.horse?.breedName,
        age: detail.horse?.age,
        horseHealthStatus: detail.horse?.healthStatus,
        ownerId: detail.owner?.ownerId,
        ownerName: detail.owner?.ownerName,
        ownerMessage: detail.ownerMessage,
        feeAmount: detail.feeAmount,
        status: detail.status,
        sentAt: detail.sentAt,
        matchScore: detail.matchScore,
        matchReasons: detail.matchReasons,
    };
}

function HealthCertificateBadge({ url }) {
    if (!url) {
        return (
            <span className="mt-2 inline-flex rounded border border-[#dbc3bf] bg-[#f3e8e6] px-2.5 py-1 text-[0.68rem] font-black uppercase text-[#7f645f]">
                Certificate not uploaded
            </span>
        );
    }

    const resolvedUrl = resolveFileUrl(url);

    return (
        <a className="mt-2 inline-flex items-center gap-2 rounded border border-[#e7a49a] bg-[#fff8f6] px-2.5 py-1 text-[0.68rem] font-black uppercase text-[var(--admin-primary)] no-underline hover:bg-[#fff0ed]" href={resolvedUrl} target="_blank" rel="noreferrer">
            <img alt="Health certificate" className="h-7 w-9 rounded object-cover" src={resolvedUrl} />
            Health certificate
        </a>
    );
}

function PendingInvitations() {
    const [invitations, setInvitations] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedInvitation, setSelectedInvitation] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            jockeyApi.getPendingInvitations(),
            jockeyApi.getJockeyDashboard().catch(() => null),
        ])
            .then(([invData, dashData]) => {
                const list = Array.isArray(invData) ? invData : (invData?.items ?? []);
                setInvitations(list);
                setDashboard(dashData);
            })
            .catch((err) => setError(err.message || 'Failed to load invitations'))
            .finally(() => setLoading(false));
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAccept = async (invId) => {
        try {
            await jockeyApi.acceptInvitation(invId);
            setInvitations(prev => prev.filter(i => i.invitationId !== invId));
            setDashboard(prev => prev ? {
                ...prev,
                pendingInvitations: Math.max((prev.pendingInvitations ?? 1) - 1, 0),
                acceptedInvitations: (prev.acceptedInvitations ?? 0) + 1,
            } : prev);
            setSelectedInvitation(null);
            showToast('Đã chấp nhận lời mời', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to accept', 'error');
        }
    };

    const handleReject = async (invId) => {
        try {
            await jockeyApi.rejectInvitation(invId);
            setInvitations(prev => prev.filter(i => i.invitationId !== invId));
            setDashboard(prev => prev ? {
                ...prev,
                pendingInvitations: Math.max((prev.pendingInvitations ?? 1) - 1, 0),
            } : prev);
            setSelectedInvitation(null);
            showToast('Đã từ chối lời mời', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to reject', 'error');
        }
    };

    const handleViewDetails = async (inv) => {
        setSelectedInvitation(inv);
        setLoadingDetail(true);
        try {
            const detail = await jockeyApi.getInvitationDetail(inv.invitationId);
            setSelectedInvitation(mapDetailToFlat(detail));
        } catch {
            // giữ data cũ từ list nếu fetch detail lỗi
        } finally {
            setLoadingDetail(false);
        }
    };

    if (loading) return (
        <JockeyLayout activeKey="invitations">
            <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</p>
        </JockeyLayout>
    );

    return (
        <JockeyLayout activeKey="invitations">
            <section className={pageShellClass}>
                <div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)]">
                        Pending Invitations
                    </h1>
                    <p className="mb-0 mt-1.5 font-[650] text-[var(--admin-muted)]">
                        Review race invitations from horse owners and respond before expiration.
                    </p>
                </div>

                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-[1fr_260px] gap-6 max-[1100px]:grid-cols-1">
                    {/* Cards */}
                    <div>
                        {invitations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] py-20">
                                <FaEnvelope className="mb-4 text-[3rem] text-[#ddd]" />
                                <p className="text-[1rem] font-bold text-[var(--admin-muted)]">Bạn chưa có lời mời nào đang chờ.</p>
                                <p className="mt-1 text-[0.85rem] text-[#bbb]">You will be notified when a horse owner sends you an invitation.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
                                {invitations.map((inv) => (
                                    <article key={inv.invitationId} className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                                        <div className="relative h-[140px] overflow-hidden bg-[#3d2c1e]">
                                            {inv.horseImageUrl ? (
                                                <img src={resolveFileUrl(inv.horseImageUrl)} alt={inv.horseName} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-white text-[2rem]">🏇</div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                            <span className="absolute right-3 top-3 rounded bg-[var(--admin-primary)] px-2.5 py-1 text-[0.68rem] font-black uppercase text-white">
                                                {inv.status || 'Pending'}
                                            </span>
                                            <div className="absolute bottom-3 left-4 right-4">
                                                <strong className="block text-[1rem] text-white">{inv.tournamentName}</strong>
                                                <span className="text-[0.78rem] text-[rgba(255,255,255,0.9)]">
                                                    {inv.raceName} • {inv.distanceMeters}m{inv.surfaceType ? ` ${inv.surfaceType}` : ''}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 px-5 pt-4 pb-3 text-[0.8rem]">
                                            <div>
                                                <strong className="block text-[0.92rem] text-[var(--admin-ink)]">{inv.horseName}</strong>
                                                <span className="mt-1 block text-[var(--admin-muted)]">Breed: {inv.breedName}</span>
                                                <span className="block text-[var(--admin-muted)]">Age: {formatAge(inv.age)}</span>
                                                <span className="block text-[var(--admin-muted)]">Status: {inv.horseHealthStatus}</span>
                                                <HealthCertificateBadge url={inv.healthCertificateImageUrl} />
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-[0.7rem] font-bold uppercase tracking-wide text-[#118548]">Owner &amp; Details</span>
                                                <span className="mt-1 flex items-center justify-end gap-1 text-[var(--admin-muted)]">
                                                    <FaUsers className="text-[0.65rem]" /> {inv.ownerName}
                                                </span>
                                                <span className="flex items-center justify-end gap-1 text-[var(--admin-muted)]">
                                                    <FaCalendarAlt className="text-[0.65rem]" /> {formatDate(inv.raceDate)}
                                                </span>
                                                <span className="flex items-center justify-end gap-1 text-[var(--admin-muted)]">
                                                    <FaDollarSign className="text-[0.65rem]" /> {formatFee(inv.feeAmount)}
                                                </span>
                                            </div>
                                        </div>

                                        {inv.ownerMessage && (
                                            <div className="mx-5 mb-3 rounded-md bg-[#fff0ed] px-4 py-3">
                                                <p className="m-0 text-[0.7rem] font-bold uppercase tracking-wide text-[var(--admin-primary)]">Owner Message</p>
                                                <p className="m-0 mt-1 text-[0.82rem] italic text-[var(--admin-ink)]">"{inv.ownerMessage}"</p>
                                            </div>
                                        )}

                                        {inv.matchScore != null && (
                                            <div className="mx-5 mb-4 flex items-center gap-4 rounded-md bg-[#fff0ed] px-4 py-3">
                                                <div className="grid h-12 w-12 flex-none place-items-center rounded-full bg-white text-[0.9rem] font-black text-[var(--admin-primary)]">
                                                    {inv.matchScore}%
                                                </div>
                                                <div>
                                                    <p className="m-0 text-[0.7rem] font-bold uppercase tracking-wide text-[var(--admin-primary)]">AI Match Score</p>
                                                    <ul className="m-0 mt-1 list-disc pl-4 text-[0.78rem] text-[var(--admin-ink)]">
                                                        {(inv.matchReasons ?? []).map((reason, idx) => (
                                                            <li key={idx}>{reason}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t border-[var(--admin-border)] px-5 py-4">
                                            <div className="flex gap-3">
                                                <button
                                                    className="inline-flex min-h-[40px] flex-1 cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] text-[0.85rem] font-[850] text-white hover:bg-[var(--admin-primary-dark)]"
                                                    onClick={() => handleAccept(inv.invitationId)}
                                                    type="button"
                                                >
                                                    Accept Invitation
                                                </button>
                                                <button
                                                    className="inline-flex min-h-[40px] flex-1 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-white text-[0.85rem] font-[850] text-[var(--admin-ink)] hover:bg-[#f5f5f5]"
                                                    onClick={() => handleReject(inv.invitationId)}
                                                    type="button"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                            <button
                                                className="mt-2 w-full cursor-pointer border-0 bg-transparent text-[0.82rem] font-bold text-[var(--admin-primary)] underline"
                                                onClick={() => handleViewDetails(inv)}
                                                type="button"
                                            >
                                                View Full Race Details
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stat sidebar */}
                    <aside className="grid content-start gap-4">
                        <StatCard icon={<FaEnvelope />} bg="#ffe8e4" color="var(--admin-primary)" label="Pending Invitations" value={dashboard?.pendingInvitations} />
                        <StatCard icon={<FaCheckCircle />} bg="#fff3cd" color="#856404" label="Accepted Invitations" value={dashboard?.acceptedInvitations} />
                        <StatCard icon={<FaCalendarAlt />} bg="#e3f2fd" color="#1565c0" label="Upcoming Races" value={dashboard?.upcomingRaces} />
                    </aside>
                </div>

                {/* Detail Modal */}
                {selectedInvitation && (
                    <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8 overflow-auto" onClick={() => setSelectedInvitation(null)}>
                        <section className="grid w-[min(600px,100%)] gap-0 overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-xl" onClick={e => e.stopPropagation()}>
                            <div className="relative h-[160px] bg-[#3d2c1e] flex items-center justify-center overflow-hidden">
                                {selectedInvitation.horseImageUrl ? (
                                    <img src={resolveFileUrl(selectedInvitation.horseImageUrl)} alt={selectedInvitation.horseName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="text-[3rem]">🏇</div>
                                )}
                                <div className="absolute inset-0 bg-black/40" />
                                <button className="absolute right-4 top-4 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-[rgba(0,0,0,0.5)] text-white" onClick={() => setSelectedInvitation(null)} type="button">
                                    <FaTimes />
                                </button>
                                <div className="absolute bottom-4 left-5">
                                    <h2 className="m-0 text-[1.5rem] font-black text-white">{selectedInvitation.raceName}</h2>
                                </div>
                            </div>

                            <div className="grid gap-4 p-6">
                                {loadingDetail && <p className="m-0 text-[0.8rem] text-[var(--admin-muted)]">Loading full details...</p>}

                                <div className="rounded-md bg-[#fff8f6] p-4 text-[0.85rem]">
                                    <p className="m-0"><strong>Tournament:</strong> {selectedInvitation.tournamentName}</p>
                                    <p className="m-0 mt-1"><strong>Owner:</strong> {selectedInvitation.ownerName}</p>
                                    <p className="m-0 mt-1"><strong>Race Date:</strong> {formatDate(selectedInvitation.raceDate)}</p>
                                    {selectedInvitation.location && <p className="m-0 mt-1"><strong>Location:</strong> {selectedInvitation.location}</p>}
                                    <p className="m-0 mt-1"><strong>Distance:</strong> {selectedInvitation.distanceMeters}m</p>
                                    <p className="m-0 mt-1"><strong>Horse:</strong> {selectedInvitation.horseName} ({selectedInvitation.breedName})</p>
                                    <div className="mt-2">
                                        <HealthCertificateBadge url={selectedInvitation.healthCertificateImageUrl} />
                                    </div>
                                    <p className="m-0 mt-1"><strong>Fee:</strong> {formatFee(selectedInvitation.feeAmount)}</p>
                                    {selectedInvitation.jockeySelectionDeadline && (
                                        <p className="m-0 mt-1"><strong>Deadline:</strong> {formatDate(selectedInvitation.jockeySelectionDeadline)}</p>
                                    )}
                                    <p className="m-0 mt-1"><strong>Status:</strong> {selectedInvitation.status}</p>
                                    {selectedInvitation.matchScore != null && (
                                        <p className="m-0 mt-1"><strong>AI Match Score:</strong> {selectedInvitation.matchScore}%</p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] text-[0.9rem] font-[850] text-white hover:bg-[var(--admin-primary-dark)]"
                                        onClick={() => handleAccept(selectedInvitation.invitationId)}
                                        type="button"
                                    >
                                        Accept Invitation
                                    </button>
                                    <button
                                        className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-white text-[0.9rem] font-[850] text-[var(--admin-ink)] hover:bg-[#f5f5f5]"
                                        onClick={() => handleReject(selectedInvitation.invitationId)}
                                        type="button"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Toast */}
                {toast && (
                    <div
                        className={`fixed bottom-6 right-6 z-50 rounded-md px-5 py-3 text-[0.85rem] font-semibold text-white shadow-lg ${toast.type === 'error' ? 'bg-red-700' : 'bg-[var(--admin-primary-dark)]'
                            }`}
                    >
                        {toast.message}
                    </div>
                )}
            </section>
        </JockeyLayout>
    );
}

function StatCard({ icon, bg, color, label, value }) {
    return (
        <article className="grid content-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
            <div className="grid h-9 w-9 place-items-center rounded-lg text-[1rem]" style={{ backgroundColor: bg, color }}>
                {icon}
            </div>
            <span className="text-[0.72rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">{label}</span>
            <strong className="text-[1.8rem] leading-[1.1] text-[var(--admin-ink)]">
                {String(value ?? 0).padStart(2, '0')}
            </strong>
        </article>
    );
}

export default PendingInvitations;
