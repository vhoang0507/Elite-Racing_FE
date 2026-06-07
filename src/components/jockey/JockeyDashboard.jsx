import { useState, useMemo } from 'react';
import {
    FaEnvelope,
    FaCheckCircle,
    FaCalendarAlt,
    FaChevronLeft,
    FaChevronRight,
    FaHorseHead,
    FaUsers,
    FaDollarSign,
    FaCheck,
} from 'react-icons/fa';

import JockeyLayout from './JockeyLayout';
import {
    pendingInvitations,
    acceptedRides,
    upcomingRaces,
    calendarEvents,
} from '../../data/jockeyMockData';

const pageShellClass = 'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';
const panelClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]';

// Helper to format date
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

// Calendar helper
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

function JockeyDashboard() {
    const [invitations, setInvitations] = useState(pendingInvitations);
    const [rides, setRides] = useState(acceptedRides);
    const [calendarMonth, setCalendarMonth] = useState(5); // June (0-indexed)
    const [calendarYear, setCalendarYear] = useState(2024);
    const [showAllInvitations, setShowAllInvitations] = useState(false);
    const [showAllRides, setShowAllRides] = useState(false);

    // Summary cards derived from data
    const pendingCount = invitations.length;
    const acceptedCount = rides.length;
    const upcomingCount = upcomingRaces.length;

    // Calendar logic
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const monthName = new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const prevMonthDays = getDaysInMonth(calendarYear, calendarMonth - 1);
    const leadingDays = [];
    for (let i = firstDay - 1; i >= 0; i--) {
        leadingDays.push(prevMonthDays - i);
    }

    const eventDates = calendarEvents.map(e => {
        const d = new Date(e.date);
        return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), type: e.type };
    });

    const isEventDay = (day) => {
        return eventDates.find(e => e.day === day && e.month === calendarMonth && e.year === calendarYear);
    };

    const handlePrevMonth = () => {
        if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear(calendarYear - 1);
        } else {
            setCalendarMonth(calendarMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear(calendarYear + 1);
        } else {
            setCalendarMonth(calendarMonth + 1);
        }
    };

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
        <JockeyLayout activeKey="dashboard">
            <section className={pageShellClass}>
                {/* Page Title */}
                <div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[720px]:text-[1.6rem]">
                        Jockey Dashboard
                    </h1>
                    <p className="mb-0 mt-1.5 font-[650] text-[var(--admin-muted)]">
                        Manage race invitations, availability, upcoming races, and performance statistics.
                    </p>
                </div>

                {/* Summary Cards */}
                <section aria-label="Summary statistics" className="grid grid-cols-3 gap-5 max-[1280px]:grid-cols-2 max-[720px]:grid-cols-1">
                    {/* Pending Invitations Card */}
                    <article className="grid min-h-[140px] content-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[22px]">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#ffe8e4] text-[var(--admin-primary)]">
                            <FaEnvelope aria-hidden="true" />
                        </div>
                        <span className="text-[0.8rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Pending Invitations</span>
                        <strong className="text-[2.2rem] leading-[1.1] text-[var(--admin-ink)]">
                            {String(pendingCount).padStart(2, '0')}
                        </strong>
                    </article>

                    {/* Accepted Invitations Card */}
                    <article className="grid min-h-[140px] content-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[22px]">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f5e9] text-[#2e7d32]">
                            <FaCheckCircle aria-hidden="true" />
                        </div>
                        <span className="text-[0.8rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Accepted Invitations</span>
                        <strong className="text-[2.2rem] leading-[1.1] text-[var(--admin-ink)]">
                            {String(acceptedCount).padStart(2, '0')}
                        </strong>
                    </article>

                    {/* Upcoming Races Card */}
                    <article className="grid min-h-[140px] content-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[22px]">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e3f2fd] text-[#1565c0]">
                            <FaCalendarAlt aria-hidden="true" />
                        </div>
                        <span className="text-[0.8rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Upcoming Races</span>
                        <strong className="text-[2.2rem] leading-[1.1] text-[var(--admin-ink)]">
                            {String(upcomingCount).padStart(2, '0')}
                        </strong>
                    </article>
                </section>

                {/* Middle Section: Pending Invitations + Calendar */}
                <section className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-7 max-[1080px]:grid-cols-1">
                    {/* Pending Invitations List */}
                    <div className={panelClass}>
                        <div className="flex min-h-[58px] items-center justify-between gap-[18px] border-b border-[var(--admin-border)] px-[22px]">
                            <h2 className="m-0 flex items-center gap-2 text-[1.05rem] text-[var(--admin-primary)]">
                                <FaEnvelope aria-hidden="true" className="text-[0.9rem]" />
                                Pending Invitations
                            </h2>
                            <button className="rounded-full bg-transparent px-2.5 py-1.5 text-[0.78rem] font-black text-[var(--admin-primary)] transition-colors duration-200 hover:bg-[#ffe8e4]" onClick={() => setShowAllInvitations(!showAllInvitations)} type="button">
                                {showAllInvitations ? 'Show Less' : 'View All'}
                            </button>
                        </div>

                        <div className="grid gap-0 divide-y divide-[var(--admin-border)]">
                            {(showAllInvitations ? invitations : invitations.slice(0, 2)).map((inv) => (
                                <div key={inv.id} className="flex items-center gap-4 px-[22px] py-4">
                                    {/* Horse Image */}
                                    <div className="h-14 w-14 flex-none overflow-hidden rounded-lg bg-[#3d2c1e]">
                                        {inv.bannerImage ? (
                                            <img src={inv.bannerImage} alt={inv.horseName} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="grid h-full w-full place-items-center text-white">
                                                <FaHorseHead />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <strong className="block text-[0.95rem] text-[var(--admin-ink)]">{inv.raceName}</strong>
                                        <span className="flex items-center gap-1 text-[0.82rem] text-[var(--admin-muted)]">
                                            <FaHorseHead className="text-[0.7rem]" /> {inv.horseName}
                                        </span>
                                        <span className="flex items-center gap-1 text-[0.82rem] text-[var(--admin-muted)]">
                                            <FaUsers className="text-[0.7rem]" /> {inv.ownerName}
                                        </span>
                                        <span className="flex items-center gap-1 text-[0.82rem] font-bold text-[var(--admin-primary)]">
                                            <FaDollarSign className="text-[0.7rem]" /> ${inv.prize.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            className="inline-flex min-h-[34px] cursor-pointer items-center justify-center gap-[6px] rounded-md bg-[var(--admin-primary)] px-4 text-[0.78rem] font-[850] text-white transition-colors hover:bg-[var(--admin-primary-dark)]"
                                            onClick={() => handleAccept(inv.id)}
                                            type="button"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="inline-flex min-h-[34px] cursor-pointer items-center justify-center gap-[6px] rounded-md border border-[var(--admin-border)] bg-white px-4 text-[0.78rem] font-[850] text-[var(--admin-ink)] transition-colors hover:bg-[#f5f5f5]"
                                            onClick={() => handleReject(inv.id)}
                                            type="button"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className={panelClass}>
                        <div className="flex min-h-[50px] items-center justify-between px-[18px] py-3">
                            <h3 className="m-0 text-[0.95rem] font-bold text-[var(--admin-ink)]">Calendar</h3>
                            <div className="flex items-center gap-1">
                                <button
                                    className="grid h-7 w-7 cursor-pointer place-items-center rounded border-0 bg-transparent text-[var(--admin-muted)] hover:bg-[#f8e5e1] hover:text-[var(--admin-primary)]"
                                    onClick={handlePrevMonth}
                                    type="button"
                                    aria-label="Previous month"
                                >
                                    <FaChevronLeft className="text-[0.65rem]" />
                                </button>
                                <button
                                    className="grid h-7 w-7 cursor-pointer place-items-center rounded border-0 bg-transparent text-[var(--admin-muted)] hover:bg-[#f8e5e1] hover:text-[var(--admin-primary)]"
                                    onClick={handleNextMonth}
                                    type="button"
                                    aria-label="Next month"
                                >
                                    <FaChevronRight className="text-[0.65rem]" />
                                </button>
                            </div>
                        </div>

                        <div className="px-[18px] pb-4">
                            {/* Month Title */}
                            <p className="m-0 mb-3 text-center text-[0.85rem] font-bold text-[var(--admin-primary)]">
                                {monthName}
                            </p>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-0 text-center text-[0.7rem] font-bold uppercase text-[var(--admin-muted)]">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <span key={i} className="py-1">{d}</span>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-0 text-center text-[0.82rem]">
                                {/* Leading days from previous month */}
                                {leadingDays.map((day, i) => (
                                    <span key={`lead-${i}`} className="grid h-8 place-items-center text-[#ccc]">
                                        {day}
                                    </span>
                                ))}

                                {/* Current month days */}
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                    const event = isEventDay(day);

                                    let dayClass = 'grid h-8 place-items-center rounded-sm text-[0.82rem]';
                                    if (event) {
                                        // Unavailable - dark red background
                                        dayClass += ' bg-[#5c1a1a] font-bold text-white';
                                    } else {
                                        // Available - light pink background
                                        dayClass += ' bg-[#fce4ec] text-[var(--admin-ink)]';
                                    }

                                    return (
                                        <span key={day} className={dayClass}>
                                            {day}
                                        </span>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="mt-4 flex items-center gap-4 text-[0.72rem] text-[var(--admin-muted)]">
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#5c1a1a]"></span>
                                    Unavailable
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#fce4ec]"></span>
                                    Available
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Accepted Rides Table */}
                <section className={panelClass}>
                    <div className="flex min-h-[58px] items-center justify-between gap-[18px] border-b border-[var(--admin-border)] px-[22px]">
                        <h2 className="m-0 flex items-center gap-2 text-[1.05rem] text-[var(--admin-ink)]">
                            <FaCheck aria-hidden="true" className="text-[0.85rem] text-[var(--admin-muted)]" />
                            Accepted Rides
                        </h2>
                        <button className="rounded-full bg-transparent px-2.5 py-1.5 text-[0.78rem] font-black text-[var(--admin-primary)] transition-colors duration-200 hover:bg-[#ffe8e4]" onClick={() => setShowAllRides(!showAllRides)} type="button">
                            {showAllRides ? 'Show Less' : 'View All'}
                        </button>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse max-[720px]:min-w-[600px]">
                            <thead>
                                <tr>
                                    <th className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[14px] text-left text-[0.72rem] font-bold uppercase text-[#765c58]">
                                        Race Name
                                    </th>
                                    <th className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[14px] text-left text-[0.72rem] font-bold uppercase text-[#765c58]">
                                        Horse
                                    </th>
                                    <th className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[14px] text-left text-[0.72rem] font-bold uppercase text-[#765c58]">
                                        Date
                                    </th>
                                    <th className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[14px] text-left text-[0.72rem] font-bold uppercase text-[#765c58]">
                                        Status
                                    </th>
                                    <th className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[14px] text-right text-[0.72rem] font-bold uppercase text-[#765c58]">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(showAllRides ? rides : rides.slice(0, 2)).map((ride, index) => {
                                    const visibleRides = showAllRides ? rides : rides.slice(0, 2);
                                    const isLast = index === visibleRides.length - 1;
                                    return (
                                        <tr key={ride.id}>
                                            <td className={`px-[22px] py-[16px] align-middle text-[0.92rem] font-bold text-[var(--admin-ink)] ${isLast ? '' : 'border-b border-[var(--admin-border)]'}`}>
                                                {ride.raceName}
                                            </td>
                                            <td className={`px-[22px] py-[16px] align-middle text-[0.92rem] text-[var(--admin-ink)] ${isLast ? '' : 'border-b border-[var(--admin-border)]'}`}>
                                                {ride.horseName}
                                            </td>
                                            <td className={`px-[22px] py-[16px] align-middle text-[0.92rem] text-[var(--admin-ink)] ${isLast ? '' : 'border-b border-[var(--admin-border)]'}`}>
                                                {formatDate(ride.date)}
                                            </td>
                                            <td className={`px-[22px] py-[16px] align-middle ${isLast ? '' : 'border-b border-[var(--admin-border)]'}`}>
                                                <span className="inline-flex min-h-6 items-center rounded-[5px] border border-[#afe2c4] bg-[#dff7e9] px-2.5 text-[0.74rem] font-extrabold text-[#118548]">
                                                    {ride.status}
                                                </span>
                                            </td>
                                            <td className={`px-[22px] py-[16px] align-middle text-right ${isLast ? '' : 'border-b border-[var(--admin-border)]'}`}>
                                                <button className="cursor-pointer border-0 bg-transparent text-[0.82rem] font-bold text-[var(--admin-primary)] hover:underline" type="button">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

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

export default JockeyDashboard;
