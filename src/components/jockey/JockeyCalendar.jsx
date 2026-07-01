import { useState, useEffect } from 'react';
import { FaCalendarCheck, FaBan, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import JockeyLayout from './JockeyLayout';
import { jockeyApi } from '../../api/jockeyApi';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

export default function JockeyCalendar() {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError('');
        const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
        jockeyApi.getJockeyCalendar(monthStr)
            .then(data => { setCalendarData(data); setSelectedDay(null); })
            .catch(err => { setError(err.message || 'Failed to load calendar'); setCalendarData(null); })
            .finally(() => setLoading(false));
    }, [year, month]);

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };
    const goToday = () => { setMonth(today.getMonth()); setYear(today.getFullYear()); };

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);
    const leadingDays = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + 1 + i);
    const totalCells = firstDay + daysInMonth;
    const trailingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

    const getDayData = (day) => calendarData?.days?.find(d => d.dayNumber === day) ?? null;

    const isToday = (day) =>
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const selectedDayData = selectedDay ? getDayData(selectedDay) : null;

    return (
        <JockeyLayout activeKey="schedule">
            <div style={styles.page}>
                {/* Header */}
                <div style={styles.pageHeader}>
                    <div>
                        <h1 style={styles.pageTitle}>Race Calendar</h1>
                        <p style={styles.pageSubtitle}>Your schedule, availability, and upcoming race assignments.</p>
                    </div>
                </div>

                {error && (
                    <div style={styles.errorBar}>⚠️ {error}</div>
                )}

                {/* Summary cards */}
                <div style={styles.summaryGrid}>
                    <SummaryCard
                        icon={<FaCalendarCheck />}
                        iconBg="#dcfce7" iconColor="#15803d"
                        label="Available Days"
                        value={calendarData?.availableDays ?? '—'}
                    />
                    <SummaryCard
                        icon={<FaBan />}
                        iconBg="#fee2e2" iconColor="#dc2626"
                        label="Racing Days"
                        value={calendarData?.racingDays ?? '—'}
                    />
                </div>

                <div style={styles.mainGrid}>
                    {/* Calendar panel */}
                    <div style={styles.calPanel}>
                        {/* Nav bar */}
                        <div style={styles.calNav}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <button style={styles.navBtn} onClick={prevMonth} type="button">
                                    <FaChevronLeft style={{ fontSize: 10 }} />
                                </button>
                                <span style={styles.monthLabel}>{MONTH_NAMES[month]} {year}</span>
                                <button style={styles.navBtn} onClick={nextMonth} type="button">
                                    <FaChevronRight style={{ fontSize: 10 }} />
                                </button>
                            </div>
                            <button style={styles.todayBtn} onClick={goToday} type="button">Today</button>
                        </div>

                        {/* Day header row */}
                        <div style={styles.dayHeaderRow}>
                            {DAY_NAMES.map(d => (
                                <div key={d} style={styles.dayHeader}>{d}</div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        {loading ? (
                            <div style={styles.loadingBox}>
                                <p style={styles.loadingText}>Loading calendar...</p>
                            </div>
                        ) : (
                            <div style={styles.calGrid}>
                                {/* Leading empty days */}
                                {leadingDays.map((d, i) => (
                                    <div key={`lead-${i}`} style={styles.otherCell}>
                                        <span style={styles.otherDayNum}>{d}</span>
                                    </div>
                                ))}

                                {/* Current month days */}
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                    const data = getDayData(day);
                                    const status = data?.status ?? 'Available';
                                    const races = data?.races ?? [];
                                    const isRacing = status === 'RacingDay' || races.length > 0;
                                    const isUnavailable = status === 'Unavailable';
                                    const isSel = selectedDay === day;
                                    const isTod = isToday(day);

                                    let cellBg = '#fff';
                                    if (isSel) cellBg = '#fdf4f4';
                                    else if (isRacing) cellBg = '#f0fdf4';
                                    else if (isUnavailable) cellBg = '#fef2f2';

                                    return (
                                        <div
                                            key={day}
                                            style={{
                                                ...styles.dayCell,
                                                backgroundColor: cellBg,
                                                border: isSel
                                                    ? '2px solid #610000'
                                                    : isTod
                                                    ? '2px solid #3b82f6'
                                                    : '1px solid #f0ebe8',
                                                cursor: (isRacing || isUnavailable) ? 'pointer' : 'default',
                                            }}
                                            onClick={() => setSelectedDay(isSel ? null : day)}
                                        >
                                            <span style={{
                                                ...styles.dayNum,
                                                backgroundColor: isTod ? '#3b82f6' : 'transparent',
                                                color: isTod ? '#fff' : isRacing ? '#15803d' : isUnavailable ? '#dc2626' : '#374151',
                                                borderRadius: isTod ? '50%' : 0,
                                                width: isTod ? 22 : 'auto',
                                                height: isTod ? 22 : 'auto',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                {day}
                                            </span>

                                            {races.slice(0, 2).map((race, i) => (
                                                <div key={i} style={styles.racePill}>
                                                    <span style={styles.raceDot} />
                                                    <span style={styles.raceText}>{race.raceName}</span>
                                                </div>
                                            ))}
                                            {races.length > 2 && (
                                                <span style={styles.moreTag}>+{races.length - 2} more</span>
                                            )}
                                            {isUnavailable && races.length === 0 && (
                                                <div style={styles.unavailPill}>
                                                    <span style={styles.unavailDot} />
                                                    <span style={{ fontSize: 9, color: '#dc2626', fontWeight: 700 }}>Unavailable</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Trailing empty days */}
                                {Array.from({ length: trailingCount }, (_, i) => (
                                    <div key={`trail-${i}`} style={styles.otherCell} />
                                ))}
                            </div>
                        )}

                        {/* Legend */}
                        <div style={styles.legend}>
                            <LegendDot color="#3b82f6" label="Today" />
                            <LegendDot color="#16a34a" label="Race Day" />
                            <LegendDot color="#dc2626" label="Unavailable" />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={styles.sidebar}>
                        {/* Selected day detail */}
                        {selectedDay && (
                            <div style={styles.detailCard}>
                                <p style={styles.detailTitle}>
                                    {MONTH_NAMES[month]} {selectedDay}, {year}
                                </p>
                                {selectedDayData?.races?.length > 0 ? (
                                    selectedDayData.races.map((race, i) => (
                                        <div key={i} style={styles.detailRace}>
                                            <p style={styles.detailRaceName}>{race.raceName}</p>
                                            {race.location && <p style={styles.detailMeta}>📍 {race.location}</p>}
                                            {race.horseName && <p style={styles.detailMeta}>🐴 {race.horseName}</p>}
                                            <p style={styles.detailMeta}>📅 {new Date(race.raceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p style={styles.detailEmpty}>
                                        {selectedDayData?.status === 'Unavailable'
                                            ? '🔴 Marked as unavailable'
                                            : '✅ Available — no races scheduled'}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Next races */}
                        <div>
                            <p style={styles.sidebarTitle}>Upcoming Races</p>
                            {!calendarData?.nextRaces || calendarData.nextRaces.length === 0 ? (
                                <div style={styles.emptyNext}>
                                    <span style={{ fontSize: 28 }}>🏇</span>
                                    <p style={styles.emptyNextText}>No upcoming races confirmed yet.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {calendarData.nextRaces.map((race) => (
                                        <div key={race.raceId} style={styles.nextRaceCard}>
                                            <div style={styles.nextRaceDateBadge}>
                                                <span style={styles.nextRaceDay}>
                                                    {new Date(race.raceDate).getDate()}
                                                </span>
                                                <span style={styles.nextRaceMon}>
                                                    {MONTH_NAMES[new Date(race.raceDate).getMonth()].slice(0, 3).toUpperCase()}
                                                </span>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={styles.nextRaceName}>{race.raceName}</p>
                                                {race.horseName && <p style={styles.nextRaceMeta}>🐴 {race.horseName}</p>}
                                                {race.location && <p style={styles.nextRaceMeta}>📍 {race.location}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </JockeyLayout>
    );
}

function SummaryCard({ icon, iconBg, iconColor, label, value }) {
    return (
        <div style={styles.summaryCard}>
            <div style={{ ...styles.summaryIcon, backgroundColor: iconBg, color: iconColor }}>{icon}</div>
            <div>
                <p style={styles.summaryLabel}>{label}</p>
                <p style={styles.summaryValue}>{value}</p>
            </div>
        </div>
    );
}

function LegendDot({ color, label }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
            {label}
        </span>
    );
}

const styles = {
    page: { padding: '36px 44px', display: 'grid', gap: 24 },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    pageTitle: { margin: 0, fontSize: '1.9rem', fontWeight: 800, color: '#610000' },
    pageSubtitle: { margin: '4px 0 0', fontSize: 14, color: '#64748b' },
    errorBar: { backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#991b1b', fontWeight: 600 },
    summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
    summaryCard: { display: 'flex', alignItems: 'center', gap: 14, backgroundColor: '#fff', border: '1px solid #e8ddd9', borderRadius: 12, padding: '16px 20px' },
    summaryIcon: { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
    summaryLabel: { margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' },
    summaryValue: { margin: '2px 0 0', fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 },
    mainGrid: { display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' },
    calPanel: { backgroundColor: '#fff', borderRadius: 14, border: '1px solid #e8ddd9', overflow: 'hidden' },
    calNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f0ebe8' },
    navBtn: { width: 30, height: 30, borderRadius: 8, border: '1px solid #e8ddd9', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' },
    monthLabel: { fontSize: 15, fontWeight: 700, color: '#1e293b', minWidth: 160, textAlign: 'center' },
    todayBtn: { border: '1px solid #e8ddd9', borderRadius: 8, backgroundColor: '#fff', padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#374151' },
    dayHeaderRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#faf7f5', borderBottom: '1px solid #f0ebe8' },
    dayHeader: { padding: '8px 4px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' },
    loadingBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' },
    loadingText: { fontSize: 13, color: '#94a3b8' },
    calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' },
    dayCell: { minHeight: 80, padding: '6px 8px', borderRight: '1px solid #f0ebe8', borderBottom: '1px solid #f0ebe8', display: 'flex', flexDirection: 'column', gap: 3, boxSizing: 'border-box' },
    otherCell: { minHeight: 80, padding: '6px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #f0ebe8', borderBottom: '1px solid #f0ebe8' },
    dayNum: { fontSize: 12, fontWeight: 600, lineHeight: 1, padding: 2 },
    otherDayNum: { fontSize: 11, color: '#cbd5e1' },
    racePill: { display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#dcfce7', borderRadius: 4, padding: '2px 5px' },
    raceDot: { width: 5, height: 5, borderRadius: '50%', backgroundColor: '#16a34a', flexShrink: 0 },
    raceText: { fontSize: 9, fontWeight: 700, color: '#15803d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    moreTag: { fontSize: 9, color: '#64748b', fontWeight: 600 },
    unavailPill: { display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#fee2e2', borderRadius: 4, padding: '2px 5px' },
    unavailDot: { width: 5, height: 5, borderRadius: '50%', backgroundColor: '#dc2626', flexShrink: 0 },
    legend: { display: 'flex', gap: 16, padding: '10px 16px', borderTop: '1px solid #f0ebe8', backgroundColor: '#faf7f5' },
    sidebar: { display: 'flex', flexDirection: 'column', gap: 16 },
    detailCard: { backgroundColor: '#fff', border: '1px solid #e8ddd9', borderRadius: 12, padding: 16 },
    detailTitle: { margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#610000' },
    detailRace: { backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 12px', marginBottom: 8 },
    detailRaceName: { margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#15803d' },
    detailMeta: { margin: '2px 0 0', fontSize: 12, color: '#64748b' },
    detailEmpty: { fontSize: 13, color: '#64748b', margin: 0 },
    sidebarTitle: { margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#1e293b' },
    emptyNext: { backgroundColor: '#faf7f5', border: '1px solid #e8ddd9', borderRadius: 12, padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
    emptyNextText: { margin: 0, fontSize: 13, color: '#64748b' },
    nextRaceCard: { display: 'flex', gap: 12, alignItems: 'flex-start', backgroundColor: '#fff', border: '1px solid #e8ddd9', borderRadius: 12, padding: '12px 14px' },
    nextRaceDateBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#610000', borderRadius: 8, padding: '6px 10px', flexShrink: 0 },
    nextRaceDay: { fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 },
    nextRaceMon: { fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    nextRaceName: { margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#1e293b' },
    nextRaceMeta: { margin: '2px 0 0', fontSize: 11, color: '#64748b' },
};
