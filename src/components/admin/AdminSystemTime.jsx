import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    FaClock,
    FaDatabase,
    FaEraser,
    FaExclamationTriangle,
    FaForward,
    FaShieldAlt,
    FaSyncAlt,
} from 'react-icons/fa';

import { adminSystemApi } from '../../api/adminSystemApi';
import {
    confirmAdminAction,
    showAdminSuccess,
    showAdminError,
} from '../../utils/adminFeedback';
import { getAuthUser } from '../../utils/tokenStorage';

import AdminLayout from './AdminLayout';

const initialAdvanceForm = {
    days: '0',
    hours: '0',
    minutes: '5',
    autoSync: true,
};
const advanceLimits = {
    days: 365,
    hours: 23,
    minutes: 59,
};

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-6 px-11 py-9 max-[860px]:px-5 max-[860px]:py-7';
const panelClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_14px_30px_rgba(15,23,42,0.05)]';
const panelHeaderClass = 'flex min-h-[58px] items-center justify-between gap-4 border-b border-[var(--admin-border)] bg-[#fff8f6] px-5 py-4 max-[720px]:flex-col max-[720px]:items-stretch';
const panelTitleClass = 'm-0 flex items-center gap-2 text-[1.05rem] font-black text-[var(--admin-primary-dark)]';
const fieldClass = 'grid gap-1.5';
const labelClass = 'text-[0.74rem] font-black uppercase text-[#64748b]';
const inputClass = 'h-10 w-full min-w-0 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.88rem] font-bold text-[var(--admin-ink)] outline-0 transition-all duration-200 focus:border-[#0b7f5a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)] disabled:cursor-not-allowed disabled:bg-[#f4eeee] disabled:text-[#94a3b8]';
const checkboxClass = 'h-4 w-4 accent-[var(--admin-primary)]';
const primaryButtonClass = 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-[var(--admin-primary)] px-5 text-[0.82rem] font-black text-white hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60';
const secondaryButtonClass = 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-5 text-[0.82rem] font-black text-[var(--admin-primary-dark)] transition-colors hover:border-[var(--admin-gold)] disabled:cursor-not-allowed disabled:opacity-60';
const dangerButtonClass = 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#d89288] bg-white px-5 text-[0.82rem] font-black text-[#a4392f] transition-colors hover:bg-[#f3e1df] disabled:cursor-not-allowed disabled:opacity-60';

function readApiField(item, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) {
    return item?.[camelKey] ?? item?.[pascalKey];
}

function toDisplayValue(value) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return String(value).replace(/(T\d{2}:\d{2}:\d{2})\.\d+((?:Z|[+-]\d{2}:?\d{2})?)$/, '$1$2');
}

function getReadableDateTimeParts(value) {
    const displayValue = toDisplayValue(value);
    const match = String(displayValue).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|[+-]\d{2}:?\d{2})?$/i);

    if (!match) {
        return null;
    }

    const [, year, month, day, hours, minutes, seconds, suffix = ''] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    const normalizedSuffix = suffix && suffix.toUpperCase() !== 'Z' && !suffix.includes(':')
        ? `${suffix.slice(0, 3)}:${suffix.slice(3)}`
        : suffix;
    const timezone = suffix.toUpperCase() === 'Z'
        ? 'UTC'
        : normalizedSuffix
            ? `UTC${normalizedSuffix.startsWith('+') || normalizedSuffix.startsWith('-') ? normalizedSuffix : `+${normalizedSuffix}`}`
            : '';

    return {
        dateLabel: new Intl.DateTimeFormat('en-US', {
            day: '2-digit',
            month: 'long',
            timeZone: 'UTC',
            year: 'numeric',
        }).format(date),
        timeLabel: `${hours}:${minutes}:${seconds}`,
        timezone,
    };
}

function padDatePart(value) {
    return String(value).padStart(2, '0');
}

function getDateTimeSuffix(value) {
    return String(value).match(/(Z|[+-]\d{2}:?\d{2})$/i)?.[1] || '';
}

function getOffsetMinutes(suffix) {
    if (!suffix || suffix.toUpperCase() === 'Z') {
        return 0;
    }

    const match = suffix.match(/^([+-])(\d{2}):?(\d{2})$/);

    if (!match) {
        return 0;
    }

    const minutes = (Number(match[2]) * 60) + Number(match[3]);

    return match[1] === '-' ? -minutes : minutes;
}

