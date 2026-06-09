import { useState } from 'react';
import {
    FaCalendarCheck,
    FaBan,
    FaChevronLeft,
    FaChevronRight,
} from 'react-icons/fa';

import JockeyLayout from './JockeyLayout';

// Fake calendar data
const racingEvents = [
    { date: '2024-10-06', title: 'Dubai Sprint Cup', type: 'race' },
    { date: '2024-10-12', title: 'The Royal Ascot Derby', type: 'race' },
];

const upcomingRaceCards = [
    {
        id: 1,
        label: 'NEXT RACES',
        title: 'DUBAI SPRINT CUP',
        subtitle: 'Oct 6, 2024 • $5,800 Prize Pool',
        image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=200&fit=crop',
    },
    {
        id: 2,
        label: 'NEXT RACES',
        title: 'The Royal Ascot Derby',
        subtitle: 'Oct 12, 2024 • £250,000 Prize Pool',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=200&fit=crop',
    },
];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

function JockeyCalendar() {
    const [calendarMonth, setCalendarMonth] = useState(9); // October (0-indexed)
    const [calendarYear, setCalendarYear] = useState(2024);
    const [viewMode, setViewMode] = useState('month'); // month | week

    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const monthName = new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Previous month trailing days
    const prevMonthDays = getDaysInMonth(calendarYear, calendarMonth - 1);
    const leadingDays = [];
    for (let i = firstDay - 1; i >= 0; i--) {
        leadingDays.push(prevMonthDays - i);
    }

    // Trailing days to fill the grid
    const totalCells = leadingDays.length + daysInMonth;
    const trailingDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

    // Check if a day has a race
    const getRaceEvent = (day) => {
        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return racingEvents.find(e => e.date === dateStr);
    };

    // Summary counts
    const racingDayCount = racingEvents.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
    }).length;
    const availableDayCount = daysInMonth - racingDayCount;

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

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return (
        <JockeyLayout activeKey="schedule">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                {/* Page Title */}
                <div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[720px]:text-[1.6rem]">
                        Calendar
                    </h1>
                    <p className="mb-0 mt-1.5 font-[650] text-[var(--admin-muted)]">
                        Manage your racing schedule, availability status, and upcoming tournament participation.
                    </p>
                </div>

                {/* Summary Cards */}
                <section className="grid grid-cols-2 gap-5 max-[720px]:grid-cols-1">
                    <article className="flex items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f5e9] text-[#2e7d32]">
                            <FaCalendarCheck aria-hidden="true" />
                        </div>
                        <div>
                            <span className="text-[0.75rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Available Days</span>
                            <strong className="block text-[1.5rem] leading-[1.2] text-[var(--admin-ink)]">
                                {String(availableDayCount).padStart(2, '0')}
                            </strong>
                        </div>
                    </article>
                    <article className="flex items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#fce4ec] text-[#c62828]">
                            <FaBan aria-hidden="true" />
                        </div>
                        <div>
                            <span className="text-[0.75rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Racing Day</span>
                            <strong className="block text-[1.5rem] leading-[1.2] text-[var(--admin-ink)]">
                                {String(racingDayCount).padStart(2, '0')}
                            </strong>
                        </div>
                    </article>
                </section>

                {/* Calendar + Sidebar */}
                <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-5 max-[1080px]:grid-cols-1">
                    {/* Calendar Panel */}
                    <div className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-3">
                                <h2 className="m-0 text-[1.05rem] font-bold text-[var(--admin-primary)]">{monthName}</h2>
                                <div className="flex items-center gap-1">
                                    <button
                                        className="grid h-7 w-7 cursor-pointer place-items-center rounded border-0 bg-transparent text-[var(--admin-muted)] hover:bg-[#f8e5e1] hover:text-[var(--admin-primary)]"
                                        onClick={handlePrevMonth}
                                        type="button"
                                        aria-label="Previous month"
                                    >
                                        <FaChevronLeft className="text-[0.6rem]" />
                                    </button>
                                    <button
                                        className="grid h-7 w-7 cursor-pointer place-items-center rounded border-0 bg-transparent text-[var(--admin-muted)] hover:bg-[#f8e5e1] hover:text-[var(--admin-primary)]"
                                        onClick={handleNextMonth}
                                        type="button"
                                        aria-label="Next month"
                                    >
                                        <FaChevronRight className="text-[0.6rem]" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex overflow-hidden rounded-md border border-[var(--admin-border)]">
                                <button
                                    className={`cursor-pointer border-0 px-3.5 py-1.5 text-[0.78rem] font-bold transition-colors ${viewMode === 'month' ? 'bg-[var(--admin-ink)] text-white' : 'bg-white text-[var(--admin-ink)] hover:bg-[#f5f5f5]'}`}
                                    onClick={() => setViewMode('month')}
                                    type="button"
                                >
                                    Month
                                </button>
                                <button
                                    className={`cursor-pointer border-0 border-l border-[var(--admin-border)] px-3.5 py-1.5 text-[0.78rem] font-bold transition-colors ${viewMode === 'week' ? 'bg-[var(--admin-ink)] text-white' : 'bg-white text-[var(--admin-ink)] hover:bg-[#f5f5f5]'}`}
                                    onClick={() => setViewMode('week')}
                                    type="button"
                                >
                                    Week
                                </button>
                            </div>
                        </div>

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 border-t border-[var(--admin-border)]">
                            {dayNames.map((name) => (
                                <div key={name} className="border-b border-r border-[var(--admin-border)] px-2 py-2.5 text-center text-[0.7rem] font-bold uppercase text-[var(--admin-muted)] last:border-r-0">
                                    {name}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7">
                            {/* Leading days (previous month) */}
                            {leadingDays.map((day, i) => (
                                <div
                                    key={`lead-${i}`}
                                    className="min-h-[90px] border-b border-r border-[var(--admin-border)] bg-[#fce4ec40] p-2 last:border-r-0"
                                >
                                    <span className="text-[0.78rem] text-[#ccc]">{day}</span>
                                </div>
                            ))}

                            {/* Current month days */}
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                const event = getRaceEvent(day);
                                const isToday = day === 6 && calendarMonth === 9 && calendarYear === 2024;
                                const isWeekend = (() => {
                                    const d = new Date(calendarYear, calendarMonth, day);
                                    const dow = d.getDay();
                                    return dow === 0 || dow === 6;
                                })();

                                return (
                                    <div
                                        key={day}
                                        className={[
                                            'min-h-[90px] border-b border-r border-[var(--admin-border)] p-2 last:border-r-0',
                                            isWeekend && !event ? 'bg-[#fce4ec30]' : '',
                                        ].join(' ')}
                                    >
                                        {/* Day Number */}
                                        <div className="mb-1">
                                            {isToday ? (
                                                <span className="inline-grid h-6 w-6 place-items-center rounded border-2 border-[var(--admin-primary)] text-[0.78rem] font-bold text-[var(--admin-primary)]">
                                                    {day}
                                                </span>
                                            ) : (
                                                <span className={`text-[0.78rem] ${day === 3 ? 'font-bold text-[var(--admin-primary)]' : 'text-[var(--admin-ink)]'}`}>
                                                    {day}
                                                </span>
                                            )}
                                        </div>

                                        {/* Event or Available label */}
                                        {event ? (
                                            <div className="mt-1">
                                                <span className="flex items-center gap-1 text-[0.62rem] text-[var(--admin-primary)]">
                                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--admin-primary)]"></span>
                                                    {event.title}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="mt-1">
                                                <span className="flex items-center gap-1 text-[0.62rem] text-[#2e7d32]">
                                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2e7d32]"></span>
                                                    Available
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Trailing days */}
                            {Array.from({ length: trailingDays }, (_, i) => (
                                <div
                                    key={`trail-${i}`}
                                    className="min-h-[90px] border-b border-r border-[var(--admin-border)] bg-[#fce4ec40] p-2 last:border-r-0"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar - Upcoming Race Cards */}
                    <aside className="grid gap-4">
                        {upcomingRaceCards.map((card) => (
                            <div key={card.id} className="overflow-hidden rounded-[var(--admin-radius)] shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
                                <div className="relative h-[130px] overflow-hidden">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.7)] to-[rgba(0,0,0,0.1)]" />
                                    <div className="absolute bottom-3 left-4 right-4">
                                        <span className="mb-1 block text-[0.6rem] font-bold uppercase tracking-wider text-[rgba(255,255,255,0.7)]">
                                            {card.label}
                                        </span>
                                        <strong className="block text-[0.95rem] leading-[1.2] text-white">
                                            {card.title}
                                        </strong>
                                        <span className="mt-1 block text-[0.72rem] text-[rgba(255,255,255,0.8)]">
                                            {card.subtitle}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </aside>
                </div>

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

export default JockeyCalendar;
