import { useState } from 'react';
import {
    FaCalendarAlt,
    FaCheckCircle,
    FaMapMarkerAlt,
    FaUserTie,
    FaRulerHorizontal,
    FaClock,
    FaStickyNote,
    FaTimes,
    FaHorseHead,
    FaDollarSign,
    FaFlag,
} from 'react-icons/fa';

import JockeyLayout from './JockeyLayout';
import {
    acceptedRides,
    upcomingRaces,
} from '../../data/jockeyMockData';

const pageShellClass = 'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const getMonthShort = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
};

const getDay = (dateStr) => {
    const date = new Date(dateStr);
    return String(date.getDate()).padStart(2, '0');
};

function AcceptedRaces() {
    const [rides] = useState(acceptedRides);
    const [selectedRide, setSelectedRide] = useState(null);

    const acceptedCount = rides.length;
    const upcomingThisWeek = upcomingRaces.filter(r => r.daysUntil <= 7).length || 5;

    return (
        <JockeyLayout activeKey="accepted">
            <section className={pageShellClass}>
                {/* Page Title */}
                <div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[720px]:text-[1.6rem]">
                        Accepted Races
                    </h1>
                    <p className="mb-0 mt-1.5 font-[650] text-[var(--admin-muted)]">
                        Track your confirmed races, schedules, and assigned horses.
                    </p>
                </div>

                {/* Summary Cards */}
                <section className="grid grid-cols-2 gap-5 max-[720px]:grid-cols-1">
                    <article className="flex items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#ffe8e4] text-[var(--admin-primary)]">
                            <FaCheckCircle aria-hidden="true" />
                        </div>
                        <div>
                            <span className="text-[0.75rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Accepted Races</span>
                            <strong className="block text-[1.5rem] leading-[1.2] text-[var(--admin-ink)]">{acceptedCount}</strong>
                        </div>
                    </article>
                    <article className="flex items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e3f2fd] text-[#1565c0]">
                            <FaCalendarAlt aria-hidden="true" />
                        </div>
                        <div>
                            <span className="text-[0.75rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Upcoming This Week</span>
                            <strong className="block text-[1.5rem] leading-[1.2] text-[var(--admin-ink)]">{upcomingThisWeek}</strong>
                        </div>
                    </article>
                </section>

                {/* Main Content: Race Cards + Upcoming Schedule Sidebar */}
                <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-7 max-[1080px]:grid-cols-1">
                    {/* Race Cards */}
                    <div className="grid gap-6">
                        {rides.map((ride) => (
                            <article
                                key={ride.id}
                                className="grid grid-cols-[240px_1fr] overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] max-[800px]:grid-cols-1"
                            >
                                {/* Left Image */}
                                <div className="h-full min-h-[280px] overflow-hidden max-[800px]:h-[200px]">
                                    <img
                                        src={ride.image}
                                        alt={ride.raceName}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                {/* Right Content */}
                                <div className="flex flex-col gap-4 p-5">
                                    {/* Horse Info + Race Fee */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[linear-gradient(145deg,#3d2c1e,#8b6b4a)] text-[0.7rem] font-bold text-white">
                                                {ride.horseInitials}
                                            </div>
                                            <div>
                                                <span className="text-[0.75rem] text-[var(--admin-muted)]">Assigned Horse</span>
                                                <strong className="block text-[1rem] text-[var(--admin-ink)]">{ride.horseName}</strong>
                                                <div className="mt-1 flex flex-wrap gap-1.5">
                                                    <span className="rounded bg-[var(--admin-primary)] px-2 py-0.5 text-[0.62rem] font-bold uppercase text-white">
                                                        {ride.breed}
                                                    </span>
                                                    <span className="rounded bg-[#e8e8e8] px-2 py-0.5 text-[0.62rem] font-bold text-[var(--admin-ink)]">
                                                        {ride.age}
                                                    </span>
                                                    <span className="rounded bg-[#e8f5e9] px-2 py-0.5 text-[0.62rem] font-bold uppercase text-[#2e7d32]">
                                                        {ride.healthStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[0.72rem] text-[var(--admin-muted)]">Race Fee</span>
                                            <strong className="block text-[1.1rem] text-[var(--admin-primary)]">${ride.raceFee.toLocaleString()}</strong>
                                        </div>
                                    </div>

                                    {/* Race Details Grid */}
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.82rem]">
                                        <div>
                                            <span className="text-[0.65rem] font-bold uppercase text-[var(--admin-muted)]">Date & Time</span>
                                            <div className="flex items-center gap-1.5 text-[var(--admin-ink)]">
                                                <FaClock className="text-[0.65rem] text-[var(--admin-muted)]" />
                                                <span>{formatDate(ride.date)} • {ride.time}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[0.65rem] font-bold uppercase text-[var(--admin-muted)]">Location</span>
                                            <div className="flex items-center gap-1.5 text-[var(--admin-ink)]">
                                                <FaMapMarkerAlt className="text-[0.65rem] text-[var(--admin-muted)]" />
                                                <span>{ride.location}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[0.65rem] font-bold uppercase text-[var(--admin-muted)]">Referee</span>
                                            <div className="flex items-center gap-1.5 text-[var(--admin-ink)]">
                                                <FaUserTie className="text-[0.65rem] text-[var(--admin-muted)]" />
                                                <span>{ride.referee}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[0.65rem] font-bold uppercase text-[var(--admin-muted)]">Distance</span>
                                            <div className="flex items-center gap-1.5 text-[var(--admin-ink)]">
                                                <FaRulerHorizontal className="text-[0.65rem] text-[var(--admin-muted)]" />
                                                <span>{ride.distance}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Owner Notes */}
                                    <div className="rounded-md bg-[#fff8f6] px-4 py-3">
                                        <div className="mb-1 flex items-center gap-1.5">
                                            <FaStickyNote className="text-[0.7rem] text-[var(--admin-primary)]" />
                                            <strong className="text-[0.72rem] font-black uppercase text-[var(--admin-primary)]">Owner Notes</strong>
                                        </div>
                                        <p className="m-0 text-[0.82rem] italic text-[var(--admin-muted)]">{ride.ownerNotes}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-3">
                                        <button
                                            className="inline-flex min-h-[36px] cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] px-5 text-[0.82rem] font-[850] text-white transition-colors hover:bg-[var(--admin-primary-dark)]"
                                            onClick={() => setSelectedRide(ride)}
                                            type="button"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            className="inline-flex min-h-[36px] cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-white px-5 text-[0.82rem] font-[850] text-[var(--admin-ink)] transition-colors hover:bg-[#f5f5f5]"
                                            type="button"
                                        >
                                            Contact Owner
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Upcoming Schedule Sidebar */}
                    <aside className="sticky top-20 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                        <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3">
                            <h3 className="m-0 text-[0.95rem] font-bold text-[var(--admin-ink)]">Upcoming Schedule</h3>
                            <FaCalendarAlt className="text-[0.8rem] text-[var(--admin-muted)]" />
                        </div>

                        <div className="grid gap-0 divide-y divide-[var(--admin-border)]">
                            {upcomingRaces.slice(0, 3).map((race) => (
                                <div key={race.id} className="flex items-center gap-3 px-4 py-3">
                                    {/* Date Block */}
                                    <div className="grid h-11 w-11 flex-none place-items-center rounded-md bg-[#fff3ef] text-center">
                                        <div>
                                            <span className="block text-[0.58rem] font-black uppercase text-[var(--admin-primary)]">
                                                {getMonthShort(race.date)}
                                            </span>
                                            <strong className="block text-[0.95rem] leading-[1] text-[var(--admin-primary)]">
                                                {getDay(race.date)}
                                            </strong>
                                        </div>
                                    </div>

                                    {/* Race Info */}
                                    <div className="min-w-0 flex-1">
                                        <strong className="block truncate text-[0.82rem] text-[var(--admin-ink)]">{race.raceName}</strong>
                                        <span className="text-[0.72rem] text-[var(--admin-muted)]">
                                            <FaClock className="mr-1 inline text-[0.6rem]" />{race.time}
                                        </span>
                                    </div>

                                    {/* Days Until */}
                                    <span className="whitespace-nowrap rounded bg-[#fff3ef] px-2 py-1 text-[0.65rem] font-black text-[var(--admin-primary)]">
                                        {race.daysUntil} DAYS
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-[var(--admin-border)] px-4 py-3">
                            <button
                                className="w-full cursor-pointer rounded-md border border-[var(--admin-border)] bg-white py-2 text-[0.8rem] font-bold text-[var(--admin-ink)] transition-colors hover:bg-[#f5f5f5]"
                                type="button"
                            >
                                View all Calendar
                            </button>
                        </div>
                    </aside>
                </div>

                {/* Race Detail Modal */}
                {selectedRide && (
                    <div
                        className="fixed inset-0 z-20 grid place-items-center overflow-auto bg-[rgba(45,32,32,0.38)] px-5 py-8"
                        onClick={() => setSelectedRide(null)}
                        role="presentation"
                    >
                        <section
                            aria-label={`Details for ${selectedRide.raceName}`}
                            className="grid w-[min(700px,100%)] gap-0 overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_20px_48px_rgba(45,32,32,0.22)]"
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                        >
                            {/* Modal Banner */}
                            <div className="relative h-[200px] overflow-hidden">
                                <img
                                    src={selectedRide.image}
                                    alt={selectedRide.raceName}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.7)] to-transparent" />
                                <button
                                    aria-label="Close details"
                                    className="absolute right-4 top-4 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-[rgba(0,0,0,0.5)] text-white hover:bg-[rgba(0,0,0,0.7)]"
                                    onClick={() => setSelectedRide(null)}
                                    type="button"
                                >
                                    <FaTimes />
                                </button>
                                <div className="absolute bottom-4 left-5">
                                    <h2 className="m-0 text-[1.5rem] font-black text-white">{selectedRide.raceName}</h2>
                                    <span className="mt-1 inline-flex rounded bg-[#e8f5e9] px-2 py-0.5 text-[0.7rem] font-bold text-[#2e7d32]">
                                        {selectedRide.status}
                                    </span>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="grid gap-5 p-6">
                                {/* Horse Info */}
                                <div className="flex items-start gap-4 rounded-md bg-[#fff8f6] p-4">
                                    <div className="grid h-12 w-12 flex-none place-items-center rounded-full bg-[linear-gradient(145deg,#3d2c1e,#8b6b4a)] text-[0.75rem] font-bold text-white">
                                        {selectedRide.horseInitials}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <FaHorseHead className="text-[0.8rem] text-[var(--admin-muted)]" />
                                            <span className="text-[0.75rem] text-[var(--admin-muted)]">Assigned Horse</span>
                                        </div>
                                        <strong className="block text-[1.1rem] text-[var(--admin-ink)]">{selectedRide.horseName}</strong>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            <span className="rounded bg-[var(--admin-primary)] px-2 py-0.5 text-[0.65rem] font-bold uppercase text-white">
                                                {selectedRide.breed}
                                            </span>
                                            <span className="rounded bg-[#e8e8e8] px-2 py-0.5 text-[0.65rem] font-bold text-[var(--admin-ink)]">
                                                {selectedRide.age}
                                            </span>
                                            <span className="rounded bg-[#e8f5e9] px-2 py-0.5 text-[0.65rem] font-bold uppercase text-[#2e7d32]">
                                                {selectedRide.healthStatus}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[0.72rem] text-[var(--admin-muted)]">Race Fee</span>
                                        <strong className="block text-[1.2rem] text-[var(--admin-primary)]">
                                            <FaDollarSign className="mr-0.5 inline text-[0.85rem]" />{selectedRide.raceFee.toLocaleString()}
                                        </strong>
                                    </div>
                                </div>

                                {/* Race Details */}
                                <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                                    <div className="rounded-md bg-[#fff8f6] p-4">
                                        <h4 className="m-0 mb-2 text-[0.72rem] font-black uppercase text-[var(--admin-primary)]">Race Schedule</h4>
                                        <div className="grid gap-2 text-[0.85rem]">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-[0.7rem] text-[var(--admin-muted)]" />
                                                <span className="text-[var(--admin-muted)]">Date:</span>
                                                <strong className="text-[var(--admin-ink)]">{formatDate(selectedRide.date)}</strong>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaClock className="text-[0.7rem] text-[var(--admin-muted)]" />
                                                <span className="text-[var(--admin-muted)]">Time:</span>
                                                <strong className="text-[var(--admin-ink)]">{selectedRide.time}</strong>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaRulerHorizontal className="text-[0.7rem] text-[var(--admin-muted)]" />
                                                <span className="text-[var(--admin-muted)]">Distance:</span>
                                                <strong className="text-[var(--admin-ink)]">{selectedRide.distance}</strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-md bg-[#fff8f6] p-4">
                                        <h4 className="m-0 mb-2 text-[0.72rem] font-black uppercase text-[var(--admin-primary)]">Venue & Officials</h4>
                                        <div className="grid gap-2 text-[0.85rem]">
                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-[0.7rem] text-[var(--admin-muted)]" />
                                                <span className="text-[var(--admin-muted)]">Location:</span>
                                                <strong className="text-[var(--admin-ink)]">{selectedRide.location}</strong>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaUserTie className="text-[0.7rem] text-[var(--admin-muted)]" />
                                                <span className="text-[var(--admin-muted)]">Referee:</span>
                                                <strong className="text-[var(--admin-ink)]">{selectedRide.referee}</strong>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaFlag className="text-[0.7rem] text-[var(--admin-muted)]" />
                                                <span className="text-[var(--admin-muted)]">Status:</span>
                                                <strong className="text-[#118548]">{selectedRide.status}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Owner Notes */}
                                <div className="rounded-md border-l-4 border-[var(--admin-primary)] bg-[#fff8f6] px-4 py-3">
                                    <div className="mb-1 flex items-center gap-1.5">
                                        <FaStickyNote className="text-[0.7rem] text-[var(--admin-primary)]" />
                                        <strong className="text-[0.75rem] font-black uppercase text-[var(--admin-primary)]">Owner Notes</strong>
                                    </div>
                                    <p className="m-0 text-[0.85rem] italic text-[var(--admin-muted)]">{selectedRide.ownerNotes}</p>
                                </div>

                                {/* Close Button */}
                                <button
                                    className="inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-4 font-black text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]"
                                    onClick={() => setSelectedRide(null)}
                                    type="button"
                                >
                                    Close
                                </button>
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

export default AcceptedRaces;
