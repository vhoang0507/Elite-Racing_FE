import { useState, useEffect } from 'react';
import {
    FaCalendarCheck,
    FaBan,
    FaChevronLeft,
    FaChevronRight,
} from 'react-icons/fa';

import JockeyLayout from './JockeyLayout';
import { jockeyApi } from '../../api/jockeyApi';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const statusColor = {
    Available: { bg: '#e8f5e9', color: '#2e7d32', dot: '#2e7d32' },
    RacingDay: { bg: '#fff3ef', color: '#8B0000', dot: '#8B0000' },
    Unavailable: { bg: '#fce4ec', color: '#c62828', dot: '#c62828' },
};

function JockeyCalendar() {
    const today = new Date();
    const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
    const [calendarYear, setCalendarYear] = useState(today.getFullYear());
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCalendar = (year, month) => {
        setLoading(true);
        const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
        jockeyApi.getJockeyCalendar(monthStr)
            .then(setCalendarData)
            .catch(() => setCalendarData(null))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCalendar(calendarYear, calendarMonth);
    }, [calendarYear, calendarMonth]);

    const handlePrevMonth = () => {
        if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
        else setCalendarMonth(m => m - 1);
    };

    const handleNextMonth = () => {
        if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
        else setCalendarMonth(m => m + 1);
    };

    const monthName = new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const prevMonthDays = getDaysInMonth(calendarYear, calendarMonth - 1);
    const leadingDays = [];
    for (let i = firstDay - 1; i >= 0; i--) leadingDays.push(prevMonthDays - i);
    const totalCells = leadingDays.length + daysInMonth;
    const trailingDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const getDayData = (day) => {
        if (!calendarData) return null;
        return calendarData.days?.find(d => d.dayNumber === day);
    };

    return (
        <JockeyLayout activeKey="schedule">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)]">Calendar</h1>
                    <p className="mb-0 mt-1.5 font-[650] text-[var(--admin-muted)]">
                        Manage your racing schedule, availability status, and upcoming tournament participation.
                    </p>
                </div>

                {/* Summary Cards */}
                <section className="grid grid-cols-2 gap-5 max-[720px]:grid-cols-1">
                    <article className="flex items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f5e9] text-[#2e7d32]">
                            <FaCalendarCheck />
                        </div>
                        <div>
                            <span className="text-[0.75rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Available Days</span>
                            <strong className="block text-[1.5rem] leading-[1.2] text-[var(--admin-ink)]">
                                {String(calendarData?.availableDays ?? '-').padStart(2, '0')}
                            </strong>
                        </div>
                    </article>
                    <article className="flex items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#fce4ec] text-[#c62828]">
                            <FaBan />
                        </div>
                        <div>
                            <span className="text-[0.75rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Racing Days</span>
                            <strong className="block text-[1.5rem] leading-[1.2] text-[var(--admin-ink)]">
                                {String(calendarData?.racingDays ?? '-').padStart(2, '0')}
                            </strong>
                        </div>
                    </article>
                </section>

                {/* Calendar + Sidebar */}
                <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-5 max-[1080px]:grid-cols-1">
                    {/* Calendar Panel */}
                    <div className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                        <div className="flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-3">
                                <h2 className="m-0 text-[1.05rem] font-bold text-[var(--admin-primary)]">{monthName}</h2>
                                <div className="flex items-center gap-1">
                                    <button className="grid h-7 w-7 cursor-pointer place-items-center rounded border-0 bg-transparent text-[var(--admin-muted)] hover:bg-[#f8e5e1]" onClick={handlePrevMonth} type="button">
                                        <FaChevronLeft className="text-[0.6rem]" />
                                    </button>
                                    <button className="grid h-7 w-7 cursor-pointer place-items-center rounded border-0 bg-transparent text-[var(--admin-muted)] hover:bg-[#f8e5e1]" onClick={handleNextMonth} type="button">
                                        <FaChevronRight className="text-[0.6rem]" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 border-t border-[var(--admin-border)]">
                            {dayNames.map(name => (
                                <div key={name} className="border-b border-r border-[var(--admin-border)] px-2 py-2.5 text-center text-[0.7rem] font-bold uppercase text-[var(--admin-muted)] last:border-r-0">
                                    {name}
                                </div>
                            ))}
                        </div>

                        {loading ? (
                            <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</p>
                        ) : (
                            <div className="grid grid-cols-7">
                                {leadingDays.map((day, i) => (
                                    <div key={`lead-${i}`} className="min-h-[90px] border-b border-r border-[var(--admin-border)] bg-[#fce4ec20] p-2 last:border-r-0">
                                        <span className="text-[0.78rem] text-[#ccc]">{day}</span>
                                    </div>
                                ))}

                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                    const dayData = getDayData(day);
                                    const status = dayData?.status ?? 'Available';
                                    const colors = statusColor[status] ?? statusColor.Available;
                                    const races = dayData?.races ?? [];

                                    return (
                                        <div key={day} className="min-h-[90px] border-b border-r border-[var(--admin-border)] p-2 last:border-r-0" style={{ backgroundColor: colors.bg + '40' }}>
                                            <span className="text-[0.78rem] text-[var(--admin-ink)]">{day}</span>
                                            <div className="mt-1">
                                                {races.length > 0 ? (
                                                    races.map((race, i) => (
                                                        <span key={i} className="flex items-center gap-1 text-[0.6rem]" style={{ color: colors.color }}>
                                                            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.dot }}></span>
                                                            {race.raceName}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[0.62rem]" style={{ color: colors.color }}>
                                                        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.dot }}></span>
                                                        {status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {Array.from({ length: trailingDays }, (_, i) => (
                                    <div key={`trail-${i}`} className="min-h-[90px] border-b border-r border-[var(--admin-border)] bg-[#fce4ec20] p-2 last:border-r-0" />
                                ))}
                            </div>
                        )}

                        {/* Legend */}
                        <div className="flex items-center gap-5 border-t border-[var(--admin-border)] px-5 py-3 text-[0.72rem] text-[var(--admin-muted)]">
                            {Object.entries(statusColor).map(([key, val]) => (
                                <span key={key} className="flex items-center gap-1.5">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: val.dot }}></span>
                                    {key}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar - Next Races */}
                    <aside className="grid gap-4">
                        <h3 className="m-0 text-[0.95rem] font-bold text-[var(--admin-ink)]">Next Races</h3>
                        {calendarData?.nextRaces?.length === 0 ? (
                            <p style={{ color: '#999', fontSize: '13px' }}>No upcoming races</p>
                        ) : (
                            calendarData?.nextRaces?.map((race) => (
                                <div key={race.raceId} className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
                                    <span className="mb-1 block text-[0.6rem] font-bold uppercase tracking-wider text-[var(--admin-muted)]">NEXT RACE</span>
                                    <strong className="block text-[0.95rem] text-[var(--admin-ink)]">{race.raceName}</strong>
                                    <span className="mt-1 block text-[0.72rem] text-[var(--admin-muted)]">
                                        📅 {race.raceDate?.slice(0, 10)}
                                    </span>
                                    {race.location && (
                                        <span className="block text-[0.72rem] text-[var(--admin-muted)]">
                                            📍 {race.location}
                                        </span>
                                    )}
                                    {race.horseName && (
                                        <span className="block text-[0.72rem] text-[var(--admin-muted)]">
                                            🐴 {race.horseName}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </aside>
                </div>
            </section>
        </JockeyLayout>
    );
}

export default JockeyCalendar;