function formatDateTimeAtOffset(date, suffix = '') {
    const offsetDate = new Date(date.getTime() + (getOffsetMinutes(suffix) * 60 * 1000));

    return [
        offsetDate.getUTCFullYear(),
        '-',
        padDatePart(offsetDate.getUTCMonth() + 1),
        '-',
        padDatePart(offsetDate.getUTCDate()),
        'T',
        padDatePart(offsetDate.getUTCHours()),
        ':',
        padDatePart(offsetDate.getUTCMinutes()),
        ':',
        padDatePart(offsetDate.getUTCSeconds()),
        suffix,
    ].join('');
}

function addElapsedToDateTime(value, elapsedMs) {
    if (!value) {
        return value;
    }

    const valueText = String(value).trim();
    const normalizedText = valueText.replace(/(T\d{2}:\d{2}:\d{2}\.\d{3})\d+/, '$1');

    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/i.test(normalizedText)) {
        return value;
    }

    const suffix = getDateTimeSuffix(normalizedText);
    const parsed = new Date(suffix ? normalizedText : `${normalizedText}Z`);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return formatDateTimeAtOffset(new Date(parsed.getTime() + elapsedMs), suffix);
}

function buildLiveSystemTime(systemTime, elapsedMs) {
    if (!systemTime) {
        return systemTime;
    }

    return {
        ...systemTime,
        realUtcNow: addElapsedToDateTime(readApiField(systemTime, 'realUtcNow'), elapsedMs),
        effectiveUtcNow: addElapsedToDateTime(readApiField(systemTime, 'effectiveUtcNow'), elapsedMs),
        effectiveLocalNow: addElapsedToDateTime(readApiField(systemTime, 'effectiveLocalNow'), elapsedMs),
    };
}

function parseAdvanceValue(value, max) {
    const rawValue = String(value ?? '').trim();
    const normalizedValue = rawValue === '' ? '0' : rawValue;

    if (!/^\d+$/.test(normalizedValue)) {
        return null;
    }

    const parsed = Number(normalizedValue);

    return parsed >= 0 && parsed <= max ? parsed : null;
}

function StatusBadge({
    isActive,
    activeLabel,
    inactiveLabel,
}) {
    return (
        <span className={`inline-flex min-h-7 items-center rounded-full px-3 text-[0.7rem] font-black uppercase ${isActive ? 'bg-[#e8f7ee] text-[#16864f]' : 'bg-[#f3e1df] text-[#a4392f]'}`}>
            {isActive ? activeLabel : inactiveLabel}
        </span>
    );
}

function TimeItem({
    label,
    value,
}) {
    const readableDateTime = getReadableDateTimeParts(value);

    return (
        <article className="rounded-md border border-[var(--admin-border)] bg-[#fffdfc] p-4">
            <span className="block text-[0.68rem] font-black uppercase text-[#64748b]">
                {label}
            </span>
            {readableDateTime ? (
                <div className="mt-2 grid gap-1">
                    <strong className="block text-[1rem] leading-tight text-[var(--admin-ink)]">
                        {readableDateTime.dateLabel}
                    </strong>
                    <span className="font-mono text-[1.1rem] font-black tracking-normal text-[var(--admin-primary-dark)]">
                        {readableDateTime.timeLabel}
                    </span>
                    {readableDateTime.timezone && (
                        <span className="text-[0.74rem] font-black uppercase text-[var(--admin-muted)]">
                            {readableDateTime.timezone}
                        </span>
                    )}
                </div>
            ) : (
                <strong className="mt-2 block break-words text-[0.95rem] text-[var(--admin-ink)]">
                    {toDisplayValue(value)}
                </strong>
            )}
        </article>
    );
}

function SyncStat({
    label,
    value,
}) {
    return (
        <article className="rounded-md border border-[var(--admin-border)] bg-[#fffdfc] p-4">
            <span className="block text-[0.68rem] font-black uppercase text-[#64748b]">
                {label}
            </span>
            <strong className="mt-2 block text-[1.8rem] leading-none text-[var(--admin-primary-dark)]">
                {Number(value || 0)}
            </strong>
        </article>
    );
}

