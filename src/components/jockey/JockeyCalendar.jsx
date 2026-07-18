import { useState, useEffect } from 'react';
import { FaCalendarCheck, FaBan, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaHorseHead, FaClock, FaCheckCircle } from 'react-icons/fa';
import JockeyLayout from './JockeyLayout';
import { jockeyApi } from '../../api/jockeyApi';
import Toast from '../shared/Toast';
import { useToast } from '../shared/useToast';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const pad2 = (value) => String(value).padStart(2, '0');
const toDateKey = (year, month, day) => `${year}-${pad2(month + 1)}-${pad2(day)}`;

function mergeAvailabilityItems(calendar, availabilityPayload) {
    const days = Array.isArray(calendar?.days) ? calendar.days : [];
    const dayMap = new Map(days.map((day) => [Number(day.dayNumber), day]));
    const availabilityItems = availabilityPayload?.items ?? availabilityPayload?.Items ?? [];

    availabilityItems.forEach((item) => {
        const date = item.date ?? item.Date;
        const status = item.status ?? item.Status;
        const dayNumber = Number(String(date || '').split('-')[2]);

        if (!dayNumber || !status) {
            return;
        }

        const existing = dayMap.get(dayNumber) ?? {
            dayNumber,
            races: [],
        };

        if (!existing.races?.length && existing.status !== 'RacingDay') {
            dayMap.set(dayNumber, {
                ...existing,
                status,
            });
        }
    });

    return {
        ...calendar,
        days: [...dayMap.values()].sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber)),
    };
}

async function fetchCalendarData(year, month) {
    const monthStr = `${year}-${pad2(month + 1)}`;
    const from = toDateKey(year, month, 1);
    const to = toDateKey(year, month, getDaysInMonth(year, month));
    const [calendarPayload, availabilityPayload] = await Promise.all([
        jockeyApi.getJockeyCalendar(monthStr),
        jockeyApi.getJockeyAvailabilities(from, to).catch(() => ({ items: [] })),
    ]);

    return mergeAvailabilityItems(calendarPayload, availabilityPayload);
}

