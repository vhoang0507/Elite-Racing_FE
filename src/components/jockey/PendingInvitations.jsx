import { useState } from 'react';
import {
    FaEnvelope,
    FaCheckCircle,
    FaCalendarAlt,
    FaHorseHead,
    FaUsers,
    FaDollarSign,
    FaTimes,
    FaTrophy,
    FaMapMarkerAlt,
    FaFlag,
} from 'react-icons/fa';

import JockeyLayout from './JockeyLayout';
import {
    pendingInvitations,
    acceptedRides,
    upcomingRaces,
} from '../../data/jockeyMockData';

const pageShellClass = 'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

function PendingInvitations() {
    const [invitations, setInvitations] = useState(pendingInvitations);
    const [rides, setRides] = useState(acceptedRides);
    const [selectedInvitation, setSelectedInvitation] = useState(null);

    const pendingCount = invitations.length;
    const acceptedCount = rides.length;
    const upcomingCount = upcomingRaces.length;

    const handleAccept = (invId) => {
        const inv = invitations.find(i => i.id === invId);
        if (inv) {
            setInvitations(prev => prev.filter(i => i.id !== invId));
            setRides(prev => [...prev, {
                id: `ride-${Date.now()}`,
                raceName: inv.raceName,
                horseName: inv.horseName,
                date: inv.date,
                status: 'Confirmed',
            }]);
        }
    };

    const handleReject = (invId) => {
        setInvitations(prev => prev.filter(i => i.id !== invId));
    };

    return (
        <JockeyLayout activeKey="invitations">
            <section className={pageShellClass}>
                {/* Page Title */}
                <div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[720px]:text-[1.6rem]">
                        Pending Invitations
                    </h1>
                    <p className="mb-0 mt-1.5 font-[650] text-[var(--admin-muted)]">
                        Review race invitations from horse owners and respond before expiration.
                    </p>
                </div>

                {/* Main Content Grid: Cards + Summary Sidebar */}
                <div className="grid grid-cols-[minmax(0,1fr)_260px] items-start gap-7 max-[1080px]:grid-cols-1">
                    {/* Invitation Cards */}
                    <div className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
                        {invitations.map((inv) => (
                            <article
                                key={inv.id}
                                className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]"
                            >
                                {/* Banner Image */}
                                <div className="relative h-[140px] overflow-hidden">
                                    <img
                                        src={inv.bannerImage}
                                        alt={inv.raceName}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.6)] to-transparent" />
                                    {/* Pending Badge */}
                                    <span className="absolute right-3 top-3 rounded bg-[var(--admin-primary)] px-2.5 py-1 text-[0.68rem] font-black uppercase text-white">
                                        Pending
                                    </span>
                                    {/* Race Info on banner */}
                                    <div className="absolute bottom-3 left-4">
                                        <strong className="block text-[1rem] text-white">{inv.raceName}</strong>
                                        <span className="text-[0.78rem] text-[rgba(255,255,255,0.85)]">
                                            {inv.raceNumber} • {inv.raceType}
                                        </span>
                                    </div>
                                </div>

                                {/* Horse & Owner Details */}
                                <div className="px-5 pt-4 pb-3">
                                    <div className="flex gap-4">
                                        {/* Horse Info */}
                                        <div className="flex items-start gap-2">
                                            <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[linear-gradient(145deg,#3d2c1e,#8b6b4a)] text-[0.65rem] font-bold text-white">
                                                {inv.horseInitials}
                                            </div>
                                            <div className="text-[0.82rem]">
                                                <strong className="block text-[var(--admin-ink)]">{inv.horseName}</strong>
                                                <span className="text-[var(--admin-muted)]">Breed: {inv.breed}</span><br />
                                                <span className="text-[var(--admin-muted)]">Age: {inv.age}</span><br />
                                                <span className="text-[var(--admin-muted)]">Status: {inv.healthStatus}</span>
                                            </div>
                                        </div>

                                        {/* Owner & Details */}
                                        <div className="text-[0.82rem]">
                                            <strong className="block text-[0.72rem] font-black uppercase text-[var(--admin-primary)]">Owner & Details</strong>
                                            <span className="flex items-center gap-1 text-[var(--admin-muted)]">
                                                <FaUsers className="text-[0.65rem]" /> {inv.ownerName}
                                            </span>
                                            <span className="flex items-center gap-1 text-[var(--admin-muted)]">
                                                <FaCalendarAlt className="text-[0.65rem]" /> {formatDate(inv.date)}
                                            </span>
                                            <span className="flex items-center gap-1 text-[var(--admin-muted)]">
                                                <FaDollarSign className="text-[0.65rem]" /> ${inv.prize.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Owner Message */}
                                <div className="mx-5 mb-3 rounded-md border-l-4 border-[var(--admin-primary)] bg-[#fff8f6] px-4 py-3">
                                    <strong className="mb-1 block text-[0.72rem] font-black uppercase text-[var(--admin-primary)]">Owner Message</strong>
                                    <p className="m-0 text-[0.82rem] italic text-[var(--admin-muted)]">{inv.ownerMessage}</p>
                                </div>

                                {/* AI Match Score */}
                                <div className="mx-5 mb-4 rounded-md bg-[#fff3ef] px-4 py-3">
                                    <div className="flex items-start gap-3">
                                        {/* Score Circle */}
                                        <div className="grid h-11 w-11 flex-none place-items-center rounded-full border-2 border-[var(--admin-primary)] text-[0.82rem] font-black text-[var(--admin-primary)]">
                                            {inv.aiMatchScore}%
                                        </div>
                                        <div>
                                            <strong className="block text-[0.82rem] text-[var(--admin-primary)]">AI Match Score</strong>
                                            <ul className="m-0 mt-1 list-none p-0 text-[0.78rem] text-[var(--admin-muted)]">
                                                {inv.aiReasons.map((reason, i) => (
                                                    <li key={i} className="leading-[1.6]">• {reason}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="border-t border-[var(--admin-border)] px-5 py-4">
                                    <div className="flex gap-3">
                                        <button
                                            className="inline-flex min-h-[40px] flex-1 cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] text-[0.85rem] font-[850] text-white transition-colors hover:bg-[var(--admin-primary-dark)]"
                                            onClick={() => handleAccept(inv.id)}
                                            type="button"
                                        >
                                            Accept Invitation
                                        </button>
                                        <button
                                            className="inline-flex min-h-[40px] flex-1 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-white text-[0.85rem] font-[850] text-[var(--admin-ink)] transition-colors hover:bg-[#f5f5f5]"
                                            onClick={() => handleReject(inv.id)}
                                            type="button"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                    <button
                                        className="mt-2 w-full cursor-pointer border-0 bg-transparent text-[0.82rem] font-bold text-[var(--admin-primary)] underline hover:text-[var(--admin-primary-dark)]"
                                        onClick={() => setSelectedInvitation(inv)}
                                        type="button"
                                    >
                                        View Full Race Details
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Right Sidebar - Summary Cards */}
                    <aside className="grid gap-4 max-[1080px]:grid-cols-3 max-[720px]:grid-cols-1">
                        {/* Pending Invitations */}
                        <article className="grid content-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#ffe8e4] text-[var(--admin-primary)]">
                                <FaEnvelope aria-hidden="true" />
                            </div>
                            <span className="text-[0.75rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Pending Invitations</span>
                            <strong className="text-[2rem] leading-[1.1] text-[var(--admin-ink)]">
                                {String(pendingCount).padStart(2, '0')}
                            </strong>
                        </article>

                        {/* Accepted Invitations */}
                        <article className="grid content-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f5e9] text-[#2e7d32]">
                                <FaCheckCircle aria-hidden="true" />
                            </div>
                            <span className="text-[0.75rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Accepted Invitations</span>
                            <strong className="text-[2rem] leading-[1.1] text-[var(--admin-ink)]">
                                {String(acceptedCount).padStart(2, '0')}
                            </strong>
                        </article>

                        {/* Upcoming Races */}
                        <article className="grid content-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e3f2fd] text-[#1565c0]">
                                <FaCalendarAlt aria-hidden="true" />
                            </div>
                            <span className="text-[0.75rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Upcoming Races</span>
                            <strong className="text-[2rem] leading-[1.1] text-[var(--admin-ink)]">
                                {String(upcomingCount).padStart(2, '0')}
                            </strong>
                        </article>
                    </aside>
                </div>

                {/* Race Detail Modal */}
                {selectedInvitation && (
                    <div
                        className="fixed inset-0 z-20 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8 overflow-auto"
                        onClick={() => setSelectedInvitation(null)}
                        role="presentation"
                    >
                        <section
                            aria-label={`Race details for ${selectedInvitation.raceName}`}
                            className="grid w-[min(680px,100%)] gap-5 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_20px_48px_rgba(45,32,32,0.22)] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                        >
                            {/* Modal Banner */}
                            <div className="relative h-[180px] overflow-hidden">
                                <img
                                    src={selectedInvitation.bannerImage}
                                    alt={selectedInvitation.raceName}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.7)] to-transparent" />
                                <button
                                    aria-label="Close details"
                                    className="absolute right-4 top-4 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-[rgba(0,0,0,0.5)] text-white hover:bg-[rgba(0,0,0,0.7)]"
                                    onClick={() => setSelectedInvitation(null)}
                                    type="button"
                                >
                                    <FaTimes />
                                </button>
                                <div className="absolute bottom-4 left-5">
                                    <h2 className="m-0 text-[1.5rem] font-black text-white">{selectedInvitation.raceName}</h2>
                                    <span className="text-[0.85rem] text-[rgba(255,255,255,0.85)]">
                                        {selectedInvitation.raceNumber} • {selectedInvitation.raceType}
                                    </span>
                                </div>
                                <span className="absolute right-4 bottom-4 rounded bg-[var(--admin-primary)] px-2.5 py-1 text-[0.7rem] font-black uppercase text-white">
                                    Pending
                                </span>
                            </div>

                            {/* Modal Body */}
                            <div className="grid gap-5 px-6 pb-6">
                                {/* Race Information */}
                                <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                                    <div className="grid gap-3 rounded-md bg-[#fff8f6] p-4">
                                        <h3 className="m-0 text-[0.75rem] font-black uppercase text-[var(--admin-primary)]">Race Information</h3>
                                        <div className="grid gap-2 text-[0.85rem]">
                                            <div className="flex items-center gap-2">
                                                <FaFlag className="text-[0.7rem] text-[var(--admin-muted)]" />
                                                <span className="text-[var(--admin-muted)]">Race:</span>
                                                <strong className="text-[var(--admin-ink)]">{selectedInvitation.raceName}</strong>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-[0.7rem] text-[var(--admin-muted)]" />
                                                <span className="text-[var(--admin-muted)]">Type:</span>
                                                <strong className="text-[var(--admin-ink)]">{selectedInvitation.raceType}</strong>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-[0.7rem] text-[var(--admin-muted)]" />
                                                <span className="text-[var(--admin-muted)]">Date:</span>
                                                <strong className="text-[var(--admin-ink)]">{formatDate(selectedInvitation.date)}</strong>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaTrophy className="text-[0.7rem] text-[var(--admin-muted)]" />
                                                <span className="text-[var(--admin-muted)]">Prize:</span>
                                                <strong className="text-[var(--admin-primary)]">${selectedInvitation.prize.toLocaleString()}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 rounded-md bg-[#fff8f6] p-4">
                                        <h3 className="m-0 text-[0.75rem] font-black uppercase text-[var(--admin-primary)]">Horse Details</h3>
                                        <div className="flex items-start gap-3">
                                            <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[linear-gradient(145deg,#3d2c1e,#8b6b4a)] text-[0.7rem] font-bold text-white">
                                                {selectedInvitation.horseInitials}
                                            </div>
                                            <div className="grid gap-1 text-[0.85rem]">
                                                <strong className="text-[var(--admin-ink)]">{selectedInvitation.horseName}</strong>
                                                <span className="text-[var(--admin-muted)]">Breed: {selectedInvitation.breed}</span>
                                                <span className="text-[var(--admin-muted)]">Age: {selectedInvitation.age}</span>
                                                <span className="text-[var(--admin-muted)]">Health: <strong className="text-[#118548]">{selectedInvitation.healthStatus}</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Owner Info */}
                                <div className="rounded-md bg-[#fff8f6] p-4">
                                    <h3 className="m-0 mb-2 text-[0.75rem] font-black uppercase text-[var(--admin-primary)]">Owner Information</h3>
                                    <div className="flex items-center gap-2 text-[0.85rem]">
                                        <FaUsers className="text-[0.7rem] text-[var(--admin-muted)]" />
                                        <strong className="text-[var(--admin-ink)]">{selectedInvitation.ownerName}</strong>
                                    </div>
                                </div>

                                {/* Owner Message */}
                                <div className="rounded-md border-l-4 border-[var(--admin-primary)] bg-[#fff8f6] px-4 py-3">
                                    <strong className="mb-1 block text-[0.75rem] font-black uppercase text-[var(--admin-primary)]">Owner Message</strong>
                                    <p className="m-0 text-[0.85rem] italic text-[var(--admin-muted)]">{selectedInvitation.ownerMessage}</p>
                                </div>

                                {/* AI Match Score */}
                                <div className="rounded-md bg-[#fff3ef] p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="grid h-14 w-14 flex-none place-items-center rounded-full border-3 border-[var(--admin-primary)] text-[1rem] font-black text-[var(--admin-primary)]">
                                            {selectedInvitation.aiMatchScore}%
                                        </div>
                                        <div>
                                            <strong className="block text-[0.9rem] text-[var(--admin-primary)]">AI Match Score</strong>
                                            <ul className="m-0 mt-2 list-none p-0 text-[0.85rem] text-[var(--admin-muted)]">
                                                {selectedInvitation.aiReasons.map((reason, i) => (
                                                    <li key={i} className="leading-[1.8]">• {reason}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] text-[0.9rem] font-[850] text-white transition-colors hover:bg-[var(--admin-primary-dark)]"
                                        onClick={() => {
                                            handleAccept(selectedInvitation.id);
                                            setSelectedInvitation(null);
                                        }}
                                        type="button"
                                    >
                                        Accept Invitation
                                    </button>
                                    <button
                                        className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-white text-[0.9rem] font-[850] text-[var(--admin-ink)] transition-colors hover:bg-[#f5f5f5]"
                                        onClick={() => {
                                            handleReject(selectedInvitation.id);
                                            setSelectedInvitation(null);
                                        }}
                                        type="button"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Footer */}
                <footer className="flex items-center justify-between border-t border-[var(--admin-border)] px-0 py-6 text-[0.82rem] text-[var(--admin-muted)] max-[720px]:flex-col max-[720px]:gap-3">
                    <strong className="text-[var(--admin-primary)]">Elite Racing League</strong>
                    <div className="flex flex-wrap gap-4">
                        <a href="#" className="text-[var(--admin-muted)] no-underline hover:text-[var(--admin-primary)]">Terms of Service</a>
                        <a href="#" className="text-[var(--admin-muted)] no-underline hover:text-[var(--admin-primary)]">Privacy Policy</a>
                        <a href="#" className="text-[var(--admin-muted)] no-underline hover:text-[var(--admin-primary)]">Contact Support</a>
                        <a href="#" className="text-[var(--admin-muted)] no-underline hover:text-[var(--admin-primary)]">Racing Rules</a>
                    </div>
                </footer>
            </section>
        </JockeyLayout>
    );
}

export default PendingInvitations;