function AdminSystemTime() {
    const authUser = getAuthUser();
    const accountRole = readApiField(authUser, 'role') || '';
    const isAdmin = accountRole === 'Admin';
    const clockSnapshotRef = useRef(null);

    const [systemTime, setSystemTime] = useState(null);
    const [syncResult, setSyncResult] = useState(null);
    const [advanceForm, setAdvanceForm] = useState(initialAdvanceForm);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState('');
    const [clockTick, setClockTick] = useState(() => Date.now());

    useEffect(() => {
        if (!systemTime) {
            clockSnapshotRef.current = null;
            return undefined;
        }

        const capturedAt = Date.now();
        clockSnapshotRef.current = {
            capturedAt,
            source: systemTime,
        };
        setClockTick(capturedAt);

        const timerId = window.setInterval(() => {
            setClockTick(Date.now());
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [systemTime]);

    const loadSystemTime = useCallback(async ({ silent = false } = {}) => {
        if (!silent) {
            setLoading(true);
        }

        try {
            const payload = await adminSystemApi.getSystemTime();

            setSystemTime(payload);
            return true;
        } catch (err) {
            showAdminError(err.message || 'Failed to load system time.');
            return false;
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            loadSystemTime();
        }
    }, [isAdmin, loadSystemTime]);

    const allowTimeOverride = Boolean(readApiField(systemTime, 'allowTimeOverride'));
    const isOverridden = Boolean(readApiField(systemTime, 'isOverridden'));
    const isBusy = Boolean(actionLoading);
    const clockSnapshot = clockSnapshotRef.current;
    const liveElapsedMs = clockSnapshot?.source === systemTime
        ? Math.max(0, clockTick - clockSnapshot.capturedAt)
        : 0;
    const liveSystemTime = buildLiveSystemTime(systemTime, liveElapsedMs);

    const applyTimeResponse = (payload) => {
        const nextTime = readApiField(payload, 'time') || payload;
        const nextSyncResult = readApiField(payload, 'syncResult');

        if (nextTime) {
            setSystemTime(nextTime);
        }

        setSyncResult(nextSyncResult || null);
    };

    const handleRefresh = async () => {
        const loaded = await loadSystemTime();

        if (loaded) {
            showAdminSuccess('System time refreshed.');
        }
    };

    const handleAdvanceChange = (event) => {
        const {
            checked,
            name,
            type,
            value,
        } = event.target;

        setAdvanceForm((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAdvanceSubmit = async (event) => {
        event.preventDefault();

        if (!allowTimeOverride) {
            showAdminError('Time override is disabled in this environment.');
            return;
        }

        const days = parseAdvanceValue(advanceForm.days, advanceLimits.days);
        const hours = parseAdvanceValue(advanceForm.hours, advanceLimits.hours);
        const minutes = parseAdvanceValue(advanceForm.minutes, advanceLimits.minutes);

        if (days === null || hours === null || minutes === null) {
            showAdminError('Advance duration must use whole numbers: 0-365 days, 0-23 hours, and 0-59 minutes.');
            return;
        }

        if (days + hours + minutes === 0) {
            showAdminError('Please enter at least one positive advance value.');
            return;
        }

        const ok = await confirmAdminAction({
            title: 'Advance system time',
            message: 'Are you sure you want to advance system time? This can move the system past real deadlines.',
            confirmLabel: 'Advance',
            tone: 'danger',
        });

        if (!ok) {
            return;
        }

        setActionLoading('advance');

        try {
            const payload = await adminSystemApi.advanceSystemTime({
                days,
                hours,
                minutes,
                autoSync: advanceForm.autoSync,
            });

            applyTimeResponse(payload);
            showAdminSuccess(advanceForm.autoSync ? 'System time advanced and statuses synced.' : 'System time advanced.');
        } catch (err) {
            showAdminError(err.message || 'Failed to advance system time.');
        } finally {
            setActionLoading('');
        }
    };

    const handleSyncStatuses = async () => {
        const ok = await confirmAdminAction({
            title: 'Sync statuses',
            message: 'Are you sure you want to sync statuses using the current effective time? This can change real data in the database.',
            confirmLabel: 'Sync',
            tone: 'danger',
        });

        if (!ok) {
            return;
        }

        setActionLoading('sync');

        try {
            const payload = await adminSystemApi.syncTimeStatuses();
            setSyncResult(payload);
            await loadSystemTime({ silent: true });
            showAdminSuccess('Time statuses synchronized.');
        } catch (err) {
            showAdminError(err.message || 'Failed to sync time statuses.');
        } finally {
            setActionLoading('');
        }
    };

    const handleClearOverride = async () => {
        if (!allowTimeOverride) {
            showAdminError('Time override is disabled in this environment.');
            return;
        }

        const ok = await confirmAdminAction({
            title: 'Clear time override',
            message: 'Clear override, return to real server time, and sync statuses using the current real time? This can change real data in the database.',
            confirmLabel: 'Clear Override',
            tone: 'danger',
        });

        if (!ok) {
            return;
        }

        setActionLoading('clear');

        try {
            const timePayload = await adminSystemApi.clearSystemTimeOverride();
            setSystemTime(timePayload);

            const syncPayload = await adminSystemApi.syncTimeStatuses();
            setSyncResult(syncPayload);
            await loadSystemTime({ silent: true });
            showAdminSuccess('Time override cleared and statuses synced.');
        } catch (err) {
            showAdminError(err.message || 'Failed to clear time override and sync statuses.');
        } finally {
            setActionLoading('');
        }
    };

    if (!isAdmin) {
        return (
            <AdminLayout activeKey="system-time">
                <section className={pageShellClass}>
                    <div className="rounded-[var(--admin-radius)] border border-[#e7a49a] bg-[#e8f7ef] p-5 text-[var(--admin-primary)]">
                        <h1 className="m-0 text-[1.4rem] font-black">Admin access required</h1>
                        <p className="mb-0 mt-2 font-semibold">
                            Only Admin accounts can access System Time tools.
                        </p>
                    </div>
                </section>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activeKey="system-time" searchPlaceholder="Search system tools...">
            <section className={pageShellClass}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-[0.74rem] font-black uppercase text-[#64748b]">
                            <FaShieldAlt aria-hidden="true" className="text-[var(--admin-primary)]" />
                            <span>Admin Tools</span>
                        </div>
                        <h1 className="page-title">
                            System Time
                        </h1>
                        <p className="page-subtitle">
                            Test the backend clock and time-based status updates from one Admin-only screen.
                        </p>
                    </div>

                </div>

                <section className="rounded-[var(--admin-radius)] border border-[#efd06a] bg-[#fff7db] px-5 py-4 text-[#6f5108]">
                    <div className="flex gap-3 max-[720px]:flex-col">
                        <FaExclamationTriangle aria-hidden="true" className="mt-1 flex-none text-[#a17809]" />
                        <div>
                            <strong className="block text-[0.95rem]">
                                This page is for test/demo use only.
                            </strong>
                            <p className="mb-0 mt-1 text-[0.86rem] font-semibold leading-6">
                                Syncing statuses can change real database records. Clearing override returns the clock to real server time and immediately syncs statuses using that time.
                            </p>
                        </div>
                    </div>
                </section>

                <section className={panelClass}>
                    <div className={panelHeaderClass}>
                        <h2 className={panelTitleClass}>
                            <FaClock aria-hidden="true" className="text-[var(--admin-primary)]" />
                            <span>Current System Time</span>
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge isActive={isOverridden} activeLabel="Override ON" inactiveLabel="Override OFF" />
                            <StatusBadge isActive={allowTimeOverride} activeLabel="Override Allowed" inactiveLabel="Override Disabled" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center font-bold text-[var(--admin-muted)]">
                            Loading system time...
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4 p-5 max-[1180px]:grid-cols-2 max-[720px]:grid-cols-1">
                            <TimeItem label="Real UTC Now" value={readApiField(liveSystemTime, 'realUtcNow')} />
                            <TimeItem label="Effective UTC Now" value={readApiField(liveSystemTime, 'effectiveUtcNow')} />
                            <TimeItem label="Effective Local Now" value={readApiField(liveSystemTime, 'effectiveLocalNow')} />
                            <TimeItem label="Timezone" value={readApiField(liveSystemTime, 'timezone')} />
                            <TimeItem label="Override" value={isOverridden ? 'ON' : 'OFF'} />
                            <TimeItem label="Allow Time Override" value={allowTimeOverride ? 'ON' : 'OFF'} />
                        </div>
                    )}
                </section>

                <section className="grid gap-6">
                    <form className={`${panelClass} mx-auto w-full max-w-[920px]`} onSubmit={handleAdvanceSubmit}>
                        <div className={panelHeaderClass}>
                            <h2 className={panelTitleClass}>
                                <FaForward aria-hidden="true" className="text-[var(--admin-primary)]" />
                                <span>Advance Time</span>
                            </h2>
                        </div>

                        <div className="grid gap-5 p-5">
                            <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
                                {[
                                    ['days', 'Days'],
                                    ['hours', 'Hours'],
                                    ['minutes', 'Minutes'],
                                ].map(([name, label]) => (
                                    <label className={fieldClass} key={name}>
                                        <span className={labelClass}>{label}</span>
                                        <input
                                            className={`${inputClass} h-12 text-[1rem]`}
                                            disabled={!allowTimeOverride || isBusy}
                                            max={advanceLimits[name]}
                                            min="0"
                                            name={name}
                                            step="1"
                                            type="number"
                                            value={advanceForm[name]}
                                            onChange={handleAdvanceChange}
                                        />
                                    </label>
                                ))}
                            </div>

                            <label className="flex min-h-12 items-center gap-3 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-4 text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                <input
                                    checked={advanceForm.autoSync}
                                    className={checkboxClass}
                                    disabled={!allowTimeOverride || isBusy}
                                    name="autoSync"
                                    type="checkbox"
                                    onChange={handleAdvanceChange}
                                />
                                <span>Auto sync statuses after advance</span>
                            </label>
                        </div>

                        <div className="flex justify-end border-t border-[var(--admin-border)] bg-[#fffaf8] px-5 py-4">
                            <button
                                className={primaryButtonClass}
                                disabled={!allowTimeOverride || isBusy}
                                type="submit"
                            >
                                <FaForward aria-hidden="true" />
                                <span>{actionLoading === 'advance' ? 'Advancing...' : 'Advance Time'}</span>
                            </button>
                        </div>
                    </form>
                </section>

                <section className={panelClass}>
                    <div className={panelHeaderClass}>
                        <h2 className={panelTitleClass}>
                            <FaDatabase aria-hidden="true" className="text-[var(--admin-primary)]" />
                            <span>Status Sync</span>
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            <button
                                className={secondaryButtonClass}
                                disabled={isBusy}
                                type="button"
                                onClick={handleSyncStatuses}
                            >
                                <FaSyncAlt aria-hidden="true" />
                                <span>{actionLoading === 'sync' ? 'Syncing...' : 'Sync Statuses Now'}</span>
                            </button>

                            <button
                                className={dangerButtonClass}
                                disabled={!allowTimeOverride || !isOverridden || isBusy}
                                type="button"
                                onClick={handleClearOverride}
                            >
                                <FaEraser aria-hidden="true" />
                                <span>{actionLoading === 'clear' ? 'Clearing...' : 'Clear Override'}</span>
                            </button>
                        </div>
                    </div>

                    {syncResult ? (
                        <div className="grid gap-4 p-5">
                            <div className="rounded-md border border-[#a7dfbf] bg-[#e8f7ee] px-4 py-3 text-[0.86rem] font-bold text-[#16864f]">
                                {readApiField(syncResult, 'message') || 'Time statuses synchronized.'}
                            </div>

                            <div className="grid grid-cols-4 gap-4 max-[1180px]:grid-cols-2 max-[640px]:grid-cols-1">
                                <SyncStat label="Expired Invitations" value={readApiField(syncResult, 'expiredInvitations')} />
                                <SyncStat label="Updated Races" value={readApiField(syncResult, 'updatedRaces')} />
                                <SyncStat label="Updated Tournaments" value={readApiField(syncResult, 'updatedTournaments')} />
                                <TimeItem label="Effective UTC Now" value={readApiField(syncResult, 'effectiveUtcNow')} />
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 text-[0.88rem] font-semibold text-[var(--admin-muted)]">
                            No sync result yet. Run manual sync or enable auto sync on an override/advance action.
                        </div>
                    )}
                </section>
            </section>
        </AdminLayout>
    );
}

export default AdminSystemTime;
