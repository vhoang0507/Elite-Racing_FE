import { useState, useEffect } from 'react';
import {
    FaEnvelope,
    FaCalendarAlt,
    FaUsers,
    FaTimes,
} from 'react-icons/fa';

import JockeyLayout from './JockeyLayout';
import { jockeyApi } from '../../api/jockeyApi';

const pageShellClass = 'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';

function PendingInvitations() {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvitation, setSelectedInvitation] = useState(null);

    useEffect(() => {
        jockeyApi.getPendingInvitations()
            .then(setInvitations)
            .catch(() => setInvitations([]))
            .finally(() => setLoading(false));
    }, []);

    const handleAccept = async (invId) => {
        try {
            await jockeyApi.acceptInvitation(invId);
            setInvitations(prev => prev.filter(i => i.invitationId !== invId));
            setSelectedInvitation(null);
        } catch (err) {
            alert(err.message || 'Failed to accept');
        }
    };

    const handleReject = async (invId) => {
        try {
            await jockeyApi.rejectInvitation(invId);
            setInvitations(prev => prev.filter(i => i.invitationId !== invId));
            setSelectedInvitation(null);
        } catch (err) {
            alert(err.message || 'Failed to reject');
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
                {/* Header */}
                <div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)]">
                        Pending Invitations
                    </h1>
                    <p className="mb-0 mt-1.5 font-[650] text-[var(--admin-muted)]">
                        Review race invitations from horse owners and respond before expiration.
                    </p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-5 max-[720px]:grid-cols-1">
                    <article className="grid content-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#ffe8e4] text-[var(--admin-primary)]">
                            <FaEnvelope />
                        </div>
                        <span className="text-[0.75rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Pending Invitations</span>
                        <strong className="text-[2rem] leading-[1.1] text-[var(--admin-ink)]">
                            {String(invitations.length).padStart(2, '0')}
                        </strong>
                    </article>
                </div>

                {/* Cards or Empty State */}
                {invitations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] py-20">
                        <FaEnvelope className="mb-4 text-[3rem] text-[#ddd]" />
                        <p className="text-[1rem] font-bold text-[var(--admin-muted)]">No pending invitations</p>
                        <p className="mt-1 text-[0.85rem] text-[#bbb]">You will be notified when a horse owner sends you an invitation.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
                        {invitations.map((inv) => (
                            <article key={inv.invitationId} className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                                <div className="relative h-[140px] overflow-hidden bg-[#3d2c1e]">
                                    <div className="absolute inset-0 flex items-center justify-center text-white text-[2rem]">🏇</div>
                                    <span className="absolute right-3 top-3 rounded bg-[var(--admin-primary)] px-2.5 py-1 text-[0.68rem] font-black uppercase text-white">
                                        Pending
                                    </span>
                                    <div className="absolute bottom-3 left-4">
                                        <strong className="block text-[1rem] text-white">{inv.raceName}</strong>
                                        <span className="text-[0.78rem] text-[rgba(255,255,255,0.85)]">
                                            📅 {inv.raceDate?.slice(0, 10)}
                                        </span>
                                    </div>
                                </div>

                                <div className="px-5 pt-4 pb-3">
                                    <div className="text-[0.82rem]">
                                        <span className="flex items-center gap-1 text-[var(--admin-muted)]">
                                            <FaUsers className="text-[0.65rem]" /> {inv.ownerName}
                                        </span>
                                        <span className="flex items-center gap-1 text-[var(--admin-muted)] mt-1">
                                            <FaCalendarAlt className="text-[0.65rem]" /> {inv.raceDate?.slice(0, 10)}
                                        </span>
                                        {inv.location && (
                                            <span className="flex items-center gap-1 text-[var(--admin-muted)] mt-1">
                                                📍 {inv.location}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-[var(--admin-border)] px-5 py-4">
                                    <div className="flex gap-3">
                                        <button
                                            className="inline-flex min-h-[40px] flex-1 cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] text-[0.85rem] font-[850] text-white hover:bg-[var(--admin-primary-dark)]"
                                            onClick={() => handleAccept(inv.invitationId)}
                                            type="button"
                                        >
                                            Accept
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
                                        onClick={() => setSelectedInvitation(inv)}
                                        type="button"
                                    >
                                        View Full Race Details
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Detail Modal */}
                {selectedInvitation && (
                    <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8 overflow-auto" onClick={() => setSelectedInvitation(null)}>
                        <section className="grid w-[min(600px,100%)] gap-0 overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-xl" onClick={e => e.stopPropagation()}>
                            <div className="relative h-[160px] bg-[#3d2c1e] flex items-center justify-center">
                                <div className="text-[3rem]">🏇</div>
                                <button className="absolute right-4 top-4 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-[rgba(0,0,0,0.5)] text-white" onClick={() => setSelectedInvitation(null)} type="button">
                                    <FaTimes />
                                </button>
                                <div className="absolute bottom-4 left-5">
                                    <h2 className="m-0 text-[1.5rem] font-black text-white">{selectedInvitation.raceName}</h2>
                                </div>
                            </div>

                            <div className="grid gap-4 p-6">
                                <div className="rounded-md bg-[#fff8f6] p-4 text-[0.85rem]">
                                    <p className="m-0"><strong>Owner:</strong> {selectedInvitation.ownerName}</p>
                                    <p className="m-0 mt-1"><strong>Race Date:</strong> {selectedInvitation.raceDate?.slice(0, 10)}</p>
                                    {selectedInvitation.location && <p className="m-0 mt-1"><strong>Location:</strong> {selectedInvitation.location}</p>}
                                    <p className="m-0 mt-1"><strong>Status:</strong> {selectedInvitation.status}</p>
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


            </section>
        </JockeyLayout>
    );
}

export default PendingInvitations;