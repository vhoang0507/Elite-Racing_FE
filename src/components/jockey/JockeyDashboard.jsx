import { useState, useEffect } from 'react';
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
import { jockeyApi } from '../../api/jockeyApi';
import Toast, { useToast } from '../shared/Toast';

const pageShellClass = 'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';
const panelClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

function JockeyDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllInvitations, setShowAllInvitations] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const today = new Date();
    const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
    const [calendarYear, setCalendarYear] = useState(today.getFullYear());
    const [calendarData, setCalendarData] = useState(null);
    const [calLoading, setCalLoading] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [dashData, invData] = await Promise.all([
                    jockeyApi.getJockeyDashboard().catch(() => null),
                    jockeyApi.getPendingInvitations().catch(() => []),
                ]);
                setDashboard(dashData);
                setInvitations(invData ?? []);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        setCalLoading(true);
        const monthStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}`;
        jockeyApi.getJockeyCalendar(monthStr)
            .then(setCalendarData)
            .catch(() => setCalendarData(null))
            .finally(() => setCalLoading(false));
    }, [calendarYear, calendarMonth]);

    const getDayStatus = (day) => calendarData?.days?.find(d => d.dayNumber === day) ?? null;

    const handleAccept = async (invId) => {
        try {
            await jockeyApi.acceptInvitation(invId);
            setInvitations(prev => prev.filter(i => i.invitationId !== invId));
            setDashboard(prev => prev ? {
                ...prev,
                pendingInvitations: (prev.pendingInvitations ?? 1) - 1,
                acceptedRaces: (prev.acceptedRaces ?? 0) + 1,
            } : prev);
            showToast('🎉 Invitation accepted successfully!', 'success', 'Accepted');
        } catch (err) {
            showToast(err.message || 'Failed to accept invitation. Please try again.', 'error', 'Error');
        }
    };

    const handleReject = async (invId) => {
        try {
            await jockeyApi.rejectInvitation(invId);
            setInvitations(prev => prev.filter(i => i.invitationId !== invId));
            setDashboard(prev => prev ? {
                ...prev,
                pendingInvitations: (prev.pendingInvitations ?? 1) - 1,
            } : prev);
            showToast('Invitation declined.', 'success', 'Declined');
        } catch (err) {
            showToast(err.message || 'Failed to decline invitation. Please try again.', 'error', 'Error');
        }
    };

    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const monthName = new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const prevMonthDays = getDaysInMonth(calendarYear, calendarMonth - 1);
    const leadingDays = [];
    for (let i = firstDay - 1; i >= 0; i--) leadingDays.push(prevMonthDays - i);

    const handlePrevMonth = () => {
        if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
        else setCalendarMonth(m => m - 1);
    };
    const handleNextMonth = () => {
        if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
        else setCalendarMonth(m => m + 1);
    };

    if (loading) return (
        <JockeyLayout activeKey="dashboard">
            <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</p>
        </JockeyLayout>
    );

    return (
        <JockeyLayout activeKey="dashboard">
            <section className={pageShellClass}>
                <div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[720px]:text-[1.6rem]">
                        Jockey Dashboard
                    </h1>
                    <p className="mb-0 mt-1.5 font-[650] text-[var(--admin-muted)]">
                        Manage race invitations, availability, upcoming races, and performance statistics.
                    </p>
                </div>

                {/* Summary Cards */}
                <section className="grid grid-cols-3 gap-5 max-[1280px]:grid-cols-2 max-[720px]:grid-cols-1">
                    <article className="grid min-h-[140px] content-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[22px]">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f7ef] text-[var(--admin-primary)]">
                            <FaEnvelope />
                        </div>
                        <span className="text-[0.8rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Pending Invitations</span>
                        <strong className="text-[2.2rem] leading-[1.1] text-[var(--admin-ink)]">
                            {String(dashboard?.pendingInvitations ?? 0).padStart(2, '0')}
                        </strong>
                    </article>

                    <article className="grid min-h-[140px] content-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[22px]">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f5e9] text-[#2e7d32]">
                            <FaCheckCircle />
                        </div>
                        <span className="text-[0.8rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Accepted Races</span>
                        <strong className="text-[2.2rem] leading-[1.1] text-[var(--admin-ink)]">
                            {String(dashboard?.acceptedRaces ?? 0).padStart(2, '0')}
                        </strong>
                    </article>

                    <article className="grid min-h-[140px] content-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[22px]">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e3f2fd] text-[#1565c0]">
                            <FaCalendarAlt />
                        </div>
                        <span className="text-[0.8rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Upcoming Races</span>
                        <strong className="text-[2.2rem] leading-[1.1] text-[var(--admin-ink)]">
                            {String(dashboard?.upcomingRaces ?? 0).padStart(2, '0')}
                        </strong>
                    </article>
                </section>

                {/* Pending Invitations + Calendar */}
                <section className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-7 max-[1080px]:grid-cols-1">
                    <div className={panelClass}>
                        <div className="flex min-h-[58px] items-center justify-between gap-[18px] border-b border-[var(--admin-border)] px-[22px]">
                            <h2 className="m-0 flex items-center gap-2 text-[1.05rem] text-[var(--admin-primary)]">
                                <FaEnvelope className="text-[0.9rem]" />
                                Pending Invitations
                            </h2>
                            <button className="rounded-full bg-transparent px-2.5 py-1.5 text-[0.78rem] font-black text-[var(--admin-primary)] hover:bg-[#e8f7ef]" onClick={() => setShowAllInvitations(!showAllInvitations)} type="button">
                                {showAllInvitations ? 'Show Less' : 'View All'}
                            </button>
                        </div>

                        <div className="grid gap-0 divide-y divide-[var(--admin-border)]">
                            {invitations.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '24px', color: '#999', fontSize: '14px' }}>No pending invitations</p>
                            ) : (
                                (showAllInvitations ? invitations : invitations.slice(0, 2)).map((inv) => (
                                    <div key={inv.invitationId} className="flex items-center gap-4 px-[22px] py-4">
                                        <div className="h-14 w-14 flex-none overflow-hidden rounded-lg bg-[#3d2c1e]">
                                            <div className="grid h-full w-full place-items-center text-white">
                                                <FaHorseHead />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <strong className="block text-[0.95rem] text-[var(--admin-ink)]">{inv.raceName}</strong>
                                            <span className="flex items-center gap-1 text-[0.82rem] text-[var(--admin-muted)]">
                                                <FaUsers className="text-[0.7rem]" /> {inv.ownerName}
                                            </span>
                                            <span className="flex items-center gap-1 text-[0.82rem] text-[var(--admin-muted)]">
                                                <FaCalendarAlt className="text-[0.7rem]" /> {inv.raceDate?.slice(0, 10)}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="inline-flex min-h-[34px] cursor-pointer items-center justify-center gap-[6px] rounded-md bg-[var(--admin-primary)] px-4 text-[0.78rem] font-[850] text-white hover:bg-[var(--admin-primary-dark)]"
                                                onClick={() => handleAccept(inv.invitationId)}
                                                type="button"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="inline-flex min-h-[34px] cursor-pointer items-center justify-center gap-[6px] rounded-md border border-[var(--admin-border)] bg-white px-4 text-[0.78rem] font-[850] text-[var(--admin-ink)] hover:bg-[#f5f5f5]"
                                                onClick={() => handleReject(inv.invitationId)}
                                                type="button"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className={panelClass}>
                        <div className="flex min-h-[50px] items-center justify-between px-[18px] py-3">
                            <h3 className="m-0 text-[0.95rem] font-bold text-[var(--admin-ink)]">Calendar</h3>
                            <div className="flex items-center gap-1">
                                <button className="grid h-7 w-7 cursor-pointer place-items-center rounded border-0 bg-transparent text-[var(--admin-muted)] hover:bg-[#eef4ff]" onClick={handlePrevMonth} type="button">
                                    <FaChevronLeft className="text-[0.65rem]" />
                                </button>
                                <button className="grid h-7 w-7 cursor-pointer place-items-center rounded border-0 bg-transparent text-[var(--admin-muted)] hover:bg-[#eef4ff]" onClick={handleNextMonth} type="button">
                                    <FaChevronRight className="text-[0.65rem]" />
                                </button>
                            </div>
                        </div>
                        <div className="px-[18px] pb-4">
                            <p className="m-0 mb-3 text-center text-[0.85rem] font-bold text-[var(--admin-primary)]">{monthName}</p>
                            <div className="grid grid-cols-7 gap-0 text-center text-[0.7rem] font-bold uppercase text-[var(--admin-muted)]">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="py-1">{d}</span>)}
                            </div>
                            {calLoading ? (
                                <p style={{ textAlign: 'center', padding: '16px 0', fontSize: 12, color: '#94a3b8' }}>Loading...</p>
                            ) : (
                                <div className="grid grid-cols-7 gap-0 text-center text-[0.82rem]">
                                    {leadingDays.map((day, i) => (
                                        <span key={`lead-${i}`} className="grid h-8 place-items-center text-[#ccc]">{day}</span>
                                    ))}
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                        const dayData = getDayStatus(day);
                                        const isRace = dayData?.status === 'RacingDay' || (dayData?.races?.length > 0);
                                        const isUnavail = dayData?.status === 'Unavailable';
                                        const isTod = day === today.getDate()
                                            && calendarMonth === today.getMonth()
                                            && calendarYear === today.getFullYear();
                                        return (
                                            <span
                                                key={day}
                                                style={{
                                                    display: 'grid',
                                                    height: 32,
                                                    placeItems: 'center',
                                                    borderRadius: isTod ? '50%' : 4,
                                                    backgroundColor: isTod ? '#3b82f6' : isRace ? '#dcfce7' : isUnavail ? '#fee2e2' : 'transparent',
                                                    color: isTod ? '#fff' : isRace ? '#15803d' : isUnavail ? '#dc2626' : 'inherit',
                                                    fontWeight: isTod || isRace ? 700 : 400,
                                                    position: 'relative',
                                                }}
                                                title={isRace ? (dayData?.races?.map(r => r.raceName).join(', ') ?? 'Race day') : undefined}
                                            >
                                                {day}
                                                {isRace && !isTod && (
                                                    <span style={{ position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: '50%', backgroundColor: '#16a34a' }} />
                                                )}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="mt-4 flex items-center gap-3 text-[0.72rem] text-[var(--admin-muted)]">
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#3b82f6]"></span>
                                    Today
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#dcfce7] border border-[#86efac]"></span>
                                    Race Day
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#fee2e2] border border-[#fca5a5]"></span>
                                    Unavailable
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </section>

            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
                duration={3500}
            />
        </JockeyLayout>
    );
}

export default JockeyDashboard;