export default function JockeyCalendar() {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingAvailability, setSavingAvailability] = useState(false);
    const { toast, showToast, hideToast } = useToast();
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        let isMounted = true;

        setLoading(true);
        fetchCalendarData(year, month)
            .then(data => {
                if (isMounted) {
                    setCalendarData(data);
                    setSelectedDay(null);
                }
            })
            .catch(err => {
                if (isMounted) {
                    showToast(err.message || 'Failed to load calendar', 'error');
                    setCalendarData(null);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
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
    const selectedDayRaces = selectedDayData?.races ?? [];
    const selectedDayStatus = selectedDayData?.status ?? 'Available';
    const selectedDayIsRacing = selectedDayStatus === 'RacingDay' || selectedDayRaces.length > 0;
    const selectedDayIsUnavailable = selectedDayStatus === 'Unavailable';
    const selectedDateKey = selectedDay ? toDateKey(year, month, selectedDay) : '';

    const handleAvailabilityToggle = async () => {
        if (!selectedDay || selectedDayIsRacing) {
            return;
        }

        const nextStatus = selectedDayIsUnavailable ? 'Available' : 'Unavailable';

        setSavingAvailability(true);

        try {
            await jockeyApi.updateJockeyAvailabilities([
                {
                    date: selectedDateKey,
                    status: nextStatus,
                },
            ]);
            const refreshedCalendar = await fetchCalendarData(year, month);
            setCalendarData(refreshedCalendar);
            showToast(`Availability updated for ${selectedDateKey}.`, 'success');
        } catch (err) {
            showToast(err.message || 'Failed to update availability.', 'error');
        } finally {
            setSavingAvailability(false);
        }
    };

    return (
        <JockeyLayout activeKey="schedule">
            <Toast message={toast.message} type={toast.type} title={toast.title} onClose={hideToast} />
            <div style={styles.page}>
                {/* Header */}
                <div style={styles.pageHeader}>
                    <div>
                        <h1 style={styles.pageTitle}>Race Calendar</h1>
                        <p style={styles.pageSubtitle}>Your schedule, availability, and upcoming race assignments.</p>
                    </div>
                </div>

                {/* Summary cards */}
                <div style={styles.summaryGrid}>
                    <SummaryCard
                        icon={<FaCalendarCheck />}
                        iconBg="#e8f7ee" iconColor="#16864f"
                        label="Available Days"
                        value={calendarData?.availableDays ?? '—'}
                    />
                    <SummaryCard
                        icon={<FaBan />}
                        iconBg="#f3e1df" iconColor="#a4392f"
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
                                    if (isSel) cellBg = '#edf2fa';
                                    else if (isRacing) cellBg = '#faf2e0';
                                    else if (isUnavailable) cellBg = '#f3e1df';

                                    return (
                                        <div
                                            key={day}
                                            style={{
                                                ...styles.dayCell,
                                                backgroundColor: cellBg,
                                                border: isSel
                                                    ? '2px solid #16305c'
                                                    : isTod
                                                    ? '2px solid #16305c'
                                                    : '1px solid #efe8d6',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => setSelectedDay(isSel ? null : day)}
                                        >
                                            <span style={{
                                                ...styles.dayNum,
                                                backgroundColor: isTod ? '#16305c' : 'transparent',
                                                color: isTod ? '#fff' : isRacing ? '#8a6209' : isUnavailable ? '#a4392f' : '#374151',
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
                                                    <span style={{ fontSize: 9, color: '#a4392f', fontWeight: 700 }}>Unavailable</span>
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
                            <LegendDot color="#16305c" label="Today" />
                            <LegendDot color="#c8a24a" label="Race Day" />
                            <LegendDot color="#a4392f" label="Unavailable" />
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
                                <div style={styles.availabilityActionRow}>
                                    <span style={styles.availabilityStatus}>
                                        Status: {selectedDayIsRacing ? 'Racing Day' : selectedDayStatus}
                                    </span>
                                    <button
                                        disabled={savingAvailability || selectedDayIsRacing}
                                        onClick={handleAvailabilityToggle}
                                        style={{
                                            ...styles.availabilityButton,
                                            opacity: savingAvailability || selectedDayIsRacing ? 0.6 : 1,
                                            cursor: savingAvailability || selectedDayIsRacing ? 'not-allowed' : 'pointer',
                                        }}
                                        type="button"
                                    >
                                        {selectedDayIsRacing
                                            ? 'Locked'
                                            : savingAvailability
                                                ? 'Saving...'
                                                : selectedDayIsUnavailable
                                                    ? 'Mark Available'
                                                    : 'Mark Unavailable'}
                                    </button>
                                </div>
                                {selectedDayData?.races?.length > 0 ? (
                                    selectedDayData.races.map((race, i) => (
                                        <div key={i} style={styles.detailRace}>
                                            <p style={styles.detailRaceName}>{race.raceName}</p>
                                            {race.location && <p style={styles.detailMeta}><FaMapMarkerAlt style={{ marginRight: 5 }} />{race.location}</p>}
                                            {race.horseName && <p style={styles.detailMeta}><FaHorseHead style={{ marginRight: 5 }} />{race.horseName}</p>}
                                            <p style={styles.detailMeta}><FaClock style={{ marginRight: 5 }} />{new Date(race.raceDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ ...styles.detailEmpty, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {selectedDayData?.status === 'Unavailable'
                                            ? <><FaBan style={{ color: '#a4392f' }} /> Marked as unavailable</>
                                            : <><FaCheckCircle style={{ color: '#16864f' }} /> Available — no races scheduled</>}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Next races */}
                        <div>
                            <p style={styles.sidebarTitle}>Upcoming Races</p>
                            {!calendarData?.nextRaces || calendarData.nextRaces.length === 0 ? (
                                <div style={styles.emptyNext}>
                                    <FaHorseHead style={{ fontSize: 28, color: 'var(--racing-gold-bright)' }} />
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
                                                {race.horseName && <p style={styles.nextRaceMeta}><FaHorseHead style={{ marginRight: 4 }} />{race.horseName}</p>}
                                                {race.location && <p style={styles.nextRaceMeta}><FaMapMarkerAlt style={{ marginRight: 4 }} />{race.location}</p>}
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
    pageTitle: { margin: 0, fontSize: '1.9rem', fontWeight: 800, color: '#0a1930' },
    pageSubtitle: { margin: '4px 0 0', fontSize: 14, color: '#6b6456' },
    errorBar: { display: 'flex', alignItems: 'center', backgroundColor: '#f3e1df', border: '1px solid #d89288', borderRadius: 999, padding: '10px 16px', fontSize: 13, color: '#a4392f', fontWeight: 600 },
    successBar: { backgroundColor: '#e8f7ee', border: '1px solid #9fdcb9', borderRadius: 999, padding: '10px 16px', fontSize: 13, color: '#16864f', fontWeight: 700 },
    summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
    summaryCard: { display: 'flex', alignItems: 'center', gap: 14, backgroundColor: '#fff', border: '1px solid #ded2ad', borderRadius: 12, padding: '16px 20px', boxShadow: '0 8px 22px rgba(15,23,42,0.05)' },
    summaryIcon: { width: 42, height: 42, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
    summaryLabel: { margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b6456' },
    summaryValue: { margin: '2px 0 0', fontSize: 28, fontWeight: 800, color: '#0a1930', lineHeight: 1.1 },
    mainGrid: { display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' },
    calPanel: { backgroundColor: '#fff', borderRadius: 14, border: '1px solid #ded2ad', overflow: 'hidden' },
    calNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #efe8d6' },
    navBtn: { width: 30, height: 30, borderRadius: 999, border: '1px solid #ded2ad', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6456' },
    monthLabel: { fontSize: 15, fontWeight: 700, color: '#0a1930', minWidth: 160, textAlign: 'center' },
    todayBtn: { border: '1px solid #ded2ad', borderRadius: 999, backgroundColor: '#fff', padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#16305c' },
    dayHeaderRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#faf7ee', borderBottom: '1px solid #efe8d6' },
    dayHeader: { padding: '8px 4px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#6b6456', textTransform: 'uppercase' },
    loadingBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' },
    loadingText: { fontSize: 13, color: '#6b6456' },
    calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' },
    dayCell: { minHeight: 80, padding: '6px 8px', borderRight: '1px solid #efe8d6', borderBottom: '1px solid #efe8d6', display: 'flex', flexDirection: 'column', gap: 3, boxSizing: 'border-box' },
    otherCell: { minHeight: 80, padding: '6px 8px', backgroundColor: '#faf9f5', borderRight: '1px solid #efe8d6', borderBottom: '1px solid #efe8d6' },
    dayNum: { fontSize: 12, fontWeight: 600, lineHeight: 1, padding: 2 },
    otherDayNum: { fontSize: 11, color: '#d8cfb8' },
    racePill: { display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#faf2e0', borderRadius: 999, padding: '2px 5px' },
    raceDot: { width: 5, height: 5, borderRadius: '50%', backgroundColor: '#c8a24a', flexShrink: 0 },
    raceText: { fontSize: 9, fontWeight: 700, color: '#8a6209', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    moreTag: { fontSize: 9, color: '#6b6456', fontWeight: 600 },
    unavailPill: { display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#f3e1df', borderRadius: 999, padding: '2px 5px' },
    unavailDot: { width: 5, height: 5, borderRadius: '50%', backgroundColor: '#a4392f', flexShrink: 0 },
    legend: { display: 'flex', gap: 16, padding: '10px 16px', borderTop: '1px solid #efe8d6', backgroundColor: '#faf7ee' },
    sidebar: { display: 'flex', flexDirection: 'column', gap: 16 },
    detailCard: { backgroundColor: '#fff', border: '1px solid #ded2ad', borderRadius: 12, padding: 16 },
    detailTitle: { margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#0a1930' },
    availabilityActionRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 },
    availabilityStatus: { fontSize: 12, fontWeight: 800, color: '#6b6456' },
    availabilityButton: { border: '1px solid #16305c', backgroundColor: '#16305c', color: '#fff', borderRadius: 999, padding: '7px 12px', fontSize: 11, fontWeight: 800 },
    detailRace: { backgroundColor: '#faf2e0', border: '1px solid #e6c473', borderRadius: 8, padding: '10px 12px', marginBottom: 8 },
    detailRaceName: { margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#8a6209' },
    detailMeta: { display: 'flex', alignItems: 'center', margin: '2px 0 0', fontSize: 12, color: '#6b6456' },
    detailEmpty: { fontSize: 13, color: '#6b6456', margin: 0 },
    sidebarTitle: { margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#0a1930' },
    emptyNext: { backgroundColor: '#faf7ee', border: '1px solid #ded2ad', borderRadius: 12, padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
    emptyNextText: { margin: 0, fontSize: 13, color: '#6b6456' },
    nextRaceCard: { display: 'flex', gap: 12, alignItems: 'flex-start', backgroundColor: '#fff', border: '1px solid #ded2ad', borderRadius: 12, padding: '12px 14px' },
    nextRaceDateBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#16305c', borderRadius: 8, padding: '6px 10px', flexShrink: 0 },
    nextRaceDay: { fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 },
    nextRaceMon: { fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    nextRaceName: { margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#0a1930' },
    nextRaceMeta: { display: 'flex', alignItems: 'center', margin: '2px 0 0', fontSize: 11, color: '#6b6456' },
};